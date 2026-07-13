--
-- PostgreSQL database dump
--

\restrict EcrBZ0eFxdd6mhzmK7dQhJ4aVlF8qXrygYqgqiFQqeDEZyHfNMpdgWEzLjgayYm

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-06-18 23:12:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 922 (class 1247 OID 16510)
-- Name: BannerPosition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BannerPosition" AS ENUM (
    'HERO',
    'CATEGORY',
    'SIDEBAR',
    'POPUP'
);


ALTER TYPE public."BannerPosition" OWNER TO postgres;

--
-- TOC entry 919 (class 1247 OID 16502)
-- Name: BlogStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BlogStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."BlogStatus" OWNER TO postgres;

--
-- TOC entry 916 (class 1247 OID 16494)
-- Name: CouponType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."CouponType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT',
    'FREE_SHIPPING'
);


ALTER TYPE public."CouponType" OWNER TO postgres;

--
-- TOC entry 898 (class 1247 OID 16418)
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'UNISEX'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- TOC entry 913 (class 1247 OID 16480)
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER_UPDATE',
    'PAYMENT_UPDATE',
    'PROMOTION',
    'REVIEW_REPLY',
    'SYSTEM',
    'WISHLIST_BACK_IN_STOCK'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- TOC entry 901 (class 1247 OID 16426)
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPING',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- TOC entry 907 (class 1247 OID 16458)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'COD',
    'BANK_TRANSFER',
    'VNPAY',
    'MOMO',
    'STRIPE'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- TOC entry 904 (class 1247 OID 16444)
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'REFUNDED',
    'CANCELLED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- TOC entry 895 (class 1247 OID 16407)
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'MANAGER',
    'CUSTOMER',
    'GUEST'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- TOC entry 910 (class 1247 OID 16470)
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransactionType" AS ENUM (
    'IN',
    'OUT',
    'ADJUSTMENT',
    'RETURN'
);


ALTER TYPE public."TransactionType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16392)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 17117)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    entity text NOT NULL,
    "entityId" text,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16990)
-- Name: banners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banners (
    id text NOT NULL,
    title text NOT NULL,
    subtitle text,
    "imageUrl" text NOT NULL,
    "mobileImageUrl" text,
    "linkUrl" text,
    "linkText" text,
    "position" public."BannerPosition" DEFAULT 'HERO'::public."BannerPosition" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "startsAt" timestamp(3) without time zone,
    "endsAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.banners OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 17039)
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.blog_categories OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 17079)
-- Name: blog_tag_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_tag_relations (
    "blogId" text NOT NULL,
    "tagId" text NOT NULL
);


ALTER TABLE public.blog_tag_relations OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 17051)
-- Name: blog_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_tags (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public.blog_tags OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 17061)
-- Name: blogs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blogs (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    "coverImageUrl" text,
    "categoryId" text,
    "authorId" text,
    "authorName" text,
    status public."BlogStatus" DEFAULT 'DRAFT'::public."BlogStatus" NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.blogs OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16620)
-- Name: brands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.brands (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "logoUrl" text,
    description text,
    website text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.brands OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16777)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    quantity integer DEFAULT 1 NOT NULL,
    "savedForLater" boolean DEFAULT false NOT NULL,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16766)
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id text NOT NULL,
    "userId" text,
    "sessionId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16585)
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 17028)
-- Name: collection_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collection_products (
    "collectionId" text NOT NULL,
    "productId" text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.collection_products OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 17009)
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collections (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.collections OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16923)
-- Name: coupon_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_usage (
    id text NOT NULL,
    "couponId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    "usedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.coupon_usage OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16902)
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    type public."CouponType" NOT NULL,
    value numeric(12,2) NOT NULL,
    "minOrderAmount" numeric(12,2),
    "maxDiscount" numeric(12,2),
    "usageLimit" integer,
    "usagePerUser" integer DEFAULT 1 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "startsAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "applicableCategories" text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16735)
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    quantity integer DEFAULT 0 NOT NULL,
    reserved integer DEFAULT 0 NOT NULL,
    threshold integer DEFAULT 5 NOT NULL,
    location text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16751)
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transactions (
    id text NOT NULL,
    "inventoryId" text NOT NULL,
    type public."TransactionType" NOT NULL,
    quantity integer NOT NULL,
    "previousQty" integer NOT NULL,
    "newQty" integer NOT NULL,
    reason text,
    reference text,
    "performedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_transactions OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 17088)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    "isRead" boolean DEFAULT false NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16817)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "variantId" text,
    "productName" text NOT NULL,
    "variantName" text,
    sku text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    "imageUrl" text
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16832)
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    id text NOT NULL,
    "orderId" text NOT NULL,
    status public."OrderStatus" NOT NULL,
    note text,
    "changedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16793)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "userId" text NOT NULL,
    "addressId" text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "shippingFee" numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    tax numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) NOT NULL,
    "couponId" text,
    "couponCode" text,
    notes text,
    "shippingMethodId" text,
    "trackingNumber" text,
    "estimatedDelivery" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "cancelledAt" timestamp(3) without time zone,
    "cancelReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 16862)
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id text NOT NULL,
    "paymentId" text NOT NULL,
    type text NOT NULL,
    status public."PaymentStatus" NOT NULL,
    amount numeric(12,2) NOT NULL,
    "gatewayRef" text,
    "gatewayResponse" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16844)
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "orderId" text NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'VND'::text NOT NULL,
    "transactionRef" text,
    "paidAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16540)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    action text NOT NULL,
    subject text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16686)
-- Name: product_colors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_colors (
    id text NOT NULL,
    name text NOT NULL,
    "hexCode" text NOT NULL,
    "imageUrl" text
);


ALTER TABLE public.product_colors OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16670)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    id text NOT NULL,
    "productId" text NOT NULL,
    url text NOT NULL,
    "altText" text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16696)
-- Name: product_sizes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_sizes (
    id text NOT NULL,
    name text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    description text
);


ALTER TABLE public.product_sizes OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 16722)
-- Name: product_specifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_specifications (
    id text NOT NULL,
    "productId" text NOT NULL,
    label text NOT NULL,
    value text NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_specifications OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16707)
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    "colorId" text,
    "sizeId" text,
    sku text NOT NULL,
    price numeric(12,2),
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16635)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    sku text NOT NULL,
    description text NOT NULL,
    "shortDescription" text,
    "categoryId" text NOT NULL,
    "subCategoryId" text,
    "brandId" text,
    gender public."Gender" DEFAULT 'MALE'::public."Gender" NOT NULL,
    material text,
    "careInstructions" text,
    "basePrice" numeric(12,2) NOT NULL,
    "comparePrice" numeric(12,2),
    "isFeatured" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isNewArrival" boolean DEFAULT false NOT NULL,
    "isBestSeller" boolean DEFAULT false NOT NULL,
    "soldCount" integer DEFAULT 0 NOT NULL,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "avgRating" numeric(3,2) DEFAULT 0 NOT NULL,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    weight numeric(8,2),
    tags text[],
    "metaTitle" text,
    "metaDescription" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 16956)
-- Name: review_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_images (
    id text NOT NULL,
    "reviewId" text NOT NULL,
    url text NOT NULL,
    "altText" text
);


ALTER TABLE public.review_images OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16935)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "productId" text NOT NULL,
    "userId" text NOT NULL,
    "orderId" text,
    rating integer NOT NULL,
    title text,
    body text NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "helpfulCount" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 17104)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    type text DEFAULT 'string'::text NOT NULL,
    "group" text,
    label text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16876)
-- Name: shipping_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_methods (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "basePrice" numeric(12,2) NOT NULL,
    "freeThreshold" numeric(12,2),
    "estimatedDays" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.shipping_methods OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 16892)
-- Name: shipping_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_tracking (
    id text NOT NULL,
    "orderId" text NOT NULL,
    carrier text,
    "trackingNumber" text,
    "trackingUrl" text,
    status text,
    events jsonb,
    "estimatedDelivery" timestamp(3) without time zone,
    "deliveredAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shipping_tracking OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16602)
-- Name: sub_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_categories (
    id text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sub_categories OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16564)
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    "fullName" text NOT NULL,
    phone text NOT NULL,
    "addressLine1" text NOT NULL,
    "addressLine2" text,
    ward text,
    district text NOT NULL,
    province text NOT NULL,
    country text DEFAULT 'Vietnam'::text NOT NULL,
    "postalCode" text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_addresses OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16552)
-- Name: user_role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_role_permissions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "permissionId" text NOT NULL,
    "grantedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "grantedBy" text
);


ALTER TABLE public.user_role_permissions OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16519)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    "avatarUrl" text,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "verifyToken" text,
    "resetToken" text,
    "resetTokenExp" timestamp(3) without time zone,
    "refreshToken" text,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 16978)
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_items (
    id text NOT NULL,
    "wishlistId" text NOT NULL,
    "productId" text NOT NULL,
    "addedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wishlist_items OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16966)
-- Name: wishlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlists (
    id text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.wishlists OWNER TO postgres;

--
-- TOC entry 5482 (class 0 OID 16392)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c561b7cc-a67e-4f48-b696-21d3a7e65a87	623ea2406ccab225c43c44096ad854e85ddef1879c08975a14418793a4d0ae1b	2026-06-17 19:05:50.331239+07	20260617120550_init	\N	\N	2026-06-17 19:05:50.025956+07	1
\.


--
-- TOC entry 5522 (class 0 OID 17117)
-- Dependencies: 259
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userId", action, entity, "entityId", "oldData", "newData", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- TOC entry 5513 (class 0 OID 16990)
-- Dependencies: 250
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.banners (id, title, subtitle, "imageUrl", "mobileImageUrl", "linkUrl", "linkText", "position", "isActive", "sortOrder", "startsAt", "endsAt", "createdAt", "updatedAt") FROM stdin;
cmqi1lpf900no54oxfjz4p2vt	The New Essentials	Minimalism Perfected — Collection 2025	https://lh3.googleusercontent.com/aida-public/AB6AXuCwinWefsbd4mkBJWI2YoP7qMErmOk1QwZIOYMQzdw9h3QcvlJzWfffOJn5OnR3dLYwnaWQGkU8C4BiKKGnkYU6sHR9kXJGjUQAokfGk2PCdhkxaSjnYl6XH7inzcjqh1g3Gl05bEMx_UjB2a-XAu6FTyq-FCbh8h65CF7e2-T51Q2D9XM9x2jyNpa0I3gv0w_qbF2NMf6puyNORUFy41e-8wlGrSKJdzOlGzxoRvbAIbVENWtNIfBOmM6T_Kv4M6Ephf_K7ce_44oE	\N	/collections?newArrival=true	Shop New Arrivals	HERO	t	1	\N	\N	2026-06-17 12:23:54.357	2026-06-17 12:23:54.357
cmqi1lpf900np54oxzjx5c9z7	The Outerwear Edit	Precision Outerwear for the Modern Wardrobe	https://lh3.googleusercontent.com/aida-public/AB6AXuDImdqpgfEHItpn3Fr3nXVhnQhcaKyzhwxi2XIB8bOWl9KyNipTTADbjmZtiKi87lX9gOll0688PhmWZvZS1Yv9-gc-YKLPhy-OMfPo4PORy8BEkflLvHVRnhKFRDdohYept57eQ8BGPFHMdfAMWfa61GCwIW44cfuZcy1dfR0peNg-2vBi72hsoh1RYn6ffvbKtb5aLqOdXtuHTSmix3DfvpcJGaX69cWiEzekyGrek_Dw4NPcg_b1wvuGU0Hsm87PblSYbIsX_1s5	\N	/collections?category=outerwear	Explore Outerwear	HERO	t	2	\N	\N	2026-06-17 12:23:54.357	2026-06-17 12:23:54.357
cmqi1lpf900nq54ox1owtxkb6	The Capsule Collection	Timeless pieces that transcend seasons	https://lh3.googleusercontent.com/aida-public/AB6AXuDP1anC6E8bADE4kNSa-eA2Ohl9P7ucnAda1f9HrKrUp2jN2U-fyJIUywHz3628rLhhDSitzD5bYek5OGeqOCFgy5bxgeZ6-QF7tzJsB6a7lvJzDRzUX1tDP7jItsVl5qS_rrxnFGrBJHnT-JFxrqpb8ZDuPOkr5ZukmNqQWdBDJ-0GD4mWn4VaFJ6ZLScLWhKePO-9tIpNpJ-xnYJtMpmeb8k4rc-ByBFHPSW0Ki2ELtj8ICfrbY2Q_bAOGyAB0baMmPh4tfHUL7EK	\N	/collections	View Collection	HERO	t	3	\N	\N	2026-06-17 12:23:54.357	2026-06-17 12:23:54.357
\.


--
-- TOC entry 5516 (class 0 OID 17039)
-- Dependencies: 253
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_categories (id, name, slug, "createdAt") FROM stdin;
cmqi1lpfh00nu54oxhq11wj6l	Style Guide	style-guide	2026-06-17 12:23:54.365
cmqi1lpfi00nv54oxurnfyp8m	Brand Stories	brand-stories	2026-06-17 12:23:54.366
cmqi1lpfk00nw54oxug0lszq7	Sustainability	sustainability	2026-06-17 12:23:54.368
\.


--
-- TOC entry 5519 (class 0 OID 17079)
-- Dependencies: 256
-- Data for Name: blog_tag_relations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_tag_relations ("blogId", "tagId") FROM stdin;
\.


--
-- TOC entry 5517 (class 0 OID 17051)
-- Dependencies: 254
-- Data for Name: blog_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_tags (id, name, slug) FROM stdin;
\.


--
-- TOC entry 5518 (class 0 OID 17061)
-- Dependencies: 255
-- Data for Name: blogs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blogs (id, title, slug, excerpt, content, "coverImageUrl", "categoryId", "authorId", "authorName", status, "viewCount", "metaTitle", "metaDescription", "publishedAt", "createdAt", "updatedAt") FROM stdin;
cmqi1lpfm00nx54oxblmkckin	The Art of Minimalist Dressing	art-of-minimalist-dressing	How to build a capsule wardrobe that transcends seasons.	# The Art of Minimalist Dressing\n\nBuilding a wardrobe that stands the test of time requires discipline and quality over quantity.\n\n## The Foundation Pieces\n\nEvery minimalist wardrobe starts with five essential pieces: a perfect white tee, a structured button-down, tailored trousers, a versatile outerwear piece, and one statement accessory.\n\n## The Color Palette\n\nRestrict yourself to 5 colors maximum. Black, white, grey, navy, and one accent tone.	https://lh3.googleusercontent.com/aida-public/AB6AXuDDQ6zDI1XJ01-aXSYF3b8izNNxpLcaqsV2sqM0pyB0h82opNP6KaY5HUmQl_r9D5zK9LJICQFTQKz_qt8aUC7DJn_0CdIg9LTG0yJcubnaWHexu13NNEsEVHdriCxf4VUYaxes79FZBLolOsKXFwLLoQN7yt7earkpNqclFD5Ba0skHLCvmMbwnmbMpZC2BLAmcooH_4A38FNJVkdoVr7s8m7Pm2lUuQen85i2LXCzROlEMoB26gfWmCY_GKDqg6yP1BMxQ5P1Up3z	cmqi1lpfh00nu54oxhq11wj6l	\N	Achromatic Editorial	PUBLISHED	0	The Art of Minimalist Dressing | Achromatic	How to build a capsule wardrobe that transcends seasons.	2026-06-17 12:23:54.368	2026-06-17 12:23:54.37	2026-06-17 12:23:54.37
\.


--
-- TOC entry 5489 (class 0 OID 16620)
-- Dependencies: 226
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.brands (id, name, slug, "logoUrl", description, website, "isActive", "createdAt", "updatedAt") FROM stdin;
cmqi1lofu000f54oxtr4urzwt	Achromatic	achromatic	\N	In-house luxury label. Precision without compromise.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000h54oxj32yqfqb	Void Collective	void-collective	\N	Avant-garde basics for the discerning wearer.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000j54ox7k85ga31	A.P.C.	apc	\N	Parisian minimalist since 1987.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000m54ox768wysqo	Our Legacy	our-legacy	\N	Stockholm's avant-garde heritage brand.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000g54oxvz7702yh	Monochrome Studio	monochrome-studio	\N	Modern minimalist essentials.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000l54oxnnrk5xyb	Uniqlo J	uniqlo-j	\N	Japanese precision, universal wardrobe.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000n54oxertvz999	Uniform	uniform	\N	Clean wardrobe architecture.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000i54oxruar3gev	Stone Island	stone-island	\N	Italian sportswear with technical innovation.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000k54ox0prklx1t	C.P. Company	cp-company	\N	Utilitarian luxury with functional design.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
cmqi1lofu000o54ox8htecvny	Marz	marz	\N	Street-to-luxury Vietnamese label.	\N	t	2026-06-17 12:23:53.082	2026-06-17 12:23:53.082
\.


--
-- TOC entry 5499 (class 0 OID 16777)
-- Dependencies: 236
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, "cartId", "productId", "variantId", quantity, "savedForLater", "addedAt") FROM stdin;
\.


--
-- TOC entry 5498 (class 0 OID 16766)
-- Dependencies: 235
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, "userId", "sessionId", "createdAt", "updatedAt") FROM stdin;
cmqi1lofn000a54oxdme9r7mk	cmqi1lofj000854ox77u02f43	\N	2026-06-17 12:23:53.075	2026-06-17 12:23:53.075
cmqi1lofo000b54oxjd4y8rhu	cmqi1lofl000954ox4fv58k0z	\N	2026-06-17 12:23:53.076	2026-06-17 12:23:53.076
\.


--
-- TOC entry 5487 (class 0 OID 16585)
-- Dependencies: 224
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, "imageUrl", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmqi1loiz000p54oxzd189ngg	Tops	tops	T-Shirts, Polos, Shirts and more	\N	t	1	2026-06-17 12:23:53.195	2026-06-17 12:23:53.195
cmqi1loiz000q54oxwayh36g8	Bottoms	bottoms	Trousers, Shorts, Denim	\N	t	2	2026-06-17 12:23:53.195	2026-06-17 12:23:53.195
cmqi1loiz000r54oxhaprjkql	Outerwear	outerwear	Jackets, Coats, Vests	\N	t	3	2026-06-17 12:23:53.195	2026-06-17 12:23:53.195
cmqi1loiz000s54oxgzcv4iwc	Accessories	accessories	Bags, Hats, Belts, Watches	\N	t	4	2026-06-17 12:23:53.195	2026-06-17 12:23:53.195
cmqi1loiz000t54oxm5t56ibd	Shoes	shoes	Sneakers, Boots, Loafers	\N	t	5	2026-06-17 12:23:53.195	2026-06-17 12:23:53.195
\.


--
-- TOC entry 5515 (class 0 OID 17028)
-- Dependencies: 252
-- Data for Name: collection_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collection_products ("collectionId", "productId", "sortOrder") FROM stdin;
\.


--
-- TOC entry 5514 (class 0 OID 17009)
-- Dependencies: 251
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collections (id, name, slug, description, "imageUrl", "isActive", "isFeatured", "sortOrder", "metaTitle", "metaDescription", "createdAt", "updatedAt") FROM stdin;
cmqi1lpfc00nr54oxsywixvas	The Essentials	the-essentials	Timeless pieces for the modern wardrobe	\N	t	t	1	\N	\N	2026-06-17 12:23:54.36	2026-06-17 12:23:54.36
cmqi1lpfe00ns54ox73xkzjdk	New Arrivals	new-arrivals	The latest additions to the Achromatic universe	\N	t	t	2	\N	\N	2026-06-17 12:23:54.362	2026-06-17 12:23:54.362
cmqi1lpfg00nt54oxrp98c19g	Sale	sale	Selected pieces at reduced prices	\N	t	f	3	\N	\N	2026-06-17 12:23:54.364	2026-06-17 12:23:54.364
\.


--
-- TOC entry 5508 (class 0 OID 16923)
-- Dependencies: 245
-- Data for Name: coupon_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_usage (id, "couponId", "userId", "orderId", "usedAt") FROM stdin;
\.


--
-- TOC entry 5507 (class 0 OID 16902)
-- Dependencies: 244
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, name, description, type, value, "minOrderAmount", "maxDiscount", "usageLimit", "usagePerUser", "usedCount", "isActive", "startsAt", "expiresAt", "applicableCategories", "createdAt", "updatedAt") FROM stdin;
cmqi1lpey00nl54oxc6t7bzde	WELCOME10	Welcome 10% Off	10% off your first order	PERCENTAGE	10.00	500000.00	200000.00	500	1	0	t	\N	2026-09-15 12:23:54.345	\N	2026-06-17 12:23:54.346	2026-06-17 12:23:54.346
cmqi1lpf100nm54ox8xsy5otm	FREESHIP	Free Standard Shipping	Free shipping on any order	FREE_SHIPPING	0.00	\N	\N	\N	2	0	t	\N	2026-07-17 12:23:54.347	\N	2026-06-17 12:23:54.349	2026-06-17 12:23:54.349
cmqi1lpf600nn54oxeo45k3jk	VIP200K	VIP 200,000 VND Off	200,000 VND off orders above 2,000,000 VND	FIXED_AMOUNT	200000.00	2000000.00	\N	100	1	0	t	\N	2026-08-16 12:23:54.352	\N	2026-06-17 12:23:54.354	2026-06-17 12:23:54.354
\.


