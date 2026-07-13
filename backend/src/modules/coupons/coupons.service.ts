import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async validate(code: string, userId: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.expiresAt && coupon.expiresAt < new Date())
      throw new BadRequestException('Coupon has expired');
    if (coupon.startsAt && coupon.startsAt > new Date())
      throw new BadRequestException('Coupon not yet active');
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount: ${Number(coupon.minOrderAmount)} VND`,
      );
    }

    // Check per-user usage
    const userUsage = await this.prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsage >= coupon.usagePerUser)
      throw new BadRequestException('You have already used this coupon');

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = (orderAmount * Number(coupon.value)) / 100;
      if (coupon.maxDiscount)
        discount = Math.min(discount, Number(coupon.maxDiscount));
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discount = Math.min(Number(coupon.value), orderAmount);
    } else if (coupon.type === 'FREE_SHIPPING') {
      discount = 0; // Applied to shipping at order creation
    }

    return {
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount,
    };
  }

  async findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: {
    code: string;
    name: string;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
    value: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    expiresAt?: Date;
  }) {
    return this.prisma.coupon.create({
      data: { ...data, code: data.code.toUpperCase() },
    });
  }

  async update(
    id: string,
    data: Partial<{ isActive: boolean; expiresAt: Date; usageLimit: number }>,
  ) {
    return this.prisma.coupon.update({ where: { id }, data });
  }
}
