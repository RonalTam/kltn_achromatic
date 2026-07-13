import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('orders/:orderId')
  getPayment(@Param('orderId') orderId: string) {
    return this.paymentsService.getPayment(orderId);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('orders/:orderId/confirm-cod')
  confirmCOD(@Param('orderId') orderId: string, @CurrentUser() user: JwtUser) {
    return this.paymentsService.confirmCOD(orderId, user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('orders/:orderId/confirm-bank')
  confirmBank(
    @Param('orderId') orderId: string,
    @Body() body: { transactionRef: string },
    @CurrentUser() user: JwtUser,
  ) {
    return this.paymentsService.confirmBankTransfer(
      orderId,
      body.transactionRef,
      user.sub,
    );
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('orders/:orderId/refund')
  processRefund(
    @Param('orderId') orderId: string,
    @Body() body: { amount?: number },
  ) {
    return this.paymentsService.processRefund(orderId, body.amount);
  }
}
