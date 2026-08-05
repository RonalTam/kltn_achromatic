import { expect, type BrowserContext, type Locator, type Page, test } from '@playwright/test';

const appURL = 'http://127.0.0.1:3210';
const clientDefaultAPI = 'http://localhost:3001/api/';
const mockAPI = 'http://127.0.0.1:3211/api/';
const siteURL = new URL(
  process.env.NEXT_PUBLIC_APP_URL ?? 'https://achromatic.vn',
);

const publicResponsiveRoutes = [
  '/',
  '/collections',
  '/products/e2e-linen-shirt',
  '/search?q=linen',
  '/about',
  '/careers',
  '/contact',
  '/faq',
  '/size-guide',
  '/track-order',
  '/policy/shipping',
  '/policy/returns',
  '/policy/privacy',
  '/policy/terms',
  '/account/login',
  '/account/register',
  '/account/forgot-password',
  '/account/reset-password?token=e2e-token',
  '/forbidden',
  '/phase-six-not-found',
] as const;

const customerResponsiveRoutes = [
  '/account',
  '/account/orders',
  '/account/orders/e2e-order-1',
  '/account/settings',
  '/account/wishlist',
  '/cart',
  '/checkout',
] as const;

const adminResponsiveRoutes = [
  '/admin',
  '/admin/banners',
  '/admin/categories',
  '/admin/coupons',
  '/admin/customers',
  '/admin/inventory',
  '/admin/merchandising',
  '/admin/orders',
  '/admin/products',
  '/admin/reports',
  '/admin/settings',
] as const;

const cartProduct = {
  id: 'e2e-product-1',
  name: 'E2E Linen Shirt',
  slug: 'e2e-linen-shirt',
  basePrice: 450000,
  images: [
    {
      url: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
      altText: 'E2E Linen Shirt',
      isPrimary: true,
    },
  ],
  inventory: { quantity: 10, reserved: 0 },
};

async function forwardClientApi(page: Page) {
  await page.route(`${clientDefaultAPI}**`, async (route) => {
    const target = route.request().url().replace(clientDefaultAPI, mockAPI);
    const response = await route.fetch({ url: target });
    await route.fulfill({ response });
  });
}

async function seedUser(
  context: BrowserContext,
  page: Page,
  { role = 'CUSTOMER', withCart = false }: {
    role?: 'ADMIN' | 'CUSTOMER';
    withCart?: boolean;
  } = {},
) {
  await context.addCookies([
    { name: 'auth_status', value: '1', url: appURL },
    { name: 'auth_role', value: role, url: appURL },
  ]);

  await page.addInitScript(
    ({ product, includeCart, userRole }) => {
      window.localStorage.setItem(
        'achromatic-auth',
        JSON.stringify({
          state: {
            user: {
              id: userRole === 'ADMIN' ? 'e2e-admin-1' : 'e2e-user-1',
              email:
                userRole === 'ADMIN'
                  ? 'admin-e2e@achromatic.vn'
                  : 'e2e@achromatic.vn',
              firstName: 'E2E',
              lastName: userRole === 'ADMIN' ? 'Admin' : 'Customer',
              role: userRole,
            },
            accessToken: 'e2e-access-token',
            isAuthenticated: true,
          },
          version: 0,
        }),
      );

      if (includeCart) {
        window.localStorage.setItem(
          'achromatic-cart',
          JSON.stringify({
            state: {
              items: [
                {
                  id: 'e2e-cart-item-1',
                  cartId: 'local',
                  productId: product.id,
                  variantId: null,
                  quantity: 1,
                  product,
                  variant: null,
                },
              ],
            },
            version: 0,
          }),
        );
      }
    },
    { product: cartProduct, includeCart: withCart, userRole: role },
  );
}

async function seedCustomer(context: BrowserContext, page: Page, withCart = false) {
  await seedUser(context, page, { withCart });
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));

  expect(dimensions.document, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
  expect(dimensions.body, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.viewport + 1,
  );
}

async function expectTouchTargets(locator: Locator) {
  const targets = await locator.evaluateAll((elements) =>
    elements.flatMap((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (
        rect.width === 0 ||
        rect.height === 0 ||
        style.display === 'none' ||
        style.visibility === 'hidden'
      ) {
        return [];
      }

      return [{
        width: rect.width,
        height: rect.height,
        label:
          element.getAttribute('aria-label') ||
          element.textContent?.trim() ||
          element.tagName,
      }];
    }),
  );

  for (const target of targets) {
    expect(target.width, `${target.label} is too narrow`).toBeGreaterThanOrEqual(43.5);
    expect(target.height, `${target.label} is too short`).toBeGreaterThanOrEqual(43.5);
  }
}

