/**
 * 3D Geometry Utilities for Body Measurement
 *
 * Provides core geometric calculations for pose landmark processing.
 * All calculations use 3D coordinates with visibility-weighted accuracy.
 *
 * @module utils/bodyMeasurement/geometry
 * @since EPIC-001-S2
 */

/**
 * 3D Point with optional visibility score
 *
 * @property x - X coordinate (meters or pixels)
 * @property y - Y coordinate (meters or pixels)
 * @property z - Z coordinate (depth, meters or pixels)
 * @property visibility - Optional confidence score (0-1)
 */
export interface Point3D {
	x: number;
	y: number;
	z: number;
	visibility?: number;
}

/**
 * Calculate Euclidean distance between two 3D points
 *
 * Uses standard distance formula: sqrt((x2-x1)² + (y2-y1)² + (z2-z1)²)
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Distance in same units as input coordinates
 *
 * @example
 * ```typescript
 * const distance = distance3D(
 *   { x: 0, y: 0, z: 0 },
 *   { x: 3, y: 4, z: 0 }
 * ); // Returns 5 (3-4-5 triangle)
 * ```
 */
export function distance3D(p1: Point3D, p2: Point3D): number {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	const dz = p2.z - p1.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Calculate midpoint between two 3D points
 *
 * Returns point at exact center of line segment connecting p1 and p2.
 * Useful for finding body center points (e.g., shoulder midpoint).
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Midpoint with averaged coordinates
 *
 * @example
 * ```typescript
 * const center = midpoint3D(
 *   { x: 0, y: 0, z: 0 },
 *   { x: 10, y: 20, z: 5 }
 * ); // Returns { x: 5, y: 10, z: 2.5 }
 * ```
 */
export function midpoint3D(p1: Point3D, p2: Point3D): Point3D {
	return {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2,
		z: (p1.z + p2.z) / 2,
	};
}

/**
 * Calculate angle between three points (in degrees)
 *
 * Computes angle formed at vertex point by rays to p1 and p2.
 * Uses dot product formula: cos(θ) = (v1·v2) / (|v1||v2|)
 *
 * @param p1 - First endpoint
 * @param vertex - Angle vertex point
 * @param p2 - Second endpoint
 * @returns Angle in degrees (0-180)
 *
 * @example
 * ```typescript
 * const angle = angle3D(
 *   { x: 1, y: 0, z: 0 },
 *   { x: 0, y: 0, z: 0 },
 *   { x: 0, y: 1, z: 0 }
 * ); // Returns 90 (right angle)
 * ```
 */
export function angle3D(p1: Point3D, vertex: Point3D, p2: Point3D): number {
	// Vectors from vertex to endpoints
	const v1 = {
		x: p1.x - vertex.x,
		y: p1.y - vertex.y,
		z: p1.z - vertex.z,
	};
	const v2 = {
		x: p2.x - vertex.x,
		y: p2.y - vertex.y,
		z: p2.z - vertex.z,
	};

	// Dot product
	const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;

	// Magnitudes
	const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
	const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

	// Prevent division by zero
	if (mag1 === 0 || mag2 === 0) {
		return 0;
	}

	// Clamp to [-1, 1] to handle floating point errors
	const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));

	// Convert radians to degrees
	const angleRad = Math.acos(cosAngle);
	return (angleRad * 180) / Math.PI;
}

/**
 * Check if landmark has sufficient visibility for measurement
 *
 * Visibility threshold: 0.5 (50% confidence)
 * Below threshold indicates occlusion or detection uncertainty.
 *
 * @param point - 3D point with visibility score
 * @returns true if visibility >= 0.5, false otherwise
 *
 * @example
 * ```typescript
 * const visible = isLandmarkVisible({ x: 10, y: 20, z: 5, visibility: 0.7 });
 * // Returns true (0.7 >= 0.5)
 * ```
 */
export function isLandmarkVisible(point: Point3D): boolean {
	return (point.visibility ?? 1) >= 0.5;
}

/**
 * Calculate weighted average of visibility scores
 *
 * Used to propagate confidence through multi-landmark calculations.
 * Returns minimum visibility if any landmark is below threshold.
 *
 * @param points - Array of points with visibility scores
 * @returns Weighted average visibility (0-1)
 *
 * @example
 * ```typescript
 * const confidence = averageVisibility([
 *   { x: 0, y: 0, z: 0, visibility: 0.9 },
 *   { x: 1, y: 1, z: 1, visibility: 0.8 }
 * ]); // Returns 0.85
 * ```
 */
export function averageVisibility(points: Point3D[]): number {
	if (points.length === 0) return 0;

	const visibilitySum = points.reduce((sum, p) => sum + (p.visibility ?? 1), 0);
	return visibilitySum / points.length;
}

/**
 * Project 3D point onto 2D plane (ignore Z coordinate)
 *
 * Useful for calculations that only need X/Y dimensions.
 * Preserves visibility score.
 *
 * @param point - 3D point
 * @returns 2D point with z=0
 */
export function project2D(point: Point3D): Point3D {
	return {
		x: point.x,
		y: point.y,
		z: 0,
		visibility: point.visibility,
	};
}

/**
 * Calculate distance between two points ignoring Z-axis
 *
 * Useful when Z-axis accuracy is low (monocular camera).
 * Uses only X and Y coordinates.
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns 2D distance in XY plane
 */
export function distance2D(p1: Point3D, p2: Point3D): number {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	return Math.sqrt(dx * dx + dy * dy);
}
