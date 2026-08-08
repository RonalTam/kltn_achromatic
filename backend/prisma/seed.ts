import {
  BannerPosition,
  Gender,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  Role,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const SEED_PREFIX = 'ACH';
const IMAGE_CHECK_ENABLED = process.env.SKIP_IMAGE_CHECK !== 'true';

type CategorySeed = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
};

type ProductSeed = {
  name: string;
  slug: string;
  sku: string;
  categorySlug: string;
  subCategorySlug: string;
  brandSlug: string;
  gender: Gender;
  material: string;
  careInstructions: string;
  basePrice: number;
  comparePrice?: number;
  images: string[];
  colors: string[];
  sizes: string[];
  tags: string[];
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  soldCount: number;
  avgRating: number;
  reviewCount: number;
};

type ProductTemplate = {
  categorySlug: string;
  baseSku: string;
  subCategorySlug: string;
  gender: Gender;
  material: string;
  careInstructions: string;
  pitch: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  images: string[];
  products: Array<{
    name: string;
    brand: string;
    price: number;
    comparePrice?: number;
    material?: string;
    gender?: Gender;
    colors?: string[];
    sizes?: string[];
  }>;
};

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const IMAGE_POOLS = {
  tshirts: [
    img('photo-1521572163474-6864f9cf17ab'),
    img('photo-1576566588028-4147f3842f27'),
    img('photo-1523381294911-8d3cead13475'),
    img('photo-1503341504253-dff4815485f1'),
    img('photo-1512436991641-6745cdb1723f'),
  ],
  shirts: [
    img('photo-1596755094514-f87e34085b2c'),
    img('photo-1602810318383-e386cc2a3ccf'),
    img('photo-1598033129183-c4f50c736f10'),
    img('photo-1603252109303-2751441dd157'),
    img('photo-1563630423918-b58f07336ac9'),
  ],
  outerwear: [
    img('photo-1543076447-215ad9ba6923'),
    img('photo-1520975916090-3105956dac38'),
    img('photo-1515886657613-9f3515b0c78f'),
    img('photo-1539533018447-63fcce2678e3'),
    img('photo-1551028719-00167b16eac5'),
  ],
  hoodies: [
    img('photo-1556821840-3a63f95609a7'),
    img('photo-1578587018452-892bacefd3f2'),
    img('photo-1609873814058-a8928924184a'),
    img('photo-1607345366928-199ea26cfe3e'),
    img('photo-1620799140408-edc6dcb6d633'),
  ],
  jeans: [
    img('photo-1542272604-787c3835535d'),
    img('photo-1475178626620-a4d074967452'),
    img('photo-1541099649105-f69ad21f3246'),
    img('photo-1516762689617-e1cffcef479d'),
    img('photo-1512436991641-6745cdb1723f'),
  ],
  trousers: [
    img('photo-1594633312681-425c7b97ccd1'),
    img('photo-1591047139829-d91aecb6caea'),
    img('photo-1529139574466-a303027c1d8b'),
    img('photo-1576995853123-5a10305d93c0'),
  ],
  dresses: [
    img('photo-1595777457583-95e059d581b8'),
    img('photo-1515372039744-b8f02a3ae446'),
    img('photo-1469334031218-e382a71b716b'),
    img('photo-1502716119720-b23a93e5fe1b'),
    img('photo-1496747611176-843222e1e57c'),
  ],
  accessories: [
    img('photo-1572635196237-14b3f281503f'),
    img('photo-1511499767150-a48a237f0083'),
    img('photo-1523170335258-f5ed11844a49'),
    img('photo-1511556532299-8f662fc26c06'),
  ],
  shoes: [
    img('photo-1549298916-b41d501d3772'),
    img('photo-1460353581641-37baddab0fa2'),
    img('photo-1608231387042-66d1773070a5'),
    img('photo-1543508282-6319a3e2621f'),
    img('photo-1525966222134-fcfa99b8ae77'),
  ],
  bags: [
    img('photo-1584917865442-de89df76afd3'),
    img('photo-1594223274512-ad4803739b7c'),
    img('photo-1566150905458-1bf1fc113f0d'),
    img('photo-1575428652377-a2d80e2277fc'),
  ],
};

const categories: CategorySeed[] = [
  { name: 'Áo thun', slug: 'ao-thun', description: 'Áo thun cotton, áo thun basic và oversize dễ mặc mỗi ngày.', sortOrder: 1 },
  { name: 'Áo sơ mi', slug: 'ao-so-mi', description: 'Sơ mi linen, oxford và poplin cho đi làm lẫn cuối tuần.', sortOrder: 2 },
  { name: 'Áo khoác', slug: 'ao-khoac', description: 'Jacket, blazer nhẹ và áo khoác ngoài tối giản.', sortOrder: 3 },
  { name: 'Hoodie & Sweater', slug: 'hoodie-sweater', description: 'Hoodie, sweater và knitwear cho phong cách unisex hiện đại.', sortOrder: 4 },
  { name: 'Quần jeans', slug: 'quan-jeans', description: 'Jeans ống suông, slim và straight fit cho nam nữ.', sortOrder: 5 },
  { name: 'Quần tây', slug: 'quan-tay', description: 'Quần tây, quần âu và trouser smart-casual.', sortOrder: 6 },
  { name: 'Váy & Đầm', slug: 'vay-dam', description: 'Đầm midi, đầm suông và váy liền thanh lịch.', sortOrder: 7 },
  { name: 'Chân váy', slug: 'chan-vay', description: 'Chân váy chữ A, midi và xếp ly dễ phối.', sortOrder: 8 },
  { name: 'Phụ kiện', slug: 'phu-kien', description: 'Mũ, kính, thắt lưng, khăn và phụ kiện hoàn thiện outfit.', sortOrder: 9 },
  { name: 'Giày dép', slug: 'giay-dep', description: 'Sneaker, loafer, sandal và giày casual cho đô thị.', sortOrder: 10 },
  { name: 'Túi xách', slug: 'tui-xach', description: 'Tote, túi đeo chéo và túi xách tối giản.', sortOrder: 11 },
  { name: 'Đồ unisex', slug: 'do-unisex', description: 'Những item không giới hạn giới tính, dễ mặc và dễ phối.', sortOrder: 12 },
];

const subCategories = [
  ['ao-thun', 'Áo thun basic', 'ao-thun-basic'],
  ['ao-thun', 'Áo thun oversize', 'ao-thun-oversize'],
  ['ao-so-mi', 'Sơ mi linen', 'so-mi-linen'],
  ['ao-so-mi', 'Sơ mi công sở', 'so-mi-cong-so'],
  ['ao-khoac', 'Jacket', 'jacket'],
  ['ao-khoac', 'Blazer nhẹ', 'blazer-nhe'],
  ['hoodie-sweater', 'Hoodie', 'hoodie'],
  ['hoodie-sweater', 'Sweater', 'sweater'],
  ['quan-jeans', 'Jeans ống suông', 'jeans-ong-suong'],
  ['quan-jeans', 'Jeans slim', 'jeans-slim'],
  ['quan-tay', 'Quần âu', 'quan-au'],
  ['quan-tay', 'Trouser smart casual', 'trouser-smart-casual'],
  ['vay-dam', 'Đầm midi', 'dam-midi'],
  ['vay-dam', 'Đầm suông', 'dam-suong'],
  ['chan-vay', 'Chân váy chữ A', 'chan-vay-chu-a'],
  ['chan-vay', 'Chân váy midi', 'chan-vay-midi'],
  ['phu-kien', 'Mũ & kính', 'mu-kinh'],
  ['phu-kien', 'Thắt lưng & khăn', 'that-lung-khan'],
  ['giay-dep', 'Sneaker', 'sneaker'],
  ['giay-dep', 'Loafer & sandal', 'loafer-sandal'],
  ['tui-xach', 'Túi tote', 'tui-tote'],
  ['tui-xach', 'Túi đeo chéo', 'tui-deo-cheo'],
  ['do-unisex', 'Unisex basic', 'unisex-basic'],
  ['do-unisex', 'Unisex streetwear', 'unisex-streetwear'],
] as const;

