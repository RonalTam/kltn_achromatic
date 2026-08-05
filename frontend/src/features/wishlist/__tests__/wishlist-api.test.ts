import { api } from '@/lib/api';
import {
  addWishlistItem,
  deleteWishlistItem,
  getWishlist,
  type Wishlist,
} from '@/features/wishlist/wishlist-api';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const wishlist: Wishlist = {
  id: 'wishlist-1',
  userId: 'user-1',
  items: [],
};

describe('wishlist API', () => {
  it('loads the authenticated wishlist', async () => {
    jest.mocked(api.get).mockResolvedValue({
      data: { success: true, data: wishlist },
    });

    await expect(getWishlist()).resolves.toEqual(wishlist);
    expect(api.get).toHaveBeenCalledWith('/wishlists');
  });

  it('adds a product using the body contract', async () => {
    jest.mocked(api.post).mockResolvedValue({
      data: { success: true, data: wishlist },
    });

    await expect(addWishlistItem('product-1')).resolves.toEqual(wishlist);
    expect(api.post).toHaveBeenCalledWith('/wishlists', {
      productId: 'product-1',
    });
  });

  it('removes an item using its wishlist item id', async () => {
    jest.mocked(api.delete).mockResolvedValue({
      data: { success: true, data: wishlist },
    });

    await expect(deleteWishlistItem('item/1')).resolves.toEqual(wishlist);
    expect(api.delete).toHaveBeenCalledWith('/wishlists/item%2F1');
  });
});

