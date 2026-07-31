import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import type { MailerOptions } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): MailerOptions => {
        const host = config.get<string>('SMTP_HOST');
        const user = config.get<string>('SMTP_USER');
        const pass = config.get<string>('SMTP_PASS');
        const port = config.get<number>('SMTP_PORT', 587);
        const smtpConfigured = Boolean(host && user && pass);
        const from =
          config.get<string>('SMTP_FROM')?.trim() ||
          (user
            ? `ACHROMATIC <${user}>`
            : 'ACHROMATIC <noreply@achromatic.local>');

        return {
          transport: smtpConfigured
            ? {
                host,
                port,
                secure: config.get<boolean>('SMTP_SECURE', port === 465),
                requireTLS: port === 587,
                auth: { user, pass },
              }
            : { jsonTransport: true },
          defaults: {
            from,
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