--
-- TOC entry 5496 (class 0 OID 16735)
-- Dependencies: 233
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory (id, "productId", "variantId", quantity, reserved, threshold, location, "updatedAt") FROM stdin;
cmqi1lokl002754ox4fm3xz55	cmqi1lokb001z54ox3mcsmy1m	cmqi1loki002654oxfjwi5ph0	32	0	3	\N	2026-06-17 12:23:53.253
cmqi1loko002954oxi1td8c0h	cmqi1lokb001z54ox3mcsmy1m	cmqi1lokm002854oxzkmr3ky8	13	0	3	\N	2026-06-17 12:23:53.256
cmqi1lokr002b54oxdwxcsqwg	cmqi1lokb001z54ox3mcsmy1m	cmqi1lokp002a54ox4xwsnkh2	6	0	3	\N	2026-06-17 12:23:53.259
cmqi1lokt002d54oxdnf5pzgd	cmqi1lokb001z54ox3mcsmy1m	cmqi1loks002c54oxcg5hg5pl	11	0	3	\N	2026-06-17 12:23:53.261
cmqi1lokv002f54oxnxwsucmk	cmqi1lokb001z54ox3mcsmy1m	cmqi1loku002e54ox5uqbyrw7	5	0	3	\N	2026-06-17 12:23:53.263
cmqi1loky002h54oxls4qonsu	cmqi1lokb001z54ox3mcsmy1m	cmqi1lokx002g54oxkwn8voa1	32	0	3	\N	2026-06-17 12:23:53.266
cmqi1lokz002j54oxpi4x3ukv	cmqi1lokb001z54ox3mcsmy1m	cmqi1lokz002i54oxdk8vovwz	16	0	3	\N	2026-06-17 12:23:53.267
cmqi1lol0002l54oxctk5cg9f	cmqi1lokb001z54ox3mcsmy1m	cmqi1lol0002k54oxfwn0ylyg	17	0	3	\N	2026-06-17 12:23:53.268
cmqi1lol9002t54oxp8059it9	cmqi1lol4002m54ox0qw6gffy	cmqi1lol8002s54oxawte5sj2	13	0	3	\N	2026-06-17 12:23:53.277
cmqi1lolb002v54oxbw20cft8	cmqi1lol4002m54ox0qw6gffy	cmqi1lola002u54ox064w1tf8	28	0	3	\N	2026-06-17 12:23:53.279
cmqi1lolc002x54oxeshlvhwe	cmqi1lol4002m54ox0qw6gffy	cmqi1lolc002w54oxfawa5jwi	23	0	3	\N	2026-06-17 12:23:53.28
cmqi1lole002z54oxvmhzmtiv	cmqi1lol4002m54ox0qw6gffy	cmqi1lold002y54oxuma60jx7	21	0	3	\N	2026-06-17 12:23:53.282
cmqi1lolh003154oxicky8hsk	cmqi1lol4002m54ox0qw6gffy	cmqi1lolg003054ox6dqton7y	13	0	3	\N	2026-06-17 12:23:53.285
cmqi1loli003354ox8670uuig	cmqi1lol4002m54ox0qw6gffy	cmqi1lolh003254oxst08ob0r	31	0	3	\N	2026-06-17 12:23:53.286
cmqi1lolj003554oxbiud0gus	cmqi1lol4002m54ox0qw6gffy	cmqi1lolj003454ox3ena4e2j	34	0	3	\N	2026-06-17 12:23:53.287
cmqi1loll003754oxc6b4yl4u	cmqi1lol4002m54ox0qw6gffy	cmqi1lolk003654oxzorvmt53	16	0	3	\N	2026-06-17 12:23:53.289
cmqi1lolu003e54oxtxb41pg3	cmqi1lolp003854oxue2vyy5l	cmqi1lols003d54ox61gs0m32	18	0	3	\N	2026-06-17 12:23:53.298
cmqi1lolx003g54oxqvsqgh9n	cmqi1lolp003854oxue2vyy5l	cmqi1lolw003f54ox9f3oeadv	8	0	3	\N	2026-06-17 12:23:53.301
cmqi1lom1003i54ox4tu066x5	cmqi1lolp003854oxue2vyy5l	cmqi1lolz003h54ox7hx8ynwg	20	0	3	\N	2026-06-17 12:23:53.305
cmqi1lom3003k54ox5sodn4w6	cmqi1lolp003854oxue2vyy5l	cmqi1lom2003j54ox9s8ywfdg	33	0	3	\N	2026-06-17 12:23:53.307
cmqi1lom4003m54oxz12d2dqt	cmqi1lolp003854oxue2vyy5l	cmqi1lom4003l54oxipsw2fd3	22	0	3	\N	2026-06-17 12:23:53.308
cmqi1lom7003o54ox7rw7rhpi	cmqi1lolp003854oxue2vyy5l	cmqi1lom5003n54ox00aye6q5	25	0	3	\N	2026-06-17 12:23:53.311
cmqi1lom8003q54oxpsrt9iu3	cmqi1lolp003854oxue2vyy5l	cmqi1lom7003p54oxly12johl	33	0	3	\N	2026-06-17 12:23:53.312
cmqi1loma003s54oxon5bkarr	cmqi1lolp003854oxue2vyy5l	cmqi1lom9003r54ox8qfpr1ks	31	0	3	\N	2026-06-17 12:23:53.314
cmqi1lomc003u54oxdhs0psxi	cmqi1lolp003854oxue2vyy5l	cmqi1lomb003t54oxr6mrptle	29	0	3	\N	2026-06-17 12:23:53.316
cmqi1lome003w54oxhveyq98p	cmqi1lolp003854oxue2vyy5l	cmqi1lomc003v54oxixmrfzyp	30	0	3	\N	2026-06-17 12:23:53.318
cmqi1lomg003y54oxvzwssckz	cmqi1lolp003854oxue2vyy5l	cmqi1lomf003x54ox4ulidxcd	32	0	3	\N	2026-06-17 12:23:53.32
cmqi1lomi004054oxlulhqdl4	cmqi1lolp003854oxue2vyy5l	cmqi1lomh003z54ox9vh1msrt	23	0	3	\N	2026-06-17 12:23:53.322
cmqi1lomk004254oxexmgsa51	cmqi1lolp003854oxue2vyy5l	cmqi1lomj004154oxj7sr35wg	24	0	3	\N	2026-06-17 12:23:53.324
cmqi1loml004454ox0eun65bg	cmqi1lolp003854oxue2vyy5l	cmqi1lomk004354oxw6o4lykr	17	0	3	\N	2026-06-17 12:23:53.325
cmqi1lomm004654oxmdjwtua6	cmqi1lolp003854oxue2vyy5l	cmqi1lomm004554oxvgbpg4zj	27	0	3	\N	2026-06-17 12:23:53.326
cmqi1lomn004854oxc1781n99	cmqi1lolp003854oxue2vyy5l	cmqi1lomn004754oxsh81z2v1	30	0	3	\N	2026-06-17 12:23:53.327
cmqi1lomp004a54oxtrik72si	cmqi1lolp003854oxue2vyy5l	cmqi1lomo004954oxhu676see	20	0	3	\N	2026-06-17 12:23:53.329
cmqi1lomq004c54ox6d8lu4u1	cmqi1lolp003854oxue2vyy5l	cmqi1lomp004b54ox2xfvtv0u	14	0	3	\N	2026-06-17 12:23:53.33
cmqi1lon1004k54oxw7sj9q7s	cmqi1lomt004d54oxo1t1mrqf	cmqi1lomz004j54oxj6jxgv4d	11	0	3	\N	2026-06-17 12:23:53.341
cmqi1lon2004m54ox64evdakq	cmqi1lomt004d54oxo1t1mrqf	cmqi1lon1004l54oxm0miscw8	27	0	3	\N	2026-06-17 12:23:53.342
cmqi1lon4004o54oxproz2wwe	cmqi1lomt004d54oxo1t1mrqf	cmqi1lon3004n54oxq3dgs2sp	10	0	3	\N	2026-06-17 12:23:53.344
cmqi1lon9004q54oxnqhm0aku	cmqi1lomt004d54oxo1t1mrqf	cmqi1lon7004p54oxffq18i99	18	0	3	\N	2026-06-17 12:23:53.349
cmqi1lona004s54ox8gn4r54s	cmqi1lomt004d54oxo1t1mrqf	cmqi1lona004r54oxx60mx3il	18	0	3	\N	2026-06-17 12:23:53.35
cmqi1lonb004u54oxtxtq2sz4	cmqi1lomt004d54oxo1t1mrqf	cmqi1lonb004t54oxz8nfuo09	29	0	3	\N	2026-06-17 12:23:53.351
cmqi1lond004w54ox7css9h02	cmqi1lomt004d54oxo1t1mrqf	cmqi1lonc004v54ox3bzr05kr	25	0	3	\N	2026-06-17 12:23:53.353
cmqi1long004y54ox03mmpuuw	cmqi1lomt004d54oxo1t1mrqf	cmqi1lone004x54oxj61qu7qn	24	0	3	\N	2026-06-17 12:23:53.356
cmqi1loni005054oxwlihje6h	cmqi1lomt004d54oxo1t1mrqf	cmqi1lonh004z54ox6p08mzv0	12	0	3	\N	2026-06-17 12:23:53.358
cmqi1lonj005254oxohkdcrdv	cmqi1lomt004d54oxo1t1mrqf	cmqi1lonj005154oxu9w3anbb	10	0	3	\N	2026-06-17 12:23:53.359
cmqi1lons005a54oxnwyppqi0	cmqi1lonm005354oxfr014lxd	cmqi1lonq005954ox2p89g9z0	14	0	3	\N	2026-06-17 12:23:53.368
cmqi1lonu005c54oxm46ixkzk	cmqi1lonm005354oxfr014lxd	cmqi1lont005b54oxkn8lv58n	18	0	3	\N	2026-06-17 12:23:53.37
cmqi1lonw005e54oxyc4eyk64	cmqi1lonm005354oxfr014lxd	cmqi1lonv005d54oxlzurgrf9	17	0	3	\N	2026-06-17 12:23:53.372
cmqi1lonz005g54oxto5gw619	cmqi1lonm005354oxfr014lxd	cmqi1lony005f54oxtw1bbetg	8	0	3	\N	2026-06-17 12:23:53.375
cmqi1loo3005i54oxazyn43fo	cmqi1lonm005354oxfr014lxd	cmqi1loo1005h54oxahz26e6o	30	0	3	\N	2026-06-17 12:23:53.379
cmqi1loo7005k54ox0f5rqrwq	cmqi1lonm005354oxfr014lxd	cmqi1loo5005j54ox7myeeyyb	26	0	3	\N	2026-06-17 12:23:53.383
cmqi1loo9005m54oxv6gjw170	cmqi1lonm005354oxfr014lxd	cmqi1loo8005l54oxoyda51wd	29	0	3	\N	2026-06-17 12:23:53.385
cmqi1lood005o54oxh6y27zg7	cmqi1lonm005354oxfr014lxd	cmqi1looa005n54ox1knm8wlx	33	0	3	\N	2026-06-17 12:23:53.389
cmqi1looh005q54ox71i27380	cmqi1lonm005354oxfr014lxd	cmqi1loof005p54oxkkeeotqo	25	0	3	\N	2026-06-17 12:23:53.393
cmqi1lool005s54ox0a5pdbtk	cmqi1lonm005354oxfr014lxd	cmqi1look005r54ox2fr0qtx8	30	0	3	\N	2026-06-17 12:23:53.398
cmqi1looq005u54oxvsbqdr1l	cmqi1lonm005354oxfr014lxd	cmqi1loon005t54oxk9kejab9	18	0	3	\N	2026-06-17 12:23:53.402
cmqi1loox005w54ox87kcm672	cmqi1lonm005354oxfr014lxd	cmqi1loot005v54oxd6hpshzl	31	0	3	\N	2026-06-17 12:23:53.409
cmqi1lop2005y54oxtaus6x5u	cmqi1lonm005354oxfr014lxd	cmqi1lop0005x54ox1lazincc	6	0	3	\N	2026-06-17 12:23:53.414
cmqi1lop6006054ox6motmnrq	cmqi1lonm005354oxfr014lxd	cmqi1lop4005z54ox5l80nzxs	32	0	3	\N	2026-06-17 12:23:53.418
cmqi1lop9006254oxvlfq2hmk	cmqi1lonm005354oxfr014lxd	cmqi1lop7006154oxocdnxy86	5	0	3	\N	2026-06-17 12:23:53.421
cmqi1lopk006954ox04hito3r	cmqi1lope006354oxjw7fjoz0	cmqi1lopi006854ox2mjssa32	8	0	3	\N	2026-06-17 12:23:53.432
cmqi1lopo006b54oxajv6aegc	cmqi1lope006354oxjw7fjoz0	cmqi1lopm006a54oxqcc7hija	9	0	3	\N	2026-06-17 12:23:53.436
cmqi1lopr006d54oxvggpr715	cmqi1lope006354oxjw7fjoz0	cmqi1lopp006c54ox0jt2ma2x	11	0	3	\N	2026-06-17 12:23:53.439
cmqi1lopt006f54ox9z2rn7hm	cmqi1lope006354oxjw7fjoz0	cmqi1lops006e54ox19vdry2z	7	0	3	\N	2026-06-17 12:23:53.441
cmqi1lopv006h54oxxkb8db16	cmqi1lope006354oxjw7fjoz0	cmqi1lopu006g54ox0jesei2p	30	0	3	\N	2026-06-17 12:23:53.443
cmqi1lopw006j54oxcpjine1o	cmqi1lope006354oxjw7fjoz0	cmqi1lopv006i54ox3lab3v13	11	0	3	\N	2026-06-17 12:23:53.444
cmqi1lopy006l54ox8w58uunu	cmqi1lope006354oxjw7fjoz0	cmqi1lopx006k54ox5e52gdr8	27	0	3	\N	2026-06-17 12:23:53.447
cmqi1loq2006n54oxau5z1sv6	cmqi1lope006354oxjw7fjoz0	cmqi1loq0006m54oxrgaxfqs5	5	0	3	\N	2026-06-17 12:23:53.45
cmqi1loq4006p54ox8xfabp27	cmqi1lope006354oxjw7fjoz0	cmqi1loq3006o54ox6bx9v4m0	31	0	3	\N	2026-06-17 12:23:53.452
cmqi1loq5006r54oxq6xdngdh	cmqi1lope006354oxjw7fjoz0	cmqi1loq4006q54ox38lzsia7	10	0	3	\N	2026-06-17 12:23:53.453
cmqi1loq7006t54oxsxg9twoe	cmqi1lope006354oxjw7fjoz0	cmqi1loq6006s54oxq13gq8in	11	0	3	\N	2026-06-17 12:23:53.455
cmqi1loq9006v54oxnvdbd76z	cmqi1lope006354oxjw7fjoz0	cmqi1loq8006u54oxmpcb0vsz	29	0	3	\N	2026-06-17 12:23:53.457
cmqi1loqd006x54ox7jrmk73o	cmqi1lope006354oxjw7fjoz0	cmqi1loqc006w54oxw2spapf5	5	0	3	\N	2026-06-17 12:23:53.461
cmqi1loqg006z54ox8qr66um2	cmqi1lope006354oxjw7fjoz0	cmqi1loqe006y54oxelf2psfg	18	0	3	\N	2026-06-17 12:23:53.464
cmqi1loqj007154oxg2ninpnn	cmqi1lope006354oxjw7fjoz0	cmqi1loqi007054oxrs5so58h	33	0	3	\N	2026-06-17 12:23:53.467
cmqi1loqt007954ox9vexj0c9	cmqi1loqn007254ox95qtmqug	cmqi1loqs007854oxi16wdv96	31	0	3	\N	2026-06-17 12:23:53.477
cmqi1loqw007b54oxutoqwajl	cmqi1loqn007254ox95qtmqug	cmqi1loqv007a54ox9kygdmxg	30	0	3	\N	2026-06-17 12:23:53.48
cmqi1loqy007d54ox7im36nof	cmqi1loqn007254ox95qtmqug	cmqi1loqx007c54oxdrcpjxzj	18	0	3	\N	2026-06-17 12:23:53.482
cmqi1lor0007f54oxsacoe8hf	cmqi1loqn007254ox95qtmqug	cmqi1loqz007e54oxv4ufz06v	12	0	3	\N	2026-06-17 12:23:53.484
cmqi1lor2007h54ox9kxxlhdo	cmqi1loqn007254ox95qtmqug	cmqi1lor1007g54oxyc6dmmy6	18	0	3	\N	2026-06-17 12:23:53.486
cmqi1lor4007j54ox42d15xpn	cmqi1loqn007254ox95qtmqug	cmqi1lor3007i54ox5z6d7vun	12	0	3	\N	2026-06-17 12:23:53.488
cmqi1lor7007l54oxp1bkk1mv	cmqi1loqn007254ox95qtmqug	cmqi1lor6007k54oxc8m0qr2x	8	0	3	\N	2026-06-17 12:23:53.491
cmqi1lor8007n54oxy154xbuo	cmqi1loqn007254ox95qtmqug	cmqi1lor8007m54oxzc8t1t3a	18	0	3	\N	2026-06-17 12:23:53.492
cmqi1lorh007u54oxmg7vf6y8	cmqi1lorb007o54oxohy9zxbk	cmqi1lorg007t54ox1ly0or7i	29	0	3	\N	2026-06-17 12:23:53.501
cmqi1lork007w54ox8hrevfig	cmqi1lorb007o54oxohy9zxbk	cmqi1lori007v54oxtgof89fb	19	0	3	\N	2026-06-17 12:23:53.504
cmqi1lorn007y54oxlcdngcc8	cmqi1lorb007o54oxohy9zxbk	cmqi1lorm007x54oxvdgjyhhd	10	0	3	\N	2026-06-17 12:23:53.507
cmqi1lorp008054oxyrp265wn	cmqi1lorb007o54oxohy9zxbk	cmqi1loro007z54oxe2khnyi9	8	0	3	\N	2026-06-17 12:23:53.509
cmqi1lorr008254oxyo7bp935	cmqi1lorb007o54oxohy9zxbk	cmqi1lorq008154oxfy2tx3r2	22	0	3	\N	2026-06-17 12:23:53.511
cmqi1lors008454ox1b032age	cmqi1lorb007o54oxohy9zxbk	cmqi1lorr008354ox3ynnmmp9	25	0	3	\N	2026-06-17 12:23:53.512
cmqi1lorv008654oxm5c1pf82	cmqi1lorb007o54oxohy9zxbk	cmqi1loru008554ox1f4u1syv	9	0	3	\N	2026-06-17 12:23:53.515
cmqi1lory008854ox1fbyruq3	cmqi1lorb007o54oxohy9zxbk	cmqi1lorx008754oxuysji5gr	34	0	3	\N	2026-06-17 12:23:53.518
cmqi1los8008g54oxy8ugz8z4	cmqi1los2008954ox5kv69mft	cmqi1los6008f54ox44amo45a	22	0	3	\N	2026-06-17 12:23:53.528
cmqi1losb008i54ox9hskobvs	cmqi1los2008954ox5kv69mft	cmqi1los9008h54ox4f86xey8	29	0	3	\N	2026-06-17 12:23:53.531
cmqi1losd008k54oxrvg8ywcv	cmqi1los2008954ox5kv69mft	cmqi1losc008j54ox2ly6nlc0	33	0	3	\N	2026-06-17 12:23:53.533
cmqi1losf008m54oxc3lr7y6i	cmqi1los2008954ox5kv69mft	cmqi1lose008l54ox55x3z4mg	21	0	3	\N	2026-06-17 12:23:53.535
cmqi1losh008o54oxm5y6kefb	cmqi1los2008954ox5kv69mft	cmqi1losg008n54oxklxupixo	28	0	3	\N	2026-06-17 12:23:53.537
cmqi1losk008q54oxuegubxdc	cmqi1los2008954ox5kv69mft	cmqi1losi008p54ox8a5k0xs4	24	0	3	\N	2026-06-17 12:23:53.54
cmqi1losn008s54oxb7xwruz3	cmqi1los2008954ox5kv69mft	cmqi1losm008r54oxyntbu8rg	29	0	3	\N	2026-06-17 12:23:53.543
cmqi1losu008u54ox112ze1ms	cmqi1los2008954ox5kv69mft	cmqi1loso008t54oxoted23cx	31	0	3	\N	2026-06-17 12:23:53.55
cmqi1losv008w54oxqrevydic	cmqi1los2008954ox5kv69mft	cmqi1losv008v54ox1661x2l6	26	0	3	\N	2026-06-17 12:23:53.552
cmqi1losy008y54oxbzjezhh0	cmqi1los2008954ox5kv69mft	cmqi1losw008x54oxkw8oh44q	32	0	3	\N	2026-06-17 12:23:53.554
cmqi1lot1009054oxmca2u350	cmqi1los2008954ox5kv69mft	cmqi1losz008z54oxvij79ur5	5	0	3	\N	2026-06-17 12:23:53.557
cmqi1lot3009254oxf5ige5vj	cmqi1los2008954ox5kv69mft	cmqi1lot2009154oxxnfnyo6i	26	0	3	\N	2026-06-17 12:23:53.559
cmqi1lot6009454ox3kgy2do8	cmqi1los2008954ox5kv69mft	cmqi1lot4009354ox1u3f0pk9	31	0	3	\N	2026-06-17 12:23:53.562
cmqi1lota009654oxp79o4zvj	cmqi1los2008954ox5kv69mft	cmqi1lot8009554oxytypqh45	19	0	3	\N	2026-06-17 12:23:53.566
cmqi1lotc009854oxgdpd9t69	cmqi1los2008954ox5kv69mft	cmqi1lotb009754oxtffx5m9p	16	0	3	\N	2026-06-17 12:23:53.568
cmqi1lotl009f54ox7zec05dr	cmqi1loth009954oxb6b3m02c	cmqi1lotk009e54oxzh2xsku5	30	0	3	\N	2026-06-17 12:23:53.577
cmqi1loto009h54oxcny9rw87	cmqi1loth009954oxb6b3m02c	cmqi1lotm009g54oxri62dgh1	8	0	3	\N	2026-06-17 12:23:53.58
cmqi1lotq009j54ox63vfx4u9	cmqi1loth009954oxb6b3m02c	cmqi1lotp009i54oxqms2vf2z	29	0	3	\N	2026-06-17 12:23:53.582
cmqi1lotr009l54oxf00wp33e	cmqi1loth009954oxb6b3m02c	cmqi1lotq009k54ox12ihuqtg	8	0	3	\N	2026-06-17 12:23:53.583
cmqi1lots009n54ox8gm2aebn	cmqi1loth009954oxb6b3m02c	cmqi1lotr009m54oxerjs7fgv	30	0	3	\N	2026-06-17 12:23:53.584
cmqi1lott009p54ox4j26dzeq	cmqi1loth009954oxb6b3m02c	cmqi1lots009o54oxkdblu36u	16	0	3	\N	2026-06-17 12:23:53.585
cmqi1lotu009r54oxfuow90dc	cmqi1loth009954oxb6b3m02c	cmqi1lott009q54ox4iir5k8g	23	0	3	\N	2026-06-17 12:23:53.586
cmqi1lotv009t54ox9eqsco4z	cmqi1loth009954oxb6b3m02c	cmqi1lotu009s54ox55bxiq9r	26	0	3	\N	2026-06-17 12:23:53.587
cmqi1lotz009v54oxo3qor7cj	cmqi1loth009954oxb6b3m02c	cmqi1lotx009u54ox8kk0pckv	19	0	3	\N	2026-06-17 12:23:53.591
cmqi1lou1009x54ox6i597a2v	cmqi1loth009954oxb6b3m02c	cmqi1lou0009w54ox36jcr0mr	10	0	3	\N	2026-06-17 12:23:53.593
cmqi1lou3009z54oxh4owi9fn	cmqi1loth009954oxb6b3m02c	cmqi1lou2009y54oxhka2hl9g	33	0	3	\N	2026-06-17 12:23:53.595
cmqi1lou700a154oxs3wduu18	cmqi1loth009954oxb6b3m02c	cmqi1lou500a054ox6qqvxq6n	16	0	3	\N	2026-06-17 12:23:53.599
cmqi1lou900a354oxik0n5pyx	cmqi1loth009954oxb6b3m02c	cmqi1lou800a254oxgfci4vru	33	0	3	\N	2026-06-17 12:23:53.601
cmqi1loud00a554ox8lp2tbri	cmqi1loth009954oxb6b3m02c	cmqi1loub00a454ox984y8e6h	20	0	3	\N	2026-06-17 12:23:53.605
cmqi1louh00a754oxfbb518mj	cmqi1loth009954oxb6b3m02c	cmqi1louf00a654oxjhg6nws0	27	0	3	\N	2026-06-17 12:23:53.609
cmqi1lout00af54oxgqoy5l1e	cmqi1loun00a854oxu1cifj1d	cmqi1lous00ae54oxc0nnl4qe	10	0	3	\N	2026-06-17 12:23:53.621
cmqi1loux00ah54oxqvp5vmhd	cmqi1loun00a854oxu1cifj1d	cmqi1louv00ag54oxgee83c8g	17	0	3	\N	2026-06-17 12:23:53.625
cmqi1lov000aj54ox26e4dfo2	cmqi1loun00a854oxu1cifj1d	cmqi1louy00ai54oxly5nr694	18	0	3	\N	2026-06-17 12:23:53.628
cmqi1lov500al54oxfcwu57v2	cmqi1loun00a854oxu1cifj1d	cmqi1lov200ak54oxb57vnyuu	21	0	3	\N	2026-06-17 12:23:53.633
cmqi1lova00an54ox3sbztamt	cmqi1loun00a854oxu1cifj1d	cmqi1lov700am54ox62gis99t	17	0	3	\N	2026-06-17 12:23:53.638
cmqi1lovf00ap54ox8adz6hj7	cmqi1loun00a854oxu1cifj1d	cmqi1lovd00ao54oxuzpukuw6	13	0	3	\N	2026-06-17 12:23:53.643
cmqi1lovj00ar54oxi8awk30h	cmqi1loun00a854oxu1cifj1d	cmqi1lovh00aq54oxmom6r95z	10	0	3	\N	2026-06-17 12:23:53.647
cmqi1lovo00at54oxkn4089g2	cmqi1loun00a854oxu1cifj1d	cmqi1lovm00as54ox2qk153vv	18	0	3	\N	2026-06-17 12:23:53.652
cmqi1lovq00av54oxzin8sx7r	cmqi1loun00a854oxu1cifj1d	cmqi1lovp00au54oxfg3eqvko	32	0	3	\N	2026-06-17 12:23:53.654
cmqi1lovt00ax54oxwmagpkfg	cmqi1loun00a854oxu1cifj1d	cmqi1lovr00aw54oxpqr4qgjm	29	0	3	\N	2026-06-17 12:23:53.657
cmqi1lovy00az54oxof7c80j4	cmqi1loun00a854oxu1cifj1d	cmqi1lovv00ay54oxrfaqt2pv	12	0	3	\N	2026-06-17 12:23:53.662
cmqi1low300b154ox1v9ow9kh	cmqi1loun00a854oxu1cifj1d	cmqi1low000b054oxa5gw419r	5	0	3	\N	2026-06-17 12:23:53.667
cmqi1low800b354ox6aiaxbki	cmqi1loun00a854oxu1cifj1d	cmqi1low500b254oxwpe0rlvr	19	0	3	\N	2026-06-17 12:23:53.672
cmqi1lowb00b554ox9kh2aojo	cmqi1loun00a854oxu1cifj1d	cmqi1lowa00b454oxw1s1e44k	27	0	3	\N	2026-06-17 12:23:53.675
cmqi1lowf00b754ox1n06plvb	cmqi1loun00a854oxu1cifj1d	cmqi1lowd00b654oxsg6po3d4	8	0	3	\N	2026-06-17 12:23:53.679
cmqi1lowh00b954oxkl4vll34	cmqi1loun00a854oxu1cifj1d	cmqi1lowg00b854oxfok4wfkz	27	0	3	\N	2026-06-17 12:23:53.681
cmqi1lowj00bb54oxwdgtutlx	cmqi1loun00a854oxu1cifj1d	cmqi1lowi00ba54oxjhagpapx	28	0	3	\N	2026-06-17 12:23:53.683
cmqi1lowl00bd54oxc5js4vnw	cmqi1loun00a854oxu1cifj1d	cmqi1lowk00bc54oxixb6r6ls	24	0	3	\N	2026-06-17 12:23:53.685
cmqi1lowp00bf54ox5fcta5y1	cmqi1loun00a854oxu1cifj1d	cmqi1lowm00be54oxp8l89tlg	26	0	3	\N	2026-06-17 12:23:53.689
cmqi1lowt00bh54oxl8t0tkot	cmqi1loun00a854oxu1cifj1d	cmqi1lows00bg54oxh3yfoc51	28	0	3	\N	2026-06-17 12:23:53.693
cmqi1lox900bq54ox6zdzz1ee	cmqi1lowy00bi54oxfjl58nl8	cmqi1lox700bp54ox927saf9n	17	0	3	\N	2026-06-17 12:23:53.709
cmqi1loxd00bs54oxo80hjyrg	cmqi1lowy00bi54oxfjl58nl8	cmqi1loxb00br54ox49sgh9vt	32	0	3	\N	2026-06-17 12:23:53.713
cmqi1loxi00bu54ox2a6h9iyb	cmqi1lowy00bi54oxfjl58nl8	cmqi1loxg00bt54oxzbfozvhh	13	0	3	\N	2026-06-17 12:23:53.718
cmqi1loxm00bw54oxp3pbiade	cmqi1lowy00bi54oxfjl58nl8	cmqi1loxk00bv54oxm03zznrb	8	0	3	\N	2026-06-17 12:23:53.722
cmqi1loxr00by54oxtrdl7zbp	cmqi1lowy00bi54oxfjl58nl8	cmqi1loxo00bx54oxbq8lr5qg	29	0	3	\N	2026-06-17 12:23:53.727
cmqi1loxv00c054oxs2dytjbj	cmqi1lowy00bi54oxfjl58nl8	cmqi1loxt00bz54oxd9hexffo	14	0	3	\N	2026-06-17 12:23:53.731
cmqi1loxz00c254oxpmkvki8j	cmqi1lowy00bi54oxfjl58nl8	cmqi1loxx00c154oxj14ua65e	33	0	3	\N	2026-06-17 12:23:53.735
cmqi1loy300c454oxtx4gkul0	cmqi1lowy00bi54oxfjl58nl8	cmqi1loy100c354oxmzmd4kky	22	0	3	\N	2026-06-17 12:23:53.739
cmqi1loy600c654ox1a3czxz3	cmqi1lowy00bi54oxfjl58nl8	cmqi1loy400c554oxcgalxpm7	8	0	3	\N	2026-06-17 12:23:53.742
cmqi1loy900c854oxectmp9q7	cmqi1lowy00bi54oxfjl58nl8	cmqi1loy800c754oxhi2y4v0n	19	0	3	\N	2026-06-17 12:23:53.745
cmqi1loyb00ca54oxiwu3xivu	cmqi1lowy00bi54oxfjl58nl8	cmqi1loya00c954ox25u0rwks	34	0	3	\N	2026-06-17 12:23:53.747
cmqi1loye00cc54oxttalgdax	cmqi1lowy00bi54oxfjl58nl8	cmqi1loyd00cb54oxx5j3rvzs	14	0	3	\N	2026-06-17 12:23:53.75
cmqi1loyh00ce54oxalqggvms	cmqi1lowy00bi54oxfjl58nl8	cmqi1loyf00cd54ox4exdafiq	24	0	3	\N	2026-06-17 12:23:53.753
cmqi1loyk00cg54oxspzydtag	cmqi1lowy00bi54oxfjl58nl8	cmqi1loyi00cf54oxncrcp5uu	29	0	3	\N	2026-06-17 12:23:53.756
cmqi1loyo00ci54oxq5ns0kyn	cmqi1lowy00bi54oxfjl58nl8	cmqi1loym00ch54oxs4dpbvff	25	0	3	\N	2026-06-17 12:23:53.76
cmqi1loz500cp54oxofs8ysa8	cmqi1loyu00cj54oxd925jrd6	cmqi1loz200co54oxpaxsouso	16	0	3	\N	2026-06-17 12:23:53.777
cmqi1loz900cr54oxttbqbged	cmqi1loyu00cj54oxd925jrd6	cmqi1loz800cq54oxlgg4c5o9	33	0	3	\N	2026-06-17 12:23:53.781
cmqi1lozd00ct54oxe38i5xy5	cmqi1loyu00cj54oxd925jrd6	cmqi1lozc00cs54oxzrwtzzax	7	0	3	\N	2026-06-17 12:23:53.785
cmqi1lozh00cv54ox6nafe6yd	cmqi1loyu00cj54oxd925jrd6	cmqi1lozf00cu54ox2cwqrzrc	9	0	3	\N	2026-06-17 12:23:53.789
cmqi1lozl00cx54oxwin6orfx	cmqi1loyu00cj54oxd925jrd6	cmqi1lozk00cw54ox57uy76ic	14	0	3	\N	2026-06-17 12:23:53.793
cmqi1lozn00cz54oxh9nfhamj	cmqi1loyu00cj54oxd925jrd6	cmqi1lozm00cy54oxaeclybeg	26	0	3	\N	2026-06-17 12:23:53.795
cmqi1lozs00d154ox9rd03jix	cmqi1loyu00cj54oxd925jrd6	cmqi1lozq00d054ox3nu2aj0l	20	0	3	\N	2026-06-17 12:23:53.8
cmqi1lozw00d354ox2by1iuti	cmqi1loyu00cj54oxd925jrd6	cmqi1lozu00d254oxdxpa0w5z	25	0	3	\N	2026-06-17 12:23:53.804
cmqi1lp0000d554ox4x76y9mg	cmqi1loyu00cj54oxd925jrd6	cmqi1lozz00d454oxohtnbphu	19	0	3	\N	2026-06-17 12:23:53.808
cmqi1lp0500d754oxq948bbep	cmqi1loyu00cj54oxd925jrd6	cmqi1lp0200d654oxj4lfiopr	29	0	3	\N	2026-06-17 12:23:53.813
cmqi1lp0a00d954oxhkesrofn	cmqi1loyu00cj54oxd925jrd6	cmqi1lp0700d854ox34ssq1pn	10	0	3	\N	2026-06-17 12:23:53.818
cmqi1lp0f00db54oxguflzyuj	cmqi1loyu00cj54oxd925jrd6	cmqi1lp0d00da54oxpwitcwtl	31	0	3	\N	2026-06-17 12:23:53.823
cmqi1lp0x00dj54oxnro1bwdi	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp0t00di54ox2rdy5fdv	27	0	3	\N	2026-06-17 12:23:53.841
cmqi1lp1000dl54ox9ercd85e	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp0y00dk54oxfxclgrug	5	0	3	\N	2026-06-17 12:23:53.844
cmqi1lp1400dn54oxtumdskjl	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1300dm54oxkm47b10j	5	0	3	\N	2026-06-17 12:23:53.848
cmqi1lp1600dp54oxalp6atl3	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1600do54ox842qyc6l	7	0	3	\N	2026-06-17 12:23:53.85
cmqi1lp1a00dr54oxo0udgxfg	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1800dq54oxtptf0mfv	25	0	3	\N	2026-06-17 12:23:53.854
cmqi1lp1e00dt54ox7krhlmr0	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1c00ds54oxw8x23z1l	17	0	3	\N	2026-06-17 12:23:53.858
cmqi1lp1h00dv54ox3nu1z4kd	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1g00du54oxj4l2hm6f	32	0	3	\N	2026-06-17 12:23:53.861
cmqi1lp1k00dx54oxdzsr2dyp	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1i00dw54oxw2bn7qyf	27	0	3	\N	2026-06-17 12:23:53.864
cmqi1lp1n00dz54oxauou3t8r	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1l00dy54oxivq6u4hr	11	0	3	\N	2026-06-17 12:23:53.867
cmqi1lp1p00e154oxokizunne	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1o00e054ox0jym4ray	7	0	3	\N	2026-06-17 12:23:53.869
cmqi1lp1r00e354oxhtc5wo60	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1q00e254oxzq8xcqt5	34	0	3	\N	2026-06-17 12:23:53.871
cmqi1lp1u00e554oxc5ibq05g	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1t00e454oxrfxtn6dk	20	0	3	\N	2026-06-17 12:23:53.874
cmqi1lp1x00e754oxs8lw807u	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1v00e654oxluxhgjfs	25	0	3	\N	2026-06-17 12:23:53.877
cmqi1lp1z00e954oxb68jmwv5	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp1y00e854ox3k93wwoc	27	0	3	\N	2026-06-17 12:23:53.879
cmqi1lp2200eb54oxh6kus6ro	cmqi1lp0k00dc54ox906d9f3n	cmqi1lp2000ea54ox75crh9b8	27	0	3	\N	2026-06-17 12:23:53.882
cmqi1lp2c00ej54oxih5uw52w	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2a00ei54oxztmgedzx	20	0	3	\N	2026-06-17 12:23:53.892
cmqi1lp2e00el54oxzajoo9wn	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2d00ek54oxm82prspz	10	0	3	\N	2026-06-17 12:23:53.894
cmqi1lp2i00en54ox1if1phgn	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2g00em54oxeqlp9na3	31	0	3	\N	2026-06-17 12:23:53.898
cmqi1lp2m00ep54oxjni3iyls	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2k00eo54ox0izt2vgs	10	0	3	\N	2026-06-17 12:23:53.902
cmqi1lp2p00er54oxxgrcrp1o	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2o00eq54oxvbpz9yov	11	0	3	\N	2026-06-17 12:23:53.905
cmqi1lp2t00et54oxz903jtro	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2q00es54ox05gsybys	13	0	3	\N	2026-06-17 12:23:53.909
cmqi1lp2w00ev54oxtbeb04za	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2v00eu54oxz9ltet6t	24	0	3	\N	2026-06-17 12:23:53.912
cmqi1lp2y00ex54ox6ycyfg46	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2x00ew54oxc64lat0f	23	0	3	\N	2026-06-17 12:23:53.914
cmqi1lp3000ez54oxw70xpjuc	cmqi1lp2500ec54oxb928qwyd	cmqi1lp2z00ey54ox226rtitx	10	0	3	\N	2026-06-17 12:23:53.916
cmqi1lp3300f154oxgu0jm2dp	cmqi1lp2500ec54oxb928qwyd	cmqi1lp3200f054oxycyidq75	6	0	3	\N	2026-06-17 12:23:53.919
cmqi1lp3600f354oxb7p20j42	cmqi1lp2500ec54oxb928qwyd	cmqi1lp3400f254ox4n31v6u4	10	0	3	\N	2026-06-17 12:23:53.922
cmqi1lp3900f554oxc9cvvw58	cmqi1lp2500ec54oxb928qwyd	cmqi1lp3800f454oxydxcu6zp	11	0	3	\N	2026-06-17 12:23:53.925
cmqi1lp3e00f754ox4yc4gjmr	cmqi1lp2500ec54oxb928qwyd	cmqi1lp3a00f654oxocpfpecg	32	0	3	\N	2026-06-17 12:23:53.93
cmqi1lp3g00f954ox3seesrn6	cmqi1lp2500ec54oxb928qwyd	cmqi1lp3f00f854ox077a6cu5	7	0	3	\N	2026-06-17 12:23:53.932
cmqi1lp3j00fb54oxdd1tzjab	cmqi1lp2500ec54oxb928qwyd	cmqi1lp3h00fa54oxq80wxqqk	8	0	3	\N	2026-06-17 12:23:53.935
cmqi1lp3s00fi54oxj54d5i1u	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp3r00fh54ox9qpcsgl9	10	0	3	\N	2026-06-17 12:23:53.944
cmqi1lp3t00fk54oxhc8sx5vt	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp3t00fj54oxtsiweq86	9	0	3	\N	2026-06-17 12:23:53.945
cmqi1lp3v00fm54oxaa5zx0ri	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp3u00fl54oxo2t1cntk	8	0	3	\N	2026-06-17 12:23:53.947
cmqi1lp3y00fo54ox4wz6rs4a	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp3x00fn54oxzd2s0ek7	18	0	3	\N	2026-06-17 12:23:53.95
cmqi1lp4100fq54oxc2ggj06a	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp4000fp54oxvlyb8ke1	26	0	3	\N	2026-06-17 12:23:53.953
cmqi1lp4300fs54oxxqoa7zh3	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp4200fr54ox5syb8wru	29	0	3	\N	2026-06-17 12:23:53.955
cmqi1lp4600fu54oxnvztz7lj	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp4500ft54oxtburdhuv	13	0	3	\N	2026-06-17 12:23:53.958
cmqi1lp4800fw54oxgxpqjsvi	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp4700fv54oxupku4g9p	18	0	3	\N	2026-06-17 12:23:53.96
cmqi1lp4a00fy54ox0hykqqfu	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp4900fx54oxaoay2j2a	26	0	3	\N	2026-06-17 12:23:53.962
cmqi1lp4d00g054ox679f3d4s	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp4b00fz54oxhvvqf1r7	6	0	3	\N	2026-06-17 12:23:53.965
cmqi1lp4g00g254ox76pr9tls	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp4e00g154ox1dtqfwxv	21	0	3	\N	2026-06-17 12:23:53.968
cmqi1lp4j00g454ox2df0gi3h	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lp4h00g354oxuz2mxi67	21	0	3	\N	2026-06-17 12:23:53.971
cmqi1lp4v00gd54oxvpdztjc1	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp4u00gc54ox7kk3o32f	31	0	3	\N	2026-06-17 12:23:53.983
cmqi1lp4y00gf54oxqf96gcki	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp4w00ge54oxek3yq6ni	8	0	3	\N	2026-06-17 12:23:53.986
cmqi1lp5200gh54oxgc1uguto	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5000gg54ox8ckb13iy	21	0	3	\N	2026-06-17 12:23:53.99
cmqi1lp5500gj54oxgbrypz7b	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5400gi54oxuqngt3ag	13	0	3	\N	2026-06-17 12:23:53.993
cmqi1lp5600gl54oxqz86l9hw	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5500gk54oxsxym5v4q	17	0	3	\N	2026-06-17 12:23:53.994
cmqi1lp5700gn54oxlju7jddm	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5600gm54oxnk4jejai	13	0	3	\N	2026-06-17 12:23:53.995
cmqi1lp5900gp54oxg35bqb2v	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5800go54ox41eqzbsz	23	0	3	\N	2026-06-17 12:23:53.997
cmqi1lp5c00gr54oxsvnbclp8	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5a00gq54oxc3uhpf43	31	0	3	\N	2026-06-17 12:23:54
cmqi1lp5g00gt54oxhh6l6buv	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5e00gs54oxlqs5gpbk	21	0	3	\N	2026-06-17 12:23:54.004
cmqi1lp5j00gv54oxhxdwno1u	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5i00gu54oxt3ktlc5b	16	0	3	\N	2026-06-17 12:23:54.007
cmqi1lp5l00gx54oxk03uz4ad	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5k00gw54ox61ocb3zv	32	0	3	\N	2026-06-17 12:23:54.009
cmqi1lp5n00gz54oxa5r6k8jg	cmqi1lp4q00g554oxhmro7vxv	cmqi1lp5m00gy54oxc4w07sw4	11	0	3	\N	2026-06-17 12:23:54.011
cmqi1lp5y00h654oxxw73ljxu	cmqi1lp5s00h054oxylkl3dve	cmqi1lp5v00h554oxaysh6mf6	26	0	3	\N	2026-06-17 12:23:54.022
cmqi1lp6200h854oxwtrbskgy	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6000h754oxuce0zxrd	11	0	3	\N	2026-06-17 12:23:54.026
cmqi1lp6600ha54ox3ez4vspg	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6400h954ox5169leo2	30	0	3	\N	2026-06-17 12:23:54.03
cmqi1lp6a00hc54oxnmkpgbzz	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6800hb54oxgsrp519v	16	0	3	\N	2026-06-17 12:23:54.034
cmqi1lp6b00he54ox2yfvyuoa	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6a00hd54oxvmmtn3nw	9	0	3	\N	2026-06-17 12:23:54.035
cmqi1lp6d00hg54oxoj5mu8vh	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6c00hf54oxzg1xhgv5	11	0	3	\N	2026-06-17 12:23:54.037
cmqi1lp6h00hi54ox30frvyqk	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6f00hh54oxvil1cclb	32	0	3	\N	2026-06-17 12:23:54.041
cmqi1lp6k00hk54ox94z2py28	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6j00hj54oxtu0c7pc6	12	0	3	\N	2026-06-17 12:23:54.044
cmqi1lp6o00hm54ox98sthvyf	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6m00hl54ox73hzhzke	11	0	3	\N	2026-06-17 12:23:54.048
cmqi1lp6q00ho54ox2e25jdsf	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6p00hn54oxpparc3ca	23	0	3	\N	2026-06-17 12:23:54.05
cmqi1lp6s00hq54ox1bh34hso	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6r00hp54oxsleoaox6	26	0	3	\N	2026-06-17 12:23:54.052
cmqi1lp6v00hs54ox7hafpa49	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6t00hr54oxw41yehwi	7	0	3	\N	2026-06-17 12:23:54.055
cmqi1lp6y00hu54ox7oxetclj	cmqi1lp5s00h054oxylkl3dve	cmqi1lp6x00ht54oxv6913bik	28	0	3	\N	2026-06-17 12:23:54.058
cmqi1lp7200hw54oxsj09amoc	cmqi1lp5s00h054oxylkl3dve	cmqi1lp7000hv54ox2fof9swo	20	0	3	\N	2026-06-17 12:23:54.062
cmqi1lp7500hy54oxz8pv6ped	cmqi1lp5s00h054oxylkl3dve	cmqi1lp7400hx54oxqcwq21vj	32	0	3	\N	2026-06-17 12:23:54.065
cmqi1lp7h00i754oxmzh9l70k	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp7g00i654oxc3tv10xx	7	0	3	\N	2026-06-17 12:23:54.078
cmqi1lp7k00i954ox5y309i1e	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp7j00i854ox3zqx3fgw	14	0	3	\N	2026-06-17 12:23:54.08
cmqi1lp7n00ib54oxk0spb75v	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp7m00ia54oxcjqwiixn	33	0	3	\N	2026-06-17 12:23:54.083
cmqi1lp7q00id54oxz8arbtg4	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp7p00ic54oxz82jftg7	24	0	3	\N	2026-06-17 12:23:54.086
cmqi1lp7u00if54oxz07uuthz	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp7s00ie54oxvwgksx9y	15	0	3	\N	2026-06-17 12:23:54.09
cmqi1lp7x00ih54ox6edbxjdh	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp7v00ig54ox81e58h58	17	0	3	\N	2026-06-17 12:23:54.093
cmqi1lp7z00ij54oxzsmtlkl8	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp7y00ii54oxro7nx2yb	21	0	3	\N	2026-06-17 12:23:54.095
cmqi1lp8400il54ox4fy28nb1	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp8200ik54ox09cu92xi	33	0	3	\N	2026-06-17 12:23:54.1
cmqi1lp8800in54ox6tewkv2z	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp8600im54oxvlz9s72p	17	0	3	\N	2026-06-17 12:23:54.104
cmqi1lp8b00ip54ox0567cwp9	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp8a00io54ox1wo2ordo	26	0	3	\N	2026-06-17 12:23:54.107
cmqi1lp8e00ir54ox21rwk83y	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp8d00iq54oxqj7qzu2f	20	0	3	\N	2026-06-17 12:23:54.11
cmqi1lp8h00it54oxbh8rfx88	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp8g00is54oxfsbr0zpr	11	0	3	\N	2026-06-17 12:23:54.113
cmqi1lp8k00iv54oxqm90ukpm	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp8i00iu54oxdcitp00y	12	0	3	\N	2026-06-17 12:23:54.116
cmqi1lp8n00ix54oxwv1adwz5	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp8m00iw54oxzhs1fn8b	28	0	3	\N	2026-06-17 12:23:54.119
cmqi1lp8q00iz54oxr2hif8lp	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lp8o00iy54oxquvtbtfh	34	0	3	\N	2026-06-17 12:23:54.122
cmqi1lp8y00j654oxzmnap4fz	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp8w00j554oxo6q5sd75	29	0	3	\N	2026-06-17 12:23:54.13
cmqi1lp9100j854oxt1dzo8ts	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9000j754oxy0dq4s66	27	0	3	\N	2026-06-17 12:23:54.133
cmqi1lp9300ja54oxe6hpzs6s	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9200j954ox28435xu0	11	0	3	\N	2026-06-17 12:23:54.135
cmqi1lp9400jc54ox4p8shph4	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9300jb54oxha1vzc1i	23	0	3	\N	2026-06-17 12:23:54.136
cmqi1lp9800je54oxy2c64k8d	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9600jd54ox6zg0g613	6	0	3	\N	2026-06-17 12:23:54.14
cmqi1lp9c00jg54oxmaqob827	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9a00jf54oxzx5oz2id	25	0	3	\N	2026-06-17 12:23:54.144
cmqi1lp9g00ji54oxkd749f3d	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9f00jh54oxvil4fo80	32	0	3	\N	2026-06-17 12:23:54.148
cmqi1lp9j00jk54oxte8qfpb8	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9h00jj54oxwlcbdiv8	21	0	3	\N	2026-06-17 12:23:54.151
cmqi1lp9l00jm54oxcthzdthv	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9k00jl54oxdlyd3ppr	7	0	3	\N	2026-06-17 12:23:54.153
cmqi1lp9o00jo54oxl6jye7e3	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9n00jn54ox1vrhhcr7	14	0	3	\N	2026-06-17 12:23:54.156
cmqi1lp9q00jq54ox7ks415s8	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9p00jp54oxz3yxnzxr	25	0	3	\N	2026-06-17 12:23:54.158
cmqi1lp9s00js54oxq410ex8v	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9r00jr54oxlbr2vg07	11	0	3	\N	2026-06-17 12:23:54.16
cmqi1lp9u00ju54ox41wbd9ue	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9t00jt54oxceh0o8cv	9	0	3	\N	2026-06-17 12:23:54.162
cmqi1lp9v00jw54oxe4r4bibk	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9u00jv54oxl4q6jz6f	31	0	3	\N	2026-06-17 12:23:54.163
cmqi1lp9y00jy54oxrshak2lm	cmqi1lp8t00j054oxayvz0l5j	cmqi1lp9x00jx54oxew9kbotl	21	0	3	\N	2026-06-17 12:23:54.166
cmqi1lpa800k554oxpbap02gj	cmqi1lpa300jz54oxnqvqt1of	cmqi1lpa700k454oxvjzdy47b	10	0	3	\N	2026-06-17 12:23:54.176
cmqi1lpaa00k754oxen1hnfj7	cmqi1lpa300jz54oxnqvqt1of	cmqi1lpa900k654oxydu38fab	26	0	3	\N	2026-06-17 12:23:54.178
cmqi1lpaj00ke54ox1zm3ixxf	cmqi1lpae00k854ox304ap6gc	cmqi1lpah00kd54oxlexjsnsx	30	0	3	\N	2026-06-17 12:23:54.187
cmqi1lpam00kg54oxowu6oyme	cmqi1lpae00k854ox304ap6gc	cmqi1lpal00kf54oxq3s58us2	18	0	3	\N	2026-06-17 12:23:54.19
cmqi1lpap00ki54oxcu2q76uc	cmqi1lpae00k854ox304ap6gc	cmqi1lpan00kh54ox7nndouik	12	0	3	\N	2026-06-17 12:23:54.193
cmqi1lpar00kk54ox8s76ygvl	cmqi1lpae00k854ox304ap6gc	cmqi1lpaq00kj54oxm3xjl95h	5	0	3	\N	2026-06-17 12:23:54.195
cmqi1lpau00km54ox6rgyshzy	cmqi1lpae00k854ox304ap6gc	cmqi1lpat00kl54oxdm3swh0x	34	0	3	\N	2026-06-17 12:23:54.198
cmqi1lpay00ko54oxbkq1p3t2	cmqi1lpae00k854ox304ap6gc	cmqi1lpav00kn54ox6lr9zq3w	18	0	3	\N	2026-06-17 12:23:54.202
cmqi1lpb700kw54oxmshrn1s0	cmqi1lpb200kp54oxna5cwmew	cmqi1lpb600kv54oxz64qwt3y	5	0	3	\N	2026-06-17 12:23:54.211
cmqi1lpba00ky54oxxhp0b7nw	cmqi1lpb200kp54oxna5cwmew	cmqi1lpb800kx54oxxt41xpgm	29	0	3	\N	2026-06-17 12:23:54.214
cmqi1lpbe00l054oxz48tlis1	cmqi1lpb200kp54oxna5cwmew	cmqi1lpbc00kz54oxn6bz2tdv	21	0	3	\N	2026-06-17 12:23:54.218
cmqi1lpbi00l254oxxn1nyarh	cmqi1lpb200kp54oxna5cwmew	cmqi1lpbf00l154oxzxzovp99	13	0	3	\N	2026-06-17 12:23:54.222
cmqi1lpbl00l454ox1wyhs55g	cmqi1lpb200kp54oxna5cwmew	cmqi1lpbk00l354oxll7vc3d5	30	0	3	\N	2026-06-17 12:23:54.225
cmqi1lpbp00l654ox1fou73ga	cmqi1lpb200kp54oxna5cwmew	cmqi1lpbn00l554oxvw6bpnss	24	0	3	\N	2026-06-17 12:23:54.229
cmqi1lpbt00l854oxrhz21u1z	cmqi1lpb200kp54oxna5cwmew	cmqi1lpbr00l754oxae3g2whk	12	0	3	\N	2026-06-17 12:23:54.233
cmqi1lpbx00la54oxl7mrbxyp	cmqi1lpb200kp54oxna5cwmew	cmqi1lpbv00l954oxobbgw5dx	12	0	3	\N	2026-06-17 12:23:54.237
cmqi1lpc000lc54oxf5xyo5ux	cmqi1lpb200kp54oxna5cwmew	cmqi1lpbz00lb54oxq3jbasv2	34	0	3	\N	2026-06-17 12:23:54.24
cmqi1lpc400le54oxl5p005d4	cmqi1lpb200kp54oxna5cwmew	cmqi1lpc200ld54oxq57mhofs	8	0	3	\N	2026-06-17 12:23:54.244
cmqi1lpc600lg54oxsnnk79zy	cmqi1lpb200kp54oxna5cwmew	cmqi1lpc500lf54oxd3devpjj	23	0	3	\N	2026-06-17 12:23:54.246
cmqi1lpca00li54oxzgoul4hc	cmqi1lpb200kp54oxna5cwmew	cmqi1lpc700lh54oxaea1dar9	12	0	3	\N	2026-06-17 12:23:54.25
cmqi1lpck00lr54oxqf1bpc7g	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpcj00lq54ox3z3rixd3	13	0	3	\N	2026-06-17 12:23:54.261
cmqi1lpcp00lt54oxwym8knvj	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpcm00ls54ox1pg83dsx	20	0	3	\N	2026-06-17 12:23:54.265
cmqi1lpcs00lv54oxxlossr8h	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpcq00lu54ox7d1m9qc3	6	0	3	\N	2026-06-17 12:23:54.268
cmqi1lpcw00lx54ox42h4emv4	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpcu00lw54ox2y86amam	25	0	3	\N	2026-06-17 12:23:54.272
cmqi1lpcy00lz54oxpj40s0e2	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpcx00ly54oxfvekue6h	15	0	3	\N	2026-06-17 12:23:54.274
cmqi1lpd200m154oxxiomph85	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpd000m054ox9vjbecgx	33	0	3	\N	2026-06-17 12:23:54.278
cmqi1lpd400m354oxj4ji6hjj	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpd300m254oxhn0tra42	24	0	3	\N	2026-06-17 12:23:54.28
cmqi1lpd600m554oxfwa8lbjn	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpd500m454ox65gx4bwa	21	0	3	\N	2026-06-17 12:23:54.282
cmqi1lpd800m754oxz0cbncvt	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpd700m654ox9g6t22rf	34	0	3	\N	2026-06-17 12:23:54.284
cmqi1lpda00m954oxh19c9sme	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpd900m854oxworwcd85	9	0	3	\N	2026-06-17 12:23:54.286
cmqi1lpdd00mb54oxtb6syjo1	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpdb00ma54oxjm05pruf	14	0	3	\N	2026-06-17 12:23:54.289
cmqi1lpdh00md54oxyn81v8kx	cmqi1lpce00lj54oxj0hum6yl	cmqi1lpdf00mc54ox2l3f5t0u	7	0	3	\N	2026-06-17 12:23:54.293
cmqi1lpds00mk54oxcdgsr9xg	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpdq00mj54oxjdi65k6i	15	0	3	\N	2026-06-17 12:23:54.304
cmqi1lpdx00mm54oxxkbr3pu8	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpdu00ml54oxd6qw4li0	7	0	3	\N	2026-06-17 12:23:54.309
cmqi1lpe000mo54oxgdfp37og	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpdy00mn54oxp7v6xdpl	28	0	3	\N	2026-06-17 12:23:54.312
cmqi1lpe200mq54ox68js908z	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpe100mp54oxhoowieh7	32	0	3	\N	2026-06-17 12:23:54.314
cmqi1lpe400ms54ox0hevh18w	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpe300mr54oxhvvxzol7	22	0	3	\N	2026-06-17 12:23:54.316
cmqi1lpe500mu54ox93xnjrcu	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpe400mt54oxuqi6lj85	12	0	3	\N	2026-06-17 12:23:54.317
cmqi1lpe700mw54oxu4ntrpqi	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpe600mv54ox27y98suw	29	0	3	\N	2026-06-17 12:23:54.319
cmqi1lpea00my54oxjn16jk7s	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpe900mx54oxlqxexcfm	10	0	3	\N	2026-06-17 12:23:54.322
cmqi1lpec00n054oxzylirt3q	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpeb00mz54oxd86e5xre	15	0	3	\N	2026-06-17 12:23:54.324
cmqi1lpee00n254ox1yeqreop	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lped00n154ox97tm03dg	29	0	3	\N	2026-06-17 12:23:54.326
cmqi1lpeg00n454oxgtny18na	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpef00n354oxykeibgsl	30	0	3	\N	2026-06-17 12:23:54.328
cmqi1lpei00n654ox8natr7h7	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpeh00n554oxs9bjd7lm	6	0	3	\N	2026-06-17 12:23:54.33
cmqi1lpej00n854oxzqg04k5i	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpei00n754oxcj21ovwo	9	0	3	\N	2026-06-17 12:23:54.331
cmqi1lpel00na54ox45642k8r	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpek00n954oxtttrpwbm	10	0	3	\N	2026-06-17 12:23:54.333
cmqi1lpen00nc54oxkupcqv2f	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpem00nb54oxeilgaweo	30	0	3	\N	2026-06-17 12:23:54.335
cmqi1lpeo00ne54ox50kpqwxp	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpen00nd54ox83mfnz8i	34	0	3	\N	2026-06-17 12:23:54.336
cmqi1lpeq00ng54ox27acd9ye	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lpeo00nf54oxzicksp99	17	0	3	\N	2026-06-17 12:23:54.338
cmqi1lpes00ni54oxgsoecn1p	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lper00nh54oxmxsvr68v	15	0	3	\N	2026-06-17 12:23:54.34
\.


