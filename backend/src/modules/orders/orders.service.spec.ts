import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OrdersService } from './orders.service';

describe('OrdersService inventory reservation', () => {
  const tx = {
    inventory: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    orderStatusHistory: {
      create: jest.fn(),
    },
    coupon: {
      update: jest.fn(),
    },
    couponUsage: {
      create: jest.fn(),
    },
    cartItem: {
      deleteMany: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
    $executeRaw: jest.fn(),
  };

  const prisma = {
    cart: {
      findUnique: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
    },
    userAddress: {
      findUnique: jest.fn(),
    },
    coupon: {
      findUnique: jest.fn(),
    },
    shippingMethod: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: OrdersService;

  const makeCart = (
    quantity: number,
    variantId: string | null = 'variant-1',
  ) => ({
    id: 'cart-1',
    items: [
      {
        id: 'item-1',
        productId: 'product-1',
        variantId,
        quantity,
        product: {
          id: 'product-1',
          name: 'Áo thử nghiệm',
          sku: 'PRODUCT-SKU',
          basePrice: 100000,
        },
        variant: variantId
          ? {
              id: variantId,
              sku: 'VARIANT-SKU',
              price: null,
              color: null,
              size: null,
              inventory: [],
            }
          : null,
      },
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.userAddress.findUnique.mockResolvedValue({ id: 'address-1' });
    prisma.$transaction.mockImplementation(
      (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    );
    tx.order.updateMany.mockResolvedValue({ count: 1 });
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  it('rejects an empty cart before validating checkout details', async () => {
    prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', items: [] });

    await expect(
      service.createOrder('user-1', {
        addressId: 'address-1',
        paymentMethod: PaymentMethod.COD,
      }),
    ).rejects.toThrow('Cart is empty');

    expect(prisma.userAddress.findUnique).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a shipping address that is not owned by the user', async () => {
    prisma.cart.findUnique.mockResolvedValue(makeCart(1));
    prisma.userAddress.findUnique.mockResolvedValue(null);

    await expect(
      service.createOrder('user-1', {
        addressId: 'foreign-address',
        paymentMethod: PaymentMethod.COD,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.userAddress.findUnique).toHaveBeenCalledWith({
      where: { id: 'foreign-address', userId: 'user-1' },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('creates an order snapshot, reserves inventory, and clears active cart items', async () => {
    const cart = makeCart(2);
    prisma.cart.findUnique.mockResolvedValue(cart);
    tx.inventory.findFirst.mockResolvedValue({
      id: 'inventory-1',
      quantity: 10,
      reserved: 1,
    });
    tx.$executeRaw.mockResolvedValue(1);
    tx.order.create.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.PENDING,
      total: 230000,
    });
    tx.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    await expect(
      service.createOrder('user-1', {
        addressId: 'address-1',
        paymentMethod: PaymentMethod.COD,
        notes: 'Call before delivery',
      }),
    ).resolves.toEqual({
      id: 'order-1',
      status: OrderStatus.PENDING,
      total: 230000,
    });

    expect(tx.inventory.findFirst).toHaveBeenCalledWith({
      where: { productId: 'product-1', variantId: 'variant-1' },
      select: { id: true, quantity: true, reserved: true },
    });
    const orderNumberMatcher: unknown = expect.stringMatching(
      /^AC-[A-Z0-9]+-[A-Z0-9]{4}$/,
    );
    const orderDataMatcher: unknown = expect.objectContaining({
      orderNumber: orderNumberMatcher,
      userId: 'user-1',
      addressId: 'address-1',
      notes: 'Call before delivery',
      subtotal: 200000,
      shippingFee: 30000,
      discount: 0,
      total: 230000,
      status: OrderStatus.PENDING,
      items: {
        createMany: {
          data: [
            {
              productId: 'product-1',
              variantId: 'variant-1',
              productName: cart.items[0].product.name,
              variantName: undefined,
              sku: 'VARIANT-SKU',
              quantity: 2,
              unitPrice: 100000,
              totalPrice: 200000,
            },
          ],
        },
      },
      statusHistory: {
        create: {
          status: OrderStatus.PENDING,
          note: 'Order placed successfully',
        },
      },
      payment: {
        create: {
          method: PaymentMethod.COD,
          amount: 230000,
          currency: 'VND',
          expiresAt: undefined,
        },
      },
    });
    expect(tx.order.create).toHaveBeenCalledWith({
      data: orderDataMatcher,
      include: { items: true, payment: true, address: true },
    });
    expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart-1', savedForLater: false },
    });
  });

  it('applies a capped percentage coupon and records its usage', async () => {
    prisma.cart.findUnique.mockResolvedValue(makeCart(2));
    prisma.coupon.findUnique.mockResolvedValue({
      id: 'coupon-1',
      code: 'SAVE10',
      isActive: true,
      expiresAt: null,
      minOrderAmount: 100000,
      type: 'PERCENTAGE',
      value: 10,
      maxDiscount: 15000,
    });
    tx.inventory.findFirst.mockResolvedValue({
      id: 'inventory-1',
      quantity: 10,
      reserved: 0,
    });
    tx.$executeRaw.mockResolvedValue(1);
    tx.order.create.mockResolvedValue({ id: 'order-1' });
    tx.coupon.update.mockResolvedValue({ id: 'coupon-1' });
    tx.couponUsage.create.mockResolvedValue({ id: 'usage-1' });
    tx.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    await service.createOrder('user-1', {
      addressId: 'address-1',
      paymentMethod: PaymentMethod.COD,
      couponCode: 'SAVE10',
    });

    const couponOrderDataMatcher: unknown = expect.objectContaining({
      couponId: 'coupon-1',
      couponCode: 'SAVE10',
      subtotal: 200000,
      shippingFee: 30000,
      discount: 15000,
      total: 215000,
    });
    const couponOrderMatcher: unknown = expect.objectContaining({
      data: couponOrderDataMatcher,
    });
    expect(tx.order.create).toHaveBeenCalledWith(couponOrderMatcher);
    expect(tx.coupon.update).toHaveBeenCalledWith({
      where: { id: 'coupon-1' },
      data: { usedCount: { increment: 1 } },
    });
    expect(tx.couponUsage.create).toHaveBeenCalledWith({
      data: {
        couponId: 'coupon-1',
        userId: 'user-1',
        orderId: 'order-1',
      },
    });
  });

  it('does not create an order when an atomic reservation loses a stock race', async () => {
    prisma.cart.findUnique.mockResolvedValue(makeCart(4));
    tx.inventory.findFirst.mockResolvedValue({
      id: 'inventory-1',
      quantity: 5,
      reserved: 0,
    });
    tx.$executeRaw.mockResolvedValue(0);
    tx.inventory.findUnique.mockResolvedValue({ quantity: 5, reserved: 4 });

    await expect(
      service.createOrder('user-1', {
        addressId: 'address-1',
        paymentMethod: PaymentMethod.COD,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(tx.order.create).not.toHaveBeenCalled();
    expect(tx.cartItem.deleteMany).not.toHaveBeenCalled();
  });

  it('reserves exactly the remaining stock with a conditional database update', async () => {
    prisma.cart.findUnique.mockResolvedValue(makeCart(5));
    tx.inventory.findFirst.mockResolvedValue({
      id: 'inventory-1',
      quantity: 8,
      reserved: 3,
    });
    tx.$executeRaw.mockResolvedValue(1);
    tx.order.create.mockResolvedValue({ id: 'order-1' });
    tx.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    await service.createOrder('user-1', {
      addressId: 'address-1',
      paymentMethod: PaymentMethod.COD,
    });

    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(tx.order.create).toHaveBeenCalledTimes(1);
    expect(tx.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart-1', savedForLater: false },
    });
  });

  it('checks product-level stock instead of skipping items without a variant', async () => {
    prisma.cart.findUnique.mockResolvedValue(makeCart(3, null));
    tx.inventory.findFirst.mockResolvedValue({
      id: 'inventory-1',
      quantity: 2,
      reserved: 0,
    });

    await expect(
      service.createOrder('user-1', {
        addressId: 'address-1',
        paymentMethod: PaymentMethod.COD,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(tx.inventory.findFirst).toHaveBeenCalledWith({
      where: { productId: 'product-1', variantId: null },
      select: { id: true, quantity: true, reserved: true },
    });
    expect(tx.$executeRaw).not.toHaveBeenCalled();
    expect(tx.order.create).not.toHaveBeenCalled();
  });

  it('updates a delivered order, consumes reserved stock, and increments sold counts', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.PROCESSING,
      items: [
        {
          productId: 'product-1',
          variantId: 'variant-1',
          quantity: 2,
        },
        {
          productId: 'product-1',
          variantId: 'variant-2',
          quantity: 1,
        },
      ],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
    });
    tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });
    tx.inventory.updateMany.mockResolvedValue({ count: 1 });
    tx.product.update.mockResolvedValue({ id: 'product-1' });

    const result = await service.updateStatus(
      'order-1',
      OrderStatus.DELIVERED,
      'Delivered to customer',
      'admin-1',
    );

    expect(result).toEqual({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
    });
    const deliveredAtMatcher: unknown = expect.any(Date);
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1', status: OrderStatus.PROCESSING },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: deliveredAtMatcher,
      },
    });
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-1',
        status: OrderStatus.DELIVERED,
        note: 'Delivered to customer',
        changedBy: 'admin-1',
      },
    });
    expect(tx.inventory.updateMany).toHaveBeenCalledTimes(2);
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { soldCount: { increment: 3 } },
    });
  });

  it('delivers an item without a variant using product-level inventory', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.SHIPPING,
      items: [
        {
          productId: 'product-1',
          variantId: null,
          quantity: 3,
        },
      ],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
    });
    tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });
    tx.inventory.updateMany.mockResolvedValue({ count: 1 });
    tx.product.update.mockResolvedValue({ id: 'product-1' });

    await service.updateStatus('order-1', OrderStatus.DELIVERED);

    expect(tx.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'product-1',
        variantId: null,
        quantity: { gte: 3 },
        reserved: { gte: 3 },
      },
      data: {
        quantity: { decrement: 3 },
        reserved: { decrement: 3 },
      },
    });
    expect(tx.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { soldCount: { increment: 3 } },
    });
  });

  it('does not consume stock again when an order is already delivered', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
      items: [
        {
          productId: 'product-1',
          variantId: null,
          quantity: 3,
        },
      ],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
    });
    tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });

    await service.updateStatus('order-1', OrderStatus.DELIVERED);

    expect(tx.inventory.updateMany).not.toHaveBeenCalled();
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('updates a normal status and writes its audit history', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.PENDING,
      items: [],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CONFIRMED,
    });
    tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });

    await expect(
      service.updateStatus(
        'order-1',
        OrderStatus.CONFIRMED,
        'Payment verified',
        'admin-1',
      ),
    ).resolves.toEqual({ id: 'order-1', status: OrderStatus.CONFIRMED });

    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1', status: OrderStatus.PENDING },
      data: { status: OrderStatus.CONFIRMED },
    });
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-1',
        status: OrderStatus.CONFIRMED,
        note: 'Payment verified',
        changedBy: 'admin-1',
      },
    });
    expect(tx.inventory.updateMany).not.toHaveBeenCalled();
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('releases reserved inventory when an order is cancelled', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CONFIRMED,
      items: [
        {
          productId: 'product-1',
          variantId: 'variant-1',
          quantity: 2,
        },
      ],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CANCELLED,
    });
    tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });
    tx.inventory.updateMany.mockResolvedValue({ count: 1 });

    await service.updateStatus('order-1', OrderStatus.CANCELLED);

    const cancelledAtMatcher: unknown = expect.any(Date);
    expect(tx.order.update).toHaveBeenCalledWith({
      where: { id: 'order-1', status: OrderStatus.CONFIRMED },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: cancelledAtMatcher,
      },
    });
    expect(tx.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'product-1',
        variantId: 'variant-1',
        reserved: { gte: 2 },
      },
      data: { reserved: { decrement: 2 } },
    });
    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('releases product-level inventory when an order without a variant is cancelled', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CONFIRMED,
      items: [
        {
          productId: 'product-1',
          variantId: null,
          quantity: 2,
        },
      ],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CANCELLED,
    });
    tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });
    tx.inventory.updateMany.mockResolvedValue({ count: 1 });

    await service.updateStatus('order-1', OrderStatus.CANCELLED);

    expect(tx.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'product-1',
        variantId: null,
        reserved: { gte: 2 },
      },
      data: { reserved: { decrement: 2 } },
    });
  });

  it('releases product-level inventory when a customer cancels an order', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.PENDING,
      items: [
        {
          productId: 'product-1',
          variantId: null,
          quantity: 2,
        },
      ],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CANCELLED,
    });
    tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });
    tx.inventory.updateMany.mockResolvedValue({ count: 1 });

    await service.cancelByUser('order-1', 'user-1', 'Changed my mind');

    expect(prisma.order.findUnique).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      include: { items: true },
    });
    expect(tx.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'product-1',
        variantId: null,
        reserved: { gte: 2 },
      },
      data: { reserved: { decrement: 2 } },
    });
    expect(tx.orderStatusHistory.create).toHaveBeenCalledWith({
      data: {
        orderId: 'order-1',
        status: OrderStatus.CANCELLED,
        note: 'Khách hàng hủy đơn: Changed my mind',
        changedBy: 'user-1',
      },
    });
    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'order-1',
        userId: 'user-1',
        status: {
          in: [
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING,
          ],
        },
      },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: expect.any(Date) as unknown,
        cancelReason: 'Changed my mind',
      },
    });
  });

  it('allows a customer to cancel while the order is still processing', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.PROCESSING,
      items: [],
    });

    await expect(
      service.cancelByUser('order-1', 'user-1', '  Thay đổi nhu cầu  '),
    ).resolves.toMatchObject({
      id: 'order-1',
      status: OrderStatus.CANCELLED,
      cancelReason: 'Thay đổi nhu cầu',
    });

    expect(tx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cancelReason: 'Thay đổi nhu cầu',
        }) as unknown,
      }),
    );
  });

  it('rejects customer cancellation after carrier handoff', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.SHIPPING,
      items: [],
    });

    await expect(service.cancelByUser('order-1', 'user-1')).rejects.toThrow(
      BadRequestException,
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(tx.order.updateMany).not.toHaveBeenCalled();
    expect(tx.inventory.updateMany).not.toHaveBeenCalled();
  });

  it('does not release inventory when a concurrent request wins cancellation', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.CONFIRMED,
      items: [{ productId: 'product-1', variantId: 'variant-1', quantity: 1 }],
    });
    tx.order.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.cancelByUser('order-1', 'user-1')).rejects.toThrow(
      BadRequestException,
    );

    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
    expect(tx.inventory.updateMany).not.toHaveBeenCalled();
  });

  it('rejects a status update for a missing order', async () => {
    tx.order.findUnique.mockResolvedValue(null);

    await expect(
      service.updateStatus('missing-order', OrderStatus.CONFIRMED),
    ).rejects.toThrow(NotFoundException);

    expect(tx.order.update).not.toHaveBeenCalled();
    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('returns customer order details without payment or audit internals', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
      status: OrderStatus.CONFIRMED,
    });

    await service.findOne('order-1', 'user-1');

    expect(prisma.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        include: expect.objectContaining({
          payment: {
            select: {
              id: true,
              method: true,
              status: true,
              amount: true,
              currency: true,
              paidAt: true,
              expiresAt: true,
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              status: true,
              note: true,
              createdAt: true,
            },
          },
        }) as unknown,
      }),
    );
  });

  it('rejects reviving a cancelled order', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CANCELLED,
      items: [],
    });

    await expect(
      service.updateStatus('order-1', OrderStatus.SHIPPING),
    ).rejects.toThrow(BadRequestException);

    expect(tx.order.update).not.toHaveBeenCalled();
    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('rejects an admin update when the order status changed concurrently', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.CONFIRMED,
      items: [],
    });
    tx.order.update.mockRejectedValue({ code: 'P2025' });

    await expect(
      service.updateStatus('order-1', OrderStatus.SHIPPING),
    ).rejects.toThrow('Order status changed concurrently');

    expect(tx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1', status: OrderStatus.CONFIRMED },
      }),
    );
    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });

  it('rolls back delivery before soldCount when reserved inventory is missing', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.SHIPPING,
      items: [{ productId: 'product-1', variantId: 'variant-1', quantity: 1 }],
    });
    tx.order.update.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
    });
    tx.orderStatusHistory.create.mockResolvedValue({ id: 'history-1' });
    tx.inventory.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.updateStatus('order-1', OrderStatus.DELIVERED),
    ).rejects.toThrow('Unable to consume the reserved inventory');

    expect(tx.product.update).not.toHaveBeenCalled();
  });

  it('rejects cancelling an order that was already delivered', async () => {
    tx.order.findUnique.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.DELIVERED,
      items: [],
    });

    await expect(
      service.updateStatus('order-1', OrderStatus.CANCELLED),
    ).rejects.toThrow(BadRequestException);

    expect(tx.order.update).not.toHaveBeenCalled();
    expect(tx.orderStatusHistory.create).not.toHaveBeenCalled();
  });
});
