/**
 * Vitest Setup File
 * 
 * This file runs before all tests and sets up the testing environment.
 */

import { vi } from 'vitest';

// Mock import.meta.env for tests
vi.stubGlobal('import', {
    meta: {
        env: {
            VITE_API_URL: 'http://localhost:8787/api',
            DEV: true,
            PROD: false,
            MODE: 'test',
        },
    },
});

// Mock fetch globally
global.fetch = vi.fn();

// Reset mocks between tests
beforeEach(() => {
    vi.clearAllMocks();
});
