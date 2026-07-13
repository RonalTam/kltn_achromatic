# 📋 TODO — Hoàn Thiện Đồ Án Tốt Nghiệp Achromatic

> **Cập nhật**: 13/07/2026  
> **Tổng thời gian ước tính**: 10–15 ngày  
> **Trạng thái**: Phase 0 ✅ → Tiếp theo: Phase 1

---

## ═══════════════════════════════════════════════
## PHASE 0: DỌN DẸP NHANH (30 phút)
## ═══════════════════════════════════════════════

### 0.1 Xóa legacy code bỏ hoang
- [x] Xóa thư mục `server/` (Express.js prototype cũ — không dùng)
- [x] Xóa thư mục `client/` (Vite React prototype cũ — không dùng)
- [x] Xóa thư mục `tmp/` nếu có chứa file tạm
- [x] Cập nhật `.gitignore`

### 0.2 Sửa documentation
- [x] Điền nội dung vào `HUONG_DAN_CHAY_DU_AN.md`
- [x] Sửa README.md: API route ghi `/api/v1/products` nhưng backend thực tế dùng `/api/products`
- [x] Xóa bớt các file status thừa (FIXES_APPLIED.md, SESSION_SUMMARY.md...) — chỉ giữ README + TASKS

---

## ═══════════════════════════════════════════════
## PHASE 1: TOAST + LOADING + ERROR HANDLING (1–2 ngày)
## ═══════════════════════════════════════════════

### 1.1 Toast Notifications
- [ ] Cài đặt `sonner` hoặc `react-hot-toast`
- [ ] Thêm `<Toaster />` vào `frontend/src/app/layout.tsx`
- [ ] Toast thành công: thêm giỏ hàng
- [ ] Toast thành công: login / register
- [ ] Toast thành công: đặt hàng
- [ ] Toast thành công: cập nhật profile
- [ ] Toast lỗi: khi API call thất bại
- [ ] Toast info: thêm vào wishlist

### 1.2 Loading States
- [ ] Tạo component `SkeletonProductCard` — skeleton loader cho product grid
- [ ] Tạo component `SkeletonProductDetail` — skeleton cho trang chi tiết
- [ ] Loading spinner cho buttons khi đang submit (login, register, checkout)
- [ ] Suspense boundary cho trang `/collections`
- [ ] Suspense boundary cho trang `/products/[slug]`
- [ ] Lazy loading cho images (kiểm tra dùng `next/image` thay `<img>`)

### 1.3 Error Handling
- [ ] Tạo `frontend/src/app/not-found.tsx` — trang 404 với thiết kế đẹp
- [ ] Tạo `frontend/src/app/error.tsx` — trang lỗi chung
- [ ] Tạo `frontend/src/app/global-error.tsx` — Global Error Boundary
- [ ] Hiển thị lỗi validation rõ ràng trong form login/register
- [ ] Thêm retry button khi API call thất bại

---

## ═══════════════════════════════════════════════
## PHASE 2: CHỨC NĂNG TÌM KIẾM (1 ngày)
## ═══════════════════════════════════════════════

### 2.1 Backend
- [ ] Kiểm tra/bổ sung API `GET /api/products?search=keyword` hỗ trợ tìm kiếm
- [ ] Full-text search trên fields: `name`, `description`, `sku`
- [ ] API trả về `highlights` hoặc `matchCount`

### 2.2 Frontend
- [ ] Thêm Search bar vào `frontend/src/components/layout/Header.tsx`
- [ ] Search modal/overlay khi click vào icon tìm kiếm
- [ ] Tạo trang `/search?q=...` hiển thị kết quả
- [ ] Debounce input (300ms)
- [ ] Hiển thị "Không tìm thấy kết quả" khi rỗng
- [ ] (Nice to have) Search suggestions dropdown
- [ ] (Nice to have) Recent searches từ localStorage

---

## ═══════════════════════════════════════════════
## PHASE 3: TÁCH ADMIN DASHBOARD (1–2 ngày)
## ═══════════════════════════════════════════════

> Hiện tại: `frontend/src/app/admin/page.tsx` = 1807 dòng / 100KB (anti-pattern)

### 3.1 Cấu trúc mới
- [ ] Tạo `admin/layout.tsx` — sidebar + header chung
- [ ] Tạo `admin/page.tsx` (Dashboard) — thống kê tổng quan
- [ ] Tạo `admin/products/page.tsx` — CRUD sản phẩm
- [ ] Tạo `admin/orders/page.tsx` — quản lý đơn hàng
- [ ] Tạo `admin/customers/page.tsx` — quản lý khách hàng
- [ ] Tạo `admin/categories/page.tsx` — quản lý danh mục
- [ ] Tạo `admin/coupons/page.tsx` — quản lý mã giảm giá
- [ ] Tạo `admin/banners/page.tsx` — quản lý banner
- [ ] Tạo `admin/settings/page.tsx` — cài đặt hệ thống

