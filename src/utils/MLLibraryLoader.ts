/**
 * Dynamic ML/AI Library Loader
 *
 * This utility provides lazy loading for heavy ML/AI libraries (MediaPipe, TensorFlow)
 * to reduce initial bundle size. Libraries are only loaded when users access AI features.
 *
 * Benefits:
 * - 10 MB savings for non-AI users (~80% of users)
 * - Improved initial page load performance
 * - Better Core Web Vitals scores
 *
 * Usage:
 * ```typescript
 * const { PoseLandmarker } = await loadMediaPipeTasks();
 * const tf = await loadTensorFlow();
 * ```
 */

// MediaPipe Tasks Vision (Posture Analysis)
let mediaPipeTasksPromise: Promise<typeof import('@mediapipe/tasks-vision')> | null = null;

export async function loadMediaPipeTasks() {
  if (!mediaPipeTasksPromise) {
    mediaPipeTasksPromise = import('@mediapipe/tasks-vision');
  }
  return mediaPipeTasksPromise;
}

// MediaPipe Holistic (ROM Analysis)
let mediaPipeHolisticPromise: Promise<typeof import('@mediapipe/holistic')> | null = null;

export async function loadMediaPipeHolistic() {
  if (!mediaPipeHolisticPromise) {
    mediaPipeHolisticPromise = import('@mediapipe/holistic');
  }
  return mediaPipeHolisticPromise;
}

// MediaPipe Pose (ROM Analysis)
let mediaPipePosePromise: Promise<typeof import('@mediapipe/pose')> | null = null;

export async function loadMediaPipePose() {
  if (!mediaPipePosePromise) {
    mediaPipePosePromise = import('@mediapipe/pose');
  }
  return mediaPipePosePromise;
}

// MediaPipe Camera Utils
let mediaPipeCameraPromise: Promise<typeof import('@mediapipe/camera_utils')> | null = null;

export async function loadMediaPipeCamera() {
  if (!mediaPipeCameraPromise) {
    mediaPipeCameraPromise = import('@mediapipe/camera_utils');
  }
  return mediaPipeCameraPromise;
}

// MediaPipe Drawing Utils
let mediaPipeDrawingPromise: Promise<typeof import('@mediapipe/drawing_utils')> | null = null;

export async function loadMediaPipeDrawing() {
  if (!mediaPipeDrawingPromise) {
    mediaPipeDrawingPromise = import('@mediapipe/drawing_utils');
  }
  return mediaPipeDrawingPromise;
}

// TensorFlow.js Core
let tensorFlowPromise: Promise<typeof import('@tensorflow/tfjs')> | null = null;

export async function loadTensorFlow() {
  if (!tensorFlowPromise) {
    tensorFlowPromise = import('@tensorflow/tfjs');
  }
  return tensorFlowPromise;
}

// TensorFlow Handpose Model
let handposePromise: Promise<typeof import('@tensorflow-models/handpose')> | null = null;

export async function loadHandpose() {
  if (!handposePromise) {
    handposePromise = import('@tensorflow-models/handpose');
  }
  return handposePromise;
}

// Fingerpose (Hand Gesture Recognition)
let fingerposePromise: Promise<typeof import('fingerpose')> | null = null;

export async function loadFingerpose() {
  if (!fingerposePromise) {
    fingerposePromise = import('fingerpose');
  }
  return fingerposePromise;
}

// TensorFlow WASM Backend
let tfWasmPromise: Promise<typeof import('@tensorflow/tfjs-backend-wasm')> | null = null;

export async function loadTensorFlowWasm() {
  if (!tfWasmPromise) {
    tfWasmPromise = import('@tensorflow/tfjs-backend-wasm');
  }
  return tfWasmPromise;
}

/**
 * Preload all MediaPipe libraries for Posture/ROM analysis
 * Use this when user enters posture scan or ROM analysis screens
 */
export async function preloadMediaPipeLibraries() {
  return Promise.all([
    loadMediaPipeTasks(),
    loadMediaPipeCamera(),
    loadMediaPipeDrawing(),
  ]);
}

/**
 * Preload all TensorFlow libraries for hand gesture recognition
 * Use this when user enables gesture control in Rehab exercises
 */
export async function preloadTensorFlowLibraries() {
  return Promise.all([
    loadTensorFlow(),
    loadHandpose(),
    loadFingerpose(),
    loadTensorFlowWasm(),
  ]);
}

/**
 * Check if MediaPipe libraries are loaded
 */
export function isMediaPipeLoaded() {
  return mediaPipeTasksPromise !== null;
}

/**
 * Check if TensorFlow libraries are loaded
 */
export function isTensorFlowLoaded() {
  return tensorFlowPromise !== null;
}

/**
 * Reset library loaders (for testing purposes)
 */
export function resetLoaders() {
  mediaPipeTasksPromise = null;
  mediaPipeHolisticPromise = null;
  mediaPipePosePromise = null;
  mediaPipeCameraPromise = null;
  mediaPipeDrawingPromise = null;
  tensorFlowPromise = null;
  handposePromise = null;
  fingerposePromise = null;
  tfWasmPromise = null;
}
