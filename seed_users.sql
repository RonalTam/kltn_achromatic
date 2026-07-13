SET client_encoding = 'UTF8';
-- ============================================================
-- ACHROMATIC SEED — USERS & ADDRESSES (20 users)
-- ============================================================

-- Password hash cho 'Achromatic2026!' (bcrypt $2b$10$...)
INSERT INTO public.users (id,email,password,"firstName","lastName",phone,"avatarUrl",role,"isActive","isVerified","verifyToken","resetToken","resetTokenExp","refreshToken","lastLoginAt","createdAt","updatedAt") VALUES
('user-admin-001','admin@achromatic.vn','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Admin','ACHROMATIC','0901000001',NULL,'SUPER_ADMIN',true,true,NULL,NULL,NULL,NULL,'2026-06-20 10:00:00','2026-01-01 00:00:00','2026-06-20 10:00:00'),
('user-admin-002','manager@achromatic.vn','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Quản','Lý','0901000002',NULL,'ADMIN',true,true,NULL,NULL,NULL,NULL,'2026-06-21 08:00:00','2026-01-15 00:00:00','2026-06-21 08:00:00'),
('user-cust-001','nguyen.thi.lan@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Lan','Nguyễn','0912345001',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-18 14:30:00','2026-02-01 00:00:00','2026-06-18 14:30:00'),
('user-cust-002','tran.van.minh@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Minh','Trần','0923456002',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-19 10:00:00','2026-02-05 00:00:00','2026-06-19 10:00:00'),
('user-cust-003','le.thi.hoa@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Hoa','Lê','0934567003',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-17 09:00:00','2026-02-10 00:00:00','2026-06-17 09:00:00'),
('user-cust-004','pham.van.duc@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Đức','Phạm','0945678004',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-20 16:00:00','2026-02-15 00:00:00','2026-06-20 16:00:00'),
('user-cust-005','hoang.thi.mai@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Mai','Hoàng','0956789005',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-15 11:00:00','2026-02-20 00:00:00','2026-06-15 11:00:00'),
('user-cust-006','vu.van.hung@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Hùng','Vũ','0967890006',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-21 13:00:00','2026-03-01 00:00:00','2026-06-21 13:00:00'),
('user-cust-007','dang.thi.thu@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Thu','Đặng','0978901007',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-14 08:30:00','2026-03-05 00:00:00','2026-06-14 08:30:00'),
('user-cust-008','bui.van.nam@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Nam','Bùi','0989012008',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-16 15:00:00','2026-03-10 00:00:00','2026-06-16 15:00:00'),
('user-cust-009','phan.thi.linh@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Linh','Phan','0990123009',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-20 09:30:00','2026-03-15 00:00:00','2026-06-20 09:30:00'),
('user-cust-010','ngo.van.tan@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Tân','Ngô','0901234010',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-13 12:00:00','2026-03-20 00:00:00','2026-06-13 12:00:00'),
('user-cust-011','dinh.thi.ngoc@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Ngọc','Đinh','0912345011',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-19 17:00:00','2026-04-01 00:00:00','2026-06-19 17:00:00'),
('user-cust-012','ly.van.cuong@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Cường','Lý','0923456012',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-18 10:30:00','2026-04-05 00:00:00','2026-06-18 10:30:00'),
('user-cust-013','do.thi.yen@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Yến','Đỗ','0934567013',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-12 14:00:00','2026-04-10 00:00:00','2026-06-12 14:00:00'),
('user-cust-014','ho.van.phong@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Phong','Hồ','0945678014',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-21 08:00:00','2026-04-15 00:00:00','2026-06-21 08:00:00'),
('user-cust-015','cao.thi.bich@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Bích','Cao','0956789015',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-11 11:00:00','2026-04-20 00:00:00','2026-06-11 11:00:00'),
('user-cust-016','trinh.van.quan@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Quân','Trịnh','0967890016',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-20 13:00:00','2026-05-01 00:00:00','2026-06-20 13:00:00'),
('user-cust-017','duong.thi.thao@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Thị Thảo','Dương','0978901017',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-10 16:00:00','2026-05-05 00:00:00','2026-06-10 16:00:00'),
('user-cust-018','vo.van.khoa@gmail.com','$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGXad68LjLAH7zkmFe','Văn Khoa','Võ','0989012018',NULL,'CUSTOMER',true,true,NULL,NULL,NULL,NULL,'2026-06-21 10:00:00','2026-05-10 00:00:00','2026-06-21 10:00:00')
ON CONFLICT DO NOTHING;

-- ── USER ADDRESSES (20 addresses) ─────────────────────────
INSERT INTO public.user_addresses (id,"userId","fullName",phone,"addressLine1","addressLine2",ward,district,province,country,"postalCode","isDefault","createdAt","updatedAt") VALUES
('addr-admin-001','user-admin-001','Admin ACHROMATIC','0901000001','123 Nguyễn Huệ','Tầng 5',NULL,'Quận 1','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-admin-002','user-admin-002','Quản Lý','0901000002','45 Lê Lợi',NULL,NULL,'Quận 1','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-001','user-cust-001','Nguyễn Thị Lan','0912345001','12 Hoàng Diệu 2',NULL,'Phường Linh Chiểu','TP. Thủ Đức','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-002','user-cust-002','Trần Văn Minh','0923456002','58 Trần Phú',NULL,'Phường Mộ Lao','Hà Đông','Hà Nội','Việt Nam','100000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-003','user-cust-003','Lê Thị Hoa','0934567003','89 Phan Châu Trinh',NULL,'Phường Hải Châu 1','Hải Châu','Đà Nẵng','Việt Nam','550000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-004','user-cust-004','Phạm Văn Đức','0945678004','23 Đinh Tiên Hoàng',NULL,'Phường Đa Kao','Quận 1','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-005','user-cust-005','Hoàng Thị Mai','0956789005','102 Trần Hưng Đạo',NULL,'Phường Cái Khế','Ninh Kiều','Cần Thơ','Việt Nam','900000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-006','user-cust-006','Vũ Văn Hùng','0967890006','67 Lý Thường Kiệt',NULL,'Phường Trần Hưng Đạo','Hoàn Kiếm','Hà Nội','Việt Nam','100000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-007','user-cust-007','Đặng Thị Thu','0978901007','34 Nguyễn Trãi',NULL,'Phường Nguyễn Cư Trinh','Quận 1','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-008','user-cust-008','Bùi Văn Nam','0989012008','78 Lạch Tray',NULL,'Phường Đằng Giang','Ngô Quyền','Hải Phòng','Việt Nam','180000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-009','user-cust-009','Phan Thị Linh','0990123009','15 Võ Thị Sáu',NULL,'Phường Võ Thị Sáu','Quận 3','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-010','user-cust-010','Ngô Văn Tân','0901234010','201 Cách Mạng Tháng 8',NULL,'Phường 4','Quận 3','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-011','user-cust-011','Đinh Thị Ngọc','0912345011','56 Kim Mã',NULL,'Phường Kim Mã','Ba Đình','Hà Nội','Việt Nam','100000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-012','user-cust-012','Lý Văn Cường','0923456012','18 Lê Văn Sỹ',NULL,'Phường 11','Quận 3','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-013','user-cust-013','Đỗ Thị Yến','0934567013','99 Nguyễn Văn Linh',NULL,'Phường Tân Thuận Tây','Quận 7','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-014','user-cust-014','Hồ Văn Phong','0945678014','44 Hùng Vương',NULL,'Phường Lê Bình','Cái Răng','Cần Thơ','Việt Nam','900000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-015','user-cust-015','Cao Thị Bích','0956789015','31 Nguyễn Hữu Thọ',NULL,'Phường Tân Phong','Quận 7','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-016','user-cust-016','Trịnh Văn Quân','0967890016','88 Bà Triệu',NULL,'Phường Bùi Thị Xuân','Hai Bà Trưng','Hà Nội','Việt Nam','100000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-017','user-cust-017','Dương Thị Thảo','0978901017','22 Lê Duẩn',NULL,'Phường Thạch Thang','Hải Châu','Đà Nẵng','Việt Nam','550000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('addr-cust-018','user-cust-018','Võ Văn Khoa','0989012018','77 Phạm Văn Đồng',NULL,'Phường Hiệp Bình Chánh','TP. Thủ Đức','TP.HCM','Việt Nam','700000',true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

