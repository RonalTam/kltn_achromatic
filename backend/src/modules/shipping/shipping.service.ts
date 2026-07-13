import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ShippingService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  create(data: {
    name: string;
    description?: string;
    basePrice: number;
    freeThreshold?: number;
    estimatedDays?: string;
  }) {
    return this.prisma.shippingMethod.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      name: string;
      basePrice: number;
      isActive: boolean;
      estimatedDays: string;
    }>,
  ) {
    return this.prisma.shippingMethod.update({ where: { id }, data });
  }
}

// ─────────────── Controller ───────────────
