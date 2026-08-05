/**
 * SkeletonProductCard — animated skeleton placeholder for product grid
 * Matches the exact dimensions/layout of ProductCard.
 */
export function SkeletonProductCard({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Image placeholder — same 3/4 aspect ratio as ProductCard */}
      <div className="relative aspect-[3/4] bg-[#E8E8E8] mb-4 overflow-hidden skeleton" />

      {/* Info section */}
      <div className="space-y-2 px-0.5">
        {/* Brand */}
        <div className="h-2.5 w-16 skeleton rounded-sm" />
        {/* Product name */}
        <div className="h-4 w-3/4 skeleton rounded-sm" />
        {/* Short second line */}
        <div className="h-4 w-1/2 skeleton rounded-sm" />
        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 w-20 skeleton rounded-sm" />
          <div className="h-3.5 w-14 skeleton rounded-sm opacity-60" />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonProductGrid — renders a grid of skeleton cards
 */
export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonProductDetail — skeleton for the product detail page
 */
export function SkeletonProductDetail() {
  return (
    <div className="min-h-screen bg-background pt-24 md:pt-28 pb-16">
      <div className="px-5 md:px-10 lg:px-20 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery column */}
          <div>
            {/* Main image */}
            <div className="aspect-[4/5] skeleton w-full" />
            {/* Thumbnails */}
            <div className="flex gap-3 mt-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square w-20 skeleton" />
              ))}
            </div>
          </div>

          {/* Info column */}
          <div className="space-y-5 py-2">
            {/* Brand */}
            <div className="h-3 w-24 skeleton rounded-sm" />
            {/* Name */}
            <div className="space-y-2">
              <div className="h-8 w-full skeleton rounded-sm" />
              <div className="h-8 w-3/4 skeleton rounded-sm" />
            </div>
            {/* Price */}
            <div className="flex items-center gap-3 py-2">
              <div className="h-7 w-28 skeleton rounded-sm" />
              <div className="h-5 w-20 skeleton rounded-sm opacity-50" />
            </div>
            {/* Divider */}
            <div className="h-px w-full bg-border" />
            {/* Color label */}
            <div className="h-3 w-16 skeleton rounded-sm" />
            {/* Color swatches */}
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full skeleton" />
              ))}
            </div>
            {/* Size label */}
            <div className="h-3 w-16 skeleton rounded-sm" />
            {/* Size buttons */}
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-16 skeleton rounded-sm" />
              ))}
            </div>
            {/* Add to cart button */}
            <div className="h-14 w-full skeleton rounded-sm" />
            {/* Description */}
            <div className="space-y-2 pt-4">
              <div className="h-3 w-full skeleton rounded-sm" />
              <div className="h-3 w-5/6 skeleton rounded-sm" />
              <div className="h-3 w-4/5 skeleton rounded-sm" />
              <div className="h-3 w-2/3 skeleton rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
