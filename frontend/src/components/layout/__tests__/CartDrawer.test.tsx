import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { useCartStore } from '@/store/cart-store';
import { createProduct } from '@/test/fixtures';

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  SheetContent: ({ children }: { children: ReactNode }) => (
    <section>{children}</section>
  ),
  SheetHeader: ({ children }: { children: ReactNode }) => (
    <header>{children}</header>
  ),
  SheetTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

describe('CartDrawer', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCartStore.setState({ isCartOpen: false, items: [] });
  });

  afterEach(() => {
    useCartStore.setState({ isCartOpen: false, items: [] });
  });

  it('increments and removes a cart item through the drawer controls', async () => {
    const user = userEvent.setup();
    const product = createProduct();
    useCartStore.getState().addItem(product);

    render(<CartDrawer />);

    expect(screen.getByText(product.name)).toBeVisible();
    expect(useCartStore.getState().getCount()).toBe(1);

    await user.click(
      screen.getByRole('button', { name: 'Tăng số lượng' }),
    );
    expect(useCartStore.getState().getCount()).toBe(2);

    await user.click(screen.getByRole('button', { name: 'Remove item' }));
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(screen.getByText(/giỏ hàng của bạn đang trống/i)).toBeVisible();
  });
});
