import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '@/components/common/FilterPanel';

const mockPush = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock('next/navigation', () => ({
  usePathname: () => '/collections',
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams(),
}));

const filterOptions = {
  categories: [{ id: 'category-1', name: 'Shirts', slug: 'shirts' }],
  brands: [{ id: 'brand-1', name: 'Achromatic', slug: 'achromatic' }],
  sizes: [{ id: 'size-1', name: 'M' }],
  colors: [{ id: 'color-1', name: 'Black', hexCode: '#000000' }],
};

describe('FilterPanel', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('applies a category filter and resets pagination', async () => {
    const user = userEvent.setup();
    render(<FilterPanel {...filterOptions} />);

    await user.click(screen.getAllByRole('button', { name: 'Shirts' })[0]);

    expect(mockPush).toHaveBeenCalledWith(
      '/collections?category=shirts&page=1',
    );
  });

  it('resets all active filters back to the collection pathname', async () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams('category=shirts&minPrice=0&maxPrice=1000000'),
    );
    const user = userEvent.setup();
    render(<FilterPanel {...filterOptions} />);

    await user.click(
      screen.getAllByRole('button', { name: /clear filters/i })[0],
    );

    expect(mockPush).toHaveBeenCalledWith('/collections');
  });
});
