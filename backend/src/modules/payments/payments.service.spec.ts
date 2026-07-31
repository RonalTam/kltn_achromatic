import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { PaymentsService, signVnpayParams } from './payments.service';

describe('PaymentsService', () => {
  const tx = {
    order: { updateMany: jest.fn() },
    payment: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      updateMany: jest.fn(),
    },
    paymentTransaction: { create: jest.fn() },
    orderStatusHistory: { create: jest.fn() },
  };
  const prisma = {
    order: { findUnique: jest.fn() },
    payment: { findUnique: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  };

  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(
      (callback: (client: typeof tx) => unknown) => callback(tx),
    );
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    tx.payment.updateMany.mockResolvedValue({ count: 1 });
    service = new PaymentsService(prisma as unknown as PrismaService);
  });

  it('does not expose another customer payment', async () => {
    prisma.order.findUnique.mockResolvedValue({ userId: 'owner-1' });

    await expect(
      service.getPayment('order-1', 'attacker-1', Role.CUSTOMER),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.payment.findUnique).not.toHaveBeenCalled();
  });

  it('allows an admin to read a payment with safe transaction fields', async () => {
    prisma.order.findUnique.mockResolvedValue({ userId: 'owner-1' });
    prisma.payment.findUnique.mockResolvedValue({ id: 'payment-1' });

    await expect(
      service.getPayment('order-1', 'admin-1', Role.ADMIN),
    ).resolves.toEqual({ id: 'payment-1' });
    expect(prisma.payment.findUnique).toHaveBeenCalledWith({
      where: { orderId: 'order-1' },
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
  });

  it('rejects payment confirmation for a cancelled order', async () => {
    tx.order.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.confirmCOD('order-1', 'admin-1')).rejects.toThrow(
      BadRequestException,
    );
    expect(tx.payment.updateMany).not.toHaveBeenCalled();
  });

  it('confirms payment only after conditionally locking an eligible order', async () => {
    tx.payment.findUnique.mockResolvedValue({
      id: 'payment-1',
      method: PaymentMethod.COD,
      status: PaymentStatus.PENDING,
      amount: 250000,
    });
    tx.payment.findUniqueOrThrow.mockResolvedValue({
      id: 'payment-1',
      method: PaymentMethod.COD,
      status: PaymentStatus.COMPLETED,
      amount: 250000,
    });

    await service.confirmCOD('order-1', 'admin-1');

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'order-1',
        status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
      },
      data: { updatedAt: expect.any(Date) as unknown },
    });
    expect(tx.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'payment-1',
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING],
          },
        },
      }),
    );
    expect(tx.paymentTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: 'payment-1',
        type: 'charge',
        status: PaymentStatus.COMPLETED,
        gatewayRef: 'COD-order-1',
      }) as unknown,
    });
  });

  it('orchestrates a full refund across payment and order status', async () => {
    tx.payment.findUnique.mockResolvedValue({
      id: 'payment-1',
      status: PaymentStatus.COMPLETED,
      amount: 250000,
    });
    tx.payment.findUniqueOrThrow.mockResolvedValue({
      id: 'payment-1',
      status: PaymentStatus.REFUNDED,
      amount: 250000,
    });

    await service.processRefund('order-1', 250000, 'admin-1');

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'order-1',
        status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
      },
      data: { status: OrderStatus.REFUNDED },
    });
    expect(tx.payment.updateMany).toHaveBeenCalledWith({
      where: { id: 'payment-1', status: PaymentStatus.COMPLETED },
      data: { status: PaymentStatus.REFUNDED },
    });
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: 'order-1',
        status: OrderStatus.REFUNDED,
        changedBy: 'admin-1',
      }) as unknown,
    });
  });

  it('rejects a partial amount instead of marking a full payment refunded', async () => {
    tx.payment.findUnique.mockResolvedValue({
      id: 'payment-1',
      status: PaymentStatus.COMPLETED,
      amount: 250000,
    });

    await expect(
      service.processRefund('order-1', 100000, 'admin-1'),
    ).rejects.toThrow('Partial refunds are not supported');
    expect(tx.payment.updateMany).not.toHaveBeenCalled();
    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('creates a signed VNPay sandbox URL and moves the payment to processing', async () => {
    const configValues: Record<string, string> = {
      VNPAY_TMN_CODE: 'DEMO',
      VNPAY_HASH_SECRET: 'phase-seven-secret',
      VNPAY_URL: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      VNPAY_RETURN_URL: 'http://localhost:3001/api/payments/vnpay/return',
    };
    const config = {
      get: jest.fn((key: string) => configValues[key]),
    } as unknown as ConfigService;
    service = new PaymentsService(prisma as unknown as PrismaService, undefined, config);
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-vnpay-1',
      orderNumber: 'ACH-0001',
      userId: 'customer-1',
      payment: {
        id: 'payment-vnpay-1',
        method: PaymentMethod.VNPAY,
        status: PaymentStatus.PENDING,
        amount: 480000,
      },
    });
    prisma.payment.update.mockResolvedValue({ id: 'payment-vnpay-1' });

    const result = await service.initVNPay(
      'order-vnpay-1',
      'customer-1',
      Role.CUSTOMER,
      '127.0.0.1',
    );
    const paymentUrl = new URL(result.paymentUrl);
    const signedParams = Object.fromEntries(
      [...paymentUrl.searchParams.entries()].filter(
        ([key]) => key !== 'vnp_SecureHash',
      ),
    );

    expect(paymentUrl.origin).toBe('https://sandbox.vnpayment.vn');
    expect(paymentUrl.searchParams.get('vnp_TxnRef')).toBe('order-vnpay-1');
    expect(paymentUrl.searchParams.get('vnp_Amount')).toBe('48000000');
    expect(paymentUrl.searchParams.get('vnp_SecureHash')).toBe(
      signVnpayParams(signedParams, 'phase-seven-secret'),
    );
    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'payment-vnpay-1' },
      data: expect.objectContaining({
        status: PaymentStatus.PROCESSING,
        transactionRef: 'order-vnpay-1',
        expiresAt: expect.any(Date) as unknown,
      }) as unknown,
    });
  });

  it('verifies a successful VNPay callback and confirms the pending order', async () => {
    const config = {
      get: jest.fn((key: string) =>
        key === 'VNPAY_HASH_SECRET' ? 'callback-secret' : undefined,
      ),
    } as unknown as ConfigService;
    service = new PaymentsService(prisma as unknown as PrismaService, undefined, config);
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-vnpay-2',
      orderNumber: 'ACH-0002',
      status: OrderStatus.PENDING,
      payment: {
        id: 'payment-vnpay-2',
        method: PaymentMethod.VNPAY,
        status: PaymentStatus.PROCESSING,
        amount: 250000,
      },
    });
    const callback = {
      vnp_Amount: '25000000',
      vnp_ResponseCode: '00',
      vnp_TransactionNo: 'gateway-2026',
      vnp_TransactionStatus: '00',
      vnp_TxnRef: 'order-vnpay-2',
    };
    const result = await service.handleVnpayCallback({
      ...callback,
      vnp_SecureHash: signVnpayParams(callback, 'callback-secret'),
    });

    expect(result).toEqual({
      orderId: 'order-vnpay-2',
      orderNumber: 'ACH-0002',
      success: true,
      paymentStatus: PaymentStatus.COMPLETED,
      idempotent: false,
    });
    expect(tx.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'payment-vnpay-2' }) as unknown,
        data: expect.objectContaining({
          status: PaymentStatus.COMPLETED,
          transactionRef: 'gateway-2026',
        }) as unknown,
      }),
    );
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'order-vnpay-2', status: OrderStatus.PENDING },
      data: { status: OrderStatus.CONFIRMED },
    });
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-vnpay-2',
        status: OrderStatus.CONFIRMED,
        note: 'Payment confirmed by VNPay',
      },
    });
  });

  it('rejects a VNPay callback with an invalid signature', async () => {
    const config = {
      get: jest.fn((key: string) =>
        key === 'VNPAY_HASH_SECRET' ? 'callback-secret' : undefined,
      ),
    } as unknown as ConfigService;
    service = new PaymentsService(prisma as unknown as PrismaService, undefined, config);

    await expect(
      service.handleVnpayCallback({
        vnp_Amount: '25000000',
        vnp_ResponseCode: '00',
        vnp_TxnRef: 'order-vnpay-2',
        vnp_SecureHash: 'invalid',
      }),
    ).rejects.toThrow('VNPay signature is invalid');
    expect(prisma.order.findUnique).not.toHaveBeenCalled();
  });
});
