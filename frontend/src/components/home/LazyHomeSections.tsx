"use client";

import dynamic from 'next/dynamic';

function SectionFallback({ label }: { label: string }) {
  return (
    <section
      className="min-h-64 animate-pulse bg-accent/40"
      aria-label={`Đang tải ${label}`}
    />
  );
}

const Lookbook = dynamic(
  () => import('./Lookbook').then((module) => module.Lookbook),
  { loading: () => <SectionFallback label="lookbook" /> },
);
const CustomerReviews = dynamic(
  () =>
    import('./CustomerReviews').then((module) => module.CustomerReviews),
  { loading: () => <SectionFallback label="đánh giá khách hàng" /> },
);
const InstagramFeed = dynamic(
  () => import('./InstagramFeed').then((module) => module.InstagramFeed),
  { loading: () => <SectionFallback label="bộ sưu tập hình ảnh" /> },
);
const Newsletter = dynamic(
  () => import('./Newsletter').then((module) => module.Newsletter),
  { loading: () => <SectionFallback label="bản tin" /> },
);

export function LazyHomeSections() {
  return (
    <>
      <Lookbook />
      <CustomerReviews />
      <InstagramFeed />
      <Newsletter />
    </>
  );
}
