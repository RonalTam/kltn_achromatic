import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  const mailer = {
    sendMail: jest.fn(),
  };
  const configValues: Record<string, string> = {
    FRONTEND_URL: 'https://achromatic.example/',
    SMTP_HOST: 'smtp.example.com',
    SMTP_USER: 'mailer',
    SMTP_PASS: 'secret',
  };
  const config = {
    get: jest.fn(
      (key: string, fallback?: string) => configValues[key] ?? fallback,
    ),
  };

  let service: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    mailer.sendMail.mockResolvedValue({ messageId: 'mail-1' });
    service = new EmailService(
      mailer as unknown as MailerService,
      config as unknown as ConfigService,
    );
  });

  it('sends a branded welcome email with a storefront link', async () => {
    await expect(
      service.sendWelcomeEmail('customer@example.com', 'Linh'),
    ).resolves.toBe(true);

    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'customer@example.com',
        subject: expect.stringContaining('ACHROMATIC') as unknown,
        html: expect.stringContaining(
          'https://achromatic.example/collections',
        ) as unknown,
        headers: { 'X-ACHROMATIC-Category': 'welcome' },
      }),
    );
  });

  it('encodes reset tokens before including them in email links', async () => {
    await service.sendPasswordResetEmail(
      'customer@example.com',
      'Linh',
      'token with + symbols',
    );

    expect(mailer.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining(
          'token=token%20with%20%2B%20symbols',
        ) as unknown,
        headers: { 'X-ACHROMATIC-Category': 'password-reset' },
      }),
    );
  });

  it('does not fail the order workflow when the SMTP transport is unavailable', async () => {
    mailer.sendMail.mockRejectedValue(new Error('SMTP unavailable'));

    await expect(
      service.sendOrderConfirmationEmail({
        to: 'customer@example.com',
        firstName: 'Linh',
        orderId: 'order-1',
        orderNumber: 'ACH-1001',
        total: 450000,
        items: [{ name: 'Linen shirt', quantity: 1, unitPrice: 450000 }],
      }),
    ).resolves.toBe(false);
  });
});
