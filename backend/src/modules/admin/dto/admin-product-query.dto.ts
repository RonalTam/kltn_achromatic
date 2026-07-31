import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum AdminProductStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  ALL = 'all',
}

export enum AdminProductSortBy {
  UPDATED_AT = 'updatedAt',
  CREATED_AT = 'createdAt',
  NAME = 'name',
  BASE_PRICE = 'basePrice',
  SOLD_COUNT = 'soldCount',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

function optionalBoolean({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value;
}

export class AdminProductQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description:
      'Search product name, product/variant SKU, slug, brand, category, or subcategory',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AdminProductStatus })
  @IsOptional()
  @IsEnum(AdminProductStatus)
  status?: AdminProductStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  newArrival?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(optionalBoolean)
  @IsBoolean()
  bestSeller?: boolean;

  @ApiPropertyOptional({
    enum: AdminProductSortBy,
    default: AdminProductSortBy.UPDATED_AT,
  })
  @IsOptional()
  @IsEnum(AdminProductSortBy)
  sortBy?: AdminProductSortBy = AdminProductSortBy.UPDATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
