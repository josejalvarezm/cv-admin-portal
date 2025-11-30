import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, '../.auth/user.json');

/**
 * Zero Trust Authentication Setup
 * 
 * This runs before production tests to authenticate with Cloudflare Zero Trust.
 * The authentication state is saved and reused across all tests.
 * 
 * For CI/CD, you can either:
 * 1. Use a service token (recommended)
 * 2. Pre-generate the auth state locally and commit it (less secure)
 */
setup('authenticate', async ({ page }) => {
    // Check if we already have valid auth state
    if (fs.existsSync(authFile)) {
        const authState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
        const cookies = authState.cookies || [];

        // Check if CF_Authorization cookie exists and is not expired
        const cfAuthCookie = cookies.find((c: { name: string }) => c.name === 'CF_Authorization');
        if (cfAuthCookie && cfAuthCookie.expires > Date.now() / 1000) {
            console.log('✅ Using existing authentication state (not expired)');
            return;
        }
    }

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🔐 ZERO TRUST AUTHENTICATION REQUIRED                     ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  1. Enter your email: {YOUR_EMAIL}             ║
║  2. Check your email for the OTP code                      ║
║  3. Enter the OTP in the browser                           ║
║  4. Once you see the Admin Portal, click RESUME            ║
║     in the Playwright Inspector                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);

    // Navigate to trigger Zero Trust authentication
    await page.goto('https://admin.{YOUR_DOMAIN}');

    // PAUSE - Wait for user to complete OTP authentication manually
    // Click "Resume" in the Playwright Inspector after logging in
    await page.pause();

    // Verify we're now on the admin portal
    const url = page.url();
    if (!url.includes('admin.{YOUR_DOMAIN}') || url.includes('cloudflareaccess')) {
        throw new Error('Authentication failed - still on login page');
    }

    // Ensure auth directory exists
    const authDir = path.dirname(authFile);
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }

    // Save authentication state
    await page.context().storageState({ path: authFile });
    console.log(`✅ Authentication state saved to ${authFile}`);
});
