# CV Admin Portal - CI/CD & Testing Architecture

**Project:** cv-admin-portal-private (React Admin Dashboard)  
**Framework:** React 19 with TypeScript  
**Deployment Target:** Cloudflare Pages  
**Last Updated:** December 4, 2025

## Architecture Overview

This document outlines the continuous integration, testing, and deployment strategy for the CV admin portal—a critical tool for managing CV data with real-time updates.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React | 19 |
| **Language** | TypeScript | 5.7+ |
| **Test Runner** | Vitest | Latest |
| **Build Tool** | Vite | Latest |
| **CI/CD** | GitHub Actions | — |
| **Deployment** | Cloudflare Pages | — |
| **E2E Testing** | Playwright | Latest (local dev only) |

## Testing Strategy

### Unit Tests
- **Framework:** Vitest
- **Count:** 48 tests
- **Scope:** Component rendering, hooks, utilities, state management
- **Execution:** `npm run test`
- **Coverage Target:** >75% statements

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,  // Enable global test APIs (describe, it, expect)
    environment: 'jsdom',  // Browser-like environment
    setupFiles: ['tests/unit/vitest-setup.ts']
  },
  // ...
});
```

### Why Vitest (Not Jest)?
- **Speed:** 5-10x faster than Jest
- **ESM support:** Native ES modules without transpilation
- **Vite integration:** Reuses Vite config, faster HMR
- **Modern:** Built for modern testing patterns

### E2E Tests: Local Only

**Status:** Playwright tests available but NOT in CI/CD  
**Reason:** Requires live API backend to test admin operations  
**Solution:** Run locally before commits, skip in pipeline

```bash
# Local development
npm run test:e2e

# CI/CD (skipped)
# Pipeline only runs: npm run test (unit tests)
```

## CI/CD Pipeline

### Workflow: `ci-cd.yml`

```
Trigger: Push to main branch
│
├─ Job: Lint (ESLint)
│  └─ Runs: npm run lint
│  └─ Blocks: Yes (fails deployment if errors)
│
├─ Job: Lint & Unit Tests
│  ├─ Runs: npm run test
│  └─ Reports: Coverage summary
│
├─ Job: Build
│  ├─ Runs: npm run build
│  └─ Output: dist/
│
└─ Job: Deploy to Cloudflare Pages
   ├─ Triggered: Only if build succeeds
   └─ Secrets: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
```

### Critical Pipeline Decisions

| Decision | Rationale | Implementation |
|----------|-----------|-----------------|
| **ESLint blocks deploy** | Portal manages sensitive CV data; code quality non-negotiable | Job fails on any lint error |
| **Unit tests required** | Guards against state management bugs, hook failures | Must pass before build |
| **No E2E in CI** | Admin portal requires authenticated API calls | E2E removed from workflow |
| **Build as separate job** | Catches bundling errors early | Only builds if lint+test pass |

## Build & Deployment

### Build Process
```bash
npm run build
# Output: dist/
# Source maps: Included for debugging
```

### Cloudflare Pages Configuration
- **Project:** `cv-admin-portal-private`
- **Branch:** main
- **Build command:** `npm run build`
- **Output directory:** `dist/`
- **Environment:** Production (behind authentication)

### Deployment Security
- **API Token:** `CLOUDFLARE_API_TOKEN` (limited Pages scope)
- **Account ID:** `CLOUDFLARE_ACCOUNT_ID`
- **Access:** Protected by Cloudflare Zero Trust with email/PIN

## Vitest Setup Architecture

### Separation of Concerns

**File:** `tests/unit/vitest-setup.ts` (NOT `tests/setup.ts`)

```typescript
// Reason: Prevents conflicts with Playwright's expect() extension
// Playwright also tries to extend expect, causing globals collision

import { expect, afterEach } from 'vitest';
// ... test setup code
```

**Why This Matters:**
- Vitest with `globals: true` automatically extends `expect`
- Playwright also extends `expect` for async matchers
- Having setup in `tests/setup.ts` caused both to fight over the same object
- Moving to `tests/unit/vitest-setup.ts` keeps unit test setup isolated
- E2E tests use separate Playwright config

## Common Issues & Solutions

### Switch Statement Lint Errors (no-case-declarations)

**Problem:** Variables declared in case blocks hoist unexpectedly

```typescript
// ❌ ESLint error
case 'high':
  const priority = 'urgent';
  break;

// ✅ Fixed with braces
case 'high': {
  const priority = 'urgent';
  break;
}
```

**Implementation:** Applied to 2 files in this project
- `src/pages/ai-agent/TechnologiesPage.tsx`
- `src/pages/d1cv/TechnologiesPage.tsx`

### Tests Fail: Vitest & Playwright Conflict

**Cause:** Both trying to extend global `expect` object  
**Fix:** Ensure vitest setup is in `tests/unit/vitest-setup.ts`, not root `tests/setup.ts`

### Deployment Shows 404

**Cause:** Incorrect routing in production build  
**Fix:** Verify `vite.config.ts` has correct `base` path for Cloudflare Pages

## Performance & Bundle Size

- **Target:** <150kB initial JS (gzip)
- **Monitoring:** Check dist/ folder size after build
- **Optimization:** Code-split pages using React.lazy()

## Related Documentation

- [REALTIME_PUSH_ARCHITECTURE.md](../docs/REALTIME_PUSH_ARCHITECTURE.md) — WebSocket design
- [ACCESSIBILITY_AUDIT.md](../ACCESSIBILITY_AUDIT.md) — WCAG compliance
- [Vite deployment guide](https://vitejs.dev/guide/ssr.html)