async function expectResponsiveRoute(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response?.status() ?? 200, route).toBeLessThan(500);
  await expect(page.locator('body')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const main = page.locator('main').first();
  if (await main.isVisible()) {
    const box = await main.boundingBox();
    expect(box, `Missing main bounds for ${route}`).not.toBeNull();
    expect(box!.x, `Main starts outside viewport on ${route}`).toBeGreaterThanOrEqual(-1);
    expect(
      box!.x + box!.width,
      `Main ends outside viewport on ${route}`,
    ).toBeLessThanOrEqual((await page.evaluate(() => innerWidth)) + 1);
  }
}

async function expectResponsiveRoutes(
  page: Page,
  routes: readonly string[],
) {
  for (const route of routes) {
    await expectResponsiveRoute(page, route);
  }
}

test.describe('Phase 6 SEO', () => {
  test('product metadata and Product JSON-LD are complete', async ({ page }) => {
    await forwardClientApi(page);
    await page.goto('/products/e2e-linen-shirt');

    await expect(page).toHaveTitle(/E2E Linen Shirt.*ACHROMATIC/i);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Lightweight linen shirt/i,
    );

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).pathname).toBe('/products/e2e-linen-shirt');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      /E2E Linen Shirt/i,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      /^https?:\/\//,
    );

    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent || '{}')));
    const productSchema = schemas.find((schema) => schema['@type'] === 'Product');

    expect(productSchema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'E2E Linen Shirt',
      sku: 'E2E-LINEN-001',
      brand: { '@type': 'Brand', name: 'Achromatic E2E' },
      category: 'E2E Shirts',
      offers: {
        '@type': 'Offer',
        priceCurrency: 'VND',
        price: 450000,
        availability: 'https://schema.org/InStock',
      },
    });
    expect(productSchema.url).toMatch(/^https?:\/\//);
    expect(productSchema.image[0]).toMatch(/^https?:\/\//);
  });

  test('collections metadata follows filters and normalizes its canonical URL', async ({ page }) => {
    await page.goto('/collections?sortBy=price_desc&sizes=M&category=e2e-shirts');

    await expect(page).toHaveTitle(/E2E Shirts.*ACHROMATIC/i);
    const canonical = new URL(
      (await page.locator('link[rel="canonical"]').getAttribute('href'))!,
    );
    expect(canonical.pathname).toBe('/collections');
    expect(canonical.searchParams.get('category')).toBe('e2e-shirts');
    expect(canonical.searchParams.get('sizes')).toBe('M');
    expect(canonical.searchParams.has('sortBy')).toBe(false);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex, follow/i,
    );
  });

  test('unknown facets are not indexable and false flags are removed', async ({ page }) => {
    await page.goto(
      '/collections?category=not-a-category&brand=not-a-brand&newArrival=false',
    );

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex, follow/i,
    );
    const canonical = new URL(
      (await page.locator('link[rel="canonical"]').getAttribute('href'))!,
    );
    expect(canonical.searchParams.has('newArrival')).toBe(false);
  });

  test('every indexable static route has a self-canonical URL', async ({ page }) => {
    const routes = [
      '/',
      '/collections',
      '/about',
      '/careers',
      '/contact',
      '/faq',
      '/size-guide',
      '/track-order',
      '/policy/shipping',
      '/policy/returns',
      '/policy/privacy',
      '/policy/terms',
    ];

    for (const route of routes) {
      await page.goto(route);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(new URL(canonical!).pathname, route).toBe(route);
    }
  });

  test('sitemap and robots expose only crawlable storefront routes', async ({ request }) => {
    const sitemapResponse = await request.get('/sitemap.xml');
    expect(sitemapResponse.ok()).toBe(true);
    expect(sitemapResponse.headers()['content-type']).toMatch(/xml/);
    const sitemap = await sitemapResponse.text();
    expect(sitemap).toContain(
      `<loc>${new URL('/collections', siteURL).toString()}</loc>`,
    );
    expect(sitemap).toContain(
      `<loc>${new URL('/products/e2e-linen-shirt', siteURL).toString()}</loc>`,
    );
    expect(sitemap).not.toMatch(/<loc>[^<]+\/(admin|account|cart|checkout)/);

    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    expect(new Set(urls).size).toBe(urls.length);

    const robotsResponse = await request.get('/robots.txt');
    expect(robotsResponse.ok()).toBe(true);
    const robots = await robotsResponse.text();
    expect(robots).toContain('User-Agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Disallow: /account');
    expect(robots).toContain('Disallow: /checkout');
    expect(robots).toContain(
      `Sitemap: ${new URL('/sitemap.xml', siteURL).toString()}`,
    );
  });
});