const brands = [
  ['Achromatic Studio', 'achromatic-studio', 'Nhãn hàng riêng của Achromatic, tập trung vào phom dáng tối giản và bảng màu trung tính.'],
  ['Routine', 'routine', 'Thời trang ứng dụng cho nhịp sống Việt Nam hiện đại.', 'https://routine.vn'],
  ['Yody', 'yody', 'Thương hiệu Việt với các sản phẩm casual dễ mặc.', 'https://yody.vn'],
  ['Coolmate', 'coolmate', 'Basic wear Việt Nam, chú trọng chất liệu và sự tiện dụng.', 'https://coolmate.me'],
  ['Local Brand VN', 'local-brand-vn', 'Tuyển chọn local brand Việt với tinh thần đô thị trẻ.'],
  ['Urban Style', 'urban-style', 'Các item street-casual cân bằng giữa gọn gàng và nổi bật.'],
  ['Minimal Wear', 'minimal-wear', 'Tủ đồ capsule tối giản cho nam nữ.'],
  ['Streetwear Lab', 'streetwear-lab', 'Streetwear form rộng, màu sắc tiết chế và dễ phối.'],
] as const;

const colors = [
  ['Trắng', '#F8F8F4'],
  ['Đen', '#111111'],
  ['Xám', '#8D9299'],
  ['Kem', '#EFE4D0'],
  ['Navy', '#16263D'],
  ['Xanh nhạt', '#9EB7C8'],
  ['Xanh rêu', '#4D5B44'],
  ['Nâu', '#7A5138'],
  ['Be', '#D8C3A5'],
  ['Hồng phấn', '#E6A6B7'],
  ['Đỏ đô', '#7B2432'],
  ['Indigo', '#263D63'],
] as const;

const sizes = [
  ['XS', 1],
  ['S', 2],
  ['M', 3],
  ['L', 4],
  ['XL', 5],
  ['XXL', 6],
  ['26', 7],
  ['27', 8],
  ['28', 9],
  ['29', 10],
  ['30', 11],
  ['31', 12],
  ['32', 13],
  ['34', 14],
  ['36', 15],
  ['37', 16],
  ['38', 17],
  ['39', 18],
  ['40', 19],
  ['41', 20],
  ['42', 21],
  ['43', 22],
  ['OS', 23],
] as const;

