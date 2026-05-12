# BlazePose GHUM 33-Keypoint Detection

High-fidelity 3D pose estimation using MediaPipe BlazePose GHUM model for body measurement SDK.

## Overview

BlazePose GHUM provides 33 3D landmarks with x, y, z coordinates and visibility scores. Optimized for body measurement use cases with performance targets:

- **Inference Time:** <3s on modern devices
- **Memory Usage:** <150MB during inference
- **Model Complexity:** Automatic selection (Lite/Full/GHUM)
- **Graceful Degradation:** Falls back on older devices

## Quick Start

```typescript
import { PoseDetectorService } from '@utils/mediapipe/poseDetector';
import { PoseLandmark } from '@types/mediapipe';

// 1. Initialize detector
const detector = new PoseDetectorService();
await detector.initialize(2); // 2=GHUM, 1=Full, 0=Lite

// 2. Detect pose from video frame
const result = await detector.detectPose(imageData);

// 3. Access landmarks
const nose = detector.getLandmark(result, PoseLandmark.NOSE);
console.log(`Nose position: (${nose.x}, ${nose.y}, ${nose.z}), visibility: ${nose.visibility}`);

// 4. Cleanup
detector.dispose();
```

## Architecture

### Files

```
src/
├── types/mediapipe.ts              # Type definitions (PoseLandmark, PoseResult)
├── config/mediapipe.ts             # Configuration (model selection, thresholds)
├── workers/blazepose.worker.ts     # Web Worker for pose detection
└── utils/mediapipe/
    ├── poseDetector.ts             # High-level API service
    ├── deviceCapability.ts         # Device testing and fallback logic
    ├── example-usage.ts            # Usage examples and patterns
    ├── README.md                   # This file
    └── __tests__/
        ├── poseDetector.test.ts         # Unit tests
        ├── performance.test.ts          # Performance benchmarks
        └── deviceCapability.test.ts     # Device compatibility tests
```

### Components

#### 1. PoseDetectorService

High-level API for pose detection. Manages Web Worker lifecycle.

**Methods:**

- `initialize(complexity)` - Initialize with model complexity (0=Lite, 1=Full, 2=GHUM)
- `detectPose(imageData)` - Detect 33 landmarks from ImageData
- `getLandmark(result, landmark)` - Get specific landmark by enum
- `getWorldLandmark(result, landmark)` - Get world coordinates (meters)
- `isLandmarkVisible(landmark, threshold)` - Check visibility score
- `getPerformanceStats()` - Get aggregate performance metrics
- `dispose()` - Cleanup worker resources

#### 2. BlazePose Worker

Web Worker running MediaPipe BlazePose in isolated thread.

**Messages:**

- `INIT_BLAZEPOSE` - Initialize with model complexity
- `DETECT_POSE` - Run detection on ImageData

**Responses:**

- `INIT_SUCCESS` - Initialization complete
- `POSE_RESULT` - Detection results (33 landmarks + duration)
- `ERROR` - Error occurred

#### 3. Device Capability

Tests device performance and recommends model complexity.

**Functions:**

- `checkDeviceCapability()` - Run inference test, return recommendation
- `testModelComplexity(complexity)` - Test specific model
- `getFallbackComplexity(current)` - Get next lower complexity

#### 4. Configuration

Performance targets and model selection heuristics.

**Config:**

- `getRecommendedModelComplexity()` - Heuristic-based selection
- `canDeviceRunGHUM()` - Quick check if GHUM supported
- `PERFORMANCE_TARGETS` - Max inference time, memory limits

## 33 Landmarks

BlazePose GHUM detects 33 landmarks in 4 groups:

### Face (11 landmarks)

- 0: NOSE
- 1-3: LEFT_EYE (inner, center, outer)
- 4-6: RIGHT_EYE (inner, center, outer)
- 7-8: LEFT_EAR, RIGHT_EAR
- 9-10: MOUTH_LEFT, MOUTH_RIGHT

### Upper Body (6 landmarks)

- 11-12: LEFT_SHOULDER, RIGHT_SHOULDER
- 13-14: LEFT_ELBOW, RIGHT_ELBOW
- 15-16: LEFT_WRIST, RIGHT_WRIST

### Hands (6 landmarks)

- 17-18: LEFT_PINKY, RIGHT_PINKY
- 19-20: LEFT_INDEX, RIGHT_INDEX
- 21-22: LEFT_THUMB, RIGHT_THUMB

### Lower Body (10 landmarks)

- 23-24: LEFT_HIP, RIGHT_HIP
- 25-26: LEFT_KNEE, RIGHT_KNEE
- 27-28: LEFT_ANKLE, RIGHT_ANKLE
- 29-30: LEFT_HEEL, RIGHT_HEEL
- 31-32: LEFT_FOOT_INDEX, RIGHT_FOOT_INDEX

## Coordinate Systems

### Normalized Landmarks (0-1 range)

