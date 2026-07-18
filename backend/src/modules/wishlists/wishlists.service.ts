import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const WISHLIST_INCLUDE = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          comparePrice: true,
          avgRating: true,
          reviewCount: true,
          images: {
            select: {
              id: true,
              url: true,
              altText: true,
              isPrimary: true,
              sortOrder: true,
            },
            orderBy: [
              { isPrimary: 'desc' as const },
              { sortOrder: 'asc' as const },
            ],
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              sku: true,
              price: true,
              isActive: true,
              color: { select: { id: true, name: true, hexCode: true } },
              size: { select: { id: true, name: true, sortOrder: true } },
              inventory: { select: { quantity: true, reserved: true } },
            },
          },
          inventory: {
            where: { variantId: null },
            select: { quantity: true, reserved: true },
          },
        },
      },
    },
    orderBy: { addedAt: 'desc' as const },
  },
};

@Injectable()
export class WishlistsService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: WISHLIST_INCLUDE,
    });
    if (!wishlist) {
      await this.prisma.wishlist.create({ data: { userId } });
      wishlist = await this.prisma.wishlist.findUniqueOrThrow({
        where: { userId },
        include: WISHLIST_INCLUDE,
      });
    }
    return wishlist;
  }

  async addItem(userId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const wishlist = await this.prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
      select: { id: true },
    });

    await this.prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      create: { wishlistId: wishlist.id, productId },
      update: {},
    });
    return this.getWishlist(userId);
  }

  async removeItem(userId: string, itemOrProductId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlist: { userId },
        OR: [{ id: itemOrProductId }, { productId: itemOrProductId }],
      },
      select: { id: true },
    });
    if (!item) throw new NotFoundException('Wishlist item not found');

    await this.prisma.wishlistItem.delete({ where: { id: item.id } });
    return this.getWishlist(userId);
  }
}
