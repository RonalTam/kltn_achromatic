import { useCartStore } from '@/store/cart-store';
import { createProduct } from '@/test/fixtures';

describe('cart-store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCartStore.setState({ isCartOpen: false, items: [] });
  });

  afterEach(() => {
    useCartStore.setState({ isCartOpen: false, items: [] });
  });

  it('adds, updates, and removes an item while recalculating totals', () => {
    const product = createProduct({ basePrice: 250000 });

    const added = useCartStore.getState().addItem(product, null, 2);
    expect(added).toEqual({ success: true, availableStock: 7 });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().getCount()).toBe(2);
    expect(useCartStore.getState().getTotal()).toBe(500000);

    const itemId = useCartStore.getState().items[0].id;
    const updated = useCartStore.getState().updateQuantity(itemId, 3);
    expect(updated).toEqual({ success: true, availableStock: 7 });
    expect(useCartStore.getState().getCount()).toBe(3);
    expect(useCartStore.getState().getTotal()).toBe(750000);

    useCartStore.getState().removeItem(itemId);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().getTotal()).toBe(0);
  });

  it('rejects additions and quantity updates beyond available stock', () => {
    const product = createProduct({
      inventory: { quantity: 3, reserved: 1 },
    });

    expect(useCartStore.getState().addItem(product, null, 3)).toEqual({
      success: false,
      availableStock: 2,
    });

    useCartStore.getState().addItem(product, null, 1);
    const itemId = useCartStore.getState().items[0].id;
    expect(useCartStore.getState().updateQuantity(itemId, 3)).toEqual({
      success: false,
      availableStock: 2,
    });
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });
});
