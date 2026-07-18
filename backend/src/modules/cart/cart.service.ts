import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const CART_INCLUDE = {
  items: {
    where: { savedForLater: false },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          images: {
            where: { isPrimary: true },
            select: { url: true, altText: true },
            take: 1,
          },
        },
      },
      variant: {
        include: {
          color: { select: { name: true, hexCode: true } },
          size: { select: { name: true } },
          inventory: { select: { quantity: true, reserved: true } },
        },
      },
    },
    orderBy: { addedAt: 'desc' as const },
  },
};

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getAvailableStock(
    productId: string,
    variantId?: string | null,
  ): Promise<number> {
    if (variantId) {
      const variant = await this.prisma.productVariant.findFirst({
        where: { id: variantId, productId, isActive: true },
        select: {
          inventory: {
            select: { quantity: true, reserved: true },
            take: 1,
          },
        },
      });

      if (!variant) throw new NotFoundException('Product variant not found');

      const inventory = variant.inventory[0];
      return Math.max(
        0,
        (inventory?.quantity ?? 0) - (inventory?.reserved ?? 0),
      );
    }

    const activeVariant = await this.prisma.productVariant.findFirst({
      where: { productId, isActive: true },
      select: { id: true },
    });
    if (activeVariant) {
      throw new BadRequestException('Please select a product variant');
    }

    const inventory = await this.prisma.inventory.findFirst({
      where: { productId, variantId: null },
      select: { quantity: true, reserved: true },
    });

    return Math.max(0, (inventory?.quantity ?? 0) - (inventory?.reserved ?? 0));
  }

  private assertStock(requestedQuantity: number, available: number) {
    if (requestedQuantity > available) {
      throw new BadRequestException(
        `Số lượng yêu cầu vượt quá tồn kho. Chỉ còn ${available} sản phẩm.`,
      );
    }
  }

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: CART_INCLUDE,
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: CART_INCLUDE,
      });
    }
    return cart;
  }

  async addItem(
    userId: string,
    data: { productId: string; variantId?: string; quantity: number },
  ) {
    if (!Number.isInteger(data.quantity) || data.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const cart = await this.ensureCart(userId);

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: data.productId },
    });
    if (!product || !product.isActive)
      throw new NotFoundException('Product not found');

    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId ?? null,
      },
    });

    const available = await this.getAvailableStock(
      data.productId,
      data.variantId,
    );
    const requestedQuantity = (existing?.quantity ?? 0) + data.quantity;
    this.assertStock(requestedQuantity, available);

    // Upsert cart item
    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + data.quantity,
          savedForLater: false,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId,
          quantity: data.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    if (!Number.isInteger(quantity)) {
      throw new BadRequestException('Quantity must be a whole number');
    }
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }
    if (quantity === 0) return this.removeItem(userId, itemId);

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      select: { id: true, productId: true, variantId: true },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    const available = await this.getAvailableStock(
      item.productId,
      item.variantId,
    );
    this.assertStock(quantity, available);

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const deleted = await this.prisma.cartItem.deleteMany({
      where: { id: itemId, cart: { userId } },
    });
    if (deleted.count === 0) throw new NotFoundException('Cart item not found');
    return this.getCart(userId);
  }

  async saveForLater(userId: string, itemId: string) {
    const updated = await this.prisma.cartItem.updateMany({
      where: { id: itemId, cart: { userId } },
      data: { savedForLater: true },
    });
    if (updated.count === 0) throw new NotFoundException('Cart item not found');
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.ensureCart(userId);
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id, savedForLater: false },
    });
    return { message: 'Cart cleared' };
  }

  private async ensureCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } });
    return cart;
  }
}
