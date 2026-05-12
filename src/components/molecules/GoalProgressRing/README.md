# GoalProgressRing

**Molecule Component** | Circular progress indicator for functional goal completion tracking

---

## Overview

The `GoalProgressRing` component displays a circular progress indicator with percentage and goal title. It features smooth animation on mount, dynamic color coding based on progress thresholds, and full accessibility support.

## Features

- ✅ Circular SVG-based progress ring
- ✅ Smooth animation from 0% to actual progress on mount
- ✅ Dynamic color coding (warning/primary/success)
- ✅ Responsive sizing with customizable diameter
- ✅ Loading state with spinner
- ✅ Full accessibility (ARIA labels, screen reader support)
- ✅ Dark mode support
- ✅ Reduced motion support
- ✅ Design system token integration

## Installation

```bash
# Component is part of the molecules library
import { GoalProgressRing } from '@molecules/GoalProgressRing';
```

## Basic Usage

```tsx
import { GoalProgressRing } from '@molecules/GoalProgressRing';

function MyComponent() {
  return (
    <GoalProgressRing
      title="Balance"
      progress={75}
      size={120}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | *required* | Title/name of the goal being tracked |
| `progress` | `number` | *required* | Progress percentage (0-100, clamped) |
| `size` | `number` | `120` | Diameter size in pixels |
| `loading` | `boolean` | `false` | Shows loading spinner when true |
| `className` | `string` | `''` | Additional CSS class |
| `ariaLabel` | `string` | `undefined` | Custom ARIA label (auto-generated if not provided) |

## Color Thresholds

The component automatically applies colors based on progress percentage:

| Progress Range | Color | CSS Variable | Visual State |
|---------------|-------|--------------|--------------|
| 0-49% | Orange | `--color-warning-600` | Warning |
| 50-74% | Purple | `--color-purple-700` | Primary |
| 75-100% | Green | `--color-success-600` | Success |

## Examples

### Default Usage

```tsx
<GoalProgressRing
  title="Balance"
  progress={75}
/>
```

### Custom Size

```tsx
<GoalProgressRing
  title="Flexibility"
  progress={62}
  size={200}
/>
```

### Loading State

```tsx
<GoalProgressRing
  title="Loading Goal"
  progress={0}
  loading={true}
/>
```

### Custom Accessibility Label

```tsx
<GoalProgressRing
  title="Balance"
  progress={75}
  ariaLabel="Balance goal: 75 percent complete out of 100"
/>
```

### Multiple Goals Dashboard

```tsx
function GoalsDashboard() {
  const goals = [
    { title: 'Balance', progress: 85 },
    { title: 'Strength', progress: 62 },
    { title: 'Flexibility', progress: 45 },
    { title: 'Endurance', progress: 78 },
  ];

  return (
    <div className="goals-grid">
      {goals.map((goal) => (
        <GoalProgressRing
          key={goal.title}
          title={goal.title}
          progress={goal.progress}
        />
      ))}
    </div>
  );
}
```

### Responsive Sizes

```tsx
<div className="responsive-goals">
  {/* Small - Mobile */}
  <GoalProgressRing title="Balance" progress={75} size={80} />

  {/* Medium - Tablet */}
  <GoalProgressRing title="Balance" progress={75} size={120} />

  {/* Large - Desktop */}
  <GoalProgressRing title="Balance" progress={75} size={160} />
</div>
```

## Styling

### CSS Classes

The component uses the following CSS classes:

- `.goal-progress-ring` - Main container
- `.goal-progress-ring-loading` - Loading state container
- `.progress-ring-background` - Background circle
- `.progress-ring-circle` - Animated progress circle
- `.progress-ring-circle-warning` - Warning color variant
- `.progress-ring-circle-primary` - Primary color variant
- `.progress-ring-circle-success` - Success color variant
- `.progress-content` - Centered content container
- `.progress-percentage` - Percentage text
- `.progress-title` - Goal title text

### Custom Styling

```tsx
// Apply custom class
<GoalProgressRing
  title="Balance"
  progress={75}
  className="my-custom-ring"
