/**
 * RecommendationDashboard Component
 * Feature Flag Removal: Hard-coded to control/generic recommendations
 *
 * Product Decision: Use generic recommendations only (control variant).
 * Previously used A/B testing with feature flags (EPIC-025).
 *
 * @see docs/implementation-reports/feature-flag-removal/
 */

import React from 'react';
import { RecommendationsList } from '@organisms/RecommendationsList';
import type { RecommendationFilters } from '@services/api/types/recommendations';
import './style.css';

/**
 * RecommendationDashboard Page Component
 *
 * Displays generic recommendations without user-specific filtering.
 * This provides the baseline recommendation experience to all users.
 *
 * @returns JSX element with generic recommendations
 */
const RecommendationDashboard: React.FC = () => {
	// Empty filters object = no personalization
	// RecommendationsList will fetch generic recommendations
	const genericFilters: RecommendationFilters = {};

	return (
		<div className="recommendations-wrapper">
			<div className="recommendations-container">
				<div
					className="control-recommendations"
					data-testid="control-recommendations">
					<RecommendationsList filters={genericFilters} />
				</div>
			</div>
		</div>
	);
};

export default RecommendationDashboard;
