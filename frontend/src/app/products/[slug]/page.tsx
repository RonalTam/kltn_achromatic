import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache, Suspense } from 'react';
import { ProductDetail } from '@/components/products/ProductDetail';
import { ProductCard } from '@/components/common/ProductCard';
import { Product } from '@/lib/types';
import { SkeletonProductDetail, SkeletonProductGrid } from '@/components/common/Skeletons';
import { buildProductJsonLd, serializeJsonLd, truncateDescription } from '@/lib/seo';
import { LazyRecentlyViewed } from '@/components/products/LazyRecentlyViewed';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const res = await fetch(
    `${API_URL}/products/${slug}`,
    { next: { revalidate: 60 } }
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Unable to load product ${slug}: upstream returned ${res.status}`);
  }

  const json = await res.json();
  if (!json.data) {
    throw new Error(`Unable to load product ${slug}: upstream response is missing data`);
  }

  return json.data;
});

async function getRelated(productId: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${API_URL}/products/${encodeURIComponent(productId)}/related`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).slice(0, 4);
  } catch {
    return [];
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return {
      title: 'Không tìm thấy sản phẩm | ACHROMATIC',
      robots: { index: false, follow: false },
    };
  }

  const description =
    truncateDescription(
      product.metaDescription || product.shortDescription || product.description,
    ) ||
    `Khám phá ${product.name} từ ACHROMATIC, thiết kế tối giản dành cho nhịp sống hiện đại.`;
  const productTitle = product.metaTitle?.trim() || product.name;
  const brandedTitle = productTitle.toLocaleUpperCase('vi').includes('ACHROMATIC')
    ? productTitle
    : `${productTitle} | ACHROMATIC`;
  const canonical = `/products/${encodeURIComponent(product.slug)}`;
  const primaryImage = product.images?.[0]?.url || '/hero/hero-vietnam-city-blue-2k.png';

  return {
    title: brandedTitle,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: canonical,
      siteName: 'ACHROMATIC',
      title: brandedTitle,
      description,
      images: [{ url: primaryImage, alt: product.images?.[0]?.altText || product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: brandedTitle,
      description,
      images: [primaryImage],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = product.category?.id
    ? await getRelated(product.id)
    : [];
  const productJsonLd = buildProductJsonLd(product);

  return (
    <div className="min-h-screen bg-background">
      <script
        id="product-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <Suspense fallback={<SkeletonProductDetail />}>
        <ProductDetail product={product} />
      </Suspense>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="border-t border-border px-4 py-14 sm:px-5 md:px-10 md:py-16 lg:px-20">
          <h2 className="font-heading text-xl uppercase font-light tracking-tight text-primary mb-10">
            You May Also Like
          </h2>
          <Suspense fallback={<SkeletonProductGrid count={4} />}>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Suspense>
        </section>
      )}
      <LazyRecentlyViewed currentProductId={product.id} />
    </div>
  );
}
