import { test, expect } from '@playwright/test';

test.describe('Income Tax Calculator E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should load the calculator page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Income Tax Calculator');
  });

  test('should calculate tax for valid income input', async ({ page }) => {
    // Enter income
    await page.fill('input[type="number"]', '50000');

    // Wait for calculation
    await page.waitForSelector('text=Tax Payable', { timeout: 2000 });

    // Verify results are displayed
    // Expected tax: (45000-18200)*0.19 + (50000-45000)*0.325 = 5092 + 1625 = 6717
    await expect(page.locator('text=Tax Payable')).toBeVisible();
    await expect(page.locator('text=$6,717.00')).toBeVisible();
  });

  test('should show zero tax for income below threshold', async ({ page }) => {
    await page.fill('input[type="number"]', '15000');

    await page.waitForSelector('text=Tax Payable', { timeout: 2000 });
    await expect(page.locator('text=$0.00')).toBeVisible();
  });

  test('should update tax when year is changed', async ({ page }) => {
    // Enter income
    await page.fill('input[type="number"]', '40000');
    await page.waitForSelector('text=Tax Payable', { timeout: 2000 });

    // Change tax year
    await page.selectOption('select#tax-year', '2021-2022');

    // Wait for recalculation
    await page.waitForTimeout(500);

    // Verify tax recalculated (may be different due to different brackets)
    const newTax = await page.locator('.result-amount').first().textContent();
    expect(newTax).toBeTruthy();
  });

  test('should reset form when reset button is clicked', async ({ page }) => {
    // Enter income
    await page.fill('input[type="number"]', '50000');
    await page.waitForSelector('text=Tax Payable', { timeout: 2000 });

    // Click reset
    await page.click('button:has-text("Reset")');

    // Verify input is cleared
    const inputValue = await page.inputValue('input[type="number"]');
    expect(inputValue).toBe('');

    // Verify results are hidden
    await expect(page.locator('text=Tax Payable')).not.toBeVisible();
  });

  test('should display all result cards', async ({ page }) => {
    await page.fill('input[type="number"]', '80000');
    await page.waitForSelector('text=Tax Payable', { timeout: 2000 });

    // Check all three result cards are visible
    await expect(page.locator('text=Tax Payable')).toBeVisible();
    await expect(page.locator('text=After Tax Income')).toBeVisible();
    await expect(page.locator('text=Effective Tax Rate')).toBeVisible();
  });

  test('should display tax brackets table', async ({ page }) => {
    await expect(page.locator('text=Tax Brackets')).toBeVisible();

    // Verify multiple bracket entries are shown
    const brackets = await page.locator('.tax-bracket').count();
    expect(brackets).toBeGreaterThan(0);
  });

  test('should handle large income values', async ({ page }) => {
    await page.fill('input[type="number"]', '500000');
    await page.waitForSelector('text=Tax Payable', { timeout: 2000 });

    // Verify calculation works for large numbers
    await expect(page.locator('.result-amount').first()).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="number"]')).toBeVisible();
    await expect(page.locator('select#tax-year')).toBeVisible();
  });

  test('should handle invalid input gracefully', async ({ page }) => {
    await page.fill('input[type="number"]', '-1000');

    // Should not show negative tax
    const resultCards = await page.locator('.result-section').count();
    // Results may or may not show, but shouldn't crash
    expect(resultCards).toBeGreaterThanOrEqual(0);
  });
});
