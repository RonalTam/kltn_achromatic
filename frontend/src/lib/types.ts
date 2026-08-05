// Shared types across the frontend

export interface ProductImage {
  url: string;
  altText?: string | null;
  isPrimary: boolean;
  sortOrder?: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
  imageUrl?: string | null;
}

export interface ProductSize {
  id: string;
  name: string;
  sortOrder?: number;
}

export interface ProductInventory {
  quantity: number;
  reserved: number;
}

export type ProductInventoryPayload = ProductInventory | ProductInventory[] | null;

export interface ProductVariant {
  id: string;
  sku: string;
  price?: number | null;
  imageUrl?: string | null;
  color?: ProductColor | null;
  size?: ProductSize | null;
  inventory?: ProductInventoryPayload;
  isActive?: boolean;
}

export interface ProductSpec {
  label: string;
  value: string;
  sortOrder?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
  basePrice: number | string;
  comparePrice?: number | string | null;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  avgRating?: number | string;
  reviewCount?: number;
  soldCount?: number;
  tags?: string[];
  material?: string | null;
  careInstructions?: string | null;
  images: ProductImage[];
  inventory?: ProductInventoryPayload;
  variants?: ProductVariant[];
  category?: ProductCategory | null;
  subCategory?: ProductCategory | null;
  brand?: ProductBrand | null;
  specifications?: ProductSpec[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'best_selling' | 'top_rated' | 'featured';
  page?: number;
  limit?: number;
}

export interface HomepageProductSection {
  products: Product[];
  limit: number;
  source: 'manual' | 'fallback';
}

export interface HomepageMerchandising {
  newArrivals: HomepageProductSection;
  bestSellers: HomepageProductSection;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: Pick<
    Product,
    'id' | 'name' | 'slug' | 'basePrice' | 'images' | 'inventory'
  >;
  variant?: ProductVariant | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  position: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string | null;
  body: string;
  isVerified: boolean;
  isApproved: boolean;
  helpfulCount: number;
  isHelpful?: boolean;
  createdAt: string;
  user: { firstName: string; lastName: string; avatarUrl?: string | null };
  images?: { id: string; url: string }[];
}

export interface ReviewRatingBreakdown {
  rating: number;
  _count: number | { _all?: number };
}

export interface ReviewSummary {
  averageRating?: number | string | null;
  reviewCount?: number;
  ratingBreakdown?: ReviewRatingBreakdown[];
}

export interface ReviewListResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary?: ReviewSummary;
  /** @deprecated Use summary.ratingBreakdown when available. */
  ratingBreakdown?: ReviewRatingBreakdown[];
}

export interface FilterOptions {
  sizes: ProductSize[];
  colors: ProductColor[];
  brands: ProductBrand[];
  priceRange: {
    _min: { basePrice: number | null };
    _max: { basePrice: number | null };
  };
}
