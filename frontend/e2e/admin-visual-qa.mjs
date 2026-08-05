import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const workspace = process.cwd();
const appURL = 'http://127.0.0.1:3210';
const mockURL = 'http://127.0.0.1:3211';
const clientDefaultAPI = 'http://localhost:3001/api/';
const mockAPI = `${mockURL}/api/`;
const outputDirectory = path.join(workspace, 'test-results', 'admin-visual');

function startNode(args, env = {}) {
  return spawn(process.execPath, args, {
    cwd: workspace,
    env: { ...process.env, ...env },
    stdio: 'ignore',
    windowsHide: true,
  });
}

async function waitForURL(url) {
  let lastError;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw lastError ?? new Error(`Server did not become ready: ${url}`);
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

async function seedAdmin(context, page) {
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

async function forwardClientAPI(page) {
  await page.route(`${clientDefaultAPI}**`, async (route) => {
    try {
      const target = route.request().url().replace(clientDefaultAPI, mockAPI);
      const response = await route.fetch({ url: target });
      const body = await response.body();
      await route.fulfill({
        status: response.status(),
        headers: response.headers(),
        body,
      });
    } catch (error) {
      if (page.isClosed() || /disposed|Target page, context or browser/i.test(String(error))) {
        return;
      }
      throw error;
    }
  });
}

async function assertViewport(page, route) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  if (
    dimensions.document > dimensions.viewport + 1 ||
    dimensions.body > dimensions.viewport + 1
  ) {
    throw new Error(`Horizontal overflow on ${route}: ${JSON.stringify(dimensions)}`);
  }
}

async function openAdminRoute(page, route) {
  const response = await page.goto(`${appURL}${route}`, {
    waitUntil: 'domcontentloaded',
  });
  if (response && response.status() >= 500) {
    throw new Error(`${route} returned ${response.status()}`);
  }
  await page.locator('h1').first().waitFor({ state: 'visible' });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await assertViewport(page, route);
  if (await page.getByText('Có lỗi xảy ra').isVisible().catch(() => false)) {
    throw new Error(`${route} rendered its API error state`);
  }
}

function assertCondition(condition, message) {
  if (!condition) throw new Error(message);
}

async function resetMockAPI() {
  const response = await fetch(`${mockURL}/test/reset`, { method: 'POST' });
  if (!response.ok) throw new Error(`Could not reset mock API: ${response.status}`);
}

async function runWorkflowChecks(browserInstance) {
  const context = await browserInstance.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await seedAdmin(context, page);
  await forwardClientAPI(page);

  try {
    await resetMockAPI();
    await openAdminRoute(page, '/admin/merchandising');
    const candidates = page.locator('section[aria-labelledby="candidate-heading"]');
    const merchandisingSearch = page.getByPlaceholder(/polo.*SKU biến thể/i);
    await merchandisingSearch.fill('E2E-VARIANT-BLACK-M');
    await candidates.getByText('E2E Pleated Trousers').waitFor({ state: 'visible' });
    await candidates.getByText('E2E Linen Shirt').waitFor({ state: 'hidden' });
    await merchandisingSearch.clear();
    await page.getByRole('button', { name: /Đưa E2E Linen Shirt xuống/i }).click();
    page.once('dialog', async (dialog) => {
      assertCondition(
        /thay đổi chưa lưu/i.test(dialog.message()),
        `Unexpected navigation dialog: ${dialog.message()}`,
      );
      await dialog.dismiss();
    });
    await page.getByRole('link', { name: 'Sản phẩm', exact: true }).click();
    assertCondition(
      new URL(page.url()).pathname === '/admin/merchandising',
      'Dismissed unsaved-changes dialog still navigated away',
    );
    page.once('dialog', async (dialog) => {
      assertCondition(
        /thay đổi chưa lưu/i.test(dialog.message()),
        `Unexpected logout dialog: ${dialog.message()}`,
      );
      await dialog.dismiss();
    });
    await page.getByRole('button', { name: 'Đăng xuất' }).click();
    assertCondition(
      new URL(page.url()).pathname === '/admin/merchandising',
      'Dismissed unsaved-changes dialog still logged the admin out',
    );
    const merchandisingRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PATCH' &&
        request.url().endsWith('/api/admin/merchandising/new-arrivals'),
    );
    await page.getByRole('button', { name: /Lưu trang chủ/i }).click();
    const merchandisingPayload = (await merchandisingRequestPromise).postDataJSON();
    assertCondition(
      JSON.stringify(merchandisingPayload?.productIds) ===
        JSON.stringify(['e2e-product-2', 'e2e-product-1']) &&
        merchandisingPayload?.limit === 4,
      `Unexpected merchandising payload: ${JSON.stringify(merchandisingPayload)}`,
    );
    await page.getByText(/Đã cập nhật khu vực Hàng mới về/i).waitFor({ state: 'visible' });

    await resetMockAPI();
    await openAdminRoute(page, '/admin/products');
    const productSearch = page.getByPlaceholder(/tên.*SKU.*biến thể/i);
    await productSearch.fill('E2E-VARIANT-BLACK-M');
    await Promise.all([
      page.waitForURL(/q=E2E-VARIANT-BLACK-M/),
      page.getByRole('button', { name: /Áp dụng/i }).click(),
    ]);
    await page.getByText('E2E Pleated Trousers').waitFor({ state: 'visible' });
    await page.getByText('E2E Linen Shirt').waitFor({ state: 'hidden' });

    await resetMockAPI();
    await openAdminRoute(page, '/admin/orders');
    await page
      .getByLabel(/Chọn trạng thái tiếp theo cho đơn E2E-ORDER-1001/i)
      .selectOption('PROCESSING');
    await page
      .getByRole('heading', { name: /Xác nhận trạng thái đơn hàng/i })
      .waitFor({ state: 'visible' });
    const auditNote = 'Kho đã bắt đầu đóng gói.';
    await page.getByLabel(/Ghi chú chuyển trạng thái/i).fill(auditNote);
    const transitionRequestPromise = page.waitForRequest(
      (request) =>
        request.method() === 'PATCH' &&
        request.url().endsWith('/api/admin/orders/e2e-order-1/status'),
    );
    await page.getByRole('button', { name: /Xác nhận cập nhật/i }).click();
    const transitionPayload = (await transitionRequestPromise).postDataJSON();
    assertCondition(
      transitionPayload?.status === 'PROCESSING' && transitionPayload?.note === auditNote,
      `Unexpected order transition payload: ${JSON.stringify(transitionPayload)}`,
    );
    await page
      .getByText(/Đã chuyển đơn hàng sang Đang chuẩn bị hàng/i)
      .waitFor({ state: 'visible' });

    return 4;
  } finally {
    await context.close();
  }
}

