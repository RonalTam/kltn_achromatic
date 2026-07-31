import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('orders/:orderId')
  getPayment(@Param('orderId') orderId: string, @CurrentUser() user: JwtUser) {
    return this.paymentsService.getPayment(orderId, user.sub, user.role);
  }

  @Post('vnpay/orders/:orderId/create')
  @ApiOperation({ summary: 'Create a signed VNPay sandbox payment URL' })
  createVnpayPayment(
    @Param('orderId') orderId: string,
    @CurrentUser() user: JwtUser,
    @Req() request: Request,
  ) {
    const ipAddress =
      request.headers['x-forwarded-for']?.toString() ||
      request.ip ||
      request.socket.remoteAddress ||
      '127.0.0.1';
    return this.paymentsService.initVNPay(
      orderId,
      user.sub,
      user.role,
      ipAddress,
    );
  }

  @Public()
  @Get('vnpay/return')
  @ApiOperation({
    summary: 'Process VNPay browser return and redirect to shop',
  })
  async handleVnpayReturn(
    @Query() query: Record<string, string | string[] | undefined>,
    @Res() response: Response,
  ) {
    try {
      const result = await this.paymentsService.handleVnpayCallback(query);
      // Fire-and-forget: send email outside the redirect flow
      void this.paymentsService.sendConfirmationEmailIfNeeded(result);
      return response.redirect(
        303,
        this.paymentsService.getFrontendPaymentResultUrl(result),
      );
    } catch {
      return response.redirect(
        303,
        this.paymentsService.getFrontendPaymentFailureUrl(),
      );
    }
  }

  @Public()
  @Get('vnpay/ipn')
  @ApiOperation({ summary: 'Process the server-to-server VNPay IPN callback' })
  async handleVnpayIpn(
    @Query() query: Record<string, string | string[] | undefined>,
    @Res() response: Response,
  ) {
    try {
      const result = await this.paymentsService.handleVnpayCallback(query);
      void this.paymentsService.sendConfirmationEmailIfNeeded(result);
      return response.status(200).json({
        RspCode: '00',
        Message: 'Confirm Success',
      });
    } catch {
      return response.status(200).json({
        RspCode: '97',
        Message: 'Invalid Signature',
      });
    }
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
    @CurrentUser() user: JwtUser,
  ) {
    return this.paymentsService.processRefund(orderId, body.amount, user.sub);
  }
}
