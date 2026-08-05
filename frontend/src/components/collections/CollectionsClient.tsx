"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList, Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Product } from "@/lib/types";
import { ProductCard } from "@/components/common/ProductCard";
import { staggerContainer, staggerItem, fadeUp } from "@/lib/animations";
import { formatPrice } from "@/lib/utils";

// ─── Category Hero Images ────────────────────────────────────────────────────
const CATEGORY_HERO_IMAGES: Record<string, string> = {
  Polo: "/page-headers/vietnam-collections-header-2k.png",
  "T-shirt": "/hero/hero-vietnam-city-blue-2k.png",
  Shirts: "/page-headers/vietnam-fit-policy-header-2k.png",
  Pants: "/hero/hero-vietnam-tropical-minimal-2k.png",
  Accessories: "/page-headers/vietnam-customer-care-header-2k.png",
  "ao-thun": "/hero/hero-vietnam-city-blue-2k.png",
  "ao-so-mi": "/page-headers/vietnam-fit-policy-header-2k.png",
  "ao-khoac": "/editorial/vietnam-fashion-bestsellers-2k.png",
  "hoodie-sweater": "/editorial/vietnam-fashion-bestsellers-2k.png",
  "quan-jeans": "/hero/hero-vietnam-tropical-minimal-2k.png",
  "quan-tay": "/hero/hero-vietnam-tropical-minimal-2k.png",
  "vay-dam": "/hero/hero-vietnam-city-blue-2k.png",
  "chan-vay": "/hero/hero-vietnam-city-blue-2k.png",
  "phu-kien": "/page-headers/vietnam-customer-care-header-2k.png",
  "giay-dep": "/page-headers/vietnam-customer-care-header-2k.png",
  "tui-xach": "/page-headers/vietnam-customer-care-header-2k.png",
  "do-unisex": "/hero/hero-vietnam-city-blue-2k.png",
};

const DEFAULT_HERO_IMAGE = "/hero/hero-vietnam-city-blue-2k.png";

// ─── Types ──────────────────────────────────────────────────────────────────
interface FilterOptions {
  categories: { id: string; name: string; slug: string }[];
  sizes: { id: string; name: string }[];
  colors: { id: string; name: string; hexCode: string }[];
}

interface FilterDraft {
  category: string;
  minPrice: string;
  maxPrice: string;
  sizes: string[];
  colors: string[];
}

const parseFilterList = (value: string | null) =>
  value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

const getFilterDraft = (params: URLSearchParams): FilterDraft => ({
  category: params.get("category") ?? "",
  minPrice: params.get("minPrice") ?? "",
  maxPrice: params.get("maxPrice") ?? "",
  sizes: parseFilterList(params.get("sizes") ?? params.get("size")),
  colors: parseFilterList(params.get("colors") ?? params.get("color")),
});

const emptyFilterDraft = (): FilterDraft => ({
  category: "",
  minPrice: "",
  maxPrice: "",
  sizes: [],
  colors: [],
});

const toggleFilterValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

const getFilterSignature = (draft: FilterDraft) =>
  [
    draft.category,
    draft.minPrice,
    draft.maxPrice,
    [...draft.sizes].sort().join(","),
    [...draft.colors].sort().join(","),
  ].join("|");

const clearFilterParams = (params: URLSearchParams) => {
  ["category", "minPrice", "maxPrice", "sizes", "size", "colors", "color"].forEach(
    (key) => params.delete(key)
  );
};

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CollectionsClientProps {
  products: Product[];
  meta: Meta;
  filterOptions: FilterOptions;
  searchParams: Record<string, string | string[] | undefined>;
}

// ─── Sort Options ────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "featured", label: "Nổi bật" },
  { value: "best_selling", label: "Bán chạy nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "top_rated", label: "Đánh giá cao nhất" },
];

