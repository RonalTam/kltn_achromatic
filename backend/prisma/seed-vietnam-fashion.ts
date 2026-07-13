import {
  BannerPosition,
  CouponType,
  Gender,
  PrismaClient,
  Role,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

type ProductSeed = {
  name: string;
  slug: string;
  sku: string;
  category: string;
  subCategory: string;
  brand: string;
  gender: Gender;
  material: string;
  careInstructions: string;
  basePrice: number;
  comparePrice?: number;
  image: string;
  secondaryImage?: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  soldCount?: number;
  avgRating?: number;
  reviewCount?: number;
  shortDescription: string;
  description: string;
};

async function cleanData() {
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.blogTagRelation.deleteMany();
  await prisma.blogTag.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.blogCategory.deleteMany();
  await prisma.collectionProduct.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.shippingTracking.deleteMany();
  await prisma.shippingMethod.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.productColor.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.userRolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.settings.deleteMany();
}

async function main() {
  console.log('Seed Vietnamese fashion data...');
  await cleanData();

  await prisma.settings.createMany({
    data: [
      { key: 'site_name', value: 'Achromatic Vietnam', group: 'general', label: 'Site Name' },
      { key: 'site_description', value: 'Thời trang Việt Nam hiện đại', group: 'general', label: 'Description' },
      { key: 'currency', value: 'VND', group: 'general', label: 'Currency' },
      { key: 'free_shipping_threshold', value: '799000', type: 'number', group: 'shipping', label: 'Miễn phí vận chuyển từ' },
      { key: 'tax_rate', value: '10', type: 'number', group: 'general', label: 'VAT (%)' },
    ],
  });

  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const customerPassword = await bcrypt.hash('Customer@123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@achromatic.vn',
      password: adminPassword,
      firstName: 'Quản trị',
      lastName: 'Achromatic',
      role: Role.SUPER_ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'khachhang@achromatic.vn',
      password: customerPassword,
      firstName: 'Minh',
      lastName: 'Nguyễn',
      phone: '0901234567',
      role: Role.CUSTOMER,
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.userAddress.create({
    data: {
      userId: customer.id,
      fullName: 'Nguyễn Minh',
      phone: '0901234567',
      addressLine1: '42 Nguyễn Huệ',
      ward: 'Bến Nghé',
      district: 'Quận 1',
      province: 'TP. Hồ Chí Minh',
      country: 'Vietnam',
      isDefault: true,
    },
  });
  await prisma.cart.create({ data: { userId: customer.id } });
  await prisma.wishlist.create({ data: { userId: customer.id } });

  await prisma.permission.createMany({
    data: [
      { action: 'manage', subject: 'all', description: 'Toàn quyền hệ thống' },
      { action: 'manage', subject: 'Product', description: 'Quản lý sản phẩm' },
      { action: 'manage', subject: 'Order', description: 'Quản lý đơn hàng' },
      { action: 'read', subject: 'Analytics', description: 'Xem báo cáo' },
    ],
  });

  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Routine', slug: 'routine', description: 'Thời trang ứng dụng Việt Nam, tối giản và dễ mặc.', website: 'https://routine.vn' } }),
    prisma.brand.create({ data: { name: 'Coolmate', slug: 'coolmate', description: 'Basic wear Việt Nam cho nam giới hiện đại.', website: 'https://coolmate.me' } }),
    prisma.brand.create({ data: { name: 'YODY', slug: 'yody', description: 'Thời trang gia đình Việt Nam.', website: 'https://yody.vn' } }),
    prisma.brand.create({ data: { name: 'CANIFA', slug: 'canifa', description: 'Len, cotton và casual wear cho khí hậu Việt Nam.', website: 'https://canifa.com' } }),
    prisma.brand.create({ data: { name: 'OWEN', slug: 'owen', description: 'Thời trang công sở nam Việt Nam.', website: 'https://owen.vn' } }),
    prisma.brand.create({ data: { name: 'Việt Tiến', slug: 'viet-tien', description: 'May mặc công sở Việt Nam.', website: 'https://viettien.com.vn' } }),
    prisma.brand.create({ data: { name: 'NEM', slug: 'nem', description: 'Thời trang nữ thanh lịch Việt Nam.', website: 'https://nemshop.vn' } }),
    prisma.brand.create({ data: { name: 'Local Saigon', slug: 'local-saigon', description: 'Streetwear cảm hứng Sài Gòn.' } }),
    prisma.brand.create({ data: { name: 'Hà Nội Studio', slug: 'ha-noi-studio', description: 'Thiết kế linen, lụa và áo dài cách tân.' } }),
  ]);
  const brandBySlug = Object.fromEntries(brands.map((brand) => [brand.slug, brand.id]));

  const categorySeeds = [
    { name: 'Áo Polo', slug: 'Polo', description: 'Polo piqué, polo merino và polo performance.' },
    { name: 'Áo Thun', slug: 'T-shirt', description: 'Áo thun cotton, oversize và graphic Việt Nam.' },
    { name: 'Sơ Mi', slug: 'Shirts', description: 'Sơ mi oxford, linen và công sở.' },
    { name: 'Quần', slug: 'Pants', description: 'Quần tây, kaki, jeans và short.' },
    { name: 'Áo Khoác', slug: 'Outerwear', description: 'Jacket, hoodie và outerwear cho khí hậu Việt Nam.' },
    { name: 'Đầm & Áo Dài', slug: 'Dresses', description: 'Đầm midi, chân váy và áo dài cách tân.' },
    { name: 'Phụ Kiện', slug: 'Accessories', description: 'Túi tote, nón, vớ và phụ kiện Việt.' },
    { name: 'Giày', slug: 'Shoes', description: 'Sneaker và giày casual.' },
  ];

  const categories = await Promise.all(
    categorySeeds.map((category, index) =>
      prisma.category.create({
        data: {
          ...category,
          sortOrder: index + 1,
          isActive: true,
        },
      }),
    ),
  );
  const categoryBySlug = Object.fromEntries(categories.map((category) => [category.slug, category.id]));

  const subCategorySeeds = [
    ['Polo', 'Polo Piqué', 'polo-pique'],
    ['Polo', 'Polo Performance', 'polo-performance'],
    ['T-shirt', 'Áo Thun Basic', 'ao-thun-basic'],
    ['T-shirt', 'Áo Thun Oversize', 'ao-thun-oversize'],
    ['T-shirt', 'Áo Thun Graphic', 'ao-thun-graphic'],
    ['Shirts', 'Sơ Mi Oxford', 'so-mi-oxford'],
    ['Shirts', 'Sơ Mi Linen', 'so-mi-linen'],
    ['Pants', 'Quần Tây', 'quan-tay'],
    ['Pants', 'Quần Kaki', 'quan-kaki'],
    ['Pants', 'Jeans', 'jeans'],
    ['Pants', 'Quần Short', 'quan-short'],
    ['Outerwear', 'Jacket', 'jacket'],
    ['Outerwear', 'Hoodie', 'hoodie'],
    ['Dresses', 'Đầm Midi', 'dam-midi'],
    ['Dresses', 'Áo Dài Cách Tân', 'ao-dai-cach-tan'],
    ['Dresses', 'Chân Váy', 'chan-vay'],
    ['Accessories', 'Túi Tote', 'tui-tote'],
    ['Accessories', 'Nón', 'non'],
    ['Accessories', 'Vớ', 'vo'],
    ['Shoes', 'Sneaker', 'sneaker'],
  ] as const;

  const subCategories = await Promise.all(
    subCategorySeeds.map(([categorySlug, name, slug], index) =>
      prisma.subCategory.create({
        data: {
          categoryId: categoryBySlug[categorySlug],
          name,
          slug,
          sortOrder: index + 1,
          isActive: true,
        },
      }),
    ),
  );
  const subCategoryBySlug = Object.fromEntries(subCategories.map((subCategory) => [subCategory.slug, subCategory.id]));

  const colors = await Promise.all([
    prisma.productColor.create({ data: { name: 'Đen', hexCode: '#111111' } }),
    prisma.productColor.create({ data: { name: 'Trắng', hexCode: '#FFFFFF' } }),
    prisma.productColor.create({ data: { name: 'Kem', hexCode: '#F4E8D1' } }),
    prisma.productColor.create({ data: { name: 'Navy', hexCode: '#12324A' } }),
    prisma.productColor.create({ data: { name: 'Xám', hexCode: '#8A8F98' } }),
    prisma.productColor.create({ data: { name: 'Xanh rêu', hexCode: '#42513B' } }),
    prisma.productColor.create({ data: { name: 'Nâu linen', hexCode: '#C78549' } }),
    prisma.productColor.create({ data: { name: 'Hồng sen', hexCode: '#D94F70' } }),
    prisma.productColor.create({ data: { name: 'Tím gấm', hexCode: '#6C4AB6' } }),
    prisma.productColor.create({ data: { name: 'Indigo', hexCode: '#173F67' } }),
  ]);
  const colorByName = Object.fromEntries(colors.map((color) => [color.name, color.id]));

  const sizeNames = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '33', '34', '38', '39', '40', '41', '42', '43', 'OS'];
  const sizes = await Promise.all(
    sizeNames.map((name, index) => prisma.productSize.create({ data: { name, sortOrder: index + 1 } })),
  );
  const sizeByName = Object.fromEntries(sizes.map((size) => [size.name, size.id]));

  const products: ProductSeed[] = [
    {
      name: 'Áo Thun Sài Gòn Cotton Compact - Trắng',
      slug: 'ao-thun-sai-gon-cotton-compact-trang',
      sku: 'VN-TSH-001',
      category: 'T-shirt',
      subCategory: 'ao-thun-basic',
      brand: 'coolmate',
      gender: Gender.UNISEX,
      material: '100% cotton compact 220gsm',
      careInstructions: 'Giặt máy 30°C, lộn trái khi giặt, phơi trong bóng râm.',
      basePrice: 249000,
      comparePrice: 329000,
      image: '/vietnam-fashion/ao-thun-saigon.svg',
      secondaryImage: '/vietnam-fashion/polo-ha-noi.svg',
      colors: ['Trắng', 'Đen'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['ao-thun', 'sai-gon', 'cotton', 'unisex'],
      featured: true,
      newArrival: true,
      soldCount: 320,
      avgRating: 4.8,
      reviewCount: 64,
      shortDescription: 'Áo thun cotton compact, form regular, cảm hứng Sài Gòn.',
      description: 'Áo thun basic may tại Việt Nam với chất cotton compact dày vừa, bề mặt mịn và giữ form tốt. Thiết kế tối giản, dễ phối quần jeans, kaki hoặc short.',
    },
    {
      name: 'Áo Thun Oversize Local Saigon - Đen',
      slug: 'ao-thun-oversize-local-saigon-den',
      sku: 'VN-TSH-002',
      category: 'T-shirt',
      subCategory: 'ao-thun-oversize',
      brand: 'local-saigon',
      gender: Gender.UNISEX,
      material: 'Cotton 2 chiều 250gsm',
      careInstructions: 'Giặt lạnh, không tẩy, không sấy nhiệt cao.',
      basePrice: 299000,
      comparePrice: 379000,
      image: '/vietnam-fashion/ao-thun-saigon.svg',
      colors: ['Đen', 'Xám'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      tags: ['ao-thun', 'oversize', 'streetwear', 'sai-gon'],
      bestSeller: true,
      soldCount: 540,
      avgRating: 4.9,
      reviewCount: 102,
      shortDescription: 'Áo thun oversize streetwear Việt Nam, chất cotton dày.',
      description: 'Phom oversize vai rũ vừa phải, thân áo đứng và đường may gia cố. Một item streetwear Việt dễ mặc cho cả nam và nữ.',
    },
    {
      name: 'Áo Thun Graphic Việt Nam - Kem',
      slug: 'ao-thun-graphic-viet-nam-kem',
      sku: 'VN-TSH-003',
      category: 'T-shirt',
      subCategory: 'ao-thun-graphic',
      brand: 'routine',
      gender: Gender.UNISEX,
      material: 'Cotton jersey 230gsm',
      careInstructions: 'Giặt lộn trái để giữ màu hình in.',
      basePrice: 319000,
      image: '/vietnam-fashion/ao-thun-saigon.svg',
      colors: ['Kem', 'Trắng'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['graphic', 'vietnam', 'cotton'],
      newArrival: true,
      soldCount: 180,
      avgRating: 4.7,
      reviewCount: 31,
      shortDescription: 'Áo thun graphic tối giản với họa tiết Việt Nam.',
      description: 'Hình in lấy cảm hứng từ nhịp sống đô thị Việt Nam, xử lý màu tiết chế để vẫn giữ tinh thần tối giản của Achromatic.',
    },
    {
      name: 'Polo Hà Nội Piqué Premium - Navy',
      slug: 'polo-ha-noi-pique-premium-navy',
      sku: 'VN-POL-001',
      category: 'Polo',
      subCategory: 'polo-pique',
      brand: 'owen',
      gender: Gender.MALE,
      material: 'Cotton piqué 240gsm',
      careInstructions: 'Giặt máy nhẹ, giữ cổ áo phẳng khi phơi.',
      basePrice: 459000,
      comparePrice: 559000,
      image: '/vietnam-fashion/polo-ha-noi.svg',
      colors: ['Navy', 'Trắng'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      tags: ['polo', 'ha-noi', 'pique', 'cong-so'],
      featured: true,
      bestSeller: true,
      soldCount: 410,
      avgRating: 4.8,
      reviewCount: 86,
      shortDescription: 'Polo piqué navy, đứng cổ, hợp đi làm và cuối tuần.',
      description: 'Áo polo nam lấy cảm hứng từ nhịp sống Hà Nội: lịch sự, gọn gàng và dễ phối. Cổ dệt chắc, thân áo thoáng khí.',
    },
    {
      name: 'Polo Performance Chống Nhăn - Xám',
      slug: 'polo-performance-chong-nhan-xam',
      sku: 'VN-POL-002',
      category: 'Polo',
      subCategory: 'polo-performance',
      brand: 'yody',
      gender: Gender.UNISEX,
      material: 'Poly-cotton co giãn 4 chiều',
      careInstructions: 'Giặt nhanh, phơi móc, không cần ủi nhiều.',
      basePrice: 399000,
      image: '/vietnam-fashion/polo-ha-noi.svg',
      colors: ['Xám', 'Navy', 'Đen'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['polo', 'performance', 'chong-nhan'],
      soldCount: 230,
      avgRating: 4.6,
      reviewCount: 42,
      shortDescription: 'Polo co giãn, nhanh khô, phù hợp khí hậu Việt Nam.',
      description: 'Chất liệu poly-cotton nhẹ, thấm hút tốt và ít nhăn. Thiết kế phù hợp di chuyển nhiều trong ngày.',
    },
    {
      name: 'Polo Kem Weekend Việt',
      slug: 'polo-kem-weekend-viet',
      sku: 'VN-POL-003',
      category: 'Polo',
      subCategory: 'polo-pique',
      brand: 'canifa',
      gender: Gender.UNISEX,
      material: 'Cotton piqué mềm',
      careInstructions: 'Giặt cùng màu sáng, không dùng chất tẩy mạnh.',
      basePrice: 369000,
      comparePrice: 449000,
      image: '/vietnam-fashion/polo-ha-noi.svg',
      colors: ['Kem', 'Trắng'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['polo', 'kem', 'weekend'],
      newArrival: true,
      soldCount: 120,
      avgRating: 4.7,
      reviewCount: 22,
      shortDescription: 'Polo màu kem sáng, tối giản và dễ mặc cuối tuần.',
      description: 'Polo màu kem trung tính, phối tốt với denim xanh hoặc quần short linen. Đường may vai và lai áo được hoàn thiện gọn.',
    },
    {
      name: 'Sơ Mi Linen Hội An - Kem',
      slug: 'so-mi-linen-hoi-an-kem',
      sku: 'VN-SHT-001',
      category: 'Shirts',
      subCategory: 'so-mi-linen',
      brand: 'ha-noi-studio',
      gender: Gender.UNISEX,
      material: 'Linen pha cotton',
      careInstructions: 'Giặt tay hoặc chế độ nhẹ, ủi hơi nước ở nhiệt vừa.',
      basePrice: 529000,
      comparePrice: 649000,
      image: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
      colors: ['Kem', 'Nâu linen'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['so-mi', 'linen', 'hoi-an', 'mua-he'],
      featured: true,
      newArrival: true,
      soldCount: 260,
      avgRating: 4.9,
      reviewCount: 58,
      shortDescription: 'Sơ mi linen màu phố cổ, thoáng nhẹ cho mùa hè.',
      description: 'Linen pha cotton giữ độ thoáng của linen nhưng mềm hơn trên da. Màu kem lấy cảm hứng từ tường vàng Hội An.',
    },
    {
      name: 'Sơ Mi Oxford Công Sở - Trắng',
      slug: 'so-mi-oxford-cong-so-trang',
      sku: 'VN-SHT-002',
      category: 'Shirts',
      subCategory: 'so-mi-oxford',
      brand: 'viet-tien',
      gender: Gender.MALE,
      material: '100% cotton oxford',
      careInstructions: 'Giặt máy 30°C, ủi mặt trái.',
      basePrice: 479000,
      comparePrice: 590000,
      image: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
      colors: ['Trắng', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      tags: ['so-mi', 'oxford', 'cong-so'],
      bestSeller: true,
      soldCount: 620,
      avgRating: 4.8,
      reviewCount: 140,
      shortDescription: 'Sơ mi oxford trắng cho tủ đồ công sở Việt.',
      description: 'Phom regular dễ mặc, cổ áo đứng vừa và vải oxford bền. Phù hợp đi làm, gặp khách hàng hoặc mặc smart casual.',
    },
    {
      name: 'Sơ Mi Oversize Sài Gòn - Xanh Navy',
      slug: 'so-mi-oversize-sai-gon-navy',
      sku: 'VN-SHT-003',
      category: 'Shirts',
      subCategory: 'so-mi-linen',
      brand: 'routine',
      gender: Gender.UNISEX,
      material: 'Cotton poplin',
      careInstructions: 'Giặt lạnh, phơi móc để giữ phom.',
      basePrice: 499000,
      image: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
      colors: ['Navy', 'Trắng'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['so-mi', 'oversize', 'sai-gon'],
      soldCount: 170,
      avgRating: 4.6,
      reviewCount: 28,
      shortDescription: 'Sơ mi oversize poplin, nhẹ và sắc nét.',
      description: 'Thiết kế rộng vừa, có thể mặc khoác ngoài áo thun. Tinh thần năng động của Sài Gòn trong một chiếc sơ mi tối giản.',
    },
    {
      name: 'Quần Tây Đà Nẵng Slim - Xám Đậm',
      slug: 'quan-tay-da-nang-slim-xam-dam',
      sku: 'VN-PAN-001',
      category: 'Pants',
      subCategory: 'quan-tay',
      brand: 'viet-tien',
      gender: Gender.MALE,
      material: 'Poly-viscose co giãn',
      careInstructions: 'Giặt máy nhẹ, ủi nhiệt thấp.',
      basePrice: 599000,
      comparePrice: 729000,
      image: '/vietnam-fashion/quan-tay-da-nang.svg',
      colors: ['Xám', 'Đen'],
      sizes: ['29', '30', '31', '32', '33', '34'],
      tags: ['quan-tay', 'da-nang', 'slim', 'cong-so'],
      featured: true,
      bestSeller: true,
      soldCount: 470,
      avgRating: 4.8,
      reviewCount: 96,
      shortDescription: 'Quần tây slim co giãn, hợp đi làm hằng ngày.',
      description: 'Quần tây có độ rũ gọn, chống nhăn nhẹ và phần eo thoải mái. Giá VND dễ tiếp cận cho tủ đồ công sở.',
    },
    {
      name: 'Quần Kaki Coffee Sài Gòn - Nâu',
      slug: 'quan-kaki-coffee-sai-gon-nau',
      sku: 'VN-PAN-002',
      category: 'Pants',
      subCategory: 'quan-kaki',
      brand: 'routine',
      gender: Gender.UNISEX,
      material: 'Cotton twill 280gsm',
      careInstructions: 'Giặt cùng màu tối, không ngâm lâu.',
      basePrice: 549000,
      image: '/vietnam-fashion/quan-tay-da-nang.svg',
      colors: ['Nâu linen', 'Kem'],
      sizes: ['28', '29', '30', '31', '32', '34'],
      tags: ['kaki', 'coffee', 'sai-gon'],
      newArrival: true,
      soldCount: 145,
      avgRating: 4.7,
      reviewCount: 25,
      shortDescription: 'Quần kaki nâu cà phê, form straight thoải mái.',
      description: 'Lấy cảm hứng từ sắc cà phê Sài Gòn, chất twill dày vừa và dễ phối áo thun trắng hoặc sơ mi linen.',
    },
    {
      name: 'Jeans Indigo Việt Straight Fit',
      slug: 'jeans-indigo-viet-straight-fit',
      sku: 'VN-DEN-001',
      category: 'Pants',
      subCategory: 'jeans',
      brand: 'local-saigon',
      gender: Gender.UNISEX,
      material: 'Denim cotton 13oz',
      careInstructions: 'Giặt riêng lần đầu, lộn trái, hạn chế sấy.',
      basePrice: 699000,
      comparePrice: 849000,
      image: '/vietnam-fashion/jeans-indigo-viet.svg',
      colors: ['Indigo', 'Đen'],
      sizes: ['28', '29', '30', '31', '32', '33', '34'],
      tags: ['jeans', 'indigo', 'denim', 'viet'],
      featured: true,
      soldCount: 300,
      avgRating: 4.8,
      reviewCount: 73,
      shortDescription: 'Jeans straight fit màu indigo, denim 13oz bền.',
      description: 'Dáng straight cổ điển, màu indigo dễ phai đẹp theo thời gian. May chắc cho nhịp sống đô thị Việt Nam.',
    },
    {
      name: 'Quần Short Linen Biển Việt - Kem',
      slug: 'quan-short-linen-bien-viet-kem',
      sku: 'VN-SHO-001',
      category: 'Pants',
      subCategory: 'quan-short',
      brand: 'canifa',
      gender: Gender.UNISEX,
      material: 'Linen pha rayon',
      careInstructions: 'Giặt nhẹ, phơi ngang để hạn chế nhăn.',
      basePrice: 359000,
      image: '/vietnam-fashion/chan-vay-ha-noi.svg',
      colors: ['Kem', 'Nâu linen'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['short', 'linen', 'bien-viet'],
      newArrival: true,
      soldCount: 210,
      avgRating: 4.6,
      reviewCount: 38,
      shortDescription: 'Short linen nhẹ cho du lịch biển Việt Nam.',
      description: 'Quần short lưng thun dây rút, chất linen pha mềm và thoáng. Dễ mặc cùng áo thun hoặc sơ mi ngắn tay.',
    },
    {
      name: 'Áo Khoác Đà Lạt Canvas - Xanh Rêu',
      slug: 'ao-khoac-da-lat-canvas-xanh-reu',
      sku: 'VN-JKT-001',
      category: 'Outerwear',
      subCategory: 'jacket',
      brand: 'routine',
      gender: Gender.UNISEX,
      material: 'Cotton canvas 320gsm',
      careInstructions: 'Giặt tay hoặc giặt nhẹ, không tẩy.',
      basePrice: 899000,
      comparePrice: 1099000,
      image: '/vietnam-fashion/ao-khoac-da-lat.svg',
      colors: ['Xanh rêu', 'Đen'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['ao-khoac', 'da-lat', 'canvas'],
      featured: true,
      bestSeller: true,
      soldCount: 280,
      avgRating: 4.9,
      reviewCount: 61,
      shortDescription: 'Jacket canvas xanh rêu, cảm hứng khí trời Đà Lạt.',
      description: 'Áo khoác canvas dày vừa, túi hộp tiện dụng và phom unisex. Phù hợp đi làm, du lịch hoặc mặc layer nhẹ.',
    },
    {
      name: 'Hoodie Hạ Long French Terry - Teal',
      slug: 'hoodie-ha-long-french-terry-teal',
      sku: 'VN-HDI-001',
      category: 'Outerwear',
      subCategory: 'hoodie',
      brand: 'coolmate',
      gender: Gender.UNISEX,
      material: 'French terry cotton 380gsm',
      careInstructions: 'Giặt lộn trái, không sấy nóng.',
      basePrice: 599000,
      comparePrice: 729000,
      image: '/vietnam-fashion/hoodie-ha-long.svg',
      colors: ['Navy', 'Xanh rêu'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      tags: ['hoodie', 'ha-long', 'french-terry'],
      newArrival: true,
      soldCount: 240,
      avgRating: 4.8,
      reviewCount: 52,
      shortDescription: 'Hoodie unisex dày dặn, màu xanh lấy cảm hứng Hạ Long.',
      description: 'French terry mềm bên trong, mũ hai lớp đứng phom. Một chiếc hoodie cho buổi tối se lạnh hoặc chuyến đi cuối tuần.',
    },
    {
      name: 'Bomber Sài Gòn Lightweight - Đen',
      slug: 'bomber-sai-gon-lightweight-den',
      sku: 'VN-JKT-002',
      category: 'Outerwear',
      subCategory: 'jacket',
      brand: 'local-saigon',
      gender: Gender.UNISEX,
      material: 'Nylon nhẹ chống gió',
      careInstructions: 'Giặt tay, phơi nơi thoáng mát.',
      basePrice: 799000,
      image: '/vietnam-fashion/ao-khoac-da-lat.svg',
      colors: ['Đen', 'Navy'],
      sizes: ['S', 'M', 'L', 'XL'],
      tags: ['bomber', 'sai-gon', 'lightweight'],
      soldCount: 130,
      avgRating: 4.5,
      reviewCount: 19,
      shortDescription: 'Bomber nhẹ, chống gió, hợp thời tiết giao mùa.',
      description: 'Áo bomber đen tối giản, lớp ngoài nylon nhẹ và bo cổ tay gọn. Dễ mặc khi di chuyển bằng xe máy trong thành phố.',
    },
    {
      name: 'Đầm Midi Hoa Sen - Hồng',
      slug: 'dam-midi-hoa-sen-hong',
      sku: 'VN-DRS-001',
      category: 'Dresses',
      subCategory: 'dam-midi',
      brand: 'nem',
      gender: Gender.FEMALE,
      material: 'Lụa pha rayon',
      careInstructions: 'Giặt tay nước lạnh, treo bằng móc đệm vai.',
      basePrice: 899000,
      comparePrice: 1190000,
      image: '/vietnam-fashion/dam-midi-sen.svg',
      colors: ['Hồng sen', 'Kem'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      tags: ['dam-midi', 'hoa-sen', 'nu', 'lua'],
      featured: true,
      newArrival: true,
      soldCount: 190,
      avgRating: 4.9,
      reviewCount: 44,
      shortDescription: 'Đầm midi màu hồng sen, thanh lịch và nữ tính.',
      description: 'Thiết kế eo nhẹ, chiều dài midi và chất lụa pha mềm. Cảm hứng từ hoa sen Việt Nam nhưng thể hiện bằng ngôn ngữ hiện đại.',
    },
    {
      name: 'Áo Dài Cách Tân Gấm Nhẹ - Tím',
      slug: 'ao-dai-cach-tan-gam-nhe-tim',
      sku: 'VN-ADI-001',
      category: 'Dresses',
      subCategory: 'ao-dai-cach-tan',
      brand: 'ha-noi-studio',
      gender: Gender.FEMALE,
      material: 'Gấm jacquard nhẹ',
      careInstructions: 'Giặt khô hoặc giặt tay rất nhẹ, không vắt mạnh.',
      basePrice: 1290000,
      comparePrice: 1590000,
      image: '/vietnam-fashion/ao-dai-cach-tan.svg',
      colors: ['Tím gấm', 'Kem'],
      sizes: ['XS', 'S', 'M', 'L'],
      tags: ['ao-dai', 'cach-tan', 'gam', 'viet-nam'],
      featured: true,
      bestSeller: true,
      soldCount: 155,
      avgRating: 4.9,
      reviewCount: 39,
      shortDescription: 'Áo dài cách tân gấm nhẹ, hiện đại mà vẫn Việt.',
      description: 'Tà áo được rút gọn để dễ di chuyển, cổ và đường xẻ giữ tinh thần áo dài Việt. Phù hợp sự kiện, lễ Tết hoặc chụp ảnh.',
    },
    {
      name: 'Chân Váy Linen Hà Nội - Nâu',
      slug: 'chan-vay-linen-ha-noi-nau',
      sku: 'VN-SKT-001',
      category: 'Dresses',
      subCategory: 'chan-vay',
      brand: 'ha-noi-studio',
      gender: Gender.FEMALE,
      material: 'Linen 55%, rayon 45%',
      careInstructions: 'Giặt nhẹ, ủi hơi nước.',
      basePrice: 559000,
      image: '/vietnam-fashion/chan-vay-ha-noi.svg',
      colors: ['Nâu linen', 'Kem'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      tags: ['chan-vay', 'linen', 'ha-noi'],
      soldCount: 175,
      avgRating: 4.7,
      reviewCount: 29,
      shortDescription: 'Chân váy linen nâu, xếp ly nhẹ và dễ phối.',
      description: 'Form chữ A xếp ly vừa phải, lưng sau có chun ẩn giúp thoải mái. Màu nâu linen hợp áo sơ mi trắng hoặc knit mỏng.',
    },
    {
      name: 'Túi Tote Canvas Việt - Đen',
      slug: 'tui-tote-canvas-viet-den',
      sku: 'VN-BAG-001',
      category: 'Accessories',
      subCategory: 'tui-tote',
      brand: 'local-saigon',
      gender: Gender.UNISEX,
      material: 'Canvas cotton 12oz',
      careInstructions: 'Giặt tay, không ngâm phần in lâu.',
      basePrice: 199000,
      comparePrice: 249000,
      image: '/vietnam-fashion/tui-tote-canvas.svg',
      colors: ['Đen', 'Kem'],
      sizes: ['OS'],
      tags: ['tui-tote', 'canvas', 'viet'],
      bestSeller: true,
      soldCount: 900,
      avgRating: 4.8,
      reviewCount: 210,
      shortDescription: 'Tote canvas 12oz, chứa vừa laptop 13 inch.',
      description: 'Túi tote canvas dày, quai may gia cố và họa tiết Việt tối giản. Dùng đi học, đi làm hoặc mua sắm hằng ngày.',
    },
    {
      name: 'Nón Bucket Việt Canvas - Xanh Rêu',
      slug: 'non-bucket-viet-canvas-xanh-reu',
      sku: 'VN-HAT-001',
      category: 'Accessories',
      subCategory: 'non',
      brand: 'yody',
      gender: Gender.UNISEX,
      material: 'Canvas cotton',
      careInstructions: 'Giặt tay, định hình lại khi phơi.',
      basePrice: 179000,
      image: '/vietnam-fashion/non-bucket-viet.svg',
      colors: ['Xanh rêu', 'Đen'],
      sizes: ['OS'],
      tags: ['non', 'bucket', 'canvas'],
      newArrival: true,
      soldCount: 260,
      avgRating: 4.6,
      reviewCount: 48,
      shortDescription: 'Nón bucket canvas unisex, dễ phối đồ streetwear.',
      description: 'Vành nón vừa phải, chất canvas đứng form. Phụ kiện gọn cho nắng nhẹ và outfit cuối tuần.',
    },
    {
      name: 'Bộ Vớ Cotton Việt 3 Đôi - Trắng',
      slug: 'bo-vo-cotton-viet-3-doi-trang',
      sku: 'VN-SOX-001',
      category: 'Accessories',
      subCategory: 'vo',
      brand: 'coolmate',
      gender: Gender.UNISEX,
      material: 'Cotton combed 80%, spandex 20%',
      careInstructions: 'Giặt máy, không tẩy chlorine.',
      basePrice: 129000,
      image: '/vietnam-fashion/non-bucket-viet.svg',
      colors: ['Trắng', 'Đen'],
      sizes: ['OS'],
      tags: ['vo', 'cotton', '3-doi'],
      soldCount: 1200,
      avgRating: 4.7,
      reviewCount: 260,
      shortDescription: 'Set 3 đôi vớ cotton, co giãn và thoáng chân.',
      description: 'Vớ cổ ngắn dệt từ cotton combed, phần gót ôm chân và đế có đệm nhẹ. Sản phẩm basic giá VND dễ mua.',
    },
    {
      name: 'Sneaker Sài Gòn Low Top - Trắng',
      slug: 'sneaker-sai-gon-low-top-trang',
      sku: 'VN-SNK-001',
      category: 'Shoes',
      subCategory: 'sneaker',
      brand: 'local-saigon',
      gender: Gender.UNISEX,
      material: 'Da tổng hợp cao cấp, đế cao su',
      careInstructions: 'Lau bằng khăn ẩm, tránh ngâm nước.',
      basePrice: 799000,
      comparePrice: 990000,
      image: '/vietnam-fashion/sneaker-saigon.svg',
      colors: ['Trắng', 'Đen'],
      sizes: ['38', '39', '40', '41', '42', '43'],
      tags: ['sneaker', 'sai-gon', 'low-top'],
      featured: true,
      bestSeller: true,
      soldCount: 360,
      avgRating: 4.8,
      reviewCount: 77,
      shortDescription: 'Sneaker trắng low top, dễ phối mọi outfit.',
      description: 'Thiết kế low top sạch, đế cao su bám tốt và lót giày êm. Một đôi sneaker đô thị cho nhịp sống Sài Gòn.',
    },
    {
      name: 'Sneaker Canvas Đen Việt Nam',
      slug: 'sneaker-canvas-den-viet-nam',
      sku: 'VN-SNK-002',
      category: 'Shoes',
      subCategory: 'sneaker',
      brand: 'yody',
      gender: Gender.UNISEX,
      material: 'Canvas cotton, đế cao su lưu hóa',
      careInstructions: 'Chải khô trước, giặt nhẹ bằng xà phòng trung tính.',
      basePrice: 549000,
      image: '/vietnam-fashion/sneaker-saigon.svg',
      colors: ['Đen', 'Kem'],
      sizes: ['38', '39', '40', '41', '42', '43'],
      tags: ['sneaker', 'canvas', 'viet-nam'],
      newArrival: true,
      soldCount: 145,
      avgRating: 4.5,
      reviewCount: 20,
      shortDescription: 'Sneaker canvas đen, nhẹ và dễ chăm sóc.',
      description: 'Upper canvas dày vừa, đế cao su lưu hóa linh hoạt. Phù hợp mặc hằng ngày với jeans hoặc quần short.',
    },
  ];

  const createdProducts = [];
  for (const productSeed of products) {
    const product = await prisma.product.create({
      data: {
        name: productSeed.name,
        slug: productSeed.slug,
        sku: productSeed.sku,
        description: productSeed.description,
        shortDescription: productSeed.shortDescription,
        categoryId: categoryBySlug[productSeed.category],
        subCategoryId: subCategoryBySlug[productSeed.subCategory],
        brandId: brandBySlug[productSeed.brand],
        gender: productSeed.gender,
        material: productSeed.material,
        careInstructions: productSeed.careInstructions,
        basePrice: productSeed.basePrice,
        comparePrice: productSeed.comparePrice,
        isFeatured: Boolean(productSeed.featured),
        isNewArrival: Boolean(productSeed.newArrival),
        isBestSeller: Boolean(productSeed.bestSeller),
        isActive: true,
        soldCount: productSeed.soldCount ?? 0,
        avgRating: productSeed.avgRating ?? 0,
        reviewCount: productSeed.reviewCount ?? 0,
        tags: productSeed.tags,
        metaTitle: `${productSeed.name} | Achromatic Vietnam`,
        metaDescription: productSeed.shortDescription,
        images: {
          createMany: {
            data: [
              {
                url: productSeed.image,
                altText: productSeed.name,
                isPrimary: true,
                sortOrder: 0,
              },
              {
                url: productSeed.secondaryImage ?? productSeed.image,
                altText: `${productSeed.name} - ảnh phụ`,
                isPrimary: false,
                sortOrder: 1,
              },
            ],
          },
        },
        specifications: {
          createMany: {
            data: [
              { label: 'Xuất xứ', value: 'Thiết kế và sản xuất tại Việt Nam', sortOrder: 0 },
              { label: 'Chất liệu', value: productSeed.material, sortOrder: 1 },
              { label: 'Tiền tệ', value: 'VND', sortOrder: 2 },
            ],
          },
        },
      },
    });

    for (const colorName of productSeed.colors) {
      for (const sizeName of productSeed.sizes) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            colorId: colorByName[colorName],
            sizeId: sizeByName[sizeName],
            sku: `${productSeed.sku}-${colorName.replace(/\s+/g, '').slice(0, 3).toUpperCase()}-${sizeName}`,
            isActive: true,
          },
        });

        const quantity = 18 + ((productSeed.sku.length + colorName.length + sizeName.length) % 42);
        await prisma.inventory.create({
          data: {
            productId: product.id,
            variantId: variant.id,
            quantity,
            reserved: 0,
            threshold: 5,
            location: productSeed.category === 'Polo' || productSeed.category === 'Shirts' ? 'Kho Hà Nội' : 'Kho TP.HCM',
          },
        });
      }
    }

    createdProducts.push(product);
  }

  await prisma.shippingMethod.createMany({
    data: [
      {
        name: 'Giao hàng tiêu chuẩn',
        description: 'Giao trong 2-4 ngày làm việc trên toàn quốc.',
        basePrice: 30000,
        freeThreshold: 799000,
        estimatedDays: '2-4 ngày',
        sortOrder: 1,
      },
      {
        name: 'Giao nhanh nội thành',
        description: 'Áp dụng Hà Nội và TP.HCM.',
        basePrice: 50000,
        freeThreshold: 1299000,
        estimatedDays: 'Trong ngày hoặc 1 ngày',
        sortOrder: 2,
      },
    ],
  });

  await prisma.coupon.createMany({
    data: [
      {
        code: 'VIETNAM10',
        name: 'Giảm 10% hàng Việt',
        description: 'Giảm 10% cho đơn hàng thời trang Việt Nam.',
        type: CouponType.PERCENTAGE,
        value: 10,
        minOrderAmount: 500000,
        maxDiscount: 150000,
        usageLimit: 500,
        usagePerUser: 1,
        isActive: true,
      },
      {
        code: 'FREESHIP799',
        name: 'Miễn phí vận chuyển',
        description: 'Miễn phí giao tiêu chuẩn cho đơn từ 799.000đ.',
        type: CouponType.FREE_SHIPPING,
        value: 0,
        minOrderAmount: 799000,
        usageLimit: 1000,
        usagePerUser: 3,
        isActive: true,
      },
    ],
  });

  await prisma.banner.createMany({
    data: [
      {
        title: 'Thời Trang Việt Nam 2026',
        subtitle: 'Cotton, linen và denim cho nhịp sống hiện đại.',
        imageUrl: '/vietnam-fashion/ao-thun-saigon.svg',
        mobileImageUrl: '/vietnam-fashion/polo-ha-noi.svg',
        linkUrl: '/collections',
        linkText: 'Mua ngay',
        position: BannerPosition.HERO,
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Linen Hội An',
        subtitle: 'Thoáng nhẹ, tinh tế và rất Việt Nam.',
        imageUrl: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
        linkUrl: '/collections?category=Shirts',
        linkText: 'Xem sơ mi',
        position: BannerPosition.HERO,
        isActive: true,
        sortOrder: 2,
      },
    ],
  });

  const vietnamEssentials = await prisma.collection.create({
    data: {
      name: 'Vietnam Essentials',
      slug: 'vietnam-essentials',
      description: 'Những món dễ mặc nhất cho tủ đồ người Việt.',
      imageUrl: '/vietnam-fashion/ao-thun-saigon.svg',
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const newInVietnam = await prisma.collection.create({
    data: {
      name: 'Hàng Mới Việt Nam',
      slug: 'hang-moi-viet-nam',
      description: 'Sản phẩm mới với cảm hứng từ Sài Gòn, Hà Nội, Hội An.',
      imageUrl: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
    },
  });

  await prisma.collectionProduct.createMany({
    data: createdProducts.slice(0, 12).map((product, index) => ({
      collectionId: vietnamEssentials.id,
      productId: product.id,
      sortOrder: index,
    })),
  });

  await prisma.collectionProduct.createMany({
    data: createdProducts
      .filter((product) => products.find((seed) => seed.slug === product.slug)?.newArrival)
      .map((product, index) => ({
        collectionId: newInVietnam.id,
        productId: product.id,
        sortOrder: index,
      })),
  });

  console.log(`Seed complete: ${createdProducts.length} Vietnamese fashion products created.`);
  console.log('Admin: admin@achromatic.vn / Admin@123');
  console.log('Customer: khachhang@achromatic.vn / Customer@123');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
