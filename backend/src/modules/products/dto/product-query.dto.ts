import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  BEST_SELLING = 'best_selling',
  TOP_RATED = 'top_rated',
  FEATURED = 'featured',
}

export class ProductQueryDto {
  @ApiPropertyOptional({ description: 'Search keyword' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategory slug' })
  @IsOptional()
  @IsString()
  subCategory?: string;

  @ApiPropertyOptional({ description: 'Brand slug' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Minimum price in VND' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price in VND' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Comma-separated size names (S,M,L,XL)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.split(',').filter(Boolean)
      : Array.isArray(value)
        ? value.map(String)
        : undefined,
  )
  sizes?: string[];

  @ApiPropertyOptional({ description: 'Comma-separated color names' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? value.split(',').filter(Boolean)
      : Array.isArray(value)
        ? value.map(String)
        : undefined,
  )
  colors?: string[];

  @ApiPropertyOptional({ description: 'Filter to featured only' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Filter to new arrivals only' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  newArrival?: boolean;

  @ApiPropertyOptional({ description: 'Filter to best sellers only' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  bestSeller?: boolean;

  @ApiPropertyOptional({ enum: SortBy, default: SortBy.NEWEST })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.NEWEST;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 12;
}
