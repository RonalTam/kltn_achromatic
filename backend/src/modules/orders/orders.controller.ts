import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role, OrderStatus, PaymentMethod } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Place a new order (checkout)' })
  checkout(
    @CurrentUser() user: JwtUser,
    @Body()
    body: {
      addressId: string;
      shippingMethodId?: string;
      paymentMethod: PaymentMethod;
      couponCode?: string;
      notes?: string;
    },
  ) {
    return this.ordersService.createOrder(user.sub, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get my orders' })
  getMyOrders(
    @CurrentUser() user: JwtUser,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.findByUser(user.sub, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  getOrder(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.ordersService.findOne(id, user.sub);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel my order (only PENDING or CONFIRMED)' })
  cancelOrder(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.ordersService.cancelByUser(id, user.sub, body.reason);
  }

  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'Track order by order number' })
  trackOrder(
    @CurrentUser() user: JwtUser,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.ordersService.findByOrderNumber(orderNumber, user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @Get('admin/all')
  @ApiOperation({ summary: '[Admin] List all orders' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAll(+page, +limit, status);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
  @Patch('admin/:id/status')
  @ApiOperation({ summary: '[Admin] Update order status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; note?: string },
    @CurrentUser() user: JwtUser,
  ) {
    return this.ordersService.updateStatus(
      id,
      body.status,
      body.note,
      user.sub,
    );
  }
}
