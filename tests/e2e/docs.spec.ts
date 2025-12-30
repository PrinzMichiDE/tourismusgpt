import { test, expect } from '@playwright/test';

test.describe('Documentation', () => {
  test('should display docs overview page', async ({ page }) => {
    await page.goto('/de/docs');
    
    await expect(page.getByRole('heading', { name: /dokumentation/i })).toBeVisible();
  });

  test('should display setup guide', async ({ page }) => {
    await page.goto('/de/docs/setup');
    
    await expect(page.getByText(/setup|installation/i)).toBeVisible();
  });

  test('should display architecture docs', async ({ page }) => {
    await page.goto('/de/docs/architecture');
    
    await expect(page.getByText(/architektur|architecture/i)).toBeVisible();
  });

  test('should display API docs page', async ({ page }) => {
    await page.goto('/de/api-docs');
    
    await expect(page.getByRole('heading', { name: /api/i })).toBeVisible();
    await expect(page.getByText(/pois|audits/i)).toBeVisible();
  });

  test('should show API endpoints', async ({ page }) => {
    await page.goto('/de/api-docs');
    
    // Check for endpoint listings
    await expect(page.getByText(/\/pois/i)).toBeVisible();
    await expect(page.getByText(/GET|POST/i)).toBeVisible();
  });
});
