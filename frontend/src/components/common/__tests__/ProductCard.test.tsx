import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductCard } from '@/components/common/ProductCard';
import { getWishlist } from '@/features/wishlist/wishlist-api';
import { formatPrice } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { createProduct } from '@/test/fixtures';

jest.mock('@/features/wishlist/wishlist-api', () => {
  const actual = jest.requireActual('@/features/wishlist/wishlist-api');
  return { ...actual, getWishlist: jest.fn() };
});

function renderProductCard(product = createProduct()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ProductCard product={product} />
    </QueryClientProvider>,
  );
}

describe('ProductCard', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.mocked(getWishlist).mockReset();
    useCartStore.setState({ isCartOpen: false, items: [] });
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('renders product links, price, descriptive images, and valid interactive DOM', () => {
    const product = createProduct();
    const { container } = renderProductCard(product);

    expect(screen.getByRole('heading', { name: product.name })).toBeVisible();
    expect(screen.getByText(formatPrice(product.basePrice))).toBeVisible();
    expect(
      screen.getByRole('link', { name: `Xem ${product.name}` }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: product.name })).toBeVisible();

    const productImages = container.querySelectorAll('img');
    expect(productImages).toHaveLength(2);
    expect(productImages[0]).toHaveAttribute('src', product.images[0].url);
    expect(productImages[0]).toHaveAttribute(
      'alt',
      product.images[0].altText || product.name,
    );
    expect(container.querySelector('a button, button a')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /danh sách yêu thích/i }),
    ).toBeVisible();
  });

  it('disables wishlist toggling until the authenticated wishlist is known', () => {
    const product = createProduct();
    jest.mocked(getWishlist).mockReturnValue(new Promise(() => undefined));
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
      },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
    });

    renderProductCard(product);

    const wishlistButton = screen.getByRole('button', {
      name: /danh sách yêu thích/i,
    });
    expect(wishlistButton).toBeDisabled();
    expect(wishlistButton).toHaveAttribute('aria-busy', 'true');
  });

  it('keeps the primary image visible when no hover image exists', () => {
    const product = createProduct({
      images: [createProduct().images[0]],
    });
    const { container } = renderProductCard(product);
    const card = container.querySelector('article');
    const primaryImage = container.querySelector('img');

    expect(card).not.toBeNull();
    expect(primaryImage).not.toBeNull();
    fireEvent.mouseEnter(card!);

    expect(primaryImage).toHaveClass('opacity-100');
    expect(primaryImage).not.toHaveClass('opacity-0');
    expect(primaryImage).toHaveClass('scale-[1.035]');
  });

  it('crossfades only after the hover image has loaded', async () => {
    const { container } = renderProductCard();
    const card = container.querySelector('article');
    const [primaryImage, secondaryImage] = Array.from(
      container.querySelectorAll('img'),
    );

    fireEvent.mouseEnter(card!);
    expect(primaryImage).toHaveClass('opacity-100');
    expect(secondaryImage).toHaveClass('opacity-0');

    fireEvent.load(secondaryImage);

    await waitFor(() => {
      expect(primaryImage).toHaveClass('opacity-0');
      expect(secondaryImage).toHaveClass('opacity-100');
    });
  });

  it('stages hover controls with outside-in motion and staggered delays', () => {
    const product = createProduct({
      variants: [
        {
          id: 'variant-be-m',
          sku: 'LINEN-BE-M',
          price: 429000,
          isActive: true,
          color: { id: 'be', name: 'Be', hexCode: '#e4d0aa' },
          size: { id: 'm', name: 'M', sortOrder: 1 },
          inventory: { quantity: 3, reserved: 0 },
        },
      ],
    });
    const { container } = renderProductCard(product);
    const wishlistButton = screen.getByRole('button', {
      name: `Thêm ${product.name} vào danh sách yêu thích`,
    });
    const quickViewButton = screen.getByRole('button', {
      name: `Xem nhanh ${product.name}`,
    });
    const quickAddPanel = container.querySelector(
      `#quick-add-${product.id}`,
    );
    const quickAddButton = screen.getByRole('button', { name: 'Thêm nhanh' });
    const colorButton = screen.getByRole('button', { name: 'Chọn màu Be' });

    expect(wishlistButton).toHaveClass(
      'transition-[color,background-color,opacity,translate]',
      'duration-500',
      'lg:translate-x-5',
      'lg:group-hover:translate-x-0',
      'lg:group-hover:delay-75',
    );
    expect(quickViewButton).toHaveClass(
      'transition-[color,background-color,opacity,translate]',
      'duration-[550ms]',
      'lg:translate-x-7',
      'lg:group-hover:delay-[140ms]',
    );
    expect(quickAddPanel).toHaveClass(
      'transition-[translate,opacity,background-color]',
      'duration-[600ms]',
      'lg:translate-y-[calc(100%+0.75rem)]',
      'lg:group-hover:translate-y-0',
    );
    expect(quickAddButton).toHaveClass(
      'transition-[color,background-color,opacity,translate]',
      'lg:translate-y-3',
      'lg:group-hover:delay-[320ms]',
    );
    expect(colorButton).toHaveClass(
      'rounded-full',
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-secondary',
    );
    expect(colorButton).not.toHaveClass(
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-background',
    );

    fireEvent.click(colorButton);

    expect(colorButton).toHaveClass(
      'border-primary',
      'ring-2',
      'ring-primary',
    );
    expect(colorButton).not.toHaveClass(
      'ring-offset-1',
      'ring-offset-background',
    );
  });
});
