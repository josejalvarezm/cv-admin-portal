import { test } from '@playwright/test';

/**
 * 🧪 Production Manual Test - UnicornScript
 * 
 * This test goes DIRECTLY to production, handles Zero Trust auth inline,
 * then fills the form with fake data.
 * 
 * Run with:
 *   npx playwright test tests/prod-unicorn.spec.ts --headed
 */

const FAKE_TECH = {
    name: 'UnicornScript 3000',
    category: 'Backend Development',
    experience: 'Cast rainbow spells to deploy serverless magic',
    summary: 'A mythical language powered by fairy dust and dreams',
    action: 'Conjured sparkly microservices that grant wishes',
    effect: 'Bugs became too scared to appear in production',
    outcome: 'Achieved 1000% uptime (yes, more than 100%)',
};

test('🦄 Production: Add UnicornScript 3000', async ({ page }) => {
    // Go directly to production
    await page.goto('https://admin.{YOUR_DOMAIN}/d1cv/technologies/new');

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🔐 ZERO TRUST LOGIN                                       ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  If you see the login page:                                ║
║  1. Enter email: {YOUR_EMAIL}                  ║
║  2. Check email for OTP                                    ║
║  3. Enter OTP                                              ║
║  4. Click RESUME in the Inspector when you see the form    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    // Pause so user can complete Zero Trust login if needed
    await page.pause();

    // Now we should be on the form - fill it
    await page.getByLabel(/name/i).fill(FAKE_TECH.name);

    await page.getByLabel(/category/i).first().click();
    await page.getByRole('option', { name: FAKE_TECH.category }).click();

    const expField = page.getByLabel(/experience/i).first();
    if (await expField.isVisible()) {
        await expField.fill(FAKE_TECH.experience);
    }

    // Expand AI section
    const aiHeader = page.getByText('🤖 AI Enrichment');
    if (await aiHeader.isVisible()) {
        await aiHeader.click();
        await page.waitForTimeout(300);
    }

    await page.getByLabel(/summary/i).fill(FAKE_TECH.summary);
    await page.getByLabel(/action/i).fill(FAKE_TECH.action);
    await page.getByLabel(/effect/i).fill(FAKE_TECH.effect);
    await page.getByLabel(/outcome/i).fill(FAKE_TECH.outcome);

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🦄 UnicornScript 3000 - FORM FILLED!                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  NEXT STEPS:                                               ║
║  1. Click "Stage Changes"                                  ║
║  2. Navigate to Staged Changes                             ║
║  3. Create a commit                                        ║
║  4. Push to D1CV / AI Agent                               ║
║                                                            ║
║  Click RESUME when done testing                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    // Pause again so user can complete the workflow
    await page.pause();
});
