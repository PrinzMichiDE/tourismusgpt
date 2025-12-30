import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
  test('should display Impressum page in German', async ({ page }) => {
    await page.goto('/de/impressum');
    
    await expect(page.getByRole('heading', { name: /impressum/i })).toBeVisible();
    await expect(page.getByText(/LDB-DataGuard GmbH/i)).toBeVisible();
    await expect(page.getByText(/TMG/i)).toBeVisible();
  });

  test('should display Legal Notice page in English', async ({ page }) => {
    await page.goto('/en/impressum');
    
    await expect(page.getByRole('heading', { name: /legal notice/i })).toBeVisible();
    await expect(page.getByText(/LDB-DataGuard GmbH/i)).toBeVisible();
  });

  test('should display Datenschutz page in German', async ({ page }) => {
    await page.goto('/de/datenschutz');
    
    await expect(page.getByRole('heading', { name: /datenschutzerklärung/i })).toBeVisible();
    await expect(page.getByText(/DSGVO|personenbezogene/i)).toBeVisible();
  });

  test('should display Privacy Policy page in English', async ({ page }) => {
    await page.goto('/en/datenschutz');
    
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
    await expect(page.getByText(/GDPR|personal data/i)).toBeVisible();
  });

  test('should have back navigation', async ({ page }) => {
    await page.goto('/de/impressum');
    
    const backButton = page.getByRole('link', { name: /zurück|back/i });
    await expect(backButton).toBeVisible();
    
    await backButton.click();
    await expect(page).toHaveURL(/dashboard/);
  });
});
