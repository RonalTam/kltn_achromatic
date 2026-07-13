import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      productId: string;
      orderId?: string;
      rating: number;
      title?: string;
      body: string;
    },
  ) {
    // Check for verified purchase
    let isVerified = false;
    if (data.orderId) {
      const orderItem = await this.prisma.orderItem.findFirst({
        where: {
          orderId: data.orderId,
          productId: data.productId,
          order: { userId },
        },
      });
      isVerified = !!orderItem;
    }

    const review = await this.prisma.review.create({
      data: { ...data, userId, isVerified, isApproved: false },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    // Update product rating
    await this.updateProductRating(data.productId);

    return review;
  }

  async findByProduct(productId: string, page = 1, limit = 10) {
    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where: { productId, isApproved: true } }),
      this.prisma.review.findMany({
        where: { productId, isApproved: true },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const ratingBreakdown = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId, isApproved: true },
      _count: true,
    });

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      ratingBreakdown,
    };
  }

  async approve(reviewId: string) {
    const review = await this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });
    await this.updateProductRating(review.productId);
    return review;
  }

  async remove(reviewId: string) {
    const review = await this.prisma.review.delete({ where: { id: reviewId } });
    await this.updateProductRating(review.productId);
    return { message: 'Review deleted' };
  }

  private async updateProductRating(productId: string) {
    const result = await this.prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: true,
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        avgRating: result._avg.rating || 0,
        reviewCount: result._count,
      },
    });
  }
}
