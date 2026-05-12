# Interactive Annotations - User Guide

**Version:** 1.0
**Story:** EPIC-001-S13
**Date:** 2026-01-10

## Overview

Interactive Annotations adds clickable measurement labels, before/after comparison mode, and progress tracking to the 3D body model visualization. This feature enables users to explore body measurements interactively and track changes over time.

## Features

### 1. Measurement Annotations (AC1, AC2)

**Clickable measurement labels** overlay the 3D body model at anatomically correct positions.

```tsx
import { InteractiveAnnotations } from '@organisms/OBodyModel3D';

<InteractiveAnnotations currentMeasurement={measurementResult} />
```

**Features:**
- Labels positioned on 3D model (screen-space projection)
- Color-coded by confidence (green ≥90%, yellow ≥70%, red <70%)
- Click to view detailed popup
- Smooth animations on hover/selection

### 2. Detail Popups (AC2)

**Measurement detail popups** display comprehensive information when clicking annotation labels.

**Displayed Information:**
- Measurement value with unit
- Confidence score (0-100%)
- Body part name
- Measurement type (segment/circumference/ratio/symmetry)
- Confidence progress bar

### 3. Before/After Comparison (AC3)

**Side-by-side 3D model comparison** shows measurement changes between two assessments.

```tsx
import { InteractiveAnnotations } from '@organisms/OBodyModel3D';
import { calculateComparison } from '@organisms/OBodyModel3D';

const comparison = calculateComparison(beforeMeasurement, afterMeasurement);

<InteractiveAnnotations
  currentMeasurement={afterMeasurement}
  comparisonData={comparison}
/>
```

**Features:**
- Side-by-side 3D models (before in gray, after in blue)
- Time period tracking (days between measurements)
- Overall change percentage
- Top 5 measurement changes by default
- Expandable to show all changes
- Color-coded change indicators (green=improvement, red=regression)

### 4. Progress Tracking (AC4)

**Timeline charts** visualize measurement trends across multiple sessions.

```tsx
const progressEntries: ProgressEntry[] = [
  { date: '2025-01-01', result: measurement1, score: 80 },
  { date: '2025-01-15', result: measurement2, score: 85 },
  { date: '2025-02-01', result: measurement3, score: 90 },
];

<InteractiveAnnotations
  currentMeasurement={latestMeasurement}
  progressEntries={progressEntries}
/>
```

**Features:**
- Line charts for any measurement metric
- Dropdown to select metric (segments, circumferences, symmetry score)
- Statistics summary (starting value, current value, total change, avg score)
- Responsive chart with tooltips

### 5. Color Coding (AC5)

**Color-coded change indicators** make improvements/regressions instantly recognizable.

**Color System:**
- **Green** (`var(--success-500)`) - Positive change (improvement)
  - Segment increase (muscle growth)
  - Chest/shoulder circumference increase
  - Waist/hip circumference decrease
- **Red** (`var(--error-500)`) - Negative change (regression)
  - Opposite of above
- **Gray** (`var(--gray-500)`) - Stable (< 1% change)

**Icons:**
- `arrowUp` - Increase
- `arrowDown` - Decrease
- `minus` - Stable

### 6. Export Reports (AC6)

**JSON export** generates comprehensive comparison reports for external use.

```tsx
import { exportReportToJSON, generateComparisonReport } from '@organisms/OBodyModel3D';

const comparison = calculateComparison(before, after);
const report = generateComparisonReport(comparison, 'user-123');
exportReportToJSON(report, 'comparison-report.json');
```

**Report Structure:**
```json
{
  "title": "Body Measurement Comparison Report",
  "exportDate": "2025-01-10T12:00:00Z",
  "userId": "user-123",
  "comparison": { ... },
  "summary": {
    "totalMeasurements": 15,
    "improvementCount": 10,
    "regressionCount": 2,
    "stableCount": 3
  },
  "version": "1.0"
}
```

## Architecture

### Component Hierarchy

```
InteractiveAnnotations (organism)
├── BodyModel3D (organism) - 3D body model
├── MeasurementLabel (molecule) - Clickable annotations
├── MeasurementDetailPopup (atom) - Detail display
├── ComparisonView (organism) - Before/after comparison
└── ProgressChart (organism) - Timeline visualization
```

### Data Flow

1. **Annotations**: `BodyMeasurementResult` → `createAnnotationsFromMeasurements()` → `MeasurementAnnotation[]`
2. **Comparison**: `(before, after)` → `calculateComparison()` → `ComparisonData`
3. **Reports**: `ComparisonData` → `generateComparisonReport()` → `ComparisonReport` → `exportReportToJSON()`

### Key Types

