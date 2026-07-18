import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

function trimRequiredString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class UploadReviewImageDto {
  @ApiProperty({
    description: 'Product ID the uploaded review image belongs to',
  })
  @Transform(({ value }) => trimRequiredString(value))
  @IsString()
  @IsNotEmpty()
  productId: string;
}
