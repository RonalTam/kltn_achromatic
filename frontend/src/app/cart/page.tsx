"use client";

import React, { useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowRight,
  LogIn,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  getCartItemAvailableStock,
  useCartStore,
} from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const subscribeToHydration = () => () => undefined;

function CartBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative h-full w-full">
        <Image
          src="/cart/vietnam-cart-boutique-mobile-2k.png"
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-[78%_center] opacity-80 brightness-[0.68] saturate-[0.82] contrast-[1.06] md:hidden"
        />
        <Image
          src="/cart/vietnam-cart-boutique-2k.png"
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className="hidden object-cover object-center opacity-90 brightness-[0.68] saturate-[0.82] contrast-[1.06] md:block"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,25,37,0.66)_0%,rgba(14,29,42,0.54)_58%,rgba(9,20,31,0.48)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,15,23,0.20)_0%,rgba(7,15,23,0.01)_52%,rgba(7,15,23,0.10)_100%)]" />
      <div className="absolute inset-0 deco-grid-pattern opacity-25" />
    </div>
  );
}

function CartPageHeader({ count }: { count: number }) {
  return (
    <header>
      <nav
        aria-label="Đường dẫn trang"
        className="mb-5 flex items-center gap-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#AEB8C2]"
      >
        <Link
          href="/"
          className="transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none"
        >
          Trang chủ
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-[#82BCE8]">Giỏ hàng</span>
      </nav>

      <div className="accent-bar-left">
        <h1 className="heading-lg section-heading-accent text-[#F3F6F8]">
          Giỏ hàng
        </h1>
        <p className="mt-4 font-sans text-sm text-[#C6CED5]">
          {count} sản phẩm
        </p>
      </div>
    </header>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getTotal, getCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Prevent hydration flash because Zustand initializes from localStorage on the client.
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const subtotal = getTotal();
  const shipping = subtotal >= 500000 ? 0 : 30000;
  const total = subtotal + shipping;
  const hasStockIssue = items.some((item) => {
    const availableStock = getCartItemAvailableStock(item);
    return availableStock !== null && item.quantity > availableStock;
  });

  if (items.length === 0) {
    return (
      <main className="cart-page-shell relative isolate min-h-[100dvh] overflow-hidden bg-[#1A2631]">
        <CartBackdrop />

        <div className="page-top section-padding relative z-10 pb-16 md:pb-20">
          <div className="container-max">
            <CartPageHeader count={0} />

            <section className="flex min-h-[calc(100dvh-300px)] items-start pt-10 md:items-center md:pt-12">
              <div className="w-full max-w-[600px] border border-white/25 bg-[#F2F4F5]/95 p-8 shadow-[0_24px_70px_rgba(2,8,14,0.34)] backdrop-blur-[3px] md:p-12">
                <div className="mb-6 flex h-12 w-12 items-center justify-center bg-[#0F4C81] text-white">
                  <ShoppingBag className="h-6 w-6 stroke-[1.4]" />
                </div>
                <h2 className="font-heading text-2xl font-light tracking-tight text-primary md:text-3xl">
                  Giỏ hàng trống
                </h2>
                <p className="mb-8 mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm.
                </p>

                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <Link href="/collections">
                    <Button className="h-11 px-6">
                      Tiếp tục mua sắm
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link
                    href="/"
                    className="border-b border-[#0F4C81]/40 pb-1 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-[#0F4C81] transition-colors hover:border-[#0F4C81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C81]/30"
                  >
                    Quay về trang chính
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page-shell relative isolate min-h-[100dvh] overflow-x-clip bg-[#1A2631]">
      <CartBackdrop />

      <div className="page-top section-padding relative z-10 pb-16">
        <div className="container-max">
          <CartPageHeader count={getCount()} />

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Danh sách sản phẩm */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => {
                const price = Number(item.variant?.price ?? item.product.basePrice);
                const primaryImage = item.product.images?.[0]?.url ?? '';
                const availableStock = getCartItemAvailableStock(item);
                const reachedStockLimit =
                  availableStock !== null && item.quantity >= availableStock;
                const exceedsStock =
                  availableStock !== null && item.quantity > availableStock;

                return (
                  <article
                    key={item.id}
                    className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 border border-white/20 bg-[#F2F4F5]/95 p-3 shadow-[0_14px_40px_rgba(2,8,14,0.24)] backdrop-blur-[3px] transition-colors duration-200 hover:border-[#4C8FC5] sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-4 sm:p-4"
                  >
                    <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                      <div className="relative h-28 w-20 overflow-hidden border border-border bg-accent sm:h-32 sm:w-24">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={item.product.name}
                            fill
                            sizes="(max-width: 640px) 80px, 96px"
                            className="object-cover object-top"
                          />
                        ) : (
                          <ShoppingBag
                            className="absolute inset-0 m-auto size-7 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </Link>

                    <div className="flex min-w-0 flex-col">
                      <div className="mb-2 flex justify-between">
                        <div>
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="font-heading text-base font-medium text-primary hover:underline"
                          >
                            {item.product.name}
                          </Link>
                          {item.variant && (
                            <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                              {item.variant.color && (
                                <span>Màu: {item.variant.color.name}</span>
                              )}
                              {item.variant.size && (
                                <span>Kích cỡ: {item.variant.size.name}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex size-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Xóa sản phẩm"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center gap-3">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex size-11 items-center justify-center transition-colors hover:bg-accent disabled:opacity-40"
                            disabled={item.quantity <= 1}
                            aria-label="Giảm số lượng"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex size-11 items-center justify-center transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={reachedStockLimit}
                            aria-label="Tăng số lượng"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {availableStock !== null && (
                          <span
                            className={`order-last w-full text-xs sm:order-none sm:w-auto ${exceedsStock ? 'text-destructive' : 'text-muted-foreground'}`}
                          >
                            {exceedsStock
                              ? `Vượt tồn kho (còn ${availableStock})`
                              : `Còn ${availableStock} sản phẩm`}
                          </span>
                        )}

                        <span className="ml-auto font-sans text-base font-semibold text-primary">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Tóm tắt đơn hàng */}
            <aside className="lg:col-span-1">
              <div className="border border-white/20 bg-[#F2F4F5]/95 p-5 shadow-[0_18px_50px_rgba(2,8,14,0.28)] backdrop-blur-[3px] sm:p-6 lg:sticky lg:top-24">
                <h2 className="mb-6 font-heading text-lg uppercase tracking-wide text-primary">
                  Tóm tắt đơn hàng
                </h2>

                <div className="mb-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-semibold text-primary">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="font-semibold text-primary">
                      {shipping === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {subtotal < 500000 && (
                    <p className="bg-accent px-3 py-2 text-xs text-muted-foreground">
                      Mua thêm <strong>{formatPrice(500000 - subtotal)}</strong> để được miễn phí vận chuyển
                    </p>
                  )}
                  {hasStockIssue && (
                    <p className="border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                      Vui lòng giảm số lượng sản phẩm về mức tồn kho trước khi thanh toán.
                    </p>
                  )}
                  <div className="flex justify-between border-t border-border pt-4">
                    <span className="font-heading text-base uppercase tracking-wide text-primary">
                      Tổng cộng
                    </span>
                    <span className="font-sans text-2xl font-bold text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {!hydrated ? (
                  <div className="h-12 w-full animate-pulse rounded bg-muted" />
                ) : isAuthenticated && !hasStockIssue ? (
                  <Link href="/checkout">
                    <Button className="h-12 w-full font-heading text-sm uppercase tracking-wider">
                      Tiến hành thanh toán
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : isAuthenticated ? (
                  <Button
                    disabled
                    className="h-12 w-full font-heading text-sm uppercase tracking-wider"
                  >
                    Số lượng vượt tồn kho
                  </Button>
                ) : (
                  <div>
                    <Button
                      onClick={() => router.push('/account/login?redirect=/checkout')}
                      className="h-12 w-full font-heading text-sm uppercase tracking-wider"
                    >
                      <LogIn className="mr-2 h-4 w-4" />
                      Đăng nhập để thanh toán
                    </Button>
                    <p className="mt-2 text-center text-xs text-muted-foreground">
                      Bạn cần{' '}
                      <Link
                        href="/account/login?redirect=/checkout"
                        className="font-medium text-primary hover:underline"
                      >
                        đăng nhập
                      </Link>{' '}
                      hoặc{' '}
                      <Link
                        href="/account/register?redirect=/checkout"
                        className="font-medium text-primary hover:underline"
                      >
                        đăng ký
                      </Link>{' '}
                      để đặt hàng
                    </p>
                  </div>
                )}

                <Link href="/collections">
                  <Button
                    variant="outline"
                    className="mt-3 h-12 w-full font-heading text-sm uppercase tracking-wider"
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Link>

                <div className="mt-6 space-y-2 border-t border-border pt-5">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Thanh toán an toàn, bảo mật
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Đổi trả miễn phí trong 30 ngày
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
