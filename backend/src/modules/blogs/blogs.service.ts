import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BlogStatus } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, categorySlug?: string, search?: string) {
    const where: Record<string, unknown> = { status: BlogStatus.PUBLISHED };
    if (categorySlug) where.category = { slug: categorySlug };
    if (search)
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];

    const [total, blogs] = await Promise.all([
      this.prisma.blog.count({ where }),
      this.prisma.blog.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          tags: { include: { tag: { select: { name: true, slug: true } } } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return {
      data: blogs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  findOne(slug: string) {
    return this.prisma.blog.findUniqueOrThrow({
      where: { slug },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async create(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    coverImageUrl?: string;
    categoryId?: string;
    authorName?: string;
    status?: BlogStatus;
  }) {
    return this.prisma.blog.create({
      data: {
        ...data,
        publishedAt:
          data.status === BlogStatus.PUBLISHED ? new Date() : undefined,
      },
    });
  }

  update(
    id: string,
    data: Partial<{ title: string; content: string; status: BlogStatus }>,
  ) {
    return this.prisma.blog.update({ where: { id }, data });
  }
}