const productTemplates: ProductTemplate[] = [
  {
    categorySlug: 'ao-thun',
    baseSku: 'TSH',
    subCategorySlug: 'ao-thun-basic',
    gender: Gender.UNISEX,
    material: 'Cotton compact 220gsm',
    careInstructions: 'Giặt máy 30°C, lộn trái khi giặt, phơi trong bóng râm.',
    pitch: 'Áo thun dễ mặc cho khí hậu Việt Nam, bề mặt vải mịn và giữ form tốt.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Trắng', 'Đen', 'Xám'],
    tags: ['ao-thun', 'cotton', 'basic', 'unisex'],
    images: IMAGE_POOLS.tshirts,
    products: [
      { name: 'Áo thun cotton oversize nam màu trắng', brand: 'coolmate', price: 249000, comparePrice: 329000, colors: ['Trắng', 'Đen'] },
      { name: 'Áo thun basic nữ cổ tròn màu đen', brand: 'routine', price: 199000, colors: ['Đen', 'Trắng'] },
      { name: 'Áo thun compact unisex màu xám melange', brand: 'achromatic-studio', price: 279000, comparePrice: 349000, colors: ['Xám', 'Trắng'] },
      { name: 'Áo thun boxy fit màu kem tối giản', brand: 'minimal-wear', price: 329000, colors: ['Kem', 'Đen'] },
      { name: 'Áo thun graphic local màu trắng ngà', brand: 'local-brand-vn', price: 359000, comparePrice: 429000, colors: ['Trắng', 'Kem'] },
      { name: 'Áo thun slim fit nam cổ tròn navy', brand: 'yody', price: 189000, colors: ['Navy', 'Xám'] },
      { name: 'Áo thun nữ form regular màu hồng phấn', brand: 'routine', price: 229000, colors: ['Hồng phấn', 'Trắng'], gender: Gender.FEMALE },
      { name: 'Áo thun dày dặn streetwear màu đen', brand: 'streetwear-lab', price: 399000, colors: ['Đen', 'Xám'] },
      { name: 'Áo thun cổ tim cotton lạnh màu be', brand: 'yody', price: 179000, colors: ['Be', 'Trắng'] },
      { name: 'Áo thun premium Achromatic màu trắng', brand: 'achromatic-studio', price: 369000, comparePrice: 449000, colors: ['Trắng', 'Đen'] },
    ],
  },
  {
    categorySlug: 'ao-so-mi',
    baseSku: 'SHT',
    subCategorySlug: 'so-mi-linen',
    gender: Gender.UNISEX,
    material: 'Linen pha cotton',
    careInstructions: 'Giặt nhẹ, ưu tiên treo phơi bằng móc và ủi hơi nước nhiệt vừa.',
    pitch: 'Sơ mi thoáng nhẹ, phom gọn, phù hợp đi làm, đi chơi hoặc mặc layer.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Trắng', 'Kem', 'Navy'],
    tags: ['ao-so-mi', 'linen', 'cong-so', 'smart-casual'],
    images: IMAGE_POOLS.shirts,
    products: [
      { name: 'Áo sơ mi linen tay dài form rộng màu kem', brand: 'achromatic-studio', price: 529000, comparePrice: 649000 },
      { name: 'Áo sơ mi oxford nam trắng công sở', brand: 'routine', price: 459000, comparePrice: 559000, material: 'Cotton oxford' },
      { name: 'Áo sơ mi nữ poplin xanh nhạt', brand: 'yody', price: 399000, colors: ['Xanh nhạt', 'Trắng'], gender: Gender.FEMALE, material: 'Cotton poplin' },
      { name: 'Áo sơ mi Cuban collar màu be', brand: 'urban-style', price: 429000, colors: ['Be', 'Nâu'] },
      { name: 'Áo sơ mi denim mỏng màu indigo', brand: 'local-brand-vn', price: 579000, colors: ['Indigo', 'Navy'], material: 'Denim cotton mỏng' },
      { name: 'Áo sơ mi oversized kẻ sọc navy', brand: 'minimal-wear', price: 499000, colors: ['Navy', 'Trắng'] },
      { name: 'Áo sơ mi tay ngắn resort màu trắng', brand: 'coolmate', price: 349000, colors: ['Trắng', 'Kem'] },
      { name: 'Áo sơ mi linen nữ cổ V màu nâu', brand: 'routine', price: 559000, colors: ['Nâu', 'Kem'], gender: Gender.FEMALE },
    ],
  },
  {
    categorySlug: 'ao-khoac',
    baseSku: 'JKT',
    subCategorySlug: 'jacket',
    gender: Gender.UNISEX,
    material: 'Cotton canvas 320gsm',
    careInstructions: 'Giặt tay hoặc giặt chế độ nhẹ, không tẩy và phơi nơi thoáng mát.',
    pitch: 'Áo khoác nhẹ cho thời tiết giao mùa, phom hiện đại và dễ phối nhiều lớp.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Đen', 'Xanh rêu', 'Navy'],
    tags: ['ao-khoac', 'jacket', 'outerwear', 'layer'],
    images: IMAGE_POOLS.outerwear,
    products: [
      { name: 'Áo khoác canvas unisex màu xanh rêu', brand: 'routine', price: 899000, comparePrice: 1099000 },
      { name: 'Áo khoác bomber nhẹ màu đen', brand: 'streetwear-lab', price: 799000, colors: ['Đen', 'Navy'], material: 'Nylon chống gió nhẹ' },
      { name: 'Áo khoác denim trucker xanh indigo', brand: 'local-brand-vn', price: 999000, colors: ['Indigo', 'Xanh nhạt'], material: 'Denim cotton 12oz' },
      { name: 'Blazer linen relaxed màu be', brand: 'minimal-wear', price: 1199000, comparePrice: 1399000, colors: ['Be', 'Kem'], material: 'Linen pha rayon' },
      { name: 'Áo khoác dù chống gió màu navy', brand: 'yody', price: 649000, colors: ['Navy', 'Đen'], material: 'Polyester chống gió' },
      { name: 'Áo khoác field jacket màu nâu', brand: 'urban-style', price: 1099000, colors: ['Nâu', 'Xanh rêu'] },
      { name: 'Áo khoác sơ mi dạ mỏng màu xám', brand: 'achromatic-studio', price: 1299000, colors: ['Xám', 'Đen'], material: 'Wool blend mỏng' },
      { name: 'Áo khoác cropped nữ màu kem', brand: 'routine', price: 749000, colors: ['Kem', 'Be'], gender: Gender.FEMALE },
    ],
  },
  {
    categorySlug: 'hoodie-sweater',
    baseSku: 'HDW',
    subCategorySlug: 'hoodie',
    gender: Gender.UNISEX,
    material: 'French terry cotton 380gsm',
    careInstructions: 'Giặt lộn trái, không sấy nóng, phơi ngang để giữ phom.',
    pitch: 'Hoodie và sweater mềm ấm, hợp layering và phong cách tối giản thường ngày.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Đen', 'Xám', 'Kem'],
    tags: ['hoodie', 'sweater', 'unisex', 'streetwear'],
    images: IMAGE_POOLS.hoodies,
    products: [
      { name: 'Hoodie French terry unisex màu xám', brand: 'coolmate', price: 599000, comparePrice: 729000 },
      { name: 'Hoodie oversize Streetwear Lab màu đen', brand: 'streetwear-lab', price: 699000, colors: ['Đen', 'Navy'] },
      { name: 'Sweater cổ tròn cotton màu kem', brand: 'minimal-wear', price: 549000, colors: ['Kem', 'Xám'], material: 'Cotton knit' },
      { name: 'Áo nỉ crewneck Achromatic màu navy', brand: 'achromatic-studio', price: 649000, comparePrice: 799000, colors: ['Navy', 'Đen'] },
      { name: 'Hoodie zip basic màu xanh rêu', brand: 'yody', price: 499000, colors: ['Xanh rêu', 'Xám'] },
      { name: 'Sweater nữ cổ tim màu hồng phấn', brand: 'routine', price: 579000, colors: ['Hồng phấn', 'Kem'], gender: Gender.FEMALE, material: 'Acrylic cotton knit' },
      { name: 'Hoodie heavy weight màu nâu', brand: 'urban-style', price: 799000, colors: ['Nâu', 'Đen'] },
      { name: 'Sweater ribbed tối giản màu trắng ngà', brand: 'achromatic-studio', price: 899000, colors: ['Trắng', 'Kem'], material: 'Cotton wool blend' },
    ],
  },
  {
    categorySlug: 'quan-jeans',
    baseSku: 'JNS',
    subCategorySlug: 'jeans-ong-suong',
    gender: Gender.UNISEX,
    material: 'Denim cotton 12oz',
    careInstructions: 'Giặt riêng lần đầu, lộn trái khi giặt để giữ màu denim.',
    pitch: 'Jeans có độ đứng vừa phải, dễ phối với áo thun, sơ mi hoặc hoodie.',
    sizes: ['28', '29', '30', '31', '32', '34'],
    colors: ['Indigo', 'Xanh nhạt', 'Đen'],
    tags: ['quan-jeans', 'denim', 'indigo', 'casual'],
    images: IMAGE_POOLS.jeans,
    products: [
      { name: 'Quần jeans ống suông nữ xanh nhạt', brand: 'routine', price: 599000, comparePrice: 729000, colors: ['Xanh nhạt', 'Indigo'], gender: Gender.FEMALE, sizes: ['26', '27', '28', '29', '30'] },
      { name: 'Quần jeans straight fit nam indigo', brand: 'local-brand-vn', price: 699000, colors: ['Indigo', 'Đen'] },
      { name: 'Quần jeans đen slim fit tối giản', brand: 'achromatic-studio', price: 749000, colors: ['Đen', 'Indigo'] },
      { name: 'Quần jeans baggy unisex xanh wash', brand: 'streetwear-lab', price: 799000, comparePrice: 899000, colors: ['Xanh nhạt', 'Indigo'] },
      { name: 'Quần jeans cropped nữ màu xanh vintage', brand: 'yody', price: 529000, colors: ['Xanh nhạt'], gender: Gender.FEMALE, sizes: ['26', '27', '28', '29', '30'] },
      { name: 'Quần jeans raw denim nam màu navy', brand: 'minimal-wear', price: 899000, colors: ['Navy', 'Indigo'] },
      { name: 'Quần jeans ống rộng unisex màu đen', brand: 'urban-style', price: 679000, colors: ['Đen'] },
      { name: 'Quần jeans tapered fit xanh đậm', brand: 'coolmate', price: 649000, colors: ['Indigo', 'Navy'] },
    ],
  },
  {
    categorySlug: 'quan-tay',
    baseSku: 'TRS',
    subCategorySlug: 'quan-au',
    gender: Gender.MALE,
    material: 'Poly-viscose co giãn nhẹ',
    careInstructions: 'Giặt nhẹ, treo bằng móc kẹp, ủi nhiệt thấp.',
    pitch: 'Quần tây smart-casual, đủ lịch sự cho văn phòng và đủ thoải mái cả ngày.',
    sizes: ['28', '29', '30', '31', '32', '34'],
    colors: ['Đen', 'Xám', 'Navy'],
    tags: ['quan-tay', 'cong-so', 'smart-casual', 'trouser'],
    images: IMAGE_POOLS.trousers,
    products: [
      { name: 'Quần tây nam slim fit màu đen', brand: 'routine', price: 549000, comparePrice: 679000 },
      { name: 'Quần âu nữ ống đứng màu xám', brand: 'yody', price: 499000, colors: ['Xám', 'Đen'], gender: Gender.FEMALE, sizes: ['26', '27', '28', '29', '30'] },
      { name: 'Quần tây pleated relaxed màu navy', brand: 'achromatic-studio', price: 799000, colors: ['Navy', 'Đen'] },
      { name: 'Quần trouser cạp cao nữ màu be', brand: 'minimal-wear', price: 699000, colors: ['Be', 'Kem'], gender: Gender.FEMALE, sizes: ['26', '27', '28', '29', '30'] },
      { name: 'Quần tây nam ống suông màu nâu', brand: 'urban-style', price: 649000, colors: ['Nâu', 'Đen'] },
      { name: 'Quần công sở co giãn màu xám đậm', brand: 'coolmate', price: 449000, colors: ['Xám', 'Navy'] },
      { name: 'Quần tây cropped nữ màu kem', brand: 'routine', price: 599000, colors: ['Kem', 'Be'], gender: Gender.FEMALE, sizes: ['26', '27', '28', '29', '30'] },
      { name: 'Quần âu premium Achromatic màu đen', brand: 'achromatic-studio', price: 779000, colors: ['Đen', 'Xám'] },
    ],
  },
  {
    categorySlug: 'vay-dam',
    baseSku: 'DRS',
    subCategorySlug: 'dam-midi',
    gender: Gender.FEMALE,
    material: 'Rayon pha linen',
    careInstructions: 'Giặt tay nước lạnh, không vắt mạnh, treo bằng móc đệm vai.',
    pitch: 'Đầm nữ tính, phom gọn và chất liệu mềm rũ cho đi làm hoặc đi chơi.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Đen', 'Kem', 'Hồng phấn'],
    tags: ['dam', 'vay', 'nu', 'midi'],
    images: IMAGE_POOLS.dresses,
    products: [
      { name: 'Đầm midi cổ vuông phong cách Hàn Quốc', brand: 'routine', price: 899000, comparePrice: 1099000 },
      { name: 'Đầm suông linen màu kem tối giản', brand: 'minimal-wear', price: 799000, colors: ['Kem', 'Be'] },
      { name: 'Đầm sơ mi nữ thắt eo màu trắng', brand: 'yody', price: 699000, colors: ['Trắng', 'Kem'], material: 'Cotton poplin' },
      { name: 'Đầm đen dáng A đi làm thanh lịch', brand: 'achromatic-studio', price: 1199000, colors: ['Đen'] },
      { name: 'Đầm hai dây satin màu đỏ đô', brand: 'urban-style', price: 999000, colors: ['Đỏ đô', 'Đen'], material: 'Satin poly cao cấp' },
      { name: 'Đầm midi hoa nhí màu hồng phấn', brand: 'local-brand-vn', price: 759000, colors: ['Hồng phấn', 'Kem'] },
      { name: 'Đầm knit body cổ tròn màu xám', brand: 'minimal-wear', price: 899000, colors: ['Xám', 'Đen'], material: 'Cotton knit co giãn' },
      { name: 'Đầm maxi resort màu xanh nhạt', brand: 'routine', price: 1299000, comparePrice: 1499000, colors: ['Xanh nhạt', 'Trắng'] },
    ],
  },
  {
    categorySlug: 'chan-vay',
    baseSku: 'SKT',
    subCategorySlug: 'chan-vay-chu-a',
    gender: Gender.FEMALE,
    material: 'Linen pha rayon',
    careInstructions: 'Giặt nhẹ, phơi ngang hoặc treo kẹp để giữ nếp váy.',
    pitch: 'Chân váy dễ phối cùng sơ mi, áo thun hoặc knit mỏng.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Đen', 'Kem', 'Nâu'],
    tags: ['chan-vay', 'nu', 'midi', 'cong-so'],
    images: IMAGE_POOLS.dresses,
    products: [
      { name: 'Chân váy chữ A linen màu nâu', brand: 'minimal-wear', price: 559000, colors: ['Nâu', 'Kem'] },
      { name: 'Chân váy midi xếp ly màu đen', brand: 'routine', price: 649000, comparePrice: 749000, colors: ['Đen', 'Xám'] },
      { name: 'Chân váy denim xanh nhạt dáng dài', brand: 'local-brand-vn', price: 599000, colors: ['Xanh nhạt', 'Indigo'], material: 'Denim cotton mỏng' },
      { name: 'Chân váy công sở bút chì màu navy', brand: 'yody', price: 449000, colors: ['Navy', 'Đen'], material: 'Poly-viscose co giãn' },
      { name: 'Chân váy satin midi màu kem', brand: 'achromatic-studio', price: 699000, colors: ['Kem', 'Hồng phấn'], material: 'Satin mờ' },
      { name: 'Chân váy kaki túi hộp màu xanh rêu', brand: 'urban-style', price: 529000, colors: ['Xanh rêu', 'Nâu'], material: 'Cotton kaki' },
    ],
  },
  {
    categorySlug: 'phu-kien',
    baseSku: 'ACC',
    subCategorySlug: 'mu-kinh',
    gender: Gender.UNISEX,
    material: 'Chất liệu tổng hợp cao cấp',
    careInstructions: 'Lau khô bằng khăn mềm, tránh ngâm nước lâu.',
    pitch: 'Phụ kiện nhỏ gọn giúp outfit hoàn thiện mà không rườm rà.',
    sizes: ['OS'],
    colors: ['Đen', 'Nâu', 'Be'],
    tags: ['phu-kien', 'accessories', 'unisex'],
    images: IMAGE_POOLS.accessories,
    products: [
      { name: 'Kính mát gọng vuông màu đen', brand: 'urban-style', price: 299000, comparePrice: 399000 },
      { name: 'Mũ bucket canvas màu xanh rêu', brand: 'yody', price: 179000, colors: ['Xanh rêu', 'Đen'], material: 'Canvas cotton' },
      { name: 'Thắt lưng da tối giản màu nâu', brand: 'achromatic-studio', price: 399000, colors: ['Nâu', 'Đen'], material: 'Da bò thật' },
      { name: 'Khăn bandana cotton màu navy', brand: 'local-brand-vn', price: 129000, colors: ['Navy', 'Đỏ đô'], material: 'Cotton poplin' },
      { name: 'Mũ lưỡi trai basic màu đen', brand: 'coolmate', price: 159000, colors: ['Đen', 'Xám'], material: 'Cotton twill' },
      { name: 'Vớ cotton cổ trung set 3 đôi trắng', brand: 'coolmate', price: 129000, colors: ['Trắng', 'Đen'], material: 'Cotton combed' },
      { name: 'Khuyên tai vòng nhỏ màu bạc', brand: 'minimal-wear', price: 199000, colors: ['Xám'], material: 'Thép không gỉ' },
      { name: 'Ví card holder da màu đen', brand: 'achromatic-studio', price: 449000, colors: ['Đen', 'Nâu'], material: 'Da bò thật' },
    ],
  },
  {
    categorySlug: 'giay-dep',
    baseSku: 'SHO',
    subCategorySlug: 'sneaker',
    gender: Gender.UNISEX,
    material: 'Da tổng hợp cao cấp và đế cao su',
    careInstructions: 'Lau bằng khăn ẩm, tránh ngâm nước, phơi nơi thoáng.',
    pitch: 'Giày dép đô thị dễ phối, ưu tiên sự thoải mái khi di chuyển cả ngày.',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Trắng', 'Đen', 'Nâu'],
    tags: ['giay', 'sneaker', 'casual', 'unisex'],
    images: IMAGE_POOLS.shoes,
    products: [
      { name: 'Sneaker trắng low top tối giản', brand: 'local-brand-vn', price: 799000, comparePrice: 990000, colors: ['Trắng', 'Đen'] },
      { name: 'Sneaker canvas đen cổ thấp', brand: 'yody', price: 549000, colors: ['Đen', 'Kem'], material: 'Canvas cotton và đế cao su lưu hóa' },
      { name: 'Giày loafer da nam màu nâu', brand: 'urban-style', price: 1199000, colors: ['Nâu', 'Đen'], material: 'Da bò thật' },
      { name: 'Sandal quai ngang nữ màu be', brand: 'routine', price: 499000, colors: ['Be', 'Nâu'], gender: Gender.FEMALE, sizes: ['36', '37', '38', '39', '40'] },
      { name: 'Sneaker chunky unisex màu trắng xám', brand: 'streetwear-lab', price: 1299000, colors: ['Trắng', 'Xám'] },
      { name: 'Giày mule nữ tối giản màu đen', brand: 'minimal-wear', price: 899000, colors: ['Đen', 'Kem'], gender: Gender.FEMALE, sizes: ['36', '37', '38', '39', '40'] },
      { name: 'Sneaker da Achromatic màu trắng kem', brand: 'achromatic-studio', price: 1599000, colors: ['Trắng', 'Kem'] },
      { name: 'Dép slide unisex màu đen', brand: 'coolmate', price: 399000, colors: ['Đen', 'Xám'] },
    ],
  },
  {
    categorySlug: 'tui-xach',
    baseSku: 'BAG',
    subCategorySlug: 'tui-tote',
    gender: Gender.UNISEX,
    material: 'Canvas cotton 12oz',
    careInstructions: 'Lau nhẹ bằng khăn ẩm, không ngâm nước lâu và phơi trong bóng râm.',
    pitch: 'Túi có sức chứa tốt cho laptop, ví, điện thoại và vật dụng hằng ngày.',
    sizes: ['OS'],
    colors: ['Đen', 'Kem', 'Nâu'],
    tags: ['tui-xach', 'tui-tote', 'bag', 'unisex'],
    images: IMAGE_POOLS.bags,
    products: [
      { name: 'Túi tote canvas phối da tối giản', brand: 'achromatic-studio', price: 399000, comparePrice: 499000, colors: ['Kem', 'Nâu'] },
      { name: 'Túi tote đen size lớn đi làm', brand: 'local-brand-vn', price: 299000, colors: ['Đen', 'Kem'] },
      { name: 'Túi đeo chéo nylon màu đen', brand: 'urban-style', price: 459000, colors: ['Đen', 'Navy'], material: 'Nylon chống nước nhẹ' },
      { name: 'Túi mini nữ quai ngắn màu nâu', brand: 'routine', price: 699000, colors: ['Nâu', 'Kem'], gender: Gender.FEMALE, material: 'Da tổng hợp cao cấp' },
      { name: 'Túi canvas đựng laptop màu be', brand: 'yody', price: 349000, colors: ['Be', 'Đen'] },
      { name: 'Túi bucket nữ màu đen tối giản', brand: 'minimal-wear', price: 899000, colors: ['Đen', 'Nâu'], gender: Gender.FEMALE, material: 'Da tổng hợp vân mịn' },
      { name: 'Túi messenger streetwear màu xám', brand: 'streetwear-lab', price: 599000, colors: ['Xám', 'Đen'], material: 'Polyester dày' },
      { name: 'Túi xách công sở nữ màu kem', brand: 'achromatic-studio', price: 1299000, colors: ['Kem', 'Nâu'], gender: Gender.FEMALE, material: 'Da bò thật' },
    ],
  },
  {
    categorySlug: 'do-unisex',
    baseSku: 'UNX',
    subCategorySlug: 'unisex-basic',
    gender: Gender.UNISEX,
    material: 'Cotton pha co giãn',
    careInstructions: 'Giặt máy 30°C, lộn trái khi giặt và phơi nơi thoáng.',
    pitch: 'Đồ unisex dễ mặc cho nhiều dáng người, tinh thần tối giản và linh hoạt.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Đen', 'Trắng', 'Xám'],
    tags: ['unisex', 'basic', 'minimal', 'streetwear'],
    images: [...IMAGE_POOLS.tshirts, ...IMAGE_POOLS.hoodies],
    products: [
      { name: 'Áo thun unisex heavyweight màu trắng', brand: 'achromatic-studio', price: 349000, comparePrice: 429000, colors: ['Trắng', 'Đen'] },
      { name: 'Áo khoác overshirt unisex màu xám', brand: 'minimal-wear', price: 899000, colors: ['Xám', 'Đen'], material: 'Cotton twill' },
      { name: 'Quần jogger unisex màu đen', brand: 'coolmate', price: 499000, colors: ['Đen', 'Xám'], material: 'French terry cotton' },
      { name: 'Hoodie zip unisex màu kem', brand: 'streetwear-lab', price: 759000, colors: ['Kem', 'Đen'], material: 'French terry cotton 380gsm' },
      { name: 'Áo sweater unisex logo nhỏ màu navy', brand: 'local-brand-vn', price: 629000, colors: ['Navy', 'Xám'], material: 'Cotton knit' },
      { name: 'Quần short unisex cotton màu be', brand: 'yody', price: 329000, colors: ['Be', 'Đen'], material: 'Cotton twill' },
      { name: 'Áo polo unisex basic màu đen', brand: 'routine', price: 399000, colors: ['Đen', 'Trắng'], material: 'Cotton piqué' },
      { name: 'Set áo thun và quần short unisex màu xám', brand: 'urban-style', price: 799000, comparePrice: 899000, colors: ['Xám', 'Đen'], material: 'Cotton compact' },
    ],
  },
];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function variantToken(value: string) {
  return slugify(value).replace(/-/g, '').slice(0, 6).toUpperCase();
}

