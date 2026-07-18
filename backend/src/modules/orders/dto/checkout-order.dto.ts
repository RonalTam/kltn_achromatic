import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckoutOrderDto {
  @ApiProperty({ description: 'Customer address ID' })
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiPropertyOptional({ description: 'Shipping method ID' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  shippingMethodId?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Coupon code' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Customer notes for the order' })
  @IsOptional()
  @IsString()
  notes?: string;
}
