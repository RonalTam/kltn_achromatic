import type { Product } from '@/lib/types';

const STORAGE_KEY = 'achromatic-recently-viewed';
const MAX_RECENT_PRODUCTS = 8;
export const RECENTLY_VIEWED_EVENT = 'achromatic:recently-viewed';

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Product>;
  return (
    typeof item.id === 'string' &&
    typeof item.slug === 'string' &&
    typeof item.name === 'string' &&
    Array.isArray(item.images)
  );
}

export function getRecentlyViewed(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? '[]',
    ) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isProduct) : [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(product: Product): void {
  if (typeof window === 'undefined') return;
  const compactProduct: Product = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    basePrice: product.basePrice,
    comparePrice: product.comparePrice,
    isNewArrival: product.isNewArrival,
    isBestSeller: product.isBestSeller,
    avgRating: product.avgRating,
    reviewCount: product.reviewCount,
    images: product.images.slice(0, 2),
    inventory: product.inventory,
    variants: product.variants,
    category: product.category,
    brand: product.brand,
    shortDescription: product.shortDescription,
  };
  const next = [
    compactProduct,
    ...getRecentlyViewed().filter((item) => item.id !== product.id),
  ].slice(0, MAX_RECENT_PRODUCTS);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(RECENTLY_VIEWED_EVENT));
  } catch {
    // Browsing continues when storage is unavailable or full.
  }
}
