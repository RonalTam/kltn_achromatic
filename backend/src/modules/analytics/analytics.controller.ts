import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.MANAGER)
@ApiBearerAuth('JWT-auth')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('orders-by-status') getOrdersByStatus() {
    return this.analyticsService.getOrdersByStatus();
  }
  @Get('revenue-by-month') getRevenueByMonth(
    @Query('year') year = new Date().getFullYear(),
  ) {
    return this.analyticsService.getRevenueByMonth(+year);
  }
  @Get('customer-growth') getCustomerGrowth(@Query('months') months = 6) {
    return this.analyticsService.getCustomerGrowth(+months);
  }
  @Get('conversion-rate') getConversionRate() {
    return this.analyticsService.getConversionRate();
  }
}
