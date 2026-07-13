SET client_encoding = 'UTF8';
-- ============================================================
-- ACHROMATIC SEED — REVIEWS, WISHLISTS, CARTS
-- ============================================================

-- ── REVIEWS (30 đánh giá tiếng Việt) ─────────────────────
INSERT INTO public.reviews (id,"productId","userId","orderId",rating,title,body,"isVerified","isApproved","helpfulCount","createdAt","updatedAt") VALUES

-- Áo Thun Essential Trắng (prod-tsh-001) — 6 reviews
('rev-001','prod-tsh-001','user-cust-001','ord-001',5,'Siêu chất lượng, xứng đáng từng đồng!',
 'Mình đã thử nhiều áo thun trắng khác nhau nhưng chưa có cái nào vừa ý như ACHROMATIC này. Vải Supima cotton dày 180gsm, không bị trong suốt, không bị co sau khi giặt. Cổ áo giữ form rất tốt sau 10 lần giặt. Màu trắng vẫn trắng tinh, không bị ố vàng. 5 sao xứng đáng!',
 true,true,24,'2026-06-07 10:00:00','2026-06-07 10:00:00'),

('rev-002','prod-tsh-001','user-cust-003','ord-003',5,'Đây là chiếc áo thun tôi tìm kiếm bao lâu nay',
 'Chất cotton Supima mềm mại đặc biệt, không gây kích ứng da nhạy cảm của mình. Form boxy nhẹ rất phù hợp để mặc cả ngày. Mua 2 cái trắng và 1 cái xám, cả 3 đều perfect. Ship nhanh, đóng gói đẹp.',
 true,true,18,'2026-06-12 14:00:00','2026-06-12 14:00:00'),

('rev-003','prod-tsh-001','user-cust-005','ord-005',4,'Tốt nhưng hơi đắt so với tầm giá',
 'Chất vải thật sự rất tốt, mặc vào cảm giác premium ngay lập tức. Nhược điểm duy nhất là giá hơi cao so với những áo thun thông thường. Nhưng nếu nhìn vào độ bền và chất lượng thì vẫn xứng đáng. Sẽ mua thêm.',
 true,true,9,'2026-06-17 11:00:00','2026-06-17 11:00:00'),

('rev-004','prod-tsh-001','user-cust-007','ord-007',5,'Vải cực đỉnh, không bị nhìn xuyên qua',
 'Điểm mình thích nhất là vải dày 180gsm nên không bị nhìn xuyên qua dù mặc không áo bên trong. Màu trắng thuần, không lẫn vàng hay xanh. Mua size M chuẩn vóc 70kg/175cm. Rất hài lòng!',
 true,true,15,'2026-06-20 09:00:00','2026-06-20 09:00:00'),

('rev-005','prod-tsh-001','user-cust-009','ord-009',5,'Mua lần 3 rồi, không bao giờ thất vọng',
 'Đây là lần thứ 3 mình mua áo thun này. Chất lượng ổn định qua từng đợt hàng, không bị xuống cấp. Áo đầu tiên mình mua cách đây 6 tháng vẫn trắng và form đẹp. Sẽ tiếp tục mua.',
 true,true,31,'2026-06-21 08:00:00','2026-06-21 08:00:00'),

('rev-006','prod-tsh-001','user-cust-011',NULL,4,'Giao hàng chậm nhưng sản phẩm xứng đáng chờ',
 'Mình chờ 4 ngày mới nhận được hàng, hơi lâu một chút. Nhưng khi nhận được thì mọi thứ đều OK. Áo được gói cẩn thận, kèm túi vải đựng đẹp. Chất vải đúng như mô tả.',
 false,true,5,'2026-06-22 15:00:00','2026-06-22 15:00:00'),

-- Áo Thun Đen Oversize (prod-tsh-002) — 5 reviews
('rev-007','prod-tsh-002','user-cust-006','ord-006',5,'Oversize chuẩn concept, không bị nhàu',
 'Áo oversize mà vẫn có cấu trúc, không bị nhão hay nhàu. Vai drop đúng điểm, tay áo dài vừa đủ. Organic cotton 200gsm nặng tay nhưng mặc vào rất thoải mái. Màu đen đậm, không phai sau nhiều lần giặt. Đây là chiếc áo oversize tốt nhất mình từng mặc.',
 true,true,29,'2026-06-19 16:00:00','2026-06-19 16:00:00'),

