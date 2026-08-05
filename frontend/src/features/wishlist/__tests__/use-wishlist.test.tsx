import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  addWishlistItem,
  deleteWishlistItem,
  getWishlist,
  type Wishlist,
} from '@/features/wishlist/wishlist-api';
import {
  useWishlist,
  wishlistKeys,
} from '@/features/wishlist/use-wishlist';
import { useAuthStore } from '@/store/auth-store';
import { createProduct } from '@/test/fixtures';

jest.mock('@/features/wishlist/wishlist-api', () => {
  const actual = jest.requireActual('@/features/wishlist/wishlist-api');
  return {
    ...actual,
    getWishlist: jest.fn(),
    addWishlistItem: jest.fn(),
    deleteWishlistItem: jest.fn(),
  };
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function makeWishlist(userId: string, withItem = false): Wishlist {
  const product = createProduct();
  return {
    id: `wishlist-${userId}`,
    userId,
    items: withItem
      ? [
          {
            id: `item-${userId}`,
            wishlistId: `wishlist-${userId}`,
            productId: product.id,
            addedAt: '2026-07-18T00:00:00.000Z',
            product,
          },
        ]
      : [],
  };
}

function setSignedInUser(id: string) {
  useAuthStore.setState({
    user: {
      id,
      email: `${id}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      role: 'CUSTOMER',
    },
    accessToken: `token-${id}`,
    isAuthenticated: true,
    isLoading: false,
  });
}

function createHarness() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useWishlist', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.mocked(getWishlist).mockReset();
    jest.mocked(addWishlistItem).mockReset();
    jest.mocked(deleteWishlistItem).mockReset();
    setSignedInUser('user-1');
  });

  it('stays unready until the signed-in user wishlist resolves', async () => {
    const request = deferred<Wishlist>();
    jest.mocked(getWishlist).mockReturnValue(request.promise);
    const { wrapper } = createHarness();
    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isReady).toBe(false);

    act(() => request.resolve(makeWishlist('user-1', true)));

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.count).toBe(1);
  });

  it('writes a pending mutation response back to the user that started it', async () => {
    const added = makeWishlist('user-1', true);
    const userTwoWishlist = makeWishlist('user-2');
    const mutation = deferred<Wishlist>();
    jest
      .mocked(getWishlist)
      .mockResolvedValueOnce(makeWishlist('user-1'))
      .mockResolvedValueOnce(userTwoWishlist);
    jest.mocked(addWishlistItem).mockReturnValue(mutation.promise);
    const { queryClient, wrapper } = createHarness();
    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));
    let mutationPromise!: Promise<Wishlist>;
    act(() => {
      mutationPromise = result.current.addProduct(createProduct());
    });
    await waitFor(() => expect(addWishlistItem).toHaveBeenCalledTimes(1));

    act(() => setSignedInUser('user-2'));
    await waitFor(() =>
      expect(queryClient.getQueryData(wishlistKeys.user('user-2'))).toEqual(
        userTwoWishlist,
      ),
    );
    act(() => mutation.resolve(added));
    await act(async () => mutationPromise);

    expect(queryClient.getQueryData(wishlistKeys.user('user-1'))).toEqual(added);
    expect(queryClient.getQueryData(wishlistKeys.user('user-2'))).toEqual(
      userTwoWishlist,
    );
  });

  it('serializes add and remove mutations for the same user', async () => {
    const initial = makeWishlist('user-1', true);
    const addRequest = deferred<Wishlist>();
    jest.mocked(getWishlist).mockResolvedValue(initial);
    jest.mocked(addWishlistItem).mockReturnValue(addRequest.promise);
    jest.mocked(deleteWishlistItem).mockResolvedValue(makeWishlist('user-1'));
    const { wrapper } = createHarness();
    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => expect(result.current.isReady).toBe(true));
    let addPromise!: Promise<Wishlist>;
    let removePromise!: Promise<Wishlist>;
    act(() => {
      addPromise = result.current.addProduct(createProduct());
      removePromise = result.current.removeItem(initial.items[0]);
    });

    await waitFor(() => expect(addWishlistItem).toHaveBeenCalledTimes(1));
    expect(deleteWishlistItem).not.toHaveBeenCalled();

    act(() => addRequest.resolve(initial));
    await act(async () => addPromise);
    await waitFor(() => expect(deleteWishlistItem).toHaveBeenCalledTimes(1));
    await act(async () => removePromise);
  });
});
