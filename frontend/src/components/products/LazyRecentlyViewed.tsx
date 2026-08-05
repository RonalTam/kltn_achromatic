"use client";

import dynamic from 'next/dynamic';

const RecentlyViewedProducts = dynamic(
  () => import('./RecentlyViewedProducts'),
  {
    loading: () => (
      <div
        className="h-40 border-t border-border bg-accent/30"
        aria-hidden="true"
      />
    ),
  },
);

export function LazyRecentlyViewed({
  currentProductId,
}: {
  currentProductId: string;
}) {
  return <RecentlyViewedProducts currentProductId={currentProductId} />;
}
