"use client";

import { ExternalLink, Link2, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProductShare({
  productName,
  slug,
}: {
  productName: string;
  slug: string;
}) {
  const getUrl = () =>
    typeof window === 'undefined'
      ? `/products/${slug}`
      : `${window.location.origin}/products/${slug}`;

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=720,height=560');
  };

  const shareNative = async () => {
    const url = getUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    await copyLink();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      toast.success('Đã sao chép liên kết sản phẩm');
    } catch {
      toast.error('Không thể sao chép liên kết');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Chia sẻ sản phẩm">
      <button
        type="button"
        onClick={shareNative}
        className="inline-flex min-h-11 items-center gap-2 border border-border px-3 text-xs text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Chia sẻ ${productName}`}
      >
        <Share2 className="size-4" aria-hidden="true" />
        Chia sẻ
      </button>
      <button
        type="button"
        onClick={() =>
          openShareWindow(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`,
          )
        }
        className="inline-flex size-11 items-center justify-center border border-border text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Chia sẻ ${productName} lên Facebook`}
      >
        <ExternalLink className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex size-11 items-center justify-center border border-border text-primary transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Sao chép liên kết ${productName}`}
      >
        <Link2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
