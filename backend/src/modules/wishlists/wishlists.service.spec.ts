import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WishlistsService } from './wishlists.service';

describe('WishlistsService', () => {
  const prisma = {
    product: {
      findFirst: jest.fn(),
    },
    wishlist: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    wishlistItem: {
      findFirst: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: WishlistsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WishlistsService(prisma as unknown as PrismaService);
  });

  it('returns an existing wishlist', async () => {
    const wishlist = { id: 'wishlist-1', userId: 'user-1', items: [] };
    prisma.wishlist.findUnique.mockResolvedValue(wishlist);

    await expect(service.getWishlist('user-1')).resolves.toEqual(wishlist);
    expect(prisma.wishlist.create).not.toHaveBeenCalled();
  });

  it('creates an empty wishlist when the user does not have one', async () => {
    const wishlist = { id: 'wishlist-1', userId: 'user-1', items: [] };
    prisma.wishlist.findUnique.mockResolvedValue(null);
    prisma.wishlist.create.mockResolvedValue({
      id: 'wishlist-1',
      userId: 'user-1',
    });
    prisma.wishlist.findUniqueOrThrow.mockResolvedValue(wishlist);

    await expect(service.getWishlist('user-1')).resolves.toEqual(wishlist);
    expect(prisma.wishlist.create).toHaveBeenCalledWith({
      data: { userId: 'user-1' },
    });
  });

  it('rejects adding an inactive or missing product', async () => {
    prisma.product.findFirst.mockResolvedValue(null);

    await expect(service.addItem('user-1', 'product-1')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.wishlist.upsert).not.toHaveBeenCalled();
    expect(prisma.wishlistItem.upsert).not.toHaveBeenCalled();
  });

  it('adds a product idempotently and returns the populated wishlist', async () => {
    const wishlist = {
      id: 'wishlist-1',
      userId: 'user-1',
      items: [{ id: 'item-1', productId: 'product-1' }],
    };
    prisma.product.findFirst.mockResolvedValue({ id: 'product-1' });
    prisma.wishlist.upsert.mockResolvedValue({ id: 'wishlist-1' });
    prisma.wishlistItem.upsert.mockResolvedValue({ id: 'item-1' });
    prisma.wishlist.findUnique.mockResolvedValue(wishlist);

    await expect(service.addItem('user-1', 'product-1')).resolves.toEqual(
      wishlist,
    );
    expect(prisma.wishlistItem.upsert).toHaveBeenCalledWith({
      where: {
        wishlistId_productId: {
          wishlistId: 'wishlist-1',
          productId: 'product-1',
        },
      },
      create: { wishlistId: 'wishlist-1', productId: 'product-1' },
      update: {},
    });
  });

  it('removes only an item belonging to the current user', async () => {
    const wishlist = { id: 'wishlist-1', userId: 'user-1', items: [] };
    prisma.wishlistItem.findFirst.mockResolvedValue({ id: 'item-1' });
    prisma.wishlistItem.delete.mockResolvedValue({ id: 'item-1' });
    prisma.wishlist.findUnique.mockResolvedValue(wishlist);

    await expect(service.removeItem('user-1', 'item-1')).resolves.toEqual(
      wishlist,
    );
    expect(prisma.wishlistItem.findFirst).toHaveBeenCalledWith({
      where: {
        wishlist: { userId: 'user-1' },
        OR: [{ id: 'item-1' }, { productId: 'item-1' }],
      },
      select: { id: true },
    });
    expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({
      where: { id: 'item-1' },
    });
  });

  it('returns 404 when the wishlist item does not belong to the user', async () => {
    prisma.wishlistItem.findFirst.mockResolvedValue(null);

    await expect(service.removeItem('user-1', 'item-2')).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.wishlistItem.delete).not.toHaveBeenCalled();
  });
});
