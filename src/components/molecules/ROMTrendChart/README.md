# ROMTrendChart

**Molecule Component** - ROM (Range of Motion) Score Trend Visualization

## Overview

The `ROMTrendChart` component displays ROM score trends over time using Recharts LineChart. It features responsive sizing, interactive hover tooltips, design system theming, and graceful handling of loading and empty states.

## Story Context

- **Epic**: EPIC-021 (ROM Analytics)
- **Story**: EPIC-021-S1 (ROM Trend Chart Molecule)
- **Priority**: P1
- **Story Points**: 2

## Features

- ✅ Recharts LineChart integration for smooth data visualization
- ✅ Responsive container adapts to parent width
- ✅ Custom tooltip displays formatted date and score on hover
- ✅ Design system token integration for consistent theming
- ✅ Loading state with spinner
- ✅ Empty state with Ant Design Empty component
- ✅ Accessible with semantic HTML and ARIA support
- ✅ Mobile-responsive with adaptive padding
- ✅ TypeScript with full type safety

## Usage

### Basic Usage

```tsx
import { ROMTrendChart } from '@molecules/ROMTrendChart';

function MyDashboard() {
  const romData = [
    { date: '2025-10-01', score: 75 },
    { date: '2025-10-08', score: 80 },
    { date: '2025-10-15', score: 85 },
    { date: '2025-10-21', score: 88 }
  ];

  return <ROMTrendChart data={romData} />;
}
```

### With Loading State

```tsx
<ROMTrendChart data={romData} loading={isLoading} />
```

### Custom Height

```tsx
<ROMTrendChart data={romData} height={500} />
```

### With Custom Class

```tsx
<ROMTrendChart data={romData} className="my-custom-chart" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `ROMDataPoint[]` | **Required** | Array of ROM data points with date and score |
| `loading` | `boolean` | `false` | Shows loading spinner when true |
| `height` | `number` | `300` | Chart height in pixels |
| `className` | `string` | `undefined` | Optional additional CSS class |

### ROMDataPoint Interface

```typescript
interface ROMDataPoint {
  date: string;  // ISO date string (e.g., '2025-10-21T00:00:00.000Z')
  score: number; // ROM score value (0-100)
}
```

## States

### Default State
Displays line chart with data points, grid, axes, and interactive tooltip.

### Loading State
Shows centered spinner with "Loading chart..." message.

### Empty State
Displays Ant Design Empty component with "No ROM data available yet" message.

## Styling

The component uses CSS custom properties from the design system:

**Colors**:
- `--brand-primary` - Line and dot color
- `--brand-primary-hover` - Active dot color
- `--border-subtle` - Grid lines
- `--text-secondary` - Axis labels
- `--surface-elevated` - Background and tooltip

**Spacing**:
- `--spacing-md` - Container padding
- `--spacing-sm` - Tooltip padding
- `--spacing-xs` - Internal spacing

**Borders**:
- `--border-radius-md` - Container border radius
- `--border-radius-sm` - Tooltip border radius
- `--border-default` - Tooltip border

**Shadows**:
- `--shadow-md` - Tooltip shadow

## Responsive Behavior

- **Desktop**: Full padding, larger tooltips
- **Mobile (< 768px)**: Reduced padding, smaller font sizes in tooltip

## Accessibility

- ✅ Semantic HTML structure
- ✅ Screen reader friendly with Ant Design Empty component
- ✅ High contrast design system tokens
- ✅ Proper component displayName for debugging
- ✅ Descriptive loading and empty state messages

## Testing

### Unit Tests

```bash
npm test ROMTrendChart.test.tsx
```

Test coverage includes:
- Rendering with various data sets
- Loading state behavior
- Empty state handling
- Custom props (height, className)
- Edge cases (single point, many points, boundary scores)
- State transitions (loading → data, empty → data)
- Accessibility features

### Storybook

```bash
npm run storybook
```

Available stories:
- Default (Improving Trend)
- Declining Trend
- Stable Progress
- Fluctuating Pattern
- Loading State
- Empty State
- Sparse Data
- Dense Data
- Custom Heights (Tall/Short)
- Perfect Score
- Low Scores

## Implementation Details

### Data Formatting

The component uses `date-fns` to format dates:
- **X-axis**: Short format (e.g., "Oct 1")
- **Tooltip**: Full format (e.g., "Oct 1, 2025")

### Chart Configuration

- **Y-axis domain**: Fixed 0-100 range (ROM scores are percentages)
- **Line type**: Monotone interpolation for smooth curves
- **Dot size**: 4px radius (6px when active)
- **Stroke width**: 2px
- **Grid**: Dashed 3-3 pattern

### Dependencies

- `recharts` - Chart library
- `date-fns` - Date formatting
- `antd` - Empty and Spin components
- `react` - Component framework

## Files

```
ROMTrendChart/
├── ROMTrendChart.tsx           # Main component
├── ROMTrendChart.css           # Styles
├── ROMTrendChart.stories.tsx   # Storybook stories
├── types.ts                    # TypeScript types
├── index.tsx                   # Barrel export
├── README.md                   # Documentation (this file)
└── __tests__/
    └── ROMTrendChart.test.tsx  # Unit tests
```

## Related Components

- **MetricCard** (`@atoms/MetricCard`) - Displays ROM score metric
- **TrendIndicator** (`@atoms/TrendIndicator`) - Shows trend direction
- **DashboardHeroMetrics** (`@molecules/DashboardHeroMetrics`) - Container for metrics

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Chart re-renders only when data changes (React memo optimization via Recharts)
- Responsive container uses ResizeObserver for efficient resizing
- CSS custom properties enable theme switching without re-renders

## Future Enhancements

Potential improvements for future stories:
- Comparison mode (multiple lines for different time periods)
- Goal line overlay (target ROM score)
- Annotation markers for significant events
- Export to image functionality
- Date range selector integration
- Zoom/pan interactions for dense data

## Changelog

- **2025-10-21**: Initial implementation (EPIC-021-S1)
  - Recharts LineChart integration
  - Custom tooltip component
  - Design system theming
  - Responsive sizing
  - Loading and empty states
  - Unit tests and Storybook stories

## Authors

- **Development**: Claude Code Agent
- **Design System**: VitalFlow UX Team
- **Epic Owner**: EPIC-021 ROM Analytics

## License

Proprietary - VitalFlow UI Project
