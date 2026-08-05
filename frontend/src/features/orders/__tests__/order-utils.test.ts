import type { OrderDetail, OrderItem } from '../order-types';
import {
  buildOrderTimeline,
  canCancelOrder,
  createReorderSelection,
  getCancellationReason,
} from '../order-utils';

function makeOrder(
  status: OrderDetail['status'],
  history: OrderDetail['statusHistory'],
): OrderDetail {
  return {
    id: 'order-1',
    orderNumber: 'AC-TEST-001',
    userId: 'user-1',
    status,
    subtotal: 250000,
    shippingFee: 30000,
    discount: 0,
    tax: 0,
    total: 280000,
    createdAt: '2026-07-18T01:00:00.000Z',
    updatedAt: '2026-07-18T02:00:00.000Z',
    items: [],
    address: {
      id: 'address-1',
      fullName: 'Nguyễn Minh Anh',
      phone: '0900000000',
      addressLine1: '12 Nguyễn Huệ',
      district: 'Quận 1',
      province: 'TP. Hồ Chí Minh',
      country: 'Việt Nam',
    },
    statusHistory: history,
  };
}

describe('order utilities', () => {
  it.each(['PENDING', 'CONFIRMED', 'PROCESSING'] as const)(
    'allows cancellation while an order is %s',
    (status) => {
      expect(canCancelOrder(status)).toBe(true);
    },
  );

  it.each(['SHIPPING', 'DELIVERED', 'COMPLETED', 'CANCELLED'] as const)(
    'blocks cancellation while an order is %s',
    (status) => {
      expect(canCancelOrder(status)).toBe(false);
    },
  );

  it('builds the requested four-stage shipping timeline', () => {
    const order = makeOrder('SHIPPING', [
      {
        id: 'history-3',
        status: 'SHIPPING',
        createdAt: '2026-07-18T03:00:00.000Z',
      },
      {
        id: 'history-1',
        status: 'PENDING',
        createdAt: '2026-07-18T01:00:00.000Z',
      },
      {
        id: 'history-2',
        status: 'CONFIRMED',
        createdAt: '2026-07-18T02:00:00.000Z',
      },
    ]);

    expect(buildOrderTimeline(order).map(({ label, state }) => ({ label, state })))
      .toEqual([
        { label: 'Đã đặt', state: 'complete' },
        { label: 'Đã xác nhận', state: 'complete' },
        { label: 'Đang giao', state: 'current' },
        { label: 'Hoàn thành', state: 'upcoming' },
      ]);
  });

  it('keeps completed milestones and no current step for a cancelled order', () => {
    const order = makeOrder('CANCELLED', [
      {
        id: 'history-1',
        status: 'PENDING',
        createdAt: '2026-07-18T01:00:00.000Z',
      },
      {
        id: 'history-2',
        status: 'CONFIRMED',
        createdAt: '2026-07-18T02:00:00.000Z',
      },
      {
        id: 'history-3',
        status: 'CANCELLED',
        note: 'Khách hàng hủy đơn: Đổi địa chỉ',
        createdAt: '2026-07-18T03:00:00.000Z',
      },
    ]);

    const timeline = buildOrderTimeline(order);
    expect(timeline.map((stage) => stage.state)).toEqual([
      'complete',
      'complete',
      'upcoming',
      'upcoming',
    ]);
    expect(getCancellationReason(order)).toBe('Đổi địa chỉ');
  });

  it('preserves the original variant when creating a reorder selection', () => {
    const item: OrderItem = {
      id: 'item-1',
      productId: 'product-1',
      variantId: 'variant-blue-m',
      productName: 'Áo khoác Linen',
      variantName: 'Xanh / M',
      sku: 'LINEN-BLUE-M',
      quantity: 2,
      unitPrice: 450000,
      totalPrice: 900000,
      product: {
        id: 'product-1',
        name: 'Áo khoác Linen',
        slug: 'ao-khoac-linen',
        sku: 'LINEN',
        basePrice: 450000,
        isActive: true,
        images: [{ url: '/product.jpg', isPrimary: true }],
      },
      variant: {
        id: 'variant-blue-m',
        sku: 'LINEN-BLUE-M',
        price: 450000,
        isActive: true,
        color: { id: 'blue', name: 'Xanh', hexCode: '#174A74' },
        size: { id: 'm', name: 'M' },
        inventory: [{ quantity: 5, reserved: 1 }],
      },
    };

    const selection = createReorderSelection(item);
    expect(selection?.product.id).toBe('product-1');
    expect(selection?.variant?.id).toBe('variant-blue-m');
    expect(selection?.variant?.size?.name).toBe('M');
  });

  it('skips a discontinued variant during reorder', () => {
    const item = {
      id: 'item-1',
      productId: 'product-1',
      variantId: 'variant-old',
      productName: 'Áo sơ mi',
      sku: 'SHIRT-OLD',
      quantity: 1,
      unitPrice: 300000,
      totalPrice: 300000,
      product: {
        id: 'product-1',
        name: 'Áo sơ mi',
        slug: 'ao-so-mi',
        sku: 'SHIRT',
        basePrice: 300000,
        isActive: true,
        images: [],
      },
      variant: null,
    } satisfies OrderItem;

    expect(createReorderSelection(item)).toBeNull();
  });
});

