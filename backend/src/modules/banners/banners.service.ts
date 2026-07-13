import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BannerPosition } from '@prisma/client';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  findAll(position?: BannerPosition) {
    return this.prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
        OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }],
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  create(data: {
    title: string;
    imageUrl: string;
    position?: BannerPosition;
    linkUrl?: string;
    linkText?: string;
  }) {
    return this.prisma.banner.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      title: string;
      imageUrl: string;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