('rev-008','prod-tsh-002','user-cust-013','ord-013',5,'Áo đen oversize sang xịn mịn',
 'Nhìn ảnh tưởng bình thường nhưng cầm thực tế mới thấy khác biệt. Vải nặng, dày, không nhìn xuyên qua. Màu đen cực kỳ đồng đều không có vệt. Mặc với quần jeans đen là combo cực đẹp.',
 true,true,22,'2026-06-13 10:00:00','2026-06-13 10:00:00'),

('rev-009','prod-tsh-002','user-cust-016',NULL,4,'Tốt, chỉ cần chú ý size',
 'Áo rất đẹp và chất. Nhưng oversize nên cần chú ý khi chọn size. Mình cao 165cm nặng 55kg mà mua size S vẫn thấy hơi rộng. Nếu thích fit ôm hơn nên xuống 1 size. Chất vải thì không có gì để chê.',
 false,true,11,'2026-06-23 10:00:00','2026-06-23 10:00:00'),

('rev-010','prod-tsh-002','user-cust-008','ord-002',5,'Mua cho chồng, chồng mê luôn',
 'Mình mua làm quà sinh nhật chồng. Chồng đang dùng nguyên ngày, khen vải mềm và không gây khó chịu dù trời nóng. Đóng gói premium, có túi vải đựng riêng rất đẹp.',
 true,true,8,'2026-06-10 11:00:00','2026-06-10 11:00:00'),

('rev-011','prod-tsh-002','user-cust-004','ord-004',4,'Áo đẹp, mặc được nhiều dịp',
 'Áo oversize đen cực kỳ versatile. Mặc đi chơi, đi làm casual, đi gym đều được. Organic cotton có cảm giác hơi thô hơn cotton thường nhưng sau vài lần giặt mềm hẳn ra. Hài lòng!',
 true,true,13,'2026-06-14 09:00:00','2026-06-14 09:00:00'),

-- Áo Polo Essential Đen (prod-pol-001) — 4 reviews
('rev-012','prod-pol-001','user-cust-002','ord-002',5,'Áo polo đỉnh nhất tôi từng mặc',
 'Đã mua hơn 10 chiếc polo từ nhiều thương hiệu, nhưng ACHROMATIC là ngon nhất. Piqué dệt đều, cổ áo không bị nhão, khuy áo chắc chắn. Màu đen đồng đều không có vệt. Mặc được cả công sở lẫn dạo phố.',
 true,true,35,'2026-06-10 14:00:00','2026-06-10 14:00:00'),

('rev-013','prod-pol-001','user-cust-014','ord-014',5,'Polo tốt nhất phân khúc này',
 'Giá tầm 450K nhưng chất lượng vượt xa mức giá. Vải piqué dày, form đẹp, không bị loe ra sau khi giặt. Cổ áo dệt cứng cáp. Đây là chiếc polo mình sẽ recommend cho mọi người.',
 true,true,19,'2026-06-20 16:00:00','2026-06-20 16:00:00'),

('rev-014','prod-pol-001','user-cust-017',NULL,4,'Chất vải tốt, size chuẩn',
 'Mua size M cho người 68kg 173cm, vừa vặn. Vải piqué dày, không bị mỏng. Màu đen đẹp, không bị phai sau 5 lần giặt. Trừ 1 sao vì khâu cổ áo bên trong hơi thô, để lộ đường chỉ.',
 false,true,7,'2026-06-23 11:00:00','2026-06-23 11:00:00'),

('rev-015','prod-pol-001','user-cust-012','ord-012',5,'Đặt lần 2, không bao giờ hối hận',
 'Lần đầu mua 1 cái thử, hài lòng đến mức quay lại mua thêm 2 cái màu khác. Polo này mặc được cả 4 mùa ở Việt Nam. Mùa hè mặc bình thường, mùa lạnh mặc thêm áo khoác bên ngoài.',
 true,true,27,'2026-06-22 10:00:00','2026-06-22 10:00:00'),

-- Quần Jeans Đen Slim Fit (prod-jean-001) — 4 reviews
('rev-016','prod-jean-001','user-cust-002','ord-002',5,'Jeans đen chất lượng nhất mình từng mua',
 'Selvedge denim Nhật Bản thật sự khác biệt hoàn toàn so với denim thông thường. Vải dày, chắc, nhưng không cứng. 2% elastane giúp thoải mái khi ngồi hoặc leo cầu thang. Màu đen không phai, không nhợt sau nhiều lần giặt.',
 true,true,41,'2026-06-10 15:00:00','2026-06-10 15:00:00'),

