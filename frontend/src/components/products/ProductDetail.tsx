"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Loader2, Minus, Plus, ShoppingBag, Star, Truck, Shield, RefreshCw } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import {
  getInventoryAvailableStock,
  getVariantAvailableStock,
  useCartStore,
} from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { SizeGuideModal } from '@/components/common/SizeGuideModal';
import { ProductReviews } from '@/components/products/ProductReviews';
import { useWishlist } from '@/features/wishlist/use-wishlist';
import { getWishlistErrorMessage } from '@/features/wishlist/wishlist-api';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { addRecentlyViewed } from '@/lib/recently-viewed';
import { ProductShare } from './ProductShare';

interface ProductDetailProps {
  product: Product;
}

type ProductTab = 'description' | 'specs' | 'reviews';

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductTab>('description');
  const [feedback, setFeedback] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const tabRefs = useRef<Record<ProductTab, HTMLButtonElement | null>>({
    description: null,
    specs: null,
    reviews: null,
  });

  const { addItem } = useCartStore();
  const {
    findItem,
    addProduct,
    removeItem,
    isMutating: isWishlistMutating,
  } = useWishlist();
  const wishlistItem = findItem(product.id);
  const wishlisted = Boolean(wishlistItem);
  const availableTabs: ProductTab[] = product.specifications?.length
    ? ['description', 'specs', 'reviews']
    : ['description', 'reviews'];

  useEffect(() => {
    addRecentlyViewed(product);
  }, [product]);

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentTab: ProductTab,
  ) => {
    if (
      event.key !== 'ArrowLeft' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'Home' &&
      event.key !== 'End'
    ) {
      return;
    }

    event.preventDefault();
    const currentIndex = availableTabs.indexOf(currentTab);
    let nextIndex = currentIndex;

    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = availableTabs.length - 1;
    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % availableTabs.length;
    }
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + availableTabs.length) % availableTabs.length;
    }

    const nextTab = availableTabs[nextIndex];
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  // Get unique colors and sizes
  const colors = product.variants
    ? [...new Map(product.variants.filter(v => v.color).map(v => [v.color!.id, v.color!])).values()]
    : [];
  
  const sizes = product.variants
    ? [...new Map(product.variants.filter(v => v.size).map(v => [v.size!.id, v.size!])).values()]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];

  // Find selected variant
  const hasRequiredSelection =
    (colors.length === 0 || Boolean(selectedColor)) &&
    (sizes.length === 0 || Boolean(selectedSize));

  const selectedVariant = hasRequiredSelection
    ? product.variants?.find(
        v =>
          (colors.length === 0 || v.color?.id === selectedColor) &&
          (sizes.length === 0 || v.size?.id === selectedSize)
      )
    : undefined;
  const currentImage =
    selectedVariant?.imageUrl ||
    selectedVariant?.color?.imageUrl ||
    product.images[selectedImage]?.url;
  const productHasVariants = (product.variants?.length ?? 0) > 0;

  // Get price
  const finalPrice = selectedVariant?.price ?? product.basePrice;
  const discount = product.comparePrice ? getDiscountPercent(finalPrice, product.comparePrice) : 0;

  // Check stock
  const availableStock = selectedVariant
    ? getVariantAvailableStock(selectedVariant)
    : productHasVariants
      ? null
      : getInventoryAvailableStock(product.inventory);
  const inStock = selectedVariant || !productHasVariants
    ? (availableStock ?? 0) > 0
    : true;

  const handleAddToCart = () => {
    if (colors.length > 0 && !selectedColor) {
      setFeedback('Vui lòng chọn màu sắc trước khi thêm vào giỏ hàng.');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      setFeedback('Vui lòng chọn kích cỡ trước khi thêm vào giỏ hàng.');
      return;
    }
    if (!selectedVariant && product.variants && product.variants.length > 0) {
      setFeedback('Phiên bản sản phẩm này hiện không có sẵn.');
      toast.error('Sản phẩm không có sẵn', { description: 'Phiên bản bạn chọn hiện không có sẵn.' });
      return;
    }
    if (!inStock) {
      setFeedback('Sản phẩm hiện đã hết hàng.');
      toast.error('Hết hàng', { description: 'Sản phẩm này hiện đã hết hàng.' });
      return;
    }
    if (availableStock !== null && quantity > availableStock) {
      const msg = `Sản phẩm chỉ còn ${availableStock} sản phẩm trong kho.`;
      setFeedback(msg);
      toast.error('Vượt quá số lượng', { description: msg });
      return;
    }

    const result = addItem(product, selectedVariant, quantity);
    if (!result.success) {
      const msg = `Bạn đã đạt số lượng tối đa. Sản phẩm chỉ còn ${result.availableStock ?? 0} sản phẩm trong kho.`;
      setFeedback(msg);
      toast.error('Vượt tồn kho', { description: msg });
      return;
    }

    setFeedback('Đã thêm sản phẩm vào giỏ hàng.');
    toast.success('Đã thêm vào giỏ hàng', {
      description: `${product.name}${quantity > 1 ? ` x${quantity}` : ''}`,
      action: {
        label: 'Xem giỏ hàng',
        onClick: () => useCartStore.getState().openCart(),
      },
      duration: 3500,
    });
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.info('Đăng nhập để lưu sản phẩm yêu thích.');
      router.push(
        `/account/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`,
      );
      return;
    }

    try {
      if (wishlistItem) {
        await removeItem(wishlistItem);
        toast.info('Đã xóa khỏi danh sách yêu thích', { duration: 2000 });
      } else {
        await addProduct(product);
        toast.success('Đã thêm vào danh sách yêu thích', {
          description: product.name,
          duration: 2500,
        });
      }
    } catch (error) {
      toast.error('Không thể cập nhật danh sách yêu thích', {
        description: getWishlistErrorMessage(error),
      });
    }
  };

  return (
    <div className="px-5 pb-10 pt-[6.5rem] md:px-12 md:pt-[7.5rem] xl:px-20 xl:pt-[8.25rem]">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-12 xl:gap-16">
        {/* Image Gallery */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="relative aspect-[4/5] min-h-[360px] w-full overflow-hidden border border-border/70 bg-[#F1F1EF] sm:min-h-[520px] lg:max-h-[760px]">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={
                  product.images[selectedImage]?.altText ||
                  `${product.name}, ảnh sản phẩm`
                }
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 52vw"
                className="object-contain object-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Chưa có ảnh sản phẩm
              </div>
            )}
            {product.isNewArrival && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground font-heading text-[9px] tracking-[0.15em] px-3 py-1.5 uppercase">
                Mới
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-destructive text-white font-heading text-[9px] tracking-[0.15em] px-3 py-1.5 uppercase">
                -{discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden border bg-[#F1F1EF] transition-[border-color,opacity] duration-300 sm:w-24 ${
                    selectedImage === idx
                      ? 'border-primary opacity-100'
                      : 'border-border/70 opacity-70 hover:border-primary/50 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `${product.name}, ảnh ${idx + 1}`}
                    fill
                    sizes="(max-width: 1023px) 20vw, 10vw"
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-5 lg:sticky lg:top-[7.25rem] lg:max-w-xl lg:pl-4 xl:top-[8rem] xl:pl-8">
          {/* Brand & Title */}
          <div className="border-b border-border/70 pb-5">
            {product.brand && (
              <p className="font-heading text-xs text-muted-foreground tracking-[0.15em] uppercase mb-2">
                {product.brand.name}
              </p>
            )}
            <h1 className="max-w-[18ch] font-heading text-3xl font-light leading-[1.08] tracking-[-0.025em] text-primary md:text-[2.35rem]">
              {product.name}
            </h1>

            {/* Rating */}
            {product.avgRating && Number(product.avgRating) > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(product.avgRating))
                          ? 'fill-primary stroke-primary'
                          : 'stroke-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {Number(product.avgRating).toFixed(1)} ({product.reviewCount} đánh giá)
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="font-sans text-2xl font-semibold text-primary md:text-[1.7rem]">
              {formatPrice(finalPrice)}
            </span>
            {product.comparePrice && Number(product.comparePrice) > Number(finalPrice) && (
              <>
                <span className="font-sans text-lg text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="bg-destructive text-white font-heading text-xs tracking-wider px-2 py-1 uppercase">
                  Giảm {discount}%
                </span>
              </>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          )}
          <ProductShare productName={product.name} slug={product.slug} />

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm text-primary uppercase tracking-wide">Màu:</span>
                <span className="text-sm text-muted-foreground">
                  {colors.find(c => c.id === selectedColor)?.name ?? 'Chọn màu sắc'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => {
                      setSelectedColor((current) => current === color.id ? null : color.id);
                      setQuantity(1);
                      setFeedback('');
                    }}
                    aria-label={`Chọn màu ${color.name}`}
                    aria-pressed={selectedColor === color.id}
                    className={`size-11 rounded-full border-2 transition-all ${
                      selectedColor === color.id
                        ? 'border-primary scale-110'
                        : 'border-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: color.hexCode }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading text-sm text-primary uppercase tracking-wide">Kích cỡ:</span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline hover:text-primary"
                >
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => {
                      setSelectedSize((current) => current === size.id ? null : size.id);
                      setQuantity(1);
                      setFeedback('');
                    }}
                    aria-pressed={selectedSize === size.id}
                    className={`min-h-11 min-w-11 border px-3 py-2.5 font-heading text-sm transition-colors ${
                      selectedSize === size.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <span className="font-heading text-sm text-primary uppercase tracking-wide">Số lượng:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex size-11 items-center justify-center transition-colors hover:bg-accent"
                  disabled={quantity <= 1}
                  aria-label="Giảm số lượng"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(availableStock ?? quantity + 1, quantity + 1))}
                  className="flex size-11 items-center justify-center transition-colors hover:bg-accent"
                  disabled={availableStock !== null && quantity >= availableStock}
                  aria-label="Tăng số lượng"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {availableStock !== null && (
                <span className="text-sm text-muted-foreground">
                  Còn {availableStock} sản phẩm
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="h-12 flex-1 font-heading text-sm uppercase tracking-wider"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
            </Button>
            <Button
              onClick={() => void handleWishlist()}
              variant="outline"
              className="h-12 px-5"
              disabled={isWishlistMutating}
              aria-label={
                wishlisted
                  ? `Xóa ${product.name} khỏi danh sách yêu thích`
                  : `Thêm ${product.name} vào danh sách yêu thích`
              }
              aria-pressed={wishlisted}
            >
              {isWishlistMutating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
              )}
            </Button>
          </div>

          {feedback && (
            <p className="border border-border bg-accent px-4 py-2.5 text-sm text-muted-foreground">
              {feedback}
            </p>
          )}

          {/* Features */}
          <div className="space-y-2 border-t border-border pt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Truck className="w-5 h-5" />
              <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <RefreshCw className="w-5 h-5" />
              <span>Đổi trả miễn phí trong vòng 30 ngày</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="w-5 h-5" />
              <span>Sản phẩm chính hãng, cam kết chất lượng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mx-auto mt-14 max-w-[1400px] border-t border-border">
        {/* Tab Headers */}
        <div
          className="flex overflow-x-auto border-b border-border"
          role="tablist"
          aria-label="Thông tin sản phẩm"
          aria-orientation="horizontal"
        >
          <button
            ref={(node) => {
              tabRefs.current.description = node;
            }}
            id="product-tab-description"
            type="button"
            role="tab"
            aria-selected={activeTab === 'description'}
            aria-controls="product-panel-description"
            tabIndex={activeTab === 'description' ? 0 : -1}
            onClick={() => setActiveTab('description')}
            onKeyDown={(event) => handleTabKeyDown(event, 'description')}
            className={`min-h-11 shrink-0 px-5 py-4 font-heading text-sm uppercase tracking-wide transition-colors sm:px-8 ${
              activeTab === 'description'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Mô tả
          </button>
          {product.specifications && product.specifications.length > 0 && (
            <button
              ref={(node) => {
                tabRefs.current.specs = node;
              }}
              id="product-tab-specs"
              type="button"
              role="tab"
              aria-selected={activeTab === 'specs'}
              aria-controls="product-panel-specs"
              tabIndex={activeTab === 'specs' ? 0 : -1}
              onClick={() => setActiveTab('specs')}
              onKeyDown={(event) => handleTabKeyDown(event, 'specs')}
              className={`min-h-11 shrink-0 px-5 py-4 font-heading text-sm uppercase tracking-wide transition-colors sm:px-8 ${
                activeTab === 'specs'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Thông số
            </button>
          )}
          <button
            ref={(node) => {
              tabRefs.current.reviews = node;
            }}
            id="product-tab-reviews"
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            aria-controls="product-panel-reviews"
            tabIndex={activeTab === 'reviews' ? 0 : -1}
            onClick={() => setActiveTab('reviews')}
            onKeyDown={(event) => handleTabKeyDown(event, 'reviews')}
            className={`min-h-11 shrink-0 px-5 py-4 font-heading text-sm uppercase tracking-wide transition-colors sm:px-8 ${
              activeTab === 'reviews'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Đánh giá ({product.reviewCount ?? 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-8 max-w-4xl">
          {activeTab === 'description' && (
            <div
              id="product-panel-description"
              role="tabpanel"
              aria-labelledby="product-tab-description"
              tabIndex={0}
              className="prose prose-sm max-w-none"
            >
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
              {product.material && (
                <div className="mt-6">
                  <h3 className="font-heading text-sm uppercase tracking-wide text-primary mb-2">
                    Chất liệu
                  </h3>
                  <p className="text-muted-foreground">{product.material}</p>
                </div>
              )}
              {product.careInstructions && (
                <div className="mt-4">
                  <h3 className="font-heading text-sm uppercase tracking-wide text-primary mb-2">
                    Hướng dẫn bảo quản
                  </h3>
                  <p className="text-muted-foreground">{product.careInstructions}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && product.specifications && (
            <div
              id="product-panel-specs"
              role="tabpanel"
              aria-labelledby="product-tab-specs"
              tabIndex={0}
              className="space-y-3"
            >
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="flex py-3 border-b border-border last:border-0">
                  <span className="font-heading text-sm text-primary uppercase tracking-wide w-1/3">
                    {spec.label}
                  </span>
                  <span className="text-sm text-muted-foreground flex-1">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div
              id="product-panel-reviews"
              role="tabpanel"
              aria-labelledby="product-tab-reviews"
              tabIndex={0}
            >
              <ProductReviews product={product} />
            </div>
          )}
        </div>
      </div>
      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </div>
  );
}

