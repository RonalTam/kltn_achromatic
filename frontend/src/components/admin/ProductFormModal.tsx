"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/components/admin/admin-api";
import {
  AdminField,
  AdminModal,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/AdminPrimitives";
import { AdminProduct, ProductOptions } from "@/components/admin/types";

export interface ProductFormState {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  subCategoryId: string;
  brandId: string;
  gender: "MALE" | "FEMALE" | "UNISEX";
  material: string;
  careInstructions: string;
  basePrice: string;
  comparePrice: string;
  tags: string;
  images: string;
  collectionIds: string[];
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  variants: Array<{
    id?: string;
    sku: string;
    colorId: string;
    sizeId: string;
    price: string;
    imageUrl: string;
    quantity: string;
    threshold: string;
    location: string;
    isActive: boolean;
  }>;
}

type ProductFormTab = "details" | "images" | "variants" | "visibility";

type ProductFormError = {
  tab: ProductFormTab;
  message: string;
};

const emptyVariant: ProductFormState["variants"][number] = {
  sku: "",
  colorId: "",
  sizeId: "",
  price: "",
  imageUrl: "",
  quantity: "0",
  threshold: "5",
  location: "Kho TP.HCM",
  isActive: true,
};

const TABS: Array<{
  id: ProductFormTab;
  label: string;
  description: string;
}> = [
  { id: "details", label: "Thông tin", description: "Tên, mô tả và giá bán" },
  { id: "images", label: "Hình ảnh", description: "Ảnh chính và thứ tự hiển thị" },
  { id: "variants", label: "Biến thể", description: "Màu, size và tồn kho" },
  { id: "visibility", label: "Hiển thị & SEO", description: "Trạng thái, bộ sưu tập và metadata" },
];

function splitImageUrls(value: string) {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

function normalizedKey(value: string) {
  return value.trim().toLocaleLowerCase("vi");
}

function skuToken(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

export function validateProductForm(form: ProductFormState): ProductFormError[] {
  const errors: ProductFormError[] = [];
  const basePrice = Number(form.basePrice);
  const comparePrice = Number(form.comparePrice);

  if (!form.name.trim()) errors.push({ tab: "details", message: "Tên sản phẩm không được để trống." });
  if (!form.description.trim()) errors.push({ tab: "details", message: "Mô tả sản phẩm không được để trống." });
  if (!form.categoryId) errors.push({ tab: "details", message: "Hãy chọn danh mục sản phẩm." });
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    errors.push({ tab: "details", message: "Giá bán phải lớn hơn 0." });
  }
  if (form.comparePrice && (!Number.isFinite(comparePrice) || comparePrice <= 0)) {
    errors.push({ tab: "details", message: "Giá so sánh phải là số lớn hơn 0." });
  }
  if (form.comparePrice && Number.isFinite(basePrice) && comparePrice < basePrice) {
    errors.push({ tab: "details", message: "Giá so sánh không được thấp hơn giá bán." });
  }

  const imageUrls = splitImageUrls(form.images);
  const uniqueImages = new Set(imageUrls.map(normalizedKey));
  if (uniqueImages.size !== imageUrls.length) {
    errors.push({ tab: "images", message: "Danh sách hình ảnh đang có URL trùng nhau." });
  }

  const usedSkus = new Map<string, number>();
  const usedCombinations = new Map<string, number>();
  if (!form.id && form.variants.length === 0) {
    errors.push({
      tab: "variants",
      message: "Sản phẩm cần ít nhất một biến thể để khởi tạo và quản lý tồn kho.",
    });
  }
  form.variants.forEach((variant, index) => {
    const position = index + 1;
    const variantSku = normalizedKey(variant.sku);
    if (variantSku) {
      const previous = usedSkus.get(variantSku);
      if (previous) {
        errors.push({
          tab: "variants",
          message: `SKU biến thể ${position} trùng với biến thể ${previous}.`,
        });
      } else {
        usedSkus.set(variantSku, position);
      }
    }

    const combinationKey = `${variant.colorId || "default"}:${variant.sizeId || "default"}`;
    const previousCombination = usedCombinations.get(combinationKey);
    if (previousCombination) {
      errors.push({
        tab: "variants",
        message: `Biến thể ${position} trùng tổ hợp màu và kích thước với biến thể ${previousCombination}.`,
      });
    } else {
      usedCombinations.set(combinationKey, position);
    }

    const quantity = Number(variant.quantity || 0);
    const threshold = Number(variant.threshold || 0);
    const price = variant.price ? Number(variant.price) : null;
    if (!Number.isInteger(quantity) || quantity < 0) {
      errors.push({ tab: "variants", message: `Tồn kho biến thể ${position} phải là số nguyên từ 0.` });
    }
    if (!Number.isInteger(threshold) || threshold < 0) {
      errors.push({ tab: "variants", message: `Ngưỡng cảnh báo biến thể ${position} phải là số nguyên từ 0.` });
    }
    if (price !== null && (!Number.isFinite(price) || price < 0)) {
      errors.push({ tab: "variants", message: `Giá riêng biến thể ${position} không hợp lệ.` });
    }
  });

  return errors;
}

export function createProductForm(options: ProductOptions): ProductFormState {
  return {
    name: "",
    slug: "",
    sku: "",
    description: "",
    shortDescription: "",
    categoryId: options.categories[0]?.id ?? "",
    subCategoryId: "",
    brandId: "",
    gender: "UNISEX",
    material: "",
    careInstructions: "",
    basePrice: "",
    comparePrice: "",
    tags: "",
    images: "",
    collectionIds: [],
    metaTitle: "",
    metaDescription: "",
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    variants: [{ ...emptyVariant }],
  };
}

export function productToForm(product: AdminProduct): ProductFormState {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    categoryId: product.category?.id ?? product.categoryId ?? "",
    subCategoryId: product.subCategory?.id ?? product.subCategoryId ?? "",
    brandId: product.brandId ?? product.brand?.id ?? "",
    gender: product.gender ?? "UNISEX",
    material: product.material ?? "",
    careInstructions: product.careInstructions ?? "",
    basePrice: String(product.basePrice ?? ""),
    comparePrice: String(product.comparePrice ?? ""),
    tags: (product.tags ?? []).join(", "),
    images: (product.images ?? []).map((image) => image.url).join("\n"),
    collectionIds: (product.collections ?? []).map((item) => item.collection.id),
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    isActive: product.isActive,
    isFeatured: Boolean(product.isFeatured),
    isNewArrival: Boolean(product.isNewArrival),
    isBestSeller: Boolean(product.isBestSeller),
    variants: (product.variants ?? []).map((variant) => {
      const inventory = Array.isArray(variant.inventory)
        ? variant.inventory[0]
        : variant.inventory;
      return {
        id: variant.id,
        sku: variant.sku ?? "",
        colorId: variant.color?.id ?? "",
        sizeId: variant.size?.id ?? "",
        price: String(variant.price ?? ""),
        imageUrl: variant.imageUrl ?? "",
        quantity: String(inventory?.quantity ?? 0),
        threshold: String(inventory?.threshold ?? 5),
        location: inventory?.location ?? "Kho TP.HCM",
        isActive: variant.isActive !== false,
      };
    }),
  };
}

export function productFormPayload(
  form: ProductFormState,
  initialForm?: ProductFormState
) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || undefined,
    sku: form.sku.trim() || undefined,
    description: form.description.trim(),
    shortDescription: form.shortDescription.trim() || null,
    categoryId: form.categoryId,
    subCategoryId: form.subCategoryId || null,
    brandId: form.brandId || null,
    gender: form.gender,
    material: form.material.trim() || null,
    careInstructions: form.careInstructions.trim() || null,
    basePrice: Number(form.basePrice),
    comparePrice: form.comparePrice ? Number(form.comparePrice) : null,
    tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    images: splitImageUrls(form.images),
    collectionIds: Array.from(new Set(form.collectionIds)),
    metaTitle: form.metaTitle.trim() || null,
    metaDescription: form.metaDescription.trim() || null,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    isNewArrival: form.isNewArrival,
    isBestSeller: form.isBestSeller,
    variants: form.variants.map((variant) => {
      const initialVariant = variant.id
        ? initialForm?.variants.find((item) => item.id === variant.id)
        : undefined;
      const shouldCreateInventory = !variant.id || !initialVariant;
      const quantity = Number(variant.quantity || 0);
      const threshold = Number(variant.threshold || 0);
      const location = variant.location.trim() || null;
      const initialQuantity = Number(initialVariant?.quantity || 0);
      const initialThreshold = Number(initialVariant?.threshold || 0);
      const initialLocation = initialVariant?.location.trim() || null;

      return {
        id: variant.id,
        sku: variant.sku.trim() || undefined,
        colorId: variant.colorId || undefined,
        sizeId: variant.sizeId || undefined,
        price: variant.price ? Number(variant.price) : null,
        imageUrl: variant.imageUrl.trim() || null,
        ...(shouldCreateInventory || quantity !== initialQuantity ? { quantity } : {}),
        ...(shouldCreateInventory || threshold !== initialThreshold ? { threshold } : {}),
        ...(shouldCreateInventory || location !== initialLocation ? { location } : {}),
        isActive: variant.isActive,
      };
    }),
  };
}

