/**
 * PoseGuidance Component
 *
 * Real-time pose skeleton overlay with feedback.
 * Renders pose landmarks and connections on canvas.
 *
 * @module organisms/OBodyMeasurementSDK/PoseGuidance
 * @since EPIC-001-S4
 */

import React, { useEffect } from 'react';
import type { PoseResult } from '@types/mediapipe';
import { PoseLandmark } from '@types/mediapipe';

export interface PoseGuidanceProps {
	/** Current pose detection result */
	pose: PoseResult;

	/** Current view (front/side/back) */
	view: 'front' | 'side' | 'back';

	/** Canvas element to render on */
	canvas: HTMLCanvasElement;

	/** Canvas width (pixels) */
	width: number;

	/** Canvas height (pixels) */
	height: number;
}

/**
 * MediaPipe Pose Connections
 * Defines which landmarks connect to form skeleton
 */
const POSE_CONNECTIONS: [number, number][] = [
	// Face
	[PoseLandmark.NOSE, PoseLandmark.LEFT_EYE_INNER],
	[PoseLandmark.LEFT_EYE_INNER, PoseLandmark.LEFT_EYE],
	[PoseLandmark.LEFT_EYE, PoseLandmark.LEFT_EYE_OUTER],
	[PoseLandmark.LEFT_EYE_OUTER, PoseLandmark.LEFT_EAR],
	[PoseLandmark.NOSE, PoseLandmark.RIGHT_EYE_INNER],
	[PoseLandmark.RIGHT_EYE_INNER, PoseLandmark.RIGHT_EYE],
	[PoseLandmark.RIGHT_EYE, PoseLandmark.RIGHT_EYE_OUTER],
	[PoseLandmark.RIGHT_EYE_OUTER, PoseLandmark.RIGHT_EAR],
	[PoseLandmark.MOUTH_LEFT, PoseLandmark.MOUTH_RIGHT],

	// Shoulders
	[PoseLandmark.LEFT_SHOULDER, PoseLandmark.RIGHT_SHOULDER],

	// Arms
	[PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW],
	[PoseLandmark.LEFT_ELBOW, PoseLandmark.LEFT_WRIST],
	[PoseLandmark.LEFT_WRIST, PoseLandmark.LEFT_PINKY],
	[PoseLandmark.LEFT_WRIST, PoseLandmark.LEFT_INDEX],
	[PoseLandmark.LEFT_WRIST, PoseLandmark.LEFT_THUMB],
	[PoseLandmark.LEFT_PINKY, PoseLandmark.LEFT_INDEX],

	[PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_ELBOW],
	[PoseLandmark.RIGHT_ELBOW, PoseLandmark.RIGHT_WRIST],
	[PoseLandmark.RIGHT_WRIST, PoseLandmark.RIGHT_PINKY],
	[PoseLandmark.RIGHT_WRIST, PoseLandmark.RIGHT_INDEX],
	[PoseLandmark.RIGHT_WRIST, PoseLandmark.RIGHT_THUMB],
	[PoseLandmark.RIGHT_PINKY, PoseLandmark.RIGHT_INDEX],

	// Torso
	[PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_HIP],
	[PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_HIP],
	[PoseLandmark.LEFT_HIP, PoseLandmark.RIGHT_HIP],

	// Legs
	[PoseLandmark.LEFT_HIP, PoseLandmark.LEFT_KNEE],
	[PoseLandmark.LEFT_KNEE, PoseLandmark.LEFT_ANKLE],
	[PoseLandmark.LEFT_ANKLE, PoseLandmark.LEFT_HEEL],
	[PoseLandmark.LEFT_ANKLE, PoseLandmark.LEFT_FOOT_INDEX],
	[PoseLandmark.LEFT_HEEL, PoseLandmark.LEFT_FOOT_INDEX],

	[PoseLandmark.RIGHT_HIP, PoseLandmark.RIGHT_KNEE],
	[PoseLandmark.RIGHT_KNEE, PoseLandmark.RIGHT_ANKLE],
	[PoseLandmark.RIGHT_ANKLE, PoseLandmark.RIGHT_HEEL],
	[PoseLandmark.RIGHT_ANKLE, PoseLandmark.RIGHT_FOOT_INDEX],
	[PoseLandmark.RIGHT_HEEL, PoseLandmark.RIGHT_FOOT_INDEX],
];

/**
 * Get RGB color from HSL
 * Used for skeleton rendering with theme-aware colors
 */
function hslToRgb(h: number, s: number, l: number, a: number): string {
	// Use success color from design system (green)
	// Fallback to calculated HSL if needed
	return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

/**
 * Draw pose skeleton on canvas
 *
 * @param ctx - Canvas 2D context
 * @param pose - Pose result with landmarks
 * @param width - Canvas width
 * @param height - Canvas height
 */
function drawSkeleton(
	ctx: CanvasRenderingContext2D,
	pose: PoseResult,
	width: number,
	height: number
): void {
	const landmarks = pose.landmarks;

	// Draw connections (skeleton lines)
	// Using success color hue (120 = green from design system)
	ctx.strokeStyle = hslToRgb(120, 100, 50, 0.8);
	ctx.lineWidth = 2;

	POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
		const start = landmarks[startIdx];
		const end = landmarks[endIdx];

		// Only draw if both landmarks visible
		if (start && end && start.visibility > 0.5 && end.visibility > 0.5) {
			ctx.beginPath();
			ctx.moveTo(start.x * width, start.y * height);
			ctx.lineTo(end.x * width, end.y * height);
			ctx.stroke();
		}
	});
}

/**
 * Draw keypoints (landmarks) on canvas
 *
 * @param ctx - Canvas 2D context
 * @param pose - Pose result with landmarks
 * @param width - Canvas width
 * @param height - Canvas height
 */
function drawKeypoints(
	ctx: CanvasRenderingContext2D,
	pose: PoseResult,
	width: number,
	height: number
): void {
	pose.landmarks.forEach(landmark => {
		if (landmark.visibility > 0.5) {
			// Color based on visibility (green to yellow)
			const alpha = landmark.visibility;
			const hue = 120 * landmark.visibility; // Green (120) to yellow (60)
			ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;

			ctx.beginPath();
			ctx.arc(landmark.x * width, landmark.y * height, 4, 0, 2 * Math.PI);
			ctx.fill();
		}
	});
}

/**
 * Pose Guidance Component
 *
 * Renders pose skeleton overlay on canvas for real-time feedback.
 *
 * @param props - Component props
 */
export const PoseGuidance: React.FC<PoseGuidanceProps> = ({ pose, view, canvas, width, height }) => {
	useEffect(() => {
		if (!canvas || !pose.landmarks) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Set canvas dimensions
		canvas.width = width;
		canvas.height = height;

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Draw skeleton and keypoints
		drawSkeleton(ctx, pose, width, height);
		drawKeypoints(ctx, pose, width, height);
	}, [pose, canvas, width, height]);

	// Renders to canvas ref (no DOM output)
	return null;
};
