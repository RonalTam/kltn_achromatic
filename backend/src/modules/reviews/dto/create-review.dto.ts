import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

function trimRequiredString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function trimOptionalString(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class CreateReviewDto {
  @ApiProperty({ description: 'Reviewed product ID' })
  @Transform(({ value }) => trimRequiredString(value))
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiPropertyOptional({
    description:
      'Delivered/completed order ID. The latest eligible order is used when omitted.',
  })
  @Transform(({ value }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  orderId?: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ maxLength: 100 })
  @Transform(({ value }) => trimOptionalString(value))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ minLength: 10, maxLength: 1000 })
  @Transform(({ value }) => trimRequiredString(value))
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  body: string;

  @ApiPropertyOptional({
    type: [String],
    maxItems: 3,
    description: 'Public image URLs, normally returned by POST /reviews/images',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ArrayUnique()
  @IsUrl({ require_protocol: true }, { each: true })
  @Matches(/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//i, {
    each: true,
    message: 'Each image URL must be an HTTPS Cloudinary upload URL',
  })
  imageUrls?: string[];
}