### 3.2 Admin Components
- [ ] Tạo `components/admin/Sidebar.tsx`
- [ ] Tạo `components/admin/StatsCard.tsx`
- [ ] Tạo `components/admin/DataTable.tsx` (reusable)
- [ ] Tạo `components/admin/AdminHeader.tsx`
- [ ] (Nice to have) Charts với `recharts` hoặc `chart.js`

### 3.3 Bảo vệ Admin Routes
- [ ] Kiểm tra middleware bảo vệ route `/admin` (chỉ role ADMIN)
- [ ] Redirect về trang login nếu chưa xác thực
- [ ] Hiển thị 403 nếu không có quyền admin

---

## ═══════════════════════════════════════════════
## PHASE 4: VIẾT TESTS (2–3 ngày)
## ═══════════════════════════════════════════════

### 4.1 Backend Unit Tests (NestJS + Jest)
- [ ] Cài đặt test dependencies nếu chưa có (`@nestjs/testing`, `jest`)
- [ ] `auth.service.spec.ts` — test login, register, refresh token
- [ ] `products.service.spec.ts` — test CRUD products, search, filter
- [ ] `orders.service.spec.ts` — test tạo đơn, cập nhật trạng thái
- [ ] `cart.service.spec.ts` — test thêm/xóa/cập nhật giỏ hàng
- [ ] `users.service.spec.ts` — test CRUD users

### 4.2 Backend Integration Tests (API Endpoints)
- [ ] `auth.controller.spec.ts` — test POST /auth/login, /auth/register
- [ ] `products.controller.spec.ts` — test GET /products, GET /products/:slug
- [ ] `orders.controller.spec.ts` — test POST /orders, GET /orders
- [ ] Test authentication guards (unauthorized = 401)
- [ ] Test validation (invalid input = 400)

### 4.3 Frontend Tests (Jest + React Testing Library)
- [ ] Cài đặt `@testing-library/react`, `@testing-library/jest-dom`
- [ ] Test `ProductCard` — render đúng name, price, image
- [ ] Test `CartDrawer` — thêm/xóa items
- [ ] Test `FilterPanel` — apply/reset filters
- [ ] Test `auth-store` — login/logout state changes
- [ ] Test `cart-store` — add/remove/update items

### 4.4 E2E Test (optional — bonus lớn)
- [ ] Cài đặt Playwright hoặc Cypress
- [ ] Test flow: Browse → View Product → Add to Cart → Checkout

---

## ═══════════════════════════════════════════════
## PHASE 5: TÍNH NĂNG BỔ SUNG (2–3 ngày)
## ═══════════════════════════════════════════════

### 5.1 Wishlist đồng bộ Backend
- [ ] Kết nối `POST /api/wishlists` — thêm sản phẩm
- [ ] Kết nối `DELETE /api/wishlists/:id` — xóa sản phẩm
- [ ] Kết nối `GET /api/wishlists` — lấy danh sách
- [ ] Hiển thị badge count trên Header icon
- [ ] Nút "Chuyển vào giỏ hàng" từ Wishlist
- [ ] Toggle wishlist (heart icon) trên ProductCard

### 5.2 Review System
- [ ] Form viết review: star rating (1-5) + text + (optional) ảnh
- [ ] API `POST /api/reviews` — gửi review
- [ ] Validation: chỉ user đã mua sản phẩm mới được review
- [ ] Hiển thị average rating trên ProductCard
- [ ] Pagination reviews trên trang sản phẩm
- [ ] (Nice to have) "Helpful" vote cho review

### 5.3 Order Tracking chi tiết
- [ ] Tạo trang `/account/orders/[id]` — chi tiết đơn hàng
- [ ] Timeline trạng thái: Đặt → Xác nhận → Đang giao → Hoàn thành
- [ ] Nút "Hủy đơn hàng" (khi chưa giao)
- [ ] Nút "Đặt lại" (re-order)
- [ ] (Nice to have) Download hóa đơn PDF

---

## ═══════════════════════════════════════════════
## PHASE 6: SEO + RESPONSIVE (1 ngày)
## ═══════════════════════════════════════════════

### 6.1 SEO
- [ ] `generateMetadata()` cho trang `/products/[slug]` — dynamic title, description
- [ ] `generateMetadata()` cho trang `/collections` — theo bộ lọc
- [ ] Structured data JSON-LD cho sản phẩm (Google rich results)
- [ ] Tạo `frontend/src/app/sitemap.ts` — auto-generate sitemap.xml
- [ ] Tạo `frontend/src/app/robots.ts` — robots.txt
- [ ] Canonical URLs cho mỗi trang

### 6.2 Responsive & Mobile
- [ ] Test tất cả pages trên viewport 375px (iPhone SE)
- [ ] Test trên viewport 768px (iPad)
- [ ] Mobile filters drawer (thay sidebar)
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Sticky header on scroll (mobile)
- [ ] Mobile-optimized checkout form

