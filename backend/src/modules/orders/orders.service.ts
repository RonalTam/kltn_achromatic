import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrderStatus, PaymentMethod, Prisma } from '@prisma/client';

const ALLOWED_ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  [OrderStatus.PENDING]: [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPING,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PROCESSING]: [
    OrderStatus.SHIPPING,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED, OrderStatus.REFUNDED],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AC-${timestamp}-${random}`;
  }

  async createOrder(
    userId: string,
    dto: {
      addressId: string;
      shippingMethodId?: string;
      paymentMethod: PaymentMethod;
      couponCode?: string;
      notes?: string;
    },
  ) {
    // Get cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: { savedForLater: false },
          include: {
            product: true,
            variant: {
              include: {
                color: true,
                size: true,
                inventory: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate address
    const address = await this.prisma.userAddress.findUnique({
      where: { id: dto.addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    // Validate coupon
    let coupon = null;
    let discount = 0;
    if (dto.couponCode) {
      coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });
      if (!coupon || !coupon.isActive)
        throw new BadRequestException('Invalid coupon');
      if (coupon.expiresAt && coupon.expiresAt < new Date())
        throw new BadRequestException('Coupon expired');
    }

    // Get shipping fee
    let shippingFee = 0;
    let freeShippingThreshold = 500000;
    if (dto.shippingMethodId) {
      const method = await this.prisma.shippingMethod.findUnique({
        where: { id: dto.shippingMethodId },
      });
      shippingFee = method ? Number(method.basePrice) : 0;
      freeShippingThreshold = Number(
        method?.freeThreshold ?? freeShippingThreshold,
      );
    }

    // Calculate subtotal
    let subtotal = 0;
    const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

    for (const item of cart.items) {
      const price = Number(item.variant?.price || item.product.basePrice);
      const total = price * item.quantity;
      subtotal += total;

      const variantName = [item.variant?.color?.name, item.variant?.size?.name]
        .filter(Boolean)
        .join(' / ');

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: variantName || undefined,
        sku: item.variant?.sku || item.product.sku,
        quantity: item.quantity,
        unitPrice: price,
        totalPrice: total,
      });
    }

    if (!dto.shippingMethodId) {
      shippingFee = subtotal >= freeShippingThreshold ? 0 : 30000;
    } else if (subtotal >= freeShippingThreshold) {
      shippingFee = 0;
    }

    // Apply coupon discount
    if (coupon) {
      if (coupon.minOrderAmount && subtotal < Number(coupon.minOrderAmount)) {
        throw new BadRequestException(
          `Minimum order amount is ${Number(coupon.minOrderAmount)}`,
        );
      }
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotal * Number(coupon.value)) / 100;
        if (coupon.maxDiscount)
          discount = Math.min(discount, Number(coupon.maxDiscount));
      } else if (coupon.type === 'FIXED_AMOUNT') {
        discount = Math.min(Number(coupon.value), subtotal);
      } else if (coupon.type === 'FREE_SHIPPING') {
        discount = shippingFee;
        shippingFee = 0;
      }
    }

    const total = subtotal + shippingFee - discount;

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const inventory = await tx.inventory.findFirst({
          where: {
            productId: item.productId,
            variantId: item.variantId ?? null,
          },
          select: { id: true, quantity: true, reserved: true },
        });
        const available =
          (inventory?.quantity ?? 0) - (inventory?.reserved ?? 0);

        if (!inventory || available < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm ${item.variant?.sku || item.product.sku} chỉ còn ${Math.max(available, 0)} sản phẩm trong kho.`,
          );
        }

        // Reserve stock atomically. The condition is evaluated by PostgreSQL
        // at update time, so concurrent checkouts cannot both reserve the
        // same remaining units.
        const reservedRows = await tx.$executeRaw(
          Prisma.sql`
            UPDATE "inventory"
            SET "reserved" = "reserved" + ${item.quantity},
                "updatedAt" = NOW()
            WHERE "id" = ${inventory.id}
              AND "quantity" - "reserved" >= ${item.quantity}
          `,
        );

        if (reservedRows !== 1) {
          const latestInventory = await tx.inventory.findUnique({
            where: { id: inventory.id },
            select: { quantity: true, reserved: true },
          });
          const latestAvailable = Math.max(
            0,
            (latestInventory?.quantity ?? 0) - (latestInventory?.reserved ?? 0),
          );
          throw new BadRequestException(
            `Sản phẩm ${item.variant?.sku || item.product.sku} chỉ còn ${latestAvailable} sản phẩm trong kho.`,
          );
        }
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          addressId: dto.addressId,
          shippingMethodId: dto.shippingMethodId,
          couponId: coupon?.id,
          couponCode: coupon?.code,
          notes: dto.notes,
          subtotal,
          shippingFee,
          discount,
          total,
          status: OrderStatus.PENDING,
          items: { createMany: { data: orderItemsData } },
          statusHistory: {
            create: {
              status: OrderStatus.PENDING,
              note: 'Order placed successfully',
            },
          },
          payment: {
            create: {
              method: dto.paymentMethod,
              amount: total,
              currency: 'VND',
              expiresAt:
                dto.paymentMethod === 'BANK_TRANSFER'
                  ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                  : undefined,
            },
          },
        },
        include: {
          items: true,
          payment: true,
          address: true,
        },
      });

      // Record coupon usage
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
          data: { couponId: coupon.id, userId, orderId: newOrder.id },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id, savedForLater: false },
      });

      return newOrder;
    });

    return order;
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where: { userId } }),
      this.prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            take: 3,
            include: {
              product: {
                select: {
                  name: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
          payment: { select: { method: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                sku: true,
                basePrice: true,
                isActive: true,
                images: { where: { isPrimary: true }, take: 1 },
                inventory: {
                  where: { variantId: null },
                  select: { quantity: true, reserved: true },
                  take: 1,
                },
              },
            },
            variant: {
              include: {
                color: true,
                size: true,
                inventory: {
                  select: { quantity: true, reserved: true },
                },
              },
            },
          },
        },
        address: true,
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
        shippingMethod: true,
        shipping: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            note: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (userId && order.userId !== userId)
      throw new NotFoundException('Order not found');
    return order;
  }

  async findByOrderNumber(orderNumber: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
    });
    if (!order || order.userId !== userId)
      throw new NotFoundException('Order not found');
    return this.findOne(order.id);
  }

  /**
   * Cancel an order on behalf of the customer.
   * Customers can cancel until the order is handed to the carrier.
   */
  async cancelByUser(orderId: string, userId: string, reason?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng.');
    if (order.userId !== userId)
      throw new NotFoundException('Không tìm thấy đơn hàng.');

    // PROCESSING is still before carrier handoff, so it remains cancellable.
    const cancellableStatuses: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
    ];
    if (!cancellableStatuses.includes(order.status)) {
      const statusMap: Record<string, string> = {
        PROCESSING: 'đang chuẩn bị hàng',
        SHIPPING: 'đang giao hàng',
        DELIVERED: 'đã giao',
        COMPLETED: 'đã hoàn tất',
        CANCELLED: 'đã hủy trước đó',
        REFUNDED: 'đã hoàn tiền',
      };
      const statusLabel = statusMap[order.status] ?? order.status;
      throw new BadRequestException(
        `Không thể hủy đơn hàng đang ở trạng thái "${statusLabel}". Chỉ có thể hủy trước khi đơn hàng được bàn giao cho đơn vị vận chuyển.`,
      );
    }

    const normalizedReason = reason?.trim() || null;
    const cancelledAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      // The status predicate makes cancellation idempotent under concurrent
      // requests and prevents releasing inventory reserved by another order.
      const cancellation = await tx.order.updateMany({
        where: {
          id: orderId,
          userId,
          status: { in: cancellableStatuses },
        },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt,
          cancelReason: normalizedReason,
        },
      });

      if (cancellation.count !== 1) {
        throw new BadRequestException(
          'Đơn hàng đã thay đổi trạng thái và không thể hủy. Vui lòng tải lại trang.',
        );
      }

      // Log status change history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          note: normalizedReason
            ? `Khách hàng hủy đơn: ${normalizedReason}`
            : 'Khách hàng tự hủy đơn hàng',
          changedBy: userId,
        },
      });

      // Release reserved inventory
      for (const item of order.items) {
        const releasedInventory = await tx.inventory.updateMany({
          where: {
            productId: item.productId,
            variantId: item.variantId ?? null,
            reserved: { gte: item.quantity },
          },
          data: { reserved: { decrement: item.quantity } },
        });
        if (releasedInventory.count !== 1) {
          throw new BadRequestException(
            'Không thể hoàn trả tồn kho cho đơn hàng. Vui lòng liên hệ quản trị viên.',
          );
        }
      }

      return {
        ...order,
        status: OrderStatus.CANCELLED,
        cancelledAt,
        cancelReason: normalizedReason,
      };
    });
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    changedBy?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Order not found');

      const isIdempotentUpdate = order.status === status;
      const isAllowedTransition =
        isIdempotentUpdate ||
        ALLOWED_ORDER_STATUS_TRANSITIONS[order.status].includes(status);
      if (!isAllowedTransition) {
        throw new BadRequestException(
          `Cannot change order status from ${order.status} to ${status}`,
        );
      }

      let updated;
      try {
        updated = await tx.order.update({
          // Including the previously read status makes the update conditional.
          // A concurrent customer cancellation therefore cannot be overwritten.
          where: { id: orderId, status: order.status },
          data: {
            status,
            ...(status === OrderStatus.DELIVERED && !isIdempotentUpdate
              ? { deliveredAt: new Date() }
              : {}),
            ...(status === OrderStatus.CANCELLED && !isIdempotentUpdate
              ? { cancelledAt: new Date() }
              : {}),
          },
        });
      } catch (error) {
        if (isPrismaErrorCode(error, 'P2025')) {
          throw new BadRequestException(
            'Order status changed concurrently. Please reload and try again.',
          );
        }
        throw error;
      }
      await tx.orderStatusHistory.create({
        data: { orderId, status, note, changedBy },
      });
      // If delivered → update inventory (decrement reserved & quantity)
      if (
        status === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.CANCELLED
      ) {
        for (const item of order.items) {
          const releasedInventory = await tx.inventory.updateMany({
            where: {
              productId: item.productId,
              variantId: item.variantId ?? null,
              reserved: { gte: item.quantity },
            },
            data: { reserved: { decrement: item.quantity } },
          });
          if (releasedInventory.count !== 1) {
            throw new BadRequestException(
              'Unable to release the reserved inventory for this order',
            );
          }
        }
      }

      if (
        status === OrderStatus.DELIVERED &&
        order.status !== OrderStatus.DELIVERED
      ) {
        for (const item of order.items) {
          const consumedInventory = await tx.inventory.updateMany({
            where: {
              productId: item.productId,
              variantId: item.variantId ?? null,
              quantity: { gte: item.quantity },
              reserved: { gte: item.quantity },
            },
            data: {
              quantity: { decrement: item.quantity },
              reserved: { decrement: item.quantity },
            },
          });
          if (consumedInventory.count !== 1) {
            throw new BadRequestException(
              'Unable to consume the reserved inventory for this order',
            );
          }
        }
        // Update sold count
        const grouped = order.items.reduce(
          (acc, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            return acc;
          },
          {} as Record<string, number>,
        );
        for (const [productId, qty] of Object.entries(grouped)) {
          await tx.product.update({
            where: { id: productId },
            data: { soldCount: { increment: qty } },
          });
        }
      }
      return updated;
    });
  }

  // Admin list
  async findAll(page = 1, limit = 20, status?: OrderStatus) {
    const where = status ? { status } : {};
    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { quantity: true } },
          payment: { select: { method: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