--
-- TOC entry 5497 (class 0 OID 16751)
-- Dependencies: 234
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_transactions (id, "inventoryId", type, quantity, "previousQty", "newQty", reason, reference, "performedBy", "createdAt") FROM stdin;
\.


--
-- TOC entry 5520 (class 0 OID 17088)
-- Dependencies: 257
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", type, title, message, data, "isRead", "readAt", "createdAt") FROM stdin;
\.


--
-- TOC entry 5501 (class 0 OID 16817)
-- Dependencies: 238
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, "orderId", "productId", "variantId", "productName", "variantName", sku, quantity, "unitPrice", "totalPrice", "imageUrl") FROM stdin;
\.


--
-- TOC entry 5502 (class 0 OID 16832)
-- Dependencies: 239
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_status_history (id, "orderId", status, note, "changedBy", "createdAt") FROM stdin;
\.


--
-- TOC entry 5500 (class 0 OID 16793)
-- Dependencies: 237
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "orderNumber", "userId", "addressId", status, subtotal, "shippingFee", discount, tax, total, "couponId", "couponCode", notes, "shippingMethodId", "trackingNumber", "estimatedDelivery", "deliveredAt", "cancelledAt", "cancelReason", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5504 (class 0 OID 16862)
-- Dependencies: 241
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, "paymentId", type, status, amount, "gatewayRef", "gatewayResponse", "createdAt") FROM stdin;
\.


--
-- TOC entry 5503 (class 0 OID 16844)
-- Dependencies: 240
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "orderId", method, status, amount, currency, "transactionRef", "paidAt", "expiresAt", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5484 (class 0 OID 16540)
-- Dependencies: 221
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, action, subject, description, "createdAt") FROM stdin;
cmqi1lpfq00ny54oxynvrm7y7	manage	all	Full access	2026-06-17 12:23:54.374
cmqi1lpfq00nz54ox75ivorhf	manage	Product	Manage products	2026-06-17 12:23:54.374
cmqi1lpfq00o054ox4pr5oy0k	manage	Order	Manage orders	2026-06-17 12:23:54.374
cmqi1lpfq00o154ox5rddxqxv	read	Analytics	View analytics	2026-06-17 12:23:54.374
\.


--
-- TOC entry 5492 (class 0 OID 16686)
-- Dependencies: 229
-- Data for Name: product_colors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_colors (id, name, "hexCode", "imageUrl") FROM stdin;
cmqi1lojh001a54ox0fso6lhy	Charcoal	#36454f	\N
cmqi1lojh001754oxays3djg2	Noir	#0a0a0a	\N
cmqi1lojh001b54ox748wd3w1	Navy	#1b2a4a	\N
cmqi1lojh001854oxoke8coub	Blanc	#f5f5f5	\N
cmqi1lojh001c54oxxauuh1fu	Ecru	#c2b280	\N
cmqi1lojh001954oxdt6ol2on	Slate	#708090	\N
cmqi1lojh001d54ox4we9uefj	Olive	#556b2f	\N
cmqi1lojh001e54oxecyewlsl	Bordeaux	#722f37	\N
cmqi1lojh001g54oxobsuur8x	Sand	#c2a47e	\N
cmqi1lojh001f54oxn1g32hjh	Forest	#1b4332	\N
\.


