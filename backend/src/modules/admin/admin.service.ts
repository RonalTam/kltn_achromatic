import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import {
  BannerPosition,
  CouponType,
  Gender,
  OrderStatus,
  Prisma,
  Role,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import {
  MerchandisingSection,
  type MerchandisingSettingValue,
} from '../products/merchandising';
import { ProductsService } from '../products/products.service';
import {
  AdminProductQueryDto,
  AdminProductSortBy,
  AdminProductStatus,
  SortOrder,
} from './dto/admin-product-query.dto';

type AdminListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
};

type AdminProductVariantInput = {
  id?: string;
  sku?: string;
  colorId?: string;
  colorName?: string;
  colorHex?: string;
  sizeId?: string;
  sizeName?: string;
  price?: number | null;
  imageUrl?: string | null;
  quantity?: number;
  threshold?: number;
  location?: string | null;
  isActive?: boolean;
};

type AdminProductPayload = {
  name: string;
  slug?: string;
  sku?: string;
  description: string;
  shortDescription?: string | null;
  categoryId: string;
  subCategoryId?: string | null;
  brandId?: string | null;
  gender?: Gender;
  material?: string | null;
  careInstructions?: string | null;
  basePrice: number;
  comparePrice?: number | null;
  isFeatured?: boolean;
  isActive?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
  images?: string[];
  collectionIds?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  variants?: AdminProductVariantInput[];
};

type AdminCategoryPayload = {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

type AdminCouponPayload = {
  code: string;
  name: string;
  description?: string | null;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usagePerUser?: number;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  applicableCategories?: string[];
};

type AdminBannerPayload = {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  position?: BannerPosition;
  isActive?: boolean;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
};

const PAGE_LIMIT_MAX = 100;
const STORE_TIME_ZONE_OFFSET_MS = 7 * 60 * 60 * 1000;
const MANAGED_SETTING_KEYS = [
  'store_name',
  'store_email',
  'store_phone',
  'store_address',
  'currency',
  'free_shipping_threshold',
  'order_prefix',
] as const;

function storeDateKey(date: Date) {
  return new Date(date.getTime() + STORE_TIME_ZONE_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

function startOfStoreDay(date: Date) {
  const shifted = new Date(date.getTime() + STORE_TIME_ZONE_OFFSET_MS);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ) - STORE_TIME_ZONE_OFFSET_MS,
  );
}

function startOfStoreMonth(date: Date, monthOffset = 0) {
  const shifted = new Date(date.getTime() + STORE_TIME_ZONE_OFFSET_MS);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + monthOffset, 1) -
      STORE_TIME_ZONE_OFFSET_MS,
  );
}

