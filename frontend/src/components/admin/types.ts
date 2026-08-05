export interface ApiList<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
  subCategories?: Array<{
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    isActive: boolean;
    sortOrder: number;
  }>;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string | null;
  basePrice: string | number;
  comparePrice?: string | number | null;
  isActive: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  soldCount?: number;
  categoryId?: string;
  category?: { id: string; name: string; slug?: string };
  subCategoryId?: string | null;
  subCategory?: { id: string; name: string; slug?: string } | null;
  brandId?: string | null;
  brand?: { id: string; name: string } | null;
  gender?: "MALE" | "FEMALE" | "UNISEX";
  material?: string | null;
  careInstructions?: string | null;
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  images?: Array<{ url: string; isPrimary?: boolean }>;
  inventory?:
    | Array<{ id?: string; quantity: number; reserved?: number; threshold?: number; location?: string | null }>
    | { id?: string; quantity: number; reserved?: number; threshold?: number; location?: string | null };
  collections?: Array<{ collection: { id: string; name: string } }>;
  variants?: Array<{
    id?: string;
    sku?: string;
    price?: string | number | null;
    imageUrl?: string | null;
    isActive?: boolean;
    color?: { id: string; name: string; hexCode: string } | null;
    size?: { id: string; name: string } | null;
    inventory?:
      | Array<{ id: string; quantity: number; reserved: number; threshold: number; location?: string | null }>
      | { id?: string; quantity: number; reserved?: number; threshold?: number; location?: string | null };
  }>;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal?: string | number;
  shippingFee?: string | number;
  discount?: string | number;
  tax?: string | number;
  total: string | number;
  notes?: string | null;
  couponCode?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  address?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    ward?: string | null;
    district: string;
    province: string;
    country?: string;
  };
  items?: Array<{
    id?: string;
    quantity: number;
    productName?: string;
    variantName?: string | null;
    sku?: string;
    unitPrice?: string | number;
    totalPrice?: string | number;
    imageUrl?: string | null;
    product?: { images?: Array<{ url: string }> };
    variant?: {
      color?: { name: string; hexCode: string } | null;
      size?: { name: string } | null;
    };
  }>;
  payment?: {
    method: string;
    status: string;
    amount?: string | number;
    currency?: string;
  } | null;
  shippingMethod?: {
    name: string;
    estimatedDays?: string | null;
    basePrice?: string | number;
  } | null;
  statusHistory?: Array<{
    id: string;
    status: string;
    note?: string | null;
    createdAt: string;
  }>;
}

export interface AdminCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  totalSpent?: number;
  _count?: { orders: number };
  orders?: AdminOrder[];
  addresses?: Array<{
    id: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    ward?: string | null;
    district: string;
    province: string;
    isDefault: boolean;
  }>;
}

export interface AdminInventoryItem {
  id: string;
  quantity: number;
  reserved: number;
  threshold: number;
  location?: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
    images?: Array<{ url: string }>;
  };
  variant?: {
    sku: string;
    color?: { name: string; hexCode: string } | null;
    size?: { name: string } | null;
  } | null;
}

export interface AdminCoupon {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: string | number;
  minOrderAmount?: string | number | null;
  maxDiscount?: string | number | null;
  usageLimit?: number | null;
  usagePerUser: number;
  usedCount: number;
  isActive: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  applicableCategories?: string[];
}

export interface AdminBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  position: "HERO" | "COLLECTION" | "PROMOTIONAL" | "SIDEBAR";
  isActive: boolean;
  sortOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface DashboardStats {
  users: { total: number; newToday: number };
  orders: { total: number; today: number; pending: number };
  products: { total: number; active: number; lowStock: number };
  revenue: { total: number; thisMonth: number; lastMonth: number; growth: number };
}

export interface AdminReports {
  revenue: Array<{ date: string; revenue: number }>;
  topProducts: AdminProduct[];
  statusBreakdown?: Array<{
    status: string;
    _count: { status: number };
    _sum: { total: string | number | null };
  }>;
}

export interface ProductOptions {
  categories: AdminCategory[];
  brands: Array<{ id: string; name: string }>;
  colors: Array<{ id: string; name: string; hexCode: string }>;
  sizes: Array<{ id: string; name: string }>;
  collections?: Array<{ id: string; name: string }>;
}

export interface MerchandisingSection {
  products: AdminProduct[];
  limit: number;
  source: "manual" | "fallback";
}

export interface HomepageMerchandising {
  newArrivals: MerchandisingSection;
  bestSellers: MerchandisingSection;
}

export type AdminSettings = Record<string, string>;
