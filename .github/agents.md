# CV Admin Portal - Copilot Agent Instructions

## Project Overview

**cv-admin-portal** is a React SPA that provides an admin interface for managing CV data across D1CV and cv-ai-agent databases. It communicates with `cv-admin-worker` as its backend API.

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **UI Library**: Material UI (MUI) v6
- **State Management**: TanStack Query (React Query) + Zustand
- **Forms**: React Hook Form
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Cloudflare Pages

### Project Structure

```
src/
├── components/
│   ├── index.ts              # Barrel export
│   ├── Layout.tsx            # Main layout with navigation
│   └── technology/
│       ├── AIEnrichmentSection.tsx
│       ├── PortfolioDataSection.tsx
│       └── SimilarTechAlert.tsx
├── hooks/
│   ├── index.ts              # Barrel export
│   ├── useD1CV.ts            # D1CV data operations
│   ├── useAIAgent.ts         # AI Agent operations
│   ├── useStagedChanges.ts   # Staging workflow
│   ├── useTechnologies.ts    # Legacy technology hooks
│   └── useSimilarityCheck.ts # Duplicate detection
├── pages/
│   ├── DashboardPage.tsx
│   ├── d1cv/
│   │   ├── TechnologiesPage.tsx
│   │   └── TechnologyFormPage.tsx
│   ├── ai-agent/
│   │   ├── TechnologiesPage.tsx
│   │   └── TechnologyDetailPage.tsx
│   └── StagedChangesPage.tsx
├── services/
│   ├── api.ts                # API client
│   └── ApiContext.tsx        # DI container
├── types/
│   ├── index.ts
│   └── technology.ts
├── constants/
│   └── formOptions.ts
├── utils/
│   └── sanitize.ts           # OWASP input sanitization
├── App.tsx
├── main.tsx
└── theme.ts
```

## Key Patterns

### SOLID Principles Applied

1. **SRP**: Each hook has one job (e.g., `useStageTechnology` only stages)
2. **OCP**: Form sections are separate components
3. **ISP**: Separate interfaces for D1CV and AI data
4. **DIP**: API client injected via context

### Hook Pattern

```typescript
// src/hooks/useD1CV.ts
export function useUnifiedTechnology(name: string | undefined) {
  return useQuery({
    queryKey: ['unified', 'technology', name],
    queryFn: async () => {
      const response = await apiClient.get(`/api/technology/unified/${name}`);
      // Transform response...
      return { technology, source, staged };
    },
    enabled: !!name,
  });
}
```

### Form Data Flow

1. `useUnifiedTechnology` fetches data from all sources (supports `aiId` param for direct lookup)
2. `useEffect` populates form fields from response
3. `useStageTechnology` or `useUpdateStagedTechnology` saves changes

### AI Enrichment Handling

When navigating from the grid with an AI match, `aiId` is passed as a query parameter to skip fuzzy matching:
```typescript
navigate(`/d1cv/technologies/${row.id}?aiId=${row.aiId}`);
```

When editing a technology with AI match data:
```typescript
// IMPORTANT: Populate ALL fields (even empty ones)
if (technology.hasAiMatch && technology.aiMatch) {
  const aiData = technology.aiMatch;
  setValue('summary', aiData.summary ?? '');  // Use ?? not ||
  setValue('action', aiData.action ?? '');
  setValue('effect', aiData.effect ?? '');
  setValue('outcome', aiData.outcome ?? '');
  // ... etc
}
```

**Bug Fixed (v1.4.1)**: Previously used falsy checks (`if (aiData.summary)`) which failed for empty strings.

## Environment Configuration

```env
# .env.local (development)
VITE_API_URL=http://localhost:8787

# .env.production
VITE_API_URL=https://api.admin.{YOUR_DOMAIN}
```

## Common Operations

### Development

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

### Build and Deploy

```powershell
# Build for production
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

### Adding a New Page

1. Create page component in `src/pages/`:
```typescript
export function MyPage() {
  const { data, isLoading } = useMyData();
  // ...
}
```

2. Add route in `App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

3. Add navigation in `Layout.tsx`

### Adding a New Hook

1. Create hook in `src/hooks/`:
```typescript
export function useMyData() {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: () => apiClient.get('/api/my-endpoint'),
  });
}
```

2. Export from `src/hooks/index.ts`

## Data Types

### Technology Form Data
```typescript
interface TechnologyFormData {
  // D1CV fields
  name: string;
  category: string;
  experience: string;
  experience_years: number;
  proficiency_percent: number;
  level: string;
  is_active: boolean;
  
  // AI enrichment fields
  ai_category: string;
  summary: string;
  action: string;
  effect: string;
  outcome: string;
  related_project: string;
  employer: string;
  recency: 'current' | 'recent' | 'legacy';
}
```

### Unified Technology Response
```typescript
interface UnifiedTechnologyResponse {
  found: boolean;
  source: 'production' | 'staged' | 'none';
  d1cv: { found: boolean; data: Record<string, unknown> | null };
  aiAgent: { found: boolean; source: string; data: Record<string, unknown> | null };
  staged: { found: boolean; staged_id: number | null; /* ... */ };
}
```

## Authentication

Protected by Cloudflare Zero Trust:
- PIN/Email authentication required
- Allowed email: `{YOUR_EMAIL}`
- JWT assertion header: `CF-Access-JWT-Assertion`

## Related Projects

| Project | URL | Purpose |
|---------|-----|---------|
| cv-admin-worker | api.admin.{YOUR_DOMAIN} | Backend API |
| D1CV | {YOUR_DOMAIN} | Portfolio site |
| cv-ai-agent | cv.{YOUR_DOMAIN} | AI chatbot |

## Version History

- **v1.4.2** - Add cache refresh snackbar, AI category field fix, aiId optimization
- **v1.4.1** - Fix: AI enrichment fields now populate correctly from AI Agent match
- **v1.4.0** - Add delete action to AI Agent Technologies menu
- Earlier versions...

## Debugging Tips

1. **Empty AI fields in form**: Ensure using `??` not `||` for field population
2. **API errors**: Check CORS config in cv-admin-worker
3. **Query cache issues**: Invalidate with `queryClient.invalidateQueries(['key'])`
4. **Form not updating**: Check `useEffect` dependencies array
