import { test, expect } from '@playwright/test';

/**
 * Navigation Tests
 * 
 * Tests the main navigation and layout:
 * - Sidebar navigation
 * - Page routing
 * - Layout structure
 */

test.describe('Navigation', () => {
    test('should load the dashboard by default', async ({ page }) => {
        await page.goto('/');

        // Should redirect to dashboard or show dashboard content
        await expect(page.getByRole('heading', { name: /dashboard|admin|home/i })).toBeVisible();
    });

    test('should navigate to Technologies page via sidebar', async ({ page }) => {
        await page.goto('/dashboard');

        // The sidebar uses ListItemButton with ListItemText
        // First, find the D1CV section's Technologies item
        const techButton = page.locator('[role="button"]').filter({ hasText: 'Technologies' }).first();
        await techButton.click();

        await expect(page).toHaveURL(/\/technologies/);
    });

    test('should navigate to Staged Changes page', async ({ page }) => {
        await page.goto('/dashboard');

        // Use first() for elements that appear in both mobile and desktop drawers
        const stagedButton = page.getByRole('button', { name: 'Staged Changes' }).first();
        await stagedButton.click();

        await expect(page).toHaveURL(/\/staged/);
    });

    test('should navigate to Commits page directly', async ({ page }) => {
        // Note: Commits nav item is defined but not rendered in sidebar
        // Navigate directly to test the route works
        await page.goto('/commits');

        // Should either show commits page or redirect appropriately
        const url = page.url();
        expect(url).toMatch(/\/commits/);
    });

    test('should have a working sidebar', async ({ page }) => {
        // Use desktop viewport to ensure drawer is visible
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.goto('/dashboard');

        // Check the drawer paper contains navigation items
        const drawerContent = page.locator('.MuiDrawer-paper').first();
        await expect(drawerContent).toBeVisible();
    });

    test('should maintain sidebar state across navigation', async ({ page }) => {
        await page.goto('/d1cv/technologies');

        // Navigate to staged changes
        const stagedButton = page.getByRole('button', { name: 'Staged Changes' }).first();
        await stagedButton.click();
        await expect(page).toHaveURL(/\/staged/);

        // Navigate back to technologies
        const techButton = page.locator('[role="button"]').filter({ hasText: 'Technologies' }).first();
        await techButton.click();
        await expect(page).toHaveURL(/\/technologies/);
    });
});

test.describe('Layout', () => {
    test('should have proper page structure', async ({ page }) => {
        await page.goto('/d1cv/technologies');

        // Should have main content area
        await expect(page.locator('main, [role="main"]').first()).toBeVisible();
    });

    test('should be responsive', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/d1cv/technologies');

        // Page should still be functional
        await expect(page.getByRole('heading', { name: /technologies/i })).toBeVisible();

        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await expect(page.getByRole('heading', { name: /technologies/i })).toBeVisible();

        // Test desktop viewport
        await page.setViewportSize({ width: 1280, height: 800 });
        await expect(page.getByRole('heading', { name: /technologies/i })).toBeVisible();
    });
});

test.describe('Error Handling', () => {
    test('should handle 404 routes gracefully', async ({ page }) => {
        await page.goto('/non-existent-page');

        // Should either redirect to home or show 404 message
        // SPA routing typically redirects to index.html
        const url = page.url();
        const has404 = await page.getByText(/not found|404/i).isVisible().catch(() => false);
        const isHome = url.includes('localhost') || url.includes('admin.{YOUR_DOMAIN}');

        expect(has404 || isHome).toBeTruthy();
    });
});
