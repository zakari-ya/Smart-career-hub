import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display the main hero section', async ({ page }) => {
    // Assuming the app runs on localhost:5173
    await page.goto('http://localhost:5173/');
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Smart Career Hub');
    await expect(page.locator('text=Elevate Your Career')).toBeVisible();

    // Check for CTA buttons
    const getStartedBtn = page.locator('text=Get Started');
    await expect(getStartedBtn).toBeVisible();
    await expect(getStartedBtn).toHaveAttribute('href', '/dashboard');

    const guestModeBtn = page.locator('text=Try Guest Mode');
    await expect(guestModeBtn).toBeVisible();
    await expect(guestModeBtn).toHaveAttribute('href', '/resume-scanner');
  });

  test('should navigate to sign-in when clicking Get Started', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.click('text=Get Started');
    
    // Assuming Clerk will redirect to /sign-in
    await expect(page).toHaveURL(/.*sign-in.*/);
  });
});
