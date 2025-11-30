import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Playwright configuration for CV Admin Portal
 * 
 * Supports two modes:
 * 1. Local development: Tests against localhost:5173
 * 2. Production: Tests against admin.{YOUR_DOMAIN} (requires Zero Trust auth)
 * 
 * Usage:
 *   npm run test:e2e              # Run against local dev server
 *   npm run test:e2e:prod         # Run against production (requires auth setup)
 *   npm run test:e2e:ui           # Open Playwright UI mode
 */

const isProduction = process.env.TEST_ENV === 'production';
const baseURL = isProduction
  ? 'https://admin.{YOUR_DOMAIN}'
  : 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  /* Test timeout */
  timeout: 30_000,

  /* Shared settings for all projects */
  use: {
    baseURL,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'on-first-retry',
  },

  /* Configure projects */
  projects: [
    // Setup project for authentication (production only)
    ...(isProduction ? [{
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    }] : []),

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use authenticated state for production tests
        ...(isProduction && {
          storageState: path.join(__dirname, '.auth/user.json'),
        }),
      },
      dependencies: isProduction ? ['setup'] : [],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...(isProduction && {
          storageState: path.join(__dirname, '.auth/user.json'),
        }),
      },
      dependencies: isProduction ? ['setup'] : [],
    },

    // Only run WebKit locally (faster CI)
    ...(!process.env.CI ? [{
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        ...(isProduction && {
          storageState: path.join(__dirname, '.auth/user.json'),
        }),
      },
      dependencies: isProduction ? ['setup'] : [],
    }] : []),
  ],

  /* Run local dev server before starting tests */
  ...(!isProduction && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  }),
});