---

## ═══════════════════════════════════════════════
## PHASE 7: NÂNG CAO — NẾU CÒN THỜI GIAN (2–3 ngày)
## ═══════════════════════════════════════════════

### 7.1 Email Notifications
- [ ] Cài `@nestjs-modules/mailer` + `nodemailer`
- [ ] Email xác nhận đơn hàng (order confirmation)
- [ ] Email chào mừng khi đăng ký (welcome email)
- [ ] Email đặt lại mật khẩu (reset password — endpoint có nhưng chưa gửi email)
- [ ] Template email HTML đẹp

### 7.2 Payment Integration
- [ ] Tích hợp VNPay hoặc MoMo sandbox
- [ ] Redirect flow thanh toán
- [ ] Webhook callback xác nhận thanh toán
- [ ] Cập nhật trạng thái đơn hàng sau thanh toán

### 7.3 Performance
- [ ] Chuyển tất cả `<img>` sang `next/image` (auto optimization)
- [ ] Bundle analyzer: `npm run build -- --analyze`
- [ ] Lazy load components không cần thiết (below the fold)
- [ ] API response caching (headers hoặc Redis)
- [ ] Database query optimization (Prisma `select`, `include` chỉ field cần)

### 7.4 Monitoring & Production
- [ ] Error tracking: Sentry (free tier)
- [ ] Health check endpoint: `GET /api/health`
- [ ] Environment variables cho production
- [ ] Docker Compose hoàn chỉnh (frontend + backend + db)
- [ ] CI/CD pipeline (GitHub Actions)

### 7.5 Accessibility
- [ ] ARIA labels cho tất cả interactive elements
- [ ] Keyboard navigation (Tab order)
- [ ] Focus indicators rõ ràng
- [ ] Alt text cho tất cả images
- [ ] Color contrast check (WCAG AA)

### 7.6 Tính năng thêm
- [ ] Product Quick View modal (xem nhanh không cần vào trang chi tiết)
- [ ] Recently Viewed Products (lưu localStorage)
- [ ] Product Recommendations ("Sản phẩm liên quan")
- [ ] Color swatch hover preview
- [ ] Newsletter subscription (backend + frontend)
- [ ] Coupon code input tại checkout
- [ ] Social media share buttons
- [ ] FAQ page nội dung chi tiết
- [ ] Live chat widget (Tawk.to free)

---

## 📊 Tiến Độ Tổng Quan

| Phase | Nội dung | Thời gian | Trạng thái |
|-------|---------|-----------|------------|
| Phase 0 | Dọn dẹp + sửa docs | 30 phút | ✅ Hoàn thành |
| Phase 1 | Toast + Loading + Error | 1–2 ngày | ⬜ Chưa bắt đầu |
| Phase 2 | Search | 1 ngày | ⬜ Chưa bắt đầu |
| Phase 3 | Tách Admin | 1–2 ngày | ⬜ Chưa bắt đầu |
| Phase 4 | Tests | 2–3 ngày | ⬜ Chưa bắt đầu |
| Phase 5 | Wishlist + Reviews + Orders | 2–3 ngày | ⬜ Chưa bắt đầu |
| Phase 6 | SEO + Responsive | 1 ngày | ⬜ Chưa bắt đầu |
| Phase 7 | Nâng cao (bonus) | 2–3 ngày | ⬜ Optional |

---

## 🎯 Mẹo Bảo Vệ Đồ Án

### Câu hỏi hay gặp & cách chuẩn bị:
1. **"Em test project thế nào?"** → Hoàn thành Phase 4 (tests)
2. **"Tìm kiếm sản phẩm hoạt động ra sao?"** → Hoàn thành Phase 2
3. **"Thanh toán tích hợp với cổng nào?"** → Phase 7.2 hoặc giải thích là sandbox
4. **"Kiến trúc hệ thống?"** → Vẽ sơ đồ: Client ↔ Next.js ↔ NestJS ↔ PostgreSQL
5. **"Tại sao chọn tech stack này?"** → Chuẩn bị so sánh với alternatives
6. **"Bảo mật xử lý thế nào?"** → JWT + httpOnly cookies + bcrypt + Rate limiting + Helmet

### Demo flow gợi ý (5–10 phút):
1. Trang chủ → Duyệt sản phẩm
2. Lọc/tìm kiếm sản phẩm
3. Xem chi tiết → Chọn size/màu → Thêm giỏ hàng
4. Giỏ hàng → Checkout
5. Đăng nhập/Đăng ký
6. Quản lý tài khoản → Lịch sử đơn hàng
7. (Nếu có) Admin dashboard → Quản lý sản phẩm/đơn hàng
8. Show Swagger API docs

---

**Ghi chú**: Đánh dấu `[x]` khi hoàn thành mỗi task. Chạy `git commit` sau mỗi phase.

**Last Updated**: 13/07/2026
