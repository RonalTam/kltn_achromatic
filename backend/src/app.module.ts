import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { WishlistsModule } from './modules/wishlists/wishlists.module';
import { BannersModule } from './modules/banners/banners.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { validate } from './config/env.validation';

@Module({
  imports: [
    // Config — load env and validate
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Database
    DatabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    InventoryModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    ShippingModule,
    CouponsModule,
    ReviewsModule,
    WishlistsModule,
    BannersModule,
    CollectionsModule,
    BlogsModule,
    NotificationsModule,
    AdminModule,
    AnalyticsModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
