-- Insert Vietnamese Fashion Products
-- Thêm sản phẩm thời trang Việt Nam

-- ============================================
-- 1. THÊM SẢN PHẨM ÁO THUN NAM
-- ============================================

-- Áo Thun Premium Cotton - OWEN
INSERT INTO products (id, name, slug, sku, description, "shortDescription", "categoryId", "subCategoryId", "brandId", gender, material, "careInstructions", "basePrice", "comparePrice", "isFeatured", "isActive", "isNewArrival", "isBestSeller", "soldCount", "viewCount", "avgRating", "reviewCount", weight, tags, "metaTitle", "metaDescription", "createdAt", "updatedAt")
VALUES (
  'vn-prod-001',
  'Áo Thun Premium Cotton - Trắng',
  'ao-thun-premium-cotton-trang',
  'OWEN-TSH-001',
  'Áo thun nam cao cấp được thiết kế từ chất liệu cotton 100% thoáng mát, form dáng regular fit phù hợp với mọi vóc dáng. Thiết kế tối giản với logo thêu tinh tế, dễ dàng phối đồ.',
  'Áo thun cotton cao cấp form regular fit',
  (SELECT id FROM categories WHERE slug = 'tops'),
  (SELECT id FROM sub_categories WHERE slug = 't-shirts'),
  (SELECT id FROM brands WHERE slug = 'achromatic'),
  'MALE',
  '100% Cotton',
  'Giặt máy với nước lạnh, không dùng chất tẩy',
  350000.00,
  450000.00,
  true,
  true,
  true,
  false,
  0,
  0,
  0.00,
  0,
  NULL,
  ARRAY['áo thun', 'cotton', 'vietnam', 'owen'],
  'Áo Thun Premium Cotton - Trắng | OWEN',
  'Áo thun nam cao cấp 100% cotton, form regular fit thoáng mát',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Thêm hình ảnh cho sản phẩm
INSERT INTO product_images (id, "productId", url, "altText", "isPrimary", "sortOrder", "createdAt")
VALUES 
  ('vn-img-001-1', 'vn-prod-001', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/o/ao-thun-nam-atm231201-tra-1.jpg', 'Áo thun trắng mặt trước', true, 0, CURRENT_TIMESTAMP),
  ('vn-img-001-2', 'vn-prod-001', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/o/ao-thun-nam-atm231201-tra-2.jpg', 'Áo thun trắng mặt sau', false, 1, CURRENT_TIMESTAMP);

-- Thêm variants
INSERT INTO product_variants (id, "productId", "colorId", "sizeId", sku, price, "imageUrl", "isActive", "createdAt", "updatedAt")
VALUES 
  ('vn-var-001-s', 'vn-prod-001', (SELECT id FROM product_colors WHERE name = 'Blanc'), (SELECT id FROM product_sizes WHERE name = 'S'), 'OWEN-TSH-001-S', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-001-m', 'vn-prod-001', (SELECT id FROM product_colors WHERE name = 'Blanc'), (SELECT id FROM product_sizes WHERE name = 'M'), 'OWEN-TSH-001-M', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-001-l', 'vn-prod-001', (SELECT id FROM product_colors WHERE name = 'Blanc'), (SELECT id FROM product_sizes WHERE name = 'L'), 'OWEN-TSH-001-L', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-001-xl', 'vn-prod-001', (SELECT id FROM product_colors WHERE name = 'Blanc'), (SELECT id FROM product_sizes WHERE name = 'XL'), 'OWEN-TSH-001-XL', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Thêm inventory
INSERT INTO inventory (id, "productId", "variantId", quantity, reserved, threshold, location, "updatedAt")
VALUES 
  ('vn-inv-001-s', 'vn-prod-001', 'vn-var-001-s', 50, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP),
  ('vn-inv-001-m', 'vn-prod-001', 'vn-var-001-m', 80, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP),
  ('vn-inv-001-l', 'vn-prod-001', 'vn-var-001-l', 60, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP),
  ('vn-inv-001-xl', 'vn-prod-001', 'vn-var-001-xl', 40, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP);

-- ============================================
-- 2. ÁO POLO NAM
-- ============================================

INSERT INTO products (id, name, slug, sku, description, "shortDescription", "categoryId", "subCategoryId", "brandId", gender, material, "careInstructions", "basePrice", "comparePrice", "isFeatured", "isActive", "isNewArrival", "isBestSeller", "soldCount", "viewCount", "avgRating", "reviewCount", weight, tags, "metaTitle", "metaDescription", "createdAt", "updatedAt")
VALUES (
  'vn-prod-002',
  'Áo Polo Pique Cao Cấp - Navy',
  'ao-polo-pique-cao-cap-navy',
  'OWEN-POL-001',
  'Áo polo nam dệt pique cao cấp với họa tiết vân nổi độc đáo. Thiết kế cổ dệt viền tương phản, cúc áo được chọn lọc kỹ càng. Chất liệu pique cotton thoáng khí, thấm hút mồ hôi tốt.',
  'Áo polo pique cotton cao cấp màu navy',
  (SELECT id FROM categories WHERE slug = 'tops'),
  (SELECT id FROM sub_categories WHERE slug = 'polos'),
  (SELECT id FROM brands WHERE slug = 'achromatic'),
  'MALE',
  '100% Cotton Pique',
  'Giặt máy nước lạnh, không dùng nước nóng',
  580000.00,
  720000.00,
  true,
  true,
  false,
  true,
  0,
  0,
  0.00,
  0,
  NULL,
  ARRAY['polo', 'pique', 'navy', 'vietnam'],
  'Áo Polo Pique Cao Cấp - Navy | OWEN',
  'Áo polo nam pique cotton cao cấp màu navy, thiết kế sang trọng',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO product_images (id, "productId", url, "altText", "isPrimary", "sortOrder", "createdAt")
VALUES 
  ('vn-img-002-1', 'vn-prod-002', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/o/ao-polo-nam-apm231303-nau-1.jpg', 'Áo polo navy mặt trước', true, 0, CURRENT_TIMESTAMP),
  ('vn-img-002-2', 'vn-prod-002', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/o/ao-polo-nam-apm231303-nau-2.jpg', 'Áo polo navy mặt sau', false, 1, CURRENT_TIMESTAMP);

INSERT INTO product_variants (id, "productId", "colorId", "sizeId", sku, price, "imageUrl", "isActive", "createdAt", "updatedAt")
VALUES 
  ('vn-var-002-m', 'vn-prod-002', (SELECT id FROM product_colors WHERE name = 'Navy'), (SELECT id FROM product_sizes WHERE name = 'M'), 'OWEN-POL-001-M', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-002-l', 'vn-prod-002', (SELECT id FROM product_colors WHERE name = 'Navy'), (SELECT id FROM product_sizes WHERE name = 'L'), 'OWEN-POL-001-L', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-002-xl', 'vn-prod-002', (SELECT id FROM product_colors WHERE name = 'Navy'), (SELECT id FROM product_sizes WHERE name = 'XL'), 'OWEN-POL-001-XL', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (id, "productId", "variantId", quantity, reserved, threshold, location, "updatedAt")
VALUES 
  ('vn-inv-002-m', 'vn-prod-002', 'vn-var-002-m', 45, 0, 5, 'Kho HN', CURRENT_TIMESTAMP),
  ('vn-inv-002-l', 'vn-prod-002', 'vn-var-002-l', 55, 0, 5, 'Kho HN', CURRENT_TIMESTAMP),
  ('vn-inv-002-xl', 'vn-prod-002', 'vn-var-002-xl', 35, 0, 5, 'Kho HN', CURRENT_TIMESTAMP);

-- ============================================
-- 3. QUẦN KAKI NAM
-- ============================================

INSERT INTO products (id, name, slug, sku, description, "shortDescription", "categoryId", "subCategoryId", "brandId", gender, material, "careInstructions", "basePrice", "comparePrice", "isFeatured", "isActive", "isNewArrival", "isBestSeller", "soldCount", "viewCount", "avgRating", "reviewCount", weight, tags, "metaTitle", "metaDescription", "createdAt", "updatedAt")
VALUES (
  'vn-prod-003',
  'Quần Kaki Slim Fit - Xám',
  'quan-kaki-slim-fit-xam',
  'OWEN-TRS-001',
  'Quần kaki nam form slim fit ôm vừa phải, tôn dáng. Chất liệu kaki cao cấp bền đẹp, không nhăn, giữ form tốt. Thiết kế túi khóa kéo tiện lợi, có dây lưng đi kèm.',
  'Quần kaki nam slim fit màu xám thanh lịch',
  (SELECT id FROM categories WHERE slug = 'bottoms'),
  (SELECT id FROM sub_categories WHERE slug = 'trousers'),
  (SELECT id FROM brands WHERE slug = 'achromatic'),
  'MALE',
  '97% Cotton, 3% Spandex',
  'Giặt máy với nước lạnh, là ở nhiệt độ thấp',
  650000.00,
  850000.00,
  false,
  true,
  true,
  true,
  0,
  0,
  0.00,
  0,
  NULL,
  ARRAY['quần kaki', 'slim fit', 'xám', 'vietnam'],
  'Quần Kaki Slim Fit - Xám | OWEN',
  'Quần kaki nam slim fit cao cấp màu xám, form đẹp tôn dáng',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO product_images (id, "productId", url, "altText", "isPrimary", "sortOrder", "createdAt")
VALUES 
  ('vn-img-003-1', 'vn-prod-003', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/q/u/quan-kaki-nam-qkm230401-xam-1.jpg', 'Quần kaki xám mặt trước', true, 0, CURRENT_TIMESTAMP),
  ('vn-img-003-2', 'vn-prod-003', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/q/u/quan-kaki-nam-qkm230401-xam-2.jpg', 'Quần kaki xám mặt sau', false, 1, CURRENT_TIMESTAMP);

INSERT INTO product_variants (id, "productId", "colorId", "sizeId", sku, price, "imageUrl", "isActive", "createdAt", "updatedAt")
VALUES 
  ('vn-var-003-29', 'vn-prod-003', (SELECT id FROM product_colors WHERE name = 'Slate'), (SELECT id FROM product_sizes WHERE name = '29'), 'OWEN-TRS-001-29', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-003-30', 'vn-prod-003', (SELECT id FROM product_colors WHERE name = 'Slate'), (SELECT id FROM product_sizes WHERE name = '30'), 'OWEN-TRS-001-30', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-003-31', 'vn-prod-003', (SELECT id FROM product_colors WHERE name = 'Slate'), (SELECT id FROM product_sizes WHERE name = '31'), 'OWEN-TRS-001-31', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-003-32', 'vn-prod-003', (SELECT id FROM product_colors WHERE name = 'Slate'), (SELECT id FROM product_sizes WHERE name = '32'), 'OWEN-TRS-001-32', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (id, "productId", "variantId", quantity, reserved, threshold, location, "updatedAt")
VALUES 
  ('vn-inv-003-29', 'vn-prod-003', 'vn-var-003-29', 30, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP),
  ('vn-inv-003-30', 'vn-prod-003', 'vn-var-003-30', 50, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP),
  ('vn-inv-003-31', 'vn-prod-003', 'vn-var-003-31', 45, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP),
  ('vn-inv-003-32', 'vn-prod-003', 'vn-var-003-32', 35, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP);

-- ============================================
-- 4. ÁO SƠ MI NAM
-- ============================================

INSERT INTO products (id, name, slug, sku, description, "shortDescription", "categoryId", "subCategoryId", "brandId", gender, material, "careInstructions", "basePrice", "comparePrice", "isFeatured", "isActive", "isNewArrival", "isBestSeller", "soldCount", "viewCount", "avgRating", "reviewCount", weight, tags, "metaTitle", "metaDescription", "createdAt", "updatedAt")
VALUES (
  'vn-prod-004',
  'Áo Sơ Mi Oxford - Trắng',
  'ao-so-mi-oxford-trang',
  'OWEN-SHT-001',
  'Áo sơ mi nam vải oxford cao cấp, dệt vân chéo mịn màng. Thiết kế cổ bẻ cổ điển, tay dài với khuy gài tinh tế. Dễ dàng kết hợp với quần tây hoặc quần jean cho phong cách lịch lãm.',
  'Áo sơ mi oxford trắng form regular',
  (SELECT id FROM categories WHERE slug = 'tops'),
  (SELECT id FROM sub_categories WHERE slug = 'shirts'),
  (SELECT id FROM brands WHERE slug = 'achromatic'),
  'MALE',
  '100% Cotton Oxford',
  'Giặt máy nước lạnh, là ủi nhiệt độ trung bình',
  490000.00,
  620000.00,
  true,
  true,
  false,
  true,
  0,
  0,
  0.00,
  0,
  NULL,
  ARRAY['sơ mi', 'oxford', 'trắng', 'formal'],
  'Áo Sơ Mi Oxford - Trắng | OWEN',
  'Áo sơ mi nam oxford cao cấp màu trắng, thiết kế thanh lịch',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO product_images (id, "productId", url, "altText", "isPrimary", "sortOrder", "createdAt")
VALUES 
  ('vn-img-004-1', 'vn-prod-004', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/o/ao-so-mi-nam-asm231401-tra-1.jpg', 'Áo sơ mi trắng mặt trước', true, 0, CURRENT_TIMESTAMP),
  ('vn-img-004-2', 'vn-prod-004', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/o/ao-so-mi-nam-asm231401-tra-2.jpg', 'Áo sơ mi trắng mặt sau', false, 1, CURRENT_TIMESTAMP);

INSERT INTO product_variants (id, "productId", "colorId", "sizeId", sku, price, "imageUrl", "isActive", "createdAt", "updatedAt")
VALUES 
  ('vn-var-004-s', 'vn-prod-004', (SELECT id FROM product_colors WHERE name = 'Blanc'), (SELECT id FROM product_sizes WHERE name = 'S'), 'OWEN-SHT-001-S', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-004-m', 'vn-prod-004', (SELECT id FROM product_colors WHERE name = 'Blanc'), (SELECT id FROM product_sizes WHERE name = 'M'), 'OWEN-SHT-001-M', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-004-l', 'vn-prod-004', (SELECT id FROM product_colors WHERE name = 'Blanc'), (SELECT id FROM product_sizes WHERE name = 'L'), 'OWEN-SHT-001-L', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (id, "productId", "variantId", quantity, reserved, threshold, location, "updatedAt")
VALUES 
  ('vn-inv-004-s', 'vn-prod-004', 'vn-var-004-s', 40, 0, 5, 'Kho HN', CURRENT_TIMESTAMP),
  ('vn-inv-004-m', 'vn-prod-004', 'vn-var-004-m', 60, 0, 5, 'Kho HN', CURRENT_TIMESTAMP),
  ('vn-inv-004-l', 'vn-prod-004', 'vn-var-004-l', 50, 0, 5, 'Kho HN', CURRENT_TIMESTAMP);

-- ============================================
-- 5. ÁO KHOÁC NAM
-- ============================================

INSERT INTO products (id, name, slug, sku, description, "shortDescription", "categoryId", "subCategoryId", "brandId", gender, material, "careInstructions", "basePrice", "comparePrice", "isFeatured", "isActive", "isNewArrival", "isBestSeller", "soldCount", "viewCount", "avgRating", "reviewCount", weight, tags, "metaTitle", "metaDescription", "createdAt", "updatedAt")
VALUES (
  'vn-prod-005',
  'Áo Khoác Gió Nam - Đen',
  'ao-khoac-gio-nam-den',
  'OWEN-JAK-001',
  'Áo khoác gió nam chất liệu polyester cao cấp, chống thấm nước nhẹ. Thiết kế có mũ trùm, túi khóa kéo tiện dụng. Form áo vừa vặn, năng động, phù hợp cho các hoạt động ngoài trời.',
  'Áo khoác gió chống nước màu đen',
  (SELECT id FROM categories WHERE slug = 'outerwear'),
  (SELECT id FROM sub_categories WHERE slug = 'jackets'),
  (SELECT id FROM brands WHERE slug = 'achromatic'),
  'MALE',
  '100% Polyester',
  'Giặt tay, không vắt mạnh, phơi nơi thoáng mát',
  890000.00,
  1150000.00,
  true,
  true,
  true,
  false,
  0,
  0,
  0.00,
  0,
  NULL,
  ARRAY['áo khoác', 'windbreaker', 'đen', 'outdoor'],
  'Áo Khoác Gió Nam - Đen | OWEN',
  'Áo khoác gió nam chống nước, form đẹp năng động',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO product_images (id, "productId", url, "altText", "isPrimary", "sortOrder", "createdAt")
VALUES 
  ('vn-img-005-1', 'vn-prod-005', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/o/ao-khoac-nam-akm231201-den-1.jpg', 'Áo khoác gió đen mặt trước', true, 0, CURRENT_TIMESTAMP),
  ('vn-img-005-2', 'vn-prod-005', 'https://owen.cdn.vccloud.vn/media/catalog/product/cache/01755127bd64f5dde3182fd2f139143a/a/o/ao-khoac-nam-akm231201-den-2.jpg', 'Áo khoác gió đen mặt sau', false, 1, CURRENT_TIMESTAMP);

INSERT INTO product_variants (id, "productId", "colorId", "sizeId", sku, price, "imageUrl", "isActive", "createdAt", "updatedAt")
VALUES 
  ('vn-var-005-m', 'vn-prod-005', (SELECT id FROM product_colors WHERE name = 'Noir'), (SELECT id FROM product_sizes WHERE name = 'M'), 'OWEN-JAK-001-M', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-005-l', 'vn-prod-005', (SELECT id FROM product_colors WHERE name = 'Noir'), (SELECT id FROM product_sizes WHERE name = 'L'), 'OWEN-JAK-001-L', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vn-var-005-xl', 'vn-prod-005', (SELECT id FROM product_colors WHERE name = 'Noir'), (SELECT id FROM product_sizes WHERE name = 'XL'), 'OWEN-JAK-001-XL', NULL, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO inventory (id, "productId", "variantId", quantity, reserved, threshold, location, "updatedAt")
VALUES 
  ('vn-inv-005-m', 'vn-prod-005', 'vn-var-005-m', 35, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP),
  ('vn-inv-005-l', 'vn-prod-005', 'vn-var-005-l', 40, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP),
  ('vn-inv-005-xl', 'vn-prod-005', 'vn-var-005-xl', 25, 0, 5, 'Kho HCM', CURRENT_TIMESTAMP);

-- ============================================
-- THÔNG BÁO HOÀN THÀNH
-- ============================================

SELECT 'Đã thêm thành công 5 sản phẩm thời trang Việt Nam vào database!' AS message;
SELECT COUNT(*) as total_new_products FROM products WHERE id LIKE 'vn-prod-%';