('rev-017','prod-jean-001','user-cust-006','ord-006',5,'Đầu tư một lần, mặc cả đời',
 'Giá 890K nghe có vẻ cao nhưng so với chất lượng thì hoàn toàn xứng đáng. Mình mặc đi làm, đi ăn tối, đi chơi đều được. Jeans slim fit không bó, có độ giãn vừa đủ. Đường may kép rất bền.',
 true,true,33,'2026-06-20 10:00:00','2026-06-20 10:00:00'),

('rev-018','prod-jean-001','user-cust-010','ord-010',4,'Tốt nhưng cần break-in một chút',
 'Selvedge denim ban đầu hơi cứng, cần mặc vài lần mới mềm ra. Nhưng sau khi break-in thì cực kỳ thoải mái và fit hoàn hảo theo dáng người. Đây là tính năng đặc trưng của selvedge denim cao cấp.',
 true,true,14,'2026-06-21 08:00:00','2026-06-21 08:00:00'),

('rev-019','prod-jean-001','user-cust-018',NULL,5,'Mặc cả ngày không thấy mệt chân',
 'Cổ mình hay bị đau chân khi mặc jeans cả ngày, nhưng với cái này thì không. Có lẽ nhờ 2% elastane. Màu đen đậm rất đẹp, phối được với mọi màu áo. Rất hài lòng!',
 false,true,16,'2026-06-23 14:00:00','2026-06-23 14:00:00'),

-- Hoodie Essential Đen (prod-hd-001) — 4 reviews
('rev-020','prod-hd-001','user-cust-004','ord-004',5,'Hoodie ấm nhất mình từng mặc',
 'Fleece bên trong dày và mềm, mặc vào mùa lạnh không cần thêm gì nữa. 400gsm thật sự nặng tay, cảm giác premium khi cầm. Mũ double-layer không bị xẹp. Túi kangaroo rộng tiện lợi.',
 true,true,28,'2026-06-14 10:00:00','2026-06-14 10:00:00'),

('rev-021','prod-hd-001','user-cust-013','ord-013',5,'Essential hoodie hoàn hảo',
 'Không logo, không họa tiết, chỉ là màu đen thuần khiết và chất vải đỉnh. Đây là triết lý tối giản mình tìm kiếm. Mặc cả năm không biết chán. Gấu và tay áo ribbed giữ form đẹp sau nhiều lần giặt.',
 true,true,22,'2026-06-13 11:00:00','2026-06-13 11:00:00'),

('rev-022','prod-hd-001','user-cust-015','ord-015',4,'Ấm và đẹp nhưng hơi nặng',
 'Hoodie rất ấm và chất lượng không có gì để chê. Chỉ hơi nặng so với hoodie thông thường do 400gsm. Nhưng nếu bạn cần ấm thật sự thì đây là lựa chọn tốt nhất.',
 true,true,10,'2026-06-18 09:00:00','2026-06-18 09:00:00'),

('rev-023','prod-hd-001','user-cust-016',NULL,5,'Mặc ngủ cực kỳ thoải mái',
 'Ban đầu mua để mặc ra ngoài nhưng giờ mặc ngủ luôn vì quá thoải mái. Fleece mềm không gây ngứa. Màu đen không bị phai sau khi giặt. Đây là khoản đầu tư tốt nhất mùa này.',
 false,true,19,'2026-06-23 08:00:00','2026-06-23 08:00:00'),

-- Sweater Merino Đen (prod-sw-001) — 3 reviews
('rev-024','prod-sw-001','user-cust-013','ord-013',5,'Merino wool thật sự khác biệt',
 '100% extra fine merino không gây ngứa da chút nào dù mình hay bị kích ứng với len. Tự điều tiết nhiệt độ rất tốt — mặc ở văn phòng điều hòa hay ra ngoài đều comfortable. Bỏ ra 1.1 triệu nhưng đây là chiếc sweater sẽ mặc 10 năm.',
 true,true,38,'2026-06-13 12:00:00','2026-06-13 12:00:00'),

('rev-025','prod-sw-001','user-cust-007','ord-007',5,'Đầu tư đúng đắn nhất từ trước đến nay',
 'Sweater merino 100% này là khoản đầu tư thời trang tốt nhất của mình. Giặt tay nhẹ nhàng, phơi phẳng là OK. Sau 1 năm sử dụng vẫn như mới. Không có viên len, không bị nhão. Perfect.',
 true,true,45,'2026-06-20 15:00:00','2026-06-20 15:00:00'),

