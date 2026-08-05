export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderInventory {
  quantity: number;
  reserved: number;
}

export interface OrderProductImage {
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface OrderProductColor {
  id: string;
  name: string;
  hexCode: string;
}

export interface OrderProductSize {
  id: string;
  name: string;
  sortOrder?: number;
}

export interface OrderProductVariant {
  id: string;
  sku: string;
  price?: number | string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  color?: OrderProductColor | null;
  size?: OrderProductSize | null;
  inventory?: OrderInventory[] | OrderInventory | null;
}

export interface OrderProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePrice: number | string;
  isActive?: boolean;
  images: OrderProductImage[];
  inventory?: OrderInventory[] | OrderInventory | null;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  sku: string;
  quantity: number;
  unitPrice: number | string;
  totalPrice: number | string;
  imageUrl?: string | null;
  product: OrderProduct;
  variant?: OrderProductVariant | null;
}

export interface OrderAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  ward?: string | null;
  district: string;
  province: string;
  country: string;
  postalCode?: string | null;
}

export interface OrderPayment {
  id: string;
  method: string;
  status: string;
  amount: number | string;
  currency: string;
  paidAt?: string | null;
}

export interface OrderShippingMethod {
  id: string;
  name: string;
  description?: string | null;
  estimatedDays?: string | null;
}

export interface OrderShippingTracking {
  id: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  status?: string | null;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number | string;
  shippingFee: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;
  couponCode?: string | null;
  notes?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  address: OrderAddress;
  payment?: OrderPayment | null;
  shippingMethod?: OrderShippingMethod | null;
  shipping?: OrderShippingTracking | null;
  statusHistory: OrderStatusHistory[];
}

