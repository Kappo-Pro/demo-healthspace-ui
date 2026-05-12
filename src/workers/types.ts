/**
 * Shared TypeScript types for MediaPipe worker communication
 * Used by both worker threads and main thread code
 */

import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

// Re-export MediaPipe types
export type { NormalizedLandmark };

// ============================================================================
// Worker Incoming Message Types (Main → Worker)
// ============================================================================

export interface InitPosePayload {
	delegate: 'CPU' | 'GPU';
	modelPath: string;
	/** Enable segmentation mask output for person isolation */
	enableSegmentation?: boolean;
}

export interface InitHandPayload {
	modelPath: string;
}

export interface DetectPayload {
	imageBitmap: ImageBitmap;
	timestamp: number;
}

export type WorkerInMessage =
	| { type: 'INIT'; payload: InitPosePayload }
	| { type: 'INIT_HAND'; payload: InitHandPayload }
	| { type: 'DETECT'; payload: DetectPayload }
	| { type: 'DETECT_HAND'; payload: DetectPayload }
	| { type: 'CLEANUP' };

// ============================================================================
// Worker Outgoing Message Types (Worker → Main)
// ============================================================================

export interface SegmentationMaskData {
	/** Raw mask pixel data (Uint8Array) - each pixel 0-255 confidence */
	data: Uint8Array;
	/** Width of the mask */
	width: number;
	/** Height of the mask */
	height: number;
}

export interface BlurredFrameData {
	/** Composited frame with blurred background + sharp person */
	bitmap: ImageBitmap;
	/** Width of the frame */
	width: number;
	/** Height of the frame */
	height: number;
}

export interface PoseResultsPayload {
	landmarks: NormalizedLandmark[][];
	worldLandmarks?: NormalizedLandmark[][];
	timestamp: number;
	/** Optional segmentation mask for person isolation */
	segmentationMask?: SegmentationMaskData;
	/** Optional composited frame with background blur (synced with mask) */
	blurredFrame?: BlurredFrameData;
}

export interface HandResultsPayload {
	landmarks: NormalizedLandmark[][];
	worldLandmarks?: NormalizedLandmark[][];
	handedness: Array<{ categoryName: string; score: number }>;
}

export interface ErrorPayload {
	message: string;
	code: 'INIT_FAILED' | 'DETECT_FAILED' | 'NOT_READY' | 'UNKNOWN';
}

export type WorkerOutMessage =
	| { type: 'READY' }
	| { type: 'HAND_READY' }
	| { type: 'RESULTS'; payload: PoseResultsPayload }
	| { type: 'HAND_RESULTS'; payload: HandResultsPayload }
	| { type: 'ERROR'; payload: ErrorPayload };

// ============================================================================
// Utility Types
// ============================================================================

export type Delegate = 'CPU' | 'GPU';

export interface MediaPipeWorkerConfig {
	delegate: Delegate;
	poseModelPath: string;
	handModelPath?: string;
	enableHand?: boolean;
}