const mockProcess = startNode(['e2e/mock-api.mjs'], { MOCK_API_PORT: '3211' });
const webProcess = startNode(
  [
    'node_modules/next/dist/bin/next',
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    '3210',
  ],
  {
    NEXT_PUBLIC_API_URL: `${mockURL}/api`,
    NEXT_TELEMETRY_DISABLED: '1',
  },
);

let browser;
try {
  await Promise.all([waitForURL(`${mockURL}/health`), waitForURL(appURL)]);
  await mkdir(outputDirectory, { recursive: true });
  browser = await chromium.launch({ headless: true });

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktop.newPage();
  await seedAdmin(desktop, desktopPage);
  await forwardClientAPI(desktopPage);

  const desktopRoutes = [
    ['/admin', 'dashboard-desktop.png'],
    ['/admin/merchandising', 'merchandising-desktop.png'],
    ['/admin/products', 'products-desktop.png'],
    ['/admin/reports', 'reports-desktop.png'],
  ];
  for (const [route, filename] of desktopRoutes) {
    await openAdminRoute(desktopPage, route);
    await desktopPage.screenshot({
      path: path.join(outputDirectory, filename),
      fullPage: true,
    });
  }

  await openAdminRoute(desktopPage, '/admin/products');
  await desktopPage.getByRole('button', { name: /Thêm sản phẩm/i }).click();
  await desktopPage.getByRole('dialog').waitFor({ state: 'visible' });
  await desktopPage.screenshot({
    path: path.join(outputDirectory, 'product-form-desktop.png'),
    fullPage: true,
  });
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobile.newPage();
  await seedAdmin(mobile, mobilePage);
  await forwardClientAPI(mobilePage);
  for (const [route, filename] of [
    ['/admin/merchandising', 'merchandising-mobile.png'],
    ['/admin/products', 'products-mobile.png'],
  ]) {
    await openAdminRoute(mobilePage, route);
    await mobilePage.screenshot({
      path: path.join(outputDirectory, filename),
      fullPage: true,
    });
  }
  await mobile.close();

  const workflows = await runWorkflowChecks(browser);

  process.stdout.write(
    `${JSON.stringify({
      status: 'ok',
      workflows,
      screenshots: [
        'dashboard-desktop.png',
        'merchandising-desktop.png',
        'products-desktop.png',
        'reports-desktop.png',
        'product-form-desktop.png',
        'merchandising-mobile.png',
        'products-mobile.png',
      ],
    })}\n`,
  );
} finally {
  await browser?.close();
  await Promise.all([stopProcess(webProcess), stopProcess(mockProcess)]);
}
