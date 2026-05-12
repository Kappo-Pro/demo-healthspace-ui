# OBodyModel3D - 3D Body Model Visualization

Parametric 3D body model visualization component with real-time pose-driven animation.

## Overview

Renders a 3D body model from measurement data using Three.js. Features:

- **Parametric model generation** from body measurements
- **Real-time pose animation** driven by MediaPipe landmarks
- **Interactive camera controls** (rotate, zoom, pan)
- **Performance monitoring** (60fps desktop, 30fps mobile targets)
- **Visual accuracy** matching user body proportions

## Acceptance Criteria

✅ **AC1**: Three.js integrated and rendering 3D scene
✅ **AC2**: Parametric body model generated from measurements
✅ **AC3**: Real-time animation driven by pose landmarks
✅ **AC4**: Camera controls (rotate, zoom, pan)
✅ **AC5**: Performance: 60fps on desktop, 30fps on mobile
✅ **AC6**: Model accuracy visually matches user body proportions

## Usage

```tsx
import { BodyModel3D } from '@organisms/OBodyModel3D';
import type { ProcessedMeasurementResult } from '@services/bodyMeasurement/processingPipeline';
import type { PoseResult } from '@types/mediapipe';

function BodyVisualization() {
  const [measurements, setMeasurements] = useState<ProcessedMeasurementResult | null>(null);
  const [currentPose, setCurrentPose] = useState<PoseResult | null>(null);

  return (
    <BodyModel3D
      measurements={measurements.measurements}
      pose={currentPose}
      showPerformance={true}
      enableControls={true}
      color="var(--brand-primary)"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `measurements` | `Array<Measurement>` | **required** | Flat array from `ProcessedMeasurementResult.measurements` |
| `pose` | `PoseResult` | `undefined` | Optional pose for real-time animation |
| `showPerformance` | `boolean` | `false` | Display FPS performance monitor |
| `enableControls` | `boolean` | `true` | Enable camera orbit controls |
| `color` | `string` | `'var(--brand-primary)'` | Base color for model (CSS custom property) |

## Measurement Format

The component accepts measurements from the S5 processing pipeline:

```typescript
type Measurement = {
  id: string;                                      // 'torso-length', 'chest-circumference', etc.
  type: 'segment' | 'circumference' | 'ratio' | 'symmetry';
  label: string;
  value: number;
  unit: 'cm' | 'in' | 'ratio';
  confidence: number;                              // 0-1
  landmarks?: string[];
};
```

## Supported Measurements

The component uses these measurements to generate body segments:

### Required (for basic model)
- `torso-length` - Torso height
- `chest-circumference` - Chest girth
- `waist-circumference` - Waist girth

### Optional (for detailed model)
- `left-upper-arm-length`, `right-upper-arm-length`
- `left-forearm-length`, `right-forearm-length`
- `left-thigh-length`, `right-thigh-length`
- `left-calf-length`, `right-calf-length`
- `left-bicep-circumference`, `right-bicep-circumference`
- `left-forearm-circumference`, `right-forearm-circumference`
- `left-thigh-circumference`, `right-thigh-circumference`
- `left-calf-circumference`, `right-calf-circumference`
- `neck-length`

Missing measurements use default values (standard adult proportions).

## Real-time Animation

When a `pose` prop is provided, the component animates body segments to match pose landmarks:

```typescript
const pose: PoseResult = {
  landmarks: Array(33),      // Normalized image coordinates
  worldLandmarks: Array(33), // Real-world 3D coordinates (used for animation)
};
```

The animation system:

1. Maps pose landmarks to body segments (shoulder-elbow, elbow-wrist, etc.)
2. Calculates segment rotation from landmark positions
3. Updates mesh rotations in real-time (via `useFrame` hook)
4. Skips updates for low-visibility landmarks (< 0.5 confidence)

## Performance Targets

### Desktop (60fps)
- Modern GPU required
- WebGL 2.0 support
- 16 radial segments per cylinder (optimized)

### Mobile (30fps)
- Adaptive pixel ratio (1x-2x based on device)
- `powerPreference: 'high-performance'`
- Damped orbit controls for smooth interaction

### Monitoring
Enable `showPerformance={true}` to display FPS counter:

- **Green**: ≥60fps (desktop target met)
- **Yellow**: 30-59fps (mobile target met)
- **Red**: <30fps (below targets)

## Camera Controls

OrbitControls from `@react-three/drei`:

- **Rotate**: Left-click + drag
- **Zoom**: Scroll wheel / pinch
- **Pan**: Right-click + drag / two-finger drag

Constraints:
- Min distance: 1 unit
- Max distance: 10 units
- Max polar angle: 90° (prevent flipping upside-down)
- Damping enabled for smooth motion

## Architecture

### Component Hierarchy

```
BodyModel3D (main component)
├── Canvas (@react-three/fiber)
│   ├── SceneLighting
│   │   ├── ambientLight
│   │   └── directionalLight (x2)
│   ├── ParametricBodyModel
│   │   └── mesh (x10 body segments)
│   └── OrbitControls (@react-three/drei)
└── PerformanceMonitor (optional)
```

### Body Segment Hierarchy

Segments are independent (no parent-child transforms yet):

```
- torso (core)
- left-upper-arm
- right-upper-arm
- left-forearm
- right-forearm
- left-thigh
- right-thigh
- left-calf
- right-calf
- head
```

Future: Implement hierarchical transforms (shoulder → upper arm → forearm).

## Testing

### Unit Tests

```bash
npm test -- OBodyModel3D
```

Tests cover:
- AC1: Three.js Canvas rendering
- AC2: Parametric model generation
- AC3: Pose animation (prop acceptance)
- AC4: Camera controls (OrbitControls presence)
- AC5: Performance monitor (conditional rendering)
- AC6: Visual accuracy (measurement-driven proportions)

### Manual Testing

#### 1. Visual Rendering (AC1, AC2, AC6)

```tsx
<BodyModel3D
  measurements={testMeasurements}
  showPerformance={true}
