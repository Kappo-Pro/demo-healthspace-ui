/**
 * strapi.ts
 *
 * Strapi CMS integration types
 *
 * Auto-generated from src/stores/interfaces.ts
 * Migration Date: 2025-10-23
 * Total Types: 5
 */

// ============================================================================
// STRAPI TYPES (5 declarations)
// ============================================================================

export interface StrapiGeneral {
	id: number;
	name: string;
	locale?: string;
}

export interface TStrapiAttributes {
	name: string;
	locale: string;
}

export interface TStrapiFactors {
	id: number;
	name: string;
	locale: string;
}

export interface StrapiOmniPointsToCalculateAngle {
	id: number;
	a: StrapiOmniPoints;
	b: StrapiOmniPoints;
	c: StrapiOmniPoints;
	d: StrapiOmniPoints;
}

export interface StrapiOmniPoints {
	id: number;
	value: number;
	name: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	locale: string;
}