--
-- TOC entry 5491 (class 0 OID 16670)
-- Dependencies: 228
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (id, "productId", url, "altText", "isPrimary", "sortOrder", "createdAt") FROM stdin;
cmqi1lokd002054oxeigd4fh5	cmqi1lokb001z54ox3mcsmy1m	https://lh3.googleusercontent.com/aida-public/AB6AXuCwinWefsbd4mkBJWI2YoP7qMErmOk1QwZIOYMQzdw9h3QcvlJzWfffOJn5OnR3dLYwnaWQGkU8C4BiKKGnkYU6sHR9kXJGjUQAokfGk2PCdhkxaSjnYl6XH7inzcjqh1g3Gl05bEMx_UjB2a-XAu6FTyq-FCbh8h65CF7e2-T51Q2D9XM9x2jyNpa0I3gv0w_qbF2NMf6puyNORUFy41e-8wlGrSKJdzOlGzxoRvbAIbVENWtNIfBOmM6T_Kv4M6Ephf_K7ce_44oE	\N	t	0	2026-06-17 12:23:53.243
cmqi1lokd002154oxmzqkeddb	cmqi1lokb001z54ox3mcsmy1m	https://lh3.googleusercontent.com/aida-public/AB6AXuASe7XJRyyYFpPE6ZPqV4Sr0X3im9MiHkzROGh94ILdtDIUSzIM6yGKVwpRDQsSPr02MSKhG8iLR88gUhh3o48o_zAY-cwys65K9lLgVkL19NikR0zJkw5C1DxTKH9izc3des2679ZIRDRgrRvpJBOJzHyfASs51W0oni5zuGMJ-bn6aP7FVTJ9D2Pp56GFOr1T2JXlsEkSRUqHcqYq4NZ9tAoP7mpZ1WdYJ_WSdT_8xZq9PFlJFnVfAzd_SFP3eWjWLqsSeP4JGj6j	\N	f	1	2026-06-17 12:23:53.243
cmqi1lol5002n54ox167bqs80	cmqi1lol4002m54ox0qw6gffy	https://lh3.googleusercontent.com/aida-public/AB6AXuASe7XJRyyYFpPE6ZPqV4Sr0X3im9MiHkzROGh94ILdtDIUSzIM6yGKVwpRDQsSPr02MSKhG8iLR88gUhh3o48o_zAY-cwys65K9lLgVkL19NikR0zJkw5C1DxTKH9izc3des2679ZIRDRgrRvpJBOJzHyfASs51W0oni5zuGMJ-bn6aP7FVTJ9D2Pp56GFOr1T2JXlsEkSRUqHcqYq4NZ9tAoP7mpZ1WdYJ_WSdT_8xZq9PFlJFnVfAzd_SFP3eWjWLqsSeP4JGj6j	\N	t	0	2026-06-17 12:23:53.272
cmqi1lol5002o54oxc0wbam9v	cmqi1lol4002m54ox0qw6gffy	https://lh3.googleusercontent.com/aida-public/AB6AXuCwinWefsbd4mkBJWI2YoP7qMErmOk1QwZIOYMQzdw9h3QcvlJzWfffOJn5OnR3dLYwnaWQGkU8C4BiKKGnkYU6sHR9kXJGjUQAokfGk2PCdhkxaSjnYl6XH7inzcjqh1g3Gl05bEMx_UjB2a-XAu6FTyq-FCbh8h65CF7e2-T51Q2D9XM9x2jyNpa0I3gv0w_qbF2NMf6puyNORUFy41e-8wlGrSKJdzOlGzxoRvbAIbVENWtNIfBOmM6T_Kv4M6Ephf_K7ce_44oE	\N	f	1	2026-06-17 12:23:53.272
cmqi1lolq003954oxlmiq4cdl	cmqi1lolp003854oxue2vyy5l	https://lh3.googleusercontent.com/aida-public/AB6AXuCwinWefsbd4mkBJWI2YoP7qMErmOk1QwZIOYMQzdw9h3QcvlJzWfffOJn5OnR3dLYwnaWQGkU8C4BiKKGnkYU6sHR9kXJGjUQAokfGk2PCdhkxaSjnYl6XH7inzcjqh1g3Gl05bEMx_UjB2a-XAu6FTyq-FCbh8h65CF7e2-T51Q2D9XM9x2jyNpa0I3gv0w_qbF2NMf6puyNORUFy41e-8wlGrSKJdzOlGzxoRvbAIbVENWtNIfBOmM6T_Kv4M6Ephf_K7ce_44oE	\N	t	0	2026-06-17 12:23:53.293
cmqi1lomv004e54oxvgmf9mhd	cmqi1lomt004d54oxo1t1mrqf	https://lh3.googleusercontent.com/aida-public/AB6AXuDxd801tfYJWpDBPZQUMnFVtdvQu4vm6gQ7LQJgeB2gIcbUbDORA8dBnR8jJiuIuFNOYDrwaMfBQ9W0VWrfAQOaYXuxzj8jyxchSwg3cL_y7mabFxOJBg0pxUDB0VD0sw8ay6nhZXitQP8eNFNqmbsYav5NfR46pkcHMS8SWPdAFeJeBcC5yXEkouHAv0L2FL-PPXuf005RF0B_RpeZPTfcCaLsJrCPJW3ejnIzIUJka1Pf3xtsoKNCNL2zjLHQ4a7QFGgnlnb_j6wz	\N	t	0	2026-06-17 12:23:53.333
cmqi1lonn005454oxu9efmdb6	cmqi1lonm005354oxfr014lxd	https://lh3.googleusercontent.com/aida-public/AB6AXuDxd801tfYJWpDBPZQUMnFVtdvQu4vm6gQ7LQJgeB2gIcbUbDORA8dBnR8jJiuIuFNOYDrwaMfBQ9W0VWrfAQOaYXuxzj8jyxchSwg3cL_y7mabFxOJBg0pxUDB0VD0sw8ay6nhZXitQP8eNFNqmbsYav5NfR46pkcHMS8SWPdAFeJeBcC5yXEkouHAv0L2FL-PPXuf005RF0B_RpeZPTfcCaLsJrCPJW3ejnIzIUJka1Pf3xtsoKNCNL2zjLHQ4a7QFGgnlnb_j6wz	\N	t	0	2026-06-17 12:23:53.362
cmqi1lonn005554ox186nzq6s	cmqi1lonm005354oxfr014lxd	https://lh3.googleusercontent.com/aida-public/AB6AXuCwinWefsbd4mkBJWI2YoP7qMErmOk1QwZIOYMQzdw9h3QcvlJzWfffOJn5OnR3dLYwnaWQGkU8C4BiKKGnkYU6sHR9kXJGjUQAokfGk2PCdhkxaSjnYl6XH7inzcjqh1g3Gl05bEMx_UjB2a-XAu6FTyq-FCbh8h65CF7e2-T51Q2D9XM9x2jyNpa0I3gv0w_qbF2NMf6puyNORUFy41e-8wlGrSKJdzOlGzxoRvbAIbVENWtNIfBOmM6T_Kv4M6Ephf_K7ce_44oE	\N	f	1	2026-06-17 12:23:53.362
cmqi1lopf006454oxf8fkn629	cmqi1lope006354oxjw7fjoz0	https://lh3.googleusercontent.com/aida-public/AB6AXuDxd801tfYJWpDBPZQUMnFVtdvQu4vm6gQ7LQJgeB2gIcbUbDORA8dBnR8jJiuIuFNOYDrwaMfBQ9W0VWrfAQOaYXuxzj8jyxchSwg3cL_y7mabFxOJBg0pxUDB0VD0sw8ay6nhZXitQP8eNFNqmbsYav5NfR46pkcHMS8SWPdAFeJeBcC5yXEkouHAv0L2FL-PPXuf005RF0B_RpeZPTfcCaLsJrCPJW3ejnIzIUJka1Pf3xtsoKNCNL2zjLHQ4a7QFGgnlnb_j6wz	\N	t	0	2026-06-17 12:23:53.426
cmqi1loqp007354ox0qlcptpw	cmqi1loqn007254ox95qtmqug	https://lh3.googleusercontent.com/aida-public/AB6AXuB0wv96OIfLveq6wFcrpxgzcZ_nvzOXKMKOwqztedNGjYRgiAdgHj7X78Aa-zuo9EaU1Tb_79ISCmjgsGDI1N0DrRNNtYZLiqdmclU0SNe1sVZCXKoPG2TLj12Lh7sgesy9Aan0pjJCItW58c3h475-5Rh4Wwk6Pp8odVi81i75z8WDFrxM9gpjjhbeiWkektH69F1R3t67nGSMtrr1D1BU3bM138ZtnYd6nfqU3MQrpXY1zHmP26QpMpk_XMzu2m5snDmZ0bSUfFHb	\N	t	0	2026-06-17 12:23:53.471
cmqi1lorc007p54oxzf5q9c3r	cmqi1lorb007o54oxohy9zxbk	https://lh3.googleusercontent.com/aida-public/AB6AXuAFFeGkC4E_u9IZzfdVg5tP5f1AQTSZxcdSZeSaCL1u2O8WQYhHZReJ7hKs4PdGnv1H2-jrebTFJtMiUB2b7IgcSuN_eWDasptV5SDYeKM6LizRvB-C9Tsuk61rwsck8Ptb-ucE1cINgw2NVk9XGFM6vevi6KqxSQ5lSoQZ3vT2i7Whq3REh4zyfHZvvYC_M08AA0oc71m5TjSngTtydwggfjFcrPq4eWNNtAqh5mNJeHW5_9kdydzyUgMWE86t4I8jA9P4bIwc	\N	t	0	2026-06-17 12:23:53.495
cmqi1los3008a54oxmvtamo7w	cmqi1los2008954ox5kv69mft	https://lh3.googleusercontent.com/aida-public/AB6AXuB0wv96OIfLveq6wFcrpxgzcZ_nvzOXKMKOwqztedNGjYRgiAdgHj7X78Aa-zuo9EaU1Tb_79ISCmjgsGDI1N0DrRNNtYZLiqdmclU0SNe1sVZCXKoPG2TLj12Lh7sgesy9Aan0pjJCItW58c3h475-5Rh4Wwk6Pp8odVi81i75z8WDFrxM9gpjjhbeiWkektH69F1R3t67nGSMtrr1D1BU3bM138ZtnYd6nfqU3MQrpXY1zHmP26QpMpk_XMzu2m5snDmZ0bSUfFHb	\N	t	0	2026-06-17 12:23:53.522
cmqi1los3008b54ox00kasafn	cmqi1los2008954ox5kv69mft	https://lh3.googleusercontent.com/aida-public/AB6AXuAFFeGkC4E_u9IZzfdVg5tP5f1AQTSZxcdSZeSaCL1u2O8WQYhHZReJ7hKs4PdGnv1H2-jrebTFJtMiUB2b7IgcSuN_eWDasptV5SDYeKM6LizRvB-C9Tsuk61rwsck8Ptb-ucE1cINgw2NVk9XGFM6vevi6KqxSQ5lSoQZ3vT2i7Whq3REh4zyfHZvvYC_M08AA0oc71m5TjSngTtydwggfjFcrPq4eWNNtAqh5mNJeHW5_9kdydzyUgMWE86t4I8jA9P4bIwc	\N	f	1	2026-06-17 12:23:53.522
cmqi1loti009a54ox3226xmo5	cmqi1loth009954oxb6b3m02c	https://lh3.googleusercontent.com/aida-public/AB6AXuB0wv96OIfLveq6wFcrpxgzcZ_nvzOXKMKOwqztedNGjYRgiAdgHj7X78Aa-zuo9EaU1Tb_79ISCmjgsGDI1N0DrRNNtYZLiqdmclU0SNe1sVZCXKoPG2TLj12Lh7sgesy9Aan0pjJCItW58c3h475-5Rh4Wwk6Pp8odVi81i75z8WDFrxM9gpjjhbeiWkektH69F1R3t67nGSMtrr1D1BU3bM138ZtnYd6nfqU3MQrpXY1zHmP26QpMpk_XMzu2m5snDmZ0bSUfFHb	\N	t	0	2026-06-17 12:23:53.573
cmqi1loup00a954ox3p2ab3m2	cmqi1loun00a854oxu1cifj1d	https://lh3.googleusercontent.com/aida-public/AB6AXuBC2b2j4n639n_6pD0Nl9G8L4tL2N9D_N9G_6vX1K4R5N9L2N4K9G_D6vX9N_1R_L2L_9R_9G_6N_J4R4K2L9D_6N1R_X1J_2L4N6G5K9D_6vX1N9K_4N6G2N1R_L2L_9N9G_6N1R_X1J_6vX9N4K2L9D_6N1R_L2L_9N9G_6N_1J_6vX9N4R5N9L2N4K9G_D6vX	\N	t	0	2026-06-17 12:23:53.615
cmqi1lox000bj54ox446dmucg	cmqi1lowy00bi54oxfjl58nl8	https://lh3.googleusercontent.com/aida-public/AB6AXuBC2b2j4n639n_6pD0Nl9G8L4tL2N9D_N9G_6vX1K4R5N9L2N4K9G_D6vX9N_1R_L2L_9R_9G_6N_J4R4K2L9D_6N1R_X1J_2L4N6G5K9D_6vX1N9K_4N6G2N1R_L2L_9N9G_6N1R_X1J_6vX9N4K2L9D_6N1R_L2L_9N9G_6N_1J_6vX9N4R5N9L2N4K9G_D6vX	\N	t	0	2026-06-17 12:23:53.698
cmqi1lox000bk54oxrwpmoukz	cmqi1lowy00bi54oxfjl58nl8	https://lh3.googleusercontent.com/aida-public/AB6AXuB0wv96OIfLveq6wFcrpxgzcZ_nvzOXKMKOwqztedNGjYRgiAdgHj7X78Aa-zuo9EaU1Tb_79ISCmjgsGDI1N0DrRNNtYZLiqdmclU0SNe1sVZCXKoPG2TLj12Lh7sgesy9Aan0pjJCItW58c3h475-5Rh4Wwk6Pp8odVi81i75z8WDFrxM9gpjjhbeiWkektH69F1R3t67nGSMtrr1D1BU3bM138ZtnYd6nfqU3MQrpXY1zHmP26QpMpk_XMzu2m5snDmZ0bSUfFHb	\N	f	1	2026-06-17 12:23:53.698
cmqi1loyw00ck54ox2fqqrb6o	cmqi1loyu00cj54oxd925jrd6	https://lh3.googleusercontent.com/aida-public/AB6AXuDDQ6zDI1XJ01-aXSYF3b8izNNxpLcaqsV2sqM0pyB0h82opNP6KaY5HUmQl_r9D5zK9LJICQFTQKz_qt8aUC7DJn_0CdIg9LTG0yJcubnaWHexu13NNEsEVHdriCxf4VUYaxes79FZBLolOsKXFwLLoQN7yt7earkpNqclFD5Ba0skHLCvmMbwnmbMpZC2BLAmcooH_4A38FNJVkdoVr7s8m7Pm2lUuQen85i2LXCzROlEMoB26gfWmCY_GKDqg6yP1BMxQ5P1Up3z	\N	t	0	2026-06-17 12:23:53.766
cmqi1lp0m00dd54ox4irsqb6s	cmqi1lp0k00dc54ox906d9f3n	https://lh3.googleusercontent.com/aida-public/AB6AXuDDQ6zDI1XJ01-aXSYF3b8izNNxpLcaqsV2sqM0pyB0h82opNP6KaY5HUmQl_r9D5zK9LJICQFTQKz_qt8aUC7DJn_0CdIg9LTG0yJcubnaWHexu13NNEsEVHdriCxf4VUYaxes79FZBLolOsKXFwLLoQN7yt7earkpNqclFD5Ba0skHLCvmMbwnmbMpZC2BLAmcooH_4A38FNJVkdoVr7s8m7Pm2lUuQen85i2LXCzROlEMoB26gfWmCY_GKDqg6yP1BMxQ5P1Up3z	\N	t	0	2026-06-17 12:23:53.828
cmqi1lp0m00de54oxwqmr1ati	cmqi1lp0k00dc54ox906d9f3n	https://lh3.googleusercontent.com/aida-public/AB6AXuDpDWiDbube5wyT2Tz6zI6tPCgwJffW-wF9KrobKIyDtVGWIjQ6_98tP2FXAqxY0ZxS8DSL1tWj1FEcgA7y_TDAM96vLxbmG9FZPMKuLTtL_rBXDl49G6z5n_c6gjmxkUjk1nwiwRFNdJz2IJhKZSJEEb57YXbQWg-fe-dJl2zYa_Ci7cYt6Wsb2pk3RZxkCxuwQDn1aMKm85wFx-DtA5kxqnn1aAu41fWdGQ08ZFKJELYFfxwB6aN64ZnZcKz6OWoyXsa6YZF2fagH	\N	f	1	2026-06-17 12:23:53.828
cmqi1lp2700ed54ox0b0qestm	cmqi1lp2500ec54oxb928qwyd	https://lh3.googleusercontent.com/aida-public/AB6AXuDDQ6zDI1XJ01-aXSYF3b8izNNxpLcaqsV2sqM0pyB0h82opNP6KaY5HUmQl_r9D5zK9LJICQFTQKz_qt8aUC7DJn_0CdIg9LTG0yJcubnaWHexu13NNEsEVHdriCxf4VUYaxes79FZBLolOsKXFwLLoQN7yt7earkpNqclFD5Ba0skHLCvmMbwnmbMpZC2BLAmcooH_4A38FNJVkdoVr7s8m7Pm2lUuQen85i2LXCzROlEMoB26gfWmCY_GKDqg6yP1BMxQ5P1Up3z	\N	t	0	2026-06-17 12:23:53.885
cmqi1lp3o00fd54ox2mm301oy	cmqi1lp3o00fc54ox4l4xoobi	https://lh3.googleusercontent.com/aida-public/AB6AXuDpDWiDbube5wyT2Tz6zI6tPCgwJffW-wF9KrobKIyDtVGWIjQ6_98tP2FXAqxY0ZxS8DSL1tWj1FEcgA7y_TDAM96vLxbmG9FZPMKuLTtL_rBXDl49G6z5n_c6gjmxkUjk1nwiwRFNdJz2IJhKZSJEEb57YXbQWg-fe-dJl2zYa_Ci7cYt6Wsb2pk3RZxkCxuwQDn1aMKm85wFx-DtA5kxqnn1aAu41fWdGQ08ZFKJELYFfxwB6aN64ZnZcKz6OWoyXsa6YZF2fagH	\N	t	0	2026-06-17 12:23:53.94
cmqi1lp4r00g654ox53e5oe2b	cmqi1lp4q00g554oxhmro7vxv	https://lh3.googleusercontent.com/aida-public/AB6AXuDP1anC6E8bADE4kNSa-eA2Ohl9P7ucnAda1f9HrKrUp2jN2U-fyJIUywHz3628rLhhDSitzD5bYek5OGeqOCFgy5bxgeZ6-QF7tzJsB6a7lvJzDRzUX1tDP7jItsVl5qS_rrxnFGrBJHnT-JFxrqpb8ZDuPOkr5ZukmNqQWdBDJ-0GD4mWn4VaFJ6ZLScLWhKePO-9tIpNpJ-xnYJtMpmeb8k4rc-ByBFHPSW0Ki2ELtj8ICfrbY2Q_bAOGyAB0baMmPh4tfHUL7EK	\N	t	0	2026-06-17 12:23:53.978
cmqi1lp4r00g754ox3xv1c1t1	cmqi1lp4q00g554oxhmro7vxv	https://lh3.googleusercontent.com/aida-public/AB6AXuDImdqpgfEHItpn3Fr3nXVhnQhcaKyzhwxi2XIB8bOWl9KyNipTTADbjmZtiKi87lX9gOll0688PhmWZvZS1Yv9-gc-YKLPhy-OMfPo4PORy8BEkflLvHVRnhKFRDdohYept57eQ8BGPFHMdfAMWfa61GCwIW44cfuZcy1dfR0peNg-2vBi72hsoh1RYn6ffvbKtb5aLqOdXtuHTSmix3DfvpcJGaX69cWiEzekyGrek_Dw4NPcg_b1wvuGU0Hsm87PblSYbIsX_1s5	\N	f	1	2026-06-17 12:23:53.978
cmqi1lp5s00h154oxixv8qub9	cmqi1lp5s00h054oxylkl3dve	https://lh3.googleusercontent.com/aida-public/AB6AXuDP1anC6E8bADE4kNSa-eA2Ohl9P7ucnAda1f9HrKrUp2jN2U-fyJIUywHz3628rLhhDSitzD5bYek5OGeqOCFgy5bxgeZ6-QF7tzJsB6a7lvJzDRzUX1tDP7jItsVl5qS_rrxnFGrBJHnT-JFxrqpb8ZDuPOkr5ZukmNqQWdBDJ-0GD4mWn4VaFJ6ZLScLWhKePO-9tIpNpJ-xnYJtMpmeb8k4rc-ByBFHPSW0Ki2ELtj8ICfrbY2Q_bAOGyAB0baMmPh4tfHUL7EK	\N	t	0	2026-06-17 12:23:54.016
cmqi1lp7c00i054ox234nizbg	cmqi1lp7b00hz54oxlgaoxrld	https://lh3.googleusercontent.com/aida-public/AB6AXuDImdqpgfEHItpn3Fr3nXVhnQhcaKyzhwxi2XIB8bOWl9KyNipTTADbjmZtiKi87lX9gOll0688PhmWZvZS1Yv9-gc-YKLPhy-OMfPo4PORy8BEkflLvHVRnhKFRDdohYept57eQ8BGPFHMdfAMWfa61GCwIW44cfuZcy1dfR0peNg-2vBi72hsoh1RYn6ffvbKtb5aLqOdXtuHTSmix3DfvpcJGaX69cWiEzekyGrek_Dw4NPcg_b1wvuGU0Hsm87PblSYbIsX_1s5	\N	t	0	2026-06-17 12:23:54.071
cmqi1lp7c00i154oxqrzhry71	cmqi1lp7b00hz54oxlgaoxrld	https://lh3.googleusercontent.com/aida-public/AB6AXuDP1anC6E8bADE4kNSa-eA2Ohl9P7ucnAda1f9HrKrUp2jN2U-fyJIUywHz3628rLhhDSitzD5bYek5OGeqOCFgy5bxgeZ6-QF7tzJsB6a7lvJzDRzUX1tDP7jItsVl5qS_rrxnFGrBJHnT-JFxrqpb8ZDuPOkr5ZukmNqQWdBDJ-0GD4mWn4VaFJ6ZLScLWhKePO-9tIpNpJ-xnYJtMpmeb8k4rc-ByBFHPSW0Ki2ELtj8ICfrbY2Q_bAOGyAB0baMmPh4tfHUL7EK	\N	f	1	2026-06-17 12:23:54.071
cmqi1lp8u00j154oxkc4xp2um	cmqi1lp8t00j054oxayvz0l5j	https://lh3.googleusercontent.com/aida-public/AB6AXuDImdqpgfEHItpn3Fr3nXVhnQhcaKyzhwxi2XIB8bOWl9KyNipTTADbjmZtiKi87lX9gOll0688PhmWZvZS1Yv9-gc-YKLPhy-OMfPo4PORy8BEkflLvHVRnhKFRDdohYept57eQ8BGPFHMdfAMWfa61GCwIW44cfuZcy1dfR0peNg-2vBi72hsoh1RYn6ffvbKtb5aLqOdXtuHTSmix3DfvpcJGaX69cWiEzekyGrek_Dw4NPcg_b1wvuGU0Hsm87PblSYbIsX_1s5	\N	t	0	2026-06-17 12:23:54.125
cmqi1lpa400k054oxfaxk5ydx	cmqi1lpa300jz54oxnqvqt1of	https://lh3.googleusercontent.com/aida-public/AB6AXuDP1anC6E8bADE4kNSa-eA2Ohl9P7ucnAda1f9HrKrUp2jN2U-fyJIUywHz3628rLhhDSitzD5bYek5OGeqOCFgy5bxgeZ6-QF7tzJsB6a7lvJzDRzUX1tDP7jItsVl5qS_rrxnFGrBJHnT-JFxrqpb8ZDuPOkr5ZukmNqQWdBDJ-0GD4mWn4VaFJ6ZLScLWhKePO-9tIpNpJ-xnYJtMpmeb8k4rc-ByBFHPSW0Ki2ELtj8ICfrbY2Q_bAOGyAB0baMmPh4tfHUL7EK	\N	t	0	2026-06-17 12:23:54.171
cmqi1lpae00k954oxj9z8ik2j	cmqi1lpae00k854ox304ap6gc	https://lh3.googleusercontent.com/aida-public/AB6AXuDpDWiDbube5wyT2Tz6zI6tPCgwJffW-wF9KrobKIyDtVGWIjQ6_98tP2FXAqxY0ZxS8DSL1tWj1FEcgA7y_TDAM96vLxbmG9FZPMKuLTtL_rBXDl49G6z5n_c6gjmxkUjk1nwiwRFNdJz2IJhKZSJEEb57YXbQWg-fe-dJl2zYa_Ci7cYt6Wsb2pk3RZxkCxuwQDn1aMKm85wFx-DtA5kxqnn1aAu41fWdGQ08ZFKJELYFfxwB6aN64ZnZcKz6OWoyXsa6YZF2fagH	\N	t	0	2026-06-17 12:23:54.182
cmqi1lpb400kq54ox6ah3fy5b	cmqi1lpb200kp54oxna5cwmew	https://lh3.googleusercontent.com/aida-public/AB6AXuDImdqpgfEHItpn3Fr3nXVhnQhcaKyzhwxi2XIB8bOWl9KyNipTTADbjmZtiKi87lX9gOll0688PhmWZvZS1Yv9-gc-YKLPhy-OMfPo4PORy8BEkflLvHVRnhKFRDdohYept57eQ8BGPFHMdfAMWfa61GCwIW44cfuZcy1dfR0peNg-2vBi72hsoh1RYn6ffvbKtb5aLqOdXtuHTSmix3DfvpcJGaX69cWiEzekyGrek_Dw4NPcg_b1wvuGU0Hsm87PblSYbIsX_1s5	\N	t	0	2026-06-17 12:23:54.206
cmqi1lpcg00lk54oxojuwb5n6	cmqi1lpce00lj54oxj0hum6yl	https://lh3.googleusercontent.com/aida-public/AB6AXuDImdqpgfEHItpn3Fr3nXVhnQhcaKyzhwxi2XIB8bOWl9KyNipTTADbjmZtiKi87lX9gOll0688PhmWZvZS1Yv9-gc-YKLPhy-OMfPo4PORy8BEkflLvHVRnhKFRDdohYept57eQ8BGPFHMdfAMWfa61GCwIW44cfuZcy1dfR0peNg-2vBi72hsoh1RYn6ffvbKtb5aLqOdXtuHTSmix3DfvpcJGaX69cWiEzekyGrek_Dw4NPcg_b1wvuGU0Hsm87PblSYbIsX_1s5	\N	t	0	2026-06-17 12:23:54.254
cmqi1lpcg00ll54oxaowkjfif	cmqi1lpce00lj54oxj0hum6yl	https://lh3.googleusercontent.com/aida-public/AB6AXuDP1anC6E8bADE4kNSa-eA2Ohl9P7ucnAda1f9HrKrUp2jN2U-fyJIUywHz3628rLhhDSitzD5bYek5OGeqOCFgy5bxgeZ6-QF7tzJsB6a7lvJzDRzUX1tDP7jItsVl5qS_rrxnFGrBJHnT-JFxrqpb8ZDuPOkr5ZukmNqQWdBDJ-0GD4mWn4VaFJ6ZLScLWhKePO-9tIpNpJ-xnYJtMpmeb8k4rc-ByBFHPSW0Ki2ELtj8ICfrbY2Q_bAOGyAB0baMmPh4tfHUL7EK	\N	f	1	2026-06-17 12:23:54.254
cmqi1lpdn00mf54ox883dfxw1	cmqi1lpdm00me54oxgc9j2sfe	https://lh3.googleusercontent.com/aida-public/AB6AXuDpDWiDbube5wyT2Tz6zI6tPCgwJffW-wF9KrobKIyDtVGWIjQ6_98tP2FXAqxY0ZxS8DSL1tWj1FEcgA7y_TDAM96vLxbmG9FZPMKuLTtL_rBXDl49G6z5n_c6gjmxkUjk1nwiwRFNdJz2IJhKZSJEEb57YXbQWg-fe-dJl2zYa_Ci7cYt6Wsb2pk3RZxkCxuwQDn1aMKm85wFx-DtA5kxqnn1aAu41fWdGQ08ZFKJELYFfxwB6aN64ZnZcKz6OWoyXsa6YZF2fagH	\N	t	0	2026-06-17 12:23:54.298
\.


--
-- TOC entry 5493 (class 0 OID 16696)
-- Dependencies: 230
-- Data for Name: product_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_sizes (id, name, "sortOrder", description) FROM stdin;
cmqi1lojm001h54oxgyzs5puv	XS	0	\N
cmqi1lojm001j54oxjnbxb0vh	M	2	\N
cmqi1lojm001i54oxbb9o4v9h	S	1	\N
cmqi1lojm001k54ox8hmkthny	L	3	\N
cmqi1lojm001m54oxloqkmau4	XXL	5	\N
cmqi1lojm001l54oxx06v6eh7	XL	4	\N
cmqi1lojq001n54oxy2yil1t3	28	6	\N
cmqi1lojq001o54oxrpck3w29	29	7	\N
cmqi1lojq001p54ox0vz99ri2	30	8	\N
cmqi1lojq001q54oxsa4xeqwe	31	9	\N
cmqi1lojq001r54oxekkbewfg	32	10	\N
cmqi1lojq001s54oxjzjfwoyj	34	11	\N
cmqi1lojr001t54oxd2c00wjo	39	12	\N
cmqi1lojr001v54ox5eogfpf6	41	14	\N
cmqi1lojr001u54oxfsrin5o9	40	13	\N
cmqi1lojr001w54oxn9lhw1ns	42	15	\N
cmqi1lojs001y54oxcsd1er6o	44	17	\N
cmqi1lojs001x54oxzqu9iy6t	43	16	\N
\.


--
-- TOC entry 5495 (class 0 OID 16722)
-- Dependencies: 232
-- Data for Name: product_specifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_specifications (id, "productId", label, value, "sortOrder") FROM stdin;
cmqi1loke002254oxzrsc4kah	cmqi1lokb001z54ox3mcsmy1m	Material	100% Giza Cotton	0
cmqi1loke002354oxxcaaigm8	cmqi1lokb001z54ox3mcsmy1m	Weight	Heavyweight 240 GSM piqué fabric	1
cmqi1loke002454oxisyz5rcx	cmqi1lokb001z54ox3mcsmy1m	Buttons	Mother of pearl buttons	2
cmqi1loke002554oxhfuawm6j	cmqi1lokb001z54ox3mcsmy1m	Origin	Made in Portugal	3
cmqi1lol6002p54oxv8l4orvl	cmqi1lol4002m54ox0qw6gffy	Material	100% Giza Cotton	0
cmqi1lol6002q54ox7mamyzck	cmqi1lol4002m54ox0qw6gffy	Construction	Piqué knit with structured collar	1
cmqi1lol6002r54oxgfeuue92	cmqi1lol4002m54ox0qw6gffy	Care	Machine wash cold, lay flat to dry	2
cmqi1lolq003a54ox264pgkf8	cmqi1lolp003854oxue2vyy5l	Material	80% Coolmax Polyester, 20% Elastane	0
cmqi1lolq003b54ox315pgtl0	cmqi1lolp003854oxue2vyy5l	Feature	Moisture-wicking 4-way stretch	1
cmqi1lolr003c54oxl174gglc	cmqi1lolp003854oxue2vyy5l	UPF Rating	UPF 30+	2
cmqi1lomv004f54ox80jt3igk	cmqi1lomt004d54oxo1t1mrqf	Material	100% Certified Organic Cotton	0
cmqi1lomv004g54oxm36vbu9r	cmqi1lomt004d54oxo1t1mrqf	Weight	Pre-shrunk 280 GSM dry jersey	1
cmqi1lomv004h54ox7y2l0pzw	cmqi1lomt004d54oxo1t1mrqf	Collar	Thick rib knit collar	2
cmqi1lomv004i54ox2mrpl2we	cmqi1lomt004d54oxo1t1mrqf	Cut	Dropped shoulder tailoring	3
cmqi1lono005654oxznbeyl3o	cmqi1lonm005354oxfr014lxd	Material	100% Ring-Spun Cotton 320 GSM	0
cmqi1lono005754oxnt24l705	cmqi1lonm005354oxfr014lxd	Fit	Oversized with dropped shoulders	1
cmqi1lono005854oxifq6d5u3	cmqi1lonm005354oxfr014lxd	Hem	Cropped boxy hem	2
cmqi1lopf006554oxis4vq23j	cmqi1lope006354oxjw7fjoz0	Material	100% Supima Cotton	0
cmqi1lopf006654ox07tva6fb	cmqi1lope006354oxjw7fjoz0	Length	Longline +8cm vs standard	1
cmqi1lopf006754oxg1e1dlgt	cmqi1lope006354oxjw7fjoz0	Detail	Curved split hem	2
cmqi1loqp007454oxmjshpx04	cmqi1loqn007254ox95qtmqug	Material	100% Suprima Cotton Oxford	0
cmqi1loqq007554ox55gyt7ju	cmqi1loqn007254ox95qtmqug	Collar	Hidden button collar construction	1
cmqi1loqq007654ox85n80sb2	cmqi1loqn007254ox95qtmqug	Placket	Minimalist seamless front placket	2
cmqi1loqq007754oxh1kp6s4i	cmqi1loqn007254ox95qtmqug	Cuffs	Adjustable barrel cuffs	3
cmqi1lorc007q54oxpdn8letb	cmqi1lorb007o54oxohy9zxbk	Material	100% Japanese Linen	0
cmqi1lorc007r54oxqtdisxdz	cmqi1lorb007o54oxohy9zxbk	Dye	Garment-dyed for unique variation	1
cmqi1lorc007s54oxqvt60d8s	cmqi1lorb007o54oxohy9zxbk	Buttons	Corozo nut buttons	2
cmqi1los4008c54oxie53viuz	cmqi1los2008954ox5kv69mft	Material	100% Cotton Poplin	0
cmqi1los4008d54oxmquevn4x	cmqi1los2008954ox5kv69mft	Collar	Band collar (no points)	1
cmqi1los4008e54oxagm1axpz	cmqi1los2008954ox5kv69mft	Origin	Designed in Paris	2
cmqi1lotj009b54ox7guvf9mk	cmqi1loth009954oxb6b3m02c	Material	100% Cotton Twill	0
cmqi1lotj009c54ox7x653tql	cmqi1loth009954oxb6b3m02c	Pockets	2 chest pockets + 2 side pockets	1
cmqi1lotj009d54oxt48ifuip	cmqi1loth009954oxb6b3m02c	Closure	Concealed button placket	2
cmqi1louq00aa54ox50s844i7	cmqi1loun00a854oxu1cifj1d	Material	100% Extra Fine Merino 170s	0
cmqi1louq00ab54ox019fmahu	cmqi1loun00a854oxu1cifj1d	Gauge	12 gauge fine knit	1
cmqi1louq00ac54oxbbka0zyb	cmqi1loun00a854oxu1cifj1d	Care	Hand wash cold or dry clean	2
cmqi1louq00ad54oxx8l4cx1h	cmqi1loun00a854oxu1cifj1d	Origin	Made in Italy	3
cmqi1lox100bl54ox3bqdg0yn	cmqi1lowy00bi54oxfjl58nl8	Material	100% Grade A Mongolian Cashmere	0
cmqi1lox100bm54ox52wnutx8	cmqi1lowy00bi54oxfjl58nl8	Ply	2-ply for durability	1
cmqi1lox100bn54ox7lh1eysn	cmqi1lowy00bi54oxfjl58nl8	Care	Dry clean only	2
cmqi1lox100bo54oxpkzl9laq	cmqi1lowy00bi54oxfjl58nl8	Origin	Made in Scotland	3
cmqi1loyy00cl54oxy4gh8zjw	cmqi1loyu00cj54oxd925jrd6	Material	55% Virgin Wool, 45% Viscose blend	0
cmqi1loyy00cm54oxj8wkh10z	cmqi1loyu00cj54oxd925jrd6	Crease	Crisp pressed front crease line	1
cmqi1loyy00cn54ox0y95vcmt	cmqi1loyu00cj54oxd925jrd6	Pockets	Minimal invisible zipper side pockets	2
cmqi1lp0n00df54ox5qab5q0r	cmqi1lp0k00dc54ox906d9f3n	Material	60% Linen, 40% Cotton	0
cmqi1lp0n00dg54oxev9rn3g4	cmqi1lp0k00dc54ox906d9f3n	Fit	Relaxed hip, wide through the leg	1
cmqi1lp0n00dh54ox8dalhx1s	cmqi1lp0k00dc54ox906d9f3n	Waistband	Elasticated with drawstring	2
cmqi1lp2800ee54oxr6rgotgg	cmqi1lp2500ec54oxb928qwyd	Material	100% Ripstop Cotton	0
cmqi1lp2800ef54oxfdjesq18	cmqi1lp2500ec54oxb928qwyd	Pockets	6 functional pockets including cargo	1
cmqi1lp2800eg54ox1fq2okvi	cmqi1lp2500ec54oxb928qwyd	Fit	Tapered slim cargo	2
cmqi1lp2800eh54ox8laxonjb	cmqi1lp2500ec54oxb928qwyd	Origin	Made in Japan	3
cmqi1lp3p00fe54oxke7c7wqx	cmqi1lp3o00fc54ox4l4xoobi	Material	100% Enzyme Washed Cotton	0
cmqi1lp3p00ff54oxyaustwww	cmqi1lp3o00fc54ox4l4xoobi	Length	10" inseam (above knee)	1
cmqi1lp3p00fg54oxk2lgz8kb	cmqi1lp3o00fc54ox4l4xoobi	Pockets	2 side + 1 back pocket	2
cmqi1lp4s00g854oxk4zbemme	cmqi1lp4q00g554oxhmro7vxv	Material	100% Cotton Canvas 400g	0
cmqi1lp4s00g954ox1rydyo88	cmqi1lp4q00g554oxhmro7vxv	Lining	100% Viscose satin lining	1
cmqi1lp4s00ga54oxvioyrjgy	cmqi1lp4q00g554oxhmro7vxv	Closure	Concealed snap buttons	2
cmqi1lp4s00gb54oxygaziscq	cmqi1lp4q00g554oxhmro7vxv	Pockets	4 patch pockets + 1 inner pocket	3
cmqi1lp5t00h254oxywak92er	cmqi1lp5s00h054oxylkl3dve	Material	100% Cotton Herringbone 300g	0
cmqi1lp5t00h354ox5zto3hjb	cmqi1lp5s00h054oxylkl3dve	Collar	Spread collar	1
cmqi1lp5t00h454ox84majhfr	cmqi1lp5s00h054oxylkl3dve	Pockets	2 chest + 2 side pockets	2
cmqi1lp7d00i254oxvt46ihc2	cmqi1lp7b00hz54oxlgaoxrld	Material	80% Wool, 20% Cashmere	0
cmqi1lp7d00i354oxzqljc5wp	cmqi1lp7b00hz54oxlgaoxrld	Length	Long (below knee)	1
cmqi1lp7d00i454oxkx1ssysn	cmqi1lp7b00hz54oxlgaoxrld	Lining	Full satin lining	2
cmqi1lp7d00i554ox30be9odc	cmqi1lp7b00hz54oxlgaoxrld	Origin	Made in Italy	3
cmqi1lp8v00j254ox2tk224bz	cmqi1lp8t00j054oxayvz0l5j	Material	100% Cotton Gabardine	0
cmqi1lp8v00j354ox7t3aeul2	cmqi1lp8t00j054oxayvz0l5j	Closure	Double-breasted with belt	1
cmqi1lp8v00j454oxilyoyr12	cmqi1lp8t00j054oxayvz0l5j	Length	Mid-length (knee)	2
cmqi1lpa400k154ox7niqh4d6	cmqi1lpa300jz54oxnqvqt1of	Material	Waxed Canvas + Veg-Tan Leather handles	0
cmqi1lpa500k254oxhb8vppij	cmqi1lpa300jz54oxnqvqt1of	Dimensions	40cm × 35cm × 12cm	1
cmqi1lpa500k354oxj662vf6m	cmqi1lpa300jz54oxnqvqt1of	Capacity	16 litres	2
cmqi1lpaf00ka54ox8s262wfx	cmqi1lpae00k854ox304ap6gc	Material	100% Boiled Wool	0
cmqi1lpaf00kb54oxexgui9rr	cmqi1lpae00k854ox304ap6gc	Brim	7cm brim width	1
cmqi1lpaf00kc54ox3z835bhh	cmqi1lpae00k854ox304ap6gc	Interior	Sweat band lining	2
cmqi1lpb400kr54oxasvq5och	cmqi1lpb200kp54oxna5cwmew	Upper	Full-grain calfskin leather	0
cmqi1lpb400ks54ox0dcqy8ge	cmqi1lpb200kp54oxna5cwmew	Sole	Vulcanized rubber sole	1
cmqi1lpb400kt54ox0rfsirz4	cmqi1lpb200kp54oxna5cwmew	Lining	Natural cotton canvas lining	2
cmqi1lpb400ku54oxa942cfr8	cmqi1lpb200kp54oxna5cwmew	Origin	Made in Portugal	3
cmqi1lpch00lm54oxlfvbbv6p	cmqi1lpce00lj54oxj0hum6yl	Upper	Full-grain leather	0
cmqi1lpch00ln54oxclluxpub	cmqi1lpce00lj54oxj0hum6yl	Sole	Leather sole with rubber toe	1
cmqi1lpch00lo54oxjzrj6vdw	cmqi1lpce00lj54oxj0hum6yl	Heel	3cm block heel	2
cmqi1lpch00lp54ox8j67gv0y	cmqi1lpce00lj54oxj0hum6yl	Origin	Made in Spain	3
cmqi1lpdo00mg54oxablbhvy9	cmqi1lpdm00me54oxgc9j2sfe	Upper	Premium Italian suede	0
cmqi1lpdo00mh54ox6m79gdd7	cmqi1lpdm00me54oxgc9j2sfe	Sole	EVA foam with rubber outsole	1
cmqi1lpdo00mi54ox0ohuoc4n	cmqi1lpdm00me54oxgc9j2sfe	Origin	Designed in Vietnam, Made in Portugal	2
\.


