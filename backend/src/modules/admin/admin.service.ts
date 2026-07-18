import {
  BadRequestException,
  ConflictException,
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
const MANAGED_SETTING_KEYS = [
  'store_name',
  'store_email',
  'store_phone',
  'store_address',
  'currency',
  'free_shipping_threshold',
  'order_prefix',
] as const;

@Injectable()
export class AdminService {
  private readonly localProductImagePublicPath = '/product-images';

  constructor(private prisma: PrismaService) {}

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

  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const [
      totalUsers,
      newUsersToday,
      totalOrders,
      ordersToday,
      totalProducts,
      activeProducts,
      pendingOrders,
      lowStockProducts,
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
      this.prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
      this.prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { total: true },
      }),
    ]);

    const monthRevenueVal = Number(monthRevenue._sum.total || 0);
    const lastMonthRevenueVal = Number(lastMonthRevenue._sum.total || 0);
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
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { in: [OrderStatus.COMPLETED, OrderStatus.DELIVERED] },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, number>();
    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      dailyMap.set(day, (dailyMap.get(day) || 0) + Number(order.total));
    });

    return Array.from(dailyMap.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
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

  async listProducts(query: AdminListQuery) {
    const { page, limit, skip } = this.getPaging(query);
    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
        { category: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.status === 'active') where.isActive = true;
    if (query.status === 'hidden') where.isActive = false;

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
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

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
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
    if (
      !payload.name ||
      !payload.description ||
      !payload.categoryId ||
      !payload.basePrice
    ) {
      throw new BadRequestException('Missing required product fields');
    }

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
          ...(payload.sku !== undefined ? { sku: payload.sku } : {}),
          ...(payload.description !== undefined
            ? { description: payload.description }
            : {}),
          ...(payload.shortDescription !== undefined
            ? { shortDescription: payload.shortDescription }
            : {}),
          ...(payload.categoryId !== undefined
            ? { categoryId: payload.categoryId }
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

    return this.getProduct(id);
  }

  async toggleProduct(id: string, isActive: boolean) {
    return this.prisma.product.update({ where: { id }, data: { isActive } });
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
    const removedVariants = await tx.productVariant.findMany({
      where: {
        productId,
        ...(keptVariantIds.length > 0 ? { id: { notIn: keptVariantIds } } : {}),
      },
      select: { id: true },
    });

    for (const removed of removedVariants) {
      const [orderItems, cartItems] = await Promise.all([
        tx.orderItem.count({ where: { variantId: removed.id } }),
        tx.cartItem.count({ where: { variantId: removed.id } }),
      ]);

      if (orderItems > 0 || cartItems > 0) {
        await tx.productVariant.update({
          where: { id: removed.id },
          data: { isActive: false },
        });
      } else {
        await tx.inventory.deleteMany({ where: { variantId: removed.id } });
        await tx.productVariant.delete({ where: { id: removed.id } });
      }
    }

    for (const [index, item] of variants.entries()) {
      const colorId =
        item.colorId ||
        (item.colorName
          ? await this.ensureColor(tx, item.colorName, item.colorHex)
          : null);
      const sizeId =
        item.sizeId ||
        (item.sizeName ? await this.ensureSize(tx, item.sizeName) : null);
      const sku = item.sku?.trim() || `${productSku}-${index + 1}`;

      const variant = item.id
        ? await tx.productVariant.update({
            where: { id: item.id },
            data: {
              sku,
              colorId,
              sizeId,
              price: item.price ?? null,
              imageUrl: item.imageUrl,
              isActive: item.isActive ?? true,
            },
          })
        : await tx.productVariant.upsert({
            where: { sku },
            update: {
              productId,
              colorId,
              sizeId,
              price: item.price ?? null,
              imageUrl: item.imageUrl,
              isActive: item.isActive ?? true,
            },
            create: {
              productId,
              sku,
              colorId,
              sizeId,
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
        await tx.inventory.upsert({
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
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Order not found');
      if (
        order.status === OrderStatus.DELIVERED &&
        status === OrderStatus.CANCELLED
      ) {
        throw new BadRequestException('Delivered orders cannot be cancelled');
      }

      const updated = await tx.order.update({
        where: { id },
        data: {
          status,
          ...(status === OrderStatus.DELIVERED
            ? { deliveredAt: new Date() }
            : {}),
          ...(status === OrderStatus.CANCELLED
            ? { cancelledAt: new Date() }
            : {}),
        },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: id, status, note, changedBy },
      });

      if (
        status === OrderStatus.CANCELLED &&
        order.status !== OrderStatus.CANCELLED
      ) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.inventory.updateMany({
              where: {
                variantId: item.variantId,
                reserved: { gte: item.quantity },
              },
              data: { reserved: { decrement: item.quantity } },
            });
          }
        }
      }

      if (
        status === OrderStatus.DELIVERED &&
        order.status !== OrderStatus.DELIVERED
      ) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.inventory.updateMany({
              where: {
                variantId: item.variantId,
                quantity: { gte: item.quantity },
                reserved: { gte: item.quantity },
              },
              data: {
                quantity: { decrement: item.quantity },
                reserved: { decrement: item.quantity },
              },
            });
          }
        }

        const grouped = order.items.reduce(
          (acc, item) => {
            acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
            return acc;
          },
          {} as Record<string, number>,
        );
        for (const [productId, qty] of Object.entries(grouped)) {
          await tx.product.update({
            where: { id: productId },
            data: { soldCount: { increment: qty } },
          });
        }
      }

      return updated;
    });
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
    if (query.status === 'low') where.quantity = { lte: 5 };

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
    const inventory = await this.prisma.inventory.findUniqueOrThrow({
      where: { id },
    });
    const previousQty = inventory.quantity;
    const newQty = previousQty + quantity;
    if (newQty < 0) {
      throw new BadRequestException('Inventory quantity cannot be negative');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.inventory.update({
        where: { id },
        data: { quantity: { increment: quantity } },
      });
      await tx.inventoryTransaction.create({
        data: {
          inventoryId: id,
          type: quantity > 0 ? TransactionType.IN : TransactionType.OUT,
          quantity: Math.abs(quantity),
          previousQty,
          newQty,
          reason,
          performedBy,
        },
      });
      return updated;
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
