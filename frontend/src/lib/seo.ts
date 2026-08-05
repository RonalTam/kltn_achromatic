import type { Product, ProductInventoryPayload } from "@/lib/types";

const DEFAULT_SITE_URL = "https://achromatic.vn";

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) return DEFAULT_SITE_URL;

  try {
    return new URL(configuredUrl).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function absoluteUrl(pathOrUrl: string) {
  try {
    return new URL(pathOrUrl, `${getSiteUrl()}/`).toString();
  } catch {
    return getSiteUrl();
  }
}

export function truncateDescription(value: string | null | undefined, maxLength = 160) {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";

  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function getAvailableStock(inventory: ProductInventoryPayload | undefined) {
  const entries = Array.isArray(inventory) ? inventory : inventory ? [inventory] : [];
  return entries.reduce(
    (total, entry) => total + Math.max(0, Number(entry.quantity ?? 0) - Number(entry.reserved ?? 0)),
    0,
  );
}

export function isProductInStock(product: Product) {
  const variantInventory = product.variants?.flatMap((variant) =>
    Array.isArray(variant.inventory)
      ? variant.inventory
      : variant.inventory
        ? [variant.inventory]
        : [],
  );

  if (variantInventory?.length) return getAvailableStock(variantInventory) > 0;
  if (product.inventory) return getAvailableStock(product.inventory) > 0;

  return true;
}

export function buildProductJsonLd(product: Product) {
  const canonicalUrl = absoluteUrl(`/products/${encodeURIComponent(product.slug)}`);
  const description = truncateDescription(
    product.shortDescription || product.description,
    500,
  );
  const images = product.images
    .map((image) => image.url)
    .filter(Boolean)
    .map(absoluteUrl);
  const rating = Number(product.avgRating);
  const reviewCount = Number(product.reviewCount);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(description ? { description } : {}),
    ...(images.length ? { image: images } : {}),
    sku: product.sku,
    url: canonicalUrl,
    ...(product.brand?.name
      ? {
          brand: {
            "@type": "Brand",
            name: product.brand.name,
          },
        }
      : {}),
    ...(product.category?.name ? { category: product.category.name } : {}),
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "VND",
      price: Number(product.basePrice),
      availability: isProductInStock(product)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(Number.isFinite(rating) && rating > 0 && Number.isFinite(reviewCount) && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
          },
        }
      : {}),
  };
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