--
-- TOC entry 5494 (class 0 OID 16707)
-- Dependencies: 231
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, "productId", "colorId", "sizeId", sku, price, "imageUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
cmqi1loki002654oxfjwi5ph0	cmqi1lokb001z54ox3mcsmy1m	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	AC-POL-001-N-NO-S	\N	\N	t	2026-06-17 12:23:53.25	2026-06-17 12:23:53.25
cmqi1lokm002854oxzkmr3ky8	cmqi1lokb001z54ox3mcsmy1m	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	AC-POL-001-N-NO-M	\N	\N	t	2026-06-17 12:23:53.254	2026-06-17 12:23:53.254
cmqi1lokp002a54ox4xwsnkh2	cmqi1lokb001z54ox3mcsmy1m	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	AC-POL-001-N-NO-L	\N	\N	t	2026-06-17 12:23:53.257	2026-06-17 12:23:53.257
cmqi1loks002c54oxcg5hg5pl	cmqi1lokb001z54ox3mcsmy1m	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	AC-POL-001-N-NO-XL	\N	\N	t	2026-06-17 12:23:53.26	2026-06-17 12:23:53.26
cmqi1loku002e54ox5uqbyrw7	cmqi1lokb001z54ox3mcsmy1m	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001i54oxbb9o4v9h	AC-POL-001-N-SL-S	\N	\N	t	2026-06-17 12:23:53.262	2026-06-17 12:23:53.262
cmqi1lokx002g54oxkwn8voa1	cmqi1lokb001z54ox3mcsmy1m	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001j54oxjnbxb0vh	AC-POL-001-N-SL-M	\N	\N	t	2026-06-17 12:23:53.265	2026-06-17 12:23:53.265
cmqi1lokz002i54oxdk8vovwz	cmqi1lokb001z54ox3mcsmy1m	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001k54ox8hmkthny	AC-POL-001-N-SL-L	\N	\N	t	2026-06-17 12:23:53.267	2026-06-17 12:23:53.267
cmqi1lol0002k54oxfwn0ylyg	cmqi1lokb001z54ox3mcsmy1m	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001l54oxx06v6eh7	AC-POL-001-N-SL-XL	\N	\N	t	2026-06-17 12:23:53.268	2026-06-17 12:23:53.268
cmqi1lol8002s54oxawte5sj2	cmqi1lol4002m54ox0qw6gffy	cmqi1lojh001854oxoke8coub	cmqi1lojm001i54oxbb9o4v9h	AC-POL-002-B-BL-S	\N	\N	t	2026-06-17 12:23:53.276	2026-06-17 12:23:53.276
cmqi1lola002u54ox064w1tf8	cmqi1lol4002m54ox0qw6gffy	cmqi1lojh001854oxoke8coub	cmqi1lojm001j54oxjnbxb0vh	AC-POL-002-B-BL-M	\N	\N	t	2026-06-17 12:23:53.278	2026-06-17 12:23:53.278
cmqi1lolc002w54oxfawa5jwi	cmqi1lol4002m54ox0qw6gffy	cmqi1lojh001854oxoke8coub	cmqi1lojm001k54ox8hmkthny	AC-POL-002-B-BL-L	\N	\N	t	2026-06-17 12:23:53.28	2026-06-17 12:23:53.28
cmqi1lold002y54oxuma60jx7	cmqi1lol4002m54ox0qw6gffy	cmqi1lojh001854oxoke8coub	cmqi1lojm001l54oxx06v6eh7	AC-POL-002-B-BL-XL	\N	\N	t	2026-06-17 12:23:53.281	2026-06-17 12:23:53.281
cmqi1lolg003054ox6dqton7y	cmqi1lol4002m54ox0qw6gffy	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001i54oxbb9o4v9h	AC-POL-002-B-EC-S	\N	\N	t	2026-06-17 12:23:53.284	2026-06-17 12:23:53.284
cmqi1lolh003254oxst08ob0r	cmqi1lol4002m54ox0qw6gffy	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001j54oxjnbxb0vh	AC-POL-002-B-EC-M	\N	\N	t	2026-06-17 12:23:53.285	2026-06-17 12:23:53.285
cmqi1lolj003454ox3ena4e2j	cmqi1lol4002m54ox0qw6gffy	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001k54ox8hmkthny	AC-POL-002-B-EC-L	\N	\N	t	2026-06-17 12:23:53.287	2026-06-17 12:23:53.287
cmqi1lolk003654oxzorvmt53	cmqi1lol4002m54ox0qw6gffy	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001l54oxx06v6eh7	AC-POL-002-B-EC-XL	\N	\N	t	2026-06-17 12:23:53.288	2026-06-17 12:23:53.288
cmqi1lols003d54ox61gs0m32	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001h54oxgyzs5puv	AC-POL-003-S-SL-XS	\N	\N	t	2026-06-17 12:23:53.296	2026-06-17 12:23:53.296
cmqi1lolw003f54ox9f3oeadv	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001i54oxbb9o4v9h	AC-POL-003-S-SL-S	\N	\N	t	2026-06-17 12:23:53.3	2026-06-17 12:23:53.3
cmqi1lolz003h54ox7hx8ynwg	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001j54oxjnbxb0vh	AC-POL-003-S-SL-M	\N	\N	t	2026-06-17 12:23:53.303	2026-06-17 12:23:53.303
cmqi1lom2003j54ox9s8ywfdg	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001k54ox8hmkthny	AC-POL-003-S-SL-L	\N	\N	t	2026-06-17 12:23:53.306	2026-06-17 12:23:53.306
cmqi1lom4003l54oxipsw2fd3	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001l54oxx06v6eh7	AC-POL-003-S-SL-XL	\N	\N	t	2026-06-17 12:23:53.308	2026-06-17 12:23:53.308
cmqi1lom5003n54ox00aye6q5	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001m54oxloqkmau4	AC-POL-003-S-SL-XXL	\N	\N	t	2026-06-17 12:23:53.31	2026-06-17 12:23:53.31
cmqi1lom7003p54oxly12johl	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001h54oxgyzs5puv	AC-POL-003-S-CH-XS	\N	\N	t	2026-06-17 12:23:53.311	2026-06-17 12:23:53.311
cmqi1lom9003r54ox8qfpr1ks	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	AC-POL-003-S-CH-S	\N	\N	t	2026-06-17 12:23:53.313	2026-06-17 12:23:53.313
cmqi1lomb003t54oxr6mrptle	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	AC-POL-003-S-CH-M	\N	\N	t	2026-06-17 12:23:53.315	2026-06-17 12:23:53.315
cmqi1lomc003v54oxixmrfzyp	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	AC-POL-003-S-CH-L	\N	\N	t	2026-06-17 12:23:53.316	2026-06-17 12:23:53.316
cmqi1lomf003x54ox4ulidxcd	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	AC-POL-003-S-CH-XL	\N	\N	t	2026-06-17 12:23:53.319	2026-06-17 12:23:53.319
cmqi1lomh003z54ox9vh1msrt	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001m54oxloqkmau4	AC-POL-003-S-CH-XXL	\N	\N	t	2026-06-17 12:23:53.321	2026-06-17 12:23:53.321
cmqi1lomj004154oxj7sr35wg	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001h54oxgyzs5puv	AC-POL-003-S-NA-XS	\N	\N	t	2026-06-17 12:23:53.323	2026-06-17 12:23:53.323
cmqi1lomk004354oxw6o4lykr	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001i54oxbb9o4v9h	AC-POL-003-S-NA-S	\N	\N	t	2026-06-17 12:23:53.324	2026-06-17 12:23:53.324
cmqi1lomm004554oxvgbpg4zj	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001j54oxjnbxb0vh	AC-POL-003-S-NA-M	\N	\N	t	2026-06-17 12:23:53.326	2026-06-17 12:23:53.326
cmqi1lomn004754oxsh81z2v1	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001k54ox8hmkthny	AC-POL-003-S-NA-L	\N	\N	t	2026-06-17 12:23:53.327	2026-06-17 12:23:53.327
cmqi1lomo004954oxhu676see	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001l54oxx06v6eh7	AC-POL-003-S-NA-XL	\N	\N	t	2026-06-17 12:23:53.328	2026-06-17 12:23:53.328
cmqi1lomp004b54ox2xfvtv0u	cmqi1lolp003854oxue2vyy5l	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001m54oxloqkmau4	AC-POL-003-S-NA-XXL	\N	\N	t	2026-06-17 12:23:53.329	2026-06-17 12:23:53.329
cmqi1lomz004j54oxj6jxgv4d	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001854oxoke8coub	cmqi1lojm001h54oxgyzs5puv	AC-TSH-001-B-BL-XS	\N	\N	t	2026-06-17 12:23:53.339	2026-06-17 12:23:53.339
cmqi1lon1004l54oxm0miscw8	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001854oxoke8coub	cmqi1lojm001i54oxbb9o4v9h	AC-TSH-001-B-BL-S	\N	\N	t	2026-06-17 12:23:53.341	2026-06-17 12:23:53.341
cmqi1lon3004n54oxq3dgs2sp	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001854oxoke8coub	cmqi1lojm001j54oxjnbxb0vh	AC-TSH-001-B-BL-M	\N	\N	t	2026-06-17 12:23:53.343	2026-06-17 12:23:53.343
cmqi1lon7004p54oxffq18i99	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001854oxoke8coub	cmqi1lojm001k54ox8hmkthny	AC-TSH-001-B-BL-L	\N	\N	t	2026-06-17 12:23:53.347	2026-06-17 12:23:53.347
cmqi1lona004r54oxx60mx3il	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001854oxoke8coub	cmqi1lojm001l54oxx06v6eh7	AC-TSH-001-B-BL-XL	\N	\N	t	2026-06-17 12:23:53.35	2026-06-17 12:23:53.35
cmqi1lonb004t54oxz8nfuo09	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001754oxays3djg2	cmqi1lojm001h54oxgyzs5puv	AC-TSH-001-B-NO-XS	\N	\N	t	2026-06-17 12:23:53.351	2026-06-17 12:23:53.351
cmqi1lonc004v54ox3bzr05kr	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	AC-TSH-001-B-NO-S	\N	\N	t	2026-06-17 12:23:53.352	2026-06-17 12:23:53.352
cmqi1lone004x54oxj61qu7qn	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	AC-TSH-001-B-NO-M	\N	\N	t	2026-06-17 12:23:53.354	2026-06-17 12:23:53.354
cmqi1lonh004z54ox6p08mzv0	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	AC-TSH-001-B-NO-L	\N	\N	t	2026-06-17 12:23:53.357	2026-06-17 12:23:53.357
cmqi1lonj005154oxu9w3anbb	cmqi1lomt004d54oxo1t1mrqf	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	AC-TSH-001-B-NO-XL	\N	\N	t	2026-06-17 12:23:53.359	2026-06-17 12:23:53.359
cmqi1lonq005954ox2p89g9z0	cmqi1lonm005354oxfr014lxd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	AC-TSH-002-C-CH-S	\N	\N	t	2026-06-17 12:23:53.366	2026-06-17 12:23:53.366
cmqi1lont005b54oxkn8lv58n	cmqi1lonm005354oxfr014lxd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	AC-TSH-002-C-CH-M	\N	\N	t	2026-06-17 12:23:53.369	2026-06-17 12:23:53.369
cmqi1lonv005d54oxlzurgrf9	cmqi1lonm005354oxfr014lxd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	AC-TSH-002-C-CH-L	\N	\N	t	2026-06-17 12:23:53.371	2026-06-17 12:23:53.371
cmqi1lony005f54oxtw1bbetg	cmqi1lonm005354oxfr014lxd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	AC-TSH-002-C-CH-XL	\N	\N	t	2026-06-17 12:23:53.374	2026-06-17 12:23:53.374
cmqi1loo1005h54oxahz26e6o	cmqi1lonm005354oxfr014lxd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001m54oxloqkmau4	AC-TSH-002-C-CH-XXL	\N	\N	t	2026-06-17 12:23:53.377	2026-06-17 12:23:53.377
cmqi1loo5005j54ox7myeeyyb	cmqi1lonm005354oxfr014lxd	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	AC-TSH-002-C-NO-S	\N	\N	t	2026-06-17 12:23:53.381	2026-06-17 12:23:53.381
cmqi1loo8005l54oxoyda51wd	cmqi1lonm005354oxfr014lxd	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	AC-TSH-002-C-NO-M	\N	\N	t	2026-06-17 12:23:53.384	2026-06-17 12:23:53.384
cmqi1looa005n54ox1knm8wlx	cmqi1lonm005354oxfr014lxd	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	AC-TSH-002-C-NO-L	\N	\N	t	2026-06-17 12:23:53.386	2026-06-17 12:23:53.386
cmqi1loof005p54oxkkeeotqo	cmqi1lonm005354oxfr014lxd	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	AC-TSH-002-C-NO-XL	\N	\N	t	2026-06-17 12:23:53.391	2026-06-17 12:23:53.391
cmqi1look005r54ox2fr0qtx8	cmqi1lonm005354oxfr014lxd	cmqi1lojh001754oxays3djg2	cmqi1lojm001m54oxloqkmau4	AC-TSH-002-C-NO-XXL	\N	\N	t	2026-06-17 12:23:53.396	2026-06-17 12:23:53.396
cmqi1loon005t54oxk9kejab9	cmqi1lonm005354oxfr014lxd	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001i54oxbb9o4v9h	AC-TSH-002-C-SL-S	\N	\N	t	2026-06-17 12:23:53.399	2026-06-17 12:23:53.399
cmqi1loot005v54oxd6hpshzl	cmqi1lonm005354oxfr014lxd	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001j54oxjnbxb0vh	AC-TSH-002-C-SL-M	\N	\N	t	2026-06-17 12:23:53.405	2026-06-17 12:23:53.405
cmqi1lop0005x54ox1lazincc	cmqi1lonm005354oxfr014lxd	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001k54ox8hmkthny	AC-TSH-002-C-SL-L	\N	\N	t	2026-06-17 12:23:53.412	2026-06-17 12:23:53.412
cmqi1lop4005z54ox5l80nzxs	cmqi1lonm005354oxfr014lxd	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001l54oxx06v6eh7	AC-TSH-002-C-SL-XL	\N	\N	t	2026-06-17 12:23:53.416	2026-06-17 12:23:53.416
cmqi1lop7006154oxocdnxy86	cmqi1lonm005354oxfr014lxd	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001m54oxloqkmau4	AC-TSH-002-C-SL-XXL	\N	\N	t	2026-06-17 12:23:53.419	2026-06-17 12:23:53.419
cmqi1lopi006854ox2mjssa32	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001h54oxgyzs5puv	UNI-TSH-001-E-EC-XS	\N	\N	t	2026-06-17 12:23:53.43	2026-06-17 12:23:53.43
cmqi1lopm006a54oxqcc7hija	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001i54oxbb9o4v9h	UNI-TSH-001-E-EC-S	\N	\N	t	2026-06-17 12:23:53.434	2026-06-17 12:23:53.434
cmqi1lopp006c54ox0jt2ma2x	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001j54oxjnbxb0vh	UNI-TSH-001-E-EC-M	\N	\N	t	2026-06-17 12:23:53.437	2026-06-17 12:23:53.437
cmqi1lops006e54ox19vdry2z	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001k54ox8hmkthny	UNI-TSH-001-E-EC-L	\N	\N	t	2026-06-17 12:23:53.44	2026-06-17 12:23:53.44
cmqi1lopu006g54ox0jesei2p	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001l54oxx06v6eh7	UNI-TSH-001-E-EC-XL	\N	\N	t	2026-06-17 12:23:53.442	2026-06-17 12:23:53.442
cmqi1lopv006i54ox3lab3v13	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001854oxoke8coub	cmqi1lojm001h54oxgyzs5puv	UNI-TSH-001-E-BL-XS	\N	\N	t	2026-06-17 12:23:53.443	2026-06-17 12:23:53.443
cmqi1lopx006k54ox5e52gdr8	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001854oxoke8coub	cmqi1lojm001i54oxbb9o4v9h	UNI-TSH-001-E-BL-S	\N	\N	t	2026-06-17 12:23:53.445	2026-06-17 12:23:53.445
cmqi1loq0006m54oxrgaxfqs5	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001854oxoke8coub	cmqi1lojm001j54oxjnbxb0vh	UNI-TSH-001-E-BL-M	\N	\N	t	2026-06-17 12:23:53.448	2026-06-17 12:23:53.448
cmqi1loq3006o54ox6bx9v4m0	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001854oxoke8coub	cmqi1lojm001k54ox8hmkthny	UNI-TSH-001-E-BL-L	\N	\N	t	2026-06-17 12:23:53.451	2026-06-17 12:23:53.451
cmqi1loq4006q54ox38lzsia7	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001854oxoke8coub	cmqi1lojm001l54oxx06v6eh7	UNI-TSH-001-E-BL-XL	\N	\N	t	2026-06-17 12:23:53.452	2026-06-17 12:23:53.452
cmqi1loq6006s54oxq13gq8in	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001h54oxgyzs5puv	UNI-TSH-001-E-SA-XS	\N	\N	t	2026-06-17 12:23:53.454	2026-06-17 12:23:53.454
cmqi1loq8006u54oxmpcb0vsz	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001i54oxbb9o4v9h	UNI-TSH-001-E-SA-S	\N	\N	t	2026-06-17 12:23:53.456	2026-06-17 12:23:53.456
cmqi1loqc006w54oxw2spapf5	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001j54oxjnbxb0vh	UNI-TSH-001-E-SA-M	\N	\N	t	2026-06-17 12:23:53.46	2026-06-17 12:23:53.46
cmqi1loqe006y54oxelf2psfg	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001k54ox8hmkthny	UNI-TSH-001-E-SA-L	\N	\N	t	2026-06-17 12:23:53.462	2026-06-17 12:23:53.462
cmqi1loqi007054oxrs5so58h	cmqi1lope006354oxjw7fjoz0	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001l54oxx06v6eh7	UNI-TSH-001-E-SA-XL	\N	\N	t	2026-06-17 12:23:53.466	2026-06-17 12:23:53.466
cmqi1loqs007854oxi16wdv96	cmqi1loqn007254ox95qtmqug	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001i54oxbb9o4v9h	AC-SHT-001-S-SL-S	\N	\N	t	2026-06-17 12:23:53.476	2026-06-17 12:23:53.476
cmqi1loqv007a54ox9kygdmxg	cmqi1loqn007254ox95qtmqug	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001j54oxjnbxb0vh	AC-SHT-001-S-SL-M	\N	\N	t	2026-06-17 12:23:53.479	2026-06-17 12:23:53.479
cmqi1loqx007c54oxdrcpjxzj	cmqi1loqn007254ox95qtmqug	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001k54ox8hmkthny	AC-SHT-001-S-SL-L	\N	\N	t	2026-06-17 12:23:53.481	2026-06-17 12:23:53.481
cmqi1loqz007e54oxv4ufz06v	cmqi1loqn007254ox95qtmqug	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001l54oxx06v6eh7	AC-SHT-001-S-SL-XL	\N	\N	t	2026-06-17 12:23:53.483	2026-06-17 12:23:53.483
cmqi1lor1007g54oxyc6dmmy6	cmqi1loqn007254ox95qtmqug	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	AC-SHT-001-S-CH-S	\N	\N	t	2026-06-17 12:23:53.485	2026-06-17 12:23:53.485
cmqi1lor3007i54ox5z6d7vun	cmqi1loqn007254ox95qtmqug	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	AC-SHT-001-S-CH-M	\N	\N	t	2026-06-17 12:23:53.487	2026-06-17 12:23:53.487
cmqi1lor6007k54oxc8m0qr2x	cmqi1loqn007254ox95qtmqug	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	AC-SHT-001-S-CH-L	\N	\N	t	2026-06-17 12:23:53.49	2026-06-17 12:23:53.49
cmqi1lor8007m54oxzc8t1t3a	cmqi1loqn007254ox95qtmqug	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	AC-SHT-001-S-CH-XL	\N	\N	t	2026-06-17 12:23:53.492	2026-06-17 12:23:53.492
cmqi1lorg007t54ox1ly0or7i	cmqi1lorb007o54oxohy9zxbk	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001i54oxbb9o4v9h	AC-SHT-002-N-NA-S	\N	\N	t	2026-06-17 12:23:53.5	2026-06-17 12:23:53.5
cmqi1lori007v54oxtgof89fb	cmqi1lorb007o54oxohy9zxbk	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001j54oxjnbxb0vh	AC-SHT-002-N-NA-M	\N	\N	t	2026-06-17 12:23:53.502	2026-06-17 12:23:53.502
cmqi1lorm007x54oxvdgjyhhd	cmqi1lorb007o54oxohy9zxbk	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001k54ox8hmkthny	AC-SHT-002-N-NA-L	\N	\N	t	2026-06-17 12:23:53.506	2026-06-17 12:23:53.506
cmqi1loro007z54oxe2khnyi9	cmqi1lorb007o54oxohy9zxbk	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001l54oxx06v6eh7	AC-SHT-002-N-NA-XL	\N	\N	t	2026-06-17 12:23:53.508	2026-06-17 12:23:53.508
cmqi1lorq008154oxfy2tx3r2	cmqi1lorb007o54oxohy9zxbk	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001i54oxbb9o4v9h	AC-SHT-002-N-SL-S	\N	\N	t	2026-06-17 12:23:53.51	2026-06-17 12:23:53.51
cmqi1lorr008354ox3ynnmmp9	cmqi1lorb007o54oxohy9zxbk	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001j54oxjnbxb0vh	AC-SHT-002-N-SL-M	\N	\N	t	2026-06-17 12:23:53.511	2026-06-17 12:23:53.511
cmqi1loru008554ox1f4u1syv	cmqi1lorb007o54oxohy9zxbk	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001k54ox8hmkthny	AC-SHT-002-N-SL-L	\N	\N	t	2026-06-17 12:23:53.514	2026-06-17 12:23:53.514
cmqi1lorx008754oxuysji5gr	cmqi1lorb007o54oxohy9zxbk	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001l54oxx06v6eh7	AC-SHT-002-N-SL-XL	\N	\N	t	2026-06-17 12:23:53.517	2026-06-17 12:23:53.517
cmqi1los6008f54ox44amo45a	cmqi1los2008954ox5kv69mft	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001h54oxgyzs5puv	APC-SHT-001-E-EC-XS	\N	\N	t	2026-06-17 12:23:53.526	2026-06-17 12:23:53.526
cmqi1los9008h54ox4f86xey8	cmqi1los2008954ox5kv69mft	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001i54oxbb9o4v9h	APC-SHT-001-E-EC-S	\N	\N	t	2026-06-17 12:23:53.529	2026-06-17 12:23:53.529
cmqi1losc008j54ox2ly6nlc0	cmqi1los2008954ox5kv69mft	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001j54oxjnbxb0vh	APC-SHT-001-E-EC-M	\N	\N	t	2026-06-17 12:23:53.532	2026-06-17 12:23:53.532
cmqi1lose008l54ox55x3z4mg	cmqi1los2008954ox5kv69mft	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001k54ox8hmkthny	APC-SHT-001-E-EC-L	\N	\N	t	2026-06-17 12:23:53.534	2026-06-17 12:23:53.534
cmqi1losg008n54oxklxupixo	cmqi1los2008954ox5kv69mft	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001l54oxx06v6eh7	APC-SHT-001-E-EC-XL	\N	\N	t	2026-06-17 12:23:53.536	2026-06-17 12:23:53.536
cmqi1losi008p54ox8a5k0xs4	cmqi1los2008954ox5kv69mft	cmqi1lojh001854oxoke8coub	cmqi1lojm001h54oxgyzs5puv	APC-SHT-001-E-BL-XS	\N	\N	t	2026-06-17 12:23:53.538	2026-06-17 12:23:53.538
cmqi1losm008r54oxyntbu8rg	cmqi1los2008954ox5kv69mft	cmqi1lojh001854oxoke8coub	cmqi1lojm001i54oxbb9o4v9h	APC-SHT-001-E-BL-S	\N	\N	t	2026-06-17 12:23:53.542	2026-06-17 12:23:53.542
cmqi1loso008t54oxoted23cx	cmqi1los2008954ox5kv69mft	cmqi1lojh001854oxoke8coub	cmqi1lojm001j54oxjnbxb0vh	APC-SHT-001-E-BL-M	\N	\N	t	2026-06-17 12:23:53.544	2026-06-17 12:23:53.544
cmqi1losv008v54ox1661x2l6	cmqi1los2008954ox5kv69mft	cmqi1lojh001854oxoke8coub	cmqi1lojm001k54ox8hmkthny	APC-SHT-001-E-BL-L	\N	\N	t	2026-06-17 12:23:53.551	2026-06-17 12:23:53.551
cmqi1losw008x54oxkw8oh44q	cmqi1los2008954ox5kv69mft	cmqi1lojh001854oxoke8coub	cmqi1lojm001l54oxx06v6eh7	APC-SHT-001-E-BL-XL	\N	\N	t	2026-06-17 12:23:53.552	2026-06-17 12:23:53.552
cmqi1losz008z54oxvij79ur5	cmqi1los2008954ox5kv69mft	cmqi1lojh001754oxays3djg2	cmqi1lojm001h54oxgyzs5puv	APC-SHT-001-E-NO-XS	\N	\N	t	2026-06-17 12:23:53.555	2026-06-17 12:23:53.555
cmqi1lot2009154oxxnfnyo6i	cmqi1los2008954ox5kv69mft	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	APC-SHT-001-E-NO-S	\N	\N	t	2026-06-17 12:23:53.558	2026-06-17 12:23:53.558
cmqi1lot4009354ox1u3f0pk9	cmqi1los2008954ox5kv69mft	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	APC-SHT-001-E-NO-M	\N	\N	t	2026-06-17 12:23:53.561	2026-06-17 12:23:53.561
cmqi1lot8009554oxytypqh45	cmqi1los2008954ox5kv69mft	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	APC-SHT-001-E-NO-L	\N	\N	t	2026-06-17 12:23:53.564	2026-06-17 12:23:53.564
cmqi1lotb009754oxtffx5m9p	cmqi1los2008954ox5kv69mft	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	APC-SHT-001-E-NO-XL	\N	\N	t	2026-06-17 12:23:53.567	2026-06-17 12:23:53.567
cmqi1lotk009e54oxzh2xsku5	cmqi1loth009954oxb6b3m02c	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001i54oxbb9o4v9h	VOID-OSH-001-O-OL-S	\N	\N	t	2026-06-17 12:23:53.576	2026-06-17 12:23:53.576
cmqi1lotm009g54oxri62dgh1	cmqi1loth009954oxb6b3m02c	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001j54oxjnbxb0vh	VOID-OSH-001-O-OL-M	\N	\N	t	2026-06-17 12:23:53.578	2026-06-17 12:23:53.578
cmqi1lotp009i54oxqms2vf2z	cmqi1loth009954oxb6b3m02c	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001k54ox8hmkthny	VOID-OSH-001-O-OL-L	\N	\N	t	2026-06-17 12:23:53.581	2026-06-17 12:23:53.581
cmqi1lotq009k54ox12ihuqtg	cmqi1loth009954oxb6b3m02c	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001l54oxx06v6eh7	VOID-OSH-001-O-OL-XL	\N	\N	t	2026-06-17 12:23:53.582	2026-06-17 12:23:53.582
cmqi1lotr009m54oxerjs7fgv	cmqi1loth009954oxb6b3m02c	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001m54oxloqkmau4	VOID-OSH-001-O-OL-XXL	\N	\N	t	2026-06-17 12:23:53.583	2026-06-17 12:23:53.583
cmqi1lots009o54oxkdblu36u	cmqi1loth009954oxb6b3m02c	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	VOID-OSH-001-O-CH-S	\N	\N	t	2026-06-17 12:23:53.584	2026-06-17 12:23:53.584
cmqi1lott009q54ox4iir5k8g	cmqi1loth009954oxb6b3m02c	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	VOID-OSH-001-O-CH-M	\N	\N	t	2026-06-17 12:23:53.585	2026-06-17 12:23:53.585
cmqi1lotu009s54ox55bxiq9r	cmqi1loth009954oxb6b3m02c	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	VOID-OSH-001-O-CH-L	\N	\N	t	2026-06-17 12:23:53.586	2026-06-17 12:23:53.586
cmqi1lotx009u54ox8kk0pckv	cmqi1loth009954oxb6b3m02c	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	VOID-OSH-001-O-CH-XL	\N	\N	t	2026-06-17 12:23:53.589	2026-06-17 12:23:53.589
cmqi1lou0009w54ox36jcr0mr	cmqi1loth009954oxb6b3m02c	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001m54oxloqkmau4	VOID-OSH-001-O-CH-XXL	\N	\N	t	2026-06-17 12:23:53.592	2026-06-17 12:23:53.592
cmqi1lou2009y54oxhka2hl9g	cmqi1loth009954oxb6b3m02c	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	VOID-OSH-001-O-NO-S	\N	\N	t	2026-06-17 12:23:53.594	2026-06-17 12:23:53.594
cmqi1lou500a054ox6qqvxq6n	cmqi1loth009954oxb6b3m02c	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	VOID-OSH-001-O-NO-M	\N	\N	t	2026-06-17 12:23:53.597	2026-06-17 12:23:53.597
cmqi1lou800a254oxgfci4vru	cmqi1loth009954oxb6b3m02c	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	VOID-OSH-001-O-NO-L	\N	\N	t	2026-06-17 12:23:53.6	2026-06-17 12:23:53.6
cmqi1loub00a454ox984y8e6h	cmqi1loth009954oxb6b3m02c	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	VOID-OSH-001-O-NO-XL	\N	\N	t	2026-06-17 12:23:53.603	2026-06-17 12:23:53.603
cmqi1louf00a654oxjhg6nws0	cmqi1loth009954oxb6b3m02c	cmqi1lojh001754oxays3djg2	cmqi1lojm001m54oxloqkmau4	VOID-OSH-001-O-NO-XXL	\N	\N	t	2026-06-17 12:23:53.607	2026-06-17 12:23:53.607
cmqi1lous00ae54oxc0nnl4qe	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001h54oxgyzs5puv	APC-KNT-001-C-CH-XS	\N	\N	t	2026-06-17 12:23:53.62	2026-06-17 12:23:53.62
cmqi1louv00ag54oxgee83c8g	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	APC-KNT-001-C-CH-S	\N	\N	t	2026-06-17 12:23:53.623	2026-06-17 12:23:53.623
cmqi1louy00ai54oxly5nr694	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	APC-KNT-001-C-CH-M	\N	\N	t	2026-06-17 12:23:53.626	2026-06-17 12:23:53.626
cmqi1lov200ak54oxb57vnyuu	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	APC-KNT-001-C-CH-L	\N	\N	t	2026-06-17 12:23:53.63	2026-06-17 12:23:53.63
cmqi1lov700am54ox62gis99t	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	APC-KNT-001-C-CH-XL	\N	\N	t	2026-06-17 12:23:53.635	2026-06-17 12:23:53.635
cmqi1lovd00ao54oxuzpukuw6	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001h54oxgyzs5puv	APC-KNT-001-C-NA-XS	\N	\N	t	2026-06-17 12:23:53.641	2026-06-17 12:23:53.641
cmqi1lovh00aq54oxmom6r95z	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001i54oxbb9o4v9h	APC-KNT-001-C-NA-S	\N	\N	t	2026-06-17 12:23:53.645	2026-06-17 12:23:53.645
cmqi1lovm00as54ox2qk153vv	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001j54oxjnbxb0vh	APC-KNT-001-C-NA-M	\N	\N	t	2026-06-17 12:23:53.65	2026-06-17 12:23:53.65
cmqi1lovp00au54oxfg3eqvko	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001k54ox8hmkthny	APC-KNT-001-C-NA-L	\N	\N	t	2026-06-17 12:23:53.653	2026-06-17 12:23:53.653
cmqi1lovr00aw54oxpqr4qgjm	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001l54oxx06v6eh7	APC-KNT-001-C-NA-XL	\N	\N	t	2026-06-17 12:23:53.655	2026-06-17 12:23:53.655
cmqi1lovv00ay54oxrfaqt2pv	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001754oxays3djg2	cmqi1lojm001h54oxgyzs5puv	APC-KNT-001-C-NO-XS	\N	\N	t	2026-06-17 12:23:53.659	2026-06-17 12:23:53.659
cmqi1low000b054oxa5gw419r	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	APC-KNT-001-C-NO-S	\N	\N	t	2026-06-17 12:23:53.664	2026-06-17 12:23:53.664
cmqi1low500b254oxwpe0rlvr	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	APC-KNT-001-C-NO-M	\N	\N	t	2026-06-17 12:23:53.669	2026-06-17 12:23:53.669
cmqi1lowa00b454oxw1s1e44k	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	APC-KNT-001-C-NO-L	\N	\N	t	2026-06-17 12:23:53.674	2026-06-17 12:23:53.674
cmqi1lowd00b654oxsg6po3d4	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	APC-KNT-001-C-NO-XL	\N	\N	t	2026-06-17 12:23:53.677	2026-06-17 12:23:53.677
cmqi1lowg00b854oxfok4wfkz	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001854oxoke8coub	cmqi1lojm001h54oxgyzs5puv	APC-KNT-001-C-BL-XS	\N	\N	t	2026-06-17 12:23:53.68	2026-06-17 12:23:53.68
cmqi1lowi00ba54oxjhagpapx	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001854oxoke8coub	cmqi1lojm001i54oxbb9o4v9h	APC-KNT-001-C-BL-S	\N	\N	t	2026-06-17 12:23:53.682	2026-06-17 12:23:53.682
cmqi1lowk00bc54oxixb6r6ls	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001854oxoke8coub	cmqi1lojm001j54oxjnbxb0vh	APC-KNT-001-C-BL-M	\N	\N	t	2026-06-17 12:23:53.684	2026-06-17 12:23:53.684
cmqi1lowm00be54oxp8l89tlg	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001854oxoke8coub	cmqi1lojm001k54ox8hmkthny	APC-KNT-001-C-BL-L	\N	\N	t	2026-06-17 12:23:53.687	2026-06-17 12:23:53.687
cmqi1lows00bg54oxh3yfoc51	cmqi1loun00a854oxu1cifj1d	cmqi1lojh001854oxoke8coub	cmqi1lojm001l54oxx06v6eh7	APC-KNT-001-C-BL-XL	\N	\N	t	2026-06-17 12:23:53.692	2026-06-17 12:23:53.692
cmqi1lox700bp54ox927saf9n	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001754oxays3djg2	cmqi1lojm001h54oxgyzs5puv	OL-KNT-001-N-NO-XS	\N	\N	t	2026-06-17 12:23:53.707	2026-06-17 12:23:53.707
cmqi1loxb00br54ox49sgh9vt	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	OL-KNT-001-N-NO-S	\N	\N	t	2026-06-17 12:23:53.711	2026-06-17 12:23:53.711
cmqi1loxg00bt54oxzbfozvhh	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	OL-KNT-001-N-NO-M	\N	\N	t	2026-06-17 12:23:53.716	2026-06-17 12:23:53.716
cmqi1loxk00bv54oxm03zznrb	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	OL-KNT-001-N-NO-L	\N	\N	t	2026-06-17 12:23:53.72	2026-06-17 12:23:53.72
cmqi1loxo00bx54oxbq8lr5qg	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	OL-KNT-001-N-NO-XL	\N	\N	t	2026-06-17 12:23:53.724	2026-06-17 12:23:53.724
cmqi1loxt00bz54oxd9hexffo	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001h54oxgyzs5puv	OL-KNT-001-N-EC-XS	\N	\N	t	2026-06-17 12:23:53.729	2026-06-17 12:23:53.729
cmqi1loxx00c154oxj14ua65e	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001i54oxbb9o4v9h	OL-KNT-001-N-EC-S	\N	\N	t	2026-06-17 12:23:53.733	2026-06-17 12:23:53.733
cmqi1loy100c354oxmzmd4kky	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001j54oxjnbxb0vh	OL-KNT-001-N-EC-M	\N	\N	t	2026-06-17 12:23:53.737	2026-06-17 12:23:53.737
cmqi1loy400c554oxcgalxpm7	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001k54ox8hmkthny	OL-KNT-001-N-EC-L	\N	\N	t	2026-06-17 12:23:53.74	2026-06-17 12:23:53.74
cmqi1loy800c754oxhi2y4v0n	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001l54oxx06v6eh7	OL-KNT-001-N-EC-XL	\N	\N	t	2026-06-17 12:23:53.744	2026-06-17 12:23:53.744
cmqi1loya00c954ox25u0rwks	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001h54oxgyzs5puv	OL-KNT-001-N-SL-XS	\N	\N	t	2026-06-17 12:23:53.746	2026-06-17 12:23:53.746
cmqi1loyd00cb54oxx5j3rvzs	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001i54oxbb9o4v9h	OL-KNT-001-N-SL-S	\N	\N	t	2026-06-17 12:23:53.749	2026-06-17 12:23:53.749
cmqi1loyf00cd54ox4exdafiq	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001j54oxjnbxb0vh	OL-KNT-001-N-SL-M	\N	\N	t	2026-06-17 12:23:53.751	2026-06-17 12:23:53.751
cmqi1loyi00cf54oxncrcp5uu	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001k54ox8hmkthny	OL-KNT-001-N-SL-L	\N	\N	t	2026-06-17 12:23:53.754	2026-06-17 12:23:53.754
cmqi1loym00ch54oxs4dpbvff	cmqi1lowy00bi54oxfjl58nl8	cmqi1lojh001954oxdt6ol2on	cmqi1lojm001l54oxx06v6eh7	OL-KNT-001-N-SL-XL	\N	\N	t	2026-06-17 12:23:53.758	2026-06-17 12:23:53.758
cmqi1loz200co54oxpaxsouso	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	AC-TRS-001-C-CH-S	\N	\N	t	2026-06-17 12:23:53.774	2026-06-17 12:23:53.774
cmqi1loz800cq54oxlgg4c5o9	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	AC-TRS-001-C-CH-M	\N	\N	t	2026-06-17 12:23:53.78	2026-06-17 12:23:53.78
cmqi1lozc00cs54oxzrwtzzax	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	AC-TRS-001-C-CH-L	\N	\N	t	2026-06-17 12:23:53.784	2026-06-17 12:23:53.784
cmqi1lozf00cu54ox2cwqrzrc	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	AC-TRS-001-C-CH-XL	\N	\N	t	2026-06-17 12:23:53.787	2026-06-17 12:23:53.787
cmqi1lozk00cw54ox57uy76ic	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001i54oxbb9o4v9h	AC-TRS-001-C-NA-S	\N	\N	t	2026-06-17 12:23:53.792	2026-06-17 12:23:53.792
cmqi1lozm00cy54oxaeclybeg	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001j54oxjnbxb0vh	AC-TRS-001-C-NA-M	\N	\N	t	2026-06-17 12:23:53.794	2026-06-17 12:23:53.794
cmqi1lozq00d054ox3nu2aj0l	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001k54ox8hmkthny	AC-TRS-001-C-NA-L	\N	\N	t	2026-06-17 12:23:53.798	2026-06-17 12:23:53.798
cmqi1lozu00d254oxdxpa0w5z	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001l54oxx06v6eh7	AC-TRS-001-C-NA-XL	\N	\N	t	2026-06-17 12:23:53.802	2026-06-17 12:23:53.802
cmqi1lozz00d454oxohtnbphu	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	AC-TRS-001-C-NO-S	\N	\N	t	2026-06-17 12:23:53.807	2026-06-17 12:23:53.807
cmqi1lp0200d654oxj4lfiopr	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	AC-TRS-001-C-NO-M	\N	\N	t	2026-06-17 12:23:53.81	2026-06-17 12:23:53.81
cmqi1lp0700d854ox34ssq1pn	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	AC-TRS-001-C-NO-L	\N	\N	t	2026-06-17 12:23:53.815	2026-06-17 12:23:53.815
cmqi1lp0d00da54oxpwitcwtl	cmqi1loyu00cj54oxd925jrd6	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	AC-TRS-001-C-NO-XL	\N	\N	t	2026-06-17 12:23:53.821	2026-06-17 12:23:53.821
cmqi1lp0t00di54ox2rdy5fdv	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001h54oxgyzs5puv	APC-TRS-001-E-EC-XS	\N	\N	t	2026-06-17 12:23:53.837	2026-06-17 12:23:53.837
cmqi1lp0y00dk54oxfxclgrug	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001i54oxbb9o4v9h	APC-TRS-001-E-EC-S	\N	\N	t	2026-06-17 12:23:53.842	2026-06-17 12:23:53.842
cmqi1lp1300dm54oxkm47b10j	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001j54oxjnbxb0vh	APC-TRS-001-E-EC-M	\N	\N	t	2026-06-17 12:23:53.847	2026-06-17 12:23:53.847
cmqi1lp1600do54ox842qyc6l	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001k54ox8hmkthny	APC-TRS-001-E-EC-L	\N	\N	t	2026-06-17 12:23:53.85	2026-06-17 12:23:53.85
cmqi1lp1800dq54oxtptf0mfv	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001l54oxx06v6eh7	APC-TRS-001-E-EC-XL	\N	\N	t	2026-06-17 12:23:53.852	2026-06-17 12:23:53.852
cmqi1lp1c00ds54oxw8x23z1l	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001754oxays3djg2	cmqi1lojm001h54oxgyzs5puv	APC-TRS-001-E-NO-XS	\N	\N	t	2026-06-17 12:23:53.856	2026-06-17 12:23:53.856
cmqi1lp1g00du54oxj4l2hm6f	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	APC-TRS-001-E-NO-S	\N	\N	t	2026-06-17 12:23:53.86	2026-06-17 12:23:53.86
cmqi1lp1i00dw54oxw2bn7qyf	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	APC-TRS-001-E-NO-M	\N	\N	t	2026-06-17 12:23:53.862	2026-06-17 12:23:53.862
cmqi1lp1l00dy54oxivq6u4hr	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	APC-TRS-001-E-NO-L	\N	\N	t	2026-06-17 12:23:53.865	2026-06-17 12:23:53.865
cmqi1lp1o00e054ox0jym4ray	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	APC-TRS-001-E-NO-XL	\N	\N	t	2026-06-17 12:23:53.868	2026-06-17 12:23:53.868
cmqi1lp1q00e254oxzq8xcqt5	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001h54oxgyzs5puv	APC-TRS-001-E-SA-XS	\N	\N	t	2026-06-17 12:23:53.87	2026-06-17 12:23:53.87
cmqi1lp1t00e454oxrfxtn6dk	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001i54oxbb9o4v9h	APC-TRS-001-E-SA-S	\N	\N	t	2026-06-17 12:23:53.873	2026-06-17 12:23:53.873
cmqi1lp1v00e654oxluxhgjfs	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001j54oxjnbxb0vh	APC-TRS-001-E-SA-M	\N	\N	t	2026-06-17 12:23:53.875	2026-06-17 12:23:53.875
cmqi1lp1y00e854ox3k93wwoc	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001k54ox8hmkthny	APC-TRS-001-E-SA-L	\N	\N	t	2026-06-17 12:23:53.878	2026-06-17 12:23:53.878
cmqi1lp2000ea54ox75crh9b8	cmqi1lp0k00dc54ox906d9f3n	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001l54oxx06v6eh7	APC-TRS-001-E-SA-XL	\N	\N	t	2026-06-17 12:23:53.88	2026-06-17 12:23:53.88
cmqi1lp2a00ei54oxztmgedzx	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001i54oxbb9o4v9h	CPR-TRS-001-O-OL-S	\N	\N	t	2026-06-17 12:23:53.891	2026-06-17 12:23:53.891
cmqi1lp2d00ek54oxm82prspz	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001j54oxjnbxb0vh	CPR-TRS-001-O-OL-M	\N	\N	t	2026-06-17 12:23:53.893	2026-06-17 12:23:53.893
cmqi1lp2g00em54oxeqlp9na3	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001k54ox8hmkthny	CPR-TRS-001-O-OL-L	\N	\N	t	2026-06-17 12:23:53.896	2026-06-17 12:23:53.896
cmqi1lp2k00eo54ox0izt2vgs	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001l54oxx06v6eh7	CPR-TRS-001-O-OL-XL	\N	\N	t	2026-06-17 12:23:53.9	2026-06-17 12:23:53.9
cmqi1lp2o00eq54oxvbpz9yov	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001m54oxloqkmau4	CPR-TRS-001-O-OL-XXL	\N	\N	t	2026-06-17 12:23:53.904	2026-06-17 12:23:53.904
cmqi1lp2q00es54ox05gsybys	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	CPR-TRS-001-O-NO-S	\N	\N	t	2026-06-17 12:23:53.906	2026-06-17 12:23:53.906
cmqi1lp2v00eu54oxz9ltet6t	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	CPR-TRS-001-O-NO-M	\N	\N	t	2026-06-17 12:23:53.911	2026-06-17 12:23:53.911
cmqi1lp2x00ew54oxc64lat0f	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	CPR-TRS-001-O-NO-L	\N	\N	t	2026-06-17 12:23:53.913	2026-06-17 12:23:53.913
cmqi1lp2z00ey54ox226rtitx	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	CPR-TRS-001-O-NO-XL	\N	\N	t	2026-06-17 12:23:53.915	2026-06-17 12:23:53.915
cmqi1lp3200f054oxycyidq75	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001754oxays3djg2	cmqi1lojm001m54oxloqkmau4	CPR-TRS-001-O-NO-XXL	\N	\N	t	2026-06-17 12:23:53.918	2026-06-17 12:23:53.918
cmqi1lp3400f254ox4n31v6u4	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	CPR-TRS-001-O-CH-S	\N	\N	t	2026-06-17 12:23:53.92	2026-06-17 12:23:53.92
cmqi1lp3800f454oxydxcu6zp	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	CPR-TRS-001-O-CH-M	\N	\N	t	2026-06-17 12:23:53.924	2026-06-17 12:23:53.924
cmqi1lp3a00f654oxocpfpecg	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	CPR-TRS-001-O-CH-L	\N	\N	t	2026-06-17 12:23:53.926	2026-06-17 12:23:53.926
cmqi1lp3f00f854ox077a6cu5	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	CPR-TRS-001-O-CH-XL	\N	\N	t	2026-06-17 12:23:53.931	2026-06-17 12:23:53.931
cmqi1lp3h00fa54oxq80wxqqk	cmqi1lp2500ec54oxb928qwyd	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001m54oxloqkmau4	CPR-TRS-001-O-CH-XXL	\N	\N	t	2026-06-17 12:23:53.933	2026-06-17 12:23:53.933
cmqi1lp3r00fh54ox9qpcsgl9	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	AC-SHO-001-N-NO-S	\N	\N	t	2026-06-17 12:23:53.943	2026-06-17 12:23:53.943
cmqi1lp3t00fj54oxtsiweq86	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	AC-SHO-001-N-NO-M	\N	\N	t	2026-06-17 12:23:53.945	2026-06-17 12:23:53.945
cmqi1lp3u00fl54oxo2t1cntk	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	AC-SHO-001-N-NO-L	\N	\N	t	2026-06-17 12:23:53.946	2026-06-17 12:23:53.946
cmqi1lp3x00fn54oxzd2s0ek7	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	AC-SHO-001-N-NO-XL	\N	\N	t	2026-06-17 12:23:53.949	2026-06-17 12:23:53.949
cmqi1lp4000fp54oxvlyb8ke1	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	AC-SHO-001-N-CH-S	\N	\N	t	2026-06-17 12:23:53.952	2026-06-17 12:23:53.952
cmqi1lp4200fr54ox5syb8wru	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	AC-SHO-001-N-CH-M	\N	\N	t	2026-06-17 12:23:53.954	2026-06-17 12:23:53.954
cmqi1lp4500ft54oxtburdhuv	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	AC-SHO-001-N-CH-L	\N	\N	t	2026-06-17 12:23:53.957	2026-06-17 12:23:53.957
cmqi1lp4700fv54oxupku4g9p	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	AC-SHO-001-N-CH-XL	\N	\N	t	2026-06-17 12:23:53.959	2026-06-17 12:23:53.959
cmqi1lp4900fx54oxaoay2j2a	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001i54oxbb9o4v9h	AC-SHO-001-N-NA-S	\N	\N	t	2026-06-17 12:23:53.961	2026-06-17 12:23:53.961
cmqi1lp4b00fz54oxhvvqf1r7	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001j54oxjnbxb0vh	AC-SHO-001-N-NA-M	\N	\N	t	2026-06-17 12:23:53.963	2026-06-17 12:23:53.963
cmqi1lp4e00g154ox1dtqfwxv	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001k54ox8hmkthny	AC-SHO-001-N-NA-L	\N	\N	t	2026-06-17 12:23:53.966	2026-06-17 12:23:53.966
cmqi1lp4h00g354oxuz2mxi67	cmqi1lp3o00fc54ox4l4xoobi	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001l54oxx06v6eh7	AC-SHO-001-N-NA-XL	\N	\N	t	2026-06-17 12:23:53.969	2026-06-17 12:23:53.969
cmqi1lp4u00gc54ox7kk3o32f	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001i54oxbb9o4v9h	AC-JAK-001-O-OL-S	\N	\N	t	2026-06-17 12:23:53.982	2026-06-17 12:23:53.982
cmqi1lp4w00ge54oxek3yq6ni	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001j54oxjnbxb0vh	AC-JAK-001-O-OL-M	\N	\N	t	2026-06-17 12:23:53.985	2026-06-17 12:23:53.985
cmqi1lp5000gg54ox8ckb13iy	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001k54ox8hmkthny	AC-JAK-001-O-OL-L	\N	\N	t	2026-06-17 12:23:53.988	2026-06-17 12:23:53.988
cmqi1lp5400gi54oxuqngt3ag	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001l54oxx06v6eh7	AC-JAK-001-O-OL-XL	\N	\N	t	2026-06-17 12:23:53.992	2026-06-17 12:23:53.992
cmqi1lp5500gk54oxsxym5v4q	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	AC-JAK-001-O-NO-S	\N	\N	t	2026-06-17 12:23:53.993	2026-06-17 12:23:53.993
cmqi1lp5600gm54oxnk4jejai	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	AC-JAK-001-O-NO-M	\N	\N	t	2026-06-17 12:23:53.994	2026-06-17 12:23:53.994
cmqi1lp5800go54ox41eqzbsz	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	AC-JAK-001-O-NO-L	\N	\N	t	2026-06-17 12:23:53.996	2026-06-17 12:23:53.996
cmqi1lp5a00gq54oxc3uhpf43	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	AC-JAK-001-O-NO-XL	\N	\N	t	2026-06-17 12:23:53.998	2026-06-17 12:23:53.998
cmqi1lp5e00gs54oxlqs5gpbk	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	AC-JAK-001-O-CH-S	\N	\N	t	2026-06-17 12:23:54.002	2026-06-17 12:23:54.002
cmqi1lp5i00gu54oxt3ktlc5b	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	AC-JAK-001-O-CH-M	\N	\N	t	2026-06-17 12:23:54.006	2026-06-17 12:23:54.006
cmqi1lp5k00gw54ox61ocb3zv	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	AC-JAK-001-O-CH-L	\N	\N	t	2026-06-17 12:23:54.008	2026-06-17 12:23:54.008
cmqi1lp5m00gy54oxc4w07sw4	cmqi1lp4q00g554oxhmro7vxv	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	AC-JAK-001-O-CH-XL	\N	\N	t	2026-06-17 12:23:54.01	2026-06-17 12:23:54.01
cmqi1lp5v00h554oxaysh6mf6	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001f54oxn1g32hjh	cmqi1lojm001i54oxbb9o4v9h	VOID-JAK-001-F-FO-S	\N	\N	t	2026-06-17 12:23:54.02	2026-06-17 12:23:54.02
cmqi1lp6000h754oxuce0zxrd	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001f54oxn1g32hjh	cmqi1lojm001j54oxjnbxb0vh	VOID-JAK-001-F-FO-M	\N	\N	t	2026-06-17 12:23:54.024	2026-06-17 12:23:54.024
cmqi1lp6400h954ox5169leo2	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001f54oxn1g32hjh	cmqi1lojm001k54ox8hmkthny	VOID-JAK-001-F-FO-L	\N	\N	t	2026-06-17 12:23:54.028	2026-06-17 12:23:54.028
cmqi1lp6800hb54oxgsrp519v	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001f54oxn1g32hjh	cmqi1lojm001l54oxx06v6eh7	VOID-JAK-001-F-FO-XL	\N	\N	t	2026-06-17 12:23:54.032	2026-06-17 12:23:54.032
cmqi1lp6a00hd54oxvmmtn3nw	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001f54oxn1g32hjh	cmqi1lojm001m54oxloqkmau4	VOID-JAK-001-F-FO-XXL	\N	\N	t	2026-06-17 12:23:54.034	2026-06-17 12:23:54.034
cmqi1lp6c00hf54oxzg1xhgv5	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	VOID-JAK-001-F-NO-S	\N	\N	t	2026-06-17 12:23:54.036	2026-06-17 12:23:54.036
cmqi1lp6f00hh54oxvil1cclb	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	VOID-JAK-001-F-NO-M	\N	\N	t	2026-06-17 12:23:54.039	2026-06-17 12:23:54.039
cmqi1lp6j00hj54oxtu0c7pc6	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	VOID-JAK-001-F-NO-L	\N	\N	t	2026-06-17 12:23:54.043	2026-06-17 12:23:54.043
cmqi1lp6m00hl54ox73hzhzke	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	VOID-JAK-001-F-NO-XL	\N	\N	t	2026-06-17 12:23:54.046	2026-06-17 12:23:54.046
cmqi1lp6p00hn54oxpparc3ca	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001754oxays3djg2	cmqi1lojm001m54oxloqkmau4	VOID-JAK-001-F-NO-XXL	\N	\N	t	2026-06-17 12:23:54.049	2026-06-17 12:23:54.049
cmqi1lp6r00hp54oxsleoaox6	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	VOID-JAK-001-F-CH-S	\N	\N	t	2026-06-17 12:23:54.051	2026-06-17 12:23:54.051
cmqi1lp6t00hr54oxw41yehwi	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	VOID-JAK-001-F-CH-M	\N	\N	t	2026-06-17 12:23:54.053	2026-06-17 12:23:54.053
cmqi1lp6x00ht54oxv6913bik	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	VOID-JAK-001-F-CH-L	\N	\N	t	2026-06-17 12:23:54.057	2026-06-17 12:23:54.057
cmqi1lp7000hv54ox2fof9swo	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	VOID-JAK-001-F-CH-XL	\N	\N	t	2026-06-17 12:23:54.06	2026-06-17 12:23:54.06
cmqi1lp7400hx54oxqcwq21vj	cmqi1lp5s00h054oxylkl3dve	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001m54oxloqkmau4	VOID-JAK-001-F-CH-XXL	\N	\N	t	2026-06-17 12:23:54.064	2026-06-17 12:23:54.064
cmqi1lp7g00i654oxc3tv10xx	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001h54oxgyzs5puv	OL-COT-001-C-CH-XS	\N	\N	t	2026-06-17 12:23:54.076	2026-06-17 12:23:54.076
cmqi1lp7j00i854ox3zqx3fgw	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001i54oxbb9o4v9h	OL-COT-001-C-CH-S	\N	\N	t	2026-06-17 12:23:54.079	2026-06-17 12:23:54.079
cmqi1lp7m00ia54oxcjqwiixn	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	OL-COT-001-C-CH-M	\N	\N	t	2026-06-17 12:23:54.082	2026-06-17 12:23:54.082
cmqi1lp7p00ic54oxz82jftg7	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	OL-COT-001-C-CH-L	\N	\N	t	2026-06-17 12:23:54.085	2026-06-17 12:23:54.085
cmqi1lp7s00ie54oxvwgksx9y	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001l54oxx06v6eh7	OL-COT-001-C-CH-XL	\N	\N	t	2026-06-17 12:23:54.088	2026-06-17 12:23:54.088
cmqi1lp7v00ig54ox81e58h58	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001754oxays3djg2	cmqi1lojm001h54oxgyzs5puv	OL-COT-001-C-NO-XS	\N	\N	t	2026-06-17 12:23:54.091	2026-06-17 12:23:54.091
cmqi1lp7y00ii54oxro7nx2yb	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	OL-COT-001-C-NO-S	\N	\N	t	2026-06-17 12:23:54.094	2026-06-17 12:23:54.094
cmqi1lp8200ik54ox09cu92xi	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	OL-COT-001-C-NO-M	\N	\N	t	2026-06-17 12:23:54.098	2026-06-17 12:23:54.098
cmqi1lp8600im54oxvlz9s72p	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	OL-COT-001-C-NO-L	\N	\N	t	2026-06-17 12:23:54.102	2026-06-17 12:23:54.102
cmqi1lp8a00io54ox1wo2ordo	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	OL-COT-001-C-NO-XL	\N	\N	t	2026-06-17 12:23:54.106	2026-06-17 12:23:54.106
cmqi1lp8d00iq54oxqj7qzu2f	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001h54oxgyzs5puv	OL-COT-001-C-NA-XS	\N	\N	t	2026-06-17 12:23:54.109	2026-06-17 12:23:54.109
cmqi1lp8g00is54oxfsbr0zpr	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001i54oxbb9o4v9h	OL-COT-001-C-NA-S	\N	\N	t	2026-06-17 12:23:54.112	2026-06-17 12:23:54.112
cmqi1lp8i00iu54oxdcitp00y	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001j54oxjnbxb0vh	OL-COT-001-C-NA-M	\N	\N	t	2026-06-17 12:23:54.114	2026-06-17 12:23:54.114
cmqi1lp8m00iw54oxzhs1fn8b	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001k54ox8hmkthny	OL-COT-001-C-NA-L	\N	\N	t	2026-06-17 12:23:54.118	2026-06-17 12:23:54.118
cmqi1lp8o00iy54oxquvtbtfh	cmqi1lp7b00hz54oxlgaoxrld	cmqi1lojh001b54ox748wd3w1	cmqi1lojm001l54oxx06v6eh7	OL-COT-001-C-NA-XL	\N	\N	t	2026-06-17 12:23:54.12	2026-06-17 12:23:54.12
cmqi1lp8w00j554oxo6q5sd75	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001h54oxgyzs5puv	APC-COT-001-S-SA-XS	\N	\N	t	2026-06-17 12:23:54.128	2026-06-17 12:23:54.128
cmqi1lp9000j754oxy0dq4s66	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001i54oxbb9o4v9h	APC-COT-001-S-SA-S	\N	\N	t	2026-06-17 12:23:54.132	2026-06-17 12:23:54.132
cmqi1lp9200j954ox28435xu0	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001j54oxjnbxb0vh	APC-COT-001-S-SA-M	\N	\N	t	2026-06-17 12:23:54.134	2026-06-17 12:23:54.134
cmqi1lp9300jb54oxha1vzc1i	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001k54ox8hmkthny	APC-COT-001-S-SA-L	\N	\N	t	2026-06-17 12:23:54.135	2026-06-17 12:23:54.135
cmqi1lp9600jd54ox6zg0g613	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001l54oxx06v6eh7	APC-COT-001-S-SA-XL	\N	\N	t	2026-06-17 12:23:54.138	2026-06-17 12:23:54.138
cmqi1lp9a00jf54oxzx5oz2id	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001754oxays3djg2	cmqi1lojm001h54oxgyzs5puv	APC-COT-001-S-NO-XS	\N	\N	t	2026-06-17 12:23:54.142	2026-06-17 12:23:54.142
cmqi1lp9f00jh54oxvil4fo80	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001754oxays3djg2	cmqi1lojm001i54oxbb9o4v9h	APC-COT-001-S-NO-S	\N	\N	t	2026-06-17 12:23:54.147	2026-06-17 12:23:54.147
cmqi1lp9h00jj54oxwlcbdiv8	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	APC-COT-001-S-NO-M	\N	\N	t	2026-06-17 12:23:54.149	2026-06-17 12:23:54.149
cmqi1lp9k00jl54oxdlyd3ppr	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	APC-COT-001-S-NO-L	\N	\N	t	2026-06-17 12:23:54.152	2026-06-17 12:23:54.152
cmqi1lp9n00jn54ox1vrhhcr7	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001754oxays3djg2	cmqi1lojm001l54oxx06v6eh7	APC-COT-001-S-NO-XL	\N	\N	t	2026-06-17 12:23:54.155	2026-06-17 12:23:54.155
cmqi1lp9p00jp54oxz3yxnzxr	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001h54oxgyzs5puv	APC-COT-001-S-EC-XS	\N	\N	t	2026-06-17 12:23:54.157	2026-06-17 12:23:54.157
cmqi1lp9r00jr54oxlbr2vg07	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001i54oxbb9o4v9h	APC-COT-001-S-EC-S	\N	\N	t	2026-06-17 12:23:54.159	2026-06-17 12:23:54.159
cmqi1lp9t00jt54oxceh0o8cv	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001j54oxjnbxb0vh	APC-COT-001-S-EC-M	\N	\N	t	2026-06-17 12:23:54.161	2026-06-17 12:23:54.161
cmqi1lp9u00jv54oxl4q6jz6f	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001k54ox8hmkthny	APC-COT-001-S-EC-L	\N	\N	t	2026-06-17 12:23:54.162	2026-06-17 12:23:54.162
cmqi1lp9x00jx54oxew9kbotl	cmqi1lp8t00j054oxayvz0l5j	cmqi1lojh001c54oxxauuh1fu	cmqi1lojm001l54oxx06v6eh7	APC-COT-001-S-EC-XL	\N	\N	t	2026-06-17 12:23:54.165	2026-06-17 12:23:54.165
cmqi1lpa700k454oxvjzdy47b	cmqi1lpa300jz54oxnqvqt1of	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	AC-BAG-001-N-NO-M	\N	\N	t	2026-06-17 12:23:54.175	2026-06-17 12:23:54.175
cmqi1lpa900k654oxydu38fab	cmqi1lpa300jz54oxnqvqt1of	cmqi1lojh001g54oxobsuur8x	cmqi1lojm001j54oxjnbxb0vh	AC-BAG-001-N-SA-M	\N	\N	t	2026-06-17 12:23:54.177	2026-06-17 12:23:54.177
cmqi1lpah00kd54oxlexjsnsx	cmqi1lpae00k854ox304ap6gc	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001j54oxjnbxb0vh	VOID-HAT-001-C-CH-M	\N	\N	t	2026-06-17 12:23:54.185	2026-06-17 12:23:54.185
cmqi1lpal00kf54oxq3s58us2	cmqi1lpae00k854ox304ap6gc	cmqi1lojh001a54ox0fso6lhy	cmqi1lojm001k54ox8hmkthny	VOID-HAT-001-C-CH-L	\N	\N	t	2026-06-17 12:23:54.189	2026-06-17 12:23:54.189
cmqi1lpan00kh54ox7nndouik	cmqi1lpae00k854ox304ap6gc	cmqi1lojh001754oxays3djg2	cmqi1lojm001j54oxjnbxb0vh	VOID-HAT-001-C-NO-M	\N	\N	t	2026-06-17 12:23:54.191	2026-06-17 12:23:54.191
cmqi1lpaq00kj54oxm3xjl95h	cmqi1lpae00k854ox304ap6gc	cmqi1lojh001754oxays3djg2	cmqi1lojm001k54ox8hmkthny	VOID-HAT-001-C-NO-L	\N	\N	t	2026-06-17 12:23:54.194	2026-06-17 12:23:54.194
cmqi1lpat00kl54oxdm3swh0x	cmqi1lpae00k854ox304ap6gc	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001j54oxjnbxb0vh	VOID-HAT-001-C-OL-M	\N	\N	t	2026-06-17 12:23:54.197	2026-06-17 12:23:54.197
cmqi1lpav00kn54ox6lr9zq3w	cmqi1lpae00k854ox304ap6gc	cmqi1lojh001d54ox4we9uefj	cmqi1lojm001k54ox8hmkthny	VOID-HAT-001-C-OL-L	\N	\N	t	2026-06-17 12:23:54.199	2026-06-17 12:23:54.199
cmqi1lpb600kv54oxz64qwt3y	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001854oxoke8coub	cmqi1lojr001t54oxd2c00wjo	AC-SNK-001-B-BL-39	\N	\N	t	2026-06-17 12:23:54.21	2026-06-17 12:23:54.21
cmqi1lpb800kx54oxxt41xpgm	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001854oxoke8coub	cmqi1lojr001u54oxfsrin5o9	AC-SNK-001-B-BL-40	\N	\N	t	2026-06-17 12:23:54.212	2026-06-17 12:23:54.212
cmqi1lpbc00kz54oxn6bz2tdv	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001854oxoke8coub	cmqi1lojr001v54ox5eogfpf6	AC-SNK-001-B-BL-41	\N	\N	t	2026-06-17 12:23:54.216	2026-06-17 12:23:54.216
cmqi1lpbf00l154oxzxzovp99	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001854oxoke8coub	cmqi1lojr001w54oxn9lhw1ns	AC-SNK-001-B-BL-42	\N	\N	t	2026-06-17 12:23:54.219	2026-06-17 12:23:54.219
cmqi1lpbk00l354oxll7vc3d5	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001854oxoke8coub	cmqi1lojs001x54oxzqu9iy6t	AC-SNK-001-B-BL-43	\N	\N	t	2026-06-17 12:23:54.224	2026-06-17 12:23:54.224
cmqi1lpbn00l554oxvw6bpnss	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001854oxoke8coub	cmqi1lojs001y54oxcsd1er6o	AC-SNK-001-B-BL-44	\N	\N	t	2026-06-17 12:23:54.227	2026-06-17 12:23:54.227
cmqi1lpbr00l754oxae3g2whk	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001754oxays3djg2	cmqi1lojr001t54oxd2c00wjo	AC-SNK-001-B-NO-39	\N	\N	t	2026-06-17 12:23:54.231	2026-06-17 12:23:54.231
cmqi1lpbv00l954oxobbgw5dx	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001754oxays3djg2	cmqi1lojr001u54oxfsrin5o9	AC-SNK-001-B-NO-40	\N	\N	t	2026-06-17 12:23:54.235	2026-06-17 12:23:54.235
cmqi1lpbz00lb54oxq3jbasv2	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001754oxays3djg2	cmqi1lojr001v54ox5eogfpf6	AC-SNK-001-B-NO-41	\N	\N	t	2026-06-17 12:23:54.239	2026-06-17 12:23:54.239
cmqi1lpc200ld54oxq57mhofs	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001754oxays3djg2	cmqi1lojr001w54oxn9lhw1ns	AC-SNK-001-B-NO-42	\N	\N	t	2026-06-17 12:23:54.242	2026-06-17 12:23:54.242
cmqi1lpc500lf54oxd3devpjj	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001754oxays3djg2	cmqi1lojs001x54oxzqu9iy6t	AC-SNK-001-B-NO-43	\N	\N	t	2026-06-17 12:23:54.245	2026-06-17 12:23:54.245
cmqi1lpc700lh54oxaea1dar9	cmqi1lpb200kp54oxna5cwmew	cmqi1lojh001754oxays3djg2	cmqi1lojs001y54oxcsd1er6o	AC-SNK-001-B-NO-44	\N	\N	t	2026-06-17 12:23:54.247	2026-06-17 12:23:54.247
cmqi1lpcj00lq54ox3z3rixd3	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001754oxays3djg2	cmqi1lojr001t54oxd2c00wjo	OL-BOT-001-N-NO-39	\N	\N	t	2026-06-17 12:23:54.259	2026-06-17 12:23:54.259
cmqi1lpcm00ls54ox1pg83dsx	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001754oxays3djg2	cmqi1lojr001u54oxfsrin5o9	OL-BOT-001-N-NO-40	\N	\N	t	2026-06-17 12:23:54.262	2026-06-17 12:23:54.262
cmqi1lpcq00lu54ox7d1m9qc3	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001754oxays3djg2	cmqi1lojr001v54ox5eogfpf6	OL-BOT-001-N-NO-41	\N	\N	t	2026-06-17 12:23:54.266	2026-06-17 12:23:54.266
cmqi1lpcu00lw54ox2y86amam	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001754oxays3djg2	cmqi1lojr001w54oxn9lhw1ns	OL-BOT-001-N-NO-42	\N	\N	t	2026-06-17 12:23:54.27	2026-06-17 12:23:54.27
cmqi1lpcx00ly54oxfvekue6h	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001754oxays3djg2	cmqi1lojs001x54oxzqu9iy6t	OL-BOT-001-N-NO-43	\N	\N	t	2026-06-17 12:23:54.273	2026-06-17 12:23:54.273
cmqi1lpd000m054ox9vjbecgx	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001754oxays3djg2	cmqi1lojs001y54oxcsd1er6o	OL-BOT-001-N-NO-44	\N	\N	t	2026-06-17 12:23:54.276	2026-06-17 12:23:54.276
cmqi1lpd300m254oxhn0tra42	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001a54ox0fso6lhy	cmqi1lojr001t54oxd2c00wjo	OL-BOT-001-N-CH-39	\N	\N	t	2026-06-17 12:23:54.279	2026-06-17 12:23:54.279
cmqi1lpd500m454ox65gx4bwa	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001a54ox0fso6lhy	cmqi1lojr001u54oxfsrin5o9	OL-BOT-001-N-CH-40	\N	\N	t	2026-06-17 12:23:54.281	2026-06-17 12:23:54.281
cmqi1lpd700m654ox9g6t22rf	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001a54ox0fso6lhy	cmqi1lojr001v54ox5eogfpf6	OL-BOT-001-N-CH-41	\N	\N	t	2026-06-17 12:23:54.283	2026-06-17 12:23:54.283
cmqi1lpd900m854oxworwcd85	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001a54ox0fso6lhy	cmqi1lojr001w54oxn9lhw1ns	OL-BOT-001-N-CH-42	\N	\N	t	2026-06-17 12:23:54.285	2026-06-17 12:23:54.285
cmqi1lpdb00ma54oxjm05pruf	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001a54ox0fso6lhy	cmqi1lojs001x54oxzqu9iy6t	OL-BOT-001-N-CH-43	\N	\N	t	2026-06-17 12:23:54.287	2026-06-17 12:23:54.287
cmqi1lpdf00mc54ox2l3f5t0u	cmqi1lpce00lj54oxj0hum6yl	cmqi1lojh001a54ox0fso6lhy	cmqi1lojs001y54oxcsd1er6o	OL-BOT-001-N-CH-44	\N	\N	t	2026-06-17 12:23:54.291	2026-06-17 12:23:54.291
cmqi1lpdq00mj54oxjdi65k6i	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001b54ox748wd3w1	cmqi1lojr001t54oxd2c00wjo	MARZ-SNK-001-N-NA-39	\N	\N	t	2026-06-17 12:23:54.302	2026-06-17 12:23:54.302
cmqi1lpdu00ml54oxd6qw4li0	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001b54ox748wd3w1	cmqi1lojr001u54oxfsrin5o9	MARZ-SNK-001-N-NA-40	\N	\N	t	2026-06-17 12:23:54.306	2026-06-17 12:23:54.306
cmqi1lpdy00mn54oxp7v6xdpl	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001b54ox748wd3w1	cmqi1lojr001v54ox5eogfpf6	MARZ-SNK-001-N-NA-41	\N	\N	t	2026-06-17 12:23:54.31	2026-06-17 12:23:54.31
cmqi1lpe100mp54oxhoowieh7	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001b54ox748wd3w1	cmqi1lojr001w54oxn9lhw1ns	MARZ-SNK-001-N-NA-42	\N	\N	t	2026-06-17 12:23:54.313	2026-06-17 12:23:54.313
cmqi1lpe300mr54oxhvvxzol7	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001b54ox748wd3w1	cmqi1lojs001x54oxzqu9iy6t	MARZ-SNK-001-N-NA-43	\N	\N	t	2026-06-17 12:23:54.315	2026-06-17 12:23:54.315
cmqi1lpe400mt54oxuqi6lj85	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001b54ox748wd3w1	cmqi1lojs001y54oxcsd1er6o	MARZ-SNK-001-N-NA-44	\N	\N	t	2026-06-17 12:23:54.316	2026-06-17 12:23:54.316
cmqi1lpe600mv54ox27y98suw	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001754oxays3djg2	cmqi1lojr001t54oxd2c00wjo	MARZ-SNK-001-N-NO-39	\N	\N	t	2026-06-17 12:23:54.318	2026-06-17 12:23:54.318
cmqi1lpe900mx54oxlqxexcfm	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001754oxays3djg2	cmqi1lojr001u54oxfsrin5o9	MARZ-SNK-001-N-NO-40	\N	\N	t	2026-06-17 12:23:54.321	2026-06-17 12:23:54.321
cmqi1lpeb00mz54oxd86e5xre	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001754oxays3djg2	cmqi1lojr001v54ox5eogfpf6	MARZ-SNK-001-N-NO-41	\N	\N	t	2026-06-17 12:23:54.323	2026-06-17 12:23:54.323
cmqi1lped00n154ox97tm03dg	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001754oxays3djg2	cmqi1lojr001w54oxn9lhw1ns	MARZ-SNK-001-N-NO-42	\N	\N	t	2026-06-17 12:23:54.325	2026-06-17 12:23:54.325
cmqi1lpef00n354oxykeibgsl	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001754oxays3djg2	cmqi1lojs001x54oxzqu9iy6t	MARZ-SNK-001-N-NO-43	\N	\N	t	2026-06-17 12:23:54.327	2026-06-17 12:23:54.327
cmqi1lpeh00n554oxs9bjd7lm	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001754oxays3djg2	cmqi1lojs001y54oxcsd1er6o	MARZ-SNK-001-N-NO-44	\N	\N	t	2026-06-17 12:23:54.329	2026-06-17 12:23:54.329
cmqi1lpei00n754oxcj21ovwo	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001954oxdt6ol2on	cmqi1lojr001t54oxd2c00wjo	MARZ-SNK-001-N-SL-39	\N	\N	t	2026-06-17 12:23:54.33	2026-06-17 12:23:54.33
cmqi1lpek00n954oxtttrpwbm	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001954oxdt6ol2on	cmqi1lojr001u54oxfsrin5o9	MARZ-SNK-001-N-SL-40	\N	\N	t	2026-06-17 12:23:54.332	2026-06-17 12:23:54.332
cmqi1lpem00nb54oxeilgaweo	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001954oxdt6ol2on	cmqi1lojr001v54ox5eogfpf6	MARZ-SNK-001-N-SL-41	\N	\N	t	2026-06-17 12:23:54.334	2026-06-17 12:23:54.334
cmqi1lpen00nd54ox83mfnz8i	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001954oxdt6ol2on	cmqi1lojr001w54oxn9lhw1ns	MARZ-SNK-001-N-SL-42	\N	\N	t	2026-06-17 12:23:54.335	2026-06-17 12:23:54.335
cmqi1lpeo00nf54oxzicksp99	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001954oxdt6ol2on	cmqi1lojs001x54oxzqu9iy6t	MARZ-SNK-001-N-SL-43	\N	\N	t	2026-06-17 12:23:54.336	2026-06-17 12:23:54.336
cmqi1lper00nh54oxmxsvr68v	cmqi1lpdm00me54oxgc9j2sfe	cmqi1lojh001954oxdt6ol2on	cmqi1lojs001y54oxcsd1er6o	MARZ-SNK-001-N-SL-44	\N	\N	t	2026-06-17 12:23:54.339	2026-06-17 12:23:54.339
\.


