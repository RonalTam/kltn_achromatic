import {
  createProductForm,
  productFormPayload,
  validateProductForm,
} from "@/components/admin/ProductFormModal";
import {
  nextOrderStatuses,
  statusLabel,
} from "@/components/admin/admin-api";
import type { ProductOptions } from "@/components/admin/types";

const options: ProductOptions = {
  categories: [
    {
      id: "category-1",
      name: "Áo",
      slug: "ao",
      isActive: true,
      sortOrder: 0,
      subCategories: [
        {
          id: "subcategory-1",
          categoryId: "category-1",
          name: "Áo sơ mi",
          slug: "ao-so-mi",
          isActive: true,
          sortOrder: 0,
        },
      ],
    },
  ],
  brands: [],
  colors: [
    { id: "black", name: "Đen", hexCode: "#111111" },
  ],
  sizes: [
    { id: "m", name: "M" },
  ],
  collections: [
    { id: "summer", name: "Mùa hè" },
  ],
};

describe("admin product form utilities", () => {
  it("starts a new variant with zero stock", () => {
    const form = createProductForm(options);

    expect(form.categoryId).toBe("category-1");
    expect(form.variants).toHaveLength(1);
    expect(form.variants[0].quantity).toBe("0");
  });

  it("detects duplicate variant SKU and color-size combinations", () => {
    const form = createProductForm(options);
    Object.assign(form, {
      name: "Áo linen",
      description: "Mô tả sản phẩm",
      basePrice: "450000",
      variants: [
        {
          ...form.variants[0],
          sku: "LINEN-BLACK-M",
          colorId: "black",
          sizeId: "m",
        },
        {
          ...form.variants[0],
          sku: "linen-black-m",
          colorId: "black",
          sizeId: "m",
        },
      ],
    });

    const messages = validateProductForm(form).map((error) => error.message);
    expect(messages).toEqual(expect.arrayContaining([
      expect.stringContaining("SKU biến thể 2 trùng"),
      expect.stringContaining("Biến thể 2 trùng tổ hợp"),
    ]));
  });

  it("requires at least one variant so inventory can be initialized", () => {
    const form = createProductForm(options);
    form.name = "Áo linen";
    form.description = "Mô tả sản phẩm";
    form.basePrice = "450000";
    form.variants = [];

    expect(validateProductForm(form)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tab: "variants",
          message: expect.stringContaining("ít nhất một biến thể"),
        }),
      ])
    );
  });

  it("keeps catalog classification, collection, SEO, and inventory fields", () => {
    const form = createProductForm(options);
    Object.assign(form, {
      name: "Áo linen",
      description: "Mô tả sản phẩm",
      basePrice: "450000",
      careInstructions: "Giặt nhẹ",
      subCategoryId: "subcategory-1",
      collectionIds: ["summer", "summer"],
      metaTitle: "Áo linen mùa hè",
      metaDescription: "Mẫu áo linen thoáng nhẹ.",
      isNewArrival: true,
      isBestSeller: true,
      variants: [
        {
          ...form.variants[0],
          sku: "LINEN-BLACK-M",
          colorId: "black",
          sizeId: "m",
          imageUrl: "/product-images/linen-black-m.jpg",
          quantity: "0",
          threshold: "3",
          location: "Kệ A-02",
          isActive: false,
        },
      ],
    });

    const payload = productFormPayload(form);
    expect(payload).toMatchObject({
      careInstructions: "Giặt nhẹ",
      subCategoryId: "subcategory-1",
      collectionIds: ["summer"],
      metaTitle: "Áo linen mùa hè",
      metaDescription: "Mẫu áo linen thoáng nhẹ.",
      isNewArrival: true,
      isBestSeller: true,
      variants: [
        {
          quantity: 0,
          threshold: 3,
          location: "Kệ A-02",
          isActive: false,
          imageUrl: "/product-images/linen-black-m.jpg",
        },
      ],
    });
  });

  it("does not overwrite an existing variant inventory snapshot when it is unchanged", () => {
    const initial = createProductForm(options);
    initial.id = "product-1";
    initial.name = "Áo linen";
    initial.description = "Mô tả sản phẩm";
    initial.basePrice = "450000";
    initial.variants = [
      {
        ...initial.variants[0],
        id: "variant-1",
        sku: "LINEN-BLACK-M",
        colorId: "black",
        sizeId: "m",
        quantity: "12",
        threshold: "3",
        location: "Kệ A-02",
      },
    ];
    const edited = {
      ...initial,
      description: "Mô tả sản phẩm đã chỉnh sửa",
      variants: initial.variants.map((variant) => ({ ...variant })),
    };

    const payload = productFormPayload(edited, initial);
    expect(payload.variants[0]).not.toHaveProperty("quantity");
    expect(payload.variants[0]).not.toHaveProperty("threshold");
    expect(payload.variants[0]).not.toHaveProperty("location");
  });

  it("only sends the inventory field that changed for an existing variant", () => {
    const initial = createProductForm(options);
    initial.id = "product-1";
    initial.name = "Áo linen";
    initial.description = "Mô tả sản phẩm";
    initial.basePrice = "450000";
    initial.variants = [
      {
        ...initial.variants[0],
        id: "variant-1",
        quantity: "12",
        threshold: "3",
        location: "Kệ A-02",
      },
    ];
    const edited = {
      ...initial,
      variants: [{ ...initial.variants[0], threshold: "5" }],
    };

    expect(productFormPayload(edited, initial).variants[0]).toMatchObject({
      threshold: 5,
    });
    expect(productFormPayload(edited, initial).variants[0]).not.toHaveProperty("quantity");
    expect(productFormPayload(edited, initial).variants[0]).not.toHaveProperty("location");
  });
});

describe("admin order status utilities", () => {
  it("only exposes valid next states", () => {
    expect(nextOrderStatuses("PENDING")).toEqual([
      "CONFIRMED",
      "PROCESSING",
      "CANCELLED",
    ]);
    expect(nextOrderStatuses("SHIPPING")).toEqual(["DELIVERED"]);
    expect(nextOrderStatuses("DELIVERED")).toEqual(["COMPLETED"]);
    expect(nextOrderStatuses("COMPLETED")).toEqual([]);
    expect(nextOrderStatuses("REFUNDED")).toEqual([]);
    expect(nextOrderStatuses("UNKNOWN")).toEqual([]);
  });

  it("uses distinct Vietnamese labels for completed and refunded", () => {
    expect(statusLabel("COMPLETED")).toBe("Đã hoàn tất");
    expect(statusLabel("REFUNDED")).toBe("Đã hoàn tiền");
  });
});
