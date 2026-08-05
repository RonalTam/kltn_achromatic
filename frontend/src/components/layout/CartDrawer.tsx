"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, X, Minus, Plus, ArrowRight } from 'lucide-react';
import {
  getCartItemAvailableStock,
  useCartStore,
} from '@/store/cart-store';
import { formatPrice } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function CartDrawer() {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, getTotal, getCount } = useCartStore();

  const total = getTotal();
  const count = getCount();
  const hasStockIssue = items.some((item) => {
    const availableStock = getCartItemAvailableStock(item);
    return availableStock !== null && item.quantity > availableStock;
  });

  return (
    <Sheet open={isCartOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-md bg-background border-l border-border p-0 flex flex-col">
        <SheetHeader className="border-b border-border p-4 sm:p-6">
          <div className="flex justify-between items-center w-full">
            <SheetTitle className="font-heading uppercase tracking-widest text-sm text-primary flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Giỏ Hàng ({count})
            </SheetTitle>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 text-center sm:p-6">
            <ShoppingBag className="w-12 h-12 stroke-[1] text-muted-foreground mb-4" />
            <p className="font-heading uppercase tracking-widest text-sm text-muted-foreground mb-6">
              Giỏ hàng của bạn đang trống
            </p>
            <Button 
              variant="outline" 
              onClick={closeCart} 
              className="rounded-none border-border hover:bg-accent font-heading uppercase tracking-widest text-xs h-12 px-8"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {items.map((item) => {
              const price = Number(item.variant?.price ?? item.product.basePrice);
              const primaryImage = item.product.images?.[0]?.url ?? '';
              const availableStock = getCartItemAvailableStock(item);
              const reachedStockLimit =
                availableStock !== null && item.quantity >= availableStock;
              const exceedsStock =
                availableStock !== null && item.quantity > availableStock;

              return (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                  {/* Image */}
                  <Link 
                    href={`/products/${item.product.slug}`} 
                    onClick={closeCart}
                    className="flex-shrink-0"
                  >
                    <div className="relative h-28 w-20 border border-border bg-accent">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <ShoppingBag
                          className="absolute inset-0 m-auto size-7 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 flex flex-col text-sm">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="mb-1 flex size-11 self-end items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Remove item"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={closeCart}
                      className="font-heading text-sm font-medium text-primary hover:underline line-clamp-2 mb-1"
                    >
                      {item.product.name}
                    </Link>

                    {item.variant && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {item.variant.color && <span>{item.variant.color.name}</span>}
                        {item.variant.color && item.variant.size && <span> / </span>}
                        {item.variant.size && <span>{item.variant.size.name}</span>}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex size-11 items-center justify-center transition-colors hover:bg-accent"
                          disabled={item.quantity <= 1}
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex size-11 items-center justify-center transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={reachedStockLimit}
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-sans text-sm font-semibold text-primary">
                        {formatPrice(price * item.quantity)}
                      </span>
                    </div>

                    {availableStock !== null && (
                      <p
                        className={`mt-2 text-[11px] ${exceedsStock ? 'text-destructive' : 'text-muted-foreground'}`}
                      >
                        {exceedsStock
                          ? `Vượt tồn kho (còn ${availableStock})`
                          : `Còn ${availableStock} sản phẩm`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-border bg-accent/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:p-6">
          <div className="flex justify-between items-center mb-6 font-sans">
            <span className="text-sm text-muted-foreground">Tạm tính</span>
            <span className="font-medium text-lg">{formatPrice(total)}</span>
          </div>
          <Link href="/cart" onClick={closeCart}>
            <Button className="w-full mb-3 rounded-none bg-background border border-border text-primary hover:bg-accent font-heading uppercase tracking-widest text-xs h-12">
              Xem giỏ hàng
            </Button>
          </Link>
          {!hasStockIssue ? (
            <Link href="/checkout" onClick={closeCart}>
              <Button
                disabled={items.length === 0}
                className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-heading uppercase tracking-widest text-xs h-14 group"
              >
                Thanh Toán
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Button
              disabled
              className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-heading uppercase tracking-widest text-xs h-14"
            >
              Số lượng vượt tồn kho
            </Button>
          )}
          <p className="text-center text-[10px] text-muted-foreground mt-4 font-heading uppercase tracking-widest">
            Thuế và phí vận chuyển sẽ được tính lúc thanh toán
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