function buildProducts(): ProductSeed[] {
  return productTemplates.flatMap((template) =>
    template.products.map((product, index) => {
      const sku = `${SEED_PREFIX}-${template.baseSku}-${String(index + 1).padStart(3, '0')}`;
      const material = product.material ?? template.material;
      const shortDescription = `${product.name} với ${material.toLowerCase()}, phom hiện đại và dễ phối trong tủ đồ hằng ngày.`;
      const description = `${product.name} là sản phẩm được chọn cho shop Achromatic với tinh thần hiện đại, tối giản và thực dụng. ${template.pitch} Chất liệu ${material.toLowerCase()} tạo cảm giác thoải mái khi mặc trong khí hậu Việt Nam. Sản phẩm có bảng size rõ ràng, màu sắc dễ phối và phù hợp để bán thương mại thật.`;

      return {
        name: product.name,
        slug: slugify(product.name),
        sku,
        categorySlug: template.categorySlug,
        subCategorySlug: template.subCategorySlug,
        brandSlug: product.brand,
        gender: product.gender ?? template.gender,
        material,
        careInstructions: template.careInstructions,
        basePrice: product.price,
        comparePrice: product.comparePrice,
        images: [
          template.images[index % template.images.length],
          template.images[(index + 1) % template.images.length],
        ],
        colors: product.colors ?? template.colors,
        sizes: product.sizes ?? template.sizes,
        tags: [...template.tags, slugify(product.name).split('-')[0]],
        shortDescription,
        description,
        isFeatured: index % 5 === 0,
        isNewArrival: index % 3 === 0,
        isBestSeller: index % 4 === 0,
        soldCount: 24 + index * 17 + template.baseSku.length * 9,
        avgRating: Number((4.4 + (index % 6) * 0.08).toFixed(2)),
        reviewCount: 8 + index * 6,
      };
    }),
  );
}

