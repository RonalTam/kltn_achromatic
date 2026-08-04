import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../../database/prisma.service';
import { ChatMessage, Prisma } from '@prisma/client';

interface ProductContext {
  name: string;
  basePrice: number;
  comparePrice: number | null;
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  slug: string;
  shortDescription: string | null;
  /** avg rating (0 if no reviews) */
  avgRating: number;
  /** total approved reviews */
  reviewCount: number;
  /** per-variant stock info */
  stock: { color: string; size: string; available: number }[];
}

interface CouponContext {
  code: string;
  name: string;
  type: string;
  value: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  description: string | null;
  expiresAt: Date | null;
}

interface OrderContext {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: Date;
  estimatedDelivery: Date | null;
  trackingNumber: string | null;
  items: { productName: string; variantName: string | null; quantity: number }[];
}

interface CollectionContext {
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
}

// ─── Status label map (Vietnamese) ──────────────────────────────
const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý / đóng gói',
  SHIPPED: 'Đang vận chuyển',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã hoàn trả',
  REFUNDED: 'Đã hoàn tiền',
};

@Injectable()
export class ChatAIService {
  private readonly logger = new Logger(ChatAIService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelName: string;
  private readonly maxHistory: number;
  private readonly productContextLimit: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = this.configService.get<string>(
      'GEMINI_MODEL',
      'gemini-2.0-flash',
    );
    this.maxHistory = this.configService.get<number>('CHAT_MAX_HISTORY', 10);
    this.productContextLimit = this.configService.get<number>(
      'CHAT_PRODUCT_CONTEXT_LIMIT',
      5,
    );
  }

  async generateReply(
    userMessage: string,
    chatHistory: ChatMessage[],
    userId?: string,
  ): Promise<string> {
    let productContext: ProductContext[] = [];
    let couponsContext: CouponContext[] = [];
    let catalogOverview: { categories: string[]; brands: string[] } = { categories: [], brands: [] };
    let orderContext: OrderContext[] = [];
    let collectionsContext: CollectionContext[] = [];

    try {
      // Build effective search query from context history for multi-turn follow-ups
      const effectiveQuery = this.getEffectiveSearchQuery(userMessage, chatHistory);

      // 1. Fetch all DB contexts in parallel
      [productContext, couponsContext, catalogOverview, collectionsContext] =
        await Promise.all([
          this.fetchProductContext(effectiveQuery),
          this.fetchCouponsContext(),
          this.fetchCatalogOverview(),
          this.fetchCollectionsContext(),
        ]);

      // Fetch order context only for authenticated users
      if (userId) {
        orderContext = await this.fetchOrderContext(userId);
      }

      // 2. Format history
      const historyText = this.formatHistory(chatHistory);

      // 3. Build comprehensive prompt grounded in actual DB data
      const systemPrompt = this.buildSystemPrompt(
        productContext,
        couponsContext,
        catalogOverview,
        collectionsContext,
        orderContext,
        historyText,
        !!userId,
      );

      // 4. Call Gemini AI
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(userMessage);
      const text = result.response.text();

      return (
        text ||
        this.buildFallbackResponse(productContext, couponsContext, userMessage)
      );
    } catch (error) {
      this.logger.error('Gemini API error (falling back to direct DB response)', error);
      // Seamless DB Fallback when Gemini API hits quota limits (429) or network errors
      return this.buildFallbackResponse(productContext, couponsContext, userMessage);
    }
  }

  /**
   * Merges recent user prompts with current follow-up prompt to preserve context across turns.
   */
  private getEffectiveSearchQuery(userMessage: string, chatHistory: ChatMessage[]): string {
    const isFollowUp =
      /^(và|còn|size|màu|giá|dưới|trên|loại|mẫu|có|không|nhưng|phù hợp)/i.test(userMessage.trim()) ||
      userMessage.trim().split(/\s+/).length <= 4;

    if (!isFollowUp || chatHistory.length === 0) {
      return userMessage;
    }

    const previousUserMsgs = chatHistory
      .filter((m) => m.sender === 'USER')
      .slice(-2)
      .map((m) => m.content);

    if (previousUserMsgs.length === 0) return userMessage;

    return `${previousUserMsgs.join(' ')} ${userMessage}`;
  }

  private isGreetingQuery(query: string): boolean {
    const trimmed = query.trim().toLowerCase();
    const greetings = ['hi', 'hello', 'chào', 'xin chào', 'hi shop', 'hello shop', 'chào shop', 'chao shop', 'alo'];
    return greetings.includes(trimmed);
  }

