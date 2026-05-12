/**
 * RecommendationsList Organism Component
 * EPIC-019-S4: Display grid of recommendations with pagination and state handling
 * EPIC-020-S3: Connect to Redux selectors for personalized filtering
 * EPIC-020-S4: Implement fallback logic (no matches → generic recommendations)
 *
 * Features:
 * - RTK Query integration for data fetching
 * - Redux selector integration for user preferences (functional goals, persona, audience)
 * - Fallback to generic recommendations when personalized query returns 0 results
 * - Responsive grid layout (Ant Design Row/Col)
 * - Loading skeleton states
 * - Empty state UI with fallback handling
 * - Error handling with user-friendly messages
 * - Pagination with scroll-to-top
 * - Card click handler (placeholder for detail view)
 * - Override filters support for flexibility
 */

import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { RecommendationCard } from '@molecules/RecommendationCard';
import { useGetRecommendationsQuery } from '@services/api/recommendationsApi';
import type { RecommendationFilters } from '@services/api/types/recommendations';
import {
	selectUserAudienceId,
	selectUserFunctionalGoalIds,
	selectUserPersonaId} from '@stores/dashboard';
import { useTypedSelector } from '@stores/index';
import { Alert, Col, Empty, Pagination, Row, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';
import './RecommendationsList.css';
import type { RecommendationsListProps } from './types';

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
	filters: overrideFilters = {},
	pageSize = 6,
}) => {
	// Translation hook
	const { t } = useTypedTranslation();

	// Local state for pagination
	const [page, setPage] = useState(1);

	// EPIC-020-S4: Fallback state for generic recommendations
	const [useFallback, setUseFallback] = useState(false);

	// EPIC-020-S3: Get user profile filters from Redux selectors
	const functionalGoalIds = useTypedSelector(selectUserFunctionalGoalIds);
	const personaId = useTypedSelector(selectUserPersonaId);
	const audienceId = useTypedSelector(selectUserAudienceId);

	// Build personalized filters with user preferences
	const personalizedFilters: RecommendationFilters = useMemo(
		() => ({
			functionalGoalIds,
			personaId,
			audienceId,
			...overrideFilters, // Allow component consumer to override
			page,
			pageSize,
		}),
		[functionalGoalIds, personaId, audienceId, overrideFilters, page, pageSize],
	);

	// Generic filters without personalization (fallback)
	const genericFilters: RecommendationFilters = useMemo(
		() => ({
			page,
			pageSize,
		}),
		[page, pageSize],
	);

	// EPIC-020-S4: Use fallback filters if personalized query returned 0 results
	const activeFilters = useFallback ? genericFilters : personalizedFilters;

	// RTK Query hook for fetching recommendations
	const { data, isLoading, error } = useGetRecommendationsQuery(activeFilters);

	// EPIC-020-S4: Trigger fallback if personalized query returns 0 results
	useEffect(() => {
		// Only trigger fallback if:
		// 1. Not already loading
		// 2. Data exists but has 0 results
		// 3. Not already using fallback (prevent infinite loop)
		// 4. User had personalized filters (no point in fallback if no filters)
		if (!isLoading && data?.data && data.data.length === 0 && !useFallback) {
			// Check if user had any personalized filters
			const hasPersonalizedFilters =
				functionalGoalIds.length > 0 ||
				personaId !== undefined ||
				audienceId !== undefined;

			if (hasPersonalizedFilters) {
				setUseFallback(true);
			}
		}
	}, [data, isLoading, useFallback, functionalGoalIds, personaId, audienceId]);

	// Handle pagination with scroll-to-top for better UX
	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	// Handle card click (placeholder for future detail modal/page)
	const handleCardClick = useCallback((_id: number) => {
		// TODO: EPIC-019-S5: Open recommendation detail modal
	}, []);

	// Error state
	if (error) {
		const errorMessage =
			'data' in error && error.data && typeof error.data === 'object'
				? (error.data as { message?: string }).message
				: t('common.recommendations.errorLoadingDescription');

		return (
			<Alert
				message={t('common.recommendations.errorLoadingTitle')}
				description={errorMessage}
				type="error"
				showIcon
				className="recommendations-list-error"
			/>
		);
	}

	// Loading state
	if (isLoading) {
		return <LoadingSkeleton count={pageSize} />;
	}

	// Empty state
	if (!data?.data || data.data.length === 0) {
		return (
			<Empty
				description={t('common.recommendations.noRecommendationsAvailable')}
				image={Empty.PRESENTED_IMAGE_SIMPLE}
				className="recommendations-list-empty">
				<p className="recommendations-list-empty-hint">
					{t('common.recommendations.completeAssessmentsHint')}
				</p>
			</Empty>
		);
	}

	const { data: recommendations, meta } = data;

	return (
		<div className="recommendations-list">
			{/* EPIC-020-S4: Show fallback message when using generic recommendations */}
			{useFallback && (
				<Alert
					message={t('common.recommendations.fallbackTitle')}
					description={t('common.recommendations.fallbackDescription')}
					type="info"
					closable
					style={{ marginBottom: 16 }}
				/>
			)}
			<Typography className="recommendations-header">
				<span className="recommendations-title">
					{t('Patient.data.onboard.recommendationTitle')}
				</span>
				<span className="recommendations-description">
					{t('Patient.data.onboard.recommendationDescription')}
				</span>
			</Typography>
			{/* Responsive Grid: xs=1 col, sm=2 cols, md/lg=3 cols */}
			<Row gutter={[16, 16]}>
				{recommendations.map(recommendation => (
					<Col key={recommendation.id} xs={24} sm={12} md={8} lg={8}>
						<RecommendationCard
							recommendation={recommendation}
							onClick={handleCardClick}
						/>
					</Col>
				))}
			</Row>

			{/* Pagination (only show if multiple pages exist) */}
			{meta.pagination.pageCount > 1 && (
				<div className="recommendations-list-pagination">
					<Pagination
						current={page}
						total={meta.pagination.total}
						pageSize={pageSize}
						onChange={handlePageChange}
						showSizeChanger={false}
					/>
				</div>
			)}
		</div>
	);
};

export default RecommendationsList;
