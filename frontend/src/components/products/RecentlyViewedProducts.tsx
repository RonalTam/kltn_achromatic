"use client";

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/common/ProductCard';
import {
  getRecentlyViewed,
  RECENTLY_VIEWED_EVENT,
} from '@/lib/recently-viewed';
import type { Product } from '@/lib/types';

export default function RecentlyViewedProducts({
  currentProductId,
}: {
  currentProductId: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const sync = () => {
      setProducts(
        getRecentlyViewed()
          .filter((product) => product.id !== currentProductId)
          .slice(0, 4),
      );
    };
    sync();
    window.addEventListener(RECENTLY_VIEWED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(RECENTLY_VIEWED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="recently-viewed-heading"
      className="border-t border-border px-4 py-14 sm:px-5 md:px-10 md:py-16 lg:px-20"
    >
      <div className="mx-auto max-w-[1560px]">
        <h2
          id="recently-viewed-heading"
          className="mb-10 font-heading text-xl font-light uppercase tracking-tight text-primary"
        >
          Sản phẩm đã xem
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
