"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import {
  getVariantAvailableStock,
  useCartStore,
} from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { useWishlist } from '@/features/wishlist/use-wishlist';
import { getWishlistErrorMessage } from '@/features/wishlist/wishlist-api';
import { toast } from 'sonner';

const QuickViewModal = dynamic(
  () => import('@/components/products/QuickViewModal'),
  { ssr: false },
);

interface ProductCardProps {
  product: Product;
  className?: string;
}

function variantStock(variant: ProductVariant) {
  return getVariantAvailableStock(variant);
}

function variantIsAvailable(variant: ProductVariant) {
  if (variant.isActive === false) return false;
  const stock = variantStock(variant);
  return stock !== null && stock > 0;
}

export function ProductCard({ product, className = '' }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [secondaryImageReady, setSecondaryImageReady] = useState(false);
  const [secondaryImageFailed, setSecondaryImageFailed] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [swatchPreview, setSwatchPreview] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const {
    findItem,
    addProduct,
    removeItem,
    isReady: isWishlistReady,
    isMutating: isWishlistMutating,
  } = useWishlist();
  const wishlistItem = findItem(product.id);
  const wishlisted = Boolean(wishlistItem);

  const primaryImageEntry =
    product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
  const primaryImage = primaryImageEntry?.url ?? '';
  const secondaryImageEntry = product.images?.find(
    (image) => image.url && image.url !== primaryImage,
  );
  const secondaryImage = secondaryImageEntry?.url ?? '';
  const currentPrimaryImage = swatchPreview || primaryImage;
  const canShowSecondaryImage =
    Boolean(secondaryImage) &&
    secondaryImageReady &&
    !secondaryImageFailed &&
    !swatchPreview;
  const showSecondaryImage = hovered && canShowSecondaryImage;
  const activeVariants = useMemo(
    () => product.variants?.filter((variant) => variant.isActive !== false) ?? [],
    [product.variants]
  );
  const productHasVariants = (product.variants?.length ?? 0) > 0;
  const colors = useMemo(
    () => [...new Map(activeVariants.filter(v => v.color).map(v => [v.color!.id, v.color!])).values()],
    [activeVariants]
  );
  const sizes = useMemo(
    () => [...new Map(activeVariants.filter(v => v.size).map(v => [v.size!.id, v.size!])).values()]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [activeVariants]
  );
  const selectedVariant = activeVariants.find(
    (variant) =>
      (variant.color
        ? variant.color.id === selectedColor
        : selectedColor === null) &&
      (variant.size
        ? variant.size.id === selectedSize
        : selectedSize === null),
  );

  const discount = product.comparePrice
    ? getDiscountPercent(product.basePrice, product.comparePrice)
    : 0;

  const preventCardNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const colorIsAvailable = (colorId: string) =>
    activeVariants.some(
      (variant) =>
        variant.color?.id === colorId &&
        (!selectedSize || !variant.size || variant.size.id === selectedSize) &&
        variantIsAvailable(variant)
    );

  const sizeIsAvailable = (sizeId: string) =>
    activeVariants.some(
      (variant) =>
        variant.size?.id === sizeId &&
        (!selectedColor || !variant.color || variant.color.id === selectedColor) &&
        variantIsAvailable(variant)
    );

  const handleColorSelect = (e: React.MouseEvent, colorId: string) => {
    preventCardNavigation(e);
    const nextColor = selectedColor === colorId ? null : colorId;
    setSelectedColor(nextColor);
    setSelectionMessage('');

    if (
      selectedSize &&
      nextColor &&
      !activeVariants.some(
        (variant) =>
          variant.color?.id === nextColor &&
          variant.size?.id === selectedSize &&
          variantIsAvailable(variant)
      )
    ) {
      setSelectedSize(null);
    }
  };

  const handleSizeSelect = (e: React.MouseEvent, sizeId: string) => {
    preventCardNavigation(e);
    const nextSize = selectedSize === sizeId ? null : sizeId;
    setSelectedSize(nextSize);
    setSelectionMessage('');

    if (
      selectedColor &&
      nextSize &&
      !activeVariants.some(
        (variant) =>
          variant.color?.id === selectedColor &&
          variant.size?.id === nextSize &&
          variantIsAvailable(variant)
      )
    ) {
      setSelectedColor(null);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    preventCardNavigation(e);

    if (productHasVariants && (!selectedVariant || !variantIsAvailable(selectedVariant))) {
      const candidates = activeVariants
        .filter(variantIsAvailable)
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
        setSelectionMessage('Chọn màu hoặc size');
        return;
      }

      if (needsColor) {
        setSelectionMessage('Chọn màu');
        return;
      }

      if (needsSize) {
        setSelectionMessage('Chọn size');
        return;
      }

      setSelectionMessage('Hết hàng');
      toast.error('Sản phẩm này hiện đã hết hàng');
      return;
    }

    const result = addItem(product, selectedVariant ?? null);
    if (!result.success) {
      setAddedToCart(false);
      const msg =
        result.availableStock === null
          ? 'Không thể thêm sản phẩm vào giỏ hàng'
          : `Chỉ còn ${result.availableStock} sản phẩm trong kho`;
      setSelectionMessage(
        result.availableStock === null ? 'Không thể thêm' : `Chỉ còn ${result.availableStock}`,
      );
      toast.error(msg);
      return;
    }

    setAddedToCart(true);
    setSelectionMessage('');
    setTimeout(() => setAddedToCart(false), 2000);

    toast.success(`Đã thêm vào giỏ hàng`, {
      description: product.name,
      action: {
        label: 'Xem giỏ hàng',
        onClick: () => useCartStore.getState().openCart(),
      },
      duration: 3000,
    });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    preventCardNavigation(e);

    if (!isAuthenticated || !user) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      window.location.assign(
        `/account/login?redirect=${encodeURIComponent(currentPath)}`,
      );
      return;
    }

    if (!isWishlistReady) return;

    try {
      if (wishlistItem) {
        await removeItem(wishlistItem);
        toast.info('Đã xóa khỏi danh sách yêu thích', {
          description: product.name,
          duration: 2000,
        });
        return;
      }

      await addProduct(product);
      toast.success('Đã thêm vào danh sách yêu thích', {
        description: product.name,
        duration: 2500,
      });
    } catch (error) {
      toast.error(
        wishlistItem
          ? 'Không thể xóa khỏi danh sách yêu thích'
          : 'Không thể thêm vào danh sách yêu thích',
        { description: getWishlistErrorMessage(error) },
      );
    }
  };

  return (
    <article
      className={`group flex w-full flex-col ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setSwatchPreview(null);
      }}
    >
      {/* Image Container */}
      <div className="relative mb-4 aspect-[3/4] overflow-hidden border border-border/40 bg-[#F1F1EF]">
        <Link
          href={`/products/${product.slug}`}
          aria-label={`Xem ${product.name}`}
          className="absolute inset-0 z-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          {currentPrimaryImage ? (
            <>
              <Image
                alt={primaryImageEntry?.altText || product.name}
                fill
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                className={`absolute inset-0 object-cover object-top transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none ${
                  showSecondaryImage
                    ? 'scale-[1.025] opacity-0'
                    : hovered
                      ? 'scale-[1.035] opacity-100'
                      : 'scale-100 opacity-100'
                }`}
                src={currentPrimaryImage}
              />
              {secondaryImage && (
                <Image
                  alt={`${product.name}, ảnh thay thế`}
                  fill
                  sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                  className={`absolute inset-0 object-cover object-top transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none ${
                    showSecondaryImage
                      ? 'scale-[1.025] opacity-100'
                      : 'scale-100 opacity-0'
                  }`}
                  src={secondaryImage}
                  onLoad={() => setSecondaryImageReady(true)}
                  onError={() => {
                    setSecondaryImageFailed(true);
                    setSecondaryImageReady(false);
                  }}
                />
              )}
            </>
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Chưa có ảnh
            </span>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-primary text-primary-foreground font-heading text-[9px] tracking-[0.15em] px-2 py-1 uppercase">
              Mới
            </span>
          )}
          {discount > 0 && (
            <span className="bg-destructive text-white font-heading text-[9px] tracking-[0.15em] px-2 py-1 uppercase">
              -{discount}%
            </span>
          )}
          {product.isBestSeller && !product.isNewArrival && (
            <span className="bg-secondary text-white font-heading text-[9px] tracking-[0.15em] px-2 py-1 uppercase">
              Bán chạy
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          disabled={
            isWishlistMutating || (isAuthenticated && !isWishlistReady)
          }
          className="absolute right-3 top-3 z-30 flex size-11 items-center justify-center bg-background/85 opacity-100 shadow-sm backdrop-blur-sm transition-[color,background-color,opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none lg:pointer-events-none lg:translate-x-5 lg:opacity-0 lg:delay-0 lg:group-hover:pointer-events-auto lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:group-hover:delay-75 lg:group-focus-within:pointer-events-auto lg:group-focus-within:translate-x-0 lg:group-focus-within:opacity-100 lg:group-focus-within:delay-75 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={
            wishlisted
              ? `Xóa ${product.name} khỏi danh sách yêu thích`
              : `Thêm ${product.name} vào danh sách yêu thích`
          }
          aria-pressed={wishlisted}
          aria-busy={isAuthenticated && !isWishlistReady}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-destructive stroke-destructive' : 'stroke-primary'}`}
          />
        </button>

        <button
          type="button"
          onClick={(event) => {
            preventCardNavigation(event);
            setQuickViewOpen(true);
          }}
          className="absolute right-3 top-16 z-30 flex size-11 items-center justify-center bg-background/85 opacity-100 shadow-sm backdrop-blur-sm transition-[color,background-color,opacity,translate] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none motion-reduce:transition-none lg:pointer-events-none lg:translate-x-7 lg:opacity-0 lg:delay-0 lg:group-hover:pointer-events-auto lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:group-hover:delay-[140ms] lg:group-focus-within:pointer-events-auto lg:group-focus-within:translate-x-0 lg:group-focus-within:opacity-100 lg:group-focus-within:delay-[140ms]"
          aria-label={`Xem nhanh ${product.name}`}
        >
          <Eye className="size-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setQuickAddOpen((open) => !open)}
          className="absolute right-3 top-[7.25rem] z-30 flex size-11 items-center justify-center bg-background/85 shadow-sm backdrop-blur-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          aria-label={`${quickAddOpen ? 'Đóng' : 'Mở'} tùy chọn mua nhanh ${product.name}`}
          aria-expanded={quickAddOpen}
          aria-controls={`quick-add-${product.id}`}
        >
          <ShoppingBag className="size-4" />
        </button>

        {/* Quick Add Panel */}
        <div
          id={`quick-add-${product.id}`}
          className={`absolute bottom-0 left-0 z-20 w-full border-t border-white/25 bg-background/90 p-2 opacity-100 shadow-sm backdrop-blur-[2px] transition-[translate,opacity,background-color] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none lg:pointer-events-none lg:translate-y-[calc(100%+0.75rem)] lg:bg-background/45 lg:p-3 lg:opacity-0 lg:delay-0 lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:delay-75 lg:group-focus-within:pointer-events-auto lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-focus-within:delay-75 ${
            quickAddOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {colors.length > 0 && (
            <div className="mb-2 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:delay-[180ms] lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-focus-within:delay-[180ms]">
              <div className="flex flex-wrap gap-1.5">
                {colors.map((color) => {
                  const available = colorIsAvailable(color.id);

                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={(e) => handleColorSelect(e, color.id)}
                      disabled={!available}
                      className={`size-11 rounded-full border transition-[border-color,box-shadow,scale] duration-300 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary motion-reduce:transform-none motion-reduce:transition-none lg:size-7 ${
                        selectedColor === color.id
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary'
                      } ${!available ? 'cursor-not-allowed opacity-35' : ''}`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                      onMouseEnter={() => {
                        const variant = activeVariants.find(
                          (item) =>
                            item.color?.id === color.id &&
                            (item.imageUrl || item.color?.imageUrl),
                        );
                        setSwatchPreview(
                          variant?.imageUrl || variant?.color?.imageUrl || null,
                        );
                      }}
                      onFocus={() => {
                        const variant = activeVariants.find(
                          (item) =>
                            item.color?.id === color.id &&
                            (item.imageUrl || item.color?.imageUrl),
                        );
                        setSwatchPreview(
                          variant?.imageUrl || variant?.color?.imageUrl || null,
                        );
                      }}
                      aria-label={`Chọn màu ${color.name}`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mb-2 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:delay-[250ms] lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-focus-within:delay-[250ms]">
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((size) => {
                  const available = sizeIsAvailable(size.id);

                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={(e) => handleSizeSelect(e, size.id)}
                      disabled={!available}
                      className={`min-h-11 min-w-11 border px-2 py-2 font-heading text-[10px] uppercase transition-[color,background-color,border-color,translate] duration-300 ease-out hover:-translate-y-px motion-reduce:transform-none motion-reduce:transition-none lg:min-h-8 lg:min-w-8 lg:py-1.5 ${
                        selectedSize === size.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background/50 text-primary backdrop-blur-[1px] hover:border-primary'
                      } ${!available ? 'cursor-not-allowed text-muted-foreground opacity-35' : ''}`}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            className="flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-2 py-3 font-heading text-[10px] uppercase tracking-[0.16em] text-primary-foreground transition-[color,background-color,opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-primary/90 active:translate-y-px motion-reduce:transform-none motion-reduce:transition-none lg:translate-y-3 lg:opacity-0 lg:tracking-[0.2em] lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:delay-[320ms] lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-focus-within:delay-[320ms]"
          >
            {addedToCart ? (
              <>
                <span>✓</span>
                Đã thêm
              </>
            ) : selectionMessage ? (
              <>{selectionMessage}</>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                Thêm nhanh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {product.brand && (
          <p className="font-heading text-[10px] text-muted-foreground tracking-[0.15em] uppercase">
            {product.brand.name}
          </p>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="font-heading text-sm font-medium text-primary leading-snug tracking-wide line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.avgRating && Number(product.avgRating) > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(Number(product.avgRating))
                      ? 'fill-primary stroke-primary'
                      : 'stroke-muted-foreground'
                  }`}
                />
              ))}
            </div>
            {product.reviewCount != null && product.reviewCount > 0 && (
              <span className="text-[10px] text-[#4D4D4D]">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-sans text-sm text-primary font-semibold">
            {formatPrice(product.basePrice)}
          </span>
          {product.comparePrice && Number(product.comparePrice) > Number(product.basePrice) && (
            <span className="font-sans text-xs text-muted-foreground line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Colors available */}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-0.5 pt-0.5">
            {colors.slice(0, 5).map((color) => (
              <button
                key={color.id}
                type="button"
                className="flex size-11 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={color.name}
                aria-label={`Xem trước màu ${color.name} của ${product.name}`}
                onMouseEnter={() => {
                  const variant = activeVariants.find(
                    (item) =>
                      item.color?.id === color.id &&
                      (item.imageUrl || item.color?.imageUrl),
                  );
                  setSwatchPreview(
                    variant?.imageUrl || variant?.color?.imageUrl || null,
                  );
                }}
                onMouseLeave={() => setSwatchPreview(null)}
                onFocus={() => {
                  const variant = activeVariants.find(
                    (item) =>
                      item.color?.id === color.id &&
                      (item.imageUrl || item.color?.imageUrl),
                  );
                  setSwatchPreview(
                    variant?.imageUrl || variant?.color?.imageUrl || null,
                  );
                }}
                onBlur={() => setSwatchPreview(null)}
              >
                <span
                  className="size-5 rounded-full border border-border/70"
                  style={{ backgroundColor: color.hexCode }}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {quickViewOpen && (
        <QuickViewModal
          open={quickViewOpen}
          product={product}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </article>
  );
}
