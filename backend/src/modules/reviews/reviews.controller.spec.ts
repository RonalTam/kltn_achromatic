import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  const reviewsService = {
    getEligibility: jest.fn(),
    findHelpfulVotes: jest.fn(),
  };
  const cloudinaryService = {
    uploadFile: jest.fn(),
  };
  const user: JwtUser = {
    sub: 'user-1',
    email: 'customer@example.com',
    role: 'CUSTOMER',
  };
  const file = {
    fieldname: 'file',
    originalname: 'review.webp',
    encoding: '7bit',
    mimetype: 'image/webp',
    size: 128,
    buffer: Buffer.from('image'),
  } as Express.Multer.File;

  let controller: ReviewsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ReviewsController(
      reviewsService as unknown as ReviewsService,
      cloudinaryService as unknown as CloudinaryService,
    );
  });

  it('requires an image file before checking review eligibility', async () => {
    await expect(
      controller.uploadImage(user, { productId: 'product-1' }),
    ).rejects.toThrow(BadRequestException);

    expect(reviewsService.getEligibility).not.toHaveBeenCalled();
  });

  it('rejects uploads from a customer who cannot review the product', async () => {
    reviewsService.getEligibility.mockResolvedValue({
      eligible: false,
      hasReviewed: false,
      reason: 'NOT_PURCHASED_OR_NOT_DELIVERED',
    });

    await expect(
      controller.uploadImage(user, { productId: 'product-1' }, file),
    ).rejects.toThrow(ForbiddenException);

    expect(cloudinaryService.uploadFile).not.toHaveBeenCalled();
  });

  it('uploads into the review folder for an eligible verified purchaser', async () => {
    reviewsService.getEligibility.mockResolvedValue({
      eligible: true,
      orderId: 'order-1',
      hasReviewed: false,
    });
    cloudinaryService.uploadFile.mockResolvedValue({
      secure_url:
        'https://res.cloudinary.com/demo/image/upload/v1/reviews/photo.webp',
      public_id: 'reviews/photo',
    });

    await expect(
      controller.uploadImage(user, { productId: 'product-1' }, file),
    ).resolves.toEqual({
      url: 'https://res.cloudinary.com/demo/image/upload/v1/reviews/photo.webp',
      publicId: 'reviews/photo',
    });

    expect(reviewsService.getEligibility).toHaveBeenCalledWith(
      'user-1',
      'product-1',
    );
    expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(
      file,
      'achromatic/reviews',
    );
  });
});