```typescript
// Measurement annotation on 3D model
interface MeasurementAnnotation {
  id: string;
  label: string;
  value: number;
  unit: 'cm' | 'in' | 'ratio' | '%';
  confidence: number;
  position: { x: number; y: number; z: number };
  bodyPart: string;
  type: 'segment' | 'circumference' | 'ratio' | 'symmetry';
}

// Before/after comparison
interface ComparisonData {
  id: string;
  before: BodyMeasurementResult;
  after: BodyMeasurementResult;
  daysBetween: number;
  overallChange: number;
  changes: MeasurementChange[];
}

// Individual measurement change
interface MeasurementChange {
  id: string;
  label: string;
  beforeValue: number;
  afterValue: number;
  unit: string;
  absoluteChange: number;
  percentChange: number;
  direction: 'increase' | 'decrease' | 'stable';
  isPositive: boolean;
}

// Progress entry
interface ProgressEntry {
  date: string;
  result: BodyMeasurementResult;
  score: number;
}
```

## Performance Considerations

### Screen-Space Projection

Measurement labels use Three.js world-to-screen projection:

```typescript
// Project 3D position to screen coordinates (60fps)
vector.current.set(annotation.position.x, annotation.position.y, annotation.position.z);
vector.current.project(camera);

const x = ((vector.current.x + 1) / 2) * canvas.width;
const y = (-(vector.current.y - 1) / 2) * canvas.height;
```

**Optimization:** Labels update at 60fps via `setInterval` (16ms).

### Chart Rendering

Progress charts use `recharts` library with memoization:

```typescript
const chartData = useMemo(() => {
  return entries.map(entry => {
    // Extract measurement value
    return { date, value, score };
  });
}, [entries, selectedMetric]);
```

**Optimization:** Chart data recalculated only when entries or metric change.

## Accessibility

### ARIA Labels

```tsx
<CloseButton onClick={handleClose} aria-label="Close popup">
  <UntitledIcon name="close" size="small" />
</CloseButton>
```

### Keyboard Navigation

- **Tab**: Navigate between annotation labels
- **Enter**: Open detail popup
- **Escape**: Close popup

### Color Contrast

All color combinations meet WCAG AA standards:
- Success green: `var(--success-500)` - 4.5:1 on white
- Error red: `var(--error-500)` - 4.5:1 on white
- Gray: `var(--gray-500)` - 4.5:1 on white

## Testing

### Unit Tests

```bash
npm test -- OBodyModel3D/__tests__/annotationUtils.test.ts
npm test -- OBodyModel3D/__tests__/InteractiveAnnotations.test.tsx
```

### Test Coverage

- ✅ Annotation creation from measurements
- ✅ Comparison calculation
- ✅ Report generation
- ✅ Color coding logic
- ✅ Component rendering
- ✅ User interactions (clicks, tab switching)

## Usage Examples

### Basic Usage

```tsx
import { InteractiveAnnotations } from '@organisms/OBodyModel3D';
import { calculateAllMeasurements } from '@utils/bodyMeasurement';

const measurements = calculateAllMeasurements(poseResult.worldLandmarks, 175);

<InteractiveAnnotations currentMeasurement={measurements} />
```

### With Comparison

```tsx
import { InteractiveAnnotations, calculateComparison } from '@organisms/OBodyModel3D';

const comparison = calculateComparison(beforeMeasurements, afterMeasurements);

<InteractiveAnnotations
  currentMeasurement={afterMeasurements}
  comparisonData={comparison}
  userId="user-123"
/>
```

### With Progress Tracking

```tsx
const progressEntries = [
  { date: '2025-01-01', result: session1, score: 80 },
  { date: '2025-01-15', result: session2, score: 85 },
  { date: '2025-02-01', result: session3, score: 90 },
];

<InteractiveAnnotations
  currentMeasurement={session3}
  progressEntries={progressEntries}
/>
```

### Export Report

```tsx
import { generateComparisonReport, exportReportToJSON } from '@organisms/OBodyModel3D';

const handleExport = () => {
  const report = generateComparisonReport(comparison, 'user-123');
  exportReportToJSON(report, `comparison-${Date.now()}.json`);
};

<Button onClick={handleExport}>Export Report</Button>
```

## Troubleshooting

### Annotations Not Visible

**Issue:** Measurement labels not appearing on 3D model.

**Solution:** Ensure `currentMeasurement` contains segments and circumferences with valid data.

### Screen Position Incorrect

**Issue:** Labels misaligned with 3D model.

**Solution:** Verify canvas size and camera position are correct. Labels use projection matrix that depends on canvas dimensions.

### Export Not Working

**Issue:** JSON export doesn't trigger download.

**Solution:** Check browser permissions for downloads. Ensure popup blockers aren't interfering.

## Future Enhancements

### Phase 3 Considerations

1. **Real-time Annotation Updates** - Update labels during pose animation
2. **AR Overlay** - Project annotations onto live video feed
3. **Custom Annotation Colors** - User-defined color schemes
4. **Multi-Session Comparison** - Compare 3+ measurements simultaneously
5. **Voice-Activated Navigation** - "Show chest measurement"

## References

- **Story:** `docs/implementation-reports/body-measurement-sdk/stories/EPIC-001-S13-interactive-annotations.md`
- **Types:** `src/components/organisms/OBodyModel3D/types/annotations.ts`
- **Utils:** `src/components/organisms/OBodyModel3D/utils/annotationUtils.ts`
- **Tests:** `src/components/organisms/OBodyModel3D/__tests__/`

---

**Completion Date:** 2026-01-10
**Agent:** dev
**Phase:** 2 (FINAL)
