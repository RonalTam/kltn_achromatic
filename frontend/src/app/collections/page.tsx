import type { Metadata } from "next";
import { Suspense } from "react";
import { Product } from "@/lib/types";
import { CollectionsClient } from "@/components/collections/CollectionsClient";
import { SkeletonProductGrid } from "@/components/common/Skeletons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isTrueParam(value: string | string[] | undefined) {
  return firstParam(value).trim().toLocaleLowerCase("vi") === "true";
}

function getCanonicalCollectionUrl(
  searchParams: Record<string, string | string[] | undefined>
) {
  const canonicalParams = new URLSearchParams();
  const normalizedValues = {
    category: firstParam(searchParams.category).trim(),
    brand: firstParam(searchParams.brand).trim(),
    search: firstParam(searchParams.search).trim(),
    minPrice: firstParam(searchParams.minPrice).trim(),
    maxPrice: firstParam(searchParams.maxPrice).trim(),
    sizes: firstParam(searchParams.sizes || searchParams.size)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort((a, b) => a.localeCompare(b, "vi"))
      .join(","),
    colors: firstParam(searchParams.colors || searchParams.color)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .filter((value, index, values) => values.indexOf(value) === index)
      .sort((a, b) => a.localeCompare(b, "vi"))
      .join(","),
    newArrival: isTrueParam(searchParams.newArrival) ? "true" : "",
    page: firstParam(searchParams.page).trim(),
  };

  for (const [key, value] of Object.entries(normalizedValues)) {
    if (!value || (key === "page" && value === "1")) continue;
    canonicalParams.set(key, value);
  }

  const query = canonicalParams.toString();
  return query ? `/collections?${query}` : "/collections";
}

interface FacetOption {
  name?: string;
  slug?: string;
}

interface FacetMetadata {
  label: string;
  isKnown: boolean | null;
}

async function getFacetOptions(
  endpoint: string,
  nestedKey?: string,
): Promise<FacetOption[] | null> {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;

    const body = await response.json();
    const options = nestedKey ? body.data?.[nestedKey] : body.data;
    return Array.isArray(options) ? options : null;
  } catch {
    return null;
  }
}

function resolveFacetMetadata(
  value: string,
  options: FacetOption[] | null,
): FacetMetadata {
  if (!value) return { label: "", isKnown: true };
  if (!options) return { label: value, isKnown: null };

  const normalizedValue = value.toLocaleLowerCase("vi");
  const option = options.find(
    (candidate) =>
      candidate.slug?.toLocaleLowerCase("vi") === normalizedValue ||
      candidate.name?.toLocaleLowerCase("vi") === normalizedValue,
  );

  return option
    ? { label: option.name || value, isKnown: true }
    : { label: value, isKnown: false };
}

