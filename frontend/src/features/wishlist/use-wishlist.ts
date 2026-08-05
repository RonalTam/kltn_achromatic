"use client";

import {
  useMutation,
  useIsMutating,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Product } from '@/lib/types';
import { useAuthStore } from '@/store/auth-store';
import {
  addWishlistItem,
  deleteWishlistItem,
  getWishlist,
  type Wishlist,
  type WishlistItem,
} from './wishlist-api';

export const wishlistKeys = {
  all: ['wishlist'] as const,
  user: (userId: string) => [...wishlistKeys.all, userId] as const,
};

type WishlistQueryKey = ReturnType<typeof wishlistKeys.user>;

interface AddMutationVariables {
  product: Product;
  queryKey: WishlistQueryKey;
}

interface RemoveMutationVariables {
  item: WishlistItem;
  queryKey: WishlistQueryKey;
}

export function useWishlist(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isEnabled =
    options.enabled !== false && Boolean(userId && isAuthenticated);
  const queryKey = wishlistKeys.user(userId ?? 'anonymous');
  const userMutationKey = [
    ...wishlistKeys.all,
    userId ?? 'anonymous',
  ] as const;
  const mutationScope = { id: `wishlist:${userId ?? 'anonymous'}` };
  const activeMutationCount = useIsMutating({
    mutationKey: userMutationKey,
  });

  const query = useQuery({
    queryKey,
    queryFn: getWishlist,
    enabled: isEnabled,
    retry: 1,
  });

  const addMutation = useMutation({
    mutationKey: [...userMutationKey, 'add'],
    scope: mutationScope,
    mutationFn: ({ product }: AddMutationVariables) =>
      addWishlistItem(product.id),
    onSuccess: (wishlist, variables) => {
      queryClient.setQueryData<Wishlist>(variables.queryKey, wishlist);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: variables.queryKey });
    },
  });

  const removeMutation = useMutation({
    mutationKey: [...userMutationKey, 'remove'],
    scope: mutationScope,
    mutationFn: ({ item }: RemoveMutationVariables) =>
      deleteWishlistItem(item.id),
    onSuccess: (wishlist, variables) => {
      queryClient.setQueryData<Wishlist>(variables.queryKey, wishlist);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: variables.queryKey });
    },
  });

  const items = isEnabled ? (query.data?.items ?? []) : [];

  return {
    wishlist: isEnabled ? query.data : undefined,
    items,
    count: items.length,
    isEnabled,
    isLoading: isEnabled && query.isPending,
    isReady: isEnabled && query.isSuccess,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    findItem: (productId: string) =>
      items.find((item) => item.productId === productId),
    addProduct: (product: Product) => {
      if (!userId) {
        return Promise.reject(
          new Error('Bạn cần đăng nhập để sử dụng danh sách yêu thích.'),
        );
      }
      return addMutation.mutateAsync({
        product,
        queryKey: wishlistKeys.user(userId),
      });
    },
    removeItem: (item: WishlistItem) => {
      if (!userId) {
        return Promise.reject(
          new Error('Bạn cần đăng nhập để sử dụng danh sách yêu thích.'),
        );
      }
      return removeMutation.mutateAsync({
        item,
        queryKey: wishlistKeys.user(userId),
      });
    },
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isMutating: activeMutationCount > 0,
  };
}
