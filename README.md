# Achromatic Fashion E-Commerce Platform

> Minimalist fashion e-commerce platform với thiết kế monochrome tinh tế, xây dựng trên Next.js 16 và NestJS.

![Status](https://img.shields.io/badge/Status-MVP%20Ready-success)
![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-black)
![Backend](https://img.shields.io/badge/Backend-NestJS%2011-red)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)

---

## 📋 Tổng Quan

**Achromatic** là một nền tảng thương mại điện tử full-stack chuyên về thời trang tối giản (minimalist fashion). Dự án được xây dựng với công nghệ hiện đại nhất và kiến trúc enterprise-level, sẵn sàng cho production.

### ✨ Tính Năng Chính

#### 🛍️ Shopping Experience
- Duyệt sản phẩm với bộ lọc nâng cao (category, price, size, color, brand)
- Chi tiết sản phẩm với gallery ảnh, variant selection (màu, size)
- Giỏ hàng real-time với drawer sidebar
- Checkout flow đầy đủ với multiple payment methods
- Product recommendations & related items

#### 👤 User Account
- Đăng ký & đăng nhập với JWT authentication
- Profile management
- Order history & tracking
- Wishlist functionality
- Secure password handling (bcrypt)

#### 🎨 Design System
- Minimalist monochrome aesthetic
- Responsive design (mobile-first)
- Smooth animations & transitions
- Clean typography
- shadcn/ui components

#### 🔐 Security & Performance
- JWT + Refresh token authentication
- Rate limiting & throttling
- CORS configuration
- API response caching
- Image optimization ready

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.2 (App Router, React 19)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4
- **State Management**: Zustand (với persist)
- **Data Fetching**: Axios + React Query ready
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16
- **ORM**: Prisma 7 (với pg adapter)
- **Authentication**: Passport (JWT + Local)
- **Validation**: class-validator, class-transformer
- **Upload**: Cloudinary
- **API Docs**: Swagger/OpenAPI

### DevOps
- **Package Manager**: npm
- **Version Control**: Git
- **Environment**: Node.js 20+

---

## 📁 Cấu Trúc Dự Án

```
web-fashion/
├── backend/                # NestJS Backend
│   ├── src/
│   │   ├── common/        # Shared utilities
│   │   ├── config/        # Configuration
│   │   ├── database/      # Prisma setup
│   │   └── modules/       # Feature modules (26 modules)
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   └── package.json
│
├── frontend/              # Next.js Frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & types
│   │   ├── providers/    # Context providers
│   │   └── store/        # Zustand stores
│   └── package.json
│
├── HUONG_DAN_CHAY_DU_AN.md # Hướng dẫn cài đặt và chạy local
├── TASKS.md               # Task checklist
├── TODO_GRADUATION.md     # Kế hoạch hoàn thiện đồ án
└── README.md              # Tổng quan dự án
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- PostgreSQL 15+ hoặc Docker Desktop
- npm hoặc yarn

### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd web-fashion
```

### 2️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Tạo backend/.env theo hướng dẫn chạy dự án

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run start:dev
```

Backend sẽ chạy tại: **http://localhost:3001/api**  
Swagger docs: **http://localhost:3001/api/docs**

### 3️⃣ Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Tạo frontend/.env.local với NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Start development server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

Xem cấu hình môi trường, database và xử lý lỗi chi tiết tại
[HUONG_DAN_CHAY_DU_AN.md](./HUONG_DAN_CHAY_DU_AN.md).

---

## 🗄️ Database

### Schema Overview
40+ models bao gồm:
- **Auth**: User, Permission, UserRolePermission
- **Catalog**: Product, Category, Brand, Collection
- **Variants**: ProductVariant, ProductColor, ProductSize
- **Cart & Orders**: Cart, Order, OrderItem, Payment
- **Content**: Blog, Banner, Review
- **System**: AuditLog, Settings, Notification

### Test Accounts
```
Admin:    admin@achromatic.vn / Admin@123
Customer: minh.nguyen@achromatic.vn / Customer@123
Customer: linh.tran@achromatic.vn / Customer@123
```

---

## 📚 API Documentation

API documentation có sẵn tại Swagger UI:
```
http://localhost:3001/api/docs
```

### Main Endpoints
- `GET /api/products` - List products với filters
- `GET /api/products/:slug` - Chi tiết sản phẩm
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/orders` - Tạo đơn hàng

Xem full documentation tại Swagger.

---

## 🎯 Roadmap

Xem file [TASKS.md](./TASKS.md) để biết chi tiết roadmap.

### Phase 1: MVP ✅ COMPLETED
- [x] Core pages & components
- [x] Authentication system
- [x] Shopping cart & checkout
- [x] Product catalog với filters

### Phase 2: UX Improvements 🎯 NEXT
- [ ] Toast notifications
- [ ] Loading states & skeletons
- [ ] Error handling improvements

### Phase 3: Advanced Features
- [ ] Search functionality
- [ ] Review system
- [ ] Order tracking
- [ ] Admin panel

### Phase 4: Production
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Deployment setup

---

## 🤝 Contributing

Dự án hiện đang trong giai đoạn MVP. Contributions welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

Nếu gặp vấn đề hoặc có câu hỏi, vui lòng tạo issue trên GitHub.

---

**Built with ❤️ using Next.js & NestJS**