export async function generateMetadata({
  searchParams,
}: CollectionsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categoryValue = firstParam(params.category).trim();
  const brand = firstParam(params.brand).trim();
  const [categoryOptions, brandOptions] = await Promise.all([
    categoryValue ? getFacetOptions("categories") : Promise.resolve(null),
    brand ? getFacetOptions("products/filters", "brands") : Promise.resolve(null),
  ]);
  const categoryMetadata = resolveFacetMetadata(categoryValue, categoryOptions);
  const brandMetadata = resolveFacetMetadata(brand, brandOptions);
  const search = firstParam(params.search).trim();
  const sizes = firstParam(params.sizes || params.size).trim();
  const colors = firstParam(params.colors || params.color).trim();
  const hasPriceFilter = Boolean(firstParam(params.minPrice) || firstParam(params.maxPrice));
  const hasUnknownFacet =
    categoryMetadata.isKnown === false || brandMetadata.isKnown === false;
  const isFacetPage = Boolean(search || sizes || colors || hasPriceFilter || hasUnknownFacet);
  const isNewArrival = isTrueParam(params.newArrival);
  const canonical = getCanonicalCollectionUrl(params);

  let heading = "Bộ sưu tập thời trang tối giản";
  if (search) heading = `Kết quả tìm kiếm cho “${search}”`;
  else if (categoryMetadata.label) heading = categoryMetadata.label;
  else if (brandMetadata.label) heading = `Thời trang ${brandMetadata.label}`;
  else if (isNewArrival) heading = "Sản phẩm mới";

  const filterDetails = [
    sizes ? `kích cỡ ${sizes}` : "",
    colors ? `màu ${colors}` : "",
    hasPriceFilter ? "mức giá đã chọn" : "",
  ].filter(Boolean);
  const description = filterDetails.length
    ? `Khám phá ${heading.toLocaleLowerCase("vi")} theo ${filterDetails.join(", ")} tại ACHROMATIC.`
    : `Khám phá ${heading.toLocaleLowerCase("vi")} với phom dáng gọn và chất liệu phù hợp khí hậu Việt Nam tại ACHROMATIC.`;

  return {
    title: `${heading} | ACHROMATIC`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: canonical,
      siteName: "ACHROMATIC",
      title: `${heading} | ACHROMATIC`,
      description,
      images: [
        {
          url: "/page-headers/vietnam-collections-header-2k.png",
          alt: heading,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${heading} | ACHROMATIC`,
      description,
      images: ["/page-headers/vietnam-collections-header-2k.png"],
    },
    robots: { index: !isFacetPage, follow: true },
  };
}

async function getProducts(
  searchParams: Record<string, string | string[] | undefined>
) {
  const params = new URLSearchParams();
  const sizeFilter = searchParams.sizes || searchParams.size;
  const colorFilter = searchParams.colors || searchParams.color;

  if (searchParams.category) params.set("category", String(searchParams.category));
  if (searchParams.brand) params.set("brand", String(searchParams.brand));
  if (searchParams.search) params.set("search", String(searchParams.search));
  if (searchParams.minPrice) params.set("minPrice", String(searchParams.minPrice));
  if (searchParams.maxPrice) params.set("maxPrice", String(searchParams.maxPrice));
  if (sizeFilter) params.set("sizes", String(sizeFilter));
  if (colorFilter) params.set("colors", String(colorFilter));
  if (searchParams.sortBy) params.set("sortBy", String(searchParams.sortBy));
  if (isTrueParam(searchParams.newArrival)) params.set("newArrival", "true");
  params.set("page", String(searchParams.page || "1"));
  params.set("limit", "12");
  try {
    const res = await fetch(`${API_URL}/products?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };
    const json = await res.json();
    return json.data || { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };
  } catch {
    return { data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 0 } };
  }
}

async function getFilterOptions() {
  try {
    const [catsRes, filtersRes] = await Promise.all([
      fetch(`${API_URL}/categories`, { next: { revalidate: 3600 } }),
      fetch(`${API_URL}/products/filters`, { next: { revalidate: 3600 } }),
    ]);
    const [cats, filters] = await Promise.all([
      catsRes.ok ? catsRes.json() : { data: [] },
      filtersRes.ok ? filtersRes.json() : { data: {} },
    ]);
    const filterData = filters.data || {};
    return {
      categories: cats.data || [],
      sizes: (filterData.sizes || []).slice(0, 12),
      colors: filterData.colors || [],
    };
  } catch {
    return { categories: [], sizes: [], colors: [] };
  }
}

interface CollectionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const params = await searchParams;
  const [productsData, filterOptions] = await Promise.all([
    getProducts(params),
    getFilterOptions(),
  ]);

  const products: Product[] = productsData.data || [];
  const meta = productsData.meta || {};

  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 md:pt-28 pb-16 px-5 md:px-10 lg:px-20">
          <div className="max-w-[1440px] mx-auto">
            {/* Header skeleton */}
            <div className="mb-8 space-y-2">
              <div className="h-8 w-48 skeleton rounded-sm" />
              <div className="h-4 w-32 skeleton rounded-sm" />
            </div>
            <SkeletonProductGrid count={12} />
          </div>
        </div>
      }
    >
      <CollectionsClient
        products={products}
        meta={meta}
        filterOptions={filterOptions}
        searchParams={params}
      />
    </Suspense>
  );
}
