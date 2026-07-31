import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProductQueryDto, SortBy } from './dto/product-query.dto';
import { MerchandisingSection } from './merchandising';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const prisma = {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    productSize: { findMany: jest.fn() },
    productColor: { findMany: jest.fn() },
    brand: { findMany: jest.fn() },
    settings: { findMany: jest.fn(), update: jest.fn(), upsert: jest.fn() },
    $transaction: jest.fn(),
  };

  let service: ProductsService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.product.count.mockResolvedValue(0);
    prisma.product.findMany.mockResolvedValue([]);
    prisma.settings.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof prisma) => unknown) => callback(prisma),
    );
    service = new ProductsService(prisma as unknown as PrismaService);
  });

  it('returns ordered manual homepage products and falls back to legacy flags', async () => {
    prisma.settings.findMany.mockResolvedValue([
      {
        key: 'homepage_new_arrival_products',
        value: JSON.stringify({
          productIds: ['product-2', 'product-1'],
          limit: 4,
        }),
      },
    ]);
    prisma.product.findMany.mockImplementation(
      (args: { where: { id?: { in: string[] } } }) => {
        if (args.where.id) {
          return Promise.resolve([{ id: 'product-1' }, { id: 'product-2' }]);
        }
        return Promise.resolve([{ id: 'best-seller-1' }]);
      },
    );

    await expect(service.getHomeSections()).resolves.toEqual({
      newArrivals: {
        products: [{ id: 'product-2' }, { id: 'product-1' }],
        limit: 4,
        source: 'manual',
      },
      bestSellers: {
        products: [{ id: 'best-seller-1' }],
        limit: 8,
        source: 'fallback',
      },
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, isBestSeller: true },
        take: 8,
      }),
    );
  });

  it('falls back when a merchandising setting is malformed', async () => {
    prisma.settings.findMany.mockResolvedValue([
      {
        key: 'homepage_new_arrival_products',
        value: '{not-json',
      },
    ]);

    const result = await service.getHomeSections();

    expect(result.newArrivals.source).toBe('fallback');
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, isNewArrival: true },
      }),
    );
  });

  it('saves ordered merchandising configuration and synchronizes product flags', async () => {
    prisma.product.findMany.mockResolvedValue([
      { id: 'product-1' },
      { id: 'product-2' },
    ]);
    prisma.settings.upsert.mockResolvedValue({ id: 'setting-1' });
    prisma.product.updateMany.mockResolvedValue({ count: 2 });

    const result = await service.updateMerchandisingSection(
      MerchandisingSection.NEW_ARRIVALS,
      { productIds: ['product-2', 'product-1'], limit: 4 },
    );

    expect(result).toEqual({
      products: [{ id: 'product-2' }, { id: 'product-1' }],
      limit: 4,
      source: 'manual',
    });
    expect(prisma.settings.upsert).toHaveBeenCalledWith({
      where: { key: 'homepage_new_arrival_products' },
      update: {
        value: JSON.stringify({
          productIds: ['product-2', 'product-1'],
          limit: 4,
        }),
      },
      create: expect.objectContaining({
        key: 'homepage_new_arrival_products',
        type: 'json',
        group: 'merchandising',
      }),
    });
    expect(prisma.product.updateMany).not.toHaveBeenCalled();
  });

  it('rejects inactive, missing, or over-limit merchandising selections', async () => {
    prisma.product.findMany.mockResolvedValue([{ id: 'product-1' }]);

    await expect(
      service.updateMerchandisingSection(MerchandisingSection.BEST_SELLERS, {
        productIds: ['product-1', 'missing-product'],
        limit: 2,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.updateMerchandisingSection(MerchandisingSection.BEST_SELLERS, {
        productIds: ['product-1', 'product-2'],
        limit: 1,
      }),
    ).rejects.toThrow('cannot exceed the section limit');
  });

  it('removes a hidden product from saved homepage sections', async () => {
    prisma.$transaction.mockRejectedValueOnce({ code: 'P2034' });
    prisma.settings.findMany.mockResolvedValue([
      {
        key: 'homepage_new_arrival_products',
        value: JSON.stringify({
          productIds: ['product-1', 'product-2'],
          limit: 4,
        }),
      },
    ]);
    prisma.settings.update.mockResolvedValue({ id: 'setting-1' });

    await service.removeProductFromMerchandising('product-1');

    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(prisma.settings.update).toHaveBeenCalledWith({
      where: { key: 'homepage_new_arrival_products' },
      data: {
        value: JSON.stringify({ productIds: ['product-2'], limit: 4 }),
      },
    });
  });

  it('searches name, description, SKU, tags, brand, and category', async () => {
    prisma.product.count.mockResolvedValue(2);
    prisma.product.findMany.mockResolvedValue([
      { id: 'product-1' },
      { id: 'product-2' },
    ]);

    const result = await service.findAll({
      search: '  linen  ',
      page: 2,
      limit: 5,
    });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          OR: expect.arrayContaining([
            { name: { contains: 'linen', mode: 'insensitive' } },
            { description: { contains: 'linen', mode: 'insensitive' } },
            { sku: { contains: 'linen', mode: 'insensitive' } },
            { tags: { has: 'linen' } },
            {
              brand: {
                name: { contains: 'linen', mode: 'insensitive' },
              },
            },
            {
              category: {
                name: { contains: 'linen', mode: 'insensitive' },
              },
            },
          ]),
        }),
        orderBy: { createdAt: 'desc' },
        skip: 5,
        take: 5,
      }),
    );
    expect(result).toMatchObject({
      matchCount: 2,
      meta: {
        total: 2,
        page: 2,
        limit: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: true,
      },
    });
  });

  it('ignores a search string containing only whitespace', async () => {
    await service.findAll({ search: '   ' });

    const query = prisma.product.findMany.mock.calls[0][0];
    expect(query.where).toEqual({ isActive: true });
    expect(query.where).not.toHaveProperty('OR');
  });

  it('combines category, brand, price, size, color, flags, and sorting filters', async () => {
    const query: ProductQueryDto = {
      category: 'women',
      subCategory: 'dresses',
      brand: 'achromatic',
      minPrice: 100000,
      maxPrice: 900000,
      sizes: ['M'],
      colors: ['Black'],
      featured: true,
      newArrival: true,
      bestSeller: true,
      sortBy: SortBy.PRICE_ASC,
    };

    await service.findAll(query);

    expect(prisma.product.count).toHaveBeenCalledWith({
      where: {
        isActive: true,
        category: { slug: 'women' },
        subCategory: { slug: 'dresses' },
        brand: { slug: 'achromatic' },
        basePrice: { gte: 100000, lte: 900000 },
        variants: {
          some: {
            isActive: true,
            size: { OR: [{ name: { in: ['M'] } }, { id: { in: ['M'] } }] },
            color: {
              OR: [{ name: { in: ['Black'] } }, { id: { in: ['Black'] } }],
            },
          },
        },
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: true,
      },
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { basePrice: 'asc' } }),
    );
  });

  it.each([
    [SortBy.NEWEST, { createdAt: 'desc' }],
    [SortBy.OLDEST, { createdAt: 'asc' }],
    [SortBy.PRICE_DESC, { basePrice: 'desc' }],
    [SortBy.BEST_SELLING, { soldCount: 'desc' }],
    [SortBy.TOP_RATED, { avgRating: 'desc' }],
    [SortBy.FEATURED, { isFeatured: 'desc' }],
  ])('applies the %s sort order', async (sortBy, orderBy) => {
    await service.findAll({ sortBy });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy }),
    );
  });

  it('returns consistent pagination metadata', async () => {
    prisma.product.count.mockResolvedValue(11);
    prisma.product.findMany.mockResolvedValue([{ id: 'product-6' }]);

    const result = await service.findAll({ page: 2, limit: 5 });

    expect(result).toEqual({
      data: [{ id: 'product-6' }],
      matchCount: 11,
      meta: {
        total: 11,
        page: 2,
        limit: 5,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      },
    });
  });

  it('returns a product detail and increments its view count', async () => {
    const product = {
      id: 'product-1',
      slug: 'linen-shirt',
      isActive: true,
    };
    prisma.product.findUnique.mockResolvedValue(product);
    prisma.product.update.mockResolvedValue(product);

    await expect(service.findOne(product.slug)).resolves.toEqual(product);
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    });
  });

  it('throws when a product detail is missing or inactive', async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-product')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it('rejects an inactive product detail without incrementing its views', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      slug: 'archived-product',
      isActive: false,
    });

    await expect(service.findOne('archived-product')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.product.update).not.toHaveBeenCalled();
  });

  it('finds an active product by id for internal relations', async () => {
    const product = {
      id: 'product-1',
      categoryId: 'category-1',
      isActive: true,
    };
    prisma.product.findUnique.mockResolvedValue(product);

    await expect(service.findById(product.id)).resolves.toEqual(product);
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: product.id },
      select: { id: true, categoryId: true, isActive: true },
    });
  });

  it('rejects an inactive product when finding by id', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      categoryId: 'category-1',
      isActive: false,
    });

    await expect(service.findById('product-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('loads filter options and scopes the price range by category', async () => {
    const sizes = [{ id: 'size-m', name: 'M' }];
    const colors = [{ id: 'color-black', name: 'Black' }];
    const brands = [{ id: 'brand-1', name: 'Achromatic' }];
    const priceRange = {
      _min: { basePrice: 100000 },
      _max: { basePrice: 900000 },
    };
    prisma.productSize.findMany.mockResolvedValue(sizes);
    prisma.productColor.findMany.mockResolvedValue(colors);
    prisma.brand.findMany.mockResolvedValue(brands);
    prisma.product.aggregate.mockResolvedValue(priceRange);

    await expect(service.getFilterOptions('women')).resolves.toEqual({
      sizes,
      colors,
      brands,
      priceRange,
    });
    expect(prisma.product.aggregate).toHaveBeenCalledWith({
      where: { isActive: true, category: { slug: 'women' } },
      _min: { basePrice: true },
      _max: { basePrice: true },
    });
    expect(prisma.brand.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
  });

  it('creates a product with category and brand relations', async () => {
    const data = { name: 'Linen Shirt', slug: 'linen-shirt' };
    const created = { id: 'product-1', ...data };
    prisma.product.create.mockResolvedValue(created);

    await expect(service.create(data as never)).resolves.toEqual(created);
    expect(prisma.product.create).toHaveBeenCalledWith({
      data,
      include: { category: true, brand: true },
    });
  });

  it('updates a product by id', async () => {
    prisma.product.update.mockResolvedValue({
      id: 'product-1',
      name: 'Updated Name',
    });

    await service.update('product-1', { name: 'Updated Name' });

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { name: 'Updated Name' },
    });
  });

  it('soft-deletes a product', async () => {
    prisma.product.update.mockResolvedValue({
      id: 'product-1',
      isActive: false,
    });

    await service.remove('product-1');

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { isActive: false },
    });
  });
});
