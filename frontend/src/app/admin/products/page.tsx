"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Archive,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminDelete,
  adminGet,
  adminPatch,
  adminPost,
  formatMoney,
  getApiErrorMessage,
} from "@/components/admin/admin-api";
import {
  AdminError,
  AdminLoading,
  AdminPageHeader,
  AdminPagination,
} from "@/components/admin/AdminPrimitives";
import { DataTable, DataTableColumn } from "@/components/admin/DataTable";
import {
  createProductForm,
  ProductFormModal,
  ProductFormState,
  productFormPayload,
  productToForm,
} from "@/components/admin/ProductFormModal";
import { AdminProduct, ApiList, ProductOptions } from "@/components/admin/types";

type BulkAction = "show" | "hide" | "feature" | "unfeature";

const PAGE_SIZES = [10, 20, 50] as const;
const PRODUCT_STATUSES = ["", "active", "hidden"] as const;
const PLACEMENT_FILTERS = ["", "featured", "newArrival", "bestSeller"] as const;
const SORT_VALUES = [
  "updatedAt:desc",
  "createdAt:desc",
  "name:asc",
  "basePrice:asc",
  "basePrice:desc",
  "soldCount:desc",
] as const;

type PlacementFilter = (typeof PLACEMENT_FILTERS)[number];
type SortValue = (typeof SORT_VALUES)[number];

function allowlistedValue<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function inventoryCount(product: AdminProduct) {
  const variants = product.variants ?? [];
  if (variants.length === 0) {
    const inventories = Array.isArray(product.inventory)
      ? product.inventory
      : product.inventory
        ? [product.inventory]
        : [];
    return inventories.reduce(
      (sum, inventory) => sum + Number(inventory.quantity || 0),
      0
    );
  }
  return variants.reduce((total, variant) => {
    const inventories = Array.isArray(variant.inventory)
      ? variant.inventory
      : variant.inventory
        ? [variant.inventory]
        : [];
    return total + inventories.reduce((sum, inventory) => sum + Number(inventory.quantity || 0), 0);
  }, 0);
}

function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      aria-label={label}
      disabled={disabled}
      className="size-4 accent-[#111111]"
    />
  );
}

function ProductPlacementBadges({ product }: { product: AdminProduct }) {
  const badges = [
    product.isNewArrival ? "Hàng mới" : null,
    product.isBestSeller ? "Bán chạy" : null,
    product.isFeatured ? "Nổi bật" : null,
  ].filter((label): label is string => Boolean(label));

  if (badges.length === 0) return <span className="text-[#888888]">-</span>;
  return (
    <div className="flex min-w-40 flex-wrap gap-1.5">
      {badges.map((label) => (
        <span key={label} className="admin-badge" data-tone="warning">
          {label}
        </span>
      ))}
    </div>
  );
}

function ProductSearchControls({
  initialSearch,
  hasFilters,
  onApply,
  onReset,
}: {
  initialSearch: string;
  hasFilters: boolean;
  onApply: (search: string) => void;
  onReset: () => void;
}) {
  const [searchInput, setSearchInput] = useState(initialSearch);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(searchInput.trim());
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 lg:flex-row">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777777]" />
        <input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Tìm tên, slug, SKU sản phẩm hoặc SKU biến thể"
          className="admin-input pl-9"
          aria-label="Tìm sản phẩm"
        />
      </div>
      <button type="submit" className="admin-button-outline">
        Áp dụng
      </button>
      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setSearchInput("");
            onReset();
          }}
          className="admin-button-outline"
        >
          <X className="size-4" /> Xóa bộ lọc
        </button>
      )}
    </form>
  );
}

function AdminProductsContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = positiveInteger(searchParams.get("page"), 1);
  const requestedLimit = positiveInteger(searchParams.get("limit"), 10);
  const limit = PAGE_SIZES.includes(requestedLimit as (typeof PAGE_SIZES)[number])
    ? requestedLimit
    : 10;
  const search = searchParams.get("q")?.trim() ?? "";
  const status = allowlistedValue(searchParams.get("status"), PRODUCT_STATUSES, "");
  const categoryId = searchParams.get("categoryId") ?? "";
  const subCategoryId = searchParams.get("subCategoryId") ?? "";
  const placement = allowlistedValue(
    searchParams.get("placement"),
    PLACEMENT_FILTERS,
    ""
  );
  const requestedSortValue = `${searchParams.get("sortBy") ?? "updatedAt"}:${
    searchParams.get("sortOrder") ?? "desc"
  }`;
  const sortValue = allowlistedValue(
    requestedSortValue,
    SORT_VALUES,
    "updatedAt:desc"
  );
  const [sortBy, sortOrder] = sortValue.split(":") as [
    SortValue extends `${infer Field}:${string}` ? Field : never,
    "asc" | "desc",
  ];

  const [form, setForm] = useState<ProductFormState | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState<BulkAction | null>(null);
  const [workingIds, setWorkingIds] = useState<Set<string>>(new Set());

  const updateParams = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) => {
      const shouldDelete =
        value === undefined ||
        value === "" ||
        (key === "page" && Number(value) === 1) ||
        (key === "limit" && Number(value) === 10) ||
        (key === "sortBy" && value === "updatedAt") ||
        (key === "sortOrder" && value === "desc");
      if (shouldDelete) next.delete(key);
      else next.set(key, String(value));
    });
    const query = next.toString();
    setSelectedIds(new Set());
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const productsQuery = useQuery({
    queryKey: [
      "admin",
      "products",
      { page, limit, search, status, categoryId, subCategoryId, placement, sortBy, sortOrder },
    ],
    queryFn: () =>
      adminGet<ApiList<AdminProduct>>("/admin/products", {
        params: {
          page,
          limit,
          search: search || undefined,
          status: status || undefined,
          categoryId: categoryId || undefined,
          subCategoryId: subCategoryId || undefined,
          featured: placement === "featured" ? true : undefined,
          newArrival: placement === "newArrival" ? true : undefined,
          bestSeller: placement === "bestSeller" ? true : undefined,
          sortBy,
          sortOrder,
        },
      }),
    placeholderData: (previous) => previous,
  });
  const optionsQuery = useQuery({
    queryKey: ["admin", "product-options"],
    queryFn: () => adminGet<ProductOptions>("/admin/products/options"),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  const markWorking = (id: string, working: boolean) => {
    setWorkingIds((current) => {
      const next = new Set(current);
      if (working) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (nextForm: ProductFormState) => {
      const payload = productFormPayload(nextForm, form ?? undefined);
      return nextForm.id
        ? adminPatch<AdminProduct>(`/admin/products/${nextForm.id}`, payload)
        : adminPost<AdminProduct>("/admin/products", payload);
    },
    onSuccess: async () => {
      toast.success("Đã lưu sản phẩm");
      setForm(null);
      await refresh();
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Không thể lưu sản phẩm")),
  });

  const openEdit = async (product: AdminProduct) => {
    markWorking(product.id, true);
    try {
      const fullProduct = await adminGet<AdminProduct>(`/admin/products/${product.id}`);
      setForm(productToForm(fullProduct));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải chi tiết sản phẩm"));
    } finally {
      markWorking(product.id, false);
    }
  };

  const toggleProduct = async (product: AdminProduct) => {
    markWorking(product.id, true);
    try {
      await adminPatch(`/admin/products/${product.id}/visibility`, {
        isActive: !product.isActive,
      });
      toast.success(product.isActive ? "Đã ẩn sản phẩm" : "Đã hiển thị sản phẩm");
      await refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể cập nhật trạng thái sản phẩm"));
    } finally {
      markWorking(product.id, false);
    }
  };

  const archiveProduct = async (product: AdminProduct) => {
    if (!window.confirm(`Lưu trữ sản phẩm “${product.name}”?`)) return;
    markWorking(product.id, true);
    try {
      await adminDelete(`/admin/products/${product.id}`);
      toast.success("Đã lưu trữ sản phẩm");
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(product.id);
        return next;
      });
      await refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể lưu trữ sản phẩm"));
    } finally {
      markWorking(product.id, false);
    }
  };

  const resetFilters = () => {
    setSelectedIds(new Set());
    router.replace(pathname, { scroll: false });
  };

  const rows = productsQuery.data?.data ?? [];
  const pageIds = rows.map((product) => product.id);
  const selectedOnPage = pageIds.filter((id) => selectedIds.has(id));
  const allOnPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const someOnPageSelected = selectedOnPage.length > 0 && !allOnPageSelected;

  const setPageSelection = (checked: boolean) => {
    setSelectedIds(checked ? new Set(pageIds) : new Set());
  };

  const setRowSelection = (id: string, checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const runBulkAction = async (action: BulkAction) => {
    const selectedProducts = rows
      .filter((product) => selectedIds.has(product.id))
      .filter((product) => {
        if (action === "show") return !product.isActive;
        if (action === "hide") return product.isActive;
        if (action === "feature") return !product.isFeatured;
        return Boolean(product.isFeatured);
      });
    if (selectedProducts.length === 0) {
      toast.info("Các sản phẩm đã chọn đã ở trạng thái này");
      return;
    }
    const confirmation =
      action === "hide"
        ? `Ẩn ${selectedProducts.length} sản phẩm đã chọn? Khách hàng sẽ không còn thấy các sản phẩm này.`
        : action === "unfeature"
          ? `Bỏ đánh dấu nổi bật khỏi ${selectedProducts.length} sản phẩm đã chọn?`
          : null;
    if (confirmation && !window.confirm(confirmation)) {
      return;
    }

    setBulkPending(action);
    try {
      const results: Array<
        { status: "fulfilled" } | { status: "rejected"; reason: unknown }
      > = [];
      // Visibility updates also clean homepage settings. Keep them sequential so
      // two read-modify-write cleanups cannot overwrite each other.
      for (const product of selectedProducts) {
        try {
          if (action === "show" || action === "hide") {
            await adminPatch(`/admin/products/${product.id}/visibility`, {
              isActive: action === "show",
            });
          } else {
            await adminPatch(`/admin/products/${product.id}`, {
              isFeatured: action === "feature",
            });
          }
          results.push({ status: "fulfilled" });
        } catch (reason) {
          results.push({ status: "rejected", reason });
        }
      }
      const failedIds = results.flatMap((result, index) =>
        result.status === "rejected" ? [selectedProducts[index].id] : []
      );
      const successCount = results.length - failedIds.length;

      if (successCount > 0) toast.success(`Đã cập nhật ${successCount} sản phẩm`);
      if (failedIds.length > 0) {
        const firstFailure = results.find((result) => result.status === "rejected");
        toast.error(
          getApiErrorMessage(
            firstFailure?.status === "rejected" ? firstFailure.reason : undefined,
            `${failedIds.length} sản phẩm chưa thể cập nhật`
          )
        );
      }

      setSelectedIds(new Set(failedIds));
      await refresh();
    } finally {
      setBulkPending(null);
    }
  };

  const columns: Array<DataTableColumn<AdminProduct>> = [
    {
      key: "selection",
      header: (
        <SelectionCheckbox
          checked={allOnPageSelected}
          indeterminate={someOnPageSelected}
          onChange={setPageSelection}
          label="Chọn tất cả sản phẩm trên trang"
          disabled={Boolean(bulkPending)}
        />
      ),
      className: "w-12",
      cell: (product) => (
        <SelectionCheckbox
          checked={selectedIds.has(product.id)}
          onChange={(checked) => setRowSelection(product.id, checked)}
          label={`Chọn ${product.name}`}
          disabled={Boolean(bulkPending)}
        />
      ),
    },
    {
      key: "product",
      header: "Sản phẩm",
      cell: (product) => (
        <div className="flex min-w-60 items-center gap-3">
          <div className="relative size-12 shrink-0 bg-[#F2F2F2]">
            {product.images?.[0]?.url && (
              <Image src={product.images[0].url} alt={product.name} fill sizes="48px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#111111]">{product.name}</p>
            <p className="mt-0.5 text-[11px] text-[#777777]">{product.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "variants",
      header: "Biến thể",
      cell: (product) => {
        const variants = product.variants ?? [];
        const activeCount = variants.filter((variant) => variant.isActive !== false).length;
        const colors = Array.from(
          new Set(variants.map((variant) => variant.color?.name).filter(Boolean))
        );
        const sizes = Array.from(
          new Set(variants.map((variant) => variant.size?.name).filter(Boolean))
        );
        return (
          <div className="min-w-40">
            <p className="font-semibold">{activeCount}/{variants.length} đang bán</p>
            <p className="mt-1 max-w-48 truncate text-[11px] text-[#777777]">
              {[colors.join(", "), sizes.join(", ")].filter(Boolean).join(" · ") || "Mặc định"}
            </p>
          </div>
        );
      },
    },
    {
      key: "placement",
      header: "Phân loại",
      cell: (product) => <ProductPlacementBadges product={product} />,
    },
    {
      key: "category",
      header: "Danh mục",
      cell: (product) => (
        <div className="min-w-28">
          <p>{product.category?.name ?? "-"}</p>
          {product.subCategory?.name && (
            <p className="mt-0.5 text-[11px] text-[#777777]">{product.subCategory.name}</p>
          )}
        </div>
      ),
    },
    {
      key: "price",
      header: "Giá",
      cell: (product) => <span className="font-semibold">{formatMoney(product.basePrice)}</span>,
    },
    { key: "stock", header: "Tồn kho", cell: (product) => inventoryCount(product) },
    {
      key: "status",
      header: "Trạng thái",
      cell: (product) => (
        <span className="admin-badge" data-tone={product.isActive ? "success" : "danger"}>
          {product.isActive ? "Đang bán" : "Đã ẩn"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      className: "min-w-[148px] text-right",
      sticky: "right",
      cell: (product) => {
        const busy = workingIds.has(product.id) || Boolean(bulkPending);
        return (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => openEdit(product)}
              disabled={busy}
              className="admin-icon-button"
              aria-label="Sửa sản phẩm"
              title="Sửa"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => toggleProduct(product)}
              disabled={busy}
              className="admin-icon-button"
              aria-label={product.isActive ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
              title={product.isActive ? "Ẩn" : "Hiện"}
            >
              {product.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => archiveProduct(product)}
              disabled={busy}
              className="admin-icon-button"
              aria-label="Lưu trữ sản phẩm"
              title="Lưu trữ"
            >
              <Archive className="size-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const hasFilters = Boolean(search || status || categoryId || subCategoryId || placement || sortValue !== "updatedAt:desc" || limit !== 10);
  const availableSubCategories = (optionsQuery.data?.categories ?? []).flatMap(
    (category) =>
      (category.subCategories ?? [])
        .filter(() => !categoryId || category.id === categoryId)
        .map((subCategory) => ({
          ...subCategory,
          label: categoryId ? subCategory.name : `${category.name} / ${subCategory.name}`,
        })),
  );

  return (
    <>
      <AdminPageHeader
        title="Sản phẩm"
        description="Tìm, phân loại và cập nhật nhanh sản phẩm, biến thể, trạng thái và tồn kho."
        actionLabel="Thêm sản phẩm"
        onAction={() => {
          if (optionsQuery.isPending) {
            toast.info("Đang tải danh mục và tùy chọn sản phẩm");
            return;
          }
          if (optionsQuery.isError || !optionsQuery.data) {
            toast.error(
              getApiErrorMessage(optionsQuery.error, "Không thể tải tùy chọn sản phẩm")
            );
            return;
          }
          setForm(createProductForm(optionsQuery.data));
        }}
      />

      <div className="mb-5 space-y-3 border border-[#E1E1E1] bg-white p-3">
        <ProductSearchControls
          key={search}
          initialSearch={search}
          hasFilters={hasFilters}
          onApply={(nextSearch) => updateParams({ q: nextSearch, page: 1 })}
          onReset={resetFilters}
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <select
            value={status}
            onChange={(event) => updateParams({ status: event.target.value, page: 1 })}
            className="admin-select"
            aria-label="Lọc trạng thái sản phẩm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="hidden">Đã ẩn</option>
          </select>
          <select
            value={categoryId}
            onChange={(event) =>
              updateParams({ categoryId: event.target.value, subCategoryId: undefined, page: 1 })
            }
            className="admin-select"
            aria-label="Lọc danh mục"
            disabled={optionsQuery.isPending}
          >
            <option value="">Tất cả danh mục</option>
            {(optionsQuery.data?.categories ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={subCategoryId}
            onChange={(event) => updateParams({ subCategoryId: event.target.value, page: 1 })}
            className="admin-select"
            aria-label="Lọc danh mục con"
            disabled={optionsQuery.isPending || availableSubCategories.length === 0}
          >
            <option value="">Tất cả danh mục con</option>
            {availableSubCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.label}
              </option>
            ))}
          </select>
          <select
            value={placement}
            onChange={(event) =>
              updateParams({ placement: event.target.value as PlacementFilter, page: 1 })
            }
            className="admin-select"
            aria-label="Lọc phân loại sản phẩm"
          >
            <option value="">Tất cả phân loại</option>
            <option value="newArrival">Hàng mới</option>
            <option value="bestSeller">Bán chạy</option>
            <option value="featured">Nổi bật</option>
          </select>
          <select
            value={sortValue}
            onChange={(event) => {
              const [nextSortBy, nextSortOrder] = event.target.value.split(":");
              updateParams({ sortBy: nextSortBy, sortOrder: nextSortOrder, page: 1 });
            }}
            className="admin-select"
            aria-label="Sắp xếp sản phẩm"
          >
            <option value="updatedAt:desc">Cập nhật gần nhất</option>
            <option value="createdAt:desc">Tạo mới nhất</option>
            <option value="name:asc">Tên A-Z</option>
            <option value="basePrice:asc">Giá tăng dần</option>
            <option value="basePrice:desc">Giá giảm dần</option>
            <option value="soldCount:desc">Bán nhiều nhất</option>
          </select>
          <select
            value={limit}
            onChange={(event) => updateParams({ limit: Number(event.target.value), page: 1 })}
            className="admin-select"
            aria-label="Số sản phẩm mỗi trang"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} sản phẩm / trang
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-col gap-3 border border-[#CFCFCF] bg-[#FAFAFA] p-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">Đã chọn {selectedIds.size} sản phẩm</p>
            <p className="mt-0.5 text-xs text-[#666666]">Thao tác áp dụng cho các hàng trên trang hiện tại.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => runBulkAction("show")} disabled={Boolean(bulkPending)} className="admin-button-outline">
              <Eye className="size-4" /> Hiện
            </button>
            <button type="button" onClick={() => runBulkAction("hide")} disabled={Boolean(bulkPending)} className="admin-button-outline">
              <EyeOff className="size-4" /> Ẩn
            </button>
            <button type="button" onClick={() => runBulkAction("feature")} disabled={Boolean(bulkPending)} className="admin-button-outline">
              <Sparkles className="size-4" /> Đánh dấu nổi bật
            </button>
            <button type="button" onClick={() => runBulkAction("unfeature")} disabled={Boolean(bulkPending)} className="admin-button-outline">
              Bỏ nổi bật
            </button>
            {bulkPending && <Loader2 className="m-3 size-4 animate-spin text-[#666666]" />}
          </div>
        </div>
      )}

      {productsQuery.isPending ? (
        <AdminLoading />
      ) : productsQuery.isError || !productsQuery.data ? (
        <AdminError
          message={getApiErrorMessage(productsQuery.error, "Không thể tải danh sách sản phẩm")}
          onRetry={() => productsQuery.refetch()}
        />
      ) : (
        <>
          {productsQuery.isFetching && (
            <div className="mb-2 flex items-center justify-end gap-2 text-xs text-[#666666]" role="status">
              <Loader2 className="size-3.5 animate-spin" /> Đang cập nhật kết quả
            </div>
          )}
          <DataTable
            rows={productsQuery.data.data}
            columns={columns}
            getRowKey={(product) => product.id}
            emptyTitle={hasFilters ? "Không tìm thấy sản phẩm phù hợp" : "Chưa có sản phẩm"}
            emptyDescription={
              hasFilters
                ? "Hãy thử từ khóa khác hoặc xóa bớt bộ lọc."
                : "Tạo sản phẩm đầu tiên để bắt đầu quản lý danh mục."
            }
          />
          <AdminPagination
            meta={productsQuery.data.meta}
            onPageChange={(nextPage) => updateParams({ page: nextPage })}
          />
        </>
      )}

      {form && optionsQuery.data && (
        <ProductFormModal
          key={form.id ?? "new-product"}
          initialForm={form}
          options={optionsQuery.data}
          saving={saveMutation.isPending}
          onSave={(nextForm) => saveMutation.mutate(nextForm)}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<AdminLoading label="Đang tải bộ lọc sản phẩm" />}>
      <AdminProductsContent />
    </Suspense>
  );
}
