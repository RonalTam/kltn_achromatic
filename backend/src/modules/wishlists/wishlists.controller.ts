import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { WishlistsService } from './wishlists.service';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@ApiTags('wishlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user wishlist' })
  getWishlist(@CurrentUser() user: JwtUser) {
    return this.wishlistsService.getWishlist(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add a product to the current user wishlist' })
  addItem(@CurrentUser() user: JwtUser, @Body() body: AddWishlistItemDto) {
    return this.wishlistsService.addItem(user.sub, body.productId);
  }

  @Post(':productId')
  @ApiOperation({
    summary: 'Add a product to the wishlist (legacy path-param contract)',
    deprecated: true,
  })
  addItemLegacy(
    @CurrentUser() user: JwtUser,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.addItem(user.sub, productId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove a wishlist item by item ID (product ID also accepted)',
  })
  removeItem(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.wishlistsService.removeItem(user.sub, id);
  }
}
