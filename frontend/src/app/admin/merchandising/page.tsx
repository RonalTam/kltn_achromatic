"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  ImageOff,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { adminGet, adminPatch, formatMoney } from "@/components/admin/admin-api";
import {
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPagination,
} from "@/components/admin/AdminPrimitives";
import {
  AdminProduct,
  ApiList,
  HomepageMerchandising,
  MerchandisingSection,
  ProductOptions,
} from "@/components/admin/types";

type SectionKey = "new-arrivals" | "best-sellers";

const SECTION_INFO: Record<
  SectionKey,
  { dataKey: keyof HomepageMerchandising; label: string; description: string }
> = {
  "new-arrivals": {
    dataKey: "newArrivals",
    label: "Hàng mới về",
    description: "Chọn và sắp thứ tự các thiết kế mới xuất hiện trên trang chủ.",
  },
  "best-sellers": {
    dataKey: "bestSellers",
    label: "Best seller",
    description: "Ưu tiên các sản phẩm bán tốt và kiểm soát thứ tự hiển thị.",
  },
};

function productInventory(product: AdminProduct) {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    const inventory = Array.isArray(product.inventory)
      ? product.inventory[0]
      : product.inventory;
    const quantity = Number(inventory?.quantity ?? 0);
    const reserved = Number(inventory?.reserved ?? 0);
    return { quantity, available: Math.max(quantity - reserved, 0) };
  }

  return variants.filter((variant) => variant.isActive !== false).reduce(
    (total, variant) => {
      const inventory = Array.isArray(variant.inventory)
        ? variant.inventory[0]
        : variant.inventory;
      const quantity = Number(inventory?.quantity ?? 0);
      const reserved = Number(inventory?.reserved ?? 0);
      return {
        quantity: total.quantity + quantity,
        available: total.available + Math.max(quantity - reserved, 0),
      };
    },
    { quantity: 0, available: 0 },
  );
}

