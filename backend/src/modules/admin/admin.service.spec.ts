import { BadRequestException, ConflictException } from '@nestjs/common';
import { Gender, OrderStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { MerchandisingSection } from '../products/merchandising';
import { ProductsService } from '../products/products.service';
import { AdminService } from './admin.service';
import {
  AdminProductSortBy,
  AdminProductStatus,
  SortOrder,
} from './dto/admin-product-query.dto';

describe('AdminService', () => {
  const prisma = {
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const ordersService = {
    updateStatus: jest.fn(),
  };
  const productsService = {
    getHomeSections: jest.fn(),
    updateMerchandisingSection: jest.fn(),
  };

  const inventoryTx = {
    inventory: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      updateMany: jest.fn(),
    },
    inventoryTransaction: { create: jest.fn() },
  };

  const variantTx = {
    productVariant: {
      findMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    orderItem: { count: jest.fn() },
    cartItem: { count: jest.fn() },
    inventory: {
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    productColor: { upsert: jest.fn() },
    productSize: { upsert: jest.fn() },
    inventoryTransaction: { create: jest.fn() },
  };

  let service: AdminService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.product.count.mockResolvedValue(0);
    prisma.product.findMany.mockResolvedValue([]);
    prisma.order.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof inventoryTx) => unknown) => callback(inventoryTx),
    );
    variantTx.productVariant.findMany.mockResolvedValue([]);
    variantTx.orderItem.count.mockResolvedValue(0);
    variantTx.cartItem.count.mockResolvedValue(0);
    variantTx.inventory.findFirst.mockResolvedValue(null);
    service = new AdminService(
      prisma as unknown as PrismaService,
      ordersService as unknown as OrdersService,
      productsService as unknown as ProductsService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('searches all admin product identifiers and applies filters and sorting', async () => {
    await service.listProducts({
      search: '  linen  ',
      status: AdminProductStatus.ACTIVE,
      categoryId: 'category-1',
      subCategoryId: 'subcategory-1',
      brandId: 'brand-1',
      gender: Gender.FEMALE,
      featured: false,
      newArrival: true,
      bestSeller: false,
      sortBy: AdminProductSortBy.SOLD_COUNT,
      sortOrder: SortOrder.ASC,
      page: 2,
      limit: 20,
    });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: 'category-1',
          subCategoryId: 'subcategory-1',
          brandId: 'brand-1',
          gender: Gender.FEMALE,
          isActive: true,
          isFeatured: false,
          isNewArrival: true,
          isBestSeller: false,
          OR: expect.arrayContaining([
            { slug: { contains: 'linen', mode: 'insensitive' } },
            {
              variants: {
                some: {
                  sku: { contains: 'linen', mode: 'insensitive' },
                },
              },
            },
            {
              brand: {
                name: { contains: 'linen', mode: 'insensitive' },
              },
            },
            {
              subCategory: {
                name: { contains: 'linen', mode: 'insensitive' },
              },
            },
          ]),
        }),
        orderBy: { soldCount: 'asc' },
        skip: 20,
        take: 20,
      }),
    );
  });

  it('zero-fills revenue dates and clamps the requested range', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-07-22T12:00:00.000Z'));
    prisma.order.findMany.mockResolvedValue([
      { total: '150000', deliveredAt: new Date('2026-07-19T18:00:00.000Z') },
      { total: 50000, deliveredAt: new Date('2026-07-21T18:00:00.000Z') },
      {
        total: 25000,
        deliveredAt: null,
        createdAt: new Date('2026-07-19T19:00:00.000Z'),
      },
    ]);

    await expect(service.getRevenueChart(3)).resolves.toEqual([
      { date: '2026-07-20', revenue: 175000 },
      { date: '2026-07-21', revenue: 0 },
      { date: '2026-07-22', revenue: 50000 },
    ]);

    prisma.order.findMany.mockResolvedValue([]);
    await expect(service.getRevenueChart(0)).resolves.toHaveLength(1);
    await expect(service.getRevenueChart(999)).resolves.toHaveLength(365);
  });

  it('delegates admin order transitions to the canonical OrdersService', async () => {
    const updated = { id: 'order-1', status: OrderStatus.CONFIRMED };
    ordersService.updateStatus.mockResolvedValue(updated);

    await expect(
      service.updateOrderStatus(
        'order-1',
        OrderStatus.CONFIRMED,
        'Payment verified',
        'admin-1',
      ),
    ).resolves.toEqual(updated);
    expect(ordersService.updateStatus).toHaveBeenCalledWith(
      'order-1',
      OrderStatus.CONFIRMED,
      'Payment verified',
      'admin-1',
    );
  });

  it('rejects unsafe product prices before opening a transaction', async () => {
    await expect(
      service.createProduct({
        name: 'Linen shirt',
        description: 'Description',
        categoryId: 'category-1',
        basePrice: -1,
      }),
    ).rejects.toThrow('basePrice must be a positive number');
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('adjusts inventory atomically and never goes below reserved stock', async () => {
    inventoryTx.inventory.findUnique.mockResolvedValue({
      id: 'inventory-1',
      quantity: 10,
      reserved: 8,
    });

    await expect(
      service.adjustInventory('inventory-1', -3, 'Cycle count', 'admin-1'),
    ).rejects.toThrow('lower than its reserved quantity');
    expect(inventoryTx.inventory.updateMany).not.toHaveBeenCalled();

    inventoryTx.inventory.findUnique.mockResolvedValue({
      id: 'inventory-1',
      quantity: 10,
      reserved: 2,
    });
    inventoryTx.inventory.updateMany.mockResolvedValue({ count: 1 });
    inventoryTx.inventory.findUniqueOrThrow.mockResolvedValue({
      id: 'inventory-1',
      quantity: 7,
      reserved: 2,
    });

    await service.adjustInventory(
      'inventory-1',
      -3,
      '  Cycle count  ',
      'admin-1',
    );

    expect(inventoryTx.inventory.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'inventory-1',
        quantity: 10,
        reserved: { lte: 7 },
      },
      data: { quantity: { increment: -3 } },
    });
    expect(inventoryTx.inventoryTransaction.create).toHaveBeenCalledWith({
      data: {
        inventoryId: 'inventory-1',
        type: TransactionType.ADJUSTMENT,
        quantity: 3,
        previousQty: 10,
        newQty: 7,
        reason: 'Cycle count',
        performedBy: 'admin-1',
      },
    });
  });

  it('delegates merchandising reads and writes to ProductsService', async () => {
    productsService.getHomeSections.mockResolvedValue({ newArrivals: {} });
    productsService.updateMerchandisingSection.mockResolvedValue({
      products: [],
      limit: 4,
      source: 'manual',
    });

    await service.getMerchandising();
    await service.updateMerchandising(MerchandisingSection.NEW_ARRIVALS, {
      productIds: [],
      limit: 4,
    });

    expect(productsService.getHomeSections).toHaveBeenCalledTimes(1);
    expect(productsService.updateMerchandisingSection).toHaveBeenCalledWith(
      MerchandisingSection.NEW_ARRIVALS,
      {
        productIds: [],
        limit: 4,
      },
    );
  });

  it('rejects duplicate variant IDs before changing variants', async () => {
    await expect(
      callVariantUpsert(service, variantTx, [
        { id: 'variant-1', sku: 'SKU-1', colorId: 'black', sizeId: 'm' },
        { id: 'variant-1', sku: 'SKU-2', colorId: 'white', sizeId: 'm' },
      ]),
    ).rejects.toThrow('Duplicate variant IDs');
    expect(variantTx.productVariant.update).not.toHaveBeenCalled();
  });

  it('rejects duplicate SKU and color/size combinations', async () => {
    await expect(
      callVariantUpsert(service, variantTx, [
        { sku: 'SKU-1', colorId: 'black', sizeId: 'm' },
        { sku: 'sku-1', colorId: 'white', sizeId: 'm' },
      ]),
    ).rejects.toThrow(BadRequestException);

    await expect(
      callVariantUpsert(service, variantTx, [
        { sku: 'SKU-1', colorId: 'black', sizeId: 'm' },
        { sku: 'SKU-2', colorId: 'black', sizeId: 'm' },
      ]),
    ).rejects.toThrow('Duplicate color and size combinations');
  });

  it('rejects a variant ID owned by another product', async () => {
    variantTx.productVariant.findMany.mockResolvedValueOnce([
      { id: 'foreign-variant', productId: 'product-2' },
    ]);

    await expect(
      callVariantUpsert(service, variantTx, [
        {
          id: 'foreign-variant',
          sku: 'FOREIGN-1',
          colorId: 'black',
          sizeId: 'm',
        },
      ]),
    ).rejects.toThrow('does not belong to this product');
    expect(variantTx.productVariant.update).not.toHaveBeenCalled();
  });

  it('rejects reassigning a SKU that belongs to another variant', async () => {
    variantTx.productVariant.findMany.mockResolvedValueOnce([
      { id: 'foreign-variant', sku: 'TAKEN-SKU' },
    ]);

    await expect(
      callVariantUpsert(service, variantTx, [
        { sku: 'taken-sku', colorId: 'black', sizeId: 'm' },
      ]),
    ).rejects.toThrow(ConflictException);
    expect(variantTx.productVariant.create).not.toHaveBeenCalled();
  });

  it('rejects absolute stock snapshots for an existing variant', async () => {
    await expect(
      callVariantUpsert(service, variantTx, [
        {
          id: 'variant-1',
          sku: 'SKU-1',
          colorId: 'black',
          sizeId: 'm',
          quantity: 2,
        },
      ]),
    ).rejects.toThrow('must be changed through inventory adjustment');
    expect(variantTx.inventory.upsert).not.toHaveBeenCalled();
  });

  it('soft-disables a removed variant when its inventory has audit history', async () => {
    variantTx.productVariant.findMany.mockResolvedValueOnce([
      {
        id: 'variant-1',
        colorId: 'black',
        sizeId: 'm',
      },
    ]);
    variantTx.inventory.findFirst.mockResolvedValue({
      quantity: 0,
      reserved: 0,
      _count: { transactions: 1 },
    });

    await callVariantUpsert(service, variantTx, []);

    expect(variantTx.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-1' },
      data: { isActive: false },
    });
    expect(variantTx.inventory.deleteMany).not.toHaveBeenCalled();
    expect(variantTx.productVariant.delete).not.toHaveBeenCalled();
  });
});

function callVariantUpsert(
  service: AdminService,
  tx: unknown,
  variants: Array<{
    id?: string;
    sku?: string;
    colorId?: string;
    sizeId?: string;
    quantity?: number;
  }>,
) {
  const variantService = service as unknown as {
    upsertProductVariants(
      transaction: unknown,
      productId: string,
      productSku: string,
      variantInputs: typeof variants,
    ): Promise<void>;
  };
  return variantService.upsertProductVariants(
    tx,
    'product-1',
    'PRODUCT-1',
    variants,
  );
}
