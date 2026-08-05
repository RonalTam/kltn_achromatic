import { createServer } from 'node:http';

const port = Number(process.env.MOCK_API_PORT || 3211);

const product = {
  id: 'e2e-product-1',
  name: 'E2E Linen Shirt',
  slug: 'e2e-linen-shirt',
  sku: 'E2E-LINEN-001',
  description: 'A deterministic product served by the Playwright mock API.',
  shortDescription: 'Lightweight linen shirt for the E2E checkout journey.',
  basePrice: 450000,
  comparePrice: null,
  isActive: true,
  isFeatured: true,
  isNewArrival: true,
  isBestSeller: true,
  soldCount: 24,
  avgRating: 5,
  reviewCount: 1,
  images: [
    {
      url: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
      altText: 'E2E Linen Shirt',
      isPrimary: true,
      sortOrder: 0,
    },
  ],
  inventory: { quantity: 10, reserved: 0 },
  variants: [],
  category: {
    id: 'e2e-category-1',
    name: 'E2E Shirts',
    slug: 'e2e-shirts',
  },
  brand: {
    id: 'e2e-brand-1',
    name: 'Achromatic E2E',
    slug: 'achromatic-e2e',
  },
};

const variantProduct = {
  ...product,
  id: 'e2e-product-2',
  name: 'E2E Pleated Trousers',
  slug: 'e2e-pleated-trousers',
  sku: 'E2E-TROUSERS-002',
  description: 'Tailored trousers used to verify admin merchandising order.',
  shortDescription: 'Relaxed tailored trousers for deterministic admin tests.',
  basePrice: 620000,
  soldCount: 41,
  images: [
    {
      url: '/vietnam-fashion/quan-tay-da-nang.svg',
      altText: 'E2E Pleated Trousers',
      isPrimary: true,
      sortOrder: 0,
    },
  ],
  inventory: undefined,
  variants: [
    {
      id: 'e2e-variant-2',
      sku: 'E2E-VARIANT-BLACK-M',
      price: 620000,
      isActive: true,
      color: { id: 'e2e-color-1', name: 'Black', hexCode: '#111111' },
      size: { id: 'e2e-size-1', name: 'M' },
      inventory: { quantity: 8, reserved: 1, threshold: 2, location: 'A-02' },
    },
  ],
};

const allProducts = [product, variantProduct];

const review = {
  id: 'e2e-review-1',
  productId: product.id,
  userId: 'e2e-reviewer-1',
  rating: 5,
  title: 'Excellent everyday shirt',
  body: 'The linen feels comfortable and the stitching is very clean.',
  isVerified: true,
  isApproved: true,
  helpfulCount: 3,
  createdAt: '2026-07-10T09:00:00.000Z',
  user: {
    firstName: 'Mai',
    lastName: 'Nguyen',
    avatarUrl: null,
  },
  images: [],
};

let wishlistItems = [];
let helpful = false;
let merchandising = {
  'new-arrivals': { productIds: allProducts.map((item) => item.id), limit: 4 },
  'best-sellers': { productIds: [...allProducts].reverse().map((item) => item.id), limit: 4 },
};

function merchandisingSection(section) {
  const value = merchandising[section];
  return {
    products: value.productIds
      .map((id) => allProducts.find((item) => item.id === id))
      .filter(Boolean),
    limit: value.limit,
    source: 'manual',
  };
}

function recentRevenue(days) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(end.getUTCDate() - (days - index - 1));
    return {
      date: date.toISOString().slice(0, 10),
      revenue: index % 5 === 0 ? 1_250_000 + index * 35_000 : 0,
    };
  });
}

function adminOrderPayload() {
  return {
    ...order,
    status: adminOrderStatus,
    updatedAt: adminOrderUpdatedAt,
    statusHistory: adminOrderHistory,
    user: {
      firstName: 'E2E',
      lastName: 'Customer',
      email: 'e2e@achromatic.vn',
      phone: '0901234567',
    },
  };
}

function wishlistPayload() {
  return {
    id: 'e2e-wishlist-1',
    userId: 'e2e-user-1',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: new Date().toISOString(),
    items: wishlistItems,
  };
}