export function ProductFormModal({
  initialForm,
  options,
  saving,
  onSave,
  onClose,
}: {
  initialForm: ProductFormState;
  options: ProductOptions;
  saving: boolean;
  onSave: (form: ProductFormState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initialForm);
  const [activeTab, setActiveTab] = useState<ProductFormTab>("details");
  const [uploading, setUploading] = useState(false);
  const [variantSearch, setVariantSearch] = useState("");
  const [matrixColorIds, setMatrixColorIds] = useState<string[]>([]);
  const [matrixSizeIds, setMatrixSizeIds] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ProductFormError[]>([]);
  const subCategories =
    options.categories.find((category) => category.id === form.categoryId)
      ?.subCategories ?? [];

  const imageUrls = useMemo(() => splitImageUrls(form.images), [form.images]);
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm]
  );
  const normalizedVariantSearch = normalizedKey(variantSearch);
  const visibleVariants = useMemo(
    () =>
      form.variants
        .map((variant, index) => ({ variant, index }))
        .filter(({ variant }) => {
          if (!normalizedVariantSearch) return true;
          const color = options.colors.find((item) => item.id === variant.colorId)?.name ?? "";
          const size = options.sizes.find((item) => item.id === variant.sizeId)?.name ?? "";
          return normalizedKey(`${variant.sku} ${color} ${size} ${variant.location}`).includes(
            normalizedVariantSearch
          );
        }),
    [form.variants, normalizedVariantSearch, options.colors, options.sizes]
  );

  const update = (patch: Partial<ProductFormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const setImageUrls = (urls: string[]) => update({ images: urls.join("\n") });

  const moveImage = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= imageUrls.length) return;
    const next = [...imageUrls];
    [next[index], next[destination]] = [next[destination], next[index]];
    setImageUrls(next);
  };

  const updateVariant = (
    index: number,
    patch: Partial<ProductFormState["variants"][number]>
  ) => {
    update({
      variants: form.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant
      ),
    });
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const data = new FormData();
    Array.from(files).forEach((file) => data.append("files", file));
    try {
      const response = await api.post<{ data: { urls: string[] } }>(
        "/admin/product-images/upload",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setImageUrls([...imageUrls, ...response.data.data.urls]);
      toast.success(`Đã tải ${response.data.data.urls.length} ảnh sản phẩm`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể tải ảnh sản phẩm"));
    } finally {
      setUploading(false);
    }
  };

  const toggleMatrixItem = (
    id: string,
    selected: string[],
    setSelected: (ids: string[]) => void
  ) => {
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  };

  const generateVariantMatrix = () => {
    if (matrixColorIds.length === 0 || matrixSizeIds.length === 0) {
      toast.error("Hãy chọn ít nhất một màu và một kích thước để tạo ma trận");
      return;
    }

    const hasUntouchedPlaceholder =
      form.variants.length === 1 &&
      !form.variants[0].id &&
      !form.variants[0].sku &&
      !form.variants[0].colorId &&
      !form.variants[0].sizeId &&
      !form.variants[0].price &&
      form.variants[0].quantity === emptyVariant.quantity &&
      form.variants[0].threshold === emptyVariant.threshold &&
      form.variants[0].location === emptyVariant.location &&
      form.variants[0].isActive === emptyVariant.isActive;
    const baseVariants = hasUntouchedPlaceholder ? [] : form.variants;
    const existing = new Set(
      baseVariants.map((variant) => `${variant.colorId || "default"}:${variant.sizeId || "default"}`)
    );
    const productSku = skuToken(form.sku);
    const additions: ProductFormState["variants"] = [];

    matrixColorIds.forEach((colorId) => {
      matrixSizeIds.forEach((sizeId) => {
        const key = `${colorId}:${sizeId}`;
        if (existing.has(key)) return;
        const color = options.colors.find((item) => item.id === colorId);
        const size = options.sizes.find((item) => item.id === sizeId);
        additions.push({
          ...emptyVariant,
          sku:
            productSku && color && size
              ? `${productSku}-${skuToken(color.name)}-${skuToken(size.name)}`
              : "",
          colorId,
          sizeId,
        });
        existing.add(key);
      });
    });

    if (additions.length === 0) {
      toast.info("Các tổ hợp đã chọn đều đã tồn tại");
      return;
    }

    update({ variants: [...baseVariants, ...additions] });
    setMatrixColorIds([]);
    setMatrixSizeIds([]);
    toast.success(`Đã thêm ${additions.length} biến thể`);
  };

  const submit = () => {
    if (uploading) {
      toast.error("Hãy chờ tải ảnh hoàn tất trước khi lưu sản phẩm");
      return;
    }
    const errors = validateProductForm(form);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setActiveTab(errors[0].tab);
      toast.error(`Cần kiểm tra lại ${errors.length} mục trước khi lưu`);
      return;
    }
    onSave(form);
  };

  const requestClose = () => {
    if (saving || uploading) return;
    if (
      hasUnsavedChanges &&
      !window.confirm("Bạn có thay đổi chưa lưu. Đóng form và bỏ các thay đổi này?")
    ) {
      return;
    }
    onClose();
  };

  const tabErrorCount = (tab: ProductFormTab) =>
    validationErrors.filter((error) => error.tab === tab).length;

  return (
    <AdminModal
      title={form.id ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
      saving={saving || uploading}
      onSave={submit}
      onClose={requestClose}
      size="lg"
    >
      <div className="sticky top-0 z-20 -mx-5 -mt-5 grid gap-2 border-b border-[#E1E1E1] bg-white px-5 py-4 sm:-mx-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4" role="tablist" aria-label="Các phần của sản phẩm">
        {TABS.map((tab) => {
          const errorCount = tabErrorCount(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`product-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-16 border px-3 py-2 text-left transition-colors ${
                activeTab === tab.id
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#DADADA] bg-white text-[#111111] hover:bg-[#F7F7F7]"
              }`}
            >
              <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                {tab.label}
                {errorCount > 0 && (
                  <span className="min-w-5 bg-[#B42318] px-1.5 py-0.5 text-center text-[10px] text-white">
                    {errorCount}
                  </span>
                )}
              </span>
              <span className={`mt-1 block text-[11px] ${activeTab === tab.id ? "text-white/70" : "text-[#6B6B6B]"}`}>
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      {validationErrors.length > 0 && (
        <div className="border border-[#E7B8B3] bg-[#FFF7F6] p-4" role="alert">
          <p className="text-sm font-semibold text-[#8F1D14]">Chưa thể lưu sản phẩm</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#7A271F]">
            {validationErrors.slice(0, 6).map((error, index) => (
              <li key={`${error.message}-${index}`}>{error.message}</li>
            ))}
          </ul>
          {validationErrors.length > 6 && (
            <p className="mt-2 text-xs text-[#7A271F]">Còn {validationErrors.length - 6} lỗi khác trong các tab có đánh dấu.</p>
          )}
        </div>
      )}

      {activeTab === "details" && (
        <section id="product-tab-details" role="tabpanel" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Tên sản phẩm" value={form.name} onChange={(name) => update({ name })} required />
            <AdminField label="SKU sản phẩm" value={form.sku} onChange={(sku) => update({ sku })} placeholder="Tự sinh nếu để trống" />
            <AdminField label="Slug" value={form.slug} onChange={(slug) => update({ slug })} placeholder="Tự sinh nếu để trống" />
            <AdminSelect
              label="Danh mục"
              value={form.categoryId}
              onChange={(categoryId) => update({ categoryId, subCategoryId: "" })}
              options={options.categories.map((category) => [category.id, category.name] as const)}
            />
            <AdminSelect
              label="Danh mục con"
              value={form.subCategoryId}
              onChange={(subCategoryId) => update({ subCategoryId })}
              options={[
                ["", subCategories.length > 0 ? "Không chọn" : "Danh mục này chưa có mục con"] as const,
                ...subCategories.map((subCategory) => [subCategory.id, subCategory.name] as const),
              ]}
            />
            <AdminSelect
              label="Thương hiệu"
              value={form.brandId}
              onChange={(brandId) => update({ brandId })}
              options={[["", "Không chọn"] as const, ...options.brands.map((brand) => [brand.id, brand.name] as const)]}
            />
            <AdminSelect
              label="Giới tính"
              value={form.gender}
              onChange={(gender) => update({ gender: gender as ProductFormState["gender"] })}
              options={[["UNISEX", "Unisex"], ["MALE", "Nam"], ["FEMALE", "Nữ"]]}
            />
            <AdminField label="Giá bán" type="number" value={form.basePrice} onChange={(basePrice) => update({ basePrice })} required />
            <AdminField label="Giá so sánh" type="number" value={form.comparePrice} onChange={(comparePrice) => update({ comparePrice })} />
          </div>

          <AdminTextarea label="Mô tả ngắn" value={form.shortDescription} onChange={(shortDescription) => update({ shortDescription })} />
          <AdminTextarea label="Mô tả chi tiết" value={form.description} onChange={(description) => update({ description })} required />

          <div className="grid gap-4 md:grid-cols-2">
            <AdminField label="Chất liệu" value={form.material} onChange={(material) => update({ material })} />
            <AdminField label="Tags, phân cách bằng dấu phẩy" value={form.tags} onChange={(tags) => update({ tags })} />
          </div>
          <AdminTextarea label="Hướng dẫn bảo quản" value={form.careInstructions} onChange={(careInstructions) => update({ careInstructions })} />
        </section>
      )}

      {activeTab === "images" && (
        <section id="product-tab-images" role="tabpanel" className="space-y-4">
          <div className="flex flex-col justify-between gap-3 border border-[#E1E1E1] bg-[#FAFAFA] p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Thư viện ảnh</h3>
              <p className="mt-1 text-xs text-[#666666]">Ảnh đầu tiên là ảnh chính. Dùng các nút mũi tên để đổi thứ tự.</p>
            </div>
            <label className="admin-button-outline cursor-pointer self-start sm:self-auto">
              <Upload className="size-4" />
              {uploading ? "Đang tải ảnh" : "Tải ảnh lên"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => uploadImages(event.target.files)}
                disabled={uploading || saving}
              />
            </label>
          </div>

          {imageUrls.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {imageUrls.map((url, index) => (
                <article key={`${url}-${index}`} className="border border-[#DADADA] bg-white p-2">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#F1F1F1]">
                    <Image
                      src={url}
                      alt={`Xem trước ảnh sản phẩm ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, 240px"
                      className="object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 bg-[#111111] px-2 py-1 text-[10px] font-semibold text-white">
                        Ảnh chính
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-[11px] text-[#666666]" title={url}>{url}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} className="admin-icon-button" aria-label={`Đưa ảnh ${index + 1} sang trước`}>
                        <ArrowLeft className="size-4" />
                      </button>
                      <button type="button" onClick={() => moveImage(index, 1)} disabled={index === imageUrls.length - 1} className="admin-icon-button" aria-label={`Đưa ảnh ${index + 1} ra sau`}>
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                    <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, imageIndex) => imageIndex !== index))} className="admin-icon-button text-[#B42318]" aria-label={`Xóa ảnh ${index + 1}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center border border-dashed border-[#CFCFCF] bg-[#FAFAFA] p-6 text-center">
              <ImageIcon className="size-7 text-[#777777]" />
              <p className="mt-3 text-sm font-semibold">Chưa có hình ảnh</p>
              <p className="mt-1 text-xs text-[#666666]">Tải ảnh từ máy hoặc nhập URL bên dưới.</p>
            </div>
          )}

          <label className="block">
            <span className="admin-label">URL hình ảnh, mỗi dòng một URL</span>
            <textarea
              value={form.images}
              onChange={(event) => update({ images: event.target.value })}
              className="admin-textarea min-h-28 font-mono text-xs"
              placeholder="/product-images/san-pham-01.jpg"
            />
          </label>
        </section>
      )}

      {activeTab === "variants" && (
        <section id="product-tab-variants" role="tabpanel" className="space-y-4">
          <div className="border border-[#CFCFCF] bg-[#FAFAFA] p-3 text-xs leading-5 text-[#555555]">
            Số lượng của biến thể đã lưu được chỉnh tại trang Kho hàng để tránh ghi đè tồn kho phát sinh trong lúc sửa sản phẩm. Biến thể mới bắt đầu từ 0.
          </div>
          <details className="border border-[#DADADA] bg-[#FAFAFA] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[#111111]">Tạo nhanh ma trận màu x kích thước</summary>
            <p className="mt-2 text-xs leading-5 text-[#666666]">Chọn màu và kích thước, hệ thống chỉ thêm những tổ hợp chưa tồn tại.</p>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <fieldset>
                <legend className="admin-label">Màu sắc</legend>
                <div className="max-h-40 space-y-2 overflow-y-auto border border-[#E1E1E1] bg-white p-3">
                  {options.colors.map((color) => (
                    <label key={color.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={matrixColorIds.includes(color.id)} onChange={() => toggleMatrixItem(color.id, matrixColorIds, setMatrixColorIds)} />
                      <span className="size-3 border border-black/15" style={{ backgroundColor: color.hexCode }} aria-hidden="true" />
                      {color.name}
                    </label>
                  ))}
                  {options.colors.length === 0 && <p className="text-xs text-[#666666]">Chưa có màu để chọn.</p>}
                </div>
              </fieldset>
              <fieldset>
                <legend className="admin-label">Kích thước</legend>
                <div className="max-h-40 space-y-2 overflow-y-auto border border-[#E1E1E1] bg-white p-3">
                  {options.sizes.map((size) => (
                    <label key={size.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={matrixSizeIds.includes(size.id)} onChange={() => toggleMatrixItem(size.id, matrixSizeIds, setMatrixSizeIds)} />
                      {size.name}
                    </label>
                  ))}
                  {options.sizes.length === 0 && <p className="text-xs text-[#666666]">Chưa có kích thước để chọn.</p>}
                </div>
              </fieldset>
            </div>
            <button type="button" onClick={generateVariantMatrix} className="admin-button-outline mt-4">
              <Sparkles className="size-4" /> Tạo ma trận
            </button>
          </details>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#777777]" />
              <input
                value={variantSearch}
                onChange={(event) => setVariantSearch(event.target.value)}
                placeholder="Tìm SKU, màu, kích thước hoặc vị trí kho"
                className="admin-input pl-9"
                aria-label="Tìm biến thể"
              />
            </div>
            <button type="button" onClick={() => update({ variants: [...form.variants, { ...emptyVariant }] })} className="admin-button-outline shrink-0">
              <Plus className="size-4" /> Thêm biến thể
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Hiển thị {visibleVariants.length} / {form.variants.length} biến thể</span>
            <span>Tồn kho mặc định của biến thể mới là 0</span>
          </div>

          <div className="space-y-3">
            {visibleVariants.map(({ variant, index }) => (
              <article key={variant.id ?? `new-${index}`} className="border border-[#DADADA] bg-[#FAFAFA] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      Biến thể {index + 1}
                      {variant.id && !variant.isActive && (
                        <span className="admin-badge" data-tone="danger">Đã ngừng bán</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#666666]">{variant.sku || "SKU sẽ được tự sinh khi lưu"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (variant.id) {
                        updateVariant(index, { isActive: false });
                        toast.info("Biến thể sẽ được lưu trữ khi lưu sản phẩm");
                        return;
                      }
                      update({ variants: form.variants.filter((_, variantIndex) => variantIndex !== index) });
                    }}
                    disabled={(variant.id ? !variant.isActive : form.variants.length <= 1)}
                    className="admin-icon-button text-[#B42318]"
                    aria-label={variant.id ? `Ngừng bán biến thể ${index + 1}` : `Xóa biến thể ${index + 1}`}
                    title={
                      variant.id
                        ? variant.isActive
                          ? "Ngừng bán và giữ lịch sử biến thể"
                          : "Biến thể đã ngừng bán"
                        : form.variants.length <= 1
                          ? "Sản phẩm phải có ít nhất một biến thể"
                          : "Xóa biến thể mới"
                    }
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <AdminField label="SKU biến thể" value={variant.sku} onChange={(sku) => updateVariant(index, { sku })} placeholder="Tự sinh nếu để trống" />
                  <AdminSelect
                    label="Màu"
                    value={variant.colorId}
                    onChange={(colorId) => updateVariant(index, { colorId })}
                    options={[["", "Không chọn"] as const, ...options.colors.map((color) => [color.id, color.name] as const)]}
                  />
                  <AdminSelect
                    label="Kích thước"
                    value={variant.sizeId}
                    onChange={(sizeId) => updateVariant(index, { sizeId })}
                    options={[["", "Không chọn"] as const, ...options.sizes.map((size) => [size.id, size.name] as const)]}
                  />
                  <AdminField label="Giá riêng" type="number" value={variant.price} onChange={(price) => updateVariant(index, { price })} placeholder="Dùng giá sản phẩm" />
                  <AdminField label="Ảnh riêng (URL)" value={variant.imageUrl} onChange={(imageUrl) => updateVariant(index, { imageUrl })} placeholder="Dùng ảnh sản phẩm nếu để trống" />
                  {variant.id ? (
                    <label className="block">
                      <span className="admin-label">Số lượng tồn</span>
                      <span className="flex min-h-11 items-center justify-between gap-3 border border-[#D4D4D4] bg-[#F3F3F3] px-3 text-sm">
                        <span className="font-semibold text-[#111111]">{variant.quantity}</span>
                        <Link href="/admin/inventory" target="_blank" className="text-xs font-semibold underline underline-offset-2">
                          Chỉnh tại Kho hàng
                        </Link>
                      </span>
                    </label>
                  ) : (
                    <AdminField label="Số lượng tồn ban đầu" type="number" value={variant.quantity} onChange={(quantity) => updateVariant(index, { quantity })} />
                  )}
                  <AdminField label="Ngưỡng cảnh báo" type="number" value={variant.threshold} onChange={(threshold) => updateVariant(index, { threshold })} />
                  <AdminField label="Vị trí kho" value={variant.location} onChange={(location) => updateVariant(index, { location })} placeholder="Ví dụ: Kệ A-02" />
                  <label className="block">
                    <span className="admin-label">Trạng thái</span>
                    <span className="flex min-h-11 items-center gap-3 border border-[#D4D4D4] bg-white px-3 text-sm font-semibold">
                      <input type="checkbox" checked={variant.isActive} onChange={(event) => updateVariant(index, { isActive: event.target.checked })} />
                      Đang bán
                    </span>
                  </label>
                </div>
              </article>
            ))}
            {visibleVariants.length === 0 && (
              <div className="border border-dashed border-[#CFCFCF] p-8 text-center">
                <p className="text-sm font-semibold">Không tìm thấy biến thể</p>
                <p className="mt-1 text-xs text-[#666666]">Đổi từ khóa hoặc thêm biến thể mới.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "visibility" && (
        <section id="product-tab-visibility" role="tabpanel" className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-[#111111]">Trạng thái và phân loại catalog</h3>
            <p className="mt-1 text-xs leading-5 text-[#666666]">
              Hàng mới và Bán chạy dùng cho bộ lọc, trang Xem tất cả và dữ liệu fallback. Các cờ này không quyết định tập sản phẩm hoặc thứ tự homepage khi trang Trưng bày đã được cấu hình.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["isActive", "Đang hiển thị", "Cho phép khách xem và mua"],
                ["isFeatured", "Nổi bật", "Dùng cho khu vực tuyển chọn"],
                ["isNewArrival", "Hàng mới", "Phân loại trên catalog và fallback"],
                ["isBestSeller", "Bán chạy", "Phân loại trên catalog và fallback"],
              ].map(([key, label, helper]) => (
                <label key={key} className="flex min-h-24 items-start gap-3 border border-[#D4D4D4] bg-white p-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={Boolean(form[key as keyof ProductFormState])}
                    onChange={(event) => update({ [key]: event.target.checked } as Partial<ProductFormState>)}
                  />
                  <span>
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[#666666]">{helper}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 border border-[#CFCFCF] bg-[#FAFAFA] p-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-semibold text-[#111111]">Hàng mới và Best seller trên trang chủ</h3>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-[#666666]">
                Hai danh sách này có thứ tự và giới hạn riêng. Hãy quản lý tại trang Trưng bày để kết quả trên homepage luôn chính xác.
              </p>
            </div>
            <Link
              href="/admin/merchandising"
              onNavigate={(event) => {
                if (saving || uploading) {
                  event.preventDefault();
                  toast.info("Hãy chờ thao tác hiện tại hoàn tất");
                  return;
                }
                if (
                  hasUnsavedChanges &&
                  !window.confirm("Bạn có thay đổi sản phẩm chưa lưu. Rời form và mở trang Trưng bày?")
                ) {
                  event.preventDefault();
                }
              }}
              className="admin-button-outline shrink-0"
            >
              Mở trang Trưng bày <ArrowRight className="size-4" />
            </Link>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-[#111111]">Bộ sưu tập</legend>
            <p className="mt-1 text-xs text-[#666666]">Có thể chọn nhiều bộ sưu tập cho cùng một sản phẩm.</p>
            <div className="mt-3 grid max-h-52 gap-2 overflow-y-auto border border-[#DADADA] bg-[#FAFAFA] p-3 sm:grid-cols-2">
              {(options.collections ?? []).map((collection) => (
                <label key={collection.id} className="flex items-center gap-2 border border-[#E1E1E1] bg-white px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.collectionIds.includes(collection.id)}
                    onChange={(event) =>
                      update({
                        collectionIds: event.target.checked
                          ? [...form.collectionIds, collection.id]
                          : form.collectionIds.filter((id) => id !== collection.id),
                      })
                    }
                  />
                  {collection.name}
                </label>
              ))}
              {(options.collections?.length ?? 0) === 0 && (
                <p className="text-xs text-[#666666]">Chưa có bộ sưu tập đang hoạt động.</p>
              )}
            </div>
          </fieldset>

          <div className="border-t border-[#E1E1E1] pt-5">
            <h3 className="text-sm font-semibold text-[#111111]">Thông tin SEO</h3>
            <p className="mt-1 text-xs text-[#666666]">Để trống để hệ thống tự tạo từ tên và mô tả sản phẩm.</p>
            <div className="mt-3 space-y-4">
              <AdminField label="Meta title" value={form.metaTitle} onChange={(metaTitle) => update({ metaTitle })} placeholder="Tự sinh nếu để trống" />
              <AdminTextarea label="Meta description" value={form.metaDescription} onChange={(metaDescription) => update({ metaDescription })} />
            </div>
          </div>
        </section>
      )}
    </AdminModal>
  );
}
