# CyberGuard Project Structure

## Organized Component Architecture

### Directory Structure

```
src/
├── app/                              # Next.js app router pages
│   ├── page.tsx                     # Dashboard page (45 lines)
│   ├── threats/
│   │   └── page.tsx                # Threats page (44 lines)
│   ├── risk-analysis/
│   │   └── page.tsx                # Risk analysis page
│   ├── incident-response/
│   │   └── page.tsx                # Incident response page
│   ├── playbooks/
│   │   └── page.tsx                # Playbooks page
│   ├── reports/
│   │   └── page.tsx                # Reports page
│   ├── api/                         # Backend API routes
│   │   ├── dashboard/
│   │   ├── threats/
│   │   ├── risk-analysis/
│   │   ├── incident-response/
│   │   ├── playbooks/
│   │   └── reports/
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
│
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── badge.tsx              # Status/severity badges
│   │   ├── skeleton.tsx            # Loading skeleton
│   │   ├── empty-state.tsx         # Empty state component
│   │   ├── data-table.tsx          # Reusable table
│   │   └── metric-card.tsx         # Metric card component
│   │
│   ├── layout/                     # Layout components
│   │   ├── sidebar.tsx             # Navigation sidebar
│   │   └── header.tsx              # Page header
│   │
│   ├── dashboard/                  # Dashboard feature components
│   │   ├── metrics-grid.tsx        # KPI metrics grid (62 lines)
│   │   ├── quick-stats.tsx         # Quick stats card (23 lines)
│   │   └── recent-incidents.tsx    # Recent incidents list (65 lines)
│   │
│   ├── threats/                    # Threats feature components
│   │   ├── threat-filters.tsx      # Filter controls (68 lines)
│   │   ├── threats-table.tsx       # Threats data table (78 lines)
│   │   ├── threats-summary.tsx     # Summary statistics (38 lines)
│   │   └── threat-chart.tsx        # Threat visualization chart
│   │
│   ├── shared/                     # Shared across features
│   │   └── page-header.tsx         # Page title/description (14 lines)
│   │
│   └── (risk-analysis/, incident-response/, playbooks/, reports/ folders)
│
├── lib/
│   ├── api-service.ts              # Centralized API calls (202 lines)
│   ├── mock-data.ts                # Mock data for development
│   └── utils.ts                    # Utility functions
│
├── hooks/
│   └── use-fetch-data.ts           # Custom data fetching hook
│
└── public/
    └── (static assets)
```

## Principles Applied

### 1. Feature-Based Organization
- Each feature (dashboard, threats, etc.) has its own folder
- Related components grouped together
- Easy to locate and modify features

### 2. Component Size Limits
- **Page files**: 45-60 lines (lean and focused)
- **Feature components**: 20-80 lines (single responsibility)
- **UI components**: 15-40 lines (reusable primitives)

### 3. Reusability Hierarchy
```
ui/               → Used across ALL features
└── badge, skeleton, empty-state, data-table, metric-card

layout/           → Used in app root
└── sidebar, header

shared/           → Used across multiple features
└── page-header

feature-specific/ → Used only in that feature
└── dashboard/, threats/, risk-analysis/, etc.
```

### 4. Import Patterns

**Feature components import from:**
- `@/components/ui/*` - Reusable UI primitives
- `@/components/shared/*` - Shared utilities
- `@/components/layout/*` - Layout elements
- `@/lib/api-service` - API calls
- `@/hooks/use-fetch-data` - Data fetching

**Example:**
```typescript
import { MetricCard } from '@/components/ui/metric-card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/shared/page-header'
import { dashboardAPI } from '@/lib/api-service'
```

## File Reduction Summary

| Component | Before | After | Reduction |
|-----------|--------|-------|-----------|
| Dashboard page | 172 lines | 57 lines | 67% |
| Threats page | 177 lines | 44 lines | 75% |
| Metrics grid | - | 62 lines | - |
| Threats table | - | 78 lines | - |
| Quick stats | - | 23 lines | - |
| Recent incidents | - | 65 lines | - |

## Benefits

✓ **Maintainability**: Each file has single responsibility
✓ **Scalability**: Easy to add new features
✓ **Reusability**: UI components used across pages
✓ **Readability**: Small, focused files
✓ **Testing**: Easier to test individual components
✓ **Performance**: Better code splitting with Next.js

## Next Steps

When adding new pages:

1. Create feature folder: `components/[feature]/`
2. Break down large components (>100 lines)
3. Extract reusable logic to hooks
4. Use existing UI components from `components/ui/`
5. Keep page files under 60 lines

## Component Templates

### Feature Component
```typescript
'use client'

interface Props {
  // Props definition
}

export function ComponentName({ ...props }: Props) {
  // Component logic (20-80 lines total)
  return (
    // JSX
  )
}
```

### Page File
```typescript
'use client'

export default function PageName() {
  // Setup hooks and state
  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageHeader title="..." description="..." />
      {/* Import and use feature components */}
    </div>
  )
}
```
