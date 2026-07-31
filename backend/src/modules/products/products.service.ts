import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductQueryDto, SortBy } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';
import {
  MERCHANDISING_DEFAULT_LIMIT,
  MERCHANDISING_LIMIT_MAX,
  MERCHANDISING_SECTION_CONFIG,
  MerchandisingSection,
  type MerchandisingSettingValue,
} from './merchandising';

const PRODUCT_SELECT = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  isActive: true,
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
  inventory: {
    where: { variantId: null },
    select: { quantity: true, reserved: true },
    take: 1,
  },
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      price: true,
      imageUrl: true,
      color: {
        select: { id: true, name: true, hexCode: true, imageUrl: true },
      },
      size: { select: { id: true, name: true } },
      inventory: { select: { quantity: true, reserved: true } },
    },
  },
} satisfies Prisma.ProductSelect;

function isPrismaErrorCode(error: unknown, code: string) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private parseMerchandisingSetting(
    value: string | undefined,
  ): MerchandisingSettingValue | null {
    if (!value) return null;

    try {
      const parsed = JSON.parse(value) as Partial<MerchandisingSettingValue>;
      const productIds = parsed.productIds;
      const limit = parsed.limit;

      if (
        !Array.isArray(productIds) ||
        !productIds.every((id) => typeof id === 'string' && id.length > 0) ||
        new Set(productIds).size !== productIds.length ||
        productIds.length > MERCHANDISING_LIMIT_MAX ||
        !Number.isInteger(limit) ||
        (limit as number) < 1 ||
        (limit as number) > MERCHANDISING_LIMIT_MAX ||
        productIds.length > (limit as number)
      ) {
        return null;
      }

      return { productIds, limit: limit as number };
    } catch {
      return null;
    }
  }

  private orderProductsByIds<T extends { id: string }>(
    products: T[],
    productIds: string[],
  ) {
    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );
    return productIds
      .map((id) => productsById.get(id))
      .filter((product): product is T => Boolean(product));
  }

  private async getMerchandisingSection(
    section: MerchandisingSection,
    settingValue?: string,
  ) {
    const config = MERCHANDISING_SECTION_CONFIG[section];
    const manualConfig = this.parseMerchandisingSetting(settingValue);

    if (manualConfig) {
      const products =
        manualConfig.productIds.length === 0
          ? []
          : await this.prisma.product.findMany({
              where: {
                id: { in: manualConfig.productIds },
                isActive: true,
              },
              select: PRODUCT_SELECT,
            });

      return {
        products: this.orderProductsByIds(products, manualConfig.productIds),
        limit: manualConfig.limit,
        source: 'manual' as const,
      };
    }

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        [config.flag]: true,
      },
      select: PRODUCT_SELECT,
      orderBy: [{ [config.fallbackSort]: 'desc' }, { updatedAt: 'desc' }],
      take: MERCHANDISING_DEFAULT_LIMIT,
    });

    return {
      products,
      limit: MERCHANDISING_DEFAULT_LIMIT,
      source: 'fallback' as const,
    };
  }

  async getHomeSections() {
    const sections = Object.values(MerchandisingSection);
    const settings = await this.prisma.settings.findMany({
      where: {
        key: {
          in: sections.map(
            (section) => MERCHANDISING_SECTION_CONFIG[section].settingKey,
          ),
        },
      },
      select: { key: true, value: true },
    });
    const settingsByKey = new Map(
      settings.map((setting) => [setting.key, setting.value]),
    );

    const [newArrivals, bestSellers] = await Promise.all(
      sections.map((section) => {
        const config = MERCHANDISING_SECTION_CONFIG[section];
        return this.getMerchandisingSection(
          section,
          settingsByKey.get(config.settingKey),
        );
      }),
    );

    return { newArrivals, bestSellers };
  }

  async updateMerchandisingSection(
    section: MerchandisingSection,
    value: MerchandisingSettingValue,
  ) {
    if (
      !Number.isInteger(value.limit) ||
      value.limit < 1 ||
      value.limit > MERCHANDISING_LIMIT_MAX ||
      value.productIds.length > MERCHANDISING_LIMIT_MAX
    ) {
      throw new BadRequestException('Invalid merchandising section limit');
    }
    const productIds = value.productIds.map((id) => id.trim());
    if (
      new Set(productIds).size !== productIds.length ||
      productIds.some((id) => id.length === 0)
    ) {
      throw new BadRequestException('Product IDs must be unique and non-empty');
    }
    if (productIds.length > value.limit) {
      throw new BadRequestException(
        'The number of products cannot exceed the section limit',
      );
    }

    const config = MERCHANDISING_SECTION_CONFIG[section];
    return this.prisma.$transaction(async (tx) => {
      const products =
        productIds.length === 0
          ? []
          : await tx.product.findMany({
              where: { id: { in: productIds }, isActive: true },
              select: PRODUCT_SELECT,
            });
      const foundIds = new Set(products.map((product) => product.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      if (missingIds.length > 0) {
        throw new BadRequestException(
          `Products are missing or inactive: ${missingIds.join(', ')}`,
        );
      }

      const storedValue: MerchandisingSettingValue = {
        productIds,
        limit: value.limit,
      };
      await tx.settings.upsert({
        where: { key: config.settingKey },
        update: { value: JSON.stringify(storedValue) },
        create: {
          key: config.settingKey,
          value: JSON.stringify(storedValue),
          type: 'json',
          group: 'merchandising',
          label: config.settingLabel,
        },
      });

      return {
        products: this.orderProductsByIds(products, productIds),
        limit: value.limit,
        source: 'manual' as const,
      };
    });
  }

  async removeProductFromMerchandising(productId: string) {
    const sections = Object.values(MerchandisingSection);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        await this.prisma.$transaction(
          async (tx) => {
            const settings = await tx.settings.findMany({
              where: {
                key: {
                  in: sections.map(
                    (section) =>
                      MERCHANDISING_SECTION_CONFIG[section].settingKey,
                  ),
                },
              },
              select: { key: true, value: true },
            });

            for (const setting of settings) {
              const config = this.parseMerchandisingSetting(setting.value);
              if (!config || !config.productIds.includes(productId)) continue;

              await tx.settings.update({
                where: { key: setting.key },
                data: {
                  value: JSON.stringify({
                    ...config,
                    productIds: config.productIds.filter(
                      (id) => id !== productId,
                    ),
                  } satisfies MerchandisingSettingValue),
                },
              });
            }
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
        return;
      } catch (error) {
        if (isPrismaErrorCode(error, 'P2034') && attempt < 2) {
          continue;
        }
        throw error;
      }
    }
  }

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

    const searchTerm = search?.trim();

    // Text search across the product's main searchable fields.
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } },
        { brand: { name: { contains: searchTerm, mode: 'insensitive' } } },
        {
          category: {
            name: { contains: searchTerm, mode: 'insensitive' },
          },
        },
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
      matchCount: total,
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
        inventory: {
          where: { variantId: null },
          select: { quantity: true, reserved: true },
          take: 1,
        },
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