--
-- TOC entry 5490 (class 0 OID 16635)
-- Dependencies: 227
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, sku, description, "shortDescription", "categoryId", "subCategoryId", "brandId", gender, material, "careInstructions", "basePrice", "comparePrice", "isFeatured", "isActive", "isNewArrival", "isBestSeller", "soldCount", "viewCount", "avgRating", "reviewCount", weight, tags, "metaTitle", "metaDescription", "createdAt", "updatedAt") FROM stdin;
cmqi1lokb001z54ox3mcsmy1m	Essential Polo — Noir	essential-polo-noir	AC-POL-001-N	A classic silhouette constructed from highly-breathable luxury piqué cotton. Stripped of all branding, featuring a sharp structured collar and three-button placket.	Heavyweight piqué polo in midnight black.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000v54oxe19g8g0u	cmqi1lofu000f54oxtr4urzwt	MALE	100% Giza Cotton	\N	1200000.00	1500000.00	t	t	f	t	0	0	0.00	0	\N	{polo,cotton,essential,noir}	Essential Polo — Noir | Achromatic	Heavyweight piqué polo in midnight black.	2026-06-17 12:23:53.243	2026-06-17 12:23:53.243
cmqi1lol4002m54ox0qw6gffy	Piqué Polo — Blanc	pique-polo-blanc	AC-POL-002-B	The Blanc edition of our signature polo. Same precision construction in a pristine white that creates maximum visual impact. The structured collar holds its form through repeated wear.	Structural piqué polo in clean white.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000v54oxe19g8g0u	cmqi1lofu000f54oxtr4urzwt	MALE	100% Giza Cotton	\N	1200000.00	1500000.00	f	t	t	f	0	0	0.00	0	\N	{polo,cotton,blanc,new}	Piqué Polo — Blanc | Achromatic	Structural piqué polo in clean white.	2026-06-17 12:23:53.272	2026-06-17 12:23:53.272
cmqi1lolp003854oxue2vyy5l	Technical Polo — Slate	technical-polo-slate	AC-POL-003-S	Performance meets luxury. Crafted from advanced moisture-wicking piqué fabric with four-way stretch. Minimal branding, maximum utility. Perfect from court to cocktail.	Performance polo in slate grey.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000v54oxe19g8g0u	cmqi1lofu000g54oxvz7702yh	MALE	80% Coolmax Polyester, 20% Elastane	\N	980000.00	\N	f	t	f	t	0	0	0.00	0	\N	{polo,performance,slate,technical}	Technical Polo — Slate | Achromatic	Performance polo in slate grey.	2026-06-17 12:23:53.293	2026-06-17 12:23:53.293
cmqi1lomt004d54oxo1t1mrqf	Structured T-Shirt — Blanc	structured-tshirt-blanc	AC-TSH-001-B	Engineered from ultra-dense organic jersey cotton. The structured cut fits loosely through the body, maintaining a crisp, geometric shape even after multiple wears.	Premium organic cotton tee with architectural drape.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000u54oxzkm4993i	cmqi1lofu000f54oxtr4urzwt	MALE	100% Organic Cotton	\N	850000.00	1100000.00	t	t	t	f	0	0	0.00	0	\N	{t-shirt,organic,blanc,essentials}	Structured T-Shirt — Blanc | Achromatic	Premium organic cotton tee with architectural drape.	2026-06-17 12:23:53.333	2026-06-17 12:23:53.333
cmqi1lonm005354oxfr014lxd	Oversized Tee — Charcoal	oversized-tee-charcoal	AC-TSH-002-C	A generously proportioned silhouette that rewards the minimalist aesthetic. Cut from heavyweight 320 GSM jersey with precise dropped shoulders and a subtle boxy hem.	Heavyweight oversized tee in deep charcoal.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000u54oxzkm4993i	cmqi1lofu000f54oxtr4urzwt	MALE	100% Ring-Spun Cotton	\N	950000.00	\N	f	t	t	f	0	0	0.00	0	\N	{t-shirt,oversized,charcoal,heavy}	Oversized Tee — Charcoal | Achromatic	Heavyweight oversized tee in deep charcoal.	2026-06-17 12:23:53.362	2026-06-17 12:23:53.362
cmqi1lope006354oxjw7fjoz0	Longline Tee — Ecru	longline-tee-ecru	UNI-TSH-001-E	Inspired by Japanese workwear tradition. An elongated silhouette in warm ecru cotton jersey. Split hem, crew neck, and clean minimal construction.	Japanese-inspired longline tee in warm ecru.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000u54oxzkm4993i	cmqi1lofu000l54oxnnrk5xyb	MALE	100% Supima Cotton	\N	750000.00	900000.00	f	t	f	t	0	0	0.00	0	\N	{t-shirt,longline,ecru,japanese}	Longline Tee — Ecru | Achromatic	Japanese-inspired longline tee in warm ecru.	2026-06-17 12:23:53.426	2026-06-17 12:23:53.426
cmqi1loqn007254ox95qtmqug	Classic Oxford — Slate	classic-oxford-slate	AC-SHT-001-S	An architectural take on the classic button-down. Formulated from premium slate grey Oxford weave with subtle textured depth, featuring a clean hidden button-down collar.	Structured Oxford shirt in heritage slate grey.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000w54ox2cqowzf6	cmqi1lofu000f54oxtr4urzwt	MALE	100% Suprima Cotton Oxford	\N	1800000.00	2200000.00	f	t	f	t	0	0	0.00	0	\N	{shirt,oxford,slate,formal}	Classic Oxford — Slate | Achromatic	Structured Oxford shirt in heritage slate grey.	2026-06-17 12:23:53.471	2026-06-17 12:23:53.471
cmqi1lorb007o54oxohy9zxbk	Japanese Linen Shirt — Navy	japanese-linen-shirt-navy	AC-SHT-002-N	Washed Japanese linen in a refined navy. The garment-dye process creates subtle variation, giving each piece a unique character. Long-staple fibers ensure exceptional longevity.	Garment-dyed linen shirt with wabi-sabi character.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000w54ox2cqowzf6	cmqi1lofu000f54oxtr4urzwt	MALE	100% Japanese Linen	\N	2100000.00	2600000.00	t	t	t	f	0	0	0.00	0	\N	{shirt,linen,japanese,navy,summer}	Japanese Linen Shirt — Navy | Achromatic	Garment-dyed linen shirt with wabi-sabi character.	2026-06-17 12:23:53.495	2026-06-17 12:23:53.495
cmqi1los2008954ox5kv69mft	Band Collar Shirt — Ecru	band-collar-shirt-ecru	APC-SHT-001-E	A Parisian take on the classic work shirt. The band collar eliminates the need for a tie while maintaining a refined, elevated aesthetic. Lightweight poplin for year-round wear.	Refined Parisian band collar shirt in ecru poplin.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000w54ox2cqowzf6	cmqi1lofu000j54ox7k85ga31	MALE	100% Cotton Poplin	\N	2400000.00	2900000.00	f	t	f	f	0	0	0.00	0	\N	{shirt,"band collar",ecru,parisian}	Band Collar Shirt — Ecru | Achromatic	Refined Parisian band collar shirt in ecru poplin.	2026-06-17 12:23:53.522	2026-06-17 12:23:53.522
cmqi1loth009954oxb6b3m02c	Overshirt — Olive	overshirt-olive	VOID-OSH-001-O	The utilitarian overshirt redefined. A structured outer layer in premium olive cotton twill with chest pockets and a clean-lined silhouette that transitions effortlessly between seasons.	Utility overshirt in premium olive twill.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000w54ox2cqowzf6	cmqi1lofu000h54oxj32yqfqb	MALE	100% Cotton Twill	\N	1600000.00	2000000.00	f	t	t	f	0	0	0.00	0	\N	{overshirt,olive,utility,layering}	Overshirt — Olive | Achromatic	Utility overshirt in premium olive twill.	2026-06-17 12:23:53.573	2026-06-17 12:23:53.573
cmqi1loun00a854oxu1cifj1d	Merino Crewneck — Charcoal	merino-crewneck-charcoal	APC-KNT-001-C	Pure Merino wool in a refined crewneck silhouette. Ultra-fine gauge construction in deep charcoal. A true wardrobe cornerstone that transitions effortlessly from casual to formal settings.	Fine gauge Merino wool crewneck in deep charcoal.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000x54oxuynzm341	cmqi1lofu000j54ox7k85ga31	MALE	100% Extra Fine Merino Wool	\N	2800000.00	3500000.00	t	t	f	t	0	0	0.00	0	\N	{knitwear,merino,crewneck,charcoal}	Merino Crewneck — Charcoal | Achromatic	Fine gauge Merino wool crewneck in deep charcoal.	2026-06-17 12:23:53.615	2026-06-17 12:23:53.615
cmqi1lowy00bi54oxfjl58nl8	Cashmere Turtleneck — Noir	cashmere-turtleneck-noir	OL-KNT-001-N	The definitive turtleneck in Grade A Mongolian cashmere. A clean architectural silhouette, impossibly soft to the touch. The type of piece that defines a wardrobe for decades.	Grade A Mongolian cashmere turtleneck.	cmqi1loiz000p54oxzd189ngg	cmqi1loj3000x54oxuynzm341	cmqi1lofu000m54ox768wysqo	MALE	100% Grade A Mongolian Cashmere	\N	4500000.00	5500000.00	t	t	f	t	0	0	0.00	0	\N	{cashmere,turtleneck,noir,luxury}	Cashmere Turtleneck — Noir | Achromatic	Grade A Mongolian cashmere turtleneck.	2026-06-17 12:23:53.698	2026-06-17 12:23:53.698
cmqi1loyu00cj54oxd925jrd6	Tailored Trousers — Charcoal	tailored-trousers-charcoal	AC-TRS-001-C	Perfectly balanced tailored trousers designed to transition seamlessly from architectural studios to high-end galleries. Constructed from a premium wool-viscose blend.	Precision-cut trousers in premium wool-viscose.	cmqi1loiz000q54oxwayh36g8	cmqi1loj9000y54ox2zsazujc	cmqi1lofu000f54oxtr4urzwt	MALE	55% Virgin Wool, 45% Viscose	\N	2200000.00	2800000.00	t	t	f	f	0	0	0.00	0	\N	{trousers,wool,charcoal,tailored}	Tailored Trousers — Charcoal | Achromatic	Precision-cut trousers in premium wool-viscose.	2026-06-17 12:23:53.766	2026-06-17 12:23:53.766
cmqi1lp0k00dc54ox906d9f3n	Wide-Leg Trousers — Ecru	wide-leg-trousers-ecru	APC-TRS-001-E	A contemporary silhouette with historical roots. Wide-leg trousers in a luxurious ecru linen blend. Relaxed through the hip and thigh, with a subtle taper at the hem.	Contemporary wide-leg linen trousers in ecru.	cmqi1loiz000q54oxwayh36g8	cmqi1loj9000y54ox2zsazujc	cmqi1lofu000j54ox7k85ga31	MALE	60% Linen, 40% Cotton	\N	2500000.00	3100000.00	f	t	t	f	0	0	0.00	0	\N	{trousers,wide-leg,linen,ecru}	Wide-Leg Trousers — Ecru | Achromatic	Contemporary wide-leg linen trousers in ecru.	2026-06-17 12:23:53.828	2026-06-17 12:23:53.828
cmqi1lp2500ec54oxb928qwyd	Cargo Trousers — Olive	cargo-trousers-olive	CPR-TRS-001-O	The utilitarian cargo reimagined for the contemporary wardrobe. Multiple functional pockets in a clean, streamlined design that avoids the bulk typical of the category.	Streamlined cargo trousers in military olive.	cmqi1loiz000q54oxwayh36g8	cmqi1loj9000y54ox2zsazujc	cmqi1lofu000k54ox0prklx1t	MALE	100% Ripstop Cotton	\N	3200000.00	3800000.00	f	t	f	t	0	0	0.00	0	\N	{cargo,trousers,olive,utility}	Cargo Trousers — Olive | Achromatic	Streamlined cargo trousers in military olive.	2026-06-17 12:23:53.885	2026-06-17 12:23:53.885
cmqi1lp3o00fc54ox4l4xoobi	Drawstring Shorts — Noir	drawstring-shorts-noir	AC-SHO-001-N	Minimalist shorts for the warm season. Constructed from medium-weight washed cotton with an internal drawstring and clean, unbranded design. Above-the-knee length for a contemporary proportion.	Clean minimal shorts in washed black cotton.	cmqi1loiz000q54oxwayh36g8	cmqi1loj9000z54ox73adk26t	cmqi1lofu000f54oxtr4urzwt	MALE	100% Washed Cotton	\N	850000.00	\N	f	t	t	f	0	0	0.00	0	\N	{shorts,noir,summer,minimalist}	Drawstring Shorts — Noir | Achromatic	Clean minimal shorts in washed black cotton.	2026-06-17 12:23:53.94	2026-06-17 12:23:53.94
cmqi1lp4q00g554oxhmro7vxv	Field Jacket — Olive	field-jacket-olive	AC-JAK-001-O	A refined interpretation of the military field jacket. Constructed from a dense 400g cotton canvas with a minimal patch pocket arrangement. Oversized silhouette with internal structure.	Military-inspired field jacket in olive canvas.	cmqi1loiz000r54oxhaprjkql	cmqi1lojb001154oxilnv7eu7	cmqi1lofu000f54oxtr4urzwt	MALE	100% Cotton Canvas 400g	\N	4800000.00	5800000.00	t	t	t	f	0	0	0.00	0	\N	{jacket,field,olive,outerwear,military}	Field Jacket — Olive | Achromatic	Military-inspired field jacket in olive canvas.	2026-06-17 12:23:53.978	2026-06-17 12:23:53.978
cmqi1lp5s00h054oxylkl3dve	Overshirt Jacket — Forest	overshirt-jacket-forest	VOID-JAK-001-F	Between a shirt and jacket — the overshirt jacket exists in its own category. Densely woven 300g cotton herringbone in deep forest green with a spread collar and button front.	Dense herringbone overshirt jacket in forest green.	cmqi1loiz000r54oxhaprjkql	cmqi1lojb001154oxilnv7eu7	cmqi1lofu000h54oxj32yqfqb	MALE	100% Cotton Herringbone 300g	\N	3500000.00	4200000.00	f	t	f	t	0	0	0.00	0	\N	{overshirt,jacket,forest,herringbone}	Overshirt Jacket — Forest | Achromatic	Dense herringbone overshirt jacket in forest green.	2026-06-17 12:23:54.016	2026-06-17 12:23:54.016
cmqi1lp7b00hz54oxlgaoxrld	Wool Overcoat — Charcoal	wool-overcoat-charcoal	OL-COT-001-C	The essential winter coat in a premium boiled wool blend. Long silhouette, minimal lapel, and clean-cut construction. A statement piece that anchors the entire wardrobe.	Premium boiled wool overcoat in deep charcoal.	cmqi1loiz000r54oxhaprjkql	cmqi1lojb001254ox9g3ojc6d	cmqi1lofu000m54ox768wysqo	MALE	80% Wool, 20% Cashmere	\N	8500000.00	10500000.00	t	t	f	t	0	0	0.00	0	\N	{coat,overcoat,wool,charcoal,winter}	Wool Overcoat — Charcoal | Achromatic	Premium boiled wool overcoat in deep charcoal.	2026-06-17 12:23:54.071	2026-06-17 12:23:54.071
cmqi1lp8t00j054oxayvz0l5j	Trench Coat — Sand	trench-coat-sand	APC-COT-001-S	A contemporary reinterpretation of the classic trench. Clean lines, storm flap, and a double-breasted closure in a warm sand cotton gabardine. The kind of coat that becomes more beautiful with age.	Contemporary trench coat in warm sand gabardine.	cmqi1loiz000r54oxhaprjkql	cmqi1lojb001254ox9g3ojc6d	cmqi1lofu000j54ox7k85ga31	MALE	100% Cotton Gabardine	\N	7200000.00	8800000.00	f	t	t	f	0	0	0.00	0	\N	{coat,trench,sand,classic}	Trench Coat — Sand | Achromatic	Contemporary trench coat in warm sand gabardine.	2026-06-17 12:23:54.125	2026-06-17 12:23:54.125
cmqi1lpa300jz54oxnqvqt1of	Tote Bag — Noir	tote-bag-noir	AC-BAG-001-N	The ultimate utilitarian bag. Heavy-duty waxed canvas with vegetable-tanned leather handles. Large enough for a day's essentials, structured enough to stand on its own.	Waxed canvas tote with leather handles in noir.	cmqi1loiz000s54oxgzcv4iwc	cmqi1lojd001354oxg5wux79l	cmqi1lofu000f54oxtr4urzwt	MALE	Waxed Canvas + Vegetable Tan Leather	\N	1800000.00	\N	f	t	f	t	0	0	0.00	0	\N	{bag,tote,canvas,noir,accessories}	Tote Bag — Noir | Achromatic	Waxed canvas tote with leather handles in noir.	2026-06-17 12:23:54.171	2026-06-17 12:23:54.171
cmqi1lpae00k854ox304ap6gc	Wool Bucket Hat — Charcoal	wool-bucket-hat-charcoal	VOID-HAT-001-C	A structured bucket hat in premium boiled wool. Wide enough brim to create presence, structured enough to hold its form. Clean and unbranded.	Premium boiled wool bucket hat in charcoal.	cmqi1loiz000s54oxgzcv4iwc	cmqi1lojd001454oxg22h3th5	cmqi1lofu000h54oxj32yqfqb	MALE	100% Boiled Wool	\N	650000.00	\N	f	t	t	f	0	0	0.00	0	\N	{hat,bucket,wool,charcoal,accessories}	Wool Bucket Hat — Charcoal | Achromatic	Premium boiled wool bucket hat in charcoal.	2026-06-17 12:23:54.182	2026-06-17 12:23:54.182
cmqi1lpb200kp54oxna5cwmew	Minimal Sneakers — Blanc	minimal-sneakers-blanc	AC-SNK-001-B	The cleanest sneaker we know how to make. Full-grain white leather upper, vulcanized sole, and a silhouette stripped of all unnecessary detail. A lifetime companion.	Ultra-clean white leather minimal sneakers.	cmqi1loiz000t54oxm5t56ibd	cmqi1loje001554oxdteqsmfh	cmqi1lofu000f54oxtr4urzwt	MALE	Full Grain Leather Upper, Vulcanized Sole	\N	3200000.00	3900000.00	t	t	f	t	0	0	0.00	0	\N	{sneakers,blanc,minimal,leather,shoes}	Minimal Sneakers — Blanc | Achromatic	Ultra-clean white leather minimal sneakers.	2026-06-17 12:23:54.206	2026-06-17 12:23:54.206
cmqi1lpce00lj54oxj0hum6yl	Chelsea Boots — Noir	chelsea-boots-noir	OL-BOT-001-N	The Chelsea boot reimagined for the 21st century wardrobe. Clean, unembellished construction in full-grain black leather with a modest block heel. An investment in classic footwear.	Clean leather Chelsea boots in midnight black.	cmqi1loiz000t54oxm5t56ibd	cmqi1lojf001654oxp6ta9s2q	cmqi1lofu000m54ox768wysqo	MALE	Full Grain Leather	\N	5800000.00	7200000.00	f	t	f	t	0	0	0.00	0	\N	{boots,chelsea,noir,leather,shoes}	Chelsea Boots — Noir | Achromatic	Clean leather Chelsea boots in midnight black.	2026-06-17 12:23:54.254	2026-06-17 12:23:54.254
cmqi1lpdm00me54oxgc9j2sfe	Low Top Sneaker — Navy	low-top-sneaker-navy	MARZ-SNK-001-N	A Vietnamese-designed sneaker with a global aesthetic. Premium suede upper in deep navy, slim silhouette and minimal branding. Locally crafted with the finest materials.	Vietnamese-designed minimal suede sneaker in navy.	cmqi1loiz000t54oxm5t56ibd	cmqi1loje001554oxdteqsmfh	cmqi1lofu000o54ox8htecvny	MALE	Premium Suede Upper	\N	2200000.00	2700000.00	f	t	t	f	0	0	0.00	0	\N	{sneakers,navy,suede,vietnam,shoes}	Low Top Sneaker — Navy | Achromatic	Vietnamese-designed minimal suede sneaker in navy.	2026-06-17 12:23:54.298	2026-06-17 12:23:54.298
\.


