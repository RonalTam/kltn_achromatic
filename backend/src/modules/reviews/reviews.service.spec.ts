import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  const prisma = {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
    },
    review: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    reviewHelpfulVote: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  let service: ReviewsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.product.findUnique.mockResolvedValue({ id: 'product-1' });
    prisma.review.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(
      async (callback: (transaction: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    );
    service = new ReviewsService(prisma as unknown as PrismaService);
  });

  it('rejects a review for a missing product', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(
      service.create('user-1', {
        productId: 'missing',
        rating: 5,
        body: 'Excellent',
      }),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.order.findFirst).not.toHaveBeenCalled();
    expect(prisma.review.create).not.toHaveBeenCalled();
  });

  it('rejects a second review by the same user for the product', async () => {
    prisma.review.findFirst.mockResolvedValue({ id: 'review-existing' });

    await expect(
      service.create('user-1', {
        productId: 'product-1',
        rating: 5,
        body: 'Excellent',
      }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.order.findFirst).not.toHaveBeenCalled();
  });

  it('requires a delivered or completed order containing the product', async () => {
    prisma.order.findFirst.mockResolvedValue(null);

    await expect(
      service.create('user-1', {
        productId: 'product-1',
        orderId: 'pending-order',
        rating: 4,
        body: 'Good product',
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.order.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'pending-order',
        userId: 'user-1',
        status: {
          in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED],
        },
        items: { some: { productId: 'product-1' } },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
  });

  it('creates a pending verified review with uploaded image URLs', async () => {
    const createdReview = { id: 'review-1', isVerified: true, images: [] };
    prisma.order.findFirst.mockResolvedValue({ id: 'delivered-order' });
    prisma.review.create.mockResolvedValue(createdReview);

    await expect(
      service.create('user-1', {
        productId: 'product-1',
        rating: 5,
        title: 'Perfect',
        body: 'Excellent product',
        imageUrls: ['https://cdn.example.com/review-1.jpg'],
      }),
    ).resolves.toEqual(createdReview);
    expect(prisma.review.create).toHaveBeenCalledWith({
      data: {
        productId: 'product-1',
        rating: 5,
        title: 'Perfect',
        body: 'Excellent product',
        userId: 'user-1',
        orderId: 'delivered-order',
        isVerified: true,
        isApproved: false,
        images: {
          create: [{ url: 'https://cdn.example.com/review-1.jpg' }],
        },
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true },
        },
        images: true,
      },
    });
  });

  it('maps a database uniqueness race to a duplicate-review conflict', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'delivered-order' });
    prisma.review.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.create('user-1', {
        productId: 'product-1',
        rating: 5,
        body: 'Excellent product',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('reports eligibility and the eligible order ID', async () => {
    prisma.order.findFirst.mockResolvedValue({ id: 'completed-order' });

    await expect(
      service.getEligibility('user-1', 'product-1'),
    ).resolves.toEqual({
      eligible: true,
      orderId: 'completed-order',
      hasReviewed: false,
    });
  });

  it('reports when the user already reviewed the product', async () => {
    prisma.review.findFirst.mockResolvedValue({ id: 'review-1' });
    prisma.order.findFirst.mockResolvedValue({ id: 'completed-order' });

    await expect(
      service.getEligibility('user-1', 'product-1'),
    ).resolves.toEqual({
      eligible: false,
      orderId: 'completed-order',
      hasReviewed: true,
      reason: 'ALREADY_REVIEWED',
    });
  });

  it('paginates approved reviews and returns rating summary', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      avgRating: 4.5,
      reviewCount: 12,
    });
    prisma.review.count.mockResolvedValue(12);
    prisma.review.findMany.mockResolvedValue([{ id: 'review-2' }]);
    prisma.review.groupBy.mockResolvedValue([
      { rating: 5, _count: 8 },
      { rating: 4, _count: 4 },
    ]);

    const result = await service.findByProduct('product-1', 2, 5);

    expect(result.meta).toEqual({
      total: 12,
      page: 2,
      limit: 5,
      totalPages: 3,
    });
    expect(result.summary).toEqual({
      averageRating: 4.5,
      reviewCount: 12,
      ratingBreakdown: [
        { rating: 5, _count: 8 },
        { rating: 4, _count: 4 },
      ],
    });
    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });

  it('adds one helpful vote and increments the denormalized count', async () => {
    prisma.review.findFirst.mockResolvedValue({ id: 'review-1' });
    prisma.reviewHelpfulVote.findUnique.mockResolvedValue(null);
    prisma.reviewHelpfulVote.create.mockResolvedValue({ id: 'vote-1' });
    prisma.review.update.mockResolvedValue({ helpfulCount: 7 });

    await expect(service.toggleHelpful('review-1', 'user-1')).resolves.toEqual({
      reviewId: 'review-1',
      helpful: true,
      helpfulCount: 7,
    });
    expect(prisma.reviewHelpfulVote.create).toHaveBeenCalledWith({
      data: { reviewId: 'review-1', userId: 'user-1' },
    });
    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: 'review-1' },
      data: { helpfulCount: { increment: 1 } },
      select: { helpfulCount: true },
    });
  });

  it('returns only the current user helpful votes for approved reviews', async () => {
    prisma.reviewHelpfulVote.findMany.mockResolvedValue([
      { reviewId: 'review-1' },
      { reviewId: 'review-3' },
    ]);

    await expect(
      service.findHelpfulVotes('user-1', ['review-1', 'review-2', 'review-3']),
    ).resolves.toEqual({ reviewIds: ['review-1', 'review-3'] });

    expect(prisma.reviewHelpfulVote.findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        reviewId: { in: ['review-1', 'review-2', 'review-3'] },
        review: { isApproved: true },
      },
      select: { reviewId: true },
    });
  });

  it('toggles an existing helpful vote off', async () => {
    prisma.review.findFirst.mockResolvedValue({ id: 'review-1' });
    prisma.reviewHelpfulVote.findUnique.mockResolvedValue({ id: 'vote-1' });
    prisma.reviewHelpfulVote.delete.mockResolvedValue({ id: 'vote-1' });
    prisma.review.update.mockResolvedValue({ helpfulCount: 6 });

    await expect(service.toggleHelpful('review-1', 'user-1')).resolves.toEqual({
      reviewId: 'review-1',
      helpful: false,
      helpfulCount: 6,
    });
    expect(prisma.reviewHelpfulVote.delete).toHaveBeenCalledWith({
      where: { id: 'vote-1' },
    });
    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: 'review-1' },
      data: { helpfulCount: { decrement: 1 } },
      select: { helpfulCount: true },
    });
  });

  it('does not allow voting on a missing or unapproved review', async () => {
    prisma.review.findFirst.mockResolvedValue(null);

    await expect(service.toggleHelpful('review-1', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.reviewHelpfulVote.create).not.toHaveBeenCalled();
  });
});
