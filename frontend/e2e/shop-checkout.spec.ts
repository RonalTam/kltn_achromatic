import { expect, test } from '@playwright/test';

const productName = 'E2E Linen Shirt';

test('browse, view a product, add it to the cart, and open checkout', async ({
  context,
  page,
}) => {
  await context.addCookies([
    {
      name: 'auth_status',
      value: '1',
      url: 'http://127.0.0.1:3210',
    },
    {
      name: 'auth_role',
      value: 'CUSTOMER',
      url: 'http://127.0.0.1:3210',
    },
  ]);

  await page.addInitScript(() => {
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
  });

  await page.goto('/collections');
  const productLink = page
    .getByRole('link', { name: new RegExp(productName) })
    .first();
  await expect(productLink).toBeVisible();

  await productLink.click();
  await page.waitForURL('**/products/e2e-linen-shirt', { timeout: 30_000 });
  await expect(
    page.getByRole('heading', { level: 1, name: productName }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Thêm vào giỏ hàng' }).click();
  await expect(
    page.getByRole('heading', { name: /Giỏ Hàng \(1\)/i }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Thanh Toán' }).click();
  await page.waitForURL('**/checkout', { timeout: 30_000 });
  await expect(
    page.getByRole('heading', { level: 1, name: 'Thanh Toán' }),
  ).toBeVisible();
  await expect(page.getByText(productName).first()).toBeVisible();
});