@Injectable()
export class AdminService {
  private readonly localProductImagePublicPath = '/product-images';

  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
    private productsService: ProductsService,
  ) {}

  private getPaging(query: AdminListQuery) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(query.limit) || 10, 1),
      PAGE_LIMIT_MAX,
    );
    return { page, limit, skip: (page - 1) * limit };
  }

  private slugify(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  private skuFromName(name: string) {
    const token =
      this.slugify(name).replace(/-/g, '').slice(0, 8).toUpperCase() || 'ITEM';
    return `ACH-${token}-${Date.now().toString(36).toUpperCase()}`;
  }

  private validateProductPayload(
    payload: Partial<AdminProductPayload>,
    options: {
      requireRequiredFields: boolean;
      currentBasePrice?: number;
      currentComparePrice?: number | null;
    },
  ) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new BadRequestException('Product payload must be an object');
    }
    const requireNonEmptyString = (key: keyof AdminProductPayload) => {
      const value = payload[key];
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new BadRequestException(
          `${String(key)} must be a non-empty string`,
        );
      }
    };

    if (options.requireRequiredFields) {
      for (const key of ['name', 'description', 'categoryId'] as const) {
        requireNonEmptyString(key);
      }
      if (payload.basePrice === undefined) {
        throw new BadRequestException('basePrice is required');
      }
    } else {
      for (const key of ['name', 'description', 'categoryId'] as const) {
        if (payload[key] !== undefined) requireNonEmptyString(key);
      }
    }

    for (const key of ['slug', 'sku'] as const) {
      const value = payload[key];
      if (value !== undefined && typeof value !== 'string') {
        throw new BadRequestException(`${key} must be a string`);
      }
    }
    for (const key of ['subCategoryId', 'brandId'] as const) {
      const value = payload[key];
      if (
        value !== undefined &&
        value !== null &&
        (typeof value !== 'string' || value.trim().length === 0)
      ) {
        throw new BadRequestException(
          `${key} must be null or a non-empty string`,
        );
      }
    }
    for (const key of [
      'isFeatured',
      'isActive',
      'isNewArrival',
      'isBestSeller',
    ] as const) {
      const value = payload[key];
      if (value !== undefined && typeof value !== 'boolean') {
        throw new BadRequestException(`${key} must be a boolean`);
      }
    }
    if (
      payload.gender !== undefined &&
      !Object.values(Gender).includes(payload.gender)
    ) {
      throw new BadRequestException('gender is invalid');
    }

    if (
      payload.basePrice !== undefined &&
      (typeof payload.basePrice !== 'number' ||
        !Number.isFinite(payload.basePrice) ||
        payload.basePrice <= 0)
    ) {
      throw new BadRequestException('basePrice must be a positive number');
    }
    if (
      payload.comparePrice !== undefined &&
      payload.comparePrice !== null &&
      (typeof payload.comparePrice !== 'number' ||
        !Number.isFinite(payload.comparePrice) ||
        payload.comparePrice < 0)
    ) {
      throw new BadRequestException(
        'comparePrice must be null or a non-negative number',
      );
    }

    const effectiveBasePrice =
      payload.basePrice ?? options.currentBasePrice ?? 0;
    const effectiveComparePrice =
      payload.comparePrice !== undefined
        ? payload.comparePrice
        : options.currentComparePrice;
    if (
      effectiveComparePrice !== undefined &&
      effectiveComparePrice !== null &&
      effectiveComparePrice < effectiveBasePrice
    ) {
      throw new BadRequestException(
        'comparePrice cannot be lower than basePrice',
      );
    }

    for (const key of ['tags', 'images', 'collectionIds'] as const) {
      const value = payload[key];
      if (
        value !== undefined &&
        (!Array.isArray(value) ||
          !value.every((item) => typeof item === 'string'))
      ) {
        throw new BadRequestException(`${key} must be an array of strings`);
      }
    }
    if (payload.variants !== undefined && !Array.isArray(payload.variants)) {
      throw new BadRequestException('variants must be an array');
    }
    for (const variant of payload.variants ?? []) {
      if (!variant || typeof variant !== 'object') {
        throw new BadRequestException('Each variant must be an object');
      }
      for (const key of ['id', 'sku', 'colorId', 'sizeId'] as const) {
        const value = variant[key];
        if (
          value !== undefined &&
          (typeof value !== 'string' || value.trim().length === 0)
        ) {
          throw new BadRequestException(
            `Variant ${key} must be a non-empty string`,
          );
        }
      }
      if (
        variant.price !== undefined &&
        variant.price !== null &&
        (typeof variant.price !== 'number' ||
          !Number.isFinite(variant.price) ||
          variant.price < 0)
      ) {
        throw new BadRequestException(
          'Variant price must be null or a non-negative number',
        );
      }
      for (const [key, value] of [
        ['quantity', variant.quantity],
        ['threshold', variant.threshold],
      ] as const) {
        if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
          throw new BadRequestException(
            `Variant ${key} must be a non-negative integer`,
          );
        }
      }
    }
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = startOfStoreDay(now);
    const startOfMonth = startOfStoreMonth(now);
    const startOfLastMonth = startOfStoreMonth(now, -1);

    const [
      totalUsers,
      newUsersToday,
      totalOrders,
      ordersToday,
      totalProducts,
      activeProducts,
      pendingOrders,
      lowStockInventory,
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.CUSTOMER } }),
      this.prisma.user.count({
        where: { role: Role.CUSTOMER, createdAt: { gte: startOfToday } },
      }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.inventory.findMany({
        where: { product: { isActive: true } },
        select: {
          productId: true,
          quantity: true,
          reserved: true,
          threshold: true,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
          OR: [
            { deliveredAt: { gte: startOfMonth } },
            { deliveredAt: null, createdAt: { gte: startOfMonth } },
          ],
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
          OR: [
            {
              deliveredAt: { gte: startOfLastMonth, lt: startOfMonth },
            },
            {
              deliveredAt: null,
              createdAt: { gte: startOfLastMonth, lt: startOfMonth },
            },
          ],
        },
        _sum: { total: true },
      }),
    ]);

    const monthRevenueVal = Number(monthRevenue._sum.total || 0);
    const lastMonthRevenueVal = Number(lastMonthRevenue._sum.total || 0);
    const lowStockProducts = new Set(
      lowStockInventory
        .filter(
          (inventory) =>
            inventory.quantity - inventory.reserved <= inventory.threshold,
        )
        .map((inventory) => inventory.productId),
    ).size;
    const revenueGrowth =
      lastMonthRevenueVal > 0
        ? ((monthRevenueVal - lastMonthRevenueVal) / lastMonthRevenueVal) * 100
        : 0;

    return {
      users: { total: totalUsers, newToday: newUsersToday },
      orders: {
        total: totalOrders,
        today: ordersToday,
        pending: pendingOrders,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts,
      },
      revenue: {
        total: Number(totalRevenue._sum.total || 0),
        thisMonth: monthRevenueVal,
        lastMonth: lastMonthRevenueVal,
        growth: Math.round(revenueGrowth * 100) / 100,
      },
    };
  }

  async getRevenueChart(days = 30) {
    const parsedDays = Math.trunc(Number(days));
    const safeDays = Math.min(
      Math.max(Number.isFinite(parsedDays) ? parsedDays : 30, 1),
      365,
    );
    const today = new Date();
    const startDate = startOfStoreDay(today);
    startDate.setUTCDate(startDate.getUTCDate() - (safeDays - 1));

    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        OR: [
          { deliveredAt: { gte: startDate } },
          { deliveredAt: null, createdAt: { gte: startDate } },
        ],
      },
      select: { total: true, deliveredAt: true, createdAt: true },
      orderBy: { deliveredAt: 'asc' },
    });

    const dailyMap = new Map<string, number>();
    orders.forEach((order) => {
      const day = storeDateKey(order.deliveredAt ?? order.createdAt);
      const amount = Number(order.total);
      if (Number.isFinite(amount) && amount > 0) {
        dailyMap.set(day, (dailyMap.get(day) || 0) + amount);
      }
    });

    return Array.from({ length: safeDays }, (_, index) => {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + index);
      const key = storeDateKey(date);
      return { date: key, revenue: dailyMap.get(key) || 0 };
    });
  }

  async getTopProducts(limit = 10) {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        isActive: true,
        soldCount: true,
        basePrice: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
      orderBy: { soldCount: 'desc' },
      take: limit,
    });
  }

  async getReports(days = 30) {
    const [revenue, topProducts, statusBreakdown] = await Promise.all([
      this.getRevenueChart(days),
      this.getTopProducts(8),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { total: true },
      }),
    ]);

    return { revenue, topProducts, statusBreakdown };
  }

  async getProductOptions() {
    const [categories, brands, colors, sizes, collections] = await Promise.all([
      this.prisma.category.findMany({
        include: {
          subCategories: {
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.brand.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.productColor.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.productSize.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.collection.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
    ]);

    return { categories, brands, colors, sizes, collections };
  }

  getMerchandising() {
    return this.productsService.getHomeSections();
  }

  updateMerchandising(
    section: MerchandisingSection,
    value: MerchandisingSettingValue,
  ) {
    return this.productsService.updateMerchandisingSection(section, value);
  }

  async listProducts(query: AdminProductQueryDto) {
    const { page, limit, skip } = this.getPaging(query);
    const where: Prisma.ProductWhereInput = {};

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        {
          variants: {
            some: { sku: { contains: search, mode: 'insensitive' } },
          },
        },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        {
          subCategory: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.subCategoryId) where.subCategoryId = query.subCategoryId;
    if (query.brandId) where.brandId = query.brandId;
    if (query.gender) where.gender = query.gender;
    if (query.featured !== undefined) where.isFeatured = query.featured;
    if (query.newArrival !== undefined) where.isNewArrival = query.newArrival;
    if (query.bestSeller !== undefined) where.isBestSeller = query.bestSeller;
    if (query.status === AdminProductStatus.ACTIVE) where.isActive = true;
    if (query.status === AdminProductStatus.HIDDEN) where.isActive = false;

    const sortBy = query.sortBy || AdminProductSortBy.UPDATED_AT;
    const sortOrder = query.sortOrder || SortOrder.DESC;
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          subCategory: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
          inventory: {
            where: { variantId: null },
            select: {
              id: true,
              quantity: true,
              reserved: true,
              threshold: true,
              location: true,
            },
          },
          variants: {
            include: {
              color: true,
              size: true,
              inventory: {
                select: {
                  id: true,
                  quantity: true,
                  reserved: true,
                  threshold: true,
                },
              },
            },
          },
          _count: { select: { orderItems: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        inventory: { where: { variantId: null } },
        variants: {
          include: {
            color: true,
            size: true,
            inventory: true,
          },
          orderBy: { sku: 'asc' },
        },
        specifications: { orderBy: { sortOrder: 'asc' } },
        collections: { include: { collection: true } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(payload: AdminProductPayload) {
    this.validateProductPayload(payload, { requireRequiredFields: true });

    const slug = payload.slug?.trim() || this.slugify(payload.name);
    const sku = payload.sku?.trim() || this.skuFromName(payload.name);

    const productId = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: payload.name,
          slug,
          sku,
          description: payload.description,
          shortDescription: payload.shortDescription,
          categoryId: payload.categoryId,
          subCategoryId: payload.subCategoryId || undefined,
          brandId: payload.brandId || undefined,
          gender: payload.gender || Gender.UNISEX,
          material: payload.material,
          careInstructions: payload.careInstructions,
          basePrice: payload.basePrice,
          comparePrice: payload.comparePrice,
          isFeatured: payload.isFeatured ?? false,
          isActive: payload.isActive ?? true,
          isNewArrival: payload.isNewArrival ?? false,
          isBestSeller: payload.isBestSeller ?? false,
          tags: payload.tags || [],
          metaTitle: payload.metaTitle || `${payload.name} | Achromatic`,
          metaDescription:
            payload.metaDescription ||
            payload.shortDescription ||
            payload.description.slice(0, 150),
        },
      });

      await this.replaceProductImages(
        tx,
        product.id,
        payload.images || [],
        product.name,
      );
      await this.upsertProductVariants(
        tx,
        product.id,
        sku,
        payload.variants || [],
      );
      if (payload.collectionIds) {
        await this.replaceProductCollections(
          tx,
          product.id,
          payload.collectionIds,
        );
      }

      return product.id;
    });

    return this.getProduct(productId);
  }

  async saveLocalProductImages(files: Express.Multer.File[]) {
    const uploadDir = this.getLocalProductImageDir();
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      const filename = this.localProductImageFilename(file.originalname);
      await writeFile(path.join(uploadDir, filename), file.buffer);
      urls.push(`${this.localProductImagePublicPath}/${filename}`);
    }

    return {
      urls,
      folder: 'frontend/public/product-images',
    };
  }

  async updateProduct(id: string, payload: Partial<AdminProductPayload>) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    this.validateProductPayload(payload, {
      requireRequiredFields: false,
      currentBasePrice: Number(product.basePrice),
      currentComparePrice:
        product.comparePrice === null ? null : Number(product.comparePrice),
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(payload.name !== undefined ? { name: payload.name } : {}),
          ...(payload.slug !== undefined
            ? {
                slug:
                  payload.slug || this.slugify(payload.name || product.name),
              }
            : {}),
          ...(payload.sku !== undefined
            ? { sku: payload.sku.trim() || product.sku }
            : {}),
          ...(payload.description !== undefined
            ? { description: payload.description }
            : {}),
          ...(payload.shortDescription !== undefined
            ? { shortDescription: payload.shortDescription }
            : {}),
          ...(payload.categoryId !== undefined
            ? { categoryId: payload.categoryId }
            : {}),
          ...(payload.subCategoryId !== undefined
            ? { subCategoryId: payload.subCategoryId || null }
            : {}),
          ...(payload.brandId !== undefined
            ? { brandId: payload.brandId || null }
            : {}),
          ...(payload.gender !== undefined ? { gender: payload.gender } : {}),
          ...(payload.material !== undefined
            ? { material: payload.material }
            : {}),
          ...(payload.careInstructions !== undefined
            ? { careInstructions: payload.careInstructions }
            : {}),
          ...(payload.basePrice !== undefined
            ? { basePrice: payload.basePrice }
            : {}),
          ...(payload.comparePrice !== undefined
            ? { comparePrice: payload.comparePrice }
            : {}),
          ...(payload.isFeatured !== undefined
            ? { isFeatured: payload.isFeatured }
            : {}),
          ...(payload.isActive !== undefined
            ? { isActive: payload.isActive }
            : {}),
          ...(payload.isNewArrival !== undefined
            ? { isNewArrival: payload.isNewArrival }
            : {}),
          ...(payload.isBestSeller !== undefined
            ? { isBestSeller: payload.isBestSeller }
            : {}),
          ...(payload.tags !== undefined ? { tags: payload.tags } : {}),
          ...(payload.metaTitle !== undefined
            ? { metaTitle: payload.metaTitle || null }
            : {}),
          ...(payload.metaDescription !== undefined
            ? { metaDescription: payload.metaDescription || null }
            : {}),
          ...(payload.name || payload.shortDescription || payload.description
            ? {
                ...(payload.metaTitle === undefined
                  ? {
                      metaTitle: `${payload.name || product.name} | Achromatic`,
                    }
                  : {}),
                ...(payload.metaDescription === undefined
                  ? {
                      metaDescription:
                        payload.shortDescription ||
                        payload.description?.slice(0, 150) ||
                        product.metaDescription,
                    }
                  : {}),
              }
            : {}),
        },
      });

      if (payload.images)
        await this.replaceProductImages(
          tx,
          id,
          payload.images,
          payload.name || product.name,
        );
      if (payload.variants)
        await this.upsertProductVariants(
          tx,
          id,
          payload.sku || product.sku,
          payload.variants,
        );
      if (payload.collectionIds)
        await this.replaceProductCollections(tx, id, payload.collectionIds);
    });

    if (payload.isActive === false) {
      await this.productsService.removeProductFromMerchandising(id);
    }

    return this.getProduct(id);
  }

  async toggleProduct(id: string, isActive: boolean) {
    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive },
    });
    if (!isActive) {
      await this.productsService.removeProductFromMerchandising(id);
    }
    return product;
  }

  async removeProduct(id: string) {
    // Find the product first
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Check for active orders containing this product's variants
    const activeOrderItems = await this.prisma.orderItem.findMany({
      where: {
        productId: id,
        order: {
          status: {
            in: ['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPING'],
          },
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });

    if (activeOrderItems.length > 0) {
      // Deduplicate orders
      const uniqueOrders = Array.from(
        new Map(
          activeOrderItems.map((item) => [item.order.id, item.order]),
        ).values(),
      );
      const orderNumbers = uniqueOrders
        .map((o) => `#${o.orderNumber} (${o.status})`)
        .join(', ');

      throw new ConflictException(
        `Không thể xóa sản phẩm "${product.name}" vì đang có ${
          uniqueOrders.length
        } đơn hàng chưa hoàn thành: ${orderNumbers}. ` +
          `Vui lòng chờ các đơn hàng này hoàn tất hoặc hủy trước khi xóa sản phẩm.`,
      );
    }

    // Safe to soft-delete
    return this.toggleProduct(id, false);
  }

  private async replaceProductImages(
    tx: Prisma.TransactionClient,
    productId: string,
    images: string[],
    productName: string,
  ) {
    await tx.productImage.deleteMany({ where: { productId } });
    if (images.length === 0) return;

    await tx.productImage.createMany({
      data: images.filter(Boolean).map((url, index) => ({
        productId,
        url,
        altText: index === 0 ? productName : `${productName} ${index + 1}`,
        isPrimary: index === 0,
        sortOrder: index,
      })),
    });
  }

  private async replaceProductCollections(
    tx: Prisma.TransactionClient,
    productId: string,
    collectionIds: string[],
  ) {
    await tx.collectionProduct.deleteMany({ where: { productId } });
    const uniqueIds = Array.from(new Set(collectionIds.filter(Boolean)));
    if (uniqueIds.length === 0) return;

    await tx.collectionProduct.createMany({
      data: uniqueIds.map((collectionId, index) => ({
        productId,
        collectionId,
        sortOrder: index,
      })),
      skipDuplicates: true,
    });
  }

  private getLocalProductImageDir() {
    const workspaceRoot =
      path.basename(process.cwd()) === 'backend'
        ? path.resolve(process.cwd(), '..')
        : process.cwd();

    return path.join(workspaceRoot, 'frontend', 'public', 'product-images');
  }

  private localProductImageFilename(originalName: string) {
    const parsed = path.parse(originalName);
    const ext = parsed.ext.toLowerCase() || '.jpg';
    const base =
      parsed.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'product-image';
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return `${base}-${suffix}${ext}`;
  }

  private async upsertProductVariants(
    tx: Prisma.TransactionClient,
    productId: string,
    productSku: string,
    variants: AdminProductVariantInput[],
  ) {
    const keptVariantIds = variants
      .map((item) => item.id)
      .filter((id): id is string => Boolean(id));
    if (new Set(keptVariantIds).size !== keptVariantIds.length) {
      throw new BadRequestException('Duplicate variant IDs are not allowed');
    }

    const preparedVariants: Array<
      Omit<AdminProductVariantInput, 'sku' | 'colorId' | 'sizeId'> & {
        sku: string;
        colorId: string | null;
        sizeId: string | null;
      }
    > = [];
    for (const [index, item] of variants.entries()) {
      if (item.id && item.quantity !== undefined) {
        throw new BadRequestException(
          'Existing variant quantity must be changed through inventory adjustment',
        );
      }
      if (
        item.quantity !== undefined &&
        (!Number.isInteger(item.quantity) || item.quantity < 0)
      ) {
        throw new BadRequestException(
          'Variant inventory quantity must be a non-negative integer',
        );
      }
      if (
        item.threshold !== undefined &&
        (!Number.isInteger(item.threshold) || item.threshold < 0)
      ) {
        throw new BadRequestException(
          'Variant inventory threshold must be a non-negative integer',
        );
      }
      const colorId =
        item.colorId ||
        (item.colorName
          ? await this.ensureColor(tx, item.colorName, item.colorHex)
          : null);
      const sizeId =
        item.sizeId ||
        (item.sizeName ? await this.ensureSize(tx, item.sizeName) : null);
      const sku = item.sku?.trim() || `${productSku}-${index + 1}`;
      preparedVariants.push({ ...item, sku, colorId, sizeId });
    }

    const normalizedSkus = preparedVariants.map((item) =>
      item.sku.toLocaleUpperCase(),
    );
    if (new Set(normalizedSkus).size !== normalizedSkus.length) {
      throw new BadRequestException('Duplicate variant SKUs are not allowed');
    }

    const combinations = preparedVariants.map(
      (item) => `${item.colorId ?? '<none>'}:${item.sizeId ?? '<none>'}`,
    );
    if (new Set(combinations).size !== combinations.length) {
      throw new BadRequestException(
        'Duplicate color and size combinations are not allowed',
      );
    }

    if (keptVariantIds.length > 0) {
      const existingById = await tx.productVariant.findMany({
        where: { id: { in: keptVariantIds } },
        select: { id: true, productId: true },
      });
      const existingByIdMap = new Map(
        existingById.map((variant) => [variant.id, variant]),
      );
      for (const variantId of keptVariantIds) {
        const existing = existingByIdMap.get(variantId);
        if (!existing) {
          throw new BadRequestException(`Variant does not exist: ${variantId}`);
        }
        if (existing.productId !== productId) {
          throw new BadRequestException(
            `Variant does not belong to this product: ${variantId}`,
          );
        }
      }
    }

    if (preparedVariants.length > 0) {
      const existingBySku = await tx.productVariant.findMany({
        where: {
          OR: preparedVariants.map((item) => ({
            sku: { equals: item.sku, mode: 'insensitive' as const },
          })),
        },
        select: { id: true, sku: true },
      });
      for (const item of preparedVariants) {
        const normalizedSku = item.sku.toLocaleUpperCase();
        const conflictingVariant = existingBySku.find(
          (variant) =>
            variant.sku.toLocaleUpperCase() === normalizedSku &&
            variant.id !== item.id,
        );
        if (conflictingVariant) {
          throw new ConflictException(
            `Variant SKU already belongs to another variant: ${item.sku}`,
          );
        }
      }
    }

    const removedVariants = await tx.productVariant.findMany({
      where: {
        productId,
        ...(keptVariantIds.length > 0 ? { id: { notIn: keptVariantIds } } : {}),
      },
      select: { id: true, colorId: true, sizeId: true },
    });

    for (const removed of removedVariants) {
      const [orderItems, cartItems, inventory] = await Promise.all([
        tx.orderItem.count({ where: { variantId: removed.id } }),
        tx.cartItem.count({ where: { variantId: removed.id } }),
        tx.inventory.findFirst({
          where: { variantId: removed.id },
          select: {
            quantity: true,
            reserved: true,
            _count: { select: { transactions: true } },
          },
        }),
      ]);

      const mustRetain =
        orderItems > 0 ||
        cartItems > 0 ||
        Boolean(
          inventory &&
          (inventory.quantity !== 0 ||
            inventory.reserved !== 0 ||
            inventory._count.transactions > 0),
        );
      if (mustRetain) {
        const removedCombination = `${removed.colorId ?? '<none>'}:${removed.sizeId ?? '<none>'}`;
        const duplicatesRetainedCombination = preparedVariants.some(
          (item) =>
            `${item.colorId ?? '<none>'}:${item.sizeId ?? '<none>'}` ===
            removedCombination,
        );
        if (duplicatesRetainedCombination) {
          throw new BadRequestException(
            'Cannot reuse the color and size of a referenced variant without keeping its ID',
          );
        }
        await tx.productVariant.update({
          where: { id: removed.id },
          data: { isActive: false },
        });
      } else {
        await tx.inventory.deleteMany({ where: { variantId: removed.id } });
        await tx.productVariant.delete({ where: { id: removed.id } });
      }
    }

    for (const item of preparedVariants) {
      const variant = item.id
        ? await tx.productVariant.update({
            where: { id: item.id },
            data: {
              sku: item.sku,
              colorId: item.colorId,
              sizeId: item.sizeId,
              price: item.price ?? null,
              imageUrl: item.imageUrl,
              isActive: item.isActive ?? true,
            },
          })
        : await tx.productVariant.create({
            data: {
              productId,
              sku: item.sku,
              colorId: item.colorId,
              sizeId: item.sizeId,
              price: item.price ?? null,
              imageUrl: item.imageUrl,
              isActive: item.isActive ?? true,
            },
          });

      if (
        item.quantity !== undefined ||
        item.threshold !== undefined ||
        item.location !== undefined
      ) {
        const inventory = await tx.inventory.upsert({
          where: { productId_variantId: { productId, variantId: variant.id } },
          update: {
            ...(item.quantity !== undefined ? { quantity: item.quantity } : {}),
            ...(item.threshold !== undefined
              ? { threshold: item.threshold }
              : {}),
            ...(item.location !== undefined ? { location: item.location } : {}),
          },
          create: {
            productId,
            variantId: variant.id,
            quantity: item.quantity ?? 0,
            threshold: item.threshold ?? 5,
            location: item.location,
          },
        });
        const initialQuantity = item.id ? 0 : (item.quantity ?? 0);
        if (initialQuantity > 0) {
          await tx.inventoryTransaction.create({
            data: {
              inventoryId: inventory.id,
              type: TransactionType.ADJUSTMENT,
              quantity: initialQuantity,
              previousQty: 0,
              newQty: initialQuantity,
              reason: 'Initial stock for new product variant',
            },
          });
        }
      }
    }
  }

  private async ensureColor(
    tx: Prisma.TransactionClient,
    name: string,
    hexCode?: string,
  ) {
    const color = await tx.productColor.upsert({
      where: { name },
      update: { hexCode: hexCode || '#111111' },
      create: { name, hexCode: hexCode || '#111111' },
    });
    return color.id;
  }

  private async ensureSize(tx: Prisma.TransactionClient, name: string) {
    const size = await tx.productSize.upsert({
      where: { name },
      update: {},
      create: { name, sortOrder: 99 },
    });
    return size.id;
  }

  async listCategories(query: AdminListQuery) {
    const { page, limit, skip } = this.getPaging(query);
    const where: Prisma.CategoryWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};
    const [total, data] = await Promise.all([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createCategory(payload: AdminCategoryPayload) {
    return this.prisma.category.create({
      data: {
        name: payload.name,
        slug: payload.slug || this.slugify(payload.name),
        description: payload.description,
        imageUrl: payload.imageUrl,
        isActive: payload.isActive ?? true,
        sortOrder: payload.sortOrder ?? 0,
      },
    });
  }

  async updateCategory(id: string, payload: Partial<AdminCategoryPayload>) {
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.slug !== undefined
          ? { slug: payload.slug || this.slugify(payload.name || '') }
          : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
        ...(payload.imageUrl !== undefined
          ? { imageUrl: payload.imageUrl }
          : {}),
        ...(payload.isActive !== undefined
          ? { isActive: payload.isActive }
          : {}),
        ...(payload.sortOrder !== undefined
          ? { sortOrder: payload.sortOrder }
          : {}),
      },
    });
  }

  async removeCategory(id: string) {
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async listOrders(query: AdminListQuery) {
    const { page, limit, skip } = this.getPaging(query);
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status as OrderStatus;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        {
          user: { firstName: { contains: query.search, mode: 'insensitive' } },
        },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          items: { select: { quantity: true } },
          payment: { select: { method: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: { include: { color: true, size: true } },
          },
        },
        payment: true,
        shippingMethod: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    note?: string,
    changedBy?: string,
  ) {
    return this.ordersService.updateStatus(id, status, note, changedBy);
  }

  async listCustomers(query: AdminListQuery) {
    const { page, limit, skip } = this.getPaging(query);
    const where: Prisma.UserWhereInput = { role: Role.CUSTOMER };
    if (query.status === 'active') where.isActive = true;
    if (query.status === 'locked') where.isActive = false;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          createdAt: true,
          orders: { select: { total: true } },
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: data.map((customer) => ({
        ...customer,
        totalSpent: customer.orders.reduce(
          (sum, order) => sum + Number(order.total),
          0,
        ),
        orders: undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCustomer(id: string) {
    const customer = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        addresses: true,
        orders: {
          include: {
            items: {
              select: { productName: true, quantity: true, totalPrice: true },
            },
            payment: { select: { method: true, status: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async setCustomerActive(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.CUSTOMER) {
      throw new ForbiddenException('Cannot modify active status of non-customer accounts');
    }
    return this.prisma.user.update({ where: { id }, data: { isActive } });
  }

  async listInventory(query: AdminListQuery) {
    const { page, limit, skip } = this.getPaging(query);
    const where: Prisma.InventoryWhereInput = {};
    if (query.search) {
      where.OR = [
        { product: { name: { contains: query.search, mode: 'insensitive' } } },
        { product: { sku: { contains: query.search, mode: 'insensitive' } } },
        { variant: { sku: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.status === 'low') {
      const inventoryLevels = await this.prisma.inventory.findMany({
        select: {
          id: true,
          quantity: true,
          reserved: true,
          threshold: true,
        },
      });
      where.id = {
        in: inventoryLevels
          .filter(
            (inventory) =>
              inventory.quantity - inventory.reserved <= inventory.threshold,
          )
          .map((inventory) => inventory.id),
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.inventory.count({ where }),
      this.prisma.inventory.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
          variant: { include: { color: true, size: true } },
        },
        orderBy: { quantity: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async adjustInventory(
    id: string,
    quantity: number,
    reason: string,
    performedBy: string,
  ) {
    if (!Number.isInteger(quantity) || quantity === 0) {
      throw new BadRequestException(
        'Inventory adjustment must be a non-zero integer',
      );
    }
    const normalizedReason = typeof reason === 'string' ? reason.trim() : '';
    if (!normalizedReason) {
      throw new BadRequestException('Inventory adjustment reason is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { id } });
      if (!inventory) throw new NotFoundException('Inventory not found');

      const previousQty = inventory.quantity;
      const newQty = previousQty + quantity;
      if (newQty < inventory.reserved) {
        throw new BadRequestException(
          `Inventory quantity cannot be lower than its reserved quantity (${inventory.reserved})`,
        );
      }

      const write = await tx.inventory.updateMany({
        where: {
          id,
          quantity: previousQty,
          reserved: { lte: newQty },
        },
        data: { quantity: { increment: quantity } },
      });
      if (write.count !== 1) {
        throw new BadRequestException(
          'Inventory changed concurrently. Please reload and try again.',
        );
      }
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: id,
          type: TransactionType.ADJUSTMENT,
          quantity: Math.abs(quantity),
          previousQty,
          newQty,
          reason: normalizedReason,
          performedBy,
        },
      });
      return tx.inventory.findUniqueOrThrow({ where: { id } });
    });
  }

  async listCoupons(query: AdminListQuery) {
    const { page, limit, skip } = this.getPaging(query);
    const where: Prisma.CouponWhereInput = {};
    if (query.status === 'active') where.isActive = true;
    if (query.status === 'hidden') where.isActive = false;
    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.coupon.count({ where }),
      this.prisma.coupon.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createCoupon(payload: AdminCouponPayload) {
    // Validate value for non-FREE_SHIPPING types
    if (payload.type !== CouponType.FREE_SHIPPING && (typeof payload.value !== 'number' || payload.value <= 0)) {
      throw new BadRequestException('Coupon value must be a positive number for this discount type');
    }
    if (payload.type === CouponType.PERCENTAGE && payload.value > 100) {
      throw new BadRequestException('Percentage coupon value cannot exceed 100');
    }
    if (typeof payload.usagePerUser === 'number' && (!Number.isInteger(payload.usagePerUser) || payload.usagePerUser < 1)) {
      throw new BadRequestException('usagePerUser must be a positive integer');
    }
    if (payload.startsAt && payload.expiresAt) {
      const starts = new Date(payload.startsAt);
      const expires = new Date(payload.expiresAt);
      if (isNaN(starts.getTime()) || isNaN(expires.getTime())) {
        throw new BadRequestException('Invalid date format for startsAt or expiresAt');
      }
      if (expires <= starts) {
        throw new BadRequestException('expiresAt must be after startsAt');
      }
    }
    if (payload.expiresAt && !payload.startsAt) {
      const expires = new Date(payload.expiresAt);
      if (isNaN(expires.getTime())) {
        throw new BadRequestException('Invalid date format for expiresAt');
      }
    }
    return this.prisma.coupon.create({
      data: {
        code: payload.code.toUpperCase(),
        name: payload.name,
        description: payload.description,
        type: payload.type,
        value: payload.value,
        minOrderAmount: payload.minOrderAmount,
        maxDiscount: payload.maxDiscount,
        usageLimit: payload.usageLimit,
        usagePerUser: payload.usagePerUser ?? 1,
        isActive: payload.isActive ?? true,
        startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
        expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
        applicableCategories: payload.applicableCategories || [],
      },
    });
  }

  async updateCoupon(id: string, payload: Partial<AdminCouponPayload>) {
    if (payload.type !== undefined && payload.value !== undefined) {
      if (payload.type !== CouponType.FREE_SHIPPING && (typeof payload.value !== 'number' || payload.value <= 0)) {
        throw new BadRequestException('Coupon value must be a positive number for this discount type');
      }
      if (payload.type === CouponType.PERCENTAGE && payload.value > 100) {
        throw new BadRequestException('Percentage coupon value cannot exceed 100');
      }
    } else if (payload.value !== undefined && payload.value !== null) {
      // Only value is being updated — fetch current type to validate
      const current = await this.prisma.coupon.findUnique({ where: { id }, select: { type: true } });
      if (current && current.type !== CouponType.FREE_SHIPPING && payload.value <= 0) {
        throw new BadRequestException('Coupon value must be a positive number');
      }
      if (current && current.type === CouponType.PERCENTAGE && payload.value > 100) {
        throw new BadRequestException('Percentage coupon value cannot exceed 100');
      }
    }
    if (payload.usagePerUser !== undefined && (!Number.isInteger(payload.usagePerUser) || payload.usagePerUser < 1)) {
      throw new BadRequestException('usagePerUser must be a positive integer');
    }
    if (payload.startsAt !== undefined && payload.expiresAt !== undefined && payload.startsAt && payload.expiresAt) {
      const starts = new Date(payload.startsAt);
      const expires = new Date(payload.expiresAt);
      if (!isNaN(starts.getTime()) && !isNaN(expires.getTime()) && expires <= starts) {
        throw new BadRequestException('expiresAt must be after startsAt');
      }
    }
    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(payload.code !== undefined
          ? { code: payload.code.toUpperCase() }
          : {}),
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
        ...(payload.type !== undefined ? { type: payload.type } : {}),
        ...(payload.value !== undefined ? { value: payload.value } : {}),
        ...(payload.minOrderAmount !== undefined
          ? { minOrderAmount: payload.minOrderAmount }
          : {}),
        ...(payload.maxDiscount !== undefined
          ? { maxDiscount: payload.maxDiscount }
          : {}),
        ...(payload.usageLimit !== undefined
          ? { usageLimit: payload.usageLimit }
          : {}),
        ...(payload.usagePerUser !== undefined
          ? { usagePerUser: payload.usagePerUser }
          : {}),
        ...(payload.isActive !== undefined
          ? { isActive: payload.isActive }
          : {}),
        ...(payload.startsAt !== undefined
          ? { startsAt: payload.startsAt ? new Date(payload.startsAt) : null }
          : {}),
        ...(payload.expiresAt !== undefined
          ? {
              expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
            }
          : {}),
        ...(payload.applicableCategories !== undefined
          ? { applicableCategories: payload.applicableCategories }
          : {}),
      },
    });
  }

  async removeCoupon(id: string) {
    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async listBanners(query: AdminListQuery) {
    const { page, limit, skip } = this.getPaging(query);
    const where: Prisma.BannerWhereInput = {};
    if (query.status === 'active') where.isActive = true;
    if (query.status === 'hidden') where.isActive = false;
    if (query.search)
      where.title = { contains: query.search, mode: 'insensitive' };

    const [total, data] = await Promise.all([
      this.prisma.banner.count({ where }),
      this.prisma.banner.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createBanner(payload: AdminBannerPayload) {
    return this.prisma.banner.create({
      data: {
        title: payload.title,
        subtitle: payload.subtitle,
        imageUrl: payload.imageUrl,
        mobileImageUrl: payload.mobileImageUrl,
        linkUrl: payload.linkUrl,
        linkText: payload.linkText,
        position: payload.position || BannerPosition.HERO,
        isActive: payload.isActive ?? true,
        sortOrder: payload.sortOrder ?? 0,
        startsAt: payload.startsAt ? new Date(payload.startsAt) : null,
        endsAt: payload.endsAt ? new Date(payload.endsAt) : null,
      },
    });
  }

  async updateBanner(id: string, payload: Partial<AdminBannerPayload>) {
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.subtitle !== undefined
          ? { subtitle: payload.subtitle }
          : {}),
        ...(payload.imageUrl !== undefined
          ? { imageUrl: payload.imageUrl }
          : {}),
        ...(payload.mobileImageUrl !== undefined
          ? { mobileImageUrl: payload.mobileImageUrl }
          : {}),
        ...(payload.linkUrl !== undefined ? { linkUrl: payload.linkUrl } : {}),
        ...(payload.linkText !== undefined
          ? { linkText: payload.linkText }
          : {}),
        ...(payload.position !== undefined
          ? { position: payload.position }
          : {}),
        ...(payload.isActive !== undefined
          ? { isActive: payload.isActive }
          : {}),
        ...(payload.sortOrder !== undefined
          ? { sortOrder: payload.sortOrder }
          : {}),
        ...(payload.startsAt !== undefined
          ? { startsAt: payload.startsAt ? new Date(payload.startsAt) : null }
          : {}),
        ...(payload.endsAt !== undefined
          ? { endsAt: payload.endsAt ? new Date(payload.endsAt) : null }
          : {}),
      },
    });
  }

  async removeBanner(id: string) {
    return this.prisma.banner.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSettings() {
    const settings = await this.prisma.settings.findMany({
      where: { key: { in: [...MANAGED_SETTING_KEYS] } },
      orderBy: { key: 'asc' },
    });

    return Object.fromEntries(
      settings.map((setting) => [setting.key, setting.value]),
    );
  }

  async updateSettings(payload: Record<string, unknown>) {
    const entries = Object.entries(payload).filter(
      ([key, value]) =>
        MANAGED_SETTING_KEYS.includes(
          key as (typeof MANAGED_SETTING_KEYS)[number],
        ) && ['string', 'number', 'boolean'].includes(typeof value),
    );

    if (entries.length === 0) return this.getSettings();

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.settings.upsert({
          where: { key },
          update: { value: String(value) },
          create: {
            key,
            value: String(value),
            type: typeof value,
            group: key.startsWith('store_') ? 'general' : 'commerce',
          },
        }),
      ),
    );

    return this.getSettings();
  }

  async getAuditLogs(page = 1, limit = 50) {
    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { data: logs, meta: { total, page, limit } };
  }

  async logAction(
    userId: string | null,
    action: string,
    entity: string,
    entityId?: string,
    oldData?: unknown,
    newData?: unknown,
    ipAddress?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId: userId ?? undefined,
        action,
        entity,
        entityId,
        oldData: oldData as never,
        newData: newData as never,
        ipAddress,
      },
    });
  }
}
