/**
 * Unit Tests: Geometry Utilities
 *
 * @module utils/bodyMeasurement/__tests__/geometry.test
 */

import {
	distance3D,
	midpoint3D,
	angle3D,
	isLandmarkVisible,
	averageVisibility,
	project2D,
	distance2D,
	Point3D,
} from '../geometry';

describe('Geometry Utilities', () => {
	describe('distance3D', () => {
		it('calculates 3D distance correctly (3-4-5 triangle)', () => {
			const p1 = { x: 0, y: 0, z: 0 };
			const p2 = { x: 3, y: 4, z: 0 };
			expect(distance3D(p1, p2)).toBe(5);
		});

		it('calculates distance with Z-axis', () => {
			const p1 = { x: 0, y: 0, z: 0 };
			const p2 = { x: 1, y: 1, z: 1 };
			expect(distance3D(p1, p2)).toBeCloseTo(Math.sqrt(3), 5);
		});

		it('handles same point (distance = 0)', () => {
			const p1 = { x: 5, y: 10, z: 15 };
			const p2 = { x: 5, y: 10, z: 15 };
			expect(distance3D(p1, p2)).toBe(0);
		});

		it('handles negative coordinates', () => {
			const p1 = { x: -3, y: -4, z: 0 };
			const p2 = { x: 0, y: 0, z: 0 };
			expect(distance3D(p1, p2)).toBe(5);
		});
	});

	describe('midpoint3D', () => {
		it('calculates midpoint correctly', () => {
			const p1 = { x: 0, y: 0, z: 0 };
			const p2 = { x: 10, y: 20, z: 30 };
			const mid = midpoint3D(p1, p2);
			expect(mid.x).toBe(5);
			expect(mid.y).toBe(10);
			expect(mid.z).toBe(15);
		});

		it('handles negative coordinates', () => {
			const p1 = { x: -10, y: -20, z: -30 };
			const p2 = { x: 10, y: 20, z: 30 };
			const mid = midpoint3D(p1, p2);
			expect(mid.x).toBe(0);
			expect(mid.y).toBe(0);
			expect(mid.z).toBe(0);
		});

		it('handles same point', () => {
			const p1 = { x: 5, y: 10, z: 15 };
			const p2 = { x: 5, y: 10, z: 15 };
			const mid = midpoint3D(p1, p2);
			expect(mid.x).toBe(5);
			expect(mid.y).toBe(10);
			expect(mid.z).toBe(15);
		});
	});

	describe('angle3D', () => {
		it('calculates 90-degree angle correctly', () => {
			const p1 = { x: 1, y: 0, z: 0 };
			const vertex = { x: 0, y: 0, z: 0 };
			const p2 = { x: 0, y: 1, z: 0 };
			expect(angle3D(p1, vertex, p2)).toBeCloseTo(90, 1);
		});

		it('calculates 180-degree angle (straight line)', () => {
			const p1 = { x: -1, y: 0, z: 0 };
			const vertex = { x: 0, y: 0, z: 0 };
			const p2 = { x: 1, y: 0, z: 0 };
			expect(angle3D(p1, vertex, p2)).toBeCloseTo(180, 1);
		});

		it('calculates 45-degree angle', () => {
			const p1 = { x: 1, y: 0, z: 0 };
			const vertex = { x: 0, y: 0, z: 0 };
			const p2 = { x: 1, y: 1, z: 0 };
			expect(angle3D(p1, vertex, p2)).toBeCloseTo(45, 1);
		});

		it('handles 3D angles with Z-axis', () => {
			const p1 = { x: 1, y: 0, z: 0 };
			const vertex = { x: 0, y: 0, z: 0 };
			const p2 = { x: 0, y: 0, z: 1 };
			expect(angle3D(p1, vertex, p2)).toBeCloseTo(90, 1);
		});

		it('returns 0 for zero-magnitude vectors', () => {
			const p1 = { x: 0, y: 0, z: 0 };
			const vertex = { x: 0, y: 0, z: 0 };
			const p2 = { x: 1, y: 1, z: 1 };
			expect(angle3D(p1, vertex, p2)).toBe(0);
		});
	});

	describe('isLandmarkVisible', () => {
		it('returns true for visibility >= 0.5', () => {
			expect(isLandmarkVisible({ x: 0, y: 0, z: 0, visibility: 0.5 })).toBe(true);
			expect(isLandmarkVisible({ x: 0, y: 0, z: 0, visibility: 0.9 })).toBe(true);
			expect(isLandmarkVisible({ x: 0, y: 0, z: 0, visibility: 1.0 })).toBe(true);
		});

		it('returns false for visibility < 0.5', () => {
			expect(isLandmarkVisible({ x: 0, y: 0, z: 0, visibility: 0.4 })).toBe(false);
			expect(isLandmarkVisible({ x: 0, y: 0, z: 0, visibility: 0.0 })).toBe(false);
		});

		it('defaults to visible (1.0) if visibility undefined', () => {
			expect(isLandmarkVisible({ x: 0, y: 0, z: 0 })).toBe(true);
		});
	});

	describe('averageVisibility', () => {
		it('calculates average visibility', () => {
			const points: Point3D[] = [
				{ x: 0, y: 0, z: 0, visibility: 0.8 },
				{ x: 1, y: 1, z: 1, visibility: 0.9 },
				{ x: 2, y: 2, z: 2, visibility: 0.7 },
			];
			expect(averageVisibility(points)).toBeCloseTo(0.8, 5);
		});

		it('handles undefined visibility (defaults to 1.0)', () => {
			const points: Point3D[] = [
				{ x: 0, y: 0, z: 0 },
				{ x: 1, y: 1, z: 1, visibility: 0.8 },
			];
			expect(averageVisibility(points)).toBeCloseTo(0.9, 5);
		});

		it('returns 0 for empty array', () => {
			expect(averageVisibility([])).toBe(0);
		});
	});

	describe('project2D', () => {
		it('projects 3D point to 2D (z=0)', () => {
			const point = { x: 10, y: 20, z: 30, visibility: 0.9 };
			const projected = project2D(point);
			expect(projected.x).toBe(10);
			expect(projected.y).toBe(20);
			expect(projected.z).toBe(0);
			expect(projected.visibility).toBe(0.9);
		});

		it('preserves visibility', () => {
			const point = { x: 5, y: 10, z: 15, visibility: 0.75 };
			const projected = project2D(point);
			expect(projected.visibility).toBe(0.75);
		});
	});

	describe('distance2D', () => {
		it('calculates 2D distance (ignores Z)', () => {
			const p1 = { x: 0, y: 0, z: 100 };
			const p2 = { x: 3, y: 4, z: 200 };
			expect(distance2D(p1, p2)).toBe(5); // 3-4-5 triangle
		});

		it('returns same as distance3D when Z is same', () => {
			const p1 = { x: 0, y: 0, z: 0 };
			const p2 = { x: 3, y: 4, z: 0 };
			expect(distance2D(p1, p2)).toBe(distance3D(p1, p2));
		});

		it('differs from distance3D when Z differs', () => {
			const p1 = { x: 0, y: 0, z: 0 };
			const p2 = { x: 3, y: 4, z: 10 };
			expect(distance2D(p1, p2)).toBeLessThan(distance3D(p1, p2));
		});
	});
});
