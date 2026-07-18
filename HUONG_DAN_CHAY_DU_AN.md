# Hướng Dẫn Chạy Dự Án Achromatic

Tài liệu này hướng dẫn chạy toàn bộ hệ thống ở môi trường local trên Windows, macOS hoặc Linux. Dự án gồm:

- `frontend/`: Next.js, chạy mặc định tại `http://localhost:3000`
- `backend/`: NestJS, chạy mặc định tại `http://localhost:3001/api`
- PostgreSQL: chạy bằng Docker Compose tại `localhost:5433`

## 1. Yêu cầu

Cài đặt trước:

- Node.js 20 trở lên
- npm (đi kèm Node.js)
- Docker Desktop có Docker Compose
- Git

Kiểm tra phiên bản:

```bash
node --version
npm --version
docker --version
docker compose version
```

## 2. Lấy mã nguồn và cài dependencies

```bash
git clone <repository-url>
cd web-fashion
```

Cài dependencies cho cả hai ứng dụng:

```bash
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## 3. Khởi động PostgreSQL

Từ thư mục gốc `web-fashion`:

```bash
docker compose up -d postgres
docker compose ps
```

Cấu hình mặc định trong `docker-compose.yml`:

| Thuộc tính | Giá trị |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `achromatic_db` |
| User | `postgres` |
| Password | `password` |

> Cổng phía máy local là `5433`, không phải cổng PostgreSQL mặc định `5432`.

## 4. Cấu hình backend

Tạo file `backend/.env` với nội dung sau. Hãy thay hai JWT secret bằng chuỗi dài, ngẫu nhiên khi dùng ngoài môi trường local.

```dotenv
NODE_ENV=development
PORT=3001
API_PREFIX=api
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:password@localhost:5433/achromatic_db?schema=public

JWT_SECRET=local-access-secret-change-me
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=local-refresh-secret-change-me
JWT_REFRESH_EXPIRES_IN=7d

# Tùy chọn: bỏ kiểm tra URL ảnh khi seed nếu máy không có mạng ổn định
SKIP_IMAGE_CHECK=true

# Tùy chọn: chỉ cần khi thử chức năng upload ảnh
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Tạo Prisma Client, áp dụng migration và seed dữ liệu:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Khởi động backend:

```bash
npm run start:dev
```

Khi thành công:

- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api/docs`
- Danh sách sản phẩm: `http://localhost:3001/api/products`

## 5. Cấu hình frontend

Mở terminal khác, tạo file `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Khởi động frontend:

```bash
cd frontend
npm run dev
```

Mở `http://localhost:3000` trên trình duyệt.

## 6. Tài khoản mẫu

Sau khi chạy `npm run prisma:seed`, có thể dùng:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@achromatic.vn` | `Admin@123` |
| Khách hàng | `minh.nguyen@achromatic.vn` | `Customer@123` |
| Khách hàng | `linh.tran@achromatic.vn` | `Customer@123` |

Các tài khoản này chỉ dành cho phát triển và demo local.

## 7. Quy trình chạy hằng ngày

Từ thư mục gốc, bảo đảm database đang chạy:

```bash
docker compose up -d postgres
```

Terminal 1:

```bash
cd backend
npm run start:dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Khi kết thúc, dừng database bằng:

```bash
docker compose down
```

Lệnh trên giữ nguyên dữ liệu trong Docker volume `pgdata`. Chỉ xóa volume khi bạn chủ động muốn xóa toàn bộ dữ liệu.

## 8. Kiểm tra trước khi demo

Chạy kiểm tra tĩnh và build:

```bash
cd backend
npm run build
npm test -- --runInBand
npm run test:cov -- --runInBand
npm run test:e2e -- --runInBand

cd ../frontend
npm run lint
npm test -- --runInBand
npm run test:coverage -- --runInBand
npm run build
npm run test:e2e
```

Lần đầu chạy Playwright trên một máy mới, cài trình duyệt test bằng
`npx playwright install chromium` trong thư mục `frontend`. Luồng E2E dùng mock
API riêng nên không phụ thuộc dữ liệu seed trong PostgreSQL.

Kiểm tra nhanh API bằng PowerShell từ thư mục gốc:

```powershell
Invoke-RestMethod http://localhost:3001/api/products
```

Hoặc chạy script có sẵn:

```powershell
.\test-api.ps1
```

## 9. Xử lý lỗi thường gặp

### Backend báo thiếu biến môi trường

Kiểm tra file nằm đúng tại `backend/.env` và có đủ `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.

### Không kết nối được database

```bash
docker compose ps
docker compose logs postgres
```

Kiểm tra `DATABASE_URL` dùng cổng `5433`. Nếu đã có dịch vụ khác chiếm cổng này, đổi phần bên trái của mapping port trong `docker-compose.yml` và cập nhật `DATABASE_URL` tương ứng.

### Frontend không lấy được sản phẩm

- Kiểm tra backend đang chạy tại `http://localhost:3001/api/products`.
- Kiểm tra `frontend/.env.local` dùng đúng `NEXT_PUBLIC_API_URL`.
- Khởi động lại `npm run dev` sau khi sửa file môi trường.
- Không thêm `/v1` vào URL; backend hiện dùng các route `/api/...`.

### Migration hoặc Prisma Client lỗi

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

Đảm bảo container PostgreSQL đã ở trạng thái running trước khi chạy các lệnh này.
