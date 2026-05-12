# DashboardHeroMetrics Molecule Component

**EPIC:** EPIC-009-S3
**Component Type:** Molecule
**Status:** Complete

## Overview

The `DashboardHeroMetrics` component orchestrates three `MetricCard` components to display key patient engagement metrics in a responsive grid layout.

## Features

- **Three Key Metrics:**
  - ROM Score (0-100 or N/A)
  - Sessions Completed
  - Current Streak (with singular/plural day/days handling)

- **Responsive Grid:**
  - Mobile (xs): 1 column (full width)
  - Tablet/Desktop (sm/md): 3 columns

- **Dynamic Data:**
  - Handles null ROM scores (displays "N/A")
  - Optional trend indicators
  - Loading state support

## Usage

```tsx
import { DashboardHeroMetrics } from '@molecules/DashboardHeroMetrics';

// Basic usage
<DashboardHeroMetrics
  metrics={{
    romScore: 85,
    romTrend: 5,
    sessionsCompleted: 12,
    sessionsTrend: 3,
    currentStreak: 7,
    streakTrend: 2,
  }}
/>

// With loading state
<DashboardHeroMetrics
  metrics={metrics}
  loading={true}
/>

// With null ROM score
<DashboardHeroMetrics
  metrics={{
    romScore: null,
    sessionsCompleted: 12,
    currentStreak: 7,
  }}
/>
```

## Props

### DashboardHeroMetricsProps

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `metrics` | `DashboardMetrics` | Yes | - | Metrics data object |
| `loading` | `boolean` | No | `false` | Shows skeleton UI |
| `className` | `string` | No | `''` | Additional CSS class |

### DashboardMetrics

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `romScore` | `number \| null` | Yes | ROM assessment score (0-100) |
| `romTrend` | `number` | No | ROM score trend percentage |
| `sessionsCompleted` | `number` | Yes | Total completed sessions |
| `sessionsTrend` | `number` | No | Sessions trend percentage |
| `currentStreak` | `number` | Yes | Current streak in days |
| `streakTrend` | `number` | No | Streak trend percentage |

## Implementation Details

### Icons
- **ROM Score:** Trophy icon (TrophyOutlined)
- **Sessions Completed:** Calendar icon (CalendarOutlined)
- **Current Streak:** Fire icon (FireOutlined)

### Responsive Breakpoints
- `xs={24}` - Full width on mobile
- `sm={8}` - 3 columns on tablet
- `md={8}` - 3 columns on desktop

### Special Handling
- **Null ROM Score:** Displays "N/A" instead of numeric value, omits "/100" suffix
- **Streak Suffix:** Shows "day" (singular) when streak === 1, "days" (plural) otherwise

## File Structure

```
DashboardHeroMetrics/
├── DashboardHeroMetrics.tsx    # Main component implementation
├── DashboardHeroMetrics.css    # Component styles
├── DashboardHeroMetrics.stories.tsx # Storybook stories
├── types.ts                    # TypeScript type definitions
├── index.tsx                   # Barrel export
├── README.md                   # This file
└── __tests__/
    └── DashboardHeroMetrics.test.tsx # Unit tests
```

## Dependencies

- `antd` - Row, Col components
- `@ant-design/icons` - Icon components
- `@atoms/MetricCard` - Base metric card component

## Related Components

- **Atoms:** `MetricCard` (EPIC-009-S1)
- **Parent:** `DashboardHero` organism (EPIC-010)

## Testing

Run unit tests:
```bash
npm test -- --testPathPattern=DashboardHeroMetrics
```

View in Storybook:
```bash
npm run storybook
# Navigate to Molecules → DashboardHeroMetrics
```

## Accessibility

- Semantic HTML structure via MetricCard
- Loading states with skeleton UI
- Touch-friendly card components

## Notes

- Grid layout uses Ant Design's responsive grid system
- All trend indicators are optional
- Component is fully controlled via props
- No internal state management

## Changelog

- **2025-10-21:** Initial implementation (EPIC-009-S3)