const order = {
  id: 'e2e-order-1',
  orderNumber: 'E2E-ORDER-1001',
  userId: 'e2e-user-1',
  status: 'CONFIRMED',
  subtotal: 450000,
  shippingFee: 30000,
  discount: 0,
  tax: 0,
  total: 480000,
  couponCode: null,
  notes: 'Please call before delivery.',
  trackingNumber: null,
  estimatedDelivery: '2026-07-22T00:00:00.000Z',
  deliveredAt: null,
  cancelledAt: null,
  cancelReason: null,
  createdAt: '2026-07-18T08:30:00.000Z',
  updatedAt: '2026-07-18T09:00:00.000Z',
  items: [
    {
      id: 'e2e-order-item-1',
      productId: product.id,
      variantId: null,
      productName: product.name,
      variantName: null,
      sku: product.sku,
      quantity: 1,
      unitPrice: 450000,
      totalPrice: 450000,
      imageUrl: product.images[0].url,
      product: {
        ...product,
        isActive: true,
      },
      variant: null,
    },
  ],
  address: {
    id: 'e2e-address-1',
    fullName: 'E2E Customer',
    phone: '0901234567',
    addressLine1: '42 Nguyen Hue',
    addressLine2: null,
    ward: 'Ben Nghe',
    district: 'District 1',
    province: 'Ho Chi Minh City',
    country: 'Vietnam',
    postalCode: '700000',
  },
  payment: {
    id: 'e2e-payment-1',
    method: 'COD',
    status: 'PENDING',
    amount: 480000,
    currency: 'VND',
    paidAt: null,
  },
  shippingMethod: {
    id: 'e2e-shipping-1',
    name: 'Standard delivery',
    description: 'Delivery in 2-4 days',
    estimatedDays: '2-4 days',
  },
  shipping: null,
  statusHistory: [
    {
      id: 'e2e-history-confirmed',
      status: 'CONFIRMED',
      note: 'Order confirmed',
      createdAt: '2026-07-18T09:00:00.000Z',
    },
    {
      id: 'e2e-history-pending',
      status: 'PENDING',
      note: 'Order placed',
      createdAt: '2026-07-18T08:30:00.000Z',
    },
  ],
};

let adminOrderStatus = 'CONFIRMED';
let adminOrderUpdatedAt = '2026-07-18T09:00:00.000Z';
let adminOrderHistory = [...order.statusHistory];

