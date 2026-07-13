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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CouponsService } from './coupons.service';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  @ApiBearerAuth('JWT-auth')
  validate(
    @CurrentUser() user: JwtUser,
    @Query('code') code: string,
    @Query('amount') amount: number,
  ) {
    return this.couponsService.validate(code, user.sub, +amount);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get()
  @ApiBearerAuth('JWT-auth')
  findAll() {
    return this.couponsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  @ApiBearerAuth('JWT-auth')
  create(
    @Body()
    body: {
      code: string;
      name: string;
      type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
      value: number;
    },
  ) {
    return this.couponsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ isActive: boolean }>,
  ) {
    return this.couponsService.update(id, body);
  }
}
