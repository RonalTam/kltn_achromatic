import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const PAGE_SIZE = 100;

export const dynamic = "force-dynamic";

interface SitemapProduct {
  slug: string;
  updatedAt?: string;
  images?: { url?: string }[];
}

interface ProductPage {
  data?: SitemapProduct[];
  meta?: { totalPages?: number };
}

async function getProductPage(page: number): Promise<ProductPage> {
  try {
    const response = await fetch(`${API_URL}/products?page=${page}&limit=${PAGE_SIZE}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return {};

    const body = await response.json();
    return body.data || {};
  } catch {
    return {};
  }
}

async function getAllProducts() {
  const firstPage = await getProductPage(1);
  const totalPages = Math.max(1, Number(firstPage.meta?.totalPages) || 1);
  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => getProductPage(index + 2)),
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.data || []);
}

async function getCategories(): Promise<{ slug: string }[]> {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];

    const body = await response.json();
    return Array.isArray(body.data) ? body.data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/collections"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/size-guide"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/careers"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/track-order"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/policy/shipping"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/policy/returns"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/policy/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/policy/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${absoluteUrl("/collections")}?category=${encodeURIComponent(category.slug)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((product) => Boolean(product.slug))
    .map((product) => ({
      url: absoluteUrl(`/products/${encodeURIComponent(product.slug)}`),
      ...(product.updatedAt ? { lastModified: new Date(product.updatedAt) } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
      images: (product.images || [])
        .map((image) => image.url)
        .filter((url): url is string => Boolean(url))
        .map(absoluteUrl),
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