```typescript
interface PoseLandmark3D {
	x: number; // 0-1 (image width)
	y: number; // 0-1 (image height)
	z: number; // Depth relative to hips (negative = closer)
	visibility: number; // 0-1 confidence
}
```

### World Landmarks (meters)

Real-world 3D coordinates from camera. Use for body measurements.

```typescript
const worldNose = detector.getWorldLandmark(result, PoseLandmark.NOSE);
// x, y, z in meters from camera origin
```

## Model Complexity

### Lite (0)

- **Speed:** 50-100ms inference
- **Accuracy:** Good for basic tracking
- **Use Case:** Old devices (iPhone 11-, Android 9-)

### Full (1)

- **Speed:** 100-300ms inference
- **Accuracy:** Balanced performance
- **Use Case:** Modern mobile (iPhone 12+, Android 10+)

### Heavy (GHUM) (2)

- **Speed:** 300-1000ms inference
- **Accuracy:** Best quality for measurements
- **Use Case:** Desktop, high-end mobile

## Device Selection Strategy

### Automatic Selection

```typescript
import { getRecommendedModelComplexity } from '@config/mediapipe';

const complexity = getRecommendedModelComplexity();
// Desktop → 2 (GHUM)
// Modern mobile → 1 (Full)
// Old mobile → 0 (Lite)
```

### Capability Testing

```typescript
import { checkDeviceCapability } from '@utils/mediapipe/deviceCapability';

const capability = await checkDeviceCapability();
console.log(capability.recommendedComplexity); // 0, 1, or 2
console.log(capability.measuredInferenceTime); // Actual time (ms)
```

## Usage Patterns

See `example-usage.ts` for complete examples:

1. **Basic Detection** - Simple one-shot pose detection
2. **Smart Detection** - With device capability testing
3. **Continuous Tracking** - Real-time video pose tracking
4. **Body Measurements** - Extract shoulder width, arm length, etc.
5. **Visibility Filtering** - Filter low-confidence landmarks
6. **Performance Monitoring** - Track FPS and inference time

## Performance Optimization

### 1. Worker Isolation

Web Worker prevents UI thread blocking during inference.

### 2. Model Caching

MediaPipe models cached by browser after first load (~50MB GHUM).

### 3. Segmentation Disabled

Segmentation mask disabled by default (not needed for measurements).

### 4. Landmark Smoothing

Enabled by default for stable results across frames.

### 5. Memory Management

Always call `dispose()` to cleanup worker and prevent leaks.

## Testing

### Unit Tests

```bash
npm test -- poseDetector.test.ts
```

Tests initialization, detection, landmark access, cleanup.

### Performance Tests

```bash
npm test -- performance.test.ts
```

Benchmarks inference time, memory usage, model complexity.

### Device Tests

```bash
npm test -- deviceCapability.test.ts
```

Tests device detection, fallback logic, capability testing.

## Known Limitations

### Z-Coordinate Accuracy

Z (depth) is less accurate than X/Y due to monocular camera limitations. Use world landmarks for scale-aware measurements.

### Model Download Size

GHUM model ~50MB on first load. Consider showing loading indicator.

### Inference Variance

Mobile devices: 500-2500ms depending on model/device.
Desktop: 300-1000ms for GHUM.

### Occlusion Handling

Landmarks behind body return low visibility scores (<0.5). Always check visibility before using landmark.

## Integration with Existing Code

### ROM/Posture Workflows

BlazePose GHUM does NOT affect existing ROM/posture code using MediaPipe Tasks Vision (`src/workers/mediapipe.worker.ts`).

Both workers coexist:

- **mediapipe.worker.ts** - Existing Tasks Vision API (ROM/posture)
- **blazepose.worker.ts** - New BlazePose GHUM (body measurements)

### Migration Path

To migrate existing code to BlazePose GHUM:

1. Import `PoseDetectorService` instead of Tasks Vision
2. Use `PoseLandmark` enum for landmark access
3. Switch to 33-landmark format (from 32)
4. Update landmark indices if needed

## Future Improvements

### Phase 2 Enhancements

- TensorFlow Lite version for React Native (S15)
- Multi-frame averaging for improved accuracy (S5)
- Custom model fine-tuning for body measurements
- Background blur integration (S8)

### Performance Optimizations

- WebGPU acceleration when available
- Model quantization for faster mobile inference
- Landmark prediction between frames (temporal smoothing)

## References

- [MediaPipe Pose](https://google.github.io/mediapipe/solutions/pose.html)
- [BlazePose Paper](https://arxiv.org/abs/2006.10204)
- [BlazePose GHUM Model](https://google.github.io/mediapipe/solutions/models.html#pose)

## Support

For issues or questions:

1. Check `example-usage.ts` for usage patterns
2. Review test files for edge cases
3. Consult Story S3 completion report in `docs/implementation-reports/body-measurement-sdk/`

---

**Last Updated:** 2026-01-08
**Story:** EPIC-001-S3
**Version:** 1.0.0
