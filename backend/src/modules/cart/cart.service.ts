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

    if (data.variantId) {
      const variant = await this.prisma.productVariant.findFirst({
        where: {
          id: data.variantId,
          productId: data.productId,
          isActive: true,
        },
        include: {
          inventory: { select: { quantity: true, reserved: true } },
        },
      });

      if (!variant) throw new NotFoundException('Product variant not found');

      const inventory = variant.inventory[0];
      const available = (inventory?.quantity ?? 0) - (inventory?.reserved ?? 0);
      const requestedQuantity = (existing?.quantity ?? 0) + data.quantity;
      if (available < requestedQuantity) {
        throw new BadRequestException(`Only ${available} items in stock`);
      }
    }

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
    if (quantity <= 0) return this.removeItem(userId, itemId);
    if (!Number.isInteger(quantity)) {
      throw new BadRequestException('Quantity must be a whole number');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: {
        variant: {
          include: {
            inventory: { select: { quantity: true, reserved: true } },
          },
        },
      },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    if (item.variantId) {
      const inventory = item.variant?.inventory[0];
      const available = (inventory?.quantity ?? 0) - (inventory?.reserved ?? 0);
      if (available < quantity) {
        throw new BadRequestException(`Only ${available} items in stock`);
      }
    }

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
