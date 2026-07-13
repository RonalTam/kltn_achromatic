import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOrdersByStatus() {
    return this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });
  }

  async getRevenueByMonth(year: number) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: ['COMPLETED', 'DELIVERED'] },
      },
      select: { total: true, createdAt: true },
    });

    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
    }));
    orders.forEach((o) => {
      const month = o.createdAt.getMonth();
      monthly[month].revenue += Number(o.total);
    });
    return monthly;
  }

  async getCustomerGrowth(months = 6) {
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(
        start.getFullYear(),
        start.getMonth() + 1,
        0,
        23,
        59,
        59,
      );
      const count = await this.prisma.user.count({
        where: { role: 'CUSTOMER', createdAt: { gte: start, lte: end } },
      });
      data.push({
        month: start.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        }),
        customers: count,
      });
    }
    return data;
  }

  async getConversionRate() {
    const [visitors, buyers] = await Promise.all([
      this.prisma.product.aggregate({ _sum: { viewCount: true } }),
      this.prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
    ]);
    const totalViews = Number(visitors._sum.viewCount || 0);
    const rate = totalViews > 0 ? (buyers / totalViews) * 100 : 0;
    return {
      totalViews,
      totalOrders: buyers,
      conversionRate: Math.round(rate * 100) / 100,
    };
  }
}
