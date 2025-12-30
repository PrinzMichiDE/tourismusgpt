import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  // Skip auth for now - these tests assume mock data or no auth required
  test.beforeEach(async ({ page }) => {
    await page.goto('/de/dashboard');
  });

  test('should display dashboard with metrics cards', async ({ page }) => {
    await expect(page.getByText(/dashboard/i)).toBeVisible();
    
    // Check for metrics cards
    await expect(page.getByText(/pois|punkte/i)).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    // Check sidebar links
    await expect(page.getByRole('link', { name: /datenfelder|data fields/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /zeitpläne|schedules/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /berichte|reports/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /kosten|costs/i })).toBeVisible();
  });

  test('should navigate to fields page', async ({ page }) => {
    await page.getByRole('link', { name: /datenfelder|data fields/i }).click();
    
    await expect(page).toHaveURL(/fields/);
    await expect(page.getByRole('heading', { name: /datenfelder|data fields/i })).toBeVisible();
  });

  test('should navigate to schedules page', async ({ page }) => {
    await page.getByRole('link', { name: /zeitpläne|schedules/i }).click();
    
    await expect(page).toHaveURL(/schedules/);
    await expect(page.getByRole('heading', { name: /zeitpläne|schedules/i })).toBeVisible();
  });

  test('should navigate to costs page', async ({ page }) => {
    await page.getByRole('link', { name: /kosten|costs/i }).click();
    
    await expect(page).toHaveURL(/costs/);
    await expect(page.getByRole('heading', { name: /kosten|costs/i })).toBeVisible();
  });

  test('should navigate to reports page', async ({ page }) => {
    await page.getByRole('link', { name: /berichte|reports/i }).click();
    
    await expect(page).toHaveURL(/reports/);
    await expect(page.getByRole('heading', { name: /berichte|reports/i })).toBeVisible();
  });

  test('should navigate to users page', async ({ page }) => {
    await page.getByRole('link', { name: /benutzer|users/i }).click();
    
    await expect(page).toHaveURL(/users/);
    await expect(page.getByRole('heading', { name: /benutzerverwaltung|user management/i })).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.getByRole('link', { name: /einstellungen|settings/i }).click();
    
    await expect(page).toHaveURL(/settings/);
    await expect(page.getByRole('heading', { name: /einstellungen|settings/i })).toBeVisible();
  });
});
