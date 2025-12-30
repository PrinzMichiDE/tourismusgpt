import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/de/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /anmelden|login/i })).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByLabel(/passwort|password/i)).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.getByRole('button', { name: /anmelden|login/i }).click();
    
    // Wait for validation messages
    await expect(page.getByText(/erforderlich|required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/e-mail/i).fill('invalid@example.com');
    await page.getByLabel(/passwort|password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /anmelden|login/i }).click();
    
    // Wait for error message
    await expect(page.getByText(/ungültig|invalid|fehler|error/i)).toBeVisible({ timeout: 10000 });
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.getByLabel(/e-mail/i).fill('admin@ldb-dataguard.de');
    await page.getByLabel(/passwort|password/i).fill('admin123');
    await page.getByRole('button', { name: /anmelden|login/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('should support language switching', async ({ page }) => {
    // Navigate to English version
    await page.goto('/en/login');
    
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
  });
});
