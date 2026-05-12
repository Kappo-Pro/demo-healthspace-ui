/**
 * RecommendationsList Component Types
 * EPIC-019-S4: Recommendations List Organism
 */

import type { RecommendationFilters } from '@services/api/types/recommendations';

/**
 * RecommendationsList Props Interface
 *
 * @property {RecommendationFilters} [filters] - Optional filters for recommendations query
 * @property {number} [pageSize] - Number of recommendations per page (default: 6)
 */
export interface RecommendationsListProps {
	/** Optional filters for recommendations query */
	filters?: RecommendationFilters;

	/** Number of recommendations per page (default: 6) */
	pageSize?: number;
}
