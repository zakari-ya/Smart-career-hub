import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the main hero section', async ({ page }) => {
    // Assuming the app runs on localhost:5173
    await page.goto('http://localhost:5173/');
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Build a career that');
    await expect(page.locator('text=Smart tools to audit your resume')).toBeVisible();

    // Check for CTA buttons
    const getStartedBtn = page.locator('text=Start Building');
    await expect(getStartedBtn).toBeVisible();
    await expect(getStartedBtn).toHaveAttribute('href', '/resume-scanner');

    const guestModeBtn = page.locator('text=Try Guest Mode');
    await expect(guestModeBtn).toBeVisible();
    await expect(guestModeBtn).toHaveAttribute('href', '/resume-scanner?guest=true');
  });

  test('should navigate to sign-in when clicking Start Building', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.click('text=Start Building');
    
    await expect(page).toHaveURL(/.*sign-in.*/);
  });
});
