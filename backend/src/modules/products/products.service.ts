import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductQueryDto, SortBy } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  shortDescription: true,
  basePrice: true,
  comparePrice: true,
  isFeatured: true,
  isNewArrival: true,
  isBestSeller: true,
  avgRating: true,
  reviewCount: true,
  soldCount: true,
  tags: true,
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  images: {
    where: { isPrimary: true },
    select: { url: true, altText: true },
    take: 1,
  },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      price: true,
      color: { select: { id: true, name: true, hexCode: true } },
      size: { select: { id: true, name: true } },
      inventory: { select: { quantity: true, reserved: true } },
    },
  },
} satisfies Prisma.ProductSelect;

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────
  // LIST PRODUCTS (with advanced filtering)
  // ─────────────────────────────────────────────
  async findAll(query: ProductQueryDto) {
    const {
      search,
      category,
      subCategory,
      brand,
      minPrice,
      maxPrice,
      sizes,
      colors,
      featured,
      newArrival,
      bestSeller,
      sortBy,
      page = 1,
      limit = 12,
    } = query;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // Text search
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Category filter
    if (category) {
      where.category = { slug: category };
    }

    // Sub-category filter
    if (subCategory) {
      where.subCategory = { slug: subCategory };
    }

    // Brand filter
    if (brand) {
      where.brand = { slug: brand };
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    // Variant filters must be merged so size + color narrow the same variant set.
    if ((sizes && sizes.length > 0) || (colors && colors.length > 0)) {
      const variantWhere: Prisma.ProductVariantWhereInput = { isActive: true };

      if (sizes && sizes.length > 0) {
        variantWhere.size = {
          OR: [{ name: { in: sizes } }, { id: { in: sizes } }],
        };
      }

      if (colors && colors.length > 0) {
        variantWhere.color = {
          OR: [{ name: { in: colors } }, { id: { in: colors } }],
        };
      }

      where.variants = { some: variantWhere };
    }

    // Boolean filters
    if (featured) where.isFeatured = true;
    if (newArrival) where.isNewArrival = true;
    if (bestSeller) where.isBestSeller = true;

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case SortBy.PRICE_ASC:
        orderBy = { basePrice: 'asc' };
        break;
      case SortBy.PRICE_DESC:
        orderBy = { basePrice: 'desc' };
        break;
      case SortBy.BEST_SELLING:
        orderBy = { soldCount: 'desc' };
        break;
      case SortBy.TOP_RATED:
        orderBy = { avgRating: 'desc' };
        break;
      case SortBy.OLDEST:
        orderBy = { createdAt: 'asc' };
        break;
      case SortBy.FEATURED:
        orderBy = { isFeatured: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        select: PRODUCT_SELECT,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // ─────────────────────────────────────────────
  // GET SINGLE PRODUCT (full detail for PDP)
  // ─────────────────────────────────────────────
  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          include: {
            color: true,
            size: true,
            inventory: { select: { quantity: true, reserved: true } },
          },
        },
        specifications: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
            images: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Product not found: ${slug}`);
    }

    // Increment view count (fire and forget)
    void this.prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, categoryId: true, isActive: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Product not found: ${id}`);
    }

    return product;
  }

  // ─────────────────────────────────────────────
  // RELATED PRODUCTS
  // ─────────────────────────────────────────────
  async findRelated(productId: string, categoryId: string, limit = 4) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        categoryId,
        id: { not: productId },
      },
      select: PRODUCT_SELECT,
      orderBy: { soldCount: 'desc' },
      take: limit,
    });
  }

  // ─────────────────────────────────────────────
  // AVAILABLE FILTERS (for sidebar filter panel)
  // ─────────────────────────────────────────────
  async getFilterOptions(categorySlug?: string) {
    const productWhere: Prisma.ProductWhereInput = {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    };

    const [sizes, colors, brands, priceRange] = await Promise.all([
      this.prisma.productSize.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.productColor.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.brand.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.aggregate({
        where: productWhere,
        _min: { basePrice: true },
        _max: { basePrice: true },
      }),
    ]);

    return { sizes, colors, brands, priceRange };
  }

  // ─────────────────────────────────────────────
  // ADMIN: CREATE PRODUCT
  // ─────────────────────────────────────────────
  async create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: { category: true, brand: true },
    });
  }

  // ─────────────────────────────────────────────
  // ADMIN: UPDATE PRODUCT
  // ─────────────────────────────────────────────
  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }

  // ─────────────────────────────────────────────
  // ADMIN: DELETE PRODUCT
  // ─────────────────────────────────────────────
  async remove(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
