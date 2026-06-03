import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Helper to login
async function login(page: Page, username = 'admin', password = 'Admin@123') {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Provider Analytics');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-text')).toHaveCount(2);
    await expect(page.locator('.error-text').first()).toContainText('Username is required');
  });

  test('should show error for short password', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-text')).toContainText('Password must be at least 6 characters');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('#username', 'wronguser');
    await page.fill('#password', 'wrongpass');
    await page.click('button[type="submit"]');
    // Wait for toast error
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 5000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should login as different roles', async ({ page }) => {
    // Login as viewer
    await page.fill('#username', 'viewer');
    await page.fill('#password', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('.user-details .role')).toContainText('Viewer');
  });
});

test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display KPI cards', async ({ page }) => {
    await expect(page.locator('.kpi-card')).toHaveCount(4);
    await expect(page.locator('.kpi-card.primary')).toBeVisible();
    await expect(page.locator('.kpi-card.success')).toBeVisible();
    await expect(page.locator('.kpi-card.warning')).toBeVisible();
    await expect(page.locator('.kpi-card.info')).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    await expect(page.locator('.chart-card')).toHaveCount(4);
  });

  test('should show correct KPI values', async ({ page }) => {
    // Average Score
    const avgScore = page.locator('.kpi-card.primary .value');
    await expect(avgScore).toBeVisible();
    const scoreText = await avgScore.textContent();
    const score = parseFloat(scoreText || '0');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(5);
  });

  test('should navigate to providers page', async ({ page }) => {
    await page.click('a[href="/providers"]');
    await expect(page.locator('h1')).toContainText('Providers');
  });
});

test.describe('Provider CRUD Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('a[href="/providers"]');
    await page.waitForSelector('table', { timeout: 10000 });
  });

  test('should display providers table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(10);
  });

  test('should create a new provider', async ({ page }) => {
    await page.click('button:has-text("Add Provider")');
    await expect(page.locator('.modal')).toBeVisible();

    await page.fill('#name', 'Dr. Test Provider');
    await page.fill('#specialty', 'General Medicine');
    await page.fill('#email', 'test@provider.com');
    await page.fill('#phone', '555-9999');
    await page.fill('#location', 'Test City');

    await page.click('button:has-text("Create")');
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for empty provider name', async ({ page }) => {
    await page.click('button:has-text("Add Provider")');
    await expect(page.locator('.modal')).toBeVisible();

    // Try to submit without name
    await page.fill('#specialty', 'Test');
    await page.click('button:has-text("Create")');
    await expect(page.locator('.error-text')).toContainText('Provider name is required');
  });

  test('should view provider details', async ({ page }) => {
    // Click view button on first provider
    await page.locator('tbody tr').first().locator('button[title="View Details"]').click();
    await expect(page.locator('h1')).not.toContainText('Providers');
    await expect(page.locator('.detail-grid')).toBeVisible();
  });

  test('should edit a provider', async ({ page }) => {
    // Click edit button on first provider
    await page.locator('tbody tr').first().locator('button[title="Edit"]').click();
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal h2')).toContainText('Edit Provider');

    // Modify name
    const nameInput = page.locator('#name');
    await nameInput.clear();
    await nameInput.fill('Updated Provider Name');
    await page.click('button:has-text("Update")');
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Search & Filter Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.click('a[href="/providers"]');
    await page.waitForSelector('table', { timeout: 10000 });
  });

  test('should search providers by name', async ({ page }) => {
    await page.fill('input[placeholder="Search providers..."]', 'Sarah');
    await page.waitForTimeout(500);
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
    await expect(rows.first()).toContainText('Sarah');
  });

  test('should filter by status', async ({ page }) => {
    await page.selectOption('select:nth-of-type(2)', 'At-Risk');
    await page.waitForTimeout(500);
    const badges = page.locator('.badge-at-risk');
    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should sort by name', async ({ page }) => {
    await page.click('th:has-text("Name")');
    await page.waitForTimeout(500);
    // Verify sort icon appears
    await expect(page.locator('th:has-text("Name") .sort-icon')).toBeVisible();
  });

  test('should paginate', async ({ page }) => {
    const paginationInfo = page.locator('.pagination-info');
    await expect(paginationInfo).toBeVisible();
    await expect(paginationInfo).toContainText('of');
  });
});

test.describe('UI Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should have responsive sidebar', async ({ page }) => {
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.sidebar-header h2')).toContainText('Provider Analytics');
  });

  test('should display user info in sidebar', async ({ page }) => {
    await expect(page.locator('.user-details .name')).toBeVisible();
    await expect(page.locator('.user-details .role')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.click('.logout-btn');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Provider Analytics');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Clear auth data
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL('**/login', { timeout: 5000 });
  });

  test('viewer should not see Add Provider button', async ({ page }) => {
    // Logout first
    await page.click('.logout-btn');
    await page.waitForURL('**/login');

    // Login as viewer
    await login(page, 'viewer', 'Admin@123');
    await page.click('a[href="/providers"]');
    await page.waitForSelector('table', { timeout: 10000 });
    await expect(page.locator('button:has-text("Add Provider")')).toHaveCount(0);
  });
});
