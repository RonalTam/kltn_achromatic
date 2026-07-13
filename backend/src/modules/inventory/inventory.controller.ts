import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
@ApiBearerAuth('JWT-auth')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products/:productId')
  getProductInventory(@Param('productId') productId: string) {
    return this.inventoryService.getProductInventory(productId);
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold = 10) {
    return this.inventoryService.getLowStock(+threshold);
  }

  @Patch(':id/adjust')
  adjust(
    @Param('id') id: string,
    @Body() body: { quantity: number; reason: string },
    @CurrentUser() user: JwtUser,
  ) {
    return this.inventoryService.adjust(
      id,
      body.quantity,
      body.reason,
      user.sub,
    );
  }
}