/>
```

```css
/* Custom styles */
.my-custom-ring {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.my-custom-ring .progress-title {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

## Accessibility

### ARIA Support

The component provides comprehensive accessibility support:

- **role="img"** on main container
- **aria-label** with progress information
- **role="status"** on loading state
- **aria-hidden="true"** on decorative SVG
- Screen reader announces: "{title} goal progress: {percent}%"

### Reduced Motion

The component respects `prefers-reduced-motion` settings:

```css
@media (prefers-reduced-motion: reduce) {
  .progress-ring-circle {
    transition: none; /* Disables animation */
  }
}
```

### High Contrast Mode

Supports high contrast mode for better visibility:

```css
@media (prefers-contrast: high) {
  .progress-ring-background {
    stroke: var(--color-gray-400); /* Stronger contrast */
  }
}
```

## Animation

The progress ring animates from 0% to the actual progress value on mount or when progress changes:

- **Duration**: 1 second
- **Easing**: `ease-in-out`
- **Delay**: 100ms (ensures CSS transition triggers)
- **Transition**: `stroke-dashoffset` (smooth circular animation)

## Dark Mode

The component automatically adapts to dark mode via `[data-theme='dark']`:

```css
[data-theme='dark'] .goal-progress-ring-loading {
  background-color: var(--color-gray-800);
}

[data-theme='dark'] .progress-ring-background {
  stroke: var(--color-gray-700);
}
```

## TypeScript

### Type Definitions

```typescript
export interface GoalProgressRingProps {
  title: string;
  progress: number;
  size?: number;
  loading?: boolean;
  className?: string;
  ariaLabel?: string;
}

export type ProgressColorThreshold = 'warning' | 'primary' | 'success';
```

### Type-Safe Usage

```tsx
import { GoalProgressRing, GoalProgressRingProps } from '@molecules/GoalProgressRing';

const props: GoalProgressRingProps = {
  title: 'Balance',
  progress: 75,
  size: 120,
};

<GoalProgressRing {...props} />
```

## Design System Integration

The component uses design system tokens for consistent theming:

### Colors

- `--color-success-600` - Success state (≥75%)
- `--color-purple-700` - Primary state (50-74%)
- `--color-warning-600` - Warning state (<50%)
- `--color-gray-200` - Background ring
- `--color-gray-600` - Title text

### Spacing

- `--spacing-1` - Margin between percentage and title
- `--radius-full` - Circular border radius

### Typography

- `--font-size-2xl` - Percentage text (24px)
- `--font-size-xs` - Title text (12px)
- `--font-weight-bold` - Percentage (700)
- `--font-weight-medium` - Title (500)

## Performance

### Optimization Features

- SVG-based rendering (no canvas overhead)
- CSS transitions (GPU-accelerated)
- Minimal re-renders (memoized calculations)
- Lightweight component (~4KB)

### Best Practices

```tsx
// ✅ Good: Stable progress value
<GoalProgressRing title="Balance" progress={userGoal.progress} />

// ❌ Avoid: Rapidly changing progress (causes excessive animation)
<GoalProgressRing title="Balance" progress={Math.random() * 100} />

// ✅ Good: Show loading while fetching
{isLoading ? (
  <GoalProgressRing title="Balance" progress={0} loading={true} />
) : (
  <GoalProgressRing title="Balance" progress={data.progress} />
)}
```

## Testing

### Unit Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { GoalProgressRing } from '@molecules/GoalProgressRing';

test('renders with correct progress', async () => {
  render(<GoalProgressRing title="Balance" progress={75} />);

  await waitFor(() => {
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});

test('applies success color at 75%', () => {
  const { container } = render(
    <GoalProgressRing title="Balance" progress={75} />
  );

  expect(
    container.querySelector('.progress-ring-circle-success')
  ).toBeInTheDocument();
});
```

### Accessibility Tests

```tsx
test('has proper ARIA label', () => {
  render(<GoalProgressRing title="Balance" progress={75} />);

  const ring = screen.getByRole('img');
  expect(ring).toHaveAttribute('aria-label', 'Balance goal progress: 75%');
});
```

## Browser Support

- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Mobile browsers (iOS 14+, Android 90+)

## Related Components

- **DashboardHeroMetrics** - Uses GoalProgressRing for goal visualization
- **ROMTrendChart** - Complementary trend visualization
- **SessionCalendar** - Activity scheduling component

## Changelog

### v1.0.0 (2025-10-21)

- ✨ Initial release
- ✨ SVG-based circular progress ring
- ✨ Smooth animation on mount
- ✨ Dynamic color thresholds (warning/primary/success)
- ✨ Loading state support
- ✨ Full accessibility (ARIA, screen reader)
- ✨ Dark mode support
- ✨ Responsive sizing
- ✨ Design system token integration
- ✨ Comprehensive test coverage
- ✨ Storybook stories

## License

Internal component for VitalFlow UI library.

---

**Component Type**: Molecule
**Atomic Design Level**: Molecule (composed of SVG primitives)
**Design System**: VitalFlow Design System v2.0
**Created**: 2025-10-21
