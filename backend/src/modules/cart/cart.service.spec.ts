import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CartService } from './cart.service';

describe('CartService inventory limits', () => {
  const prisma = {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    productVariant: {
      findFirst: jest.fn(),
    },
    inventory: {
      findFirst: jest.fn(),
    },
    cartItem: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  let service: CartService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.cart.findUnique.mockResolvedValue({ id: 'cart-1', items: [] });
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      isActive: true,
    });
    service = new CartService(prisma as unknown as PrismaService);
  });

  it('creates and returns a cart when the user does not have one', async () => {
    const createdCart = { id: 'cart-new', userId: 'user-new', items: [] };
    prisma.cart.findUnique.mockResolvedValue(null);
    prisma.cart.create.mockResolvedValue(createdCart);

    await expect(service.getCart('user-new')).resolves.toEqual(createdCart);
    const itemsMatcher: unknown = expect.any(Object);
    const includeMatcher: unknown = expect.objectContaining({
      items: itemsMatcher,
    });
    expect(prisma.cart.create).toHaveBeenCalledWith({
      data: { userId: 'user-new' },
      include: includeMatcher,
    });
  });

  it.each([0, -1, 1.5])(
    'rejects an invalid add quantity (%s) before querying the product',
    async (quantity) => {
      await expect(
        service.addItem('user-1', {
          productId: 'product-1',
          quantity,
        }),
      ).rejects.toThrow('Quantity must be at least 1');

      expect(prisma.product.findUnique).not.toHaveBeenCalled();
      expect(prisma.cartItem.create).not.toHaveBeenCalled();
    },
  );

  it('rejects adding an inactive product', async () => {
    prisma.product.findUnique.mockResolvedValue({
      id: 'product-1',
      isActive: false,
    });

    await expect(
      service.addItem('user-1', {
        productId: 'product-1',
        quantity: 1,
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prisma.cartItem.findFirst).not.toHaveBeenCalled();
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  it('rejects a variant that does not belong to the product', async () => {
    prisma.cartItem.findFirst.mockResolvedValue(null);
    prisma.productVariant.findFirst.mockResolvedValue(null);

    await expect(
      service.addItem('user-1', {
        productId: 'product-1',
        variantId: 'variant-from-another-product',
        quantity: 1,
      }),
    ).rejects.toThrow('Product variant not found');

    expect(prisma.productVariant.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'variant-from-another-product',
        productId: 'product-1',
        isActive: true,
      },
      select: {
        inventory: {
          select: { quantity: true, reserved: true },
          take: 1,
        },
      },
    });
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  it('rejects adding an amount that makes the cart exceed available variant stock', async () => {
    prisma.cartItem.findFirst.mockResolvedValue({
      id: 'item-1',
      quantity: 3,
    });
    prisma.productVariant.findFirst.mockResolvedValue({
      inventory: [{ quantity: 8, reserved: 3 }],
    });

    await expect(
      service.addItem('user-1', {
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 3,
      }),
    ).rejects.toThrow(
      new BadRequestException(
        'Số lượng yêu cầu vượt quá tồn kho. Chỉ còn 5 sản phẩm.',
      ),
    );

    expect(prisma.cartItem.update).not.toHaveBeenCalled();
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  it('allows the cart quantity to equal the available variant stock', async () => {
    prisma.cartItem.findFirst.mockResolvedValue({
      id: 'item-1',
      quantity: 3,
    });
    prisma.productVariant.findFirst.mockResolvedValue({
      inventory: [{ quantity: 8, reserved: 3 }],
    });
    prisma.cartItem.update.mockResolvedValue({ id: 'item-1' });

    await service.addItem('user-1', {
      productId: 'product-1',
      variantId: 'variant-1',
      quantity: 2,
    });

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: { quantity: 5, savedForLater: false },
    });
  });

  it('checks product-level inventory when the product has no variants', async () => {
    prisma.cartItem.findFirst.mockResolvedValue(null);
    prisma.productVariant.findFirst.mockResolvedValue(null);
    prisma.inventory.findFirst.mockResolvedValue({ quantity: 2, reserved: 0 });

    await expect(
      service.addItem('user-1', {
        productId: 'product-1',
        quantity: 3,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.inventory.findFirst).toHaveBeenCalledWith({
      where: { productId: 'product-1', variantId: null },
      select: { quantity: true, reserved: true },
    });
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  it('requires a variant selection for products that have active variants', async () => {
    prisma.cartItem.findFirst.mockResolvedValue(null);
    prisma.productVariant.findFirst.mockResolvedValue({ id: 'variant-1' });

    await expect(
      service.addItem('user-1', {
        productId: 'product-1',
        quantity: 1,
      }),
    ).rejects.toThrow('Please select a product variant');

    expect(prisma.inventory.findFirst).not.toHaveBeenCalled();
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });

  it('rejects updating a cart item beyond available stock', async () => {
    prisma.cartItem.findFirst.mockResolvedValue({
      id: 'item-1',
      productId: 'product-1',
      variantId: 'variant-1',
    });
    prisma.productVariant.findFirst.mockResolvedValue({
      inventory: [{ quantity: 10, reserved: 6 }],
    });

    await expect(service.updateItem('user-1', 'item-1', 5)).rejects.toThrow(
      BadRequestException,
    );

    expect(prisma.cartItem.update).not.toHaveBeenCalled();
  });

  it('adds a new item and returns the refreshed cart', async () => {
    prisma.cartItem.findFirst.mockResolvedValue(null);
    prisma.productVariant.findFirst.mockResolvedValue({
      inventory: [{ quantity: 10, reserved: 1 }],
    });
    prisma.cartItem.create.mockResolvedValue({ id: 'item-1' });

    const result = await service.addItem('user-1', {
      productId: 'product-1',
      variantId: 'variant-1',
      quantity: 2,
    });

    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId: 'cart-1',
        productId: 'product-1',
        variantId: 'variant-1',
        quantity: 2,
      },
    });
    expect(result).toEqual({ id: 'cart-1', items: [] });
  });

  it('updates a cart item to a valid quantity', async () => {
    prisma.cartItem.findFirst.mockResolvedValue({
      id: 'item-1',
      productId: 'product-1',
      variantId: 'variant-1',
    });
    prisma.productVariant.findFirst.mockResolvedValue({
      inventory: [{ quantity: 6, reserved: 1 }],
    });
    prisma.cartItem.update.mockResolvedValue({
      id: 'item-1',
      quantity: 4,
    });

    await service.updateItem('user-1', 'item-1', 4);

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: 'item-1' },
      data: { quantity: 4 },
    });
  });

  it('removes a cart item when its quantity is updated to zero', async () => {
    prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    await expect(service.updateItem('user-1', 'item-1', 0)).resolves.toEqual({
      id: 'cart-1',
      items: [],
    });

    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { id: 'item-1', cart: { userId: 'user-1' } },
    });
    expect(prisma.cartItem.findFirst).not.toHaveBeenCalled();
    expect(prisma.cartItem.update).not.toHaveBeenCalled();
  });

  it('rejects a negative update quantity instead of removing the item', async () => {
    const promise = service.updateItem('user-1', 'item-1', -1);

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toMatchObject({
      status: 400,
      message: 'Quantity cannot be negative',
    });
    expect(prisma.cartItem.deleteMany).not.toHaveBeenCalled();
    expect(prisma.cartItem.findFirst).not.toHaveBeenCalled();
    expect(prisma.cartItem.update).not.toHaveBeenCalled();
  });

  it('rejects a fractional update quantity', async () => {
    await expect(service.updateItem('user-1', 'item-1', 1.5)).rejects.toThrow(
      'Quantity must be a whole number',
    );

    expect(prisma.cartItem.findFirst).not.toHaveBeenCalled();
    expect(prisma.cartItem.update).not.toHaveBeenCalled();
  });

  it('removes an item owned by the user', async () => {
    prisma.cartItem.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.removeItem('user-1', 'item-1');

    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { id: 'item-1', cart: { userId: 'user-1' } },
    });
    expect(result).toEqual({ id: 'cart-1', items: [] });
  });

  it('rejects removal when the item is not owned by the user', async () => {
    prisma.cartItem.deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.removeItem('user-1', 'missing-item')).rejects.toThrow(
      'Cart item not found',
    );
  });

  it('moves an owned item to saved for later', async () => {
    prisma.cartItem.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.saveForLater('user-1', 'item-1')).resolves.toEqual({
      id: 'cart-1',
      items: [],
    });

    expect(prisma.cartItem.updateMany).toHaveBeenCalledWith({
      where: { id: 'item-1', cart: { userId: 'user-1' } },
      data: { savedForLater: true },
    });
  });

  it('rejects saving an item owned by another user for later', async () => {
    prisma.cartItem.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.saveForLater('user-1', 'foreign-item'),
    ).rejects.toThrow(NotFoundException);
  });

  it('clears only active cart items', async () => {
    prisma.cartItem.deleteMany.mockResolvedValue({ count: 2 });

    await expect(service.clearCart('user-1')).resolves.toEqual({
      message: 'Cart cleared',
    });
    expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: 'cart-1', savedForLater: false },
    });
  });
});
