import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { CartService } from './cart.service';

@ApiTags('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get my cart' })
  getCart(@CurrentUser() user: JwtUser) {
    return this.cartService.getCart(user.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  addItem(
    @CurrentUser() user: JwtUser,
    @Body() body: { productId: string; variantId?: string; quantity: number },
  ) {
    return this.cartService.addItem(user.sub, body);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update item quantity' })
  updateItem(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateItem(user.sub, id, body.quantity);
  }

  @Patch('items/:id/save-for-later')
  @ApiOperation({ summary: 'Save item for later' })
  saveForLater(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.cartService.saveForLater(user.sub, id);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from cart' })
  removeItem(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.cartService.removeItem(user.sub, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear my cart' })
  clearCart(@CurrentUser() user: JwtUser) {
    return this.cartService.clearCart(user.sub);
  }
}
