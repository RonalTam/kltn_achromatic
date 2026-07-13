-- Achromatic seed verification queries
-- Run from backend folder:
-- psql -U postgres -d achromatic_db -f .\prisma\verify-achromatic-seed.sql

SELECT 'categories_total' AS check_name, COUNT(*)::text AS value
FROM categories;

SELECT 'brands_total' AS check_name, COUNT(*)::text AS value
FROM brands;

SELECT 'achromatic_seed_products' AS check_name, COUNT(*)::text AS value
FROM products
WHERE sku LIKE 'ACH-%';

SELECT 'achromatic_seed_orders' AS check_name, COUNT(*)::text AS value
FROM orders
WHERE "orderNumber" LIKE 'ACH-DEMO-%';

SELECT 'products_without_primary_image' AS check_name, COUNT(*)::text AS value
FROM products p
WHERE p.sku LIKE 'ACH-%'
  AND NOT EXISTS (
    SELECT 1
    FROM product_images pi
    WHERE pi."productId" = p.id
      AND pi."isPrimary" = true
  );

SELECT 'products_with_invalid_price' AS check_name, COUNT(*)::text AS value
FROM products
WHERE sku LIKE 'ACH-%'
  AND "basePrice" <= 0;

SELECT 'image_urls_used_more_than_8_times' AS check_name, COUNT(*)::text AS value
FROM (
  SELECT pi.url
  FROM product_images pi
  JOIN products p ON p.id = pi."productId"
  WHERE p.sku LIKE 'ACH-%'
  GROUP BY pi.url
  HAVING COUNT(*) > 8
) duplicated_images;

SELECT c.name AS category_without_seed_products, c.slug
FROM categories c
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
    AND p.sku LIKE 'ACH-%'
);

SELECT status, COUNT(*) AS order_count
FROM orders
WHERE "orderNumber" LIKE 'ACH-DEMO-%'
GROUP BY status
ORDER BY status;
