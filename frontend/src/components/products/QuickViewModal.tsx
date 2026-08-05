"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import {
  getVariantAvailableStock,
  useCartStore,
} from '@/store/cart-store';

export default function QuickViewModal({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: Product;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const addItem = useCartStore((state) => state.addItem);

  const variants = useMemo(
    () => product.variants?.filter((variant) => variant.isActive !== false) ?? [],
    [product.variants],
  );
  const colors = useMemo(
    () =>
      [
        ...new Map(
          variants
            .filter((variant) => variant.color)
            .map((variant) => [variant.color!.id, variant.color!]),
        ).values(),
      ],
    [variants],
  );
  const sizes = useMemo(
    () =>
      [
        ...new Map(
          variants
            .filter((variant) => variant.size)
            .map((variant) => [variant.size!.id, variant.size!]),
        ).values(),
      ].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [variants],
  );
  const selectedVariant = variants.find(
    (variant) =>
      (colors.length === 0 || variant.color?.id === selectedColor) &&
      (sizes.length === 0 || variant.size?.id === selectedSize),
  );
  const image =
    selectedVariant?.imageUrl ||
    selectedVariant?.color?.imageUrl ||
    product.images?.[0]?.url;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const addToCart = () => {
    if (colors.length > 0 && !selectedColor) {
      setFeedback('Vui lòng chọn màu.');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      setFeedback('Vui lòng chọn kích cỡ.');
      return;
    }
    if (variants.length > 0 && !selectedVariant) {
      setFeedback('Phiên bản này hiện không có sẵn.');
      return;
    }
    if (
      selectedVariant &&
      (getVariantAvailableStock(selectedVariant) ?? 0) < 1
    ) {
      setFeedback('Phiên bản này đã hết hàng.');
      return;
    }
    const result = addItem(product, selectedVariant ?? null);
    if (!result.success) {
      setFeedback('Không thể thêm sản phẩm vào giỏ hàng.');
      return;
    }
    toast.success('Đã thêm vào giỏ hàng', { description: product.name });
    setFeedback('Đã thêm sản phẩm vào giỏ hàng.');
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
      aria-labelledby={`quick-view-title-${product.id}`}
      className="m-auto max-h-[90dvh] w-[min(92vw,900px)] overflow-y-auto border border-border bg-background p-0 text-primary shadow-2xl backdrop:bg-black/55"
    >
      <div className="relative grid md:grid-cols-[0.9fr_1.1fr]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex size-11 items-center justify-center border border-border bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Đóng xem nhanh"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
        <div className="relative min-h-80 bg-accent md:min-h-[560px]">
          {image ? (
            <Image
              src={image}
              alt={product.images?.[0]?.altText || product.name}
              fill
              sizes="(max-width: 767px) 92vw, 420px"
              className="object-cover object-top"
            />
          ) : (
            <div className="flex h-full min-h-80 items-center justify-center text-sm text-muted-foreground">
              Chưa có ảnh sản phẩm
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 md:p-10">
          {product.brand && (
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {product.brand.name}
            </p>
          )}
          <h2
            id={`quick-view-title-${product.id}`}
            className="font-heading text-2xl font-light tracking-tight sm:text-3xl"
          >
            {product.name}
          </h2>
          <p className="mt-3 text-xl font-semibold">
            {formatPrice(selectedVariant?.price ?? product.basePrice)}
          </p>
          {product.shortDescription && (
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          {colors.length > 0 && (
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-medium">Màu sắc</legend>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      setSelectedColor(color.id);
                      setFeedback('');
                    }}
                    className={`size-11 rounded-full border-2 ${
                      selectedColor === color.id
                        ? 'border-primary ring-1 ring-primary ring-offset-2'
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: color.hexCode }}
                    aria-label={`Chọn màu ${color.name}`}
                    aria-pressed={selectedColor === color.id}
                  />
                ))}
              </div>
            </fieldset>
          )}

          {sizes.length > 0 && (
            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-medium">Kích cỡ</legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size.id);
                      setFeedback('');
                    }}
                    className={`min-h-11 min-w-11 border px-3 text-sm ${
                      selectedSize === size.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border'
                    }`}
                    aria-pressed={selectedSize === size.id}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {feedback && (
            <p className="mt-4 text-sm text-muted-foreground" role="status">
              {feedback}
            </p>
          )}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={addToCart}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {feedback.startsWith('Đã thêm') ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <ShoppingBag className="size-4" aria-hidden="true" />
              )}
              Thêm vào giỏ
            </button>
            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="inline-flex min-h-12 items-center justify-center border border-primary px-5 text-sm font-semibold text-primary transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </dialog>
  );
}
