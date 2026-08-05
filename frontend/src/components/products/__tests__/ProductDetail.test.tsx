import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductDetail } from '@/components/products/ProductDetail';
import { createProduct } from '@/test/fixtures';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/features/wishlist/use-wishlist', () => ({
  useWishlist: () => ({
    findItem: () => undefined,
    addProduct: jest.fn(),
    removeItem: jest.fn(),
    isMutating: false,
  }),
}));

jest.mock('@/components/products/ProductReviews', () => ({
  ProductReviews: () => <div>Nội dung đánh giá</div>,
}));

jest.mock('@/components/common/SizeGuideModal', () => ({
  SizeGuideModal: () => null,
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('ProductDetail tabs', () => {
  it('exposes tab semantics and moves focus with Arrow, Home and End', async () => {
    const user = userEvent.setup();
    render(
      <ProductDetail
        product={createProduct({
          description: 'Mô tả sản phẩm',
          reviewCount: 3,
          specifications: [{ label: 'Chất liệu', value: 'Linen' }],
        })}
      />,
    );

    expect(
      screen.getByRole('tablist', { name: 'Thông tin sản phẩm' }),
    ).toBeVisible();

    const descriptionTab = screen.getByRole('tab', { name: 'Mô tả' });
    const specsTab = screen.getByRole('tab', { name: 'Thông số' });
    const reviewsTab = screen.getByRole('tab', { name: 'Đánh giá (3)' });

    expect(descriptionTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('tabpanel', { name: 'Mô tả' }),
    ).toBeVisible();

    descriptionTab.focus();
    await user.keyboard('{ArrowRight}');
    expect(specsTab).toHaveFocus();
    expect(specsTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('tabpanel', { name: 'Thông số' }),
    ).toBeVisible();

    await user.keyboard('{End}');
    expect(reviewsTab).toHaveFocus();
    expect(reviewsTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('tabpanel', { name: 'Đánh giá (3)' }),
    ).toHaveTextContent('Nội dung đánh giá');

    await user.keyboard('{Home}');
    expect(descriptionTab).toHaveFocus();
    expect(descriptionTab).toHaveAttribute('aria-selected', 'true');
  });

  it('skips the optional specifications tab during arrow navigation', async () => {
    const user = userEvent.setup();
    render(
      <ProductDetail
        product={createProduct({
          description: 'Mô tả sản phẩm',
          reviewCount: 0,
          specifications: [],
        })}
      />,
    );

    const descriptionTab = screen.getByRole('tab', { name: 'Mô tả' });
    const reviewsTab = screen.getByRole('tab', { name: 'Đánh giá (0)' });
    descriptionTab.focus();

    await user.keyboard('{ArrowRight}');

    expect(reviewsTab).toHaveFocus();
    expect(reviewsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByRole('tab', { name: 'Thông số' })).not.toBeInTheDocument();
  });
});
