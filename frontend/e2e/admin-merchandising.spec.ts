import { expect, type BrowserContext, type Page, test } from '@playwright/test';

const appURL = 'http://127.0.0.1:3210';
const clientDefaultAPI = 'http://localhost:3001/api/';
const mockAPI = 'http://127.0.0.1:3211/api/';

test.describe.configure({ mode: 'serial' });

async function forwardClientApi(page: Page) {
  await page.route(`${clientDefaultAPI}**`, async (route) => {
    const target = route.request().url().replace(clientDefaultAPI, mockAPI);
    const response = await route.fetch({ url: target });
    await route.fulfill({ response });
  });
}

async function seedAdmin(context: BrowserContext, page: Page) {
  await context.addCookies([
    { name: 'auth_status', value: '1', url: appURL },
    { name: 'auth_role', value: 'ADMIN', url: appURL },
  ]);

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'achromatic-auth',
      JSON.stringify({
        state: {
          user: {
            id: 'e2e-admin-1',
            email: 'admin-e2e@achromatic.vn',
            firstName: 'E2E',
            lastName: 'Admin',
            role: 'ADMIN',
          },
          accessToken: 'e2e-access-token',
          isAuthenticated: true,
        },
        version: 0,
      }),
    );
  });
}

test.describe('Admin homepage merchandising', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://127.0.0.1:3211/test/reset');
  });

  test('searches variant SKU and submits the chosen storefront order', async ({
    context,
    page,
  }) => {
    await seedAdmin(context, page);
    await forwardClientApi(page);
    await page.goto('/admin/merchandising');

    await expect(
      page.getByRole('heading', { level: 1, name: /Trưng bày trang chủ/i }),
    ).toBeVisible();
    const candidates = page.locator('section[aria-labelledby="candidate-heading"]');
    await expect(candidates.getByText('E2E Linen Shirt')).toBeVisible();
    await expect(candidates.getByText('E2E Pleated Trousers')).toBeVisible();

    const search = page.getByPlaceholder(/polo.*SKU biến thể/i);
    await search.fill('E2E-VARIANT-BLACK-M');
    await expect(candidates.getByText('E2E Pleated Trousers')).toBeVisible();
    await expect(candidates.getByText('E2E Linen Shirt')).toBeHidden();
    await search.clear();

    await page.getByRole('button', { name: /Đưa E2E Linen Shirt xuống/i }).click();
    const saveRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PATCH' &&
        request.url().endsWith('/api/admin/merchandising/new-arrivals'),
    );
    await page.getByRole('button', { name: /Lưu trang chủ/i }).click();
    const saveRequest = await saveRequestPromise;
    expect(saveRequest.postDataJSON()).toMatchObject({
      productIds: ['e2e-product-2', 'e2e-product-1'],
      limit: 4,
    });
    await expect(page.getByText(/Đã cập nhật khu vực Hàng mới về/i)).toBeVisible();
  });
});

test.describe('Admin catalog and order operations', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('http://127.0.0.1:3211/test/reset');
  });

  test('finds a product by variant SKU and keeps the filter in the URL', async ({
    context,
    page,
  }) => {
    await seedAdmin(context, page);
    await forwardClientApi(page);
    await page.goto('/admin/products');

    const search = page.getByPlaceholder(/tên.*SKU.*biến thể/i);
    await search.fill('E2E-VARIANT-BLACK-M');
    await page.getByRole('button', { name: /Áp dụng/i }).click();

    await expect(page).toHaveURL(/q=E2E-VARIANT-BLACK-M/);
    await expect(page.getByText('E2E Pleated Trousers')).toBeVisible();
    await expect(page.getByText('E2E Linen Shirt')).toBeHidden();
  });

  test('confirms a valid order transition and submits its audit note', async ({
    context,
    page,
  }) => {
    await seedAdmin(context, page);
    await forwardClientApi(page);
    await page.goto('/admin/orders');

    await page
      .getByLabel(/Chọn trạng thái tiếp theo cho đơn E2E-ORDER-1001/i)
      .selectOption('PROCESSING');
    await expect(
      page.getByRole('heading', { name: /Xác nhận trạng thái đơn hàng/i }),
    ).toBeVisible();
    await page.getByLabel(/Ghi chú chuyển trạng thái/i).fill('Kho đã bắt đầu đóng gói.');
    const transitionRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PATCH' &&
        request.url().endsWith('/api/admin/orders/e2e-order-1/status'),
    );
    await page.getByRole('button', { name: /Xác nhận cập nhật/i }).click();
    const transitionRequest = await transitionRequestPromise;
    expect(transitionRequest.postDataJSON()).toMatchObject({
      status: 'PROCESSING',
      note: 'Kho đã bắt đầu đóng gói.',
    });
    await expect(page.getByText(/Đã chuyển đơn hàng sang Đang chuẩn bị hàng/i)).toBeVisible();
  });
});
