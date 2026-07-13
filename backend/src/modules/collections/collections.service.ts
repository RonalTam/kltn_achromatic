import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.collection.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findOne(slug: string) {
    return this.prisma.collection.findUniqueOrThrow({
      where: { slug },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                images: { where: { isPrimary: true }, take: 1 },
                avgRating: true,
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  create(data: {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
  }) {
    return this.prisma.collection.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      name: string;
      isActive: boolean;
      isFeatured: boolean;
      sortOrder: number;
    }>,
  ) {
    return this.prisma.collection.update({ where: { id }, data });
  }

  async addProduct(collectionId: string, productId: string) {
    return this.prisma.collectionProduct.upsert({
      where: { collectionId_productId: { collectionId, productId } },
      create: { collectionId, productId },
      update: {},
    });
  }

  async removeProduct(collectionId: string, productId: string) {
    return this.prisma.collectionProduct.delete({
      where: { collectionId_productId: { collectionId, productId } },
    });
  }
}
