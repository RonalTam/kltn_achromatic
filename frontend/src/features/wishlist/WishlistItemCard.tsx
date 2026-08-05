"use client";

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import {
  getInventoryAvailableStock,
  getVariantAvailableStock,
  useCartStore,
} from '@/store/cart-store';
import { getWishlistErrorMessage, type WishlistItem } from './wishlist-api';
import { useWishlist } from './use-wishlist';

function isVariantAvailable(variant: ProductVariant) {
  if (variant.isActive === false) return false;
  return (getVariantAvailableStock(variant) ?? 0) > 0;
}

function asCartProduct(item: WishlistItem): Product {
  return {
    ...item.product,
    sku: item.product.sku ?? item.product.id,
    images: item.product.images.map((image, index) => ({
      ...image,
      isPrimary: image.isPrimary ?? index === 0,
    })),
  };
}

export function WishlistItemCard({ item }: { item: WishlistItem }) {
  const { addItem } = useCartStore();
  const { removeItem, isRemoving, isMutating } = useWishlist();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [addedButNotRemoved, setAddedButNotRemoved] = useState(false);

  const product = useMemo(() => asCartProduct(item), [item]);
  const activeVariants = useMemo(
    () =>
      product.variants?.filter((variant) => variant.isActive !== false) ?? [],
    [product.variants],
  );
  const colors = useMemo(
    () =>
      [
        ...new Map(
          activeVariants
            .filter((variant) => variant.color)
            .map((variant) => [variant.color!.id, variant.color!]),
        ).values(),
      ],
    [activeVariants],
  );
  const sizes = useMemo(
    () =>
      [
        ...new Map(
          activeVariants
            .filter((variant) => variant.size)
            .map((variant) => [variant.size!.id, variant.size!]),
        ).values(),
      ].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [activeVariants],
  );

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const selectedVariant = activeVariants.find(
    (variant) =>
      (variant.color
        ? variant.color.id === selectedColor
        : selectedColor === null) &&
      (variant.size
        ? variant.size.id === selectedSize
        : selectedSize === null),
  );
  const image =
    product.images.find((candidate) => candidate.isPrimary) ?? product.images[0];
  const displayPrice = selectedVariant?.price ?? product.basePrice;
  const outOfStock = hasVariants
    ? !activeVariants.some(isVariantAvailable)
    : (getInventoryAvailableStock(product.inventory) ?? 0) < 1;
  const isBusy = isMoving || isRemoving || isMutating;

  const colorIsAvailable = (colorId: string) =>
    activeVariants.some(
      (variant) =>
        variant.color?.id === colorId &&
        (!selectedSize || !variant.size || variant.size.id === selectedSize) &&
        isVariantAvailable(variant),
    );

  const sizeIsAvailable = (sizeId: string) =>
    activeVariants.some(
      (variant) =>
        variant.size?.id === sizeId &&
        (!selectedColor || !variant.color || variant.color.id === selectedColor) &&
        isVariantAvailable(variant),
    );

  const selectColor = (colorId: string) => {
    const nextColor = selectedColor === colorId ? null : colorId;
    setSelectedColor(nextColor);
    setFeedback('');

    if (
      selectedSize &&
      nextColor &&
      !activeVariants.some(
        (variant) =>
          variant.color?.id === nextColor &&
          variant.size?.id === selectedSize &&
          isVariantAvailable(variant),
      )
    ) {
      setSelectedSize(null);
    }
  };

  const selectSize = (sizeId: string) => {
    const nextSize = selectedSize === sizeId ? null : sizeId;
    setSelectedSize(nextSize);
    setFeedback('');

    if (
      selectedColor &&
      nextSize &&
      !activeVariants.some(
        (variant) =>
          variant.color?.id === selectedColor &&
          variant.size?.id === nextSize &&
          isVariantAvailable(variant),
      )
    ) {
      setSelectedColor(null);
    }
  };

  const handleRemove = async () => {
    try {
      await removeItem(item);
      toast.info('Đã xóa khỏi danh sách yêu thích', {
        description: product.name,
      });
    } catch (error) {
      toast.error('Không thể xóa sản phẩm', {
        description: getWishlistErrorMessage(error),
      });
    }
  };

  const handleMoveToCart = async () => {
    setFeedback('');

    if (outOfStock) {
      setFeedback('Sản phẩm hiện đã hết hàng.');
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    if (
      hasVariants &&
      (!selectedVariant || !isVariantAvailable(selectedVariant))
    ) {
      const candidates = activeVariants
        .filter(isVariantAvailable)
        .filter(
          (variant) =>
            (!selectedColor || variant.color?.id === selectedColor) &&
            (!selectedSize || variant.size?.id === selectedSize),
        );
      const needsColor =
        !selectedColor && candidates.some((variant) => Boolean(variant.color));
      const needsSize =
        !selectedSize && candidates.some((variant) => Boolean(variant.size));

      if (
        needsColor &&
        needsSize &&
        !candidates.every((variant) => variant.color && variant.size)
      ) {
        setFeedback('Vui lòng chọn màu sắc hoặc kích cỡ.');
        return;
      }

      if (needsColor) {
        setFeedback('Vui lòng chọn màu sắc.');
        return;
      }

      if (needsSize) {
        setFeedback('Vui lòng chọn kích cỡ.');
        return;
      }

      setFeedback('Phiên bản đã chọn hiện không có sẵn.');
      toast.error('Sản phẩm không có sẵn');
      return;
    }

    const result = addItem(product, selectedVariant ?? null);
    if (!result.success) {
      const message =
        result.availableStock === null
          ? 'Không thể thêm sản phẩm vào giỏ hàng.'
          : `Chỉ còn ${result.availableStock} sản phẩm trong kho.`;
      setFeedback(message);
      toast.error('Không thể chuyển vào giỏ hàng', { description: message });
      return;
    }

    setIsMoving(true);
    try {
      await removeItem(item);
      toast.success('Đã chuyển vào giỏ hàng', {
        description: product.name,
        action: {
          label: 'Xem giỏ hàng',
          onClick: () => useCartStore.getState().openCart(),
        },
      });
    } catch (error) {
      setAddedButNotRemoved(true);
      setFeedback('Sản phẩm đã vào giỏ nhưng chưa thể xóa khỏi danh sách này.');
      toast.warning('Đã thêm vào giỏ hàng', {
        description: getWishlistErrorMessage(error),
      });
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <article className="flex h-full flex-col border border-border bg-card transition-colors duration-200 hover:border-primary/50">
      <div className="relative aspect-[3/4] overflow-hidden border-b border-border bg-accent">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`Xem ${product.name}`}
          className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.altText || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-muted-foreground">
              <Heart className="size-10 stroke-1" aria-hidden="true" />
            </span>
          )}
        </Link>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isBusy}
          aria-label={`Xóa ${product.name} khỏi danh sách yêu thích`}
          className="absolute right-3 top-3 flex size-10 items-center justify-center bg-background/90 text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-background hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/products/${product.slug}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {product.brand && (
            <p className="mb-1 font-heading text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              {product.brand.name}
            </p>
          )}
          <h2 className="line-clamp-2 font-heading text-sm font-medium leading-snug tracking-wide text-primary">
            {product.name}
          </h2>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-sans text-sm font-semibold text-primary">
            {formatPrice(displayPrice)}
          </span>
          {product.comparePrice &&
            Number(product.comparePrice) > Number(displayPrice) && (
              <span className="font-sans text-xs text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
        </div>

        {(colors.length > 0 || sizes.length > 0) && (
          <div className="mt-4 space-y-3 border-t border-border pt-3">
            {colors.length > 0 && (
              <fieldset>
                <legend className="mb-2 text-xs text-muted-foreground">Màu sắc</legend>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const available = colorIsAvailable(color.id);
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => selectColor(color.id)}
                        disabled={!available || isBusy}
                        aria-label={`Chọn màu ${color.name}`}
                        aria-pressed={selectedColor === color.id}
                        title={color.name}
                        className={`size-8 rounded-full border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                          selectedColor === color.id
                            ? 'border-primary ring-1 ring-primary ring-offset-2 ring-offset-background'
                            : 'border-border hover:border-primary'
                        } ${!available ? 'cursor-not-allowed opacity-30' : ''}`}
                        style={{ backgroundColor: color.hexCode }}
                      />
                    );
                  })}
                </div>
              </fieldset>
            )}

            {sizes.length > 0 && (
              <fieldset>
                <legend className="mb-2 text-xs text-muted-foreground">Kích cỡ</legend>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const available = sizeIsAvailable(size.id);
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => selectSize(size.id)}
                        disabled={!available || isBusy}
                        aria-pressed={selectedSize === size.id}
                        className={`min-h-10 min-w-10 border px-2 font-heading text-[10px] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          selectedSize === size.id
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-primary hover:border-primary'
                        } ${!available ? 'cursor-not-allowed opacity-30' : ''}`}
                      >
                        {size.name}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}
          </div>
        )}

        {feedback && (
          <p
            className="mt-3 text-xs leading-relaxed text-destructive"
            role="status"
            aria-live="polite"
          >
            {feedback}
          </p>
        )}

        <button
          type="button"
          onClick={handleMoveToCart}
          disabled={isBusy || addedButNotRemoved || outOfStock}
          className="mt-auto flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-3 py-3 font-heading text-[10px] uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isMoving ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Đang chuyển
            </>
          ) : outOfStock ? (
            'Hết hàng'
          ) : addedButNotRemoved ? (
            'Đã thêm vào giỏ'
          ) : (
            <>
              <ShoppingBag className="size-4" aria-hidden="true" />
              Chuyển vào giỏ hàng
            </>
          )}
        </button>
      </div>
    </article>
  );
}
