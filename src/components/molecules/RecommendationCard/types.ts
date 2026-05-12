/**
 * RecommendationCard Component Types
 * EPIC-019-S1: Recommendation Card Molecule
 */

import type { StrapiRecommendation } from '@services/api/types/recommendations';

/**
 * RecommendationCard Props Interface
 *
 * @property {StrapiRecommendation} recommendation - Recommendation data from Strapi CMS
 * @property {Function} [onClick] - Optional click handler with recommendation ID
 * @property {boolean} [loading] - Optional loading state for skeleton display
 *
 * @example
 * ```typescript
 * <RecommendationCard
 *   recommendation={strapiRecommendation}
 *   onClick={(id) => navigate(`/recommendations/${id}`)}
 *   loading={false}
 * />
 * ```
 */
export interface RecommendationCardProps {
	/** Recommendation data from Strapi CMS */
	recommendation: StrapiRecommendation;

	/** Optional click handler - receives recommendation ID */
	onClick?: (id: number) => void;

	/** Optional loading state for skeleton display */
	loading?: boolean;
}