  private isOffTopicQuery(query: string): boolean {
    const lower = query.toLowerCase();
    const offTopicPatterns = [
      /tiếng (việt|anh|trung|nhật|hàn) là gì/i,
      /dịch (sang|giúp|từ|câu)/i,
      /nghĩa của từ/i,
      /thời tiết/i,
      /tin tức/i,
      /chính trị/i,
      /lập trình|code|python|javascript|html|css/i,
      /giải (bài tập|toán|phương trình)/i,
      /viết (bài văn|thơ|đoạn văn)/i,
      /ai là (tổng thống|chủ tịch|thủ tướng)/i,
    ];
    return offTopicPatterns.some((pattern) => pattern.test(lower));
  }

  private buildFallbackResponse(
    products: ProductContext[],
    coupons: CouponContext[],
    userMessage: string,
  ): string {
    if (this.isGreetingQuery(userMessage)) {
      return 'Dạ xin chào bạn! Mình là Minh — nhân viên tư vấn của ACHROMATIC. Bạn đang tìm mẫu trang phục hay cần tư vấn gì hôm nay ạ? 😊';
    }

    if (this.isOffTopicQuery(userMessage)) {
      return 'Dạ, mình là nhân viên tư vấn thời trang của ACHROMATIC nên chỉ hỗ trợ các thắc mắc về trang phục, cách chọn size và khuyến mãi của shop thôi ạ. Bạn cần tìm mẫu quần áo nào hôm nay không ạ? 😊';
    }

    const isCouponQuery = /khuyến mãi|mã giảm|voucher|discount|ưu đãi|giam gia/i.test(userMessage);

    if (isCouponQuery && coupons.length > 0) {
      const couponList = coupons
        .map((c) => {
          const val = c.type === 'PERCENTAGE' ? `${c.value}%` : `${new Intl.NumberFormat('vi-VN').format(c.value)}₫`;
          return `• Mã **${c.code}**: Giảm ${val} — ${c.name}`;
        })
        .join('\n');

      return `Dạ, dưới đây là các chương trình khuyến mãi hiện có tại ACHROMATIC:\n\n${couponList}\n\nBạn có thể nhập mã khi thanh toán để nhận ưu đãi nhé! 😊`;
    }

    if (products.length > 0) {
      const productList = products
        .map((p) => {
          const price = new Intl.NumberFormat('vi-VN').format(p.basePrice);
          const sizes = p.sizes.length > 0 ? p.sizes.join(', ') : 'Đủ size';
          const colors = p.colors.length > 0 ? p.colors.join(', ') : 'Đủ màu';
          return `• **[${p.name}](/products/${p.slug})** — Giá: **${price}₫**\n  (Size: ${sizes} | Màu: ${colors})`;
        })
        .join('\n\n');

      return `Dạ, ACHROMATIC xin gửi bạn thông tin các sản phẩm phù hợp:\n\n${productList}\n\nBạn bấm vào link từng sản phẩm để xem chi tiết nhé! 😊`;
    }

    return 'Dạ hiện chưa tìm thấy sản phẩm cụ thể theo yêu cầu. Bạn vui lòng nhấn "Gặp nhân viên" để được hỗ trợ trực tiếp nhé!';
  }

  // ─── Private Helpers ──────────────────────────────────────────

