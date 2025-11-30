import { test } from '@playwright/test';

/**
 * 🧪 Manual Test Helpers with Fake Technologies
 * 
 * Pre-fills forms with NONSENSE data for testing.
 * Delete these fake entries after testing!
 * 
 * ═══════════════════════════════════════════════════════════════
 * 🚀 QUICK START COMMANDS:
 * ═══════════════════════════════════════════════════════════════
 * 
 * Add UnicornScript:
 *   npx playwright test tests/manual-helpers.spec.ts -g "UnicornScript" --headed
 * 
 * Add PizzaQL:
 *   npx playwright test tests/manual-helpers.spec.ts -g "PizzaQL" --headed
 * 
 * Add CatFramework:
 *   npx playwright test tests/manual-helpers.spec.ts -g "CatFramework" --headed
 * 
 * Learn Playwright:
 *   npx playwright test tests/manual-helpers.spec.ts -g "Tutorial" --headed
 * 
 * Record your own test:
 *   npx playwright codegen http://localhost:5173
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// ============================================================
// 🦄🍕🐱 FAKE TECHNOLOGIES - Nonsense for testing
// ============================================================
const FAKE_TECH = {
    unicorn: {
        name: 'UnicornScript 3000',
        category: 'Backend Development',
        experience: 'Cast rainbow spells to deploy serverless magic',
        summary: 'A mythical language powered by fairy dust and dreams',
        action: 'Conjured sparkly microservices that grant wishes',
        effect: 'Bugs became too scared to appear in production',
        outcome: 'Achieved 1000% uptime (yes, more than 100%)',
    },
    pizza: {
        name: 'PizzaQL',
        category: 'Database',
        experience: 'Query databases using pizza topping syntax',
        summary: 'WHERE clause is TOPPINGS, JOIN is FOLD IN HALF',
        action: 'Migrated from boring SQL to delicious PizzaQL',
        effect: 'Queries now 50% more tasty, 100% more cheesy',
        outcome: 'Team productivity up because everyone is hungry',
    },
    cat: {
        name: 'CatFramework.js',
        category: 'Frontend Development',
        experience: 'Building UIs that purr with performance',
        summary: 'Components are Kittens, state is a ball of yarn',
        action: 'Implemented meow-tifications and paw-gination',
        effect: 'Users find the interface absolutely adorable',
        outcome: 'App store rating: 5 paws out of 5',
    },
};

// ============================================================
// 🦄 ADD UNICORNSCRIPT
// ============================================================
test('🦄 Add: UnicornScript 3000', async ({ page }) => {
    await page.goto('/d1cv/technologies/new');
    await page.waitForLoadState('networkidle');

    // Fill the form
    await page.getByLabel(/name/i).fill(FAKE_TECH.unicorn.name);

    // Select category
    await page.getByLabel(/category/i).first().click();
    await page.getByRole('option', { name: FAKE_TECH.unicorn.category }).click();

    // Experience description
    const expField = page.getByLabel(/experience/i).first();
    if (await expField.isVisible()) {
        await expField.fill(FAKE_TECH.unicorn.experience);
    }

    // Expand and fill AI section
    const aiHeader = page.getByText('🤖 AI Enrichment');
    if (await aiHeader.isVisible()) {
        await aiHeader.click();
        await page.waitForTimeout(300);
    }

    await page.getByLabel(/summary/i).fill(FAKE_TECH.unicorn.summary);
    await page.getByLabel(/action/i).fill(FAKE_TECH.unicorn.action);
    await page.getByLabel(/effect/i).fill(FAKE_TECH.unicorn.effect);
    await page.getByLabel(/outcome/i).fill(FAKE_TECH.unicorn.outcome);

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🦄 UnicornScript 3000 - FORM FILLED!                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  NEXT STEPS:                                               ║
║  1. Review the form data                                   ║
║  2. Click "Stage Changes" button                           ║
║  3. Go to Staged Changes page                              ║
║  4. Create a commit                                        ║
║  5. Push to D1CV and/or AI Agent                          ║
║                                                            ║
║  The browser will stay open. Press Resume when done.       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    // PAUSE - Browser stays open for you to continue manually
    await page.pause();
});

// ============================================================
// 🍕 ADD PIZZAQL
// ============================================================
test('🍕 Add: PizzaQL', async ({ page }) => {
    await page.goto('/d1cv/technologies/new');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/name/i).fill(FAKE_TECH.pizza.name);

    await page.getByLabel(/category/i).first().click();
    await page.getByRole('option', { name: FAKE_TECH.pizza.category }).click();

    const expField = page.getByLabel(/experience/i).first();
    if (await expField.isVisible()) {
        await expField.fill(FAKE_TECH.pizza.experience);
    }

    const aiHeader = page.getByText('🤖 AI Enrichment');
    if (await aiHeader.isVisible()) {
        await aiHeader.click();
        await page.waitForTimeout(300);
    }

    await page.getByLabel(/summary/i).fill(FAKE_TECH.pizza.summary);
    await page.getByLabel(/action/i).fill(FAKE_TECH.pizza.action);

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🍕 PizzaQL - FORM FILLED!                                 ║
╠════════════════════════════════════════════════════════════╣
║  Click "Stage Changes" to continue the workflow            ║
╚════════════════════════════════════════════════════════════╝
  `);

    await page.pause();
});

// ============================================================
// 🐱 ADD CATFRAMEWORK
// ============================================================
test('🐱 Add: CatFramework.js', async ({ page }) => {
    await page.goto('/d1cv/technologies/new');
    await page.waitForLoadState('networkidle');

    await page.getByLabel(/name/i).fill(FAKE_TECH.cat.name);

    await page.getByLabel(/category/i).first().click();
    await page.getByRole('option', { name: FAKE_TECH.cat.category }).click();

    const expField = page.getByLabel(/experience/i).first();
    if (await expField.isVisible()) {
        await expField.fill(FAKE_TECH.cat.experience);
    }

    const aiHeader = page.getByText('🤖 AI Enrichment');
    if (await aiHeader.isVisible()) {
        await aiHeader.click();
        await page.waitForTimeout(300);
    }

    await page.getByLabel(/summary/i).fill(FAKE_TECH.cat.summary);

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🐱 CatFramework.js - FORM FILLED!                         ║
╠════════════════════════════════════════════════════════════╣
║  Click "Stage Changes" to continue the workflow            ║
╚════════════════════════════════════════════════════════════╝
  `);

    await page.pause();
});

// ============================================================
// 📋 STAGED CHANGES PAGE
// ============================================================
test('📋 Open: Staged Changes', async ({ page }) => {
    await page.goto('/staged');
    await page.waitForLoadState('networkidle');

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  📋 STAGED CHANGES PAGE                                    ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Here you can:                                             ║
║  • Review all staged changes                               ║
║  • Create a commit with a message                          ║
║  • Discard individual changes                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    await page.pause();
});

// ============================================================
// 📦 COMMITS PAGE
// ============================================================
test('📦 Open: Commits', async ({ page }) => {
    await page.goto('/commits');
    await page.waitForLoadState('networkidle');

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  📦 COMMITS PAGE                                           ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Here you can:                                             ║
║  • View commit history                                     ║
║  • Push commits to D1CV (Portfolio)                        ║
║  • Push commits to AI Agent                                ║
║  • Rollback if needed                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    await page.pause();
});

// ============================================================
// 🎓 PLAYWRIGHT TUTORIAL
// ============================================================
test('🎓 Tutorial: Learn Playwright Inspector', async ({ page }) => {
    await page.goto('/d1cv/technologies/new');

    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎓 PLAYWRIGHT INSPECTOR TUTORIAL                          ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  The Inspector window is now open. Here's how to use it:   ║
║                                                            ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ 🎯 PICK LOCATOR (target icon)                       │   ║
║  │    Click it, then click any element on the page     │   ║
║  │    → Shows you the locator code for that element    │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                            ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ ▶️  STEP OVER                                        │   ║
║  │    Execute one line of code at a time               │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                            ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ 📝 CONSOLE (bottom of inspector)                    │   ║
║  │    Type commands directly, like:                    │   ║
║  │    await page.getByLabel('Name').fill('Test')       │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                            ║
║  TRY IT: Click Pick Locator → Click the Name field         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    await page.pause();
});

test('🎬 Tutorial: Record Tests with Codegen', async ({ page }) => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎬 RECORD TESTS AUTOMATICALLY                             ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Instead of writing locators manually, RECORD them!        ║
║                                                            ║
║  Open a NEW terminal and run:                              ║
║  ─────────────────────────────────────────────────────────║
║                                                            ║
║    npx playwright codegen http://localhost:5173            ║
║                                                            ║
║  ─────────────────────────────────────────────────────────║
║                                                            ║
║  This opens TWO windows:                                   ║
║  1. Browser - perform actions here (click, type, etc)      ║
║  2. Inspector - watch code generate automatically!         ║
║                                                            ║
║  Just interact with the page and copy the generated code   ║
║  into your test files.                                     ║
║                                                            ║
║  Press Resume to close this test.                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    await page.goto('/dashboard');
    await page.pause();
});
