import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WishlistItemCard } from '@/features/wishlist/WishlistItemCard';
import { useWishlist } from '@/features/wishlist/use-wishlist';
import type { WishlistItem } from '@/features/wishlist/wishlist-api';
import { useCartStore } from '@/store/cart-store';
import { createProduct } from '@/test/fixtures';

jest.mock('@/features/wishlist/use-wishlist', () => ({
  useWishlist: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

describe('WishlistItemCard', () => {
  const removeItem = jest.fn();

  beforeEach(() => {
    window.localStorage.clear();
    useCartStore.setState({ isCartOpen: false, items: [] });
    removeItem.mockReset().mockResolvedValue(undefined);
    jest.mocked(useWishlist).mockReturnValue({
      removeItem,
      isRemoving: false,
      isMutating: false,
    } as never);
  });

  it('requires a valid color and size before moving an item to cart', async () => {
    const user = userEvent.setup();
    const product = createProduct({
      inventory: null,
      variants: [
        {
          id: 'variant-black-m',
          sku: 'LINEN-BLACK-M',
          price: 429000,
          isActive: true,
          color: { id: 'black', name: 'Đen', hexCode: '#111111' },
          size: { id: 'm', name: 'M', sortOrder: 2 },
          inventory: { quantity: 3, reserved: 0 },
        },
      ],
    });
    const item: WishlistItem = {
      id: 'wishlist-item-1',
      wishlistId: 'wishlist-1',
      productId: product.id,
      addedAt: new Date().toISOString(),
      product,
    };

    render(<WishlistItemCard item={item} />);

    const moveButton = screen.getByRole('button', {
      name: 'Chuyển vào giỏ hàng',
    });
    await user.click(moveButton);

    expect(screen.getByText('Vui lòng chọn màu sắc.')).toBeVisible();
    expect(useCartStore.getState().items).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'Chọn màu Đen' }));
    await user.click(screen.getByRole('button', { name: 'M' }));
    await user.click(moveButton);

    await waitFor(() => expect(removeItem).toHaveBeenCalledWith(item));
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].variantId).toBe(
      'variant-black-m',
    );
  });

  it('supports products whose variants use different option dimensions', async () => {
    const user = userEvent.setup();
    const product = createProduct({
      inventory: null,
      variants: [
        {
          id: 'variant-red-only',
          sku: 'LINEN-RED',
          price: 419000,
          isActive: true,
          color: { id: 'red', name: 'Đỏ', hexCode: '#8f1d1d' },
          size: null,
          inventory: { quantity: 2, reserved: 0 },
        },
        {
          id: 'variant-large-only',
          sku: 'LINEN-L',
          price: 429000,
          isActive: true,
          color: null,
          size: { id: 'l', name: 'L', sortOrder: 3 },
          inventory: { quantity: 2, reserved: 0 },
        },
      ],
    });
    const item: WishlistItem = {
      id: 'wishlist-item-mixed',
      wishlistId: 'wishlist-1',
      productId: product.id,
      addedAt: new Date().toISOString(),
      product,
    };

    render(<WishlistItemCard item={item} />);

    const moveButton = screen.getByRole('button', {
      name: 'Chuyển vào giỏ hàng',
    });
    await user.click(moveButton);
    expect(
      screen.getByText('Vui lòng chọn màu sắc hoặc kích cỡ.'),
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Chọn màu Đỏ' }));
    await user.click(moveButton);

    await waitFor(() => expect(removeItem).toHaveBeenCalledWith(item));
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].variantId).toBe('variant-red-only');
  });
});
