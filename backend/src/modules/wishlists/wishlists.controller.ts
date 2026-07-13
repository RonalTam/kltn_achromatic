import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { WishlistsService } from './wishlists.service';

@ApiTags('wishlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  getWishlist(@CurrentUser() user: JwtUser) {
    return this.wishlistsService.getWishlist(user.sub);
  }

  @Post(':productId')
  addItem(@CurrentUser() user: JwtUser, @Param('productId') productId: string) {
    return this.wishlistsService.addItem(user.sub, productId);
  }

  @Delete(':productId')
  removeItem(
    @CurrentUser() user: JwtUser,
    @Param('productId') productId: string,
  ) {
    return this.wishlistsService.removeItem(user.sub, productId);
  }
}
