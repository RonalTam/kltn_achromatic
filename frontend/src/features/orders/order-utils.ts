import type { Product, ProductVariant } from '@/lib/types';
import type {
  OrderDetail,
  OrderItem,
  OrderStatus,
} from './order-types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  STRIPE: 'Thẻ thanh toán',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chưa thanh toán',
  PROCESSING: 'Đang xử lý',
  COMPLETED: 'Đã thanh toán',
  FAILED: 'Thanh toán thất bại',
  REFUNDED: 'Đã hoàn tiền',
  CANCELLED: 'Đã hủy',
};

export const CANCELLABLE_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
];

export function canCancelOrder(status: OrderStatus): boolean {
  return CANCELLABLE_ORDER_STATUSES.includes(status);
}

export const ORDER_TIMELINE_STAGES = [
  {
    id: 'ordered',
    label: 'Đã đặt',
    description: 'Đơn hàng đã được tiếp nhận',
    statuses: ['PENDING'] as OrderStatus[],
  },
  {
    id: 'confirmed',
    label: 'Đã xác nhận',
    description: 'Sản phẩm đang được chuẩn bị',
    statuses: ['CONFIRMED', 'PROCESSING'] as OrderStatus[],
  },
  {
    id: 'shipping',
    label: 'Đang giao',
    description: 'Đơn hàng đang trên đường đến bạn',
    statuses: ['SHIPPING'] as OrderStatus[],
  },
  {
    id: 'completed',
    label: 'Hoàn thành',
    description: 'Đơn hàng đã được giao',
    statuses: ['DELIVERED', 'COMPLETED', 'REFUNDED'] as OrderStatus[],
  },
] as const;

export type TimelineStageState =
  | 'complete'
  | 'current'
  | 'upcoming';

export interface OrderTimelineStage {
  id: string;
  label: string;
  description: string;
  timestamp?: string;
  state: TimelineStageState;
}

function getStatusStageIndex(status: OrderStatus): number | null {
  const index = ORDER_TIMELINE_STAGES.findIndex((stage) =>
    stage.statuses.includes(status),
  );
  return index >= 0 ? index : null;
}

export function buildOrderTimeline(order: OrderDetail): OrderTimelineStage[] {
  const chronologicalHistory = [...order.statusHistory].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
  const isCancelled = order.status === 'CANCELLED';
  const historyProgress = chronologicalHistory.reduce((highest, entry) => {
    const index = getStatusStageIndex(entry.status);
    return index === null ? highest : Math.max(highest, index);
  }, 0);
  const currentProgress = getStatusStageIndex(order.status);
  const progress = isCancelled
    ? historyProgress
    : (currentProgress ?? historyProgress);

  return ORDER_TIMELINE_STAGES.map((stage, index) => {
    const matchingHistory = chronologicalHistory.find((entry) =>
      stage.statuses.includes(entry.status),
    );
    const timestamp = matchingHistory?.createdAt ??
      (index === 0 ? order.createdAt : undefined);
    let state: TimelineStageState = 'upcoming';

    if (isCancelled) {
      state = index <= progress ? 'complete' : 'upcoming';
    } else if (index < progress) {
      state = 'complete';
    } else if (index === progress) {
      state = 'current';
    }

    return {
      id: stage.id,
      label: stage.label,
      description: stage.description,
      timestamp,
      state,
    };
  });
}

export function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getOrderItemImage(item: OrderItem): string | null {
  return (
    item.imageUrl ||
    item.variant?.imageUrl ||
    item.product.images?.[0]?.url ||
    null
  );
}

export function getCancellationReason(order: OrderDetail): string | null {
  if (order.cancelReason?.trim()) return order.cancelReason.trim();

  const cancellationNote = order.statusHistory.find(
    (entry) => entry.status === 'CANCELLED' && entry.note?.trim(),
  )?.note;

  return cancellationNote
    ? cancellationNote.replace(/^Khách hàng hủy đơn:\s*/i, '').trim()
    : null;
}

export interface ReorderSelection {
  product: Product;
  variant: ProductVariant | null;
}

export function createReorderSelection(
  item: OrderItem,
): ReorderSelection | null {
  if (item.product?.isActive === false || !item.product.slug) return null;
  if (item.variantId && (!item.variant || item.variant.isActive === false)) {
    return null;
  }

  const product: Product = {
    id: item.product.id || item.productId,
    name: item.product.name || item.productName,
    slug: item.product.slug,
    sku: item.product.sku || item.sku,
    basePrice: item.product.basePrice ?? item.unitPrice,
    images: (item.product.images ?? []).map((image, index) => ({
      ...image,
      isPrimary: image.isPrimary ?? index === 0,
    })),
    inventory: item.product.inventory,
  };

  const variant: ProductVariant | null = item.variant
    ? {
        id: item.variant.id,
        sku: item.variant.sku,
        price:
          item.variant.price == null ? item.variant.price : Number(item.variant.price),
        isActive: item.variant.isActive,
        color: item.variant.color,
        size: item.variant.size,
        inventory: item.variant.inventory,
      }
    : null;

  return { product, variant };
}
