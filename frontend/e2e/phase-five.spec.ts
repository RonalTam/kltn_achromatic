import { expect, test } from '@playwright/test';

const appURL = 'http://127.0.0.1:3210';
const clientDefaultAPI = 'http://localhost:3001/api/';
const mockAPI = 'http://127.0.0.1:3211/api/';

test('wishlist, reviews, and detailed order tracking work together', async ({
  context,
  page,
  request,
}) => {
  await request.post('http://127.0.0.1:3211/test/reset');
  await context.addCookies([
    { name: 'auth_status', value: '1', url: appURL },
    { name: 'auth_role', value: 'CUSTOMER', url: appURL },
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
    window.print = () => {
      document.documentElement.dataset.invoicePrintInvoked = 'true';
      window.dispatchEvent(new Event('afterprint'));
    };
  });

  // Client-side API URLs use the development fallback in production builds.
  // Forward those requests to the deterministic API used by this suite.
  await page.route(`${clientDefaultAPI}**`, async (route) => {
    const target = route.request().url().replace(clientDefaultAPI, mockAPI);
    const response = await route.fetch({ url: target });
    await route.fulfill({ response });
  });

  await page.goto('/products/e2e-linen-shirt');
  await expect(
    page.getByRole('heading', { level: 1, name: 'E2E Linen Shirt' }),
  ).toBeVisible();

  await page.getByRole('tab', { name: /^Đánh giá/ }).click();
  await expect(page.getByText('Excellent everyday shirt')).toBeVisible();
  await expect(page.getByText('Đã mua hàng')).toBeVisible();

  await page.getByRole('button', { name: '5 sao' }).click();
  await page
    .getByLabel('Nội dung đánh giá')
    .fill('Chất liệu thoáng, đường may đẹp và sản phẩm vừa vặn.');
  await page.getByRole('button', { name: 'Gửi đánh giá' }).click();
  await expect(
    page.getByRole('heading', { name: 'Bạn đã đánh giá sản phẩm này' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Hữu ích (3)' }).click();
  await expect(page.getByRole('button', { name: 'Hữu ích (4)' })).toBeVisible();

  await page
    .getByRole('button', {
      name: 'Thêm E2E Linen Shirt vào danh sách yêu thích',
    })
    .click();
  await expect(
    page.getByRole('link', { name: 'Danh sách yêu thích, 1 sản phẩm' }),
  ).toBeVisible();

  await page.goto('/account/wishlist');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Danh Sách Yêu Thích' }),
  ).toBeVisible();
  await expect(page.getByText('E2E Linen Shirt')).toBeVisible();
  await page.getByRole('button', { name: 'Chuyển vào giỏ hàng' }).click();
  await expect(page.getByText('Danh sách yêu thích trống')).toBeVisible();

  await page.goto('/account/orders/e2e-order-1');
  await expect(
    page.getByRole('heading', { level: 1, name: 'E2E-ORDER-1001' }),
  ).toBeVisible();
  await expect(page.getByText('Đã xác nhận').first()).toBeVisible();
  await expect(page.getByText('Standard delivery')).toBeVisible();

  await page.getByRole('button', { name: 'Đặt lại đơn này' }).click();
  await expect(page).toHaveURL('/cart');
  const reorderedCart = page.getByRole('dialog', { name: 'Giỏ Hàng (2)' });
  await expect(
    reorderedCart.getByText('E2E Linen Shirt', { exact: true }),
  ).toBeVisible();
  await reorderedCart.getByRole('button', { name: 'Close' }).click();
  await page.goto('/account/orders/e2e-order-1');

  await page.getByRole('button', { name: 'Tải hóa đơn PDF' }).click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-invoice-print-invoked',
    'true',
  );

  await page.getByRole('button', { name: 'Hủy đơn hàng' }).click();
  await expect(page.getByRole('alertdialog')).toBeVisible();
  await page.getByRole('button', { name: 'Xác nhận hủy' }).click();
  await expect(page.getByText('Đơn hàng đã bị hủy')).toBeVisible();
});
