import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { BannerPosition, CouponType, Gender, Role } from '@prisma/client';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { MerchandisingSection } from '../products/merchandising';
import { AdminService } from './admin.service';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { UpdateMerchandisingDto } from './dto/update-merchandising.dto';

type AdminQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
};

type ProductVariantBody = {
  id?: string;
  sku?: string;
  colorId?: string;
  colorName?: string;
  colorHex?: string;
  sizeId?: string;
  sizeName?: string;
  price?: number | null;
  imageUrl?: string | null;
  quantity?: number;
  threshold?: number;
  location?: string | null;
  isActive?: boolean;
};

type ProductBody = {
  name: string;
  slug?: string;
  sku?: string;
  description: string;
  shortDescription?: string | null;
  categoryId: string;
  subCategoryId?: string | null;
  brandId?: string | null;
  gender?: Gender;
  material?: string | null;
  careInstructions?: string | null;
  basePrice: number;
  comparePrice?: number | null;
  isFeatured?: boolean;
  isActive?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
  images?: string[];
  collectionIds?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  variants?: ProductVariantBody[];
};

type CategoryBody = {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

type CouponBody = {
  code: string;
  name: string;
  description?: string | null;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usagePerUser?: number;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
  applicableCategories?: string[];
};

type BannerBody = {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  position?: BannerPosition;
  isActive?: boolean;
  sortOrder?: number;
  startsAt?: string | null;
  endsAt?: string | null;
};

@ApiTags('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@ApiBearerAuth('JWT-auth')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/revenue-chart')
  getRevenueChart(@Query('days') days = 30) {
    return this.adminService.getRevenueChart(+days);
  }

  @Get('dashboard/top-products')
  getTopProducts(@Query('limit') limit = 10) {
    return this.adminService.getTopProducts(+limit);
  }

  @Get('reports')
  getReports(@Query('days') days = 30) {
    return this.adminService.getReports(+days);
  }

  @Get('products/options')
  getProductOptions() {
    return this.adminService.getProductOptions();
  }

  @Get('merchandising')
  getMerchandising() {
    return this.adminService.getMerchandising();
  }

  @Patch('merchandising/:section')
  updateMerchandising(
    @Param('section', new ParseEnumPipe(MerchandisingSection))
    section: MerchandisingSection,
    @Body() body: UpdateMerchandisingDto,
  ) {
    return this.adminService.updateMerchandising(section, body);
  }

  @Get('products')
  listProducts(@Query() query: AdminProductQueryDto) {
    return this.adminService.listProducts(query);
  }

  @Get('products/:id')
  getProduct(@Param('id') id: string) {
    return this.adminService.getProduct(id);
  }

  @Post('products')
  createProduct(@Body() body: ProductBody) {
    return this.adminService.createProduct(body);
  }

  @Post('product-images/upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only image files are allowed'), false);
      },
    }),
  )
  uploadProductImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('No image files uploaded');
    }

    return this.adminService.saveLocalProductImages(files);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() body: Partial<ProductBody>) {
    return this.adminService.updateProduct(id, body);
  }

  @Patch('products/:id/visibility')
  toggleProduct(@Param('id') id: string, @Body() body: { isActive: boolean }) {
    return this.adminService.toggleProduct(id, body.isActive);
  }

  @Delete('products/:id')
  removeProduct(@Param('id') id: string) {
    return this.adminService.removeProduct(id);
  }

  @Get('categories')
  listCategories(@Query() query: AdminQuery) {
    return this.adminService.listCategories(query);
  }

  @Post('categories')
  createCategory(@Body() body: CategoryBody) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: Partial<CategoryBody>) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.adminService.removeCategory(id);
  }

  @Get('orders')
  listOrders(@Query() query: AdminQuery) {
    return this.adminService.listOrders(query);
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.adminService.updateOrderStatus(
      id,
      body.status,
      body.note,
      user.sub,
    );
  }

  @Get('customers')
  listCustomers(@Query() query: AdminQuery) {
    return this.adminService.listCustomers(query);
  }

  @Get('customers/:id')
  getCustomer(@Param('id') id: string) {
    return this.adminService.getCustomer(id);
  }

  @Patch('customers/:id/status')
  setCustomerActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.setCustomerActive(id, body.isActive);
  }

  @Get('inventory')
  listInventory(@Query() query: AdminQuery) {
    return this.adminService.listInventory(query);
  }

  @Patch('inventory/:id/adjust')
  adjustInventory(
    @Param('id') id: string,
    @Body() body: { quantity: number; reason: string },
    @CurrentUser() user: JwtUser,
  ) {
    return this.adminService.adjustInventory(
      id,
      body.quantity,
      body.reason,
      user.sub,
    );
  }

  @Get('coupons')
  listCoupons(@Query() query: AdminQuery) {
    return this.adminService.listCoupons(query);
  }

  @Post('coupons')
  createCoupon(@Body() body: CouponBody) {
    return this.adminService.createCoupon(body);
  }

  @Patch('coupons/:id')
  updateCoupon(@Param('id') id: string, @Body() body: Partial<CouponBody>) {
    return this.adminService.updateCoupon(id, body);
  }

  @Delete('coupons/:id')
  removeCoupon(@Param('id') id: string) {
    return this.adminService.removeCoupon(id);
  }

  @Get('banners')
  listBanners(@Query() query: AdminQuery) {
    return this.adminService.listBanners(query);
  }

  @Post('banners')
  createBanner(@Body() body: BannerBody) {
    return this.adminService.createBanner(body);
  }

  @Patch('banners/:id')
  updateBanner(@Param('id') id: string, @Body() body: Partial<BannerBody>) {
    return this.adminService.updateBanner(id, body);
  }

  @Delete('banners/:id')
  removeBanner(@Param('id') id: string) {
    return this.adminService.removeBanner(id);
  }

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() body: Record<string, unknown>) {
    return this.adminService.updateSettings(body);
  }

  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('audit-logs')
  getAuditLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.adminService.getAuditLogs(+page, +limit);
  }
}
