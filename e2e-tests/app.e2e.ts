import { test, expect } from '@playwright/test';

test.describe('Canvas Local App', () => {
  test('should load the application', async ({ page }) => {
    // In CI, we can't run the actual Tauri app yet
    if (process.env.CI) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('body');

    // Check that the app title is correct
    await expect(page).toHaveTitle(/Canvas Local/);
  });

  test('should display the main interface', async ({ page }) => {
    // In CI, we can't run the actual Tauri app yet
    if (process.env.CI) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // Basic smoke test - ensure the page loads without critical errors
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be responsive', async ({ page }) => {
    // In CI, we can't run the actual Tauri app yet
    if (process.env.CI) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');

    await expect(body).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    await expect(body).toBeVisible();
  });
});
