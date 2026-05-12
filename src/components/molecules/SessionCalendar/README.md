# SessionCalendar

> **EPIC-022-S1**: Session Calendar Molecule Component with Heatmap

A calendar heatmap visualization component that displays user session history over the last 90 days. Similar to GitHub's contribution graph, it uses color intensity to represent session frequency.

## Features

- **90-Day Calendar Grid**: Displays the last 13 weeks in a compact heatmap format
- **Color Intensity Gradient**: Session count mapped to 6 color levels (0-5+)
- **Interactive Tooltips**: Hover to see date and exact session count
- **Responsive Design**: Scales appropriately for mobile and tablet devices
- **Loading State**: Displays spinner while data is being fetched
- **Empty State**: Graceful handling when no data is available
- **Design System Integration**: Uses CSS custom properties for consistent theming
- **Accessibility**: ARIA labels and semantic HTML structure

## Usage

### Basic Example

```tsx
import { SessionCalendar } from '@molecules/SessionCalendar';

function MyDashboard() {
  const sessionData = [
    { date: '2025-10-01', count: 2 },
    { date: '2025-10-05', count: 4 },
    { date: '2025-10-15', count: 3 },
  ];

  return <SessionCalendar data={sessionData} />;
}
```

### With Loading State

```tsx
import { SessionCalendar } from '@molecules/SessionCalendar';

function MyDashboard() {
  const { data, loading } = useSessionData();

  return <SessionCalendar data={data} loading={loading} />;
}
```

### With Custom Styling

```tsx
import { SessionCalendar } from '@molecules/SessionCalendar';

function MyDashboard() {
  return (
    <SessionCalendar
      data={sessionData}
      className="my-custom-calendar"
    />
  );
}
```

## Props

### `SessionCalendarProps`

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `SessionData[]` | Yes | - | Array of session data points |
| `loading` | `boolean` | No | `false` | Shows loading spinner when true |
| `className` | `string` | No | `''` | Custom CSS class name |

### `SessionData`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | `string` | Yes | Date in `YYYY-MM-DD` format |
| `count` | `number` | Yes | Number of sessions (0-∞) |

## Color Intensity Scale

The component uses a 6-level color gradient based on session count:

| Count | Color | Variable |
|-------|-------|----------|
| 0 | Light gray | `--color-gray-100` |
| 1 | Very light purple | `--color-purple-200` |
| 2 | Light purple | `--color-purple-400` |
| 3 | Medium purple | `--color-purple-600` |
| 4 | Dark purple | `--brand-primary` |
| 5+ | Darkest purple | `--brand-primary-hover` |

## Responsive Behavior

- **Desktop (>768px)**: Full scale, 16px padding
- **Tablet (≤768px)**: 85% scale, 8px padding, smaller legend
- **Mobile (≤480px)**: 70% scale, compact legend (9px font)

## Accessibility

- SVG has `role="img"` and descriptive `aria-label`
- Calendar cells include `data-testid` for testing
- Hover tooltips provide date and count information
- Keyboard-accessible legend cells with title attributes

## States

### Default State
Shows calendar heatmap with all 90 days and color-coded cells.

### Loading State
Displays centered Ant Design Spin component with "Loading calendar..." message.

### Empty State
Shows Ant Design Empty component with "No session data available yet" message.

## Implementation Details

### Calendar Calculation
- Uses `date-fns` to generate 90-day range (today - 89 days)
- Organizes days into weeks (7 days each) for grid layout
- Creates lookup map for O(1) session count retrieval

### SVG Rendering
- Cell size: 12px × 12px
- Cell gap: 2px
- Border radius: 2px (rounded corners)
- Responsive scaling via CSS transforms

### Tooltip Integration
- Uses Ant Design Tooltip component
- 200ms mouse enter delay for smooth UX
- Format: "MMM d, yyyy: X session(s)"

## Design System Tokens Used

### Colors
- `--color-gray-100` - Empty days
- `--color-purple-200`, `--color-purple-400`, `--color-purple-600` - Gradient steps
- `--brand-primary`, `--brand-primary-hover` - High intensity
- `--text-primary`, `--text-secondary` - Text colors
- `--surface-primary` - Background
- `--border-subtle`, `--border-focus` - Borders

### Spacing
- `--spacing-1`, `--spacing-2`, `--spacing-4`, `--spacing-8`

### Effects
- `--transition-fast` - Hover animations
- `--radius-xs`, `--radius-lg` - Border radius
- `--shadow-lg` - Optional shadows

## Testing

Comprehensive test suite includes:

- **Rendering Tests**: Calendar grid, legend, cells
- **Loading State Tests**: Spinner, no calendar during load
- **Empty State Tests**: Empty message, null/empty data handling
- **Data Handling Tests**: Single point, many points, edge cases
- **Color Intensity Tests**: Correct colors for session counts
- **Accessibility Tests**: DisplayName, ARIA labels, test IDs
- **Integration Tests**: State transitions, data updates
- **Legend Tests**: Labels and cells rendering

Run tests:
```bash
npm test SessionCalendar.test.tsx
```

## Storybook Stories

12 interactive stories available:

1. **Default** - Active user pattern
2. **ModerateActivity** - Moderate session frequency
3. **SparseActivity** - Infrequent sessions
4. **DecliningEngagement** - Decreasing activity over time
5. **IncreasingEngagement** - Increasing activity over time
6. **Loading** - Loading state
7. **Empty** - No data state
8. **PerfectStreak** - Daily sessions
9. **WeekendWarrior** - Weekend-only pattern
10. **WeekdayRoutine** - Weekday-only pattern
11. **HighIntensity** - 4-6 sessions per day
12. **RecentActivityOnly** - Last 2 weeks only
13. **WithCustomClass** - Custom styling example

View stories:
```bash
npm run storybook
```

## Related Components

- **ROMTrendChart** - Similar molecule pattern for ROM score trends
- **ActivityCalendar** - Related atom for activity tracking
- **DashboardHeroMetrics** - Consumer of this component

## Future Enhancements

Potential improvements for future iterations:

- [ ] Month labels along top edge
- [ ] Click event handlers for date navigation
- [ ] Export to image functionality
- [ ] Comparison mode (multiple users side-by-side)
- [ ] Custom date range selector
- [ ] Animation on data updates
- [ ] Keyboard navigation support
- [ ] Custom color schemes (not just purple)

## Performance Considerations

- **Memoization**: Consider wrapping in `React.memo` for large datasets
- **SVG Optimization**: 90 cells × 13 weeks = ~90 SVG elements (lightweight)
- **Tooltip Performance**: 200ms delay prevents excessive re-renders
- **Date Calculation**: Performed once, cached in lookup map

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Version History

- **v1.0.0** (2025-10-21): Initial implementation
  - 90-day calendar heatmap
  - Color intensity gradient (6 levels)
  - Hover tooltips
  - Responsive design
  - Loading and empty states
  - Comprehensive tests and stories

## License

Internal component for VitalFlow application.

## Related Documentation

- [Story EPIC-022-S1](../../../docs/implementation-reports/1-plan/dashboard/drafts/stories/EPIC-022-S1-session-calendar-molecule.md)
- [Design System Tokens](../../../styles/tokens/primitives.css)
- [Atomic Design Guidelines](../../../docs/atomic-design.md)
