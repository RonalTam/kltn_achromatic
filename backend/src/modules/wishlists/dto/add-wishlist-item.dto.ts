import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddWishlistItemDto {
  @ApiProperty({ description: 'Product ID to add to the wishlist' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
