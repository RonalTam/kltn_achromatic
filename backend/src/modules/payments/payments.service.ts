import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async getPayment(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { transactions: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  /**
   * Confirm COD payment (admin marks as paid on delivery)
   */
  async confirmCOD(orderId: string, adminId: string) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { orderId },
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: 'charge',
          status: PaymentStatus.COMPLETED,
          amount: payment.amount,
          gatewayRef: `COD-${orderId}`,
          gatewayResponse: { confirmedBy: adminId },
        },
      });
      return payment;
    });
  }

  /**
   * Confirm bank transfer payment (admin verifies receipt)
   */
  async confirmBankTransfer(
    orderId: string,
    transactionRef: string,
    adminId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { orderId },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          transactionRef,
        },
      });
      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: 'charge',
          status: PaymentStatus.COMPLETED,
          amount: payment.amount,
          gatewayRef: transactionRef,
          gatewayResponse: { confirmedBy: adminId },
        },
      });
      return payment;
    });
  }

  // ─── STUB: VNPay integration placeholder ───
  initVNPay(
    orderId: string,
    returnUrl: string,
  ): Promise<{ paymentUrl: string }> {
    // TODO: Implement VNPay SDK integration
    throw new Error(
      `VNPay integration not yet implemented for order ${orderId} (${returnUrl})`,
    );
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

  async processRefund(orderId: string, amount?: number) {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUniqueOrThrow({
        where: { orderId },
      });
      const refundAmount = amount ?? Number(payment.amount);
      const updated = await tx.payment.update({
        where: { orderId },
        data: { status: PaymentStatus.REFUNDED },
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
      return updated;
    });
  }
}