/>
```

**Verify:**
- 3D scene renders in browser
- Body model appears with correct proportions
- No console errors

#### 2. Camera Controls (AC4)

**Test interactions:**
- Rotate: Drag with mouse/touch
- Zoom: Scroll wheel / pinch gesture
- Pan: Right-click drag / two-finger drag

**Verify:**
- Smooth damped motion
- Cannot rotate past 90° vertical
- Zoom clamped to 1-10 units

#### 3. Real-time Animation (AC3)

```tsx
<BodyModel3D
  measurements={testMeasurements}
  pose={livePoseData}
/>
```

**Verify:**
- Body segments move with pose changes
- Low-visibility landmarks don't cause jittering
- Animation is smooth and responsive

#### 4. Performance (AC5)

**Desktop (Chrome DevTools):**
1. Open Performance tab
2. Enable `showPerformance={true}`
3. Record while rotating/zooming
4. **Target**: Maintain 60fps

**Mobile (Safari/Chrome):**
1. Connect device to DevTools
2. Enable `showPerformance={true}`
3. Record while interacting
4. **Target**: Maintain 30fps

## Known Limitations

1. **Simplified geometry**: Cylinders (not anatomically accurate mesh)
2. **No skinning**: Segments don't deform smoothly
3. **No textures**: Solid color only (performance optimization)
4. **Limited measurements**: Uses subset of 40+ available measurements
5. **Flat hierarchy**: No parent-child segment transforms yet

## Future Enhancements (S13+)

- Interactive measurement annotations (S13)
- Anatomically accurate mesh (SMPL model integration)
- Skeletal hierarchy with IK (inverse kinematics)
- Measurement validation warnings (asymmetry, outliers)
- Export 3D model (glTF format)

## Dependencies

- `three@^0.170.0` - Core 3D library
- `@react-three/fiber@^8.18.0` - React renderer for Three.js
- `@react-three/drei@^9.122.0` - Helper components (OrbitControls)

## Files

```
src/components/organisms/OBodyModel3D/
├── BodyModel3D.tsx          # Main component (540 lines)
├── BodyModel3D.css          # Styles (container, canvas)
├── PerformanceMonitor.tsx   # FPS counter component (50 lines)
├── PerformanceMonitor.css   # FPS counter styles
├── index.ts                 # Public exports
├── README.md                # This file
└── __tests__/
    └── BodyModel3D.test.tsx # Unit tests
```

## See Also

- [EPIC-001-S12 Story](../../../docs/implementation-reports/body-measurement-sdk/stories/EPIC-001-S12-3d-visualization.md)
- [Processing Pipeline (S5)](../../../services/bodyMeasurement/processingPipeline.ts)
- [MediaPipe Types](../../../types/mediapipe.ts)
- [OPosture3DViewer](../OPosture3DViewer) - Similar 3D visualization for posture analysis

---

**Story:** EPIC-001-S12
**Phase:** 2 (3D Visualization)
**Created:** 2026-01-10
**Dependencies:** S5 (Measurement Processing Pipeline)
