import AxeBuilder from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const appURL = 'http://127.0.0.1:3210';

const cartProduct = {
  id: 'e2e-product-1',
  name: 'E2E Linen Shirt',
  slug: 'e2e-linen-shirt',
  sku: 'E2E-LINEN-001',
  basePrice: 450000,
  images: [
    {
      url: '/vietnam-fashion/so-mi-linen-hoi-an.svg',
      altText: 'E2E Linen Shirt',
      isPrimary: true,
      sortOrder: 0,
    },
  ],
  inventory: { quantity: 10, reserved: 0 },
  variants: [],
};

async function seedCustomerWithCart(context: BrowserContext, page: Page) {
  await context.addCookies([
    { name: 'auth_status', value: '1', url: appURL },
    { name: 'auth_role', value: 'CUSTOMER', url: appURL },
  ]);
  await page.addInitScript((product) => {
    window.localStorage.setItem(
      'achromatic-auth',
      JSON.stringify({
        state: {
          user: {
            id: 'e2e-user-1',
            email: 'e2e@achromatic.vn',
            firstName: 'E2E',
            lastName: 'Customer',
            role: 'CUSTOMER',
          },
          accessToken: 'e2e-access-token',
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
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
  }, cartProduct);
}

test('public storefront pages have no serious WCAG A/AA violations', async ({
  page,
}) => {
  const results: Array<{ path: string; violations: string[] }> = [];

  for (const path of ['/', '/collections', '/products/e2e-linen-shirt', '/faq']) {
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded');
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    results.push({
      path,
      violations: audit.violations
        .filter(({ impact }) => impact === 'serious' || impact === 'critical')
        .map(
          ({ id, nodes }) =>
            `${id} (${nodes.length}): ${nodes
              .slice(0, 12)
              .map((node) => node.target.join(' '))
              .join(', ')}`,
        ),
    });
  }

  expect(results).toEqual([
    { path: '/', violations: [] },
    { path: '/collections', violations: [] },
    { path: '/products/e2e-linen-shirt', violations: [] },
    { path: '/faq', violations: [] },
  ]);
});

test('quick view, recently viewed, recommendations, and newsletter work', async ({
  page,
}) => {
  await page.goto('/collections');
  await page.getByRole('button', { name: 'Xem nhanh E2E Linen Shirt' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('E2E Linen Shirt')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.goto('/products/e2e-linen-shirt');
  await expect(page.getByText('E2E Pleated Trousers').last()).toBeVisible();
  await page.goto('/products/e2e-pleated-trousers');
  await expect(
    page.getByRole('heading', { name: 'Sản phẩm đã xem' }),
  ).toBeVisible();
  await expect(page.getByText('E2E Linen Shirt').last()).toBeVisible();

  await page.goto('/');
  await page.locator('#newsletter-email').fill('phase7@example.com');
  await page
    .locator('#newsletter-email')
    .locator('xpath=ancestor::form')
    .getByRole('button')
    .click();
  await expect(page.getByText(/Cảm ơn bạn đã đăng ký/i)).toBeVisible();

  const footerEmail = page.locator('#footer-newsletter-email');
  await footerEmail.fill('footer-phase7@example.com');
  await footerEmail
    .locator('xpath=ancestor::form')
    .getByRole('button')
    .click();
  await expect(
    page.locator('#footer').getByText(/Đã đăng ký thành công/i),
  ).toBeVisible();
});

test('checkout validates and applies a coupon', async ({ context, page }) => {
  await seedCustomerWithCart(context, page);
  await page.goto('/checkout');
  const coupon = page.locator('#checkout-coupon');
  await coupon.fill('phase7');
  await page.getByRole('button', { name: 'Áp dụng' }).click();
  await expect(page.locator('#checkout-coupon-message')).toContainText(
    'Đã áp dụng',
  );
  await expect(page.getByText(/-50\.000\s*₫/)).toBeVisible();
});
