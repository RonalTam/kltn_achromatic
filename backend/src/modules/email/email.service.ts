import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import {
  orderConfirmationEmailTemplate,
  type OrderEmailItem,
  resetPasswordEmailTemplate,
  welcomeEmailTemplate,
} from './email.templates';

type OrderConfirmationInput = {
  to: string;
  firstName: string;
  orderId: string;
  orderNumber: string;
  total: number;
  items: OrderEmailItem[];
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;
  private readonly smtpConfigured: boolean;

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {
    this.frontendUrl = this.config
      .get<string>('FRONTEND_URL', 'http://localhost:3000')
      .replace(/\/$/, '');
    this.smtpConfigured = Boolean(
      this.config.get<string>('SMTP_HOST') &&
      this.config.get<string>('SMTP_USER') &&
      this.config.get<string>('SMTP_PASS'),
    );
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    return this.deliver({
      to,
      subject: 'Chào mừng bạn đến với ACHROMATIC',
      html: welcomeEmailTemplate({
        firstName,
        shopUrl: `${this.frontendUrl}/collections`,
      }),
      category: 'welcome',
    });
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    rawToken: string,
  ): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/account/reset-password?token=${encodeURIComponent(rawToken)}`;
    return this.deliver({
      to,
      subject: 'Đặt lại mật khẩu ACHROMATIC',
      html: resetPasswordEmailTemplate({
        firstName,
        resetUrl,
        expiresInMinutes: 60,
      }),
      category: 'password-reset',
    });
  }

  async sendOrderConfirmationEmail(
    input: OrderConfirmationInput,
  ): Promise<boolean> {
    return this.deliver({
      to: input.to,
      subject: `Xác nhận đơn hàng ${input.orderNumber}`,
      html: orderConfirmationEmailTemplate({
        firstName: input.firstName,
        orderNumber: input.orderNumber,
        orderUrl: `${this.frontendUrl}/account/orders/${encodeURIComponent(input.orderId)}`,
        total: input.total,
        items: input.items,
      }),
      category: 'order-confirmation',
    });
  }

  private async deliver(input: {
    to: string;
    subject: string;
    html: string;
    category: string;
  }): Promise<boolean> {
    try {
      const info: unknown = await this.mailer.sendMail({
        to: input.to,
        subject: input.subject,
        html: input.html,
        headers: { 'X-ACHROMATIC-Category': input.category },
      });
      const rawMessageId =
        typeof info === 'object' && info !== null && 'messageId' in info
          ? (info as { messageId?: unknown }).messageId
          : undefined;
      const messageId =
        typeof rawMessageId === 'string' || typeof rawMessageId === 'number'
          ? String(rawMessageId)
          : 'no-id';
      if (this.smtpConfigured) {
        this.logger.log(
          `Email ${input.category} accepted for ${input.to} (${messageId})`,
        );
      } else {
        this.logger.warn(
          `SMTP is not configured. Generated ${input.category} email using the local JSON transport.`,
        );
      }
      return true;
    } catch (error) {
      this.logger.error(
        `Unable to send ${input.category} email to ${input.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