async function validateImageUrls(urls: string[]) {
  if (!IMAGE_CHECK_ENABLED) {
    console.log('Image URL check skipped because SKIP_IMAGE_CHECK=true.');
    return;
  }

  console.log(`Checking ${urls.length} public image URLs...`);
  for (const url of urls) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { method: 'HEAD', signal: controller.signal });
      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || !contentType.startsWith('image/')) {
        throw new Error(`HTTP ${response.status}, content-type: ${contentType || 'unknown'}`);
      }
    } catch (error) {
      throw new Error(`Image URL is not valid: ${url}. ${(error as Error).message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function ensureCatalog() {
  const categoryMap = new Map<string, string>();
  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
    categoryMap.set(record.slug, record.id);
  }

  const subCategoryMap = new Map<string, string>();
  for (const [categorySlug, name, slug] of subCategories) {
    const record = await prisma.subCategory.upsert({
      where: { slug },
      update: {
        name,
        categoryId: categoryMap.get(categorySlug)!,
        isActive: true,
      },
      create: {
        name,
        slug,
        categoryId: categoryMap.get(categorySlug)!,
        isActive: true,
      },
    });
    subCategoryMap.set(record.slug, record.id);
  }

  const brandMap = new Map<string, string>();
  for (const [name, slug, description, website] of brands) {
    const record = await prisma.brand.upsert({
      where: { slug },
      update: { name, description, website, isActive: true },
      create: { name, slug, description, website, isActive: true },
    });
    brandMap.set(record.slug, record.id);
  }

  const colorMap = new Map<string, string>();
  for (const [name, hexCode] of colors) {
    const record = await prisma.productColor.upsert({
      where: { name },
      update: { hexCode },
      create: { name, hexCode },
    });
    colorMap.set(record.name, record.id);
  }

  const sizeMap = new Map<string, string>();
  for (const [name, sortOrder] of sizes) {
    const record = await prisma.productSize.upsert({
      where: { name },
      update: { sortOrder },
      create: { name, sortOrder },
    });
    sizeMap.set(record.name, record.id);
  }

  return { categoryMap, subCategoryMap, brandMap, colorMap, sizeMap };
}

async function seedUsers() {
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const customerPassword = await bcrypt.hash('Customer@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@achromatic.vn' },
    update: {
      firstName: 'Quản trị',
      lastName: 'Achromatic',
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
    create: {
      email: 'admin@achromatic.vn',
      password: adminPassword,
      firstName: 'Quản trị',
      lastName: 'Achromatic',
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
    },
  });

  const customers = await Promise.all(
    [
      ['minh.nguyen@achromatic.vn', 'Minh', 'Nguyễn', '0901234567', '42 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh'],
      ['linh.tran@achromatic.vn', 'Linh', 'Trần', '0912345678', '18 Phan Đình Phùng', 'Quán Thánh', 'Ba Đình', 'Hà Nội'],
      ['anh.le@achromatic.vn', 'Anh', 'Lê', '0923456789', '25 Bạch Đằng', 'Hải Châu 1', 'Hải Châu', 'Đà Nẵng'],
    ].map(([email, firstName, lastName, phone]) =>
      prisma.user.upsert({
        where: { email },
        update: { firstName, lastName, phone, role: Role.CUSTOMER, isActive: true, isVerified: true },
        create: {
          email,
          password: customerPassword,
          firstName,
          lastName,
          phone,
          role: Role.CUSTOMER,
          isActive: true,
          isVerified: true,
        },
      }),
    ),
  );

  const addressMap = new Map<string, string>();
  const customerAddressSeeds = [
    [customers[0].id, 'Nguyễn Minh', '0901234567', '42 Nguyễn Huệ', 'Bến Nghé', 'Quận 1', 'TP. Hồ Chí Minh'],
    [customers[1].id, 'Trần Linh', '0912345678', '18 Phan Đình Phùng', 'Quán Thánh', 'Ba Đình', 'Hà Nội'],
    [customers[2].id, 'Lê Anh', '0923456789', '25 Bạch Đằng', 'Hải Châu 1', 'Hải Châu', 'Đà Nẵng'],
  ];

  for (const [userId, fullName, phone, addressLine1, ward, district, province] of customerAddressSeeds) {
    const existingAddress = await prisma.userAddress.findFirst({
      where: { userId, isDefault: true },
    });

    const address = existingAddress
      ? await prisma.userAddress.update({
          where: { id: existingAddress.id },
          data: { fullName, phone, addressLine1, ward, district, province, country: 'Vietnam', isDefault: true },
        })
      : await prisma.userAddress.create({
          data: { userId, fullName, phone, addressLine1, ward, district, province, country: 'Vietnam', isDefault: true },
        });

    addressMap.set(userId, address.id);
    await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    await prisma.wishlist.upsert({ where: { userId }, update: {}, create: { userId } });
  }

  await prisma.permission.upsert({
    where: { action_subject: { action: 'manage', subject: 'all' } },
    update: { description: 'Toàn quyền hệ thống' },
    create: { action: 'manage', subject: 'all', description: 'Toàn quyền hệ thống' },
  });
  await prisma.userRolePermission.upsert({
    where: {
      userId_permissionId: {
        userId: admin.id,
        permissionId: (await prisma.permission.findUniqueOrThrow({ where: { action_subject: { action: 'manage', subject: 'all' } } })).id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      permissionId: (await prisma.permission.findUniqueOrThrow({ where: { action_subject: { action: 'manage', subject: 'all' } } })).id,
      grantedBy: admin.id,
    },
  });

  return { admin, customers, addressMap };
}

async function seedProducts(products: ProductSeed[], maps: Awaited<ReturnType<typeof ensureCatalog>>) {
  const createdProductIds: string[] = [];

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        sku: item.sku,
        description: item.description,
        shortDescription: item.shortDescription,
        categoryId: maps.categoryMap.get(item.categorySlug)!,
        subCategoryId: maps.subCategoryMap.get(item.subCategorySlug)!,
        brandId: maps.brandMap.get(item.brandSlug)!,
        gender: item.gender,
        material: item.material,
        careInstructions: item.careInstructions,
        basePrice: item.basePrice,
        comparePrice: item.comparePrice,
        isFeatured: item.isFeatured,
        isNewArrival: item.isNewArrival,
        isBestSeller: item.isBestSeller,
        isActive: true,
        soldCount: item.soldCount,
        avgRating: item.avgRating,
        reviewCount: item.reviewCount,
        tags: item.tags,
        metaTitle: `${item.name} | Achromatic`,
        metaDescription: item.shortDescription,
      },
      create: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        description: item.description,
        shortDescription: item.shortDescription,
        categoryId: maps.categoryMap.get(item.categorySlug)!,
        subCategoryId: maps.subCategoryMap.get(item.subCategorySlug)!,
        brandId: maps.brandMap.get(item.brandSlug)!,
        gender: item.gender,
        material: item.material,
        careInstructions: item.careInstructions,
        basePrice: item.basePrice,
        comparePrice: item.comparePrice,
        isFeatured: item.isFeatured,
        isNewArrival: item.isNewArrival,
        isBestSeller: item.isBestSeller,
        isActive: true,
        soldCount: item.soldCount,
        avgRating: item.avgRating,
        reviewCount: item.reviewCount,
        tags: item.tags,
        metaTitle: `${item.name} | Achromatic`,
        metaDescription: item.shortDescription,
      },
    });

    createdProductIds.push(product.id);

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: item.images.map((url, index) => ({
        productId: product.id,
        url,
        altText: index === 0 ? item.name : `${item.name} - ảnh phụ`,
        isPrimary: index === 0,
        sortOrder: index,
      })),
    });

    await prisma.productSpecification.deleteMany({ where: { productId: product.id } });
    await prisma.productSpecification.createMany({
      data: [
        { productId: product.id, label: 'Chất liệu', value: item.material, sortOrder: 1 },
        { productId: product.id, label: 'Hướng dẫn bảo quản', value: item.careInstructions, sortOrder: 2 },
        { productId: product.id, label: 'Tiền tệ', value: 'VND', sortOrder: 3 },
      ],
    });

    const activeVariantSkus: string[] = [];
    for (const colorName of item.colors) {
      for (const sizeName of item.sizes) {
        const variantSku = `${item.sku}-${variantToken(colorName)}-${variantToken(sizeName)}`;
        activeVariantSkus.push(variantSku);
        const variant = await prisma.productVariant.upsert({
          where: { sku: variantSku },
          update: {
            colorId: maps.colorMap.get(colorName)!,
            sizeId: maps.sizeMap.get(sizeName)!,
            imageUrl: item.images[0],
            isActive: true,
          },
          create: {
            productId: product.id,
            colorId: maps.colorMap.get(colorName)!,
            sizeId: maps.sizeMap.get(sizeName)!,
            sku: variantSku,
            imageUrl: item.images[0],
            isActive: true,
          },
        });

        const quantity = 12 + ((item.sku.length + colorName.length + sizeName.length) % 42);
        await prisma.inventory.upsert({
          where: { productId_variantId: { productId: product.id, variantId: variant.id } },
          update: { quantity, reserved: 0, threshold: 5, location: item.categorySlug.includes('ao') ? 'Kho Hà Nội' : 'Kho TP.HCM' },
          create: { productId: product.id, variantId: variant.id, quantity, reserved: 0, threshold: 5, location: item.categorySlug.includes('ao') ? 'Kho Hà Nội' : 'Kho TP.HCM' },
        });
      }
    }

    await prisma.productVariant.updateMany({
      where: { productId: product.id, sku: { notIn: activeVariantSkus } },
      data: { isActive: false },
    });
  }

  return createdProductIds;
}

async function seedCommerceContent(productIds: string[]) {
  await prisma.settings.upsert({
    where: { key: 'site_name' },
    update: { value: 'Achromatic', group: 'general', label: 'Tên website' },
    create: { key: 'site_name', value: 'Achromatic', group: 'general', label: 'Tên website' },
  });
  await prisma.settings.upsert({
    where: { key: 'currency' },
    update: { value: 'VND', group: 'general', label: 'Tiền tệ' },
    create: { key: 'currency', value: 'VND', group: 'general', label: 'Tiền tệ' },
  });
  await prisma.settings.upsert({
    where: { key: 'free_shipping_threshold' },
    update: { value: '799000', type: 'number', group: 'shipping', label: 'Miễn phí vận chuyển từ' },
    create: { key: 'free_shipping_threshold', value: '799000', type: 'number', group: 'shipping', label: 'Miễn phí vận chuyển từ' },
  });

  await prisma.shippingMethod.upsert({
    where: { id: 'ach-standard-shipping' },
    update: {
      name: 'Giao hàng tiêu chuẩn',
      description: 'Giao trong 2-4 ngày làm việc trên toàn quốc.',
      basePrice: 30000,
      freeThreshold: 799000,
      estimatedDays: '2-4 ngày',
      isActive: true,
      sortOrder: 1,
    },
    create: {
      id: 'ach-standard-shipping',
      name: 'Giao hàng tiêu chuẩn',
      description: 'Giao trong 2-4 ngày làm việc trên toàn quốc.',
      basePrice: 30000,
      freeThreshold: 799000,
      estimatedDays: '2-4 ngày',
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.shippingMethod.upsert({
    where: { id: 'ach-express-shipping' },
    update: {
      name: 'Giao nhanh nội thành',
      description: 'Áp dụng TP.HCM, Hà Nội và Đà Nẵng.',
      basePrice: 50000,
      freeThreshold: 1299000,
      estimatedDays: 'Trong ngày hoặc 1 ngày',
      isActive: true,
      sortOrder: 2,
    },
    create: {
      id: 'ach-express-shipping',
      name: 'Giao nhanh nội thành',
      description: 'Áp dụng TP.HCM, Hà Nội và Đà Nẵng.',
      basePrice: 50000,
      freeThreshold: 1299000,
      estimatedDays: 'Trong ngày hoặc 1 ngày',
      isActive: true,
      sortOrder: 2,
    },
  });

  await prisma.banner.upsert({
    where: { id: 'ach-hero-main' },
    update: {
      title: 'Achromatic Essentials',
      subtitle: 'Thời trang tối giản, hiện đại cho nhịp sống Việt Nam.',
      imageUrl: IMAGE_POOLS.shirts[0],
      mobileImageUrl: IMAGE_POOLS.tshirts[0],
      linkUrl: '/collections',
      linkText: 'Mua ngay',
      position: BannerPosition.HERO,
      isActive: true,
      sortOrder: 1,
    },
    create: {
      id: 'ach-hero-main',
      title: 'Achromatic Essentials',
      subtitle: 'Thời trang tối giản, hiện đại cho nhịp sống Việt Nam.',
      imageUrl: IMAGE_POOLS.shirts[0],
      mobileImageUrl: IMAGE_POOLS.tshirts[0],
      linkUrl: '/collections',
      linkText: 'Mua ngay',
      position: BannerPosition.HERO,
      isActive: true,
      sortOrder: 1,
    },
  });

  const collection = await prisma.collection.upsert({
    where: { slug: 'achromatic-essentials' },
    update: {
      name: 'Achromatic Essentials',
      description: 'Tuyển chọn những sản phẩm dễ mặc nhất của Achromatic.',
      imageUrl: IMAGE_POOLS.outerwear[0],
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
    },
    create: {
      name: 'Achromatic Essentials',
      slug: 'achromatic-essentials',
      description: 'Tuyển chọn những sản phẩm dễ mặc nhất của Achromatic.',
      imageUrl: IMAGE_POOLS.outerwear[0],
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
    },
  });

  await prisma.collectionProduct.deleteMany({ where: { collectionId: collection.id } });
  await prisma.collectionProduct.createMany({
    data: productIds.slice(0, 24).map((productId, index) => ({
      collectionId: collection.id,
      productId,
      sortOrder: index + 1,
    })),
  });
}

async function seedOrders(customers: Awaited<ReturnType<typeof seedUsers>>['customers'], addressMap: Map<string, string>) {
  const products = await prisma.product.findMany({
    where: { sku: { startsWith: `${SEED_PREFIX}-` }, isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      variants: {
        where: { isActive: true },
        include: { color: true, size: true },
        take: 4,
      },
    },
    orderBy: { sku: 'asc' },
    take: 40,
  });

  const statuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPING,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ];

  for (let index = 0; index < 16; index += 1) {
    const customer = customers[index % customers.length];
    const firstProduct = products[(index * 2) % products.length];
    const secondProduct = products[(index * 2 + 5) % products.length];
    const orderItems = [firstProduct, secondProduct].map((product, productIndex) => {
      const variant = product.variants[productIndex % product.variants.length];
      const quantity = productIndex + 1;
      const unitPrice = Number(product.basePrice);
      return {
        productId: product.id,
        variantId: variant?.id,
        productName: product.name,
        variantName: [variant?.color?.name, variant?.size?.name].filter(Boolean).join(' / ') || undefined,
        sku: variant?.sku ?? product.sku,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        imageUrl: product.images[0]?.url,
      };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingFee = subtotal >= 799000 ? 0 : 30000;
    const discount = index % 4 === 0 ? 50000 : 0;
    const total = subtotal + shippingFee - discount;
    const status = statuses[index % statuses.length];
    const orderNumber = `ACH-DEMO-2026-${String(index + 1).padStart(4, '0')}`;

    const order = await prisma.order.upsert({
      where: { orderNumber },
      update: {
        userId: customer.id,
        addressId: addressMap.get(customer.id)!,
        status,
        subtotal,
        shippingFee,
        discount,
        tax: 0,
        total,
        shippingMethodId: index % 3 === 0 ? 'ach-express-shipping' : 'ach-standard-shipping',
        trackingNumber: status === OrderStatus.SHIPPING || status === OrderStatus.COMPLETED ? `ACHVN${String(index + 1).padStart(8, '0')}` : null,
        cancelledAt: status === OrderStatus.CANCELLED ? new Date('2026-06-20T09:00:00+07:00') : null,
        cancelReason: status === OrderStatus.CANCELLED ? 'Khách đổi ý trước khi giao hàng' : null,
      },
      create: {
        orderNumber,
        userId: customer.id,
        addressId: addressMap.get(customer.id)!,
        status,
        subtotal,
        shippingFee,
        discount,
        tax: 0,
        total,
        shippingMethodId: index % 3 === 0 ? 'ach-express-shipping' : 'ach-standard-shipping',
        trackingNumber: status === OrderStatus.SHIPPING || status === OrderStatus.COMPLETED ? `ACHVN${String(index + 1).padStart(8, '0')}` : null,
        cancelledAt: status === OrderStatus.CANCELLED ? new Date('2026-06-20T09:00:00+07:00') : null,
        cancelReason: status === OrderStatus.CANCELLED ? 'Khách đổi ý trước khi giao hàng' : null,
      },
    });

    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.orderItem.createMany({
      data: orderItems.map((item) => ({ ...item, orderId: order.id })),
    });

    await prisma.orderStatusHistory.deleteMany({ where: { orderId: order.id } });
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status,
        note: `Đơn hàng demo Achromatic ở trạng thái ${status}.`,
      },
    });

    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        method: index % 2 === 0 ? PaymentMethod.COD : PaymentMethod.BANK_TRANSFER,
        status: status === OrderStatus.CANCELLED ? PaymentStatus.CANCELLED : status === OrderStatus.COMPLETED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        amount: total,
        currency: 'VND',
      },
      create: {
        orderId: order.id,
        method: index % 2 === 0 ? PaymentMethod.COD : PaymentMethod.BANK_TRANSFER,
        status: status === OrderStatus.CANCELLED ? PaymentStatus.CANCELLED : status === OrderStatus.COMPLETED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        amount: total,
        currency: 'VND',
      },
    });
  }
}

async function printChecks() {
  const [
    categoryCount,
    brandCount,
    productCount,
    productsWithoutImages,
    productsWithInvalidPrice,
    duplicateImages,
    categoriesWithoutProducts,
    orderCount,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.brand.count(),
    prisma.product.count({ where: { sku: { startsWith: `${SEED_PREFIX}-` } } }),
    prisma.product.count({
      where: {
        sku: { startsWith: `${SEED_PREFIX}-` },
        images: { none: { isPrimary: true } },
      },
    }),
    prisma.product.count({
      where: {
        sku: { startsWith: `${SEED_PREFIX}-` },
        basePrice: { lte: 0 },
      },
    }),
    prisma.productImage.groupBy({
      by: ['url'],
      where: { product: { sku: { startsWith: `${SEED_PREFIX}-` } } },
      _count: { url: true },
      having: { url: { _count: { gt: 8 } } },
    }),
    prisma.category.findMany({
      where: {
        slug: { in: categories.map((category) => category.slug) },
        products: { none: { sku: { startsWith: `${SEED_PREFIX}-` } } },
      },
      select: { name: true, slug: true },
    }),
    prisma.order.count({ where: { orderNumber: { startsWith: 'ACH-DEMO-' } } }),
  ]);

  console.log('\nSeed verification');
  console.table({
    categories: categoryCount,
    brands: brandCount,
    achromaticProducts: productCount,
    achromaticOrders: orderCount,
    productsWithoutPrimaryImage: productsWithoutImages,
    productsWithInvalidPrice,
    imageUrlsUsedMoreThan8Times: duplicateImages.length,
    seededCategoriesWithoutProducts: categoriesWithoutProducts.length,
  });

  if (categoriesWithoutProducts.length > 0) {
    console.log('Categories without seeded products:', categoriesWithoutProducts);
  }
}

async function main() {
  const products = buildProducts();
  const uniqueImages = [...new Set(products.flatMap((product) => product.images).concat([
    IMAGE_POOLS.shirts[0],
    IMAGE_POOLS.tshirts[0],
    IMAGE_POOLS.outerwear[0],
  ]))];

  console.log('Starting Achromatic Vietnamese fashion seed...');
  console.log(`Database provider: PostgreSQL`);
  console.log(`Target database URL: ${process.env.DATABASE_URL?.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@') ?? 'not configured'}`);
  console.log(`Prepared products: ${products.length}`);

  await validateImageUrls(uniqueImages);
  const maps = await ensureCatalog();
  const { customers, addressMap } = await seedUsers();
  const productIds = await seedProducts(products, maps);
  await seedCommerceContent(productIds);
  await seedOrders(customers, addressMap);
  await printChecks();

  console.log('\nSeed complete.');
  console.log('Admin: admin@achromatic.vn / Admin@123');
  console.log('Customers: minh.nguyen@achromatic.vn, linh.tran@achromatic.vn, anh.le@achromatic.vn / Customer@123');
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
