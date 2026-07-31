import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from '@prisma/client';

type VnpayQuery = Record<string, string | string[] | undefined>;

export type VnpayCallbackResult = {
  orderId: string;
  orderNumber: string;
  success: boolean;
  paymentStatus: PaymentStatus;
  idempotent: boolean;
};

function canonicalizeVnpayParams(params: Record<string, string>): string {
  return Object.keys(params)
    .filter((key) => key.startsWith('vnp_'))
    .sort()
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key]).replace(/%20/g, '+')}`,
    )
    .join('&');
}

export function signVnpayParams(
  params: Record<string, string>,
  secret: string,
): string {
  return crypto
    .createHmac('sha512', secret)
    .update(canonicalizeVnpayParams(params), 'utf8')
    .digest('hex');
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private readonly ordersService?: OrdersService,
    @Optional() private readonly config?: ConfigService,
  ) {}

  async getPayment(orderId: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });
    const hasElevatedAccess = [Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER].some(
      (allowedRole) => allowedRole === role,
    );
    if (!order || (!hasElevatedAccess && order.userId !== userId)) {
      throw new NotFoundException('Payment not found');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            status: true,
            amount: true,
            gatewayRef: true,
            createdAt: true,
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  /**
   * Confirm COD payment (admin marks as paid on delivery)
   */
  async confirmCOD(orderId: string, adminId: string) {
    return this.confirmPayment(orderId, PaymentMethod.COD, adminId);
  }

  /**
   * Confirm bank transfer payment (admin verifies receipt)
   */
  async confirmBankTransfer(
    orderId: string,
    transactionRef: string,
    adminId: string,
  ) {
    if (
      typeof transactionRef !== 'string' ||
      transactionRef.trim().length === 0
    ) {
      throw new BadRequestException('Bank transaction reference is required');
    }
    return this.confirmPayment(
      orderId,
      PaymentMethod.BANK_TRANSFER,
      adminId,
      transactionRef.trim(),
    );
  }

  private async confirmPayment(
    orderId: string,
    expectedMethod: PaymentMethod,
    adminId: string,
    transactionRef?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const eligibleOrderStatuses =
        expectedMethod === PaymentMethod.COD
          ? [OrderStatus.DELIVERED, OrderStatus.COMPLETED]
          : [
              OrderStatus.PENDING,
              OrderStatus.CONFIRMED,
              OrderStatus.PROCESSING,
              OrderStatus.SHIPPING,
              OrderStatus.DELIVERED,
              OrderStatus.COMPLETED,
            ];
      const orderLock = await tx.order.updateMany({
        where: {
          id: orderId,
          status: { in: eligibleOrderStatuses },
        },
        data: { updatedAt: new Date() },
      });
      if (orderLock.count !== 1) {
        throw new BadRequestException(
          `Payment cannot be confirmed for this order status using ${expectedMethod}`,
        );
      }

      const payment = await tx.payment.findUnique({ where: { orderId } });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.method !== expectedMethod) {
        throw new BadRequestException(
          `Payment method is ${payment.method}, not ${expectedMethod}`,
        );
      }
      const confirmableStatuses: PaymentStatus[] = [
        PaymentStatus.PENDING,
        PaymentStatus.PROCESSING,
      ];
      if (!confirmableStatuses.includes(payment.status)) {
        throw new BadRequestException(
          `Payment in status ${payment.status} cannot be confirmed`,
        );
      }

      const paidAt = new Date();
      const write = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: { in: confirmableStatuses },
        },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt,
          ...(transactionRef ? { transactionRef } : {}),
        },
      });
      if (write.count !== 1) {
        throw new BadRequestException(
          'Payment changed concurrently. Please reload and try again.',
        );
      }
      const updated = await tx.payment.findUniqueOrThrow({
        where: { id: payment.id },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: updated.id,
          type: 'charge',
          status: PaymentStatus.COMPLETED,
          amount: updated.amount,
          gatewayRef: transactionRef || `COD-${orderId}`,
          gatewayResponse: { confirmedBy: adminId },
        },
      });
      return updated;
    });
  }

  // VNPay 2.1 sandbox redirect and signed callback flow.
  async initVNPay(
    orderId: string,
    userId: string,
    role: string,
    ipAddress: string,
  ): Promise<{ paymentUrl: string; expiresAt: string }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        payment: {
          select: {
            id: true,
            method: true,
            status: true,
            amount: true,
          },
        },
      },
    });
    const hasElevatedAccess = [Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER].some(
      (allowedRole) => allowedRole === role,
    );
    if (!order || (!hasElevatedAccess && order.userId !== userId)) {
      throw new NotFoundException('Order not found');
    }
    if (!order.payment || order.payment.method !== PaymentMethod.VNPAY) {
      throw new BadRequestException('Order is not configured for VNPay');
    }
    const initializableStatuses: PaymentStatus[] = [
      PaymentStatus.PENDING,
      PaymentStatus.PROCESSING,
      PaymentStatus.FAILED,
    ];
    if (!initializableStatuses.includes(order.payment.status)) {
      throw new BadRequestException(
        `Payment in status ${order.payment.status} cannot be initialized`,
      );
    }

    const terminalCode = this.getRequiredConfig('VNPAY_TMN_CODE');
    const hashSecret = this.getRequiredConfig('VNPAY_HASH_SECRET');
    const gatewayUrl = this.getConfig(
      'VNPAY_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
    const params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: terminalCode,
      vnp_Amount: String(Math.round(Number(order.payment.amount) * 100)),
      vnp_CreateDate: this.formatVnpayDate(now),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: this.normalizeIpAddress(ipAddress),
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: this.getVnpayReturnUrl(),
      vnp_TxnRef: order.id,
      vnp_ExpireDate: this.formatVnpayDate(expiresAt),
    };
    const secureHash = signVnpayParams(params, hashSecret);
    const paymentUrl = `${gatewayUrl}?${canonicalizeVnpayParams(params)}&vnp_SecureHash=${secureHash}`;

    await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status: PaymentStatus.PROCESSING,
        transactionRef: order.id,
        expiresAt,
        metadata: {
          gateway: 'VNPAY',
          initiatedAt: now.toISOString(),
        },
      },
    });

    return { paymentUrl, expiresAt: expiresAt.toISOString() };
  }

  async handleVnpayCallback(query: VnpayQuery): Promise<VnpayCallbackResult> {
    const params = this.normalizeVnpayQuery(query);
    const receivedHash = params.vnp_SecureHash?.toLowerCase();
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    if (!receivedHash) {
      throw new BadRequestException('VNPay signature is missing');
    }
    const expectedHash = signVnpayParams(
      params,
      this.getRequiredConfig('VNPAY_HASH_SECRET'),
    );
    if (!this.safeHashEquals(receivedHash, expectedHash)) {
      throw new BadRequestException('VNPay signature is invalid');
    }

    const orderId = params.vnp_TxnRef;
    const amount = Number(params.vnp_Amount) / 100;
    if (!orderId || !Number.isFinite(amount)) {
      throw new BadRequestException('VNPay callback is incomplete');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        payment: true,
      },
    });
    if (!order || !order.payment) {
      throw new NotFoundException('Order payment not found');
    }
    if (order.payment.method !== PaymentMethod.VNPAY) {
      throw new BadRequestException('Payment method does not match VNPay');
    }
    if (Math.abs(Number(order.payment.amount) - amount) >= 0.01) {
      throw new BadRequestException('VNPay payment amount does not match');
    }
    const payment = order.payment;

    const success =
      params.vnp_ResponseCode === '00' &&
      (!params.vnp_TransactionStatus || params.vnp_TransactionStatus === '00');
    const gatewayRef = params.vnp_TransactionNo || order.id;

    return this.prisma.$transaction(async (tx) => {
      if (success) {
        if (payment.status === PaymentStatus.COMPLETED) {
          return {
            orderId: order.id,
            orderNumber: order.orderNumber,
            success: true,
            paymentStatus: PaymentStatus.COMPLETED,
            idempotent: true,
          };
        }

        const paymentWrite = await tx.payment.updateMany({
          where: {
            id: payment.id,
            status: {
              in: [
                PaymentStatus.PENDING,
                PaymentStatus.PROCESSING,
                PaymentStatus.FAILED,
              ],
            },
          },
          data: {
            status: PaymentStatus.COMPLETED,
            paidAt: new Date(),
            transactionRef: gatewayRef,
            metadata: {
              gateway: 'VNPAY',
              response: params,
            },
          },
        });

        if (paymentWrite.count === 1) {
          await tx.paymentTransaction.create({
            data: {
              paymentId: payment.id,
              type: 'charge',
              status: PaymentStatus.COMPLETED,
              amount,
              gatewayRef,
              gatewayResponse: params,
            },
          });
          const orderWrite = await tx.order.updateMany({
            where: { id: order.id, status: OrderStatus.PENDING },
            data: { status: OrderStatus.CONFIRMED },
          });
          if (orderWrite.count === 1) {
            await tx.orderStatusHistory.create({
              data: {
                orderId: order.id,
                status: OrderStatus.CONFIRMED,
                note: 'Payment confirmed by VNPay',
              },
            });
          }
        }

        return {
          orderId: order.id,
          orderNumber: order.orderNumber,
          success: true,
          paymentStatus: PaymentStatus.COMPLETED,
          idempotent: paymentWrite.count === 0,
        };
      }

      const paymentWrite = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
          },
        },
        data: {
          status: PaymentStatus.FAILED,
          transactionRef: gatewayRef,
          metadata: {
            gateway: 'VNPAY',
            response: params,
          },
        },
      });
      if (paymentWrite.count === 1) {
        await tx.paymentTransaction.create({
          data: {
            paymentId: payment.id,
            type: 'charge',
            status: PaymentStatus.FAILED,
            amount,
            gatewayRef,
            gatewayResponse: params,
          },
        });
      }

      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        success: false,
        paymentStatus: PaymentStatus.FAILED,
        idempotent: paymentWrite.count === 0,
      };
    });
  }

  /**
   * Send order confirmation email after a successful VNPay payment.
   * Separated from handleVnpayCallback to keep the DB transaction lean.
   */
  async sendConfirmationEmailIfNeeded(result: VnpayCallbackResult): Promise<void> {
    if (result.success && !result.idempotent && this.ordersService) {
      await this.ordersService.sendOrderConfirmationAfterPayment(result.orderId).catch(() => undefined);
    }
  }

  getFrontendPaymentResultUrl(result: VnpayCallbackResult): string {
    const frontendUrl = this.getConfig('FRONTEND_URL', 'http://localhost:3000');
    const url = new URL('/checkout/payment-result', frontendUrl);
    url.searchParams.set('orderId', result.orderId);
    url.searchParams.set('orderNumber', result.orderNumber);
    url.searchParams.set('status', result.success ? 'success' : 'failed');
    return url.toString();
  }

  getFrontendPaymentFailureUrl(): string {
    const frontendUrl = this.getConfig('FRONTEND_URL', 'http://localhost:3000');
    const url = new URL('/checkout/payment-result', frontendUrl);
    url.searchParams.set('status', 'invalid');
    return url.toString();
  }

  // ─── STUB: MoMo integration placeholder ───
  initMoMo(
    orderId: string,
    returnUrl: string,
  ): Promise<{ paymentUrl: string }> {
    // TODO: Implement MoMo SDK integration
    throw new Error(
      `MoMo integration not yet implemented for order ${orderId} (${returnUrl})`,
    );
  }

  // ─── STUB: Stripe integration placeholder ───
  initStripe(
    orderId: string,
    returnUrl: string,
  ): Promise<{ clientSecret: string }> {
    // TODO: Implement Stripe SDK integration
    throw new Error(
      `Stripe integration not yet implemented for order ${orderId} (${returnUrl})`,
    );
  }

  async processRefund(orderId: string, amount?: number, adminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const orderWrite = await tx.order.updateMany({
        where: {
          id: orderId,
          status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
        },
        data: { status: OrderStatus.REFUNDED },
      });
      if (orderWrite.count !== 1) {
        throw new BadRequestException(
          'Only a delivered or completed order can be refunded',
        );
      }

      const payment = await tx.payment.findUnique({ where: { orderId } });
      if (!payment) throw new NotFoundException('Payment not found');
      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException(
          'Only a completed payment can be refunded',
        );
      }

      const fullAmount = Number(payment.amount);
      const refundAmount = amount ?? fullAmount;
      if (
        !Number.isFinite(refundAmount) ||
        refundAmount <= 0 ||
        Math.abs(refundAmount - fullAmount) >= 0.01
      ) {
        throw new BadRequestException(
          'Partial refunds are not supported; refund amount must equal the full payment amount',
        );
      }

      const paymentWrite = await tx.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.COMPLETED },
        data: { status: PaymentStatus.REFUNDED },
      });
      if (paymentWrite.count !== 1) {
        throw new BadRequestException(
          'Payment changed concurrently. Please reload and try again.',
        );
      }
      const updated = await tx.payment.findUniqueOrThrow({
        where: { id: payment.id },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: 'refund',
          status: PaymentStatus.REFUNDED,
          amount: refundAmount,
          gatewayRef: `REFUND-${orderId}`,
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.REFUNDED,
          note: 'Full payment refund completed; inventory is not restocked automatically',
          changedBy: adminId,
        },
      });
      return updated;
    });
  }

  private getConfig(key: string, fallback: string): string {
    return this.config?.get<string>(key) || process.env[key] || fallback;
  }

  private getRequiredConfig(key: string): string {
    const value = this.config?.get<string>(key) || process.env[key];
    if (!value) {
      throw new ServiceUnavailableException(`${key} is required to use VNPay`);
    }
    return value;
  }

  private getVnpayReturnUrl(): string {
    const configured = this.config?.get<string>('VNPAY_RETURN_URL');
    if (configured) return configured;
    const publicUrl = this.getConfig(
      'API_PUBLIC_URL',
      `http://localhost:${this.config?.get<number>('PORT', 3001) ?? 3001}`,
    ).replace(/\/$/, '');
    const prefix = this.getConfig('API_PREFIX', 'api').replace(/^\/|\/$/g, '');
    return `${publicUrl}/${prefix}/payments/vnpay/return`;
  }

  private formatVnpayDate(date: Date): string {
    const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return vietnamTime.toISOString().replace(/\D/g, '').slice(0, 14);
  }

  private normalizeIpAddress(value: string): string {
    const firstAddress = value.split(',')[0]?.trim() || '127.0.0.1';
    return firstAddress === '::1' ? '127.0.0.1' : firstAddress;
  }

  private normalizeVnpayQuery(query: VnpayQuery): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(query)) {
      if (!key.startsWith('vnp_') || value === undefined) continue;
      const firstValue = Array.isArray(value) ? value[0] : value;
      if (firstValue !== undefined) normalized[key] = firstValue;
    }
    return normalized;
  }

  private safeHashEquals(received: string, expected: string): boolean {
    const receivedBuffer = Buffer.from(received, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    return (
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    );
  }
}