function ProductThumbnail({ product }: { product: AdminProduct }) {
  const url = product.images?.[0]?.url;
  return (
    <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden bg-[#F0F0F0] text-[#777777]">
      {url ? (
        <Image src={url} alt="Ảnh sản phẩm" fill sizes="56px" className="object-cover" />
      ) : (
        <ImageOff className="size-4" aria-hidden="true" />
      )}
    </div>
  );
}

function MerchandisingWorkspace({
  sectionKey,
  initialSection,
  options,
  onDirtyChange,
}: {
  sectionKey: SectionKey;
  initialSection: MerchandisingSection;
  options?: ProductOptions;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const sectionInfo = SECTION_INFO[sectionKey];
  const [selected, setSelected] = useState(initialSection.products);
  const [limit, setLimit] = useState(initialSection.limit);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [categoryId, setCategoryId] = useState("");
  const [onlyClassified, setOnlyClassified] = useState(true);
  const [page, setPage] = useState(1);

  const candidatesQuery = useQuery({
    queryKey: [
      "admin",
      "merchandising-candidates",
      { sectionKey, deferredSearch, categoryId, onlyClassified, page },
    ],
    queryFn: () =>
      adminGet<ApiList<AdminProduct>>("/admin/products", {
        params: {
          page,
          limit: 8,
          search: deferredSearch || undefined,
          categoryId: categoryId || undefined,
          status: "active",
          newArrival:
            onlyClassified && sectionKey === "new-arrivals" ? true : undefined,
          bestSeller:
            onlyClassified && sectionKey === "best-sellers" ? true : undefined,
          sortBy: sectionKey === "best-sellers" ? "soldCount" : "updatedAt",
          sortOrder: "desc",
        },
      }),
    placeholderData: (previous) => previous,
  });

  const initialSignature = useMemo(
    () => `${initialSection.limit}:${initialSection.products.map((product) => product.id).join(",")}`,
    [initialSection],
  );
  const currentSignature = `${limit}:${selected.map((product) => product.id).join(",")}`;
  const dirty = currentSignature !== initialSignature;
  const selectedIds = new Set(selected.map((product) => product.id));

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminPatch<MerchandisingSection>(`/admin/merchandising/${sectionKey}`, {
        productIds: selected.map((product) => product.id),
        limit,
      }),
    onSuccess: async (savedSection) => {
      queryClient.setQueryData<HomepageMerchandising>(
        ["admin", "merchandising"],
        (current) =>
          current
            ? { ...current, [sectionInfo.dataKey]: savedSection }
            : current,
      );
      toast.success(`Đã cập nhật khu vực ${sectionInfo.label}`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "merchandising"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
      ]);
    },
    onError: (error) => {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Không thể cập nhật khu vực trang chủ";
      toast.error(message);
    },
  });

  const addProduct = (product: AdminProduct) => {
    if (selectedIds.has(product.id)) return;
    if (selected.length >= limit) {
      toast.error(`Khu vực đã đủ ${limit} vị trí`);
      return;
    }
    setSelected((current) => [...current, product]);
  };

  const removeProduct = (productId: string) => {
    setSelected((current) => current.filter((product) => product.id !== productId));
  };

  const moveProduct = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selected.length) return;
    setSelected((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const changeLimit = (nextLimit: number) => {
    if (selected.length > nextLimit) {
      const confirmed = window.confirm(
        `Giảm còn ${nextLimit} vị trí sẽ bỏ ${selected.length - nextLimit} sản phẩm cuối danh sách. Tiếp tục?`,
      );
      if (!confirmed) return;
      setSelected((current) => current.slice(0, nextLimit));
    }
    setLimit(nextLimit);
  };

  const resetChanges = () => {
    setSelected(initialSection.products);
    setLimit(initialSection.limit);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
      <section className="min-w-0 border border-[#E1E1E1] bg-white" aria-labelledby="candidate-heading">
        <div className="border-b border-[#E8E8E8] p-4 sm:p-5">
          <h2 id="candidate-heading" className="font-heading text-2xl font-light">
            Tìm sản phẩm
          </h2>
          <p className="mt-1 text-sm text-[#666666]">
            Tìm theo tên, SKU sản phẩm, SKU biến thể, thương hiệu hoặc danh mục.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
            <label className="relative block">
              <span className="sr-only">Tìm sản phẩm</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#666666]" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="admin-input pl-9"
                placeholder="Ví dụ: polo, ACH-001, SKU biến thể"
              />
            </label>
            <label>
              <span className="sr-only">Lọc danh mục</span>
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setPage(1);
                }}
                className="admin-select"
              >
                <option value="">Tất cả danh mục</option>
                {(options?.categories ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[#444444]">
            <input
              type="checkbox"
              checked={onlyClassified}
              onChange={(event) => {
                setOnlyClassified(event.target.checked);
                setPage(1);
              }}
            />
            Chỉ hiện sản phẩm đã phân loại {sectionInfo.label} trong catalog
          </label>
        </div>

        {candidatesQuery.isPending ? (
          <AdminLoading label="Đang tìm sản phẩm" />
        ) : candidatesQuery.isError || !candidatesQuery.data ? (
          <div className="p-5">
            <AdminError message="Không thể tải danh sách sản phẩm. Hãy thử lại." />
            <button
              type="button"
              onClick={() => candidatesQuery.refetch()}
              className="admin-button-outline mx-auto mt-3"
            >
              <RotateCcw className="size-4" /> Thử lại
            </button>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[#EEEEEE]">
              {candidatesQuery.data.data.map((product) => {
                const inventory = productInventory(product);
                const alreadySelected = selectedIds.has(product.id);
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-4 transition-colors hover:bg-[#FAFAFA]"
                  >
                    <ProductThumbnail product={product} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111111]">{product.name}</p>
                      <p className="mt-0.5 truncate text-xs text-[#666666]">
                        {product.sku} | {product.category?.name ?? "Chưa có danh mục"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#555555]">
                        <span>{formatMoney(product.basePrice)}</span>
                        <span>{inventory.available} khả dụng</span>
                        {sectionKey === "best-sellers" && (
                          <span>{product.soldCount ?? 0} đã bán</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addProduct(product)}
                      disabled={alreadySelected || selected.length >= limit}
                      className={alreadySelected ? "admin-icon-button bg-[#F4F8F5]" : "admin-icon-button"}
                      aria-label={alreadySelected ? `${product.name} đã được chọn` : `Thêm ${product.name}`}
                    >
                      {alreadySelected ? <Check className="size-4" /> : <Plus className="size-4" />}
                    </button>
                  </div>
                );
              })}
              {candidatesQuery.data.data.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="font-heading text-xl font-light">Không tìm thấy sản phẩm</p>
                  <p className="mt-1 text-sm text-[#666666]">Thử từ khóa hoặc danh mục khác.</p>
                </div>
              )}
            </div>
            <div className="px-4 pb-4">
              <AdminPagination meta={candidatesQuery.data.meta} onPageChange={setPage} />
            </div>
          </>
        )}
      </section>

      <section className="min-w-0 border border-[#D8D8D8] bg-white" aria-labelledby="selected-heading">
        <div className="sticky top-16 z-10 border-b border-[#E1E1E1] bg-white p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="selected-heading" className="font-heading text-2xl font-light">
                  Đang hiển thị
                </h2>
                <span className="admin-badge" data-tone={selected.length === limit ? "success" : "warning"}>
                  {selected.length}/{limit} vị trí
                </span>
                {dirty && <span className="admin-badge" data-tone="warning">Chưa lưu</span>}
              </div>
              <p className="mt-1 text-sm text-[#666666]">
                Sản phẩm ở đầu danh sách sẽ xuất hiện trước trên trang chủ.
              </p>
              <a
                href={`/#${sectionKey}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[#0F4C81] underline decoration-[#0F4C81]/35 underline-offset-4 hover:decoration-[#0F4C81]"
              >
                Xem khu vực trên trang chủ
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
            <label className="sm:w-40">
              <span className="admin-label">Số vị trí</span>
              <select
                value={limit}
                onChange={(event) => changeLimit(Number(event.target.value))}
                className="admin-select"
              >
                {[4, 6, 8, 10, 12].map((value) => (
                  <option key={value} value={value}>{value} sản phẩm</option>
                ))}
              </select>
            </label>
          </div>
          {initialSection.source === "fallback" && (
            <p className="mt-3 border-l-2 border-[#0F4C81] bg-[#F3F7FA] px-3 py-2 text-xs leading-5 text-[#3E566B]">
              Đây là danh sách tự động từ dữ liệu cũ. Bấm lưu để chuyển sang thứ tự do admin kiểm soát.
            </p>
          )}
        </div>

        <div className="divide-y divide-[#EEEEEE]">
          {selected.map((product, index) => {
            const inventory = productInventory(product);
            const missingClassification =
              sectionKey === "new-arrivals"
                ? !product.isNewArrival
                : !product.isBestSeller;
            return (
              <div key={product.id} className="grid grid-cols-[32px_56px_minmax(0,1fr)_auto] items-center gap-3 p-4">
                <span className="text-center text-sm font-semibold tabular-nums text-[#666666]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <ProductThumbnail product={product} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="mt-0.5 truncate text-xs text-[#666666]">{product.sku}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {!product.isActive && <span className="admin-badge" data-tone="danger">Đã ẩn</span>}
                    {!product.images?.[0]?.url && <span className="admin-badge" data-tone="warning">Thiếu ảnh</span>}
                    {inventory.available <= 0 && <span className="admin-badge" data-tone="danger">Hết hàng</span>}
                    {missingClassification && (
                      <span className="admin-badge" data-tone="warning">
                        Chưa phân loại {sectionInfo.label}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => moveProduct(index, -1)}
                    disabled={index === 0}
                    className="admin-icon-button"
                    aria-label={`Đưa ${product.name} lên`}
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveProduct(index, 1)}
                    disabled={index === selected.length - 1}
                    className="admin-icon-button"
                    aria-label={`Đưa ${product.name} xuống`}
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="admin-icon-button col-span-2 w-full text-[#9D2E27]"
                    aria-label={`Bỏ ${product.name}`}
                  >
                    <Trash2 className="size-4" /> Bỏ
                  </button>
                </div>
              </div>
            );
          })}
          {selected.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="font-heading text-2xl font-light">Chưa chọn sản phẩm</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#666666]">
                Tìm sản phẩm ở cột bên trái và thêm vào khu vực này. Lưu danh sách rỗng sẽ ẩn khu vực khỏi trang chủ.
              </p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col justify-between gap-3 border-t border-[#D8D8D8] bg-white p-4 sm:flex-row sm:items-center sm:p-5">
          <p className="text-xs leading-5 text-[#666666]">
            Chỉ sản phẩm đang hoạt động mới xuất hiện với khách hàng.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={resetChanges}
              disabled={!dirty || saveMutation.isPending}
              className="admin-button-outline"
            >
              <RotateCcw className="size-4" />
              Hoàn tác
            </button>
            <button
              type="button"
              onClick={() => saveMutation.mutate()}
              disabled={!dirty || saveMutation.isPending}
              className="admin-button"
            >
              <Save className="size-4" />
              {saveMutation.isPending ? "Đang lưu" : "Lưu trang chủ"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdminMerchandisingPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("new-arrivals");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const merchandisingQuery = useQuery({
    queryKey: ["admin", "merchandising"],
    queryFn: () => adminGet<HomepageMerchandising>("/admin/merchandising"),
  });
  const optionsQuery = useQuery({
    queryKey: ["admin", "product-options"],
    queryFn: () => adminGet<ProductOptions>("/admin/products/options"),
  });

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const guardInternalNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const logoutButton = target.closest<HTMLButtonElement>(
        'button[aria-label="Đăng xuất"]',
      );
      if (logoutButton) {
        if (window.confirm("Bạn có thay đổi chưa lưu. Đăng xuất và bỏ các thay đổi này?")) {
          setHasUnsavedChanges(false);
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);
      if (
        destination.origin !== current.origin ||
        `${destination.pathname}${destination.search}${destination.hash}` ===
          `${current.pathname}${current.search}${current.hash}`
      ) {
        return;
      }

      if (window.confirm("Bạn có thay đổi chưa lưu. Rời trang và bỏ các thay đổi này?")) {
        setHasUnsavedChanges(false);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    };

    document.addEventListener("click", guardInternalNavigation, true);
    return () => document.removeEventListener("click", guardInternalNavigation, true);
  }, [hasUnsavedChanges]);

  const sectionInfo = SECTION_INFO[activeSection];

  return (
    <>
      <AdminPageHeader
        title="Trưng bày trang chủ"
        description="Chọn đúng sản phẩm, kiểm soát số lượng và sắp thứ tự cho các khu vực mua sắm chính."
      />

      {merchandisingQuery.isPending ? (
        <AdminLoading label="Đang tải cấu hình trang chủ" />
      ) : merchandisingQuery.isError || !merchandisingQuery.data ? (
        <AdminError
          message="Không thể tải cấu hình trưng bày trang chủ."
          onRetry={() => merchandisingQuery.refetch()}
        />
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Khu vực trang chủ">
            {(Object.keys(SECTION_INFO) as SectionKey[]).map((key) => {
              const info = SECTION_INFO[key];
              const section = merchandisingQuery.data[info.dataKey];
              const active = key === activeSection;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    if (active) return;
                    if (
                      hasUnsavedChanges &&
                      !window.confirm("Bạn có thay đổi chưa lưu. Chuyển khu vực và bỏ các thay đổi này?")
                    ) {
                      return;
                    }
                    setHasUnsavedChanges(false);
                    setActiveSection(key);
                  }}
                  className={`border p-4 text-left transition-colors sm:p-5 ${
                    active
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#DADADA] bg-white text-[#111111] hover:border-[#777777]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-4">
                    <span className="font-heading text-xl font-light">{info.label}</span>
                    <span className={`text-sm font-semibold tabular-nums ${active ? "text-white" : "text-[#555555]"}`}>
                      {section.products.length}/{section.limit}
                    </span>
                  </span>
                  <span className={`mt-1 block text-sm leading-5 ${active ? "text-white/65" : "text-[#666666]"}`}>
                    {info.description}
                  </span>
                </button>
              );
            })}
          </div>

          <MerchandisingWorkspace
            key={`${activeSection}-${merchandisingQuery.dataUpdatedAt}`}
            sectionKey={activeSection}
            initialSection={merchandisingQuery.data[sectionInfo.dataKey]}
            options={optionsQuery.data}
            onDirtyChange={setHasUnsavedChanges}
          />
        </>
      )}
    </>
  );
}
