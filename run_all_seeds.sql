SET client_encoding = 'UTF8';
-- ============================================================
-- ACHROMATIC SEED DATA — MASTER RUNNER v4
-- ============================================================
-- CMD:        set PGCLIENTENCODING=UTF8
--             psql -U postgres -d web_fashion -f run_all_seeds.sql
-- ============================================================

\echo '=== STEP 1: Schema check (tables already exist, skipping recreate) ==='

-- Fix search_path bị reset bởi sql.sql dump
SET search_path = public;

\echo ''
\echo '=== STEP 2: Truncating all existing data... ==='

SET session_replication_role = replica;

TRUNCATE TABLE
  public.audit_logs,
  public.blog_tag_relations,
  public.blogs,
  public.blog_tags,
  public.blog_categories,
  public.cart_items,
  public.carts,
  public.collection_products,
  public.collections,
  public.coupon_usage,
  public.coupons,
  public.inventory_transactions,
  public.inventory,
  public.notifications,
  public.order_items,
  public.order_status_history,
  public.orders,
  public.payment_transactions,
  public.payments,
  public.permissions,
  public.product_images,
  public.product_specifications,
  public.product_variants,
  public.products,
  public.review_images,
  public.reviews,
  public.shipping_tracking,
  public.shipping_methods,
  public.sub_categories,
  public.user_addresses,
  public.user_role_permissions,
  public.users,
  public.banners,
  public.brands,
  public.categories,
  public.product_colors,
  public.product_sizes,
  public.wishlist_items,
  public.wishlists
CASCADE;

SET session_replication_role = DEFAULT;

\echo 'Tables cleared OK.'
\echo ''
\echo '=== STEP 3: Importing seed data... ==='
\echo ''

\echo '[1/6] Foundation (colors, sizes, categories, brands, 50 products, images)...'
\i d:/Nhap/web-fashion/seed_achromatic.sql

\echo '[2/6] Product variants (300)...'
\i d:/Nhap/web-fashion/seed_variants.sql

\echo '[3/6] Inventory (300)...'
\i d:/Nhap/web-fashion/seed_inventory.sql

\echo '[4/6] Users & Addresses (20)...'
\i d:/Nhap/web-fashion/seed_users.sql

\echo '[5/6] Orders, Coupons, Banners, Collections...'
\i d:/Nhap/web-fashion/seed_orders.sql

\echo '[6/6] Reviews, Wishlists, Carts...'
\i d:/Nhap/web-fashion/seed_reviews_wishlists.sql

\echo ''
\echo '=== DONE! Record counts ==='
\echo ''

SELECT 'categories'        AS tbl, COUNT(*) AS n FROM public.categories        UNION ALL
SELECT 'sub_categories',           COUNT(*)        FROM public.sub_categories   UNION ALL
SELECT 'brands',                   COUNT(*)        FROM public.brands            UNION ALL
SELECT 'product_colors',           COUNT(*)        FROM public.product_colors   UNION ALL
SELECT 'product_sizes',            COUNT(*)        FROM public.product_sizes    UNION ALL
SELECT 'products',                 COUNT(*)        FROM public.products          UNION ALL
SELECT 'product_images',           COUNT(*)        FROM public.product_images   UNION ALL
SELECT 'product_variants',         COUNT(*)        FROM public.product_variants UNION ALL
SELECT 'inventory',                COUNT(*)        FROM public.inventory         UNION ALL
SELECT 'users',                    COUNT(*)        FROM public.users             UNION ALL
SELECT 'user_addresses',           COUNT(*)        FROM public.user_addresses   UNION ALL
SELECT 'shipping_methods',         COUNT(*)        FROM public.shipping_methods UNION ALL
SELECT 'coupons',                  COUNT(*)        FROM public.coupons           UNION ALL
SELECT 'banners',                  COUNT(*)        FROM public.banners           UNION ALL
SELECT 'collections',              COUNT(*)        FROM public.collections       UNION ALL
SELECT 'orders',                   COUNT(*)        FROM public.orders            UNION ALL
SELECT 'order_items',              COUNT(*)        FROM public.order_items      UNION ALL
SELECT 'payments',                 COUNT(*)        FROM public.payments          UNION ALL
SELECT 'reviews',                  COUNT(*)        FROM public.reviews           UNION ALL
SELECT 'wishlists',                COUNT(*)        FROM public.wishlists         UNION ALL
SELECT 'wishlist_items',           COUNT(*)        FROM public.wishlist_items   UNION ALL
SELECT 'carts',                    COUNT(*)        FROM public.carts             UNION ALL
SELECT 'cart_items',               COUNT(*)        FROM public.cart_items
ORDER BY tbl;