  /**
   * Cleans raw user prompt to extract meaningful query terms for DB searching.
   */
  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'bên', 'bạn', 'có', 'không', 'tôi', 'mình', 'muốn', 'mua', 'cho', 'xem',
      'giá', 'bao', 'nhiêu', 'shop', 'ơi', 'ạ', 'hôm', 'nay', 'đang', 'tư',
      'vấn', 'gì', 'nào', 'mấy', 'cái', 'chiếc', 'loại', 'với', 'và', 'hoặc',
      'được', 'để', 'em', 'anh', 'chị', 'khách', 'nhé', 'nha', 'thế', 'này',
    ]);

    const words = query
      .toLowerCase()
      .replace(/[^\w\sàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopWords.has(w));

    return [...new Set(words)];
  }

  /**
   * Parses complex user queries for price limits, colors, and sizes.
   */
  private parseComplexQuery(rawQuery: string): {
    maxPrice: number | null;
    minPrice: number | null;
    colorName: string | null;
    sizeName: string | null;
  } {
    const lower = rawQuery.toLowerCase();

    let maxPrice: number | null = null;
    let minPrice: number | null = null;
    let colorName: string | null = null;
    let sizeName: string | null = null;

    // 1. Price extraction
    const maxPriceMatch = lower.match(/(dưới|duoi|nhỏ hơn|nho hon|thấp hơn|thap hon|tối đa|toi da|<)\s*(\d+[\d\.]*)\s*(k|tr|triệu|trieu|đ|vnd)?/i);
    if (maxPriceMatch) {
      let num = parseFloat(maxPriceMatch[2].replace(/\./g, ''));
      const unit = (maxPriceMatch[3] || '').toLowerCase();
      if (unit === 'k' || (num <= 1000 && !unit)) {
        num = num * 1000;
      } else if (unit === 'tr' || unit === 'trieu' || unit === 'triệu') {
        num = num * 1000000;
      }
      maxPrice = num;
    }

    const minPriceMatch = lower.match(/(trên|tren|lớn hơn|lon hon|cao hơn|cao hon|tối thiểu|toi thieu|>)\s*(\d+[\d\.]*)\s*(k|tr|triệu|trieu|đ|vnd)?/i);
    if (minPriceMatch) {
      let num = parseFloat(minPriceMatch[2].replace(/\./g, ''));
      const unit = (minPriceMatch[3] || '').toLowerCase();
      if (unit === 'k' || (num <= 1000 && !unit)) {
        num = num * 1000;
      } else if (unit === 'tr' || unit === 'trieu' || unit === 'triệu') {
        num = num * 1000000;
      }
      minPrice = num;
    }

    // 2. Color extraction
    const colorsList = ['kem', 'trắng', 'đen', 'xám', 'navy', 'xanh', 'rêu', 'be', 'hồng', 'đỏ', 'nâu', 'vàng', 'bạc'];
    for (const c of colorsList) {
      if (new RegExp(`(màu|phối)\\s*${c}|\\b${c}\\b`, 'i').test(lower)) {
        colorName = c;
        break;
      }
    }

    // 3. Size extraction
    const sizeMatch = lower.match(/\b(size|cỡ|kích thước)\s*([a-z0-9]+)\b/i);
    if (sizeMatch) {
      sizeName = sizeMatch[2].toUpperCase();
    } else {
      const standaloneSize = lower.match(/\b(xxl|xl|xs)\b/i);
      if (standaloneSize) {
        sizeName = standaloneSize[1].toUpperCase();
      }
    }

    return { maxPrice, minPrice, colorName, sizeName };
  }

  /**
   * Smart product retrieval using Two-Phase Relevance Search & Complex Filter Parsing.
   * Now also fetches review ratings and per-variant stock.
   */
  private async fetchProductContext(rawQuery: string): Promise<ProductContext[]> {
    try {
      const rawTrimmed = rawQuery.trim();
      if (!rawTrimmed) return [];

      const select = this.getProductSelect();
      const limit = 10;
      let products: any[] = [];

      const parsed = this.parseComplexQuery(rawTrimmed);

      // Building dynamic Prisma filters
      const whereFilter: Prisma.ProductWhereInput = { isActive: true };

      if (parsed.maxPrice || parsed.minPrice) {
        whereFilter.basePrice = {};
        if (parsed.maxPrice) whereFilter.basePrice.lte = parsed.maxPrice;
        if (parsed.minPrice) whereFilter.basePrice.gte = parsed.minPrice;
      }

      if (parsed.colorName || parsed.sizeName) {
        whereFilter.OR = [
          ...(parsed.colorName
            ? [
                { name: { contains: parsed.colorName, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: parsed.colorName, mode: Prisma.QueryMode.insensitive } },
              ]
            : []),
          {
            variants: {
              some: {
                isActive: true,
                ...(parsed.colorName
                  ? { color: { name: { contains: parsed.colorName, mode: Prisma.QueryMode.insensitive } } }
                  : {}),
                ...(parsed.sizeName
                  ? { size: { name: { contains: parsed.sizeName, mode: Prisma.QueryMode.insensitive } } }
                  : {}),
              },
            },
          },
        ];
      }

      // If complex filters were parsed, execute filtered query directly
      if (parsed.maxPrice || parsed.colorName || parsed.sizeName) {
        products = await this.prisma.product.findMany({
          where: whereFilter,
          take: limit,
          select,
        });
      } else {
        // Phase 1: High Relevance — Exact phrase match
        if (rawTrimmed.length >= 2) {
          products = await this.prisma.product.findMany({
            where: {
              isActive: true,
              OR: [
                { name: { contains: rawTrimmed, mode: Prisma.QueryMode.insensitive } },
                { description: { contains: rawTrimmed, mode: Prisma.QueryMode.insensitive } },
                { shortDescription: { contains: rawTrimmed, mode: Prisma.QueryMode.insensitive } },
              ],
            },
            take: limit,
            select,
          });
        }

        // Phase 2: Keyword match
        if (products.length < limit) {
          const existingSlugs = new Set(products.map((p) => p.slug));
          const keywords = this.extractKeywords(rawQuery);

          if (keywords.length > 0) {
            const keywordConditions: Prisma.ProductWhereInput[] = keywords.flatMap((kw) => [
              { name: { contains: kw, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: kw, mode: Prisma.QueryMode.insensitive } },
              { shortDescription: { contains: kw, mode: Prisma.QueryMode.insensitive } },
              { category: { name: { contains: kw, mode: Prisma.QueryMode.insensitive } } },
              { brand: { name: { contains: kw, mode: Prisma.QueryMode.insensitive } } },
            ]);

            const extraProducts = await this.prisma.product.findMany({
              where: {
                isActive: true,
                slug: existingSlugs.size > 0 ? { notIn: Array.from(existingSlugs) } : undefined,
                OR: keywordConditions,
              },
              take: limit - products.length,
              select,
            });

            products = [...products, ...extraProducts];
          }
        }
      }

      // Phase 3: Fallback — If no products match, fetch top featured & best sellers
      if (products.length === 0) {
        products = await this.prisma.product.findMany({
          where: {
            isActive: true,
            OR: [{ isBestSeller: true }, { isNewArrival: true }, { isFeatured: true }],
          },
          take: 6,
          orderBy: { soldCount: 'desc' },
          select,
        });
      }

      // Fetch review summaries and inventory for found products in parallel
      const productIds = products.map((p: any) => p.id);

      const [reviewSummaries, inventories] = await Promise.all([
        this.fetchReviewSummaries(productIds),
        this.fetchInventorySummaries(productIds),
      ]);

      return products.map((p: any) => {
        const sizes: string[] = Array.from(
          new Set(
            p.variants
              .filter((v: any) => v.size?.name)
              .map((v: any) => String(v.size.name)),
          ),
        );
        const colors: string[] = Array.from(
          new Set(
            p.variants
              .filter((v: any) => v.color?.name)
              .map((v: any) => String(v.color.name)),
          ),
        );

        const review = reviewSummaries.get(p.id) ?? { avgRating: 0, count: 0 };
        const stock = inventories.get(p.id) ?? [];

        return {
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          basePrice: Number(p.basePrice),
          comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
          category: p.category?.name ?? '',
          brand: p.brand?.name ?? '',
          sizes,
          colors,
          avgRating: review.avgRating,
          reviewCount: review.count,
          stock,
        };
      });
    } catch (error) {
      this.logger.warn('Failed to fetch product context', error);
      return [];
    }
  }

  private getProductSelect() {
    return {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
      basePrice: true,
      comparePrice: true,
      category: { select: { name: true } },
      brand: { select: { name: true } },
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          size: { select: { name: true } },
          color: { select: { name: true } },
        },
      },
    };
  }

  /**
   * Fetches avg rating and review count for a list of product IDs.
   */
  private async fetchReviewSummaries(
    productIds: string[],
  ): Promise<Map<string, { avgRating: number; count: number }>> {
    const map = new Map<string, { avgRating: number; count: number }>();
    if (productIds.length === 0) return map;

    try {
      const grouped = await this.prisma.review.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds }, isApproved: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      for (const g of grouped) {
        map.set(g.productId, {
          avgRating: Math.round((g._avg.rating ?? 0) * 10) / 10,
          count: g._count.rating,
        });
      }
    } catch (error) {
      this.logger.warn('Failed to fetch review summaries', error);
    }

    return map;
  }

  /**
   * Fetches available stock per color/size variant for a list of product IDs.
   * Returns a map of productId → [{color, size, available}]
   */
  private async fetchInventorySummaries(
    productIds: string[],
  ): Promise<Map<string, { color: string; size: string; available: number }[]>> {
    const map = new Map<string, { color: string; size: string; available: number }[]>();
    if (productIds.length === 0) return map;

    try {
      const inventories = await this.prisma.inventory.findMany({
        where: {
          productId: { in: productIds },
          variantId: { not: null },
        },
        select: {
          productId: true,
          quantity: true,
          reserved: true,
          variant: {
            select: {
              color: { select: { name: true } },
              size: { select: { name: true } },
            },
          },
        },
      });

      for (const inv of inventories) {
        if (!inv.variant) continue;
        const colorName = inv.variant.color?.name ?? '';
        const sizeName = inv.variant.size?.name ?? '';
        const available = Math.max(0, inv.quantity - inv.reserved);

        if (!map.has(inv.productId)) {
          map.set(inv.productId, []);
        }
        map.get(inv.productId)!.push({
          color: colorName,
          size: sizeName,
          available,
        });
      }
    } catch (error) {
      this.logger.warn('Failed to fetch inventory summaries', error);
    }

    return map;
  }

  /**
   * Fetches all active coupons & promotional discounts from DB.
   */
  private async fetchCouponsContext(): Promise<CouponContext[]> {
    try {
      const now = new Date();
      const coupons = await this.prisma.coupon.findMany({
        where: {
          isActive: true,
          OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] }],
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      });

      return coupons.map((c) => ({
        code: c.code,
        name: c.name,
        type: c.type,
        value: Number(c.value),
        minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null,
        maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
        description: c.description,
        expiresAt: c.expiresAt,
      }));
    } catch (error) {
      this.logger.warn('Failed to fetch coupons context', error);
      return [];
    }
  }

  /**
   * Fetches active store categories and brands overview.
   */
  private async fetchCatalogOverview(): Promise<{ categories: string[]; brands: string[] }> {
    try {
      const [categories, brands] = await Promise.all([
        this.prisma.category.findMany({
          where: { isActive: true },
          select: { name: true },
        }),
        this.prisma.brand.findMany({
          where: { isActive: true },
          select: { name: true },
        }),
      ]);

      return {
        categories: categories.map((c) => c.name),
        brands: brands.map((b) => b.name),
      };
    } catch (error) {
      this.logger.warn('Failed to fetch catalog overview', error);
      return { categories: [], brands: [] };
    }
  }

  /**
   * Fetches the 3 most recent orders for a logged-in customer.
   */
  private async fetchOrderContext(userId: string): Promise<OrderContext[]> {
    try {
      const orders = await this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          estimatedDelivery: true,
          trackingNumber: true,
          items: {
            select: {
              productName: true,
              variantName: true,
              quantity: true,
            },
          },
        },
      });

      return orders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        total: Number(o.total),
        createdAt: o.createdAt,
        estimatedDelivery: o.estimatedDelivery,
        trackingNumber: o.trackingNumber,
        items: o.items,
      }));
    } catch (error) {
      this.logger.warn('Failed to fetch order context', error);
      return [];
    }
  }

  /**
   * Fetches active (featured) collections.
   */
  private async fetchCollectionsContext(): Promise<CollectionContext[]> {
    try {
      const collections = await this.prisma.collection.findMany({
        where: { isActive: true },
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
        take: 6,
        select: {
          name: true,
          slug: true,
          description: true,
          products: { select: { productId: true } },
        },
      });

      return collections.map((c) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        productCount: c.products.length,
      }));
    } catch (error) {
      this.logger.warn('Failed to fetch collections context', error);
      return [];
    }
  }

  // ─── Format Helpers ───────────────────────────────────────────

  private formatProductsForPrompt(products: ProductContext[]): string {
    if (products.length === 0)
      return 'Hiện chưa tìm thấy sản phẩm cụ thể theo yêu cầu.';

    return products
      .map((p, i) => {
        const price = new Intl.NumberFormat('vi-VN').format(p.basePrice);
        const oldPrice = p.comparePrice
          ? new Intl.NumberFormat('vi-VN').format(p.comparePrice)
          : null;
        const priceStr = oldPrice
          ? `${price}₫ (Giá gốc: ${oldPrice}₫)`
          : `${price}₫`;

        const sizesStr = p.sizes.length > 0 ? p.sizes.join(', ') : 'Có đủ size';
        const colorsStr = p.colors.length > 0 ? p.colors.join(', ') : 'Có đủ màu';

        const ratingStr =
          p.reviewCount > 0
            ? `⭐ ${p.avgRating}/5 (${p.reviewCount} đánh giá)`
            : 'Chưa có đánh giá';

        // Build stock lines
        const stockLines: string[] = [];
        if (p.stock.length > 0) {
          const grouped: Record<string, string[]> = {};
          for (const s of p.stock) {
            const label = s.color || 'Mặc định';
            if (!grouped[label]) grouped[label] = [];
            if (s.available > 0) {
              grouped[label].push(`${s.size || '?'} (còn ${s.available})`);
            } else {
              grouped[label].push(`${s.size || '?'} (hết)`);
            }
          }
          for (const [color, sizeList] of Object.entries(grouped)) {
            stockLines.push(`     • ${color}: ${sizeList.join(', ')}`);
          }
        }
        const stockStr = stockLines.length > 0
          ? `\n   - Tồn kho:\n${stockLines.join('\n')}`
          : '';

        return [
          `${i + 1}. **[${p.name}](/products/${p.slug})**`,
          `   - Thương hiệu: ${p.brand || 'ACHROMATIC'}`,
          `   - Danh mục: ${p.category}`,
          `   - Giá: ${priceStr}`,
          `   - Size có sẵn: ${sizesStr}`,
          `   - Màu sắc: ${colorsStr}`,
          `   - Đánh giá: ${ratingStr}`,
          p.shortDescription ? `   - Mô tả ngắn: ${p.shortDescription}` : '',
          stockStr,
        ]
          .filter(Boolean)
          .join('\n');
      })
      .join('\n\n');
  }

  private formatCouponsForPrompt(coupons: CouponContext[]): string {
    if (coupons.length === 0)
      return 'Hiện tại shop chưa có mã giảm giá chung công khai.';

    return coupons
      .map((c, i) => {
        const valueStr =
          c.type === 'PERCENTAGE'
            ? `Giảm ${c.value}%`
            : `Giảm ${new Intl.NumberFormat('vi-VN').format(c.value)}₫`;

        const minOrder = c.minOrderAmount
          ? `(Cho đơn từ ${new Intl.NumberFormat('vi-VN').format(c.minOrderAmount)}₫)`
          : '';

        const maxDisc = c.maxDiscount
          ? `(Giảm tối đa ${new Intl.NumberFormat('vi-VN').format(c.maxDiscount)}₫)`
          : '';

        const expiry = c.expiresAt
          ? `| HSD: ${c.expiresAt.toLocaleDateString('vi-VN')}`
          : '';

        return `${i + 1}. Mã **${c.code}**: ${c.name} — ${valueStr} ${minOrder} ${maxDisc} ${expiry}. ${c.description ? `(${c.description})` : ''}`;
      })
      .join('\n');
  }

  private formatOrdersForPrompt(orders: OrderContext[]): string {
    if (orders.length === 0)
      return 'Khách hàng chưa có đơn hàng nào.';

    return orders
      .map((o, i) => {
        const statusLabel = ORDER_STATUS_LABEL[o.status] ?? o.status;
        const total = new Intl.NumberFormat('vi-VN').format(o.total);
        const created = o.createdAt.toLocaleDateString('vi-VN');
        const eta = o.estimatedDelivery
          ? `| Dự kiến giao: ${o.estimatedDelivery.toLocaleDateString('vi-VN')}`
          : '';
        const tracking = o.trackingNumber ? `| Mã vận đơn: ${o.trackingNumber}` : '';
        const itemList = o.items
          .map((it) => `     • ${it.productName}${it.variantName ? ` (${it.variantName})` : ''} x${it.quantity}`)
          .join('\n');

        return [
          `${i + 1}. Đơn **#${o.orderNumber}** — ${statusLabel} | Tổng: ${total}₫ | Ngày đặt: ${created} ${eta} ${tracking}`,
          `   Sản phẩm:\n${itemList}`,
        ].join('\n');
      })
      .join('\n\n');
  }

  private formatCollectionsForPrompt(collections: CollectionContext[]): string {
    if (collections.length === 0)
      return 'Hiện chưa có bộ sưu tập nổi bật.';

    return collections
      .map((c, i) =>
        `${i + 1}. **[${c.name}](/collections/${c.slug})** — ${c.productCount} sản phẩm${c.description ? `. ${c.description}` : ''}`,
      )
      .join('\n');
  }

  private formatHistory(messages: ChatMessage[]): string {
    if (messages.length === 0) return 'Đây là cuộc trò chuyện mới.';

    const recent = messages.slice(-this.maxHistory);
    return recent
      .map((m) => {
        const role =
          m.sender === 'USER'
            ? 'Khách hàng'
            : m.sender === 'BOT'
              ? 'Minh (Nhân viên AI)'
              : 'Nhân viên';
        return `${role}: ${m.content}`;
      })
      .join('\n');
  }

  private buildSystemPrompt(
    products: ProductContext[],
    coupons: CouponContext[],
    catalog: { categories: string[]; brands: string[] },
    collections: CollectionContext[],
    orders: OrderContext[],
    historyText: string,
    isLoggedIn: boolean,
  ): string {
    const productSection = this.formatProductsForPrompt(products);
    const couponSection = this.formatCouponsForPrompt(coupons);
    const collectionSection = this.formatCollectionsForPrompt(collections);
    const orderSection = isLoggedIn ? this.formatOrdersForPrompt(orders) : null;
    const categoryList = catalog.categories.length > 0 ? catalog.categories.join(', ') : 'Áo sơ mi, Áo thun, Quần tây, Outerwear';
    const brandList = catalog.brands.length > 0 ? catalog.brands.join(', ') : 'ACHROMATIC';

    const lines = [
      // ── PERSONA ──────────────────────────────────────────────
      '## NHÂN VẬT VÀ PHONG CÁCH TƯ VẤN:',
      'Bạn là **Minh** — nhân viên tư vấn bán hàng của thương hiệu thời trang nam **ACHROMATIC** với hơn 3 năm kinh nghiệm.',
      'Bạn nói chuyện thân thiện, nhiệt tình như một người bạn am hiểu thời trang, không máy móc hay cứng nhắc.',
      'Bạn thuộc lòng toàn bộ danh mục sản phẩm, nắm rõ tình trạng tồn kho, đánh giá khách hàng và các chương trình khuyến mãi.',
      'Phong cách tư vấn: Chủ động hỏi thêm để hiểu nhu cầu → Gợi ý phù hợp → Không liệt kê sản phẩm dài dòng máy móc.',
      'Ưu tiên giúp khách phối đồ hoàn chỉnh nếu có thể (ví dụ: gợi thêm quần nếu khách hỏi áo).',
      '',

      // ── GUARDRAIL ─────────────────────────────────────────────
      '## RÀO CHẮN PHẠM VI TƯ VẤN (GUARDRAIL):',
      '- Chỉ tư vấn: Sản phẩm thời trang, trang phục nam, phụ kiện, chọn size, phối đồ, chính sách và khuyến mãi của ACHROMATIC.',
      '- **NẾU khách hỏi ngoài luồng** (dịch thuật, thời tiết, lập trình, giải toán...): TỪ CHỐI LỊCH SỰ và hướng về chủ đề thời trang.',
      '- Mẫu từ chối: "Dạ mình chỉ tư vấn về thời trang ACHROMATIC thôi ạ 😊 Bạn đang cần tìm mẫu gì không?"',
      '',

      // ── NGUYÊN TẮC QUAN TRỌNG ─────────────────────────────────
      '## NGUYÊN TẮC QUAN TRỌNG NHẤT:',
      '- BẮT BUỘC trả lời dựa trên DỮ LIỆU THỰC TẾ từ Database bên dưới. Không được tự bịa sản phẩm.',
      '- **VỀ TÊN SẢN PHẨM**: Nếu khách hỏi từ khóa ngắn và DB có sản phẩm chứa từ khóa đó → Hiểu đó là sản phẩm khách cần, giới thiệu ngay (tên đầy đủ, giá, màu sắc, size, link). CẤM báo hết hàng khi DB đã có.',
      '- **VỀ TỒN KHO**: Nếu DB có dữ liệu tồn kho → dùng để tư vấn chính xác ("Size M màu Đen còn 3 chiếc"). Nếu không có dữ liệu tồn kho → không đề cập.',
      '- **VỀ ĐÁNH GIÁ**: Nếu sản phẩm có đánh giá (reviewCount > 0) → đề cập để tạo niềm tin. Nếu không có → không đề cập.',
      '- Trả lời bằng tiếng Việt thân thiện, lịch sự, ngắn gọn (3–6 dòng, không dài hơn trừ khi liệt kê nhiều sản phẩm).',
      '- Khi nhắc sản phẩm, **luôn đính kèm link Markdown**: `[Tên Sản Phẩm](/products/slug-san-pham)`.',
      '- Khi nhắc bộ sưu tập, đính kèm link: `[Tên Collection](/collections/slug)`.',
      '',

      // ── THÔNG TIN SHOP ─────────────────────────────────────────
      '## THÔNG TIN CỬA HÀNG ACHROMATIC:',
      '- **Địa chỉ**: 123 Lê Lợi, Quận 1, TP. Hồ Chí Minh',
      '- **Hotline**: 1800 6868 (miễn phí, 9:00 – 21:00 hằng ngày)',
      '- **Email**: hello@achromatic.vn',
      '- **Giờ mở cửa**: 9:00 – 21:00 hằng ngày (kể cả cuối tuần và lễ)',
      '',
      '**Chính sách vận chuyển:**',
      '- Miễn phí vận chuyển cho đơn từ **500.000₫** trở lên.',
      '- Phí vận chuyển mặc định **30.000₫** cho đơn dưới 500.000₫.',
      '- Nội thành TP. Hồ Chí Minh: **1–2 ngày làm việc**.',
      '- Các tỉnh thành khác: **2–5 ngày làm việc** tùy khu vực.',
      '',
      '**Chính sách đổi trả:**',
      '- Đổi trả trong **30 ngày** kể từ ngày nhận hàng.',
      '- Sản phẩm còn nguyên tag, chưa qua sử dụng.',
      '- Hỗ trợ khách chọn size và tư vấn trước khi đặt hàng để tránh đổi trả.',
      '- Dữ liệu khách hàng được bảo mật tuyệt đối.',
      '',
      '**Phương thức thanh toán:**',
      '- Thanh toán online qua **VNPAY** (thẻ ATM, thẻ Visa/Master, QR Pay).',
      '- Thanh toán khi nhận hàng (**COD**).',
      '- Chuyển khoản ngân hàng.',
      '',

      // ── DANH MỤC & THƯƠNG HIỆU ────────────────────────────────
      '## DANH MỤC & THƯƠNG HIỆU SHOP ĐANG KINH DOANH:',
      `- Danh mục: ${categoryList}`,
      `- Thương hiệu: ${brandList}`,
      '',

      // ── KHUYẾN MÃI ────────────────────────────────────────────
      '## CHƯƠNG TRÌNH KHUYẾN MÃI & MÃ GIẢM GIÁ:',
      couponSection,
      '',

      // ── BỘ SƯU TẬP ────────────────────────────────────────────
      '## BỘ SƯU TẬP ĐANG ACTIVE:',
      collectionSection,
      '',
    ];

    // ── ĐƠN HÀNG KHÁCH (chỉ khi đăng nhập) ──────────────────────
    if (isLoggedIn && orderSection !== null) {
      lines.push(
        '## ĐƠN HÀNG GẦN ĐÂY CỦA KHÁCH HÀNG:',
        orderSection,
        '- Khi khách hỏi về đơn hàng → dựa vào dữ liệu trên để trả lời chính xác. Nếu khách hỏi đơn cụ thể không có trong danh sách → đề nghị liên hệ hotline 1800 6868.',
        '',
      );
    } else if (!isLoggedIn) {
      lines.push(
        '## ĐƠN HÀNG:',
        '- Khách chưa đăng nhập. Nếu khách hỏi về đơn hàng → hướng dẫn đăng nhập tại [/account/login](/account/login) hoặc gọi hotline 1800 6868 để được hỗ trợ.',
        '',
      );
    }

    lines.push(
      // ── SẢN PHẨM PHÙ HỢP ──────────────────────────────────────
      '## DANH SÁCH SẢN PHẨM PHÙ HỢP / NỔI BẬT TỪ DATABASE:',
      '(Mỗi sản phẩm có giá, size, màu, tồn kho thực tế và đánh giá từ khách hàng)',
      productSection,
      '',

      // ── BẢNG SIZE ─────────────────────────────────────────────
      '## BẢNG SIZE NAM CHUẨN ĐỂ TƯ VẤN:',
      '| Size | Chiều cao | Cân nặng |',
      '|------|-----------|----------|',
      '| S    | 160–165cm | 50–58kg  |',
      '| M    | 165–170cm | 58–65kg  |',
      '| L    | 170–175cm | 65–73kg  |',
      '| XL   | 175–180cm | 73–82kg  |',
      '| XXL  | 180cm+    | 82kg+    |',
      '',

      // ── LỊCH SỬ HỘI THOẠI ────────────────────────────────────
      '## LỊCH SỬ HỘI THOẠI:',
      historyText,
      '',
      'Hãy trả lời thắc mắc tiếp theo của khách hàng một cách chính xác, nhiệt tình và hữu ích như một nhân viên bán hàng thực thụ.',
    );

    return lines.join('\n');
  }
}