--
-- TOC entry 5510 (class 0 OID 16956)
-- Dependencies: 247
-- Data for Name: review_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.review_images (id, "reviewId", url, "altText") FROM stdin;
\.


--
-- TOC entry 5509 (class 0 OID 16935)
-- Dependencies: 246
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, "productId", "userId", "orderId", rating, title, body, "isVerified", "isApproved", "helpfulCount", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5521 (class 0 OID 17104)
-- Dependencies: 258
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, type, "group", label, "updatedAt") FROM stdin;
cmqi1lo2u000054oxmkfxli0u	site_name	Achromatic	string	general	Site Name	2026-06-17 12:23:52.614
cmqi1lo2w000154oxm1t00tr1	site_description	Luxury Minimalist Fashion	string	general	Description	2026-06-17 12:23:52.614
cmqi1lo2w000254oxr5l9nwrm	currency	VND	string	general	Currency	2026-06-17 12:23:52.614
cmqi1lo2w000354oxhgp925zm	free_shipping_threshold	500000	number	shipping	Free Shipping Threshold (VND)	2026-06-17 12:23:52.614
cmqi1lo2w000454ox8a13ipuw	low_stock_threshold	5	number	general	Low Stock Alert Threshold	2026-06-17 12:23:52.614
cmqi1lo2w000554ox83x0hqdn	tax_rate	10	number	general	Tax Rate (%)	2026-06-17 12:23:52.614
\.


