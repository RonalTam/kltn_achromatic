import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

const REVIEWABLE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.DELIVERED,
  OrderStatus.COMPLETED,
];

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateReviewDto) {
    const [product, existingReview] = await Promise.all([
      this.prisma.product.findUnique({
        where: { id: data.productId },
        select: { id: true },
      }),
      this.prisma.review.findFirst({
        where: { productId: data.productId, userId },
        select: { id: true },
      }),
    ]);

    if (!product) throw new NotFoundException('Product not found');
    if (existingReview) {
      throw new ConflictException('You have already reviewed this product');
    }

    const eligibleOrder = await this.findEligibleOrder(
      userId,
      data.productId,
      data.orderId,
    );
    if (!eligibleOrder) {
      throw new ForbiddenException(
        'Only customers with a delivered or completed order can review this product',
      );
    }

    const { imageUrls = [], ...reviewData } = data;

    try {
      return await this.prisma.review.create({
        data: {
          ...reviewData,
          userId,
          orderId: eligibleOrder.id,
          isVerified: true,
          isApproved: false,
          ...(imageUrls.length
            ? {
                images: {
                  create: imageUrls.map((url) => ({ url })),
                },
              }
            : {}),
        },
        include: {
          user: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
          images: true,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('You have already reviewed this product');
      }
      throw error;
    }
  }

  async getEligibility(userId: string, productId: string) {
    const [product, existingReview, eligibleOrder] = await Promise.all([
      this.prisma.product.findUnique({
        where: { id: productId },
        select: { id: true },
      }),
      this.prisma.review.findFirst({
        where: { productId, userId },
        select: { id: true },
      }),
      this.findEligibleOrder(userId, productId),
    ]);

    if (!product) throw new NotFoundException('Product not found');

    if (existingReview) {
      return {
        eligible: false,
        orderId: eligibleOrder?.id,
        hasReviewed: true,
        reason: 'ALREADY_REVIEWED',
      };
    }

    if (!eligibleOrder) {
      return {
        eligible: false,
        hasReviewed: false,
        reason: 'NOT_PURCHASED_OR_NOT_DELIVERED',
      };
    }

    return {
      eligible: true,
      orderId: eligibleOrder.id,
      hasReviewed: false,
    };
  }

  async findByProduct(productId: string, page = 1, limit = 10) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, avgRating: true, reviewCount: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    const where = { productId, isApproved: true };
    const [total, reviews, ratingBreakdown] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
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
      this.prisma.review.groupBy({
        by: ['rating'],
        where,
        _count: true,
        orderBy: { rating: 'desc' },
      }),
    ]);

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        averageRating: product.avgRating,
        reviewCount: product.reviewCount,
        ratingBreakdown,
      },
      // Retain the original field for existing clients.
      ratingBreakdown,
    };
  }

  async findHelpfulVotes(userId: string, reviewIds: string[]) {
    const votes = await this.prisma.reviewHelpfulVote.findMany({
      where: {
        userId,
        reviewId: { in: reviewIds },
        review: { isApproved: true },
      },
      select: { reviewId: true },
    });

    return { reviewIds: votes.map((vote) => vote.reviewId) };
  }

  async toggleHelpful(reviewId: string, userId: string) {
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const review = await transaction.review.findFirst({
          where: { id: reviewId, isApproved: true },
          select: { id: true },
        });
        if (!review) throw new NotFoundException('Review not found');

        const existingVote = await transaction.reviewHelpfulVote.findUnique({
          where: { reviewId_userId: { reviewId, userId } },
          select: { id: true },
        });

        if (existingVote) {
          await transaction.reviewHelpfulVote.delete({
            where: { id: existingVote.id },
          });
          const updatedReview = await transaction.review.update({
            where: { id: reviewId },
            data: { helpfulCount: { decrement: 1 } },
            select: { helpfulCount: true },
          });
          return {
            reviewId,
            helpful: false,
            helpfulCount: updatedReview.helpfulCount,
          };
        }

        await transaction.reviewHelpfulVote.create({
          data: { reviewId, userId },
        });
        const updatedReview = await transaction.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { increment: 1 } },
          select: { helpfulCount: true },
        });
        return {
          reviewId,
          helpful: true,
          helpfulCount: updatedReview.helpfulCount,
        };
      });
    } catch (error) {
      // Concurrent identical requests are still de-duplicated by the database.
      if (isUniqueConstraintError(error)) {
        const review = await this.prisma.review.findUnique({
          where: { id: reviewId },
          select: { helpfulCount: true },
        });
        if (!review) throw new NotFoundException('Review not found');
        return { reviewId, helpful: true, helpfulCount: review.helpfulCount };
      }
      throw error;
    }
  }

  async approve(reviewId: string) {
    const existingReview = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, productId: true, isApproved: true },
    });
    if (!existingReview) throw new NotFoundException('Review not found');

    if (existingReview.isApproved) return existingReview;

    const review = await this.prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    });
    await this.updateProductRating(review.productId);
    return review;
  }

  async remove(reviewId: string) {
    const existingReview = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { productId: true },
    });
    if (!existingReview) throw new NotFoundException('Review not found');

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this.updateProductRating(existingReview.productId);
    return { message: 'Review deleted' };
  }

  private findEligibleOrder(
    userId: string,
    productId: string,
    orderId?: string,
  ) {
    return this.prisma.order.findFirst({
      where: {
        ...(orderId ? { id: orderId } : {}),
        userId,
        status: { in: REVIEWABLE_ORDER_STATUSES },
        items: { some: { productId } },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
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
