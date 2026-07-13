import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(slug: string) {
    return this.prisma.category.findUniqueOrThrow({
      where: { slug },
      include: { subCategories: { where: { isActive: true } } },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  }) {
    return this.prisma.category.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