function resetPhaseFiveState() {
  wishlistItems = [];
  helpful = false;
  order.status = 'CONFIRMED';
  order.updatedAt = '2026-07-18T09:00:00.000Z';
  order.cancelledAt = null;
  order.cancelReason = null;
  order.statusHistory = [
    {
      id: 'e2e-history-confirmed',
      status: 'CONFIRMED',
      note: 'Order confirmed',
      createdAt: '2026-07-18T09:00:00.000Z',
    },
    {
      id: 'e2e-history-pending',
      status: 'PENDING',
      note: 'Order placed',
      createdAt: '2026-07-18T08:30:00.000Z',
    },
  ];
  adminOrderStatus = 'CONFIRMED';
  adminOrderUpdatedAt = '2026-07-18T09:00:00.000Z';
  adminOrderHistory = [...order.statusHistory];
  merchandising = {
    'new-arrivals': { productIds: allProducts.map((item) => item.id), limit: 4 },
    'best-sellers': { productIds: [...allProducts].reverse().map((item) => item.id), limit: 4 },
  };
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'DELETE, GET, OPTIONS, PATCH, POST',
    'Access-Control-Allow-Origin': 'http://127.0.0.1:3210',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://127.0.0.1:${port}`);

  if (request.method === 'OPTIONS') {
    sendJson(response, 204, null);
    return;
  }

  if (url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/test/reset') {
    resetPhaseFiveState();
    sendJson(response, 200, { status: 'reset' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/test/merchandising') {
    sendJson(response, 200, merchandising);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/test/order') {
    sendJson(response, 200, adminOrderPayload());
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/dashboard') {
    sendJson(response, 200, {
      data: {
        users: { total: 128, newToday: 4 },
        orders: { total: 312, today: 9, pending: 6 },
        products: { total: allProducts.length, active: allProducts.length, lowStock: 1 },
        revenue: {
          total: 186_400_000,
          thisMonth: 32_800_000,
          lastMonth: 29_200_000,
          growth: 12.3,
        },
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/reports') {
    const days = Math.max(1, Number(url.searchParams.get('days')) || 30);
    sendJson(response, 200, {
      data: {
        revenue: recentRevenue(days),
        topProducts: [...allProducts].sort((a, b) => b.soldCount - a.soldCount),
        statusBreakdown: [
          {
            status: adminOrderStatus,
            _count: { status: 1 },
            _sum: { total: order.total },
          },
        ],
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/orders') {
    sendJson(response, 200, {
      data: {
        data: [adminOrderPayload()],
        meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/inventory') {
    const variant = variantProduct.variants[0];
    sendJson(response, 200, {
      data: {
        data: [
          {
            id: 'e2e-inventory-2',
            quantity: variant.inventory.quantity,
            reserved: variant.inventory.reserved,
            threshold: variant.inventory.threshold,
            location: variant.inventory.location,
            product: {
              id: variantProduct.id,
              name: variantProduct.name,
              sku: variantProduct.sku,
              images: variantProduct.images,
            },
            variant: {
              sku: variant.sku,
              color: variant.color,
              size: variant.size,
            },
          },
        ],
        meta: { total: 1, page: 1, limit: 12, totalPages: 1 },
      },
    });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === `/api/admin/orders/${order.id}`
  ) {
    sendJson(response, 200, { data: adminOrderPayload() });
    return;
  }

  if (
    request.method === 'PATCH' &&
    url.pathname === `/api/admin/orders/${order.id}/status`
  ) {
    const body = await readJson(request);
    adminOrderStatus = body.status || adminOrderStatus;
    adminOrderUpdatedAt = new Date().toISOString();
    adminOrderHistory = [
      {
        id: `e2e-history-${adminOrderStatus.toLowerCase()}`,
        status: adminOrderStatus,
        note: body.note || null,
        createdAt: adminOrderUpdatedAt,
      },
      ...adminOrderHistory,
    ];
    sendJson(response, 200, { data: adminOrderPayload() });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/products/home-sections') {
    sendJson(response, 200, {
      data: {
        newArrivals: merchandisingSection('new-arrivals'),
        bestSellers: merchandisingSection('best-sellers'),
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/merchandising') {
    sendJson(response, 200, {
      data: {
        newArrivals: merchandisingSection('new-arrivals'),
        bestSellers: merchandisingSection('best-sellers'),
      },
    });
    return;
  }

  if (request.method === 'PATCH' && url.pathname.startsWith('/api/admin/merchandising/')) {
    const section = url.pathname.split('/').at(-1);
    if (!section || !merchandising[section]) {
      sendJson(response, 404, { message: 'Unknown merchandising section' });
      return;
    }

    const body = await readJson(request);
    merchandising[section] = {
      productIds: Array.isArray(body.productIds) ? body.productIds : [],
      limit: Number(body.limit) || 4,
    };
    sendJson(response, 200, { data: merchandisingSection(section) });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/products/options') {
    sendJson(response, 200, {
      data: {
        categories: [
          {
            ...product.category,
            isActive: true,
            sortOrder: 0,
            subCategories: [
              {
                id: 'e2e-subcategory-1',
                categoryId: product.category.id,
                name: 'Shirts',
                slug: 'shirts',
                isActive: true,
                sortOrder: 0,
              },
            ],
          },
        ],
        brands: [product.brand],
        colors: [{ id: 'e2e-color-1', name: 'Black', hexCode: '#111111' }],
        sizes: [{ id: 'e2e-size-1', name: 'M' }],
        collections: [],
      },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/products') {
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const candidates = allProducts.filter((item) => {
      if (!search) return true;
      return [
        item.name,
        item.sku,
        item.slug,
        item.brand?.name,
        item.category?.name,
        ...(item.variants || []).map((variant) => variant.sku),
      ].some((value) => value?.toLowerCase().includes(search));
    });
    sendJson(response, 200, {
      data: {
        data: candidates,
        meta: {
          total: candidates.length,
          page: 1,
          limit: Number(url.searchParams.get('limit')) || 8,
          totalPages: candidates.length > 0 ? 1 : 0,
        },
      },
    });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname.startsWith('/api/admin/products/')
  ) {
    const id = url.pathname.split('/').at(-1);
    const match = allProducts.find((item) => item.id === id);
    if (!match) {
      sendJson(response, 404, { message: 'Product not found' });
      return;
    }
    sendJson(response, 200, { data: match });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/products/filters') {
    sendJson(response, 200, {
      data: { brands: [product.brand], colors: [], sizes: [] },
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/categories') {
    sendJson(response, 200, { data: [product.category] });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/products') {
    sendJson(response, 200, {
      data: {
        data: allProducts,
        meta: {
          total: allProducts.length,
          page: 1,
          limit: 12,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname.startsWith('/api/products/') &&
    url.pathname.endsWith('/related')
  ) {
    const id = url.pathname.split('/')[3];
    sendJson(response, 200, {
      data: allProducts.filter((item) => item.id !== id),
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/wishlists') {
    sendJson(response, 200, { data: wishlistPayload() });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/wishlists') {
    if (wishlistItems.length === 0) {
      wishlistItems = [
        {
          id: 'e2e-wishlist-item-1',
          wishlistId: 'e2e-wishlist-1',
          productId: product.id,
          addedAt: new Date().toISOString(),
          product,
        },
      ];
    }
    sendJson(response, 201, { data: wishlistPayload() });
    return;
  }

  if (
    request.method === 'DELETE' &&
    url.pathname.startsWith('/api/wishlists/')
  ) {
    wishlistItems = [];
    sendJson(response, 200, { data: wishlistPayload() });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === `/api/reviews/product/${product.id}`
  ) {
    sendJson(response, 200, {
      data: {
        data: [review],
        meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
        summary: {
          averageRating: 5,
          reviewCount: 1,
          ratingBreakdown: [{ rating: 5, _count: 1 }],
        },
        ratingBreakdown: [{ rating: 5, _count: 1 }],
      },
    });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === '/api/reviews/helpful-votes'
  ) {
    sendJson(response, 200, {
      data: { reviewIds: helpful ? [review.id] : [] },
    });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === `/api/reviews/eligibility/${product.id}`
  ) {
    sendJson(response, 200, {
      data: {
        eligible: true,
        orderId: order.id,
        hasReviewed: false,
      },
    });
    return;
  }

  if (
    request.method === 'POST' &&
    url.pathname === `/api/reviews/${review.id}/helpful`
  ) {
    helpful = !helpful;
    sendJson(response, 200, {
      data: {
        reviewId: review.id,
        helpful,
        helpfulCount: helpful ? 4 : 3,
      },
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/reviews') {
    sendJson(response, 201, {
      data: { ...review, id: 'e2e-review-submitted', isApproved: false },
    });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === `/api/orders/${order.id}`
  ) {
    sendJson(response, 200, { data: order });
    return;
  }

  if (
    request.method === 'PATCH' &&
    url.pathname === `/api/orders/${order.id}/cancel`
  ) {
    order.status = 'CANCELLED';
    order.cancelledAt = new Date().toISOString();
    sendJson(response, 200, { data: order });
    return;
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/products/')) {
    const slug = url.pathname.split('/').at(-1);
    const match = allProducts.find((item) => item.slug === slug);
    if (!match) {
      sendJson(response, 404, { message: 'Product not found' });
      return;
    }
    sendJson(response, 200, { data: match });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === '/api/coupons/validate'
  ) {
    const code = (url.searchParams.get('code') || '').toUpperCase();
    if (code !== 'PHASE7') {
      sendJson(response, 400, { message: 'Coupon is invalid' });
      return;
    }
    sendJson(response, 200, {
      data: {
        coupon: { code: 'PHASE7', type: 'FIXED' },
        discount: 50000,
      },
    });
    return;
  }

  if (
    request.method === 'POST' &&
    url.pathname === '/api/newsletter/subscribe'
  ) {
    const body = await readJson(request);
    sendJson(response, 201, {
      data: {
        email: String(body.email || '').trim().toLowerCase(),
        message: 'Subscribed',
      },
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/users/me/addresses') {
    sendJson(response, 201, { data: { id: 'e2e-address-1' } });
    return;
  }

  if (request.method === 'DELETE' && url.pathname === '/api/cart') {
    sendJson(response, 200, { data: null });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/cart/items') {
    sendJson(response, 201, { data: { id: 'e2e-cart-item-1' } });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/orders/checkout') {
    sendJson(response, 201, { data: { orderNumber: 'E2E-ORDER-1001' } });
    return;
  }

  sendJson(response, 404, { message: `No mock for ${request.method} ${url.pathname}` });
});

server.listen(port, '127.0.0.1');

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    server.closeAllConnections?.();
  });
}
