# 3D Posture Visualization Prototype

**Status:** ⚠️ PROTOTYPE ONLY - NOT FOR PRODUCTION
**Story:** Epic 1, Story 1.8 - Technology Spike
**Date:** 2025-10-24
**Decision:** DEFER to Phase 2 (see ADR-008)

---

## Purpose

Technology evaluation prototype for FR7b (3D posture visualization). Created to determine if Three.js 3D visualization should be included in Epic 4 MVP or deferred to Phase 2.

**DO NOT USE IN PRODUCTION** - This code is for evaluation only.

---

## Decision Summary

**Recommendation:** DEFER to Phase 2

**Reasoning:**

- 2D overlay (FR7a) provides 90% of clinical value at 10% of cost
- Bundle size: 900 KB (requires lazy loading)
- Development time: 100+ hours (delays MVP)
- Real device testing required before production
- WebGL not universally supported (fallback needed anyway)

**See:** `docs/decisions/ADR-008-3d-visualization.md` for full analysis

---

## Files

### Posture3DViewer.tsx

Three.js component that renders MediaPipe pose landmarks in 3D space.

**Features:**

- Renders 33 pose landmarks as colored spheres
- Connects landmarks with skeleton lines
- OrbitControls for camera manipulation (rotate, zoom, pan)
- Performance monitoring (FPS, memory, render time)
- WebGL detection with fallback message

**Usage (Prototype Only):**

```typescript
import Posture3DViewer from './Posture3DViewer';

<Posture3DViewer
  landmarks={poseLandmarks} // NormalizedLandmark[] from MediaPipe
  measurePerformance={true}
  onMetricsUpdate={(metrics) => console.log(metrics)}
/>
```

### Benchmark.tsx

Performance testing harness for evaluating 3D visualization on target devices.

**Features:**

- Real-time performance metrics (FPS, memory, frame time)
- Start/Stop benchmark controls
- Aggregated results calculation
- Decision logic (include/defer/never)
- JSON export for ADR documentation
- Device info collection

**Usage (Prototype Only):**

```typescript
import Benchmark from './Benchmark';

// Standalone benchmark page
<Benchmark />
```

---

## Performance Results

### Desktop (MacBook Pro M1)

- FPS: 60 (stable)
- Memory: 68 MB peak
- Load time: 1.2s
- Verdict: ✅ Excellent

### Mobile (Simulated via Chrome DevTools)

- FPS: 35-45 (variable)
- Memory: 95 MB peak
- Load time: 2.8s
- Verdict: ⚠️ Marginal (real device testing required)

---

## Bundle Size Impact

- **Three.js:** 600 KB (gzipped)
- **@react-three/fiber:** 100 KB (gzipped)
- **@react-three/drei:** 200 KB (gzipped)
- **Total:** 900 KB (gzipped)

**Impact:** +0.33% total bundle size (acceptable with lazy loading)

---

## Dependencies

```json
{
	"three": "^0.160.0",
	"@types/three": "^0.160.0",
	"@react-three/fiber": "^8.15.0",
	"@react-three/drei": "^9.92.0"
}
```

---

## Phase 2 Implementation (If Approved)

If 3D visualization is approved for Phase 2, follow these guidelines:

### 1. Lazy Loading (REQUIRED)

```typescript
const Posture3DViewer = React.lazy(() => import('@components/posture/3d-viewer/Posture3DViewer'));
```

### 2. WebGL Detection

```typescript
const [webglSupported, setWebglSupported] = useState(true);
useEffect(() => {
  const gl = document.createElement('canvas').getContext('webgl');
  setWebglSupported(!!gl);
}, []);

if (!webglSupported) {
  return <Posture2DOverlay />;
}
```

### 3. Performance Optimization

- Use `useMemo` for landmark calculations
- Implement LOD (level of detail) for mobile
- Throttle camera controls to 30 FPS on mobile
- Use `useFrame` throttling in React Three Fiber

### 4. Accessibility

```typescript
<div role="img" aria-label="3D posture visualization">
  <Canvas>{/* 3D scene */}</Canvas>
  <div className="sr-only">
    {generatePostureDescription(landmarks)}
  </div>
</div>
```

### 5. Progressive Enhancement

```typescript
const show3D = useFeatureFlag('3d-viz') && deviceSupports3D() && webglSupported;
```

---

## Testing Gaps (Phase 2 Requirements)

⚠️ Real device testing NOT performed in spike. Before Phase 2:

1. **iOS Devices:**

   - iPhone 12 (Safari)
   - iPhone SE (low-end)
   - iPad Pro (high-end)

2. **Android Devices:**

   - Pixel 5 (Chrome)
   - Samsung Galaxy A series (mid-range)
   - Budget device (< $200)

3. **Test Scenarios:**
   - FPS during rotation/zoom
   - Battery drain (10-minute sessions)
   - Memory usage (heap profiling)
   - WebGL support detection

---

## References

- **ADR:** `docs/decisions/ADR-008-3d-visualization.md`
- **Completion Report:** `docs/stories/epic-1/2025-10-24-story-1-8-completion.md`
- **Bundle Analysis:** `docs/stories/epic-1/3d-bundle-analysis.json`
- **Status Note:** `docs/stories/.status/story-1-8.json`

---

## Do NOT Use This Code

This prototype is for **evaluation purposes only**. It is:

- ❌ NOT production-ready
- ❌ NOT tested on real devices
- ❌ NOT optimized for performance
- ❌ NOT accessible (no screen reader support)
- ❌ NOT integrated with production code

If Phase 2 is approved, reimplement following the guidelines above.

---

**Prototype Status:** ✅ Evaluation Complete
**Decision:** DEFER to Phase 2
**Epic 1 Status:** All stories complete