('rev-026','prod-sw-001','user-cust-010','ord-010',4,'Đẹp và sang nhưng cần chú ý giặt giũ',
 'Sweater rất đẹp và chất lượng cao. Tuy nhiên phải giặt tay, không giặt máy được. Nếu bận không có thời gian chăm sóc thì cân nhắc. Còn không thì đây là sweater đáng mua nhất.',
 true,true,12,'2026-06-21 09:00:00','2026-06-21 09:00:00'),

-- Bomber Jacket Đen (prod-ak-001) — 2 reviews
('rev-027','prod-ak-001','user-cust-006','ord-006',5,'Bomber jacket chuẩn premium',
 'Lót satin bên trong mịn và sang. Khóa YKK ẩn không lộ ra ngoài rất tinh tế. Cổ ribbed, tay ribbed, gấu ribbed đều chắc chắn. Nylon bên ngoài không bị nhăn. Đây là bomber jacket tốt nhất tầm giá dưới 1 triệu.',
 true,true,26,'2026-06-19 17:00:00','2026-06-19 17:00:00'),

('rev-028','prod-ak-001','user-cust-003',NULL,5,'Mua làm quà, người nhận mê luôn',
 'Mua tặng bạn trai sinh nhật. Anh ấy mặc ngay và khen cả tuần. Chất nylon dày, lót trong ấm. Form oversized nhẹ đẹp. Đóng gói trong túi vải cao cấp, rất phù hợp làm quà tặng.',
 false,true,9,'2026-06-23 16:00:00','2026-06-23 16:00:00'),

-- Túi Tote Canvas (prod-pk-002) — 2 reviews
('rev-029','prod-pk-002','user-cust-002','ord-002',5,'Túi tote thực dụng nhất mình từng dùng',
 'Canvas 12oz rất dày và chắc. Quai túi dày, không bị đứt hay nhão khi đựng nặng. Mình nhét laptop 13 inch, ví, điện thoại, sách A4 đầy mà quai vẫn không bị cứa vào tay. Logo in sắc nét không bong tróc. Mua thêm 1 cái màu navy.',
 true,true,33,'2026-06-10 16:00:00','2026-06-10 16:00:00'),

('rev-030','prod-pk-002','user-cust-008','ord-002',4,'Đơn giản mà tiện dụng',
 'Túi tote đúng chuẩn minimalist. Không có quá nhiều ngăn, túi phụ nhưng lại tiện lợi và gọn gàng. Chứa vừa đồ đi làm 1 ngày. Vải canvas dày, giặt xong phơi khô là dùng lại được.',
 true,true,11,'2026-06-17 14:00:00','2026-06-17 14:00:00')

ON CONFLICT DO NOTHING;

