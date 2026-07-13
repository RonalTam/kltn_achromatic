-- Roll back only demo data created by prisma/seed.ts.
-- This does not truncate tables and does not touch non-ACH products/orders.
-- Run from backend folder:
-- psql -U postgres -d achromatic_db -f .\prisma\rollback-achromatic-seed.sql

BEGIN;

DELETE FROM payment_transactions
WHERE "paymentId" IN (
  SELECT pay.id
  FROM payments pay
  JOIN orders o ON o.id = pay."orderId"
  WHERE o."orderNumber" LIKE 'ACH-DEMO-%'
);

DELETE FROM payments
WHERE "orderId" IN (
  SELECT id
  FROM orders
  WHERE "orderNumber" LIKE 'ACH-DEMO-%'
);

DELETE FROM shipping_tracking
WHERE "orderId" IN (
  SELECT id
  FROM orders
  WHERE "orderNumber" LIKE 'ACH-DEMO-%'
);

DELETE FROM order_status_history
WHERE "orderId" IN (
  SELECT id
  FROM orders
  WHERE "orderNumber" LIKE 'ACH-DEMO-%'
);

DELETE FROM order_items
WHERE "orderId" IN (
  SELECT id
  FROM orders
  WHERE "orderNumber" LIKE 'ACH-DEMO-%'
);

DELETE FROM orders
WHERE "orderNumber" LIKE 'ACH-DEMO-%';

DELETE FROM collection_products
WHERE "productId" IN (
  SELECT id
  FROM products
  WHERE sku LIKE 'ACH-%'
);

DELETE FROM wishlist_items
WHERE "productId" IN (
  SELECT id
  FROM products
  WHERE sku LIKE 'ACH-%'
);

DELETE FROM cart_items
WHERE "productId" IN (
  SELECT id
  FROM products
  WHERE sku LIKE 'ACH-%'
);

DELETE FROM review_images
WHERE "reviewId" IN (
  SELECT r.id
  FROM reviews r
  JOIN products p ON p.id = r."productId"
  WHERE p.sku LIKE 'ACH-%'
);

DELETE FROM reviews
WHERE "productId" IN (
  SELECT id
  FROM products
  WHERE sku LIKE 'ACH-%'
);

DELETE FROM inventory_transactions
WHERE "inventoryId" IN (
  SELECT i.id
  FROM inventory i
  JOIN products p ON p.id = i."productId"
  WHERE p.sku LIKE 'ACH-%'
);

DELETE FROM inventory
WHERE "productId" IN (
  SELECT id
  FROM products
  WHERE sku LIKE 'ACH-%'
);

DELETE FROM product_specifications
WHERE "productId" IN (
  SELECT id
  FROM products
  WHERE sku LIKE 'ACH-%'
);

DELETE FROM product_images
WHERE "productId" IN (
  SELECT id
  FROM products
  WHERE sku LIKE 'ACH-%'
);

DELETE FROM product_variants
WHERE "productId" IN (
  SELECT id
  FROM products
  WHERE sku LIKE 'ACH-%'
);

DELETE FROM products
WHERE sku LIKE 'ACH-%';

DELETE FROM collection_products
WHERE "collectionId" IN (
  SELECT id
  FROM collections
  WHERE slug = 'achromatic-essentials'
);

DELETE FROM collections
WHERE slug = 'achromatic-essentials';

DELETE FROM banners
WHERE id IN ('ach-hero-main');

DELETE FROM shipping_methods
WHERE id IN ('ach-standard-shipping', 'ach-express-shipping');

DELETE FROM settings
WHERE key IN ('site_name', 'currency', 'free_shipping_threshold');

DELETE FROM user_role_permissions
WHERE "userId" IN (
  SELECT id
  FROM users
  WHERE email IN (
    'admin@achromatic.vn',
    'minh.nguyen@achromatic.vn',
    'linh.tran@achromatic.vn',
    'anh.le@achromatic.vn'
  )
);

DELETE FROM users
WHERE email IN (
  'admin@achromatic.vn',
  'minh.nguyen@achromatic.vn',
  'linh.tran@achromatic.vn',
  'anh.le@achromatic.vn'
);

DELETE FROM sub_categories sc
WHERE sc.slug IN (
  'ao-thun-basic',
  'ao-thun-oversize',
  'so-mi-linen',
  'so-mi-cong-so',
  'jacket',
  'blazer-nhe',
  'hoodie',
  'sweater',
  'jeans-ong-suong',
  'jeans-slim',
  'quan-au',
  'trouser-smart-casual',
  'dam-midi',
  'dam-suong',
  'chan-vay-chu-a',
  'chan-vay-midi',
  'mu-kinh',
  'that-lung-khan',
  'sneaker',
  'loafer-sandal',
  'tui-tote',
  'tui-deo-cheo',
  'unisex-basic',
  'unisex-streetwear'
)
AND NOT EXISTS (
  SELECT 1
  FROM products p
  WHERE p."subCategoryId" = sc.id
);

DELETE FROM categories c
WHERE c.slug IN (
  'ao-thun',
  'ao-so-mi',
  'ao-khoac',
  'hoodie-sweater',
  'quan-jeans',
  'quan-tay',
  'vay-dam',
  'chan-vay',
  'phu-kien',
  'giay-dep',
  'tui-xach',
  'do-unisex'
)
AND NOT EXISTS (
  SELECT 1
  FROM products p
  WHERE p."categoryId" = c.id
);

DELETE FROM brands b
WHERE b.slug IN (
  'achromatic-studio',
  'routine',
  'yody',
  'coolmate',
  'local-brand-vn',
  'urban-style',
  'minimal-wear',
  'streetwear-lab'
)
AND NOT EXISTS (
  SELECT 1
  FROM products p
  WHERE p."brandId" = b.id
);

COMMIT;
