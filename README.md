# CV Admin Portal

> Admin interface for managing CV data across D1CV and cv-ai-agent databases.

## Project Labels

| Attribute | Value |
|-----------|-------|
| **Project Name** | `cv-admin-portal` |
| **Type** | React SPA |
| **Framework** | React 18 + MUI (Material UI) |
| **Build Tool** | Vite |
| **Deployment** | Cloudflare Pages |
| **Protected By** | Cloudflare Zero Trust |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
cv-admin-portal/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/       # Reusable UI components
│   │   └── Layout.tsx    # Main layout with navigation
│   ├── hooks/            # React Query hooks
│   │   ├── useTechnologies.ts
│   │   ├── useStagedChanges.ts
│   │   └── useSimilarityCheck.ts
│   ├── pages/            # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── TechnologiesPage.tsx
│   │   ├── TechnologyFormPage.tsx
│   │   ├── StagedChangesPage.tsx
│   │   └── SettingsPage.tsx
│   ├── services/         # API client
│   │   └── api.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Root component with routes
│   ├── main.tsx          # Entry point
│   └── theme.ts          # MUI theme configuration
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Related Projects

| Project | Purpose | URL |
|---------|---------|-----|
| `cv-admin-worker` | Backend API | `api.admin.{YOUR_DOMAIN}` |
| `D1CV` | Portfolio data API | `api.d1.worker.{YOUR_DOMAIN}` |
| `cv-ai-agent` | AI chatbot backend | `cv-ai-agent.{YOUR_DOMAIN}` |

## Authentication

Protected by Cloudflare Zero Trust. Access requires:
- PIN/Email authentication
- Allowed email: `{YOUR_EMAIL}`

## Features

✓ Dashboard with quick stats
✓ Technology CRUD with form
✓ AI enrichment fields (summary, action, effect, outcome)
✓ Similarity check before adding technologies
✓ Staged changes queue (Git-like workflow)
✓ Separate D1CV and AI sync queues
✓ Progress tracking for AI sync

## Development

### Prerequisites

- Node.js 18+
- npm 9+

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### Proxy Configuration

In development, API calls are proxied to `localhost:8787` (cv-admin-worker dev server).

## Deployment

Deployed to Cloudflare Pages:

```bash
npm run build
npx wrangler pages deploy dist --project-name=cv-admin-portal
```

## Architecture

See [CV Admin Portal Architecture](../D1CV/docs/CV_ADMIN_PORTAL_ARCHITECTURE.md) for full documentation.
