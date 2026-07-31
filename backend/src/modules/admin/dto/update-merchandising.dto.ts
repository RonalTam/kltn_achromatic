import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MERCHANDISING_LIMIT_MAX } from '../../products/merchandising';

export class UpdateMerchandisingDto {
  @ApiProperty({ type: [String], maxItems: MERCHANDISING_LIMIT_MAX })
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(MERCHANDISING_LIMIT_MAX)
  @IsString({ each: true })
  productIds: string[];

  @ApiProperty({ minimum: 1, maximum: MERCHANDISING_LIMIT_MAX, default: 8 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MERCHANDISING_LIMIT_MAX)
  limit: number;
}
