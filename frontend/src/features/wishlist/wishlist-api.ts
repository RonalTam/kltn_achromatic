import { api } from '@/lib/api';
import type {
  Product,
  ProductImage,
  ProductVariant,
} from '@/lib/types';

export interface WishlistProductImage extends Omit<ProductImage, 'isPrimary'> {
  id?: string;
  isPrimary?: boolean;
}

export interface WishlistProduct
  extends Omit<Product, 'images' | 'sku' | 'variants'> {
  sku?: string;
  images: WishlistProductImage[];
  variants?: ProductVariant[];
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  addedAt: string;
  product: WishlistProduct;
}

export interface Wishlist {
  id: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  items: WishlistItem[];
}

interface ApiEnvelope<T> {
  data: T;
}

function getWishlistPayload(payload: ApiEnvelope<Wishlist> | Wishlist): Wishlist {
  return 'data' in payload ? payload.data : payload;
}

export async function getWishlist(): Promise<Wishlist> {
  const response = await api.get<ApiEnvelope<Wishlist> | Wishlist>('/wishlists');
  return getWishlistPayload(response.data);
}

export async function addWishlistItem(productId: string): Promise<Wishlist> {
  const response = await api.post<ApiEnvelope<Wishlist> | Wishlist>('/wishlists', {
    productId,
  });
  return getWishlistPayload(response.data);
}

export async function deleteWishlistItem(itemId: string): Promise<Wishlist> {
  const response = await api.delete<ApiEnvelope<Wishlist> | Wishlist>(
    `/wishlists/${encodeURIComponent(itemId)}`,
  );
  return getWishlistPayload(response.data);
}

export function getWishlistErrorMessage(error: unknown): string {
  const responseMessage = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  if (Array.isArray(responseMessage)) return responseMessage[0] ?? '';
  if (typeof responseMessage === 'string') return responseMessage;
  if (error instanceof Error && error.message) return error.message;
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}

