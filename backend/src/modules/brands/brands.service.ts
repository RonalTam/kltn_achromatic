import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.brand.findUniqueOrThrow({ where: { slug } });
  }

  create(data: {
    name: string;
    slug: string;
    logoUrl?: string;
    description?: string;
    website?: string;
  }) {
    return this.prisma.brand.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      name: string;
      logoUrl: string;
      description: string;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.brand.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
