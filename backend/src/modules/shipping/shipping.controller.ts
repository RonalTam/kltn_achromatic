import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ShippingService } from './shipping.service';

@ApiTags('shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Public()
  @Get('methods')
  findAll() {
    return this.shippingService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('methods')
  @ApiBearerAuth('JWT-auth')
  create(
    @Body() body: { name: string; basePrice: number; estimatedDays?: string },
  ) {
    return this.shippingService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('methods/:id')
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body()
    body: Partial<{ name: string; basePrice: number; isActive: boolean }>,
  ) {
    return this.shippingService.update(id, body);
  }
}
