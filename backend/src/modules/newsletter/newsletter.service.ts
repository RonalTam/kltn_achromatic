import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    await this.prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      update: {
        isActive: true,
        unsubscribedAt: null,
        subscribedAt: new Date(),
      },
      create: {
        email: normalizedEmail,
        source: 'homepage',
      },
    });

    return {
      message: 'Đăng ký nhận bản tin thành công.',
      email: normalizedEmail,
    };
  }

  async unsubscribe(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    await this.prisma.newsletterSubscriber.updateMany({
      where: { email: normalizedEmail },
      data: { isActive: false, unsubscribedAt: new Date() },
    });

    return {
      message: 'Địa chỉ email đã được hủy đăng ký.',
    };
  }
}