-- ── WISHLISTS (10) ────────────────────────────────────────
INSERT INTO public.wishlists (id,"userId","createdAt","updatedAt") VALUES
('wl-001','user-cust-001',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-002','user-cust-002',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-003','user-cust-003',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-004','user-cust-004',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-005','user-cust-005',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-006','user-cust-006',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-007','user-cust-007',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-008','user-cust-008',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-009','user-cust-009',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('wl-010','user-cust-010',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- ── WISHLIST ITEMS (30 items) ──────────────────────────────
INSERT INTO public.wishlist_items (id,"wishlistId","productId","addedAt") VALUES
('wli-001-1','wl-001','prod-sw-001','2026-06-10 10:00:00'),
('wli-001-2','wl-001','prod-ak-002','2026-06-12 14:00:00'),
('wli-001-3','wl-001','prod-jean-003','2026-06-15 09:00:00'),
('wli-002-1','wl-002','prod-hd-001','2026-06-11 11:00:00'),
('wli-002-2','wl-002','prod-pol-002','2026-06-13 16:00:00'),
('wli-002-3','wl-002','prod-somi-002','2026-06-18 10:00:00'),
('wli-003-1','wl-003','prod-tsh-010','2026-06-09 12:00:00'),
('wli-003-2','wl-003','prod-sw-002','2026-06-14 08:00:00'),
('wli-003-3','wl-003','prod-ak-001','2026-06-19 15:00:00'),
('wli-004-1','wl-004','prod-jean-006','2026-06-12 09:00:00'),
('wli-004-2','wl-004','prod-sw-004','2026-06-16 14:00:00'),
('wli-004-3','wl-004','prod-pk-001','2026-06-20 11:00:00'),
('wli-005-1','wl-005','prod-tsh-002','2026-06-10 15:00:00'),
('wli-005-2','wl-005','prod-hd-003','2026-06-13 10:00:00'),
('wli-005-3','wl-005','prod-somi-001','2026-06-17 09:00:00'),
('wli-006-1','wl-006','prod-ak-005','2026-06-11 08:00:00'),
('wli-006-2','wl-006','prod-qtay-003','2026-06-15 16:00:00'),
('wli-006-3','wl-006','prod-pol-006','2026-06-20 13:00:00'),
('wli-007-1','wl-007','prod-sw-002','2026-06-10 11:00:00'),
('wli-007-2','wl-007','prod-jean-001','2026-06-14 09:00:00'),
('wli-007-3','wl-007','prod-pk-002','2026-06-19 14:00:00'),
('wli-008-1','wl-008','prod-tsh-009','2026-06-12 10:00:00'),
('wli-008-2','wl-008','prod-hd-002','2026-06-16 15:00:00'),
('wli-008-3','wl-008','prod-somi-006','2026-06-21 08:00:00'),
('wli-009-1','wl-009','prod-pol-001','2026-06-11 14:00:00'),
('wli-009-2','wl-009','prod-ak-003','2026-06-15 10:00:00'),
('wli-009-3','wl-009','prod-pk-003','2026-06-20 16:00:00'),
('wli-010-1','wl-010','prod-tsh-001','2026-06-10 09:00:00'),
('wli-010-2','wl-010','prod-jean-002','2026-06-14 13:00:00'),
('wli-010-3','wl-010','prod-qtay-004','2026-06-21 11:00:00')
ON CONFLICT DO NOTHING;

-- ── CARTS (10 giỏ hàng) ───────────────────────────────────
INSERT INTO public.carts (id,"userId","sessionId","createdAt","updatedAt") VALUES
('cart-001','user-cust-011',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cart-002','user-cust-012',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cart-003','user-cust-013',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cart-004','user-cust-014',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cart-005','user-cust-015',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cart-006','user-cust-016',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cart-007','user-cust-017',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cart-008','user-cust-018',NULL,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('cart-009',NULL,'sess-guest-abc123','2026-06-23 10:00:00','2026-06-23 10:00:00'),
('cart-010',NULL,'sess-guest-def456','2026-06-23 14:00:00','2026-06-23 14:00:00')
ON CONFLICT DO NOTHING;

-- ── CART ITEMS (15 items) ──────────────────────────────────
INSERT INTO public.cart_items (id,"cartId","productId","variantId",quantity,"savedForLater","addedAt") VALUES
('ci-001-1','cart-001','prod-ak-001','v-bmb001-2',1,false,CURRENT_TIMESTAMP),
('ci-001-2','cart-001','prod-tsh-002','v-tsh002-2',2,false,CURRENT_TIMESTAMP),
('ci-002-1','cart-002','prod-sw-001','v-swt001-2',1,false,CURRENT_TIMESTAMP),
('ci-002-2','cart-002','prod-jean-002','v-jns002-3',1,false,CURRENT_TIMESTAMP),
('ci-003-1','cart-003','prod-pol-002','v-pol002-2',1,false,CURRENT_TIMESTAMP),
('ci-004-1','cart-004','prod-hd-002','v-hdi002-2',1,false,CURRENT_TIMESTAMP),
('ci-004-2','cart-004','prod-pk-002','v-bag001-1',1,false,CURRENT_TIMESTAMP),
('ci-005-1','cart-005','prod-somi-002','v-smi002-2',1,false,CURRENT_TIMESTAMP),
('ci-006-1','cart-006','prod-tsh-009','v-tsh009-3',2,false,CURRENT_TIMESTAMP),
('ci-006-2','cart-006','prod-pk-003','v-sox001-1',1,false,CURRENT_TIMESTAMP),
('ci-007-1','cart-007','prod-jean-003','v-jns003-3',1,false,CURRENT_TIMESTAMP),
('ci-008-1','cart-008','prod-ak-003','v-bls001-2',1,false,CURRENT_TIMESTAMP),
('ci-008-2','cart-008','prod-tsh-001','v-tsh001-3',1,true,CURRENT_TIMESTAMP),
('ci-009-1','cart-009','prod-tsh-002','v-tsh002-3',1,false,CURRENT_TIMESTAMP),
('ci-010-1','cart-010','prod-pol-001','v-pol001-2',1,false,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

