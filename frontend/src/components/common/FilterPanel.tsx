"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
  sizes: { id: string; name: string }[];
  colors: { id: string; name: string; hexCode: string }[];
}

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
    <div className="border-b border-border py-4">
      <button
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-heading text-xs uppercase tracking-[0.15em] text-primary font-medium">
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function FilterPanel({ categories, brands, sizes, colors }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    size: true,
    color: false,
    brand: false,
  });

  const toggleSection = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
      params.set("page", "1");
    }
    if (key === "sizes") params.delete("size");
    if (key === "colors") params.delete("color");
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => router.push(pathname);

  const hasFilters = ["category", "brand", "sizes", "colors", "size", "color", "minPrice", "maxPrice"].some(
    (k) => searchParams.has(k)
  );

  const panel = (
    <div className="space-y-0">
      {/* Clear All */}
      {hasFilters && (
        <div className="pb-3 flex justify-end">
          <button
            onClick={clearAll}
            className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary underline underline-offset-2 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        </div>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection
          title="Category"
          id="category"
          open={Boolean(openSections.category)}
          onToggle={toggleSection}
        >
          <div className="space-y-2">
            {categories.map((cat) => {
              const active = searchParams.get("category") === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.slug)}
                  className={`block w-full text-left font-sans text-xs py-1 transition-colors ${
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {active && <span className="mr-1">→</span>}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection
        title="Price"
        id="price"
        open={Boolean(openSections.price)}
        onToggle={toggleSection}
      >
        <div className="space-y-2">
          {[
            { label: "Under 1M₫", min: 0, max: 1000000 },
            { label: "1M – 2M₫", min: 1000000, max: 2000000 },
            { label: "2M – 5M₫", min: 2000000, max: 5000000 },
            { label: "Above 5M₫", min: 5000000, max: 99999999 },
          ].map((range) => {
            const active =
              searchParams.get("minPrice") === String(range.min) &&
              searchParams.get("maxPrice") === String(range.max);
            return (
              <button
                key={range.label}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (active) {
                    params.delete("minPrice");
                    params.delete("maxPrice");
                  } else {
                    params.set("minPrice", String(range.min));
                    params.set("maxPrice", String(range.max));
                    params.set("page", "1");
                  }
                  router.push(`${pathname}?${params.toString()}`);
                }}
                className={`block w-full text-left font-sans text-xs py-1 transition-colors ${
                  active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {active && <span className="mr-1">→</span>}
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Sizes */}
      {sizes.length > 0 && (
        <FilterSection
          title="Size"
          id="size"
          open={Boolean(openSections.size)}
          onToggle={toggleSection}
        >
          <div className="flex flex-wrap gap-2">
            {sizes.map((sz) => {
              const currentSize = searchParams.get("sizes") || searchParams.get("size");
              const active = currentSize === sz.name || currentSize === sz.id;
              return (
                <button
                  key={sz.id}
                  onClick={() => updateParam("sizes", sz.name)}
                  className={`min-w-[38px] h-9 px-2 border font-heading text-[10px] tracking-wide transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {sz.name}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <FilterSection
          title="Color"
          id="color"
          open={Boolean(openSections.color)}
          onToggle={toggleSection}
        >
          <div className="flex flex-wrap gap-2">
            {colors.map((col) => {
              const currentColor = searchParams.get("colors") || searchParams.get("color");
              const active = currentColor === col.name || currentColor === col.id;
              return (
                <button
                  key={col.id}
                  onClick={() => updateParam("colors", col.name)}
                  title={col.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    active ? "border-primary scale-110 shadow-md" : "border-transparent hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: col.hexCode }}
                />
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection
          title="Brand"
          id="brand"
          open={Boolean(openSections.brand)}
          onToggle={toggleSection}
        >
          <div className="space-y-2">
            {brands.map((brand) => {
              const active = searchParams.get("brand") === brand.slug;
              return (
                <button
                  key={brand.id}
                  onClick={() => updateParam("brand", brand.slug)}
                  className={`block w-full text-left font-sans text-xs py-1 transition-colors ${
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {active && <span className="mr-1">→</span>}
                  {brand.name}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
        <h2 className="font-heading text-xs uppercase tracking-[0.2em] text-primary mb-6 font-bold">
          Filter
        </h2>
        {panel}
      </aside>

      {/* Mobile Filter Button + Drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 border border-border px-4 py-2.5 font-heading text-[10px] uppercase tracking-[0.15em] text-primary hover:bg-accent transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters {hasFilters && "(active)"}
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="flex-1 bg-primary/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="w-80 bg-background border-l border-border h-full overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <span className="font-heading text-xs uppercase tracking-[0.2em] font-bold">Filters</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex-1">{panel}</div>
              <div className="p-6 border-t border-border">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-full bg-primary text-primary-foreground py-3 font-heading text-[10px] uppercase tracking-widest"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