--
-- TOC entry 5505 (class 0 OID 16876)
-- Dependencies: 242
-- Data for Name: shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_methods (id, name, description, "basePrice", "freeThreshold", "estimatedDays", "isActive", "sortOrder", "createdAt") FROM stdin;
cmqi1lpeu00nj54oxojc85vq7	Standard Delivery	Delivered within 3-5 business days	30000.00	500000.00	3-5 business days	t	1	2026-06-17 12:23:54.342
cmqi1lpew00nk54oxa0t3e7e5	Express Delivery	Delivered within 1-2 business days	60000.00	\N	1-2 business days	t	2	2026-06-17 12:23:54.344
\.


--
-- TOC entry 5506 (class 0 OID 16892)
-- Dependencies: 243
-- Data for Name: shipping_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_tracking (id, "orderId", carrier, "trackingNumber", "trackingUrl", status, events, "estimatedDelivery", "deliveredAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5488 (class 0 OID 16602)
-- Dependencies: 225
-- Data for Name: sub_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sub_categories (id, "categoryId", name, slug, description, "imageUrl", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmqi1loj3000v54oxe19g8g0u	cmqi1loiz000p54oxzd189ngg	Polos	polos	\N	\N	t	2	2026-06-17 12:23:53.199	2026-06-17 12:23:53.199
cmqi1loj3000u54oxzkm4993i	cmqi1loiz000p54oxzd189ngg	T-Shirts	t-shirts	\N	\N	t	1	2026-06-17 12:23:53.199	2026-06-17 12:23:53.199
cmqi1loj3000x54oxuynzm341	cmqi1loiz000p54oxzd189ngg	Knitwear	knitwear	\N	\N	t	4	2026-06-17 12:23:53.199	2026-06-17 12:23:53.199
cmqi1loj3000w54ox2cqowzf6	cmqi1loiz000p54oxzd189ngg	Shirts	shirts	\N	\N	t	3	2026-06-17 12:23:53.199	2026-06-17 12:23:53.199
cmqi1loj9000y54ox2zsazujc	cmqi1loiz000q54oxwayh36g8	Trousers	trousers	\N	\N	t	1	2026-06-17 12:23:53.205	2026-06-17 12:23:53.205
cmqi1loj9000z54ox73adk26t	cmqi1loiz000q54oxwayh36g8	Shorts	shorts	\N	\N	t	2	2026-06-17 12:23:53.205	2026-06-17 12:23:53.205
cmqi1loj9001054oxk2dojo1q	cmqi1loiz000q54oxwayh36g8	Denim	denim	\N	\N	t	3	2026-06-17 12:23:53.205	2026-06-17 12:23:53.205
cmqi1lojb001154oxilnv7eu7	cmqi1loiz000r54oxhaprjkql	Jackets	jackets	\N	\N	t	1	2026-06-17 12:23:53.207	2026-06-17 12:23:53.207
cmqi1lojb001254ox9g3ojc6d	cmqi1loiz000r54oxhaprjkql	Coats	coats	\N	\N	t	2	2026-06-17 12:23:53.207	2026-06-17 12:23:53.207
cmqi1lojd001354oxg5wux79l	cmqi1loiz000s54oxgzcv4iwc	Bags	bags	\N	\N	t	1	2026-06-17 12:23:53.209	2026-06-17 12:23:53.209
cmqi1lojd001454oxg22h3th5	cmqi1loiz000s54oxgzcv4iwc	Hats	hats	\N	\N	t	2	2026-06-17 12:23:53.209	2026-06-17 12:23:53.209
cmqi1lojf001654oxp6ta9s2q	cmqi1loiz000t54oxm5t56ibd	Boots	boots	\N	\N	t	2	2026-06-17 12:23:53.211	2026-06-17 12:23:53.211
cmqi1loje001554oxdteqsmfh	cmqi1loiz000t54oxm5t56ibd	Sneakers	sneakers	\N	\N	t	1	2026-06-17 12:23:53.211	2026-06-17 12:23:53.211
\.


--
-- TOC entry 5486 (class 0 OID 16564)
-- Dependencies: 223
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_addresses (id, "userId", "fullName", phone, "addressLine1", "addressLine2", ward, district, province, country, "postalCode", "isDefault", "createdAt", "updatedAt") FROM stdin;
cmqi1lofs000e54ox88q439st	cmqi1lofj000854ox77u02f43	John Doe	+84901234567	12 Nguyễn Huệ	\N	Bến Nghé	Quận 1	TP. Hồ Chí Minh	Vietnam	\N	t	2026-06-17 12:23:53.08	2026-06-17 12:23:53.08
\.


--
-- TOC entry 5485 (class 0 OID 16552)
-- Dependencies: 222
-- Data for Name: user_role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_role_permissions (id, "userId", "permissionId", "grantedAt", "grantedBy") FROM stdin;
\.


--
-- TOC entry 5483 (class 0 OID 16519)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, "firstName", "lastName", phone, "avatarUrl", role, "isActive", "isVerified", "verifyToken", "resetToken", "resetTokenExp", "refreshToken", "lastLoginAt", "createdAt", "updatedAt") FROM stdin;
cmqi1lof8000654oxu9r97x3p	admin@achromatic.vn	$2b$12$mzVHgxoC.ohDDtxA1IiIgeR/zIqkPTeGczWP/yiQGpZxiyUtlsIgW	Admin	Achromatic	\N	\N	SUPER_ADMIN	t	t	\N	\N	\N	\N	\N	2026-06-17 12:23:53.06	2026-06-17 12:23:53.06
cmqi1lofg000754ox0wwps4s4	manager@achromatic.vn	$2b$12$mzVHgxoC.ohDDtxA1IiIgeR/zIqkPTeGczWP/yiQGpZxiyUtlsIgW	Manager	Store	\N	\N	MANAGER	t	t	\N	\N	\N	\N	\N	2026-06-17 12:23:53.068	2026-06-17 12:23:53.068
cmqi1lofj000854ox77u02f43	john.doe@example.com	$2b$12$IuzWKSmmrv8tt9ppUHnUrODxM5bFfok.8ouH7OPbtQwuFdCHW7Z72	John	Doe	+84901234567	\N	CUSTOMER	t	t	\N	\N	\N	\N	\N	2026-06-17 12:23:53.071	2026-06-17 12:23:53.071
cmqi1lofl000954ox4fv58k0z	tuan.nguyen@example.com	$2b$12$IuzWKSmmrv8tt9ppUHnUrODxM5bFfok.8ouH7OPbtQwuFdCHW7Z72	Tuấn	Nguyễn	+84912345678	\N	CUSTOMER	t	t	\N	\N	\N	\N	\N	2026-06-17 12:23:53.073	2026-06-17 12:23:53.073
\.


--
-- TOC entry 5512 (class 0 OID 16978)
-- Dependencies: 249
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist_items (id, "wishlistId", "productId", "addedAt") FROM stdin;
\.


--
-- TOC entry 5511 (class 0 OID 16966)
-- Dependencies: 248
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlists (id, "userId", "createdAt", "updatedAt") FROM stdin;
cmqi1lofq000c54ox3dudwf06	cmqi1lofj000854ox77u02f43	2026-06-17 12:23:53.078	2026-06-17 12:23:53.078
cmqi1lofr000d54oxxsfhwoek	cmqi1lofl000954ox4fv58k0z	2026-06-17 12:23:53.079	2026-06-17 12:23:53.079
\.


--
-- TOC entry 5131 (class 2606 OID 16405)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5288 (class 2606 OID 17128)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5255 (class 2606 OID 17008)
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- TOC entry 5264 (class 2606 OID 17050)
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5276 (class 2606 OID 17087)
-- Name: blog_tag_relations blog_tag_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_tag_relations
    ADD CONSTRAINT blog_tag_relations_pkey PRIMARY KEY ("blogId", "tagId");


--
-- TOC entry 5268 (class 2606 OID 17060)
-- Name: blog_tags blog_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT blog_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5271 (class 2606 OID 17078)
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- TOC entry 5156 (class 2606 OID 16634)
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- TOC entry 5202 (class 2606 OID 16792)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5196 (class 2606 OID 16776)
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- TOC entry 5147 (class 2606 OID 16601)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5262 (class 2606 OID 17038)
-- Name: collection_products collection_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT collection_products_pkey PRIMARY KEY ("collectionId", "productId");


--
-- TOC entry 5258 (class 2606 OID 17027)
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- TOC entry 5236 (class 2606 OID 16934)
-- Name: coupon_usage coupon_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_pkey PRIMARY KEY (id);


--
-- TOC entry 5232 (class 2606 OID 16922)
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- TOC entry 5188 (class 2606 OID 16750)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 5194 (class 2606 OID 16765)
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5279 (class 2606 OID 17103)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5212 (class 2606 OID 16831)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 16843)
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5207 (class 2606 OID 16816)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5222 (class 2606 OID 16875)
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5219 (class 2606 OID 16861)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5139 (class 2606 OID 16551)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5175 (class 2606 OID 16695)
-- Name: product_colors product_colors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_colors
    ADD CONSTRAINT product_colors_pkey PRIMARY KEY (id);


--
-- TOC entry 5171 (class 2606 OID 16685)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5178 (class 2606 OID 16706)
-- Name: product_sizes product_sizes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sizes
    ADD CONSTRAINT product_sizes_pkey PRIMARY KEY (id);


--
-- TOC entry 5185 (class 2606 OID 16734)
-- Name: product_specifications product_specifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT product_specifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5180 (class 2606 OID 16721)
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- TOC entry 5166 (class 2606 OID 16669)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 5245 (class 2606 OID 16965)
-- Name: review_images review_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_images
    ADD CONSTRAINT review_images_pkey PRIMARY KEY (id);


--
-- TOC entry 5240 (class 2606 OID 16955)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5284 (class 2606 OID 17116)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5224 (class 2606 OID 16891)
-- Name: shipping_methods shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 5227 (class 2606 OID 16901)
-- Name: shipping_tracking shipping_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_tracking
    ADD CONSTRAINT shipping_tracking_pkey PRIMARY KEY (id);


--
-- TOC entry 5152 (class 2606 OID 16619)
-- Name: sub_categories sub_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT sub_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5144 (class 2606 OID 16584)
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5141 (class 2606 OID 16563)
-- Name: user_role_permissions user_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_permissions
    ADD CONSTRAINT user_role_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5135 (class 2606 OID 16539)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5251 (class 2606 OID 16989)
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5248 (class 2606 OID 16977)
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- TOC entry 5285 (class 1259 OID 17206)
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- TOC entry 5286 (class 1259 OID 17205)
-- Name: audit_logs_entity_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_entity_entityId_idx" ON public.audit_logs USING btree (entity, "entityId");


--
-- TOC entry 5289 (class 1259 OID 17204)
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- TOC entry 5256 (class 1259 OID 17191)
-- Name: banners_position_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "banners_position_isActive_idx" ON public.banners USING btree ("position", "isActive");


--
-- TOC entry 5265 (class 1259 OID 17194)
-- Name: blog_categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_categories_slug_key ON public.blog_categories USING btree (slug);


--
-- TOC entry 5266 (class 1259 OID 17195)
-- Name: blog_tags_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_tags_name_key ON public.blog_tags USING btree (name);


--
-- TOC entry 5269 (class 1259 OID 17196)
-- Name: blog_tags_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_tags_slug_key ON public.blog_tags USING btree (slug);


--
-- TOC entry 5272 (class 1259 OID 17198)
-- Name: blogs_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blogs_slug_idx ON public.blogs USING btree (slug);


--
-- TOC entry 5273 (class 1259 OID 17197)
-- Name: blogs_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blogs_slug_key ON public.blogs USING btree (slug);


--
-- TOC entry 5274 (class 1259 OID 17199)
-- Name: blogs_status_publishedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "blogs_status_publishedAt_idx" ON public.blogs USING btree (status, "publishedAt");


--
-- TOC entry 5157 (class 1259 OID 17141)
-- Name: brands_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX brands_slug_idx ON public.brands USING btree (slug);


--
-- TOC entry 5158 (class 1259 OID 17140)
-- Name: brands_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX brands_slug_key ON public.brands USING btree (slug);


--
-- TOC entry 5199 (class 1259 OID 17164)
-- Name: cart_items_cartId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cart_items_cartId_idx" ON public.cart_items USING btree ("cartId");


--
-- TOC entry 5200 (class 1259 OID 17165)
-- Name: cart_items_cartId_variantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "cart_items_cartId_variantId_key" ON public.cart_items USING btree ("cartId", "variantId");


--
-- TOC entry 5197 (class 1259 OID 17163)
-- Name: carts_sessionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "carts_sessionId_key" ON public.carts USING btree ("sessionId");


--
-- TOC entry 5198 (class 1259 OID 17162)
-- Name: carts_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "carts_userId_key" ON public.carts USING btree ("userId");


--
-- TOC entry 5148 (class 1259 OID 17136)
-- Name: categories_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX categories_slug_idx ON public.categories USING btree (slug);


--
-- TOC entry 5149 (class 1259 OID 17135)
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- TOC entry 5259 (class 1259 OID 17193)
-- Name: collections_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX collections_slug_idx ON public.collections USING btree (slug);


--
-- TOC entry 5260 (class 1259 OID 17192)
-- Name: collections_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX collections_slug_key ON public.collections USING btree (slug);


--
-- TOC entry 5233 (class 1259 OID 17180)
-- Name: coupon_usage_couponId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "coupon_usage_couponId_idx" ON public.coupon_usage USING btree ("couponId");


--
-- TOC entry 5234 (class 1259 OID 17182)
-- Name: coupon_usage_couponId_userId_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "coupon_usage_couponId_userId_orderId_key" ON public.coupon_usage USING btree ("couponId", "userId", "orderId");


--
-- TOC entry 5237 (class 1259 OID 17181)
-- Name: coupon_usage_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "coupon_usage_userId_idx" ON public.coupon_usage USING btree ("userId");


--
-- TOC entry 5228 (class 1259 OID 17178)
-- Name: coupons_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX coupons_code_idx ON public.coupons USING btree (code);


--
-- TOC entry 5229 (class 1259 OID 17177)
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- TOC entry 5230 (class 1259 OID 17179)
-- Name: coupons_isActive_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "coupons_isActive_expiresAt_idx" ON public.coupons USING btree ("isActive", "expiresAt");


--
-- TOC entry 5189 (class 1259 OID 17158)
-- Name: inventory_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_productId_idx" ON public.inventory USING btree ("productId");


--
-- TOC entry 5190 (class 1259 OID 17159)
-- Name: inventory_productId_variantId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "inventory_productId_variantId_key" ON public.inventory USING btree ("productId", "variantId");


--
-- TOC entry 5191 (class 1259 OID 17161)
-- Name: inventory_transactions_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_transactions_createdAt_idx" ON public.inventory_transactions USING btree ("createdAt");


--
-- TOC entry 5192 (class 1259 OID 17160)
-- Name: inventory_transactions_inventoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_transactions_inventoryId_idx" ON public.inventory_transactions USING btree ("inventoryId");


--
-- TOC entry 5277 (class 1259 OID 17201)
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- TOC entry 5280 (class 1259 OID 17200)
-- Name: notifications_userId_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_isRead_idx" ON public.notifications USING btree ("userId", "isRead");


--
-- TOC entry 5210 (class 1259 OID 17171)
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- TOC entry 5213 (class 1259 OID 17172)
-- Name: order_status_history_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "order_status_history_orderId_idx" ON public.order_status_history USING btree ("orderId");


--
-- TOC entry 5203 (class 1259 OID 17170)
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt");


--
-- TOC entry 5204 (class 1259 OID 17169)
-- Name: orders_orderNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_orderNumber_idx" ON public.orders USING btree ("orderNumber");


--
-- TOC entry 5205 (class 1259 OID 17166)
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- TOC entry 5208 (class 1259 OID 17168)
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- TOC entry 5209 (class 1259 OID 17167)
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- TOC entry 5220 (class 1259 OID 17175)
-- Name: payment_transactions_paymentId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payment_transactions_paymentId_idx" ON public.payment_transactions USING btree ("paymentId");


--
-- TOC entry 5216 (class 1259 OID 17174)
-- Name: payments_orderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "payments_orderId_idx" ON public.payments USING btree ("orderId");


--
-- TOC entry 5217 (class 1259 OID 17173)
-- Name: payments_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_orderId_key" ON public.payments USING btree ("orderId");


--
-- TOC entry 5137 (class 1259 OID 17132)
-- Name: permissions_action_subject_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permissions_action_subject_key ON public.permissions USING btree (action, subject);


--
-- TOC entry 5173 (class 1259 OID 17152)
-- Name: product_colors_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_colors_name_key ON public.product_colors USING btree (name);


--
-- TOC entry 5172 (class 1259 OID 17151)
-- Name: product_images_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_images_productId_idx" ON public.product_images USING btree ("productId");


--
-- TOC entry 5176 (class 1259 OID 17153)
-- Name: product_sizes_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_sizes_name_key ON public.product_sizes USING btree (name);


--
-- TOC entry 5186 (class 1259 OID 17157)
-- Name: product_specifications_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_specifications_productId_idx" ON public.product_specifications USING btree ("productId");


--
-- TOC entry 5181 (class 1259 OID 17156)
-- Name: product_variants_productId_colorId_sizeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "product_variants_productId_colorId_sizeId_key" ON public.product_variants USING btree ("productId", "colorId", "sizeId");


--
-- TOC entry 5182 (class 1259 OID 17155)
-- Name: product_variants_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_variants_productId_idx" ON public.product_variants USING btree ("productId");


--
-- TOC entry 5183 (class 1259 OID 17154)
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- TOC entry 5159 (class 1259 OID 17150)
-- Name: products_basePrice_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_basePrice_idx" ON public.products USING btree ("basePrice");


--
-- TOC entry 5160 (class 1259 OID 17146)
-- Name: products_brandId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_brandId_idx" ON public.products USING btree ("brandId");


--
-- TOC entry 5161 (class 1259 OID 17145)
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- TOC entry 5162 (class 1259 OID 17148)
-- Name: products_isActive_isBestSeller_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_isActive_isBestSeller_idx" ON public.products USING btree ("isActive", "isBestSeller");


--
-- TOC entry 5163 (class 1259 OID 17147)
-- Name: products_isActive_isFeatured_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_isActive_isFeatured_idx" ON public.products USING btree ("isActive", "isFeatured");


--
-- TOC entry 5164 (class 1259 OID 17149)
-- Name: products_isActive_isNewArrival_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_isActive_isNewArrival_idx" ON public.products USING btree ("isActive", "isNewArrival");


--
-- TOC entry 5167 (class 1259 OID 17143)
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- TOC entry 5168 (class 1259 OID 17144)
-- Name: products_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_slug_idx ON public.products USING btree (slug);


--
-- TOC entry 5169 (class 1259 OID 17142)
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- TOC entry 5246 (class 1259 OID 17187)
-- Name: review_images_reviewId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "review_images_reviewId_idx" ON public.review_images USING btree ("reviewId");


--
-- TOC entry 5238 (class 1259 OID 17185)
-- Name: reviews_isApproved_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reviews_isApproved_idx" ON public.reviews USING btree ("isApproved");


--
-- TOC entry 5241 (class 1259 OID 17183)
-- Name: reviews_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reviews_productId_idx" ON public.reviews USING btree ("productId");


--
-- TOC entry 5242 (class 1259 OID 17186)
-- Name: reviews_productId_userId_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reviews_productId_userId_orderId_key" ON public.reviews USING btree ("productId", "userId", "orderId");


--
-- TOC entry 5243 (class 1259 OID 17184)
-- Name: reviews_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "reviews_userId_idx" ON public.reviews USING btree ("userId");


--
-- TOC entry 5281 (class 1259 OID 17203)
-- Name: settings_group_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX settings_group_idx ON public.settings USING btree ("group");


--
-- TOC entry 5282 (class 1259 OID 17202)
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- TOC entry 5225 (class 1259 OID 17176)
-- Name: shipping_tracking_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "shipping_tracking_orderId_key" ON public.shipping_tracking USING btree ("orderId");


--
-- TOC entry 5150 (class 1259 OID 17138)
-- Name: sub_categories_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sub_categories_categoryId_idx" ON public.sub_categories USING btree ("categoryId");


--
-- TOC entry 5153 (class 1259 OID 17139)
-- Name: sub_categories_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sub_categories_slug_idx ON public.sub_categories USING btree (slug);


--
-- TOC entry 5154 (class 1259 OID 17137)
-- Name: sub_categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sub_categories_slug_key ON public.sub_categories USING btree (slug);


--
-- TOC entry 5145 (class 1259 OID 17134)
-- Name: user_addresses_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_addresses_userId_idx" ON public.user_addresses USING btree ("userId");


--
-- TOC entry 5142 (class 1259 OID 17133)
-- Name: user_role_permissions_userId_permissionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_role_permissions_userId_permissionId_key" ON public.user_role_permissions USING btree ("userId", "permissionId");


--
-- TOC entry 5132 (class 1259 OID 17130)
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- TOC entry 5133 (class 1259 OID 17129)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 5136 (class 1259 OID 17131)
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- TOC entry 5252 (class 1259 OID 17189)
-- Name: wishlist_items_wishlistId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "wishlist_items_wishlistId_idx" ON public.wishlist_items USING btree ("wishlistId");


--
-- TOC entry 5253 (class 1259 OID 17190)
-- Name: wishlist_items_wishlistId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wishlist_items_wishlistId_productId_key" ON public.wishlist_items USING btree ("wishlistId", "productId");


--
-- TOC entry 5249 (class 1259 OID 17188)
-- Name: wishlists_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "wishlists_userId_key" ON public.wishlists USING btree ("userId");


--
-- TOC entry 5334 (class 2606 OID 17427)
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5331 (class 2606 OID 17412)
-- Name: blog_tag_relations blog_tag_relations_blogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_tag_relations
    ADD CONSTRAINT "blog_tag_relations_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES public.blogs(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5332 (class 2606 OID 17417)
-- Name: blog_tag_relations blog_tag_relations_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_tag_relations
    ADD CONSTRAINT "blog_tag_relations_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public.blog_tags(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5330 (class 2606 OID 17407)
-- Name: blogs blogs_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT "blogs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.blog_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5306 (class 2606 OID 17287)
-- Name: cart_items cart_items_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5307 (class 2606 OID 17292)
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5308 (class 2606 OID 17297)
-- Name: cart_items cart_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5305 (class 2606 OID 17282)
-- Name: carts carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5328 (class 2606 OID 17397)
-- Name: collection_products collection_products_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT "collection_products_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public.collections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5329 (class 2606 OID 17402)
-- Name: collection_products collection_products_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collection_products
    ADD CONSTRAINT "collection_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5320 (class 2606 OID 17357)
-- Name: coupon_usage coupon_usage_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT "coupon_usage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5321 (class 2606 OID 17362)
-- Name: coupon_usage coupon_usage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT "coupon_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5302 (class 2606 OID 17267)
-- Name: inventory inventory_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5304 (class 2606 OID 17277)
-- Name: inventory_transactions inventory_transactions_inventoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT "inventory_transactions_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES public.inventory(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5303 (class 2606 OID 17272)
-- Name: inventory inventory_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5333 (class 2606 OID 17422)
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5313 (class 2606 OID 17322)
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5314 (class 2606 OID 17327)
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5315 (class 2606 OID 17332)
-- Name: order_items order_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.product_variants(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5316 (class 2606 OID 17337)
-- Name: order_status_history order_status_history_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT "order_status_history_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5309 (class 2606 OID 17307)
-- Name: orders orders_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public.user_addresses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5310 (class 2606 OID 17312)
-- Name: orders orders_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5311 (class 2606 OID 17317)
-- Name: orders orders_shippingMethodId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_shippingMethodId_fkey" FOREIGN KEY ("shippingMethodId") REFERENCES public.shipping_methods(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5312 (class 2606 OID 17302)
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5318 (class 2606 OID 17347)
-- Name: payment_transactions payment_transactions_paymentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT "payment_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5317 (class 2606 OID 17342)
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5297 (class 2606 OID 17242)
-- Name: product_images product_images_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5301 (class 2606 OID 17262)
-- Name: product_specifications product_specifications_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_specifications
    ADD CONSTRAINT "product_specifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5298 (class 2606 OID 17252)
-- Name: product_variants product_variants_colorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES public.product_colors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5299 (class 2606 OID 17247)
-- Name: product_variants product_variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5300 (class 2606 OID 17257)
-- Name: product_variants product_variants_sizeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "product_variants_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES public.product_sizes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5294 (class 2606 OID 17237)
-- Name: products products_brandId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES public.brands(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5295 (class 2606 OID 17227)
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5296 (class 2606 OID 17232)
-- Name: products products_subCategoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES public.sub_categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5324 (class 2606 OID 17377)
-- Name: review_images review_images_reviewId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_images
    ADD CONSTRAINT "review_images_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES public.reviews(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5322 (class 2606 OID 17367)
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5323 (class 2606 OID 17372)
-- Name: reviews reviews_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5319 (class 2606 OID 17352)
-- Name: shipping_tracking shipping_tracking_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_tracking
    ADD CONSTRAINT "shipping_tracking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5293 (class 2606 OID 17222)
-- Name: sub_categories sub_categories_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_categories
    ADD CONSTRAINT "sub_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5292 (class 2606 OID 17217)
-- Name: user_addresses user_addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT "user_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5290 (class 2606 OID 17212)
-- Name: user_role_permissions user_role_permissions_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_permissions
    ADD CONSTRAINT "user_role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5291 (class 2606 OID 17207)
-- Name: user_role_permissions user_role_permissions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_role_permissions
    ADD CONSTRAINT "user_role_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5326 (class 2606 OID 17392)
-- Name: wishlist_items wishlist_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5327 (class 2606 OID 17387)
-- Name: wishlist_items wishlist_items_wishlistId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT "wishlist_items_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES public.wishlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5325 (class 2606 OID 17382)
-- Name: wishlists wishlists_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-06-18 23:12:37

--
-- PostgreSQL database dump complete
--

\unrestrict EcrBZ0eFxdd6mhzmK7dQhJ4aVlF8qXrygYqgqiFQqeDEZyHfNMpdgWEzLjgayYm

