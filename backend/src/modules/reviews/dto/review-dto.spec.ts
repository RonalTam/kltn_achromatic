import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';
import { HelpfulVotesQueryDto } from './helpful-votes-query.dto';

describe('review DTO validation', () => {
  it('trims review text before validation', async () => {
    const dto = plainToInstance(CreateReviewDto, {
      productId: '  product-1  ',
      rating: 5,
      title: '  Chất lượng tốt  ',
      body: '  Sản phẩm mặc rất thoải mái.  ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto).toMatchObject({
      productId: 'product-1',
      title: 'Chất lượng tốt',
      body: 'Sản phẩm mặc rất thoải mái.',
    });
  });

  it('rejects a whitespace-only review body', async () => {
    const dto = plainToInstance(CreateReviewDto, {
      productId: 'product-1',
      rating: 4,
      body: '            ',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'body')).toBe(true);
  });

  it('only accepts HTTPS Cloudinary image upload URLs', async () => {
    const external = plainToInstance(CreateReviewDto, {
      productId: 'product-1',
      rating: 5,
      body: 'Sản phẩm mặc rất thoải mái.',
      imageUrls: ['https://example.com/review.jpg'],
    });
    const cloudinary = plainToInstance(CreateReviewDto, {
      productId: 'product-1',
      rating: 5,
      body: 'Sản phẩm mặc rất thoải mái.',
      imageUrls: [
        'https://res.cloudinary.com/demo/image/upload/v1/reviews/photo.webp',
      ],
    });

    expect(
      (await validate(external)).some(
        (error) => error.property === 'imageUrls',
      ),
    ).toBe(true);
    await expect(validate(cloudinary)).resolves.toHaveLength(0);
  });

  it('parses, de-duplicates, and bounds helpful review IDs', async () => {
    const valid = plainToInstance(HelpfulVotesQueryDto, {
      reviewIds: ' review-1,review-2 ',
    });
    const duplicate = plainToInstance(HelpfulVotesQueryDto, {
      reviewIds: 'review-1,review-1',
    });
    const oversized = plainToInstance(HelpfulVotesQueryDto, {
      reviewIds: Array.from(
        { length: 51 },
        (_, index) => `review-${index}`,
      ).join(','),
    });

    await expect(validate(valid)).resolves.toHaveLength(0);
    expect(valid.reviewIds).toEqual(['review-1', 'review-2']);
    expect(await validate(duplicate)).not.toHaveLength(0);
    expect(await validate(oversized)).not.toHaveLength(0);
  });
});
