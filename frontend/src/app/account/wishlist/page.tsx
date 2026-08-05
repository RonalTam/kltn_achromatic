"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ChevronLeft,
  Heart,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { WishlistItemCard } from '@/features/wishlist/WishlistItemCard';
import { getWishlistErrorMessage } from '@/features/wishlist/wishlist-api';
import { useWishlist } from '@/features/wishlist/use-wishlist';
import { useAuthStore } from '@/store/auth-store';

function WishlistSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Đang tải danh sách yêu thích"
    >
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="animate-pulse border border-border bg-card"
          aria-hidden="true"
        >
          <div className="aspect-[3/4] bg-muted" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-1/3 bg-muted" />
            <div className="h-4 w-4/5 bg-muted" />
            <div className="h-4 w-2/5 bg-muted" />
            <div className="h-11 w-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [hasHydrated, setHasHydrated] = useState(false);
  const {
    items,
    count,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useWishlist();

  useEffect(() => {
    let active = true;
    const finishHydration = () => {
      if (active) setHasHydrated(true);
    };
    const fallbackTimer = window.setTimeout(finishHydration, 2000);
    const persistApi = useAuthStore.persist;

    if (!persistApi || persistApi.hasHydrated()) {
      const frame = requestAnimationFrame(finishHydration);
      return () => {
        active = false;
        window.clearTimeout(fallbackTimer);
        cancelAnimationFrame(frame);
      };
    }

    const unsubscribe = persistApi.onFinishHydration(finishHydration);
    void Promise.resolve(persistApi.rehydrate()).catch(finishHydration);

    return () => {
      active = false;
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hasHydrated && (!isAuthenticated || !user)) {
      router.replace('/account/login?redirect=/account/wishlist');
    }
  }, [hasHydrated, isAuthenticated, router, user]);

  const authIsReady = hasHydrated && Boolean(isAuthenticated && user);

  return (
    <div className="min-h-[100dvh] bg-background px-5 pb-16 pt-28 md:px-12 xl:px-20">
      <div className="mx-auto max-w-[1400px]">
        <Link
          href="/account"
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Quay lại tài khoản
        </Link>

        <div className="mb-8 flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-light tracking-tight text-primary md:text-4xl">
              Danh Sách Yêu Thích
            </h1>
            {authIsReady && !isLoading && !error && (
              <p className="mt-2 text-sm text-muted-foreground">
                {count > 0
                  ? `${count} sản phẩm đã lưu`
                  : 'Lưu sản phẩm để dễ dàng quay lại sau.'}
              </p>
            )}
          </div>
          {isFetching && !isLoading && (
            <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              Đang đồng bộ
            </span>
          )}
        </div>

        {!authIsReady || isLoading ? (
          <WishlistSkeleton />
        ) : error ? (
          <div
            className="border border-destructive/30 bg-destructive/5 px-6 py-14 text-center"
            role="alert"
          >
            <AlertCircle className="mx-auto mb-4 size-12 stroke-1 text-destructive" />
            <h2 className="font-heading text-xl text-primary">
              Không thể tải danh sách yêu thích
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              {getWishlistErrorMessage(error)}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mx-auto mt-6 inline-flex min-h-11 items-center justify-center gap-2 border border-primary bg-primary px-5 font-heading text-xs uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="border border-border bg-card px-6 py-20 text-center">
            <Heart className="mx-auto mb-4 size-16 stroke-1 text-muted-foreground" />
            <h2 className="font-heading text-xl text-primary">
              Danh sách yêu thích trống
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Chạm vào biểu tượng trái tim trên sản phẩm để lưu lại tại đây.
            </p>
            <Link
              href="/collections"
              className="mt-6 inline-flex min-h-11 items-center justify-center bg-primary px-6 font-heading text-xs uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <WishlistItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
