import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    const unreadCount = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { data: notifications, meta: { total, page, limit, unreadCount } };
  }

  async markAsRead(userId: string, notificationId?: string) {
    if (notificationId) {
      return this.prisma.notification.update({
        where: { id: notificationId, userId },
        data: { isRead: true, readAt: new Date() },
      });
    }
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async send(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data
          ? (JSON.parse(JSON.stringify(data)) as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }
}