test.describe('Phase 6 mobile storefront at 375px', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test.describe.configure({ timeout: 120_000 });

  test('all public pages fit the viewport', async ({ page }) => {
    await forwardClientApi(page);
    await expectResponsiveRoutes(page, publicResponsiveRoutes);
  });

  test('all customer pages fit the viewport', async ({ context, page }) => {
    await seedCustomer(context, page, true);
    await forwardClientApi(page);
    await expectResponsiveRoutes(page, customerResponsiveRoutes);
  });

  test('all admin pages fit the viewport', async ({ context, page }) => {
    await seedUser(context, page, { role: 'ADMIN' });
    await forwardClientApi(page);
    await expectResponsiveRoutes(page, adminResponsiveRoutes);
  });

  test('visible home and product buttons meet the touch minimum', async ({ page }) => {
    await forwardClientApi(page);
    for (const route of ['/', '/products/e2e-linen-shirt']) {
      await page.goto(route);
      await expectTouchTargets(page.locator('main button:visible'));
    }
  });

  test('filter drawer, touch targets, and sticky header work without overflow', async ({
    page,
  }) => {
    await forwardClientApi(page);
    await page.goto('/collections');
    await expectNoHorizontalOverflow(page);

    const header = page.locator('#main-header');
    await expect(header).toHaveCSS('position', 'fixed');
    await expectTouchTargets(header.locator('button:visible, a[aria-label]:visible'));

    const filterButton = page.getByRole('button', { name: 'Mở bộ lọc sản phẩm' });
    await expectTouchTargets(filterButton);
    await filterButton.tap();

    const drawer = page.getByRole('dialog', { name: 'Lọc Sản Phẩm' });
    await expect(drawer).toBeVisible();
    await expectTouchTargets(
      drawer.locator('button:visible').filter({ hasNotText: /^$/ }),
    );
    await drawer.getByRole('button', { name: 'E2E Shirts' }).tap();
    await drawer.getByRole('button', { name: /Tìm sản phẩm \(1\)/ }).tap();
    await expect(page).toHaveURL(/category=e2e-shirts/);
    await expect(drawer).toBeHidden();

    await page.evaluate(() => window.scrollTo(0, 500));
    await expect.poll(async () => (await header.boundingBox())?.y ?? 999).toBeLessThanOrEqual(1);
    await expectNoHorizontalOverflow(page);
  });

  test('checkout fields stack and remain touch friendly', async ({ context, page }) => {
    await seedCustomer(context, page, true);
    await forwardClientApi(page);
    await page.goto('/checkout');
    await expect(page.getByRole('heading', { level: 1, name: 'Thanh Toán' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const lastName = page.locator('input[name="lastName"]');
    const firstName = page.locator('input[name="firstName"]');
    const district = page.locator('input[name="district"]');
    const province = page.locator('input[name="province"]');
    const [lastBox, firstBox, districtBox, provinceBox] = await Promise.all([
      lastName.boundingBox(),
      firstName.boundingBox(),
      district.boundingBox(),
      province.boundingBox(),
    ]);

    expect(firstBox!.y).toBeGreaterThan(lastBox!.y + 20);
    expect(provinceBox!.y).toBeGreaterThan(districtBox!.y + 20);
    await expectTouchTargets(
      page.locator(
        'form input:visible:not([type="radio"]):not([type="checkbox"])',
      ),
    );
    await expectTouchTargets(
      page.getByRole('button', { name: /Đặt Hàng|Hủy và quay lại giỏ hàng/ }),
    );
  });
});

test.describe('Phase 6 tablet storefront at 768px', () => {
  test.use({ viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true });
  test.describe.configure({ timeout: 120_000 });

  test('all public pages fit the viewport', async ({ page }) => {
    await forwardClientApi(page);
    await expectResponsiveRoutes(page, publicResponsiveRoutes);
  });

  test('all customer pages fit the viewport', async ({ context, page }) => {
    await seedCustomer(context, page, true);
    await forwardClientApi(page);
    await expectResponsiveRoutes(page, customerResponsiveRoutes);
  });

  test('all admin pages fit the viewport', async ({ context, page }) => {
    await seedUser(context, page, { role: 'ADMIN' });
    await forwardClientApi(page);
    await expectResponsiveRoutes(page, adminResponsiveRoutes);
  });

  test('product-card actions stay touch accessible', async ({ page }) => {
    await forwardClientApi(page);
    await page.goto('/');
    await expectTouchTargets(page.locator('main button:visible'));
    await page.goto('/collections');

    const productCard = page.locator('article').filter({
      has: page.getByRole('heading', { name: 'E2E Linen Shirt' }),
    });
    await expectTouchTargets(productCard.locator('button:visible'));
    await expect(
      productCard.getByRole('button', { name: /mua nhanh E2E Linen Shirt/i }),
    ).toBeVisible();
  });

  test('key storefront routes render without horizontal overflow', async ({ page }) => {
    await forwardClientApi(page);
    for (const route of [
      '/',
      '/collections',
      '/products/e2e-linen-shirt',
      '/about',
      '/account/login',
    ]) {
      await page.goto(route);
      await expectNoHorizontalOverflow(page);
    }

    await page.goto('/collections');
    await expect(page.getByRole('button', { name: 'Mở bộ lọc sản phẩm' })).toBeVisible();
  });
});
