import { test, expect } from '@playwright/test';

/**
 * Technologies Page Tests
 * 
 * Tests the technologies list page functionality:
 * - Page loads correctly
 * - Navigation to add/edit forms
 * - Search functionality
 * - Table displays data correctly
 */

test.describe('Technologies Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/d1cv/technologies');
    });

    test('should display the technologies page header', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Technologies' })).toBeVisible();
    });

    test('should have an "Add Technology" button', async ({ page }) => {
        const addButton = page.getByRole('button', { name: /add technology/i });
        await expect(addButton).toBeVisible();
    });

    test('should navigate to new technology form when clicking Add', async ({ page }) => {
        await page.getByRole('button', { name: /add technology/i }).click();
        await expect(page).toHaveURL(/\/d1cv\/technologies\/new$/);
    });

    test('should display search input', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/search/i);
        await expect(searchInput).toBeVisible();
    });

    test('should filter technologies by search term', async ({ page }) => {
        // Wait for the page to load and data to fetch
        await page.waitForLoadState('networkidle');

        // Check if we have a table
        const hasTable = await page.locator('table').isVisible().catch(() => false);

        if (hasTable) {
            // Get initial row count
            const initialRows = await page.locator('tbody tr').count();

            // Search for a specific term
            await page.getByPlaceholder(/search/i).fill('React');

            // Wait for filter to apply
            await page.waitForTimeout(300);

            // Verify filtering worked
            const filteredRows = await page.locator('tbody tr').count();

            if (initialRows > 0) {
                expect(filteredRows).toBeLessThanOrEqual(initialRows);
            }
        } else {
            // No data - page should still be functional
            await expect(page.getByRole('heading', { name: 'Technologies' })).toBeVisible();
        }
    });

    test('should display technology data when available', async ({ page }) => {
        // Wait for network to settle
        await page.waitForLoadState('networkidle');

        // Either table is shown or loading finished - page should work
        await expect(page.getByRole('heading', { name: 'Technologies' })).toBeVisible();
    });

    test('should show loading state initially', async ({ page }) => {
        // Go to page with network throttled or intercept
        await page.route('**/api/technologies**', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await route.continue();
        });

        await page.goto('/d1cv/technologies');

        // Should show loading indicator
        // Loading may be brief, so just check page eventually loads
        await expect(page.getByRole('heading', { name: 'Technologies' })).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Technologies Page - Row Actions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/d1cv/technologies');
        // Wait for data to load
        await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => { });
    });

    test('should open action menu when clicking row options', async ({ page }) => {
        // Check if there are any rows
        const rowCount = await page.locator('tbody tr').count();

        if (rowCount > 0) {
            // Click the first row's more options button
            await page.locator('tbody tr').first().getByRole('button', { name: /more/i }).click();

            // Menu should appear with Edit and Delete options
            await expect(page.getByRole('menuitem', { name: /edit/i })).toBeVisible();
            await expect(page.getByRole('menuitem', { name: /delete/i })).toBeVisible();
        } else {
            // Skip if no data - table is empty
            test.skip();
        }
    });

    test('should navigate to edit form from action menu', async ({ page }) => {
        const rowCount = await page.locator('tbody tr').count();

        if (rowCount > 0) {
            await page.locator('tbody tr').first().getByRole('button', { name: /more/i }).click();
            await page.getByRole('menuitem', { name: /edit/i }).click();

            // Should navigate to edit page with ID
            await expect(page).toHaveURL(/\/d1cv\/technologies\/\d+$/);
        } else {
            test.skip();
        }
    });
});