const PRICE_RANGES = [
  { label: "Dưới 300.000đ", min: 0, max: 300000 },
  { label: "300K - 500K", min: 300000, max: 500000 },
  { label: "500K - 800K", min: 500000, max: 800000 },
  { label: "Trên 800.000đ", min: 800000, max: 99999999 },
];

function FilterSection({
  title,
  id,
  open,
  onToggle,
  children,
}: {
  title: string;
  id: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#E8E8E8]">
      <button
        onClick={() => onToggle(id)}
        className="group flex min-h-11 w-full items-center justify-between py-3 text-left"
      >
        <span className="label-sm text-[#111111] group-hover:text-[#0F4C81] transition-colors">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#9A9A9A] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function CollectionsClient({
  products,
  meta,
  filterOptions,
  searchParams,
}: CollectionsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const serializedSearchParams = urlSearchParams.toString();
  const appliedDraft = useMemo(
    () => getFilterDraft(new URLSearchParams(serializedSearchParams)),
    [serializedSearchParams]
  );
  const [filterDraft, setFilterDraft] = useState<FilterDraft>(appliedDraft);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    size: true,
    color: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setFilterDraft(appliedDraft));
    return () => window.cancelAnimationFrame(frame);
  }, [appliedDraft]);

  useEffect(() => {
    if (!mobileFilterOpen) return;

    const previousOverflow = document.documentElement.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFilterOpen(false);
    };

    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.documentElement.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileFilterOpen]);

  const applyFilters = () => {
    const params = new URLSearchParams(urlSearchParams.toString());
    clearFilterParams(params);

    if (filterDraft.category) params.set("category", filterDraft.category);
    if (filterDraft.minPrice) params.set("minPrice", filterDraft.minPrice);
    if (filterDraft.maxPrice) params.set("maxPrice", filterDraft.maxPrice);
    if (filterDraft.sizes.length > 0) params.set("sizes", filterDraft.sizes.join(","));
    if (filterDraft.colors.length > 0) params.set("colors", filterDraft.colors.join(","));
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`);
    setMobileFilterOpen(false);
  };

  const clearAll = () => {
    const emptyDraft = emptyFilterDraft();
    setFilterDraft(emptyDraft);
    const params = new URLSearchParams(urlSearchParams.toString());
    clearFilterParams(params);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setMobileFilterOpen(false);
  };

  const setSort = (value: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("sortBy", value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
    setSortOpen(false);
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentSort = urlSearchParams.get("sortBy") || "newest";
  const currentSizes = appliedDraft.sizes;
  const currentColors = appliedDraft.colors;
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label || "Mới nhất";
  const filterDraftCount =
    Number(Boolean(filterDraft.category)) +
    Number(Boolean(filterDraft.minPrice || filterDraft.maxPrice)) +
    filterDraft.sizes.length +
    filterDraft.colors.length;
  const filtersChanged = getFilterSignature(filterDraft) !== getFilterSignature(appliedDraft);

  const activeFilters: { key: string; label: string; value: string }[] = [];
  if (urlSearchParams.get("category")) {
    const cat = filterOptions.categories.find(
      (c) => c.slug === urlSearchParams.get("category")
    );
    if (cat) activeFilters.push({ key: "category", label: "Danh mục", value: cat.name });
  }
  currentSizes.forEach((size) =>
    activeFilters.push({ key: `sizes:${size}`, label: "Size", value: size })
  );
  currentColors.forEach((color) => {
    const option = filterOptions.colors.find((item) => item.name === color || item.id === color);
    activeFilters.push({ key: `colors:${color}`, label: "Màu", value: option?.name ?? color });
  });
  if (urlSearchParams.get("minPrice")) {
    const selectedRange = PRICE_RANGES.find(
      (range) =>
        String(range.min) === urlSearchParams.get("minPrice") &&
        String(range.max) === urlSearchParams.get("maxPrice")
    );
    activeFilters.push({
      key: "minPrice_maxPrice",
      label: "Giá",
      value: selectedRange?.label ?? "Đã chọn",
    });
  }

  const removeActiveFilter = (key: string) => {
    const params = new URLSearchParams(urlSearchParams.toString());

    if (key === "minPrice_maxPrice") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else if (key.startsWith("sizes:")) {
      const value = key.slice("sizes:".length);
      const nextSizes = appliedDraft.sizes.filter((item) => item !== value);
      params.delete("size");
      if (nextSizes.length > 0) params.set("sizes", nextSizes.join(","));
      else params.delete("sizes");
    } else if (key.startsWith("colors:")) {
      const value = key.slice("colors:".length);
      const nextColors = appliedDraft.colors.filter((item) => item !== value);
      params.delete("color");
      if (nextColors.length > 0) params.set("colors", nextColors.join(","));
      else params.delete("colors");
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const categoryLabel = searchParams.category
    ? filterOptions.categories.find((c) => c.slug === String(searchParams.category))?.name ||
      String(searchParams.category)
    : searchParams.search
    ? `Tìm kiếm: "${searchParams.search}"`
    : "Tất Cả Sản Phẩm";

  const filterPanel = (
    <div className="space-y-0">
      {/* Danh mục */}
      {filterOptions.categories.length > 0 && (
        <FilterSection
          title="Danh Mục"
          id="category"
          open={Boolean(openSections.category)}
          onToggle={toggleSection}
        >
          <div className="space-y-1.5">
            {filterOptions.categories.map((cat) => {
              const active = filterDraft.category === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setFilterDraft((draft) => ({
                      ...draft,
                      category: active ? "" : cat.slug,
                    }))
                  }
                  className={`group flex min-h-11 w-full items-center justify-between py-2 text-left font-sans text-sm transition-colors lg:min-h-0 lg:py-1.5 ${
                    active ? "text-[#111111] font-medium" : "text-[#6B6B6B] hover:text-[#111111]"
                  }`}
                >
                  <span>{cat.name}</span>
                  {active && (
                    <div className="w-1.5 h-1.5 bg-[#0F4C81] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Giá */}
      <FilterSection
        title="Mức Giá"
        id="price"
        open={Boolean(openSections.price)}
        onToggle={toggleSection}
      >
        <div className="space-y-1.5">
          {PRICE_RANGES.map((range) => {
            const active =
              filterDraft.minPrice === String(range.min) &&
              filterDraft.maxPrice === String(range.max);
            return (
              <button
                key={range.label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setFilterDraft((draft) => ({
                    ...draft,
                    minPrice: active ? "" : String(range.min),
                    maxPrice: active ? "" : String(range.max),
                  }))
                }
                className={`flex min-h-11 w-full items-center justify-between py-2 text-left font-sans text-sm transition-colors lg:min-h-0 lg:py-1.5 ${
                  active ? "text-[#111111] font-medium" : "text-[#6B6B6B] hover:text-[#111111]"
                }`}
              >
                <span>{range.label}</span>
                {active && <div className="w-1.5 h-1.5 bg-[#0F4C81] rounded-full" />}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Size */}
      {filterOptions.sizes.length > 0 && (
        <FilterSection
          title="Kích Cỡ"
          id="size"
          open={Boolean(openSections.size)}
          onToggle={toggleSection}
        >
          <div className="flex flex-wrap gap-2">
            {filterOptions.sizes.map((sz) => {
              const selectedValue = filterDraft.sizes.find(
                (value) => value === sz.name || value === sz.id
              );
              const active = Boolean(selectedValue);
              return (
                <button
                  key={sz.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setFilterDraft((draft) => ({
                      ...draft,
                      sizes: selectedValue
                        ? draft.sizes.filter((value) => value !== selectedValue)
                        : toggleFilterValue(draft.sizes, sz.name),
                    }))
                  }
                  className={`h-11 min-w-11 border px-3 font-sans text-xs font-medium transition-all duration-200 lg:h-9 lg:min-w-10 ${
                    active
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#E8E8E8] text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]"
                  }`}
                >
                  {sz.name}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Màu sắc */}
      {filterOptions.colors.length > 0 && (
        <FilterSection
          title="Màu Sắc"
          id="color"
          open={Boolean(openSections.color)}
          onToggle={toggleSection}
        >
          <div className="flex flex-wrap gap-2.5">
            {filterOptions.colors.map((col) => {
              const selectedValue = filterDraft.colors.find(
                (value) => value === col.name || value === col.id
              );
              const active = Boolean(selectedValue);
              return (
                <button
                  key={col.id}
                  type="button"
                  aria-label={`Màu ${col.name}`}
                  aria-pressed={active}
                  onClick={() =>
                    setFilterDraft((draft) => ({
                      ...draft,
                      colors: selectedValue
                        ? draft.colors.filter((value) => value !== selectedValue)
                        : toggleFilterValue(draft.colors, col.name),
                    }))
                  }
                  title={col.name}
                  className={`size-11 rounded-full transition-all duration-200 lg:size-8 ${
                    active
                      ? "ring-2 ring-offset-2 ring-[#111111] scale-110"
                      : "ring-1 ring-[#E8E8E8] hover:ring-[#9A9A9A]"
                  }`}
                  style={{ backgroundColor: col.hexCode }}
                />
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );

  const heroImage = useMemo(() => {
    const catSlug = searchParams.category ? String(searchParams.category) : null;
    if (catSlug && CATEGORY_HERO_IMAGES[catSlug]) return CATEGORY_HERO_IMAGES[catSlug];
    return DEFAULT_HERO_IMAGE;
  }, [searchParams.category]);

  return (
    <div className="min-h-[100dvh] bg-white pt-16 sm:pt-[72px]">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-[#E8E8E8]">
        {/* Background Image */}
        <Image
          src={heroImage}
          alt=""
          fill
          preload
          quality={90}
          className="page-hero-photo object-cover object-[center_10%]"
          sizes="(max-width: 767px) 115vw, 100vw"
        />
        {/* Overlay */}
        <div className="page-hero-photo-overlay absolute inset-0" />
        <div className="page-hero-grid absolute inset-0 deco-grid-pattern" />

        <div className="relative z-10 section-padding py-14 md:py-20">
          <div className="container-max">
            {/* Breadcrumb */}
            <p className="label-xs text-[#6B6B6B] mb-4">
              ACHROMATIC
              {searchParams.category && (
                <>
                  {" / "}
                  <span className="text-[#0F4C81] font-semibold">
                    {String(searchParams.category).toUpperCase()}
                  </span>
                </>
              )}
            </p>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="accent-bar-left">
                <h1 className="heading-lg text-[#111111] section-heading-accent">{categoryLabel}</h1>
                {meta.total != null && (
                  <p className="font-sans text-sm text-[#4A4A4A] mt-3">
                    {meta.total} sản phẩm
                  </p>
                )}
              </div>

              {/* Search bar */}
              <div className="relative max-w-xs w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9A9A]" />
                <input
                  type="search"
                  placeholder="Tìm trong bộ sưu tập..."
                  defaultValue={String(searchParams.search || "")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const params = new URLSearchParams(urlSearchParams.toString());
                      params.set("search", (e.target as HTMLInputElement).value);
                      params.set("page", "1");
                      router.push(`${pathname}?${params.toString()}`);
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 border border-[#E8E8E8] bg-white/90 backdrop-blur-sm text-sm font-sans text-[#111111] placeholder:text-[#9A9A9A] outline-none focus:border-[#111111] transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className="section-padding py-8 md:py-12">
        <div className="container-max">
          <div className="flex gap-8 lg:gap-12">
            {/* ── Desktop Sidebar ───────────────────────────────────────── */}
            <aside className="hidden lg:block w-52 xl:w-60 shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="label-sm text-[#111111]">Lọc Sản Phẩm</h2>
                  {(activeFilters.length > 0 || filterDraftCount > 0) && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="font-sans text-[11px] text-[#6B6B6B] hover:text-[#111111] underline underline-offset-2 transition-colors"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
                {filterPanel}
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={applyFilters}
                    disabled={!filtersChanged}
                    className="flex w-full items-center justify-center gap-2 bg-[#111111] px-4 py-3.5 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#D8D8D8] disabled:text-[#777777]"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Tìm sản phẩm
                    {filterDraftCount > 0 && ` (${filterDraftCount})`}
                  </button>
                  <p className="mt-2 text-center font-sans text-[11px] leading-relaxed text-[#5F5F5F]">
                    Chọn nhiều thuộc tính rồi áp dụng cùng lúc.
                  </p>
                </div>
              </div>
            </aside>

            {/* ── Product Area ──────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="mb-6 flex items-start justify-between gap-3 border-b border-[#E8E8E8] pb-5 sm:items-center">
                {/* Left: mobile filter + active filter chips */}
                <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileFilterOpen(true)}
                    className="flex min-h-11 items-center gap-2 border border-[#E8E8E8] px-3 py-2 font-sans text-xs text-[#6B6B6B] transition-all hover:border-[#111111] hover:text-[#111111] lg:hidden"
                    aria-label="Mở bộ lọc sản phẩm"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    Lọc
                    {activeFilters.length > 0 && (
                      <span className="bg-[#111111] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>

                  {/* Active filter chips */}
                  {activeFilters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => removeActiveFilter(f.key)}
                      className="flex min-h-11 items-center gap-1.5 bg-[#111111] px-3 py-2 font-sans text-[11px] text-white"
                    >
                      {f.label}
                      {f.value && `: ${f.value}`}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>

                {/* Right: view toggle + sort */}
                <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
                  {/* View Toggle */}
                  <div className="hidden md:flex border border-[#E8E8E8]">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`size-11 p-2 transition-colors ${
                        viewMode === "grid"
                          ? "bg-[#111111] text-white"
                          : "text-[#9A9A9A] hover:text-[#111111]"
                      }`}
                      aria-label="Grid view"
                    >
                      <Grid3X3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`size-11 p-2 transition-colors ${
                        viewMode === "list"
                          ? "bg-[#111111] text-white"
                          : "text-[#9A9A9A] hover:text-[#111111]"
                      }`}
                      aria-label="List view"
                    >
                      <LayoutList className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setSortOpen(!sortOpen)}
                      className="flex min-h-11 items-center gap-2 whitespace-nowrap border border-[#E8E8E8] px-3 py-2 font-sans text-xs text-[#6B6B6B] transition-all hover:border-[#111111] hover:text-[#111111]"
                      aria-label={`Sắp xếp: ${currentSortLabel}`}
                    >
                      {currentSortLabel}
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          sortOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {sortOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-1 bg-white border border-[#E8E8E8] shadow-lg z-30 min-w-[180px]"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setSort(opt.value)}
                              className={`block w-full text-left px-4 py-3 font-sans text-sm transition-colors ${
                                currentSort === opt.value
                                  ? "bg-[#111111] text-white"
                                  : "text-[#6B6B6B] hover:bg-[#F5F5F5] hover:text-[#111111]"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Product Grid / Empty State */}
              {products.length === 0 ? (
                <motion.div
                  className="text-center py-24"
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                >
                  <Search className="mx-auto mb-6 size-12 stroke-[1.2] text-[#6B6B6B]" />
                  <h2 className="heading-md text-[#111111] mb-3">
                    Không tìm thấy sản phẩm
                  </h2>
                  <p className="font-sans text-sm text-[#6B6B6B] mb-8 max-w-sm mx-auto leading-relaxed">
                    Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem thêm sản phẩm.
                  </p>
                  <button onClick={clearAll} className="btn-outline-dark">
                    Xóa Bộ Lọc
                  </button>
                </motion.div>
              ) : viewMode === "grid" ? (
                <motion.div
                  key={`grid-${urlSearchParams.toString()}`}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {products.map((product) => (
                    <motion.div key={product.id} variants={staggerItem}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                // List View
                <motion.div
                  key={`list-${urlSearchParams.toString()}`}
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {products.map((product) => (
                    <motion.div key={product.id} variants={staggerItem}>
                      <ProductListItem product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setPage(meta.page - 1)}
                    disabled={meta.page <= 1}
                    className="flex size-11 items-center justify-center border border-[#E8E8E8] font-sans text-sm text-[#6B6B6B] transition-all hover:border-[#111111] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-30 lg:size-9"
                    aria-label="Trang trước"
                  >
                    ←
                  </button>

                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === meta.totalPages ||
                        p === meta.page
                    )
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                        acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="flex h-11 w-5 items-center justify-center font-sans text-sm text-[#9A9A9A] lg:h-9 lg:w-7"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`size-11 border font-sans text-sm transition-all lg:size-9 ${
                            meta.page === p
                              ? "border-[#111111] bg-[#111111] text-white"
                              : "border-[#E8E8E8] text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setPage(meta.page + 1)}
                    disabled={meta.page >= meta.totalPages}
                    className="flex size-11 items-center justify-center border border-[#E8E8E8] font-sans text-sm text-[#6B6B6B] transition-all hover:border-[#111111] hover:text-[#111111] disabled:cursor-not-allowed disabled:opacity-30 lg:size-9"
                    aria-label="Trang sau"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-filter-title"
              className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[400px] flex-col bg-white sm:w-[85vw]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8E8]">
                <h2 id="mobile-filter-title" className="label-sm text-[#111111]">Lọc Sản Phẩm</h2>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Đóng bộ lọc"
                  className="flex size-11 items-center justify-center text-[#6B6B6B] transition-colors hover:text-[#111111]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {filterPanel}
              </div>

              <div className="space-y-2 border-t border-[#E8E8E8] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
                <button
                  type="button"
                  onClick={applyFilters}
                  disabled={!filtersChanged}
                  className="w-full btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Tìm sản phẩm{filterDraftCount > 0 && ` (${filterDraftCount})`}
                </button>
                {(activeFilters.length > 0 || filterDraftCount > 0) && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="flex min-h-11 w-full items-center justify-center py-3 font-sans text-xs text-[#6B6B6B] transition-colors hover:text-[#111111]"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── List View Item ──────────────────────────────────────────────────────────
function ProductListItem({ product }: { product: Product }) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ?? product.images?.[0]?.url ?? "";

  return (
    <a
      href={`/products/${product.slug}`}
      className="flex gap-5 p-4 border border-[#E8E8E8] hover:border-[#111111] group transition-all duration-300"
    >
      <div className="relative w-24 h-32 bg-[#F5F5F5] shrink-0 overflow-hidden">
        {primaryImage && (
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {product.isNewArrival && (
          <span className="absolute top-2 left-2 bg-[#111111] text-white text-[9px] px-1.5 py-0.5 uppercase tracking-wider">
            New
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <p className="label-xs text-[#9A9A9A] mb-1">{product.brand?.name}</p>
          <h3 className="font-sans text-sm font-medium text-[#111111] mb-2 group-hover:text-[#0F4C81] transition-colors">
            {product.name}
          </h3>
          <div className="flex gap-1.5">
            {[...new Map(
              (product.variants || [])
                .filter((v) => v.color)
                .map((v) => [v.color!.id, v.color!])
            ).values()].slice(0, 5).map((color) => (
              <span
                key={color.id}
                className="w-3.5 h-3.5 rounded-full border border-[#E8E8E8]"
                style={{ backgroundColor: color.hexCode }}
                title={color.name}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-sm font-semibold text-[#111111]">
            {formatPrice(product.basePrice)}
          </span>
          {product.comparePrice && Number(product.comparePrice) > Number(product.basePrice) && (
            <span className="font-sans text-xs text-[#9A9A9A] line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
