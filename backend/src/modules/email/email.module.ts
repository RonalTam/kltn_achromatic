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
        const portStr = config.get<string | number>('SMTP_PORT', 587);
        const port = typeof portStr === 'string' ? parseInt(portStr, 10) : portStr;
        const smtpConfigured = Boolean(host && user && pass);
        const from =
          config.get<string>('SMTP_FROM')?.trim() ||
          (user
            ? `ACHROMATIC <${user}>`
            : 'ACHROMATIC <noreply@achromatic.local>');
            
        const secureConfig = config.get<string | boolean>('SMTP_SECURE');
        const secure = secureConfig === 'true' || secureConfig === true ? true : (secureConfig === 'false' || secureConfig === false ? false : port === 465);

        return {
          transport: smtpConfigured
            ? {
                host,
                port,
                secure,
                requireTLS: port === 587,
                auth: { user, pass },
                connectionTimeout: 10000,
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
