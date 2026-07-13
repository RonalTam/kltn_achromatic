SET client_encoding = 'UTF8';
-- ============================================================
-- ACHROMATIC SEED — ORDERS, PAYMENTS, COUPONS, BANNERS, COLLECTIONS
-- ============================================================

-- ── SHIPPING METHODS (5) ───────────────────────────────────
INSERT INTO public.shipping_methods (id,name,description,"basePrice","freeThreshold","estimatedDays","isActive","sortOrder","createdAt") VALUES
('ship-001','Giao Hàng Tiêu Chuẩn','Giao hàng trong 3-5 ngày làm việc trên toàn quốc',30000,500000,'3-5 ngày',true,1,CURRENT_TIMESTAMP),
('ship-002','Giao Hàng Nhanh','Giao hàng trong 1-2 ngày làm việc',50000,800000,'1-2 ngày',true,2,CURRENT_TIMESTAMP),
('ship-003','Giao Hàng Hỏa Tốc','Giao hàng trong ngày tại nội thành TP.HCM & HN',80000,NULL,'Trong ngày',true,3,CURRENT_TIMESTAMP),
('ship-004','Nhận Tại Cửa Hàng','Đến cửa hàng nhận trực tiếp, không mất phí',0,NULL,'Ngay lập tức',true,4,CURRENT_TIMESTAMP),
('ship-005','Giao Hàng Quốc Tế','Giao hàng quốc tế 7-14 ngày làm việc',200000,NULL,'7-14 ngày',true,5,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ── COUPONS (10) ──────────────────────────────────────────
INSERT INTO public.coupons (id,code,name,description,type,value,"minOrderAmount","maxDiscount","usageLimit","usagePerUser","usedCount","isActive","startsAt","expiresAt","applicableCategories","createdAt","updatedAt") VALUES
('cpn-001','WELCOME10','Chào Mừng Khách Mới','Giảm 10% cho đơn hàng đầu tiên','PERCENTAGE',10,300000,100000,NULL,1,0,true,'2026-01-01 00:00:00','2026-12-31 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-002','SALE20','Khuyến Mãi Tháng 6','Giảm 20% cho đơn hàng từ 500K','PERCENTAGE',20,500000,200000,500,1,47,true,'2026-06-01 00:00:00','2026-06-30 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-003','FREESHIP','Miễn Phí Giao Hàng','Miễn phí ship cho đơn từ 200K','FREE_SHIPPING',0,200000,NULL,NULL,2,123,true,'2026-01-01 00:00:00','2026-12-31 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-004','ACHROMATIC50K','Giảm 50K','Giảm trực tiếp 50,000 VNĐ','FIXED_AMOUNT',50000,400000,NULL,200,1,89,true,'2026-01-01 00:00:00','2026-12-31 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-005','SUMMER30','Ưu Đãi Hè 2026','Giảm 30% cho bộ sưu tập hè','PERCENTAGE',30,700000,300000,300,1,34,true,'2026-06-01 00:00:00','2026-08-31 23:59:59',ARRAY['cat-001','cat-002','cat-006'],CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-006','NEWMEMBER','Thành Viên Mới','Giảm 15% đơn hàng đầu tiên của thành viên','PERCENTAGE',15,0,150000,NULL,1,0,true,'2026-01-01 00:00:00','2026-12-31 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-007','FLASH25','Flash Sale 25%','Giảm 25% trong 24 giờ','PERCENTAGE',25,600000,250000,100,1,67,true,'2026-06-20 00:00:00','2026-06-21 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-008','VIP100K','VIP Exclusive','Giảm 100,000 VNĐ cho đơn từ 1 triệu','FIXED_AMOUNT',100000,1000000,NULL,50,1,12,true,'2026-01-01 00:00:00','2026-12-31 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-009','BIRTHDAY20','Ưu Đãi Sinh Nhật','Giảm 20% trong tháng sinh nhật của bạn','PERCENTAGE',20,0,200000,NULL,1,0,true,'2026-01-01 00:00:00','2026-12-31 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cpn-010','ENDSEASON','Cuối Mùa Giảm Sâu','Giảm 40% hàng tồn kho cuối mùa','PERCENTAGE',40,800000,500000,200,1,178,false,'2026-01-01 00:00:00','2026-03-31 23:59:59',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ── BANNERS (6) ───────────────────────────────────────────
INSERT INTO public.banners (id,title,subtitle,"imageUrl","mobileImageUrl","linkUrl","linkText",position,"isActive","sortOrder","startsAt","endsAt","createdAt","updatedAt") VALUES
('banner-001','THỜI TRANG TỐI GIẢN','Bộ Sưu Tập Hè 2026 — Khám Phá Ngay','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80&fit=crop','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=768&q=80&fit=crop','/collections?season=summer-2026','Khám Phá','HERO',true,1,'2026-06-01 00:00:00','2026-08-31 23:59:59',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('banner-002','BLACK EDITION','Đen Thuần Khiết — Không Nhượng Bộ','https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1920&q=80&fit=crop','https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=768&q=80&fit=crop','/collections/black-edition','Xem Ngay','HERO',true,2,'2026-06-01 00:00:00','2026-09-30 23:59:59',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('banner-003','ĐƠN TỐI GIẢN, SỐ HÀNG ĐẦU','Áo Thun Premium — Từ 350,000 VNĐ','https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1920&q=80&fit=crop','https://images.unsplash.com/photo-1562157873-818bc0726f68?w=768&q=80&fit=crop','/collections?category=ao-thun','Mua Ngay','HERO',true,3,'2026-06-01 00:00:00','2026-12-31 23:59:59',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('banner-004','MIỄN PHÍ GIAO HÀNG','Cho Đơn Hàng Từ 500,000 VNĐ','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80&fit=crop','https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=768&q=80&fit=crop','/collections','Khám Phá','HERO',true,4,'2026-01-01 00:00:00','2026-12-31 23:59:59',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('banner-005','ÁO KHOÁC MÙA ĐÔNG','Wool Blend Cao Cấp — Ấm Áp Sang Trọng','https://images.unsplash.com/photo-1539533018257-a13b471e1a01?w=1200&q=80&fit=crop','https://images.unsplash.com/photo-1539533018257-a13b471e1a01?w=768&q=80&fit=crop','/collections?category=ao-khoac','Xem Bộ Sưu Tập','CATEGORY',true,1,'2026-09-01 00:00:00','2026-12-31 23:59:59',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('banner-006','QUẦN JEANS PREMIUM','Selvedge Denim Nhật Bản — Chuẩn Chất','https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&q=80&fit=crop','https://images.unsplash.com/photo-1542272604-787c3835535d?w=768&q=80&fit=crop','/collections?category=quan-jeans','Khám Phá','CATEGORY',true,2,'2026-01-01 00:00:00','2026-12-31 23:59:59',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ── COLLECTIONS (3) ───────────────────────────────────────
INSERT INTO public.collections (id,name,slug,description,"imageUrl","isActive","isFeatured","sortOrder","metaTitle","metaDescription","createdAt","updatedAt") VALUES
('coll-001','Bộ Sưu Tập Hè 2026','bo-suu-tap-he-2026','Những thiết kế nhẹ nhàng, thoáng mát cho mùa hè sôi động. Chất liệu linen, cotton tự nhiên, màu sắc trung tính hiện đại.','https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80&fit=crop',true,true,1,'Bộ Sưu Tập Hè 2026 | ACHROMATIC','Khám phá bộ sưu tập hè 2026 với những thiết kế tối giản, thoáng mát từ ACHROMATIC.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('coll-002','Wardrobe Cơ Bản','wardrobe-co-ban','Những item không thể thiếu trong tủ đồ tối giản: áo thun trắng đen, quần jeans, hoodie essential. Đầu tư một lần, mặc mãi mãi.','https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80&fit=crop',true,true,2,'Wardrobe Cơ Bản | ACHROMATIC','Xây dựng tủ đồ tối giản chuẩn với những item essential từ ACHROMATIC.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('coll-003','Black Edition','black-edition','Toàn bộ màu đen — tinh tế, bí ẩn, không bao giờ lỗi mốt. Từ áo thun đến áo khoác, tất cả đều là đen tuyệt đối.','https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80&fit=crop',true,true,3,'Black Edition | ACHROMATIC','Bộ sưu tập đen cao cấp từ ACHROMATIC — thuần túy và sang trọng.',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ── COLLECTION PRODUCTS ────────────────────────────────────
INSERT INTO public.collection_products ("collectionId","productId","sortOrder") VALUES
-- Hè 2026: áo thun, polo, quần short, linen
('coll-001','prod-pol-003',1),('coll-001','prod-tsh-001',2),('coll-001','prod-tsh-006',3),
('coll-001','prod-qsh-001',4),('coll-001','prod-qsh-003',5),('coll-001','prod-somi-002',6),
('coll-001','prod-qtay-002',7),
-- Wardrobe cơ bản: essentials
('coll-002','prod-tsh-001',1),('coll-002','prod-tsh-002',2),('coll-002','prod-somi-001',3),
('coll-002','prod-jean-002',4),('coll-002','prod-hd-001',5),('coll-002','prod-pk-002',6),
('coll-002','prod-pk-003',7),('coll-002','prod-qtay-001',8),
-- Black Edition: tất cả đen
('coll-003','prod-tsh-002',1),('coll-003','prod-pol-001',2),('coll-003','prod-jean-001',3),
('coll-003','prod-hd-001',4),('coll-003','prod-ak-001',5),('coll-003','prod-sw-001',6),
('coll-003','prod-pk-001',7)
ON CONFLICT DO NOTHING;

-- ── ORDERS (15) ────────────────────────────────────────────
INSERT INTO public.orders (id,"orderNumber","userId","addressId",status,subtotal,"shippingFee",discount,tax,total,"couponId","couponCode",notes,"shippingMethodId","trackingNumber","estimatedDelivery","deliveredAt","cancelledAt","cancelReason","createdAt","updatedAt") VALUES
('ord-001','ACH-2026-00001','user-cust-001','addr-cust-001','DELIVERED',800000,0,80000,0,720000,'cpn-001','WELCOME10',NULL,'ship-001','GHN-001-2026','2026-06-05 00:00:00','2026-06-06 14:30:00',NULL,NULL,'2026-06-01 10:30:00','2026-06-06 14:30:00'),
('ord-002','ACH-2026-00002','user-cust-002','addr-cust-002','COMPLETED',450000,30000,0,0,480000,NULL,NULL,NULL,'ship-001','GHN-002-2026','2026-06-08 00:00:00','2026-06-09 11:00:00',NULL,NULL,'2026-06-04 15:00:00','2026-06-09 11:00:00'),
('ord-003','ACH-2026-00003','user-cust-003','addr-cust-003','COMPLETED',1200000,0,120000,0,1080000,'cpn-002','SALE20',NULL,'ship-002','GHTK-003-2026','2026-06-10 00:00:00','2026-06-11 09:00:00',NULL,NULL,'2026-06-08 09:00:00','2026-06-11 09:00:00'),
('ord-004','ACH-2026-00004','user-cust-004','addr-cust-004','COMPLETED',680000,50000,0,0,730000,NULL,NULL,'Gói đẹp giúp mình nhé','ship-002','GHTK-004-2026','2026-06-12 00:00:00','2026-06-13 16:00:00',NULL,NULL,'2026-06-10 14:00:00','2026-06-13 16:00:00'),
('ord-005','ACH-2026-00005','user-cust-005','addr-cust-005','DELIVERED',350000,30000,0,0,380000,NULL,NULL,NULL,'ship-001','GHN-005-2026','2026-06-14 00:00:00','2026-06-16 10:00:00',NULL,NULL,'2026-06-11 08:00:00','2026-06-16 10:00:00'),
('ord-006','ACH-2026-00006','user-cust-006','addr-cust-006','SHIPPING',890000,0,50000,0,840000,'cpn-004','ACHROMATIC50K',NULL,'ship-001','GHN-006-2026','2026-06-22 00:00:00',NULL,NULL,NULL,'2026-06-18 11:00:00','2026-06-18 11:00:00'),
('ord-007','ACH-2026-00007','user-cust-007','addr-cust-007','SHIPPING',720000,50000,0,0,770000,NULL,NULL,NULL,'ship-002','GHTK-007-2026','2026-06-23 00:00:00',NULL,NULL,NULL,'2026-06-19 13:30:00','2026-06-19 13:30:00'),
('ord-008','ACH-2026-00008','user-cust-008','addr-cust-008','SHIPPING',1299000,0,0,0,1299000,NULL,NULL,NULL,'ship-003',NULL,'2026-06-24 00:00:00',NULL,NULL,NULL,'2026-06-21 08:00:00','2026-06-21 08:00:00'),
('ord-009','ACH-2026-00009','user-cust-009','addr-cust-009','CONFIRMED',560000,30000,0,0,590000,NULL,NULL,NULL,'ship-001',NULL,'2026-06-25 00:00:00',NULL,NULL,NULL,'2026-06-20 16:00:00','2026-06-20 16:00:00'),
('ord-010','ACH-2026-00010','user-cust-010','addr-cust-010','CONFIRMED',980000,0,98000,0,882000,'cpn-002','SALE20',NULL,'ship-002',NULL,'2026-06-24 00:00:00',NULL,NULL,NULL,'2026-06-20 17:30:00','2026-06-20 17:30:00'),
('ord-011','ACH-2026-00011','user-cust-011','addr-cust-011','PENDING',420000,30000,0,0,450000,NULL,NULL,NULL,'ship-001',NULL,'2026-06-26 00:00:00',NULL,NULL,NULL,'2026-06-21 09:00:00','2026-06-21 09:00:00'),
('ord-012','ACH-2026-00012','user-cust-012','addr-cust-012','PENDING',650000,0,0,0,650000,NULL,NULL,NULL,'ship-004',NULL,NULL,NULL,NULL,NULL,'2026-06-21 10:30:00','2026-06-21 10:30:00'),
('ord-013','ACH-2026-00013','user-cust-013','addr-cust-013','COMPLETED',1100000,0,110000,0,990000,'cpn-002','SALE20',NULL,'ship-001','GHN-013-2026','2026-06-15 00:00:00','2026-06-16 15:00:00',NULL,NULL,'2026-06-12 07:00:00','2026-06-16 15:00:00'),
('ord-014','ACH-2026-00014','user-cust-014','addr-cust-014','DELIVERED',480000,30000,0,0,510000,NULL,NULL,NULL,'ship-001','GHN-014-2026','2026-06-18 00:00:00','2026-06-19 10:00:00',NULL,NULL,'2026-06-14 12:00:00','2026-06-19 10:00:00'),
('ord-015','ACH-2026-00015','user-cust-015','addr-cust-015','COMPLETED',850000,50000,0,0,900000,NULL,NULL,'Giao nhanh giúp mình','ship-002','GHTK-015-2026','2026-06-17 00:00:00','2026-06-17 18:00:00',NULL,NULL,'2026-06-15 14:00:00','2026-06-17 18:00:00')
ON CONFLICT DO NOTHING;

-- ── ORDER ITEMS (~35 items) ────────────────────────────────
INSERT INTO public.order_items (id,"orderId","productId","variantId","productName","variantName",sku,quantity,"unitPrice","totalPrice","imageUrl") VALUES
-- ord-001
('oi-001-1','ord-001','prod-tsh-001','v-tsh001-3','Áo Thun Essential Trắng Cổ Tròn','Trắng / M','ACH-TSH-001-WHT-M',2,350000,700000,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80'),
('oi-001-2','ord-001','prod-pk-003','v-sox001-1','Bộ Vớ Cổ Ngắn Cotton Premium 3 Đôi','Đen','ACH-SOX-001-BLK',1,199000,199000,'https://images.unsplash.com/photo-1564424224827-cd24b8915874?w=400&q=80'),
-- ord-002
('oi-002-1','ord-002','prod-pol-004','v-pol004-2','Áo Polo Classic Navy Viền Trắng','Navy / M','ACH-POL-004-NAV-M',1,350000,350000,'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80'),
('oi-002-2','ord-002','prod-pk-002','v-bag001-1','Túi Tote Canvas Đen Minimalist A4','Đen','ACH-BAG-001-BLK',1,199000,199000,'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400&q=80'),
-- ord-003
('oi-003-1','ord-003','prod-jean-001','v-jns001-3','Quần Jeans Slim Fit Đen Denim Premium','Đen / 32','ACH-JNS-001-BLK-32',1,890000,890000,'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80'),
('oi-003-2','ord-003','prod-somi-001','v-smi001-2','Sơ Mi Oxford Trắng Cổ Điển','Trắng / M','ACH-SMI-001-WHT-M',1,590000,590000,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80'),
-- ord-004
('oi-004-1','ord-004','prod-hd-001','v-hdi001-2','Hoodie Essential Đen Fleece Chui Đầu','Đen / M','ACH-HDI-001-BLK-M',1,590000,590000,'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80'),
('oi-004-2','ord-004','prod-pk-001','v-hat001-1','Mũ Bucket Hat Đen Canvas Premium','Đen / Free Size','ACH-HAT-001-BLK',1,290000,290000,'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80'),
-- ord-005
('oi-005-1','ord-005','prod-tsh-006','v-tsh006-2','Áo Thun Crop Đen Nữ Tối Giản','Đen / S','ACH-TSH-006-BLK-S',1,299000,299000,'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80'),
('oi-005-2','ord-005','prod-pk-003','v-sox001-2','Bộ Vớ Cổ Ngắn Cotton Premium 3 Đôi','Trắng','ACH-SOX-001-WHT',1,199000,199000,'https://images.unsplash.com/photo-1564424224827-cd24b8915874?w=400&q=80'),
-- ord-006
('oi-006-1','ord-006','prod-ak-001','v-bmb001-2','Áo Khoác Bomber Đen Premium Unisex','Đen / M','ACH-BMB-001-BLK-M',1,980000,980000,'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80'),
('oi-006-2','ord-006','prod-tsh-002','v-tsh002-2','Áo Thun Đen Oversize Minimal','Đen / M','ACH-TSH-002-BLK-M',1,420000,420000,'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80'),
-- ord-007
('oi-007-1','ord-007','prod-jean-002','v-jns002-3','Quần Jeans Xanh Wash Straight Leg','Xanh / 32','ACH-JNS-002-32',1,750000,750000,'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80'),
('oi-007-2','ord-007','prod-pol-001','v-pol001-2','Áo Polo Piqué Essential Đen','Đen / M','ACH-POL-001-BLK-M',1,450000,450000,'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80'),
-- ord-008
('oi-008-1','ord-008','prod-sw-002','v-swt002-2','Sweater V-Neck Camel Cashmere Blend','Camel / M','ACH-SWT-002-CAM-M',1,1299000,1299000,'https://images.unsplash.com/photo-1602810316693-3667c854239a?w=400&q=80'),
-- ord-009
('oi-009-1','ord-009','prod-tsh-003','v-tsh003-3','Áo Thun Ribbed Cổ Tròn Xám Nhạt','Xám / M','ACH-TSH-003-GRY-M',2,290000,580000,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80'),
-- ord-010
('oi-010-1','ord-010','prod-ak-002','v-trc001-2','Áo Khoác Trench Coat Kem Dáng Dài','Kem / M','ACH-TRC-001-CRM-M',1,1200000,1200000,'https://images.unsplash.com/photo-1539533018257-a13b471e1a01?w=400&q=80'),
('oi-010-2','ord-010','prod-pk-002','v-bag001-1','Túi Tote Canvas Đen Minimalist A4','Đen','ACH-BAG-001-BLK',1,199000,199000,'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=400&q=80'),
-- ord-011
('oi-011-1','ord-011','prod-tsh-009','v-tsh009-3','Áo Thun Kẻ Sọc Ngang Pháp Trắng Navy','Navy / M','ACH-TSH-009-M',1,390000,390000,'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80'),
('oi-011-2','ord-011','prod-pk-003','v-sox001-3','Bộ Vớ Cổ Ngắn Cotton Premium 3 Đôi','Xám','ACH-SOX-001-GRY',1,199000,199000,'https://images.unsplash.com/photo-1564424224827-cd24b8915874?w=400&q=80'),
-- ord-012
('oi-012-1','ord-012','prod-qtay-001','v-chn001-2','Quần Chino Đen Slim Fit Premium','Đen / 31','ACH-CHN-001-BLK-31',1,590000,590000,'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80'),
('oi-012-2','ord-012','prod-pol-002','v-pol002-2','Áo Polo Merino Blend Xám','Xám / M','ACH-POL-002-GRY-M',1,720000,720000,'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=400&q=80'),
-- ord-013
('oi-013-1','ord-013','prod-sw-001','v-swt001-2','Sweater Crew Neck Đen Merino Wool Thuần','Đen / M','ACH-SWT-001-BLK-M',1,1100000,1100000,'https://images.unsplash.com/photo-1602810316693-3667c854239a?w=400&q=80'),
-- ord-014
('oi-014-1','ord-014','prod-tsh-005','v-tsh005-2','Áo Thun Heavyweight Navy 240gsm','Navy / M','ACH-TSH-005-NAV-M',1,490000,490000,'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&q=80'),
-- ord-015
('oi-015-1','ord-015','prod-jean-003','v-jns003-3','Quần Jeans Wide Leg Xanh Nhạt Unisex','Xám / 32','ACH-JNS-003-32',1,820000,820000,'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80'),
('oi-015-2','ord-015','prod-tsh-001','v-tsh001-3','Áo Thun Essential Trắng Cổ Tròn','Trắng / M','ACH-TSH-001-WHT-M',1,350000,350000,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80')
ON CONFLICT DO NOTHING;

-- ── ORDER STATUS HISTORY ───────────────────────────────────
INSERT INTO public.order_status_history (id,"orderId",status,note,"changedBy","createdAt") VALUES
('osh-001-1','ord-001','PENDING','Đơn hàng vừa được tạo','user-cust-001','2026-06-01 10:30:00'),
('osh-001-2','ord-001','CONFIRMED','Đã xác nhận đơn hàng','user-admin-002','2026-06-01 11:00:00'),
('osh-001-3','ord-001','SHIPPING','Đã bàn giao cho đơn vị vận chuyển GHN','user-admin-002','2026-06-02 08:00:00'),
('osh-001-4','ord-001','DELIVERED','Giao hàng thành công','user-admin-002','2026-06-06 14:30:00'),
('osh-002-1','ord-002','PENDING','Đơn hàng vừa được tạo','user-cust-002','2026-06-04 15:00:00'),
('osh-002-2','ord-002','CONFIRMED','Đã xác nhận','user-admin-002','2026-06-04 15:30:00'),
('osh-002-3','ord-002','COMPLETED','Đơn hàng hoàn tất','user-admin-002','2026-06-09 11:00:00'),
('osh-003-1','ord-003','PENDING','Đơn hàng vừa được tạo','user-cust-003','2026-06-08 09:00:00'),
('osh-003-2','ord-003','CONFIRMED','Đã xác nhận và chuẩn bị hàng','user-admin-002','2026-06-08 09:30:00'),
('osh-003-3','ord-003','COMPLETED','Đơn hàng hoàn tất thành công','user-admin-002','2026-06-11 09:00:00'),
('osh-006-1','ord-006','PENDING','Đơn hàng vừa được tạo','user-cust-006','2026-06-18 11:00:00'),
('osh-006-2','ord-006','SHIPPING','Đang vận chuyển','user-admin-002','2026-06-19 08:00:00'),
('osh-009-1','ord-009','PENDING','Đơn hàng vừa được tạo','user-cust-009','2026-06-20 16:00:00'),
('osh-009-2','ord-009','CONFIRMED','Đã xác nhận đơn hàng','user-admin-002','2026-06-21 08:00:00'),
('osh-011-1','ord-011','PENDING','Đơn hàng đang chờ xử lý','user-cust-011','2026-06-21 09:00:00'),
('osh-012-1','ord-012','PENDING','Đơn hàng đang chờ xử lý','user-cust-012','2026-06-21 10:30:00')
ON CONFLICT DO NOTHING;

-- ── PAYMENTS (15) ─────────────────────────────────────────
INSERT INTO public.payments (id,"orderId",method,status,amount,currency,"transactionRef","paidAt","expiresAt",metadata,"createdAt","updatedAt") VALUES
('pay-001','ord-001','COD','COMPLETED',720000,'VND',NULL,'2026-06-06 14:30:00',NULL,NULL,'2026-06-01 10:30:00','2026-06-06 14:30:00'),
('pay-002','ord-002','VNPAY','COMPLETED',480000,'VND','VNPAY-2026-002-ABC123','2026-06-04 15:05:00',NULL,NULL,'2026-06-04 15:00:00','2026-06-04 15:05:00'),
('pay-003','ord-003','MOMO','COMPLETED',1080000,'VND','MOMO-2026-003-DEF456','2026-06-08 09:03:00',NULL,NULL,'2026-06-08 09:00:00','2026-06-08 09:03:00'),
('pay-004','ord-004','VNPAY','COMPLETED',730000,'VND','VNPAY-2026-004-GHI789','2026-06-10 14:04:00',NULL,NULL,'2026-06-10 14:00:00','2026-06-10 14:04:00'),
('pay-005','ord-005','COD','COMPLETED',380000,'VND',NULL,'2026-06-16 10:00:00',NULL,NULL,'2026-06-11 08:00:00','2026-06-16 10:00:00'),
('pay-006','ord-006','VNPAY','COMPLETED',840000,'VND','VNPAY-2026-006-JKL012','2026-06-18 11:05:00',NULL,NULL,'2026-06-18 11:00:00','2026-06-18 11:05:00'),
('pay-007','ord-007','COD','PENDING',770000,'VND',NULL,NULL,NULL,NULL,'2026-06-19 13:30:00','2026-06-19 13:30:00'),
('pay-008','ord-008','MOMO','COMPLETED',1299000,'VND','MOMO-2026-008-MNO345','2026-06-21 08:03:00',NULL,NULL,'2026-06-21 08:00:00','2026-06-21 08:03:00'),
('pay-009','ord-009','BANK_TRANSFER','PENDING',590000,'VND',NULL,NULL,'2026-06-22 16:00:00',NULL,'2026-06-20 16:00:00','2026-06-20 16:00:00'),
('pay-010','ord-010','VNPAY','COMPLETED',882000,'VND','VNPAY-2026-010-PQR678','2026-06-20 17:35:00',NULL,NULL,'2026-06-20 17:30:00','2026-06-20 17:35:00'),
('pay-011','ord-011','COD','PENDING',450000,'VND',NULL,NULL,NULL,NULL,'2026-06-21 09:00:00','2026-06-21 09:00:00'),
('pay-012','ord-012','BANK_TRANSFER','PENDING',650000,'VND',NULL,NULL,'2026-06-23 10:30:00',NULL,'2026-06-21 10:30:00','2026-06-21 10:30:00'),
('pay-013','ord-013','MOMO','COMPLETED',990000,'VND','MOMO-2026-013-STU901','2026-06-12 07:04:00',NULL,NULL,'2026-06-12 07:00:00','2026-06-12 07:04:00'),
('pay-014','ord-014','VNPAY','COMPLETED',510000,'VND','VNPAY-2026-014-VWX234','2026-06-14 12:04:00',NULL,NULL,'2026-06-14 12:00:00','2026-06-14 12:04:00'),
('pay-015','ord-015','COD','COMPLETED',900000,'VND',NULL,'2026-06-17 18:00:00',NULL,NULL,'2026-06-15 14:00:00','2026-06-17 18:00:00')
ON CONFLICT DO NOTHING;

