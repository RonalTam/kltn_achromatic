import { Injectable } from '@nestjs/common';
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
          images: {
            where: { isPrimary: true },
            select: { url: true, altText: true },
            take: 1,
          },
          variants: {
            where: { isActive: true },
            select: {
              id: true,
              color: { select: { name: true, hexCode: true } },
              size: { select: { name: true } },
            },
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
    let wishlist = await this.prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist)
      wishlist = await this.prisma.wishlist.create({ data: { userId } });
    await this.prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      create: { wishlistId: wishlist.id, productId },
      update: {},
    });
    return this.getWishlist(userId);
  }

  async removeItem(userId: string, productId: string) {
    const wishlist = await this.prisma.wishlist.findUniqueOrThrow({
      where: { userId },
    });
    await this.prisma.wishlistItem.delete({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    return this.getWishlist(userId);
  }
}
