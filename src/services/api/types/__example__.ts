/**
 * Example Usage of Strapi Recommendation Types
 *
 * This file demonstrates how to use the recommendation type definitions.
 * DO NOT IMPORT THIS FILE IN PRODUCTION CODE - it's for documentation only.
 *
 * @module services/api/types/__example__
 */

import type {
	StrapiRecommendation as _StrapiRecommendation,
	StrapiRecommendationResponse,
	RecommendationFilters,
} from './recommendations';

/**
 * Example: Type-safe API response handling
 */
function handleRecommendationResponse(
	response: StrapiRecommendationResponse,
): void {
	// TypeScript knows response.data is an array of StrapiRecommendation
	response.data.forEach(recommendation => {
		// Safe access to optional media
		if (recommendation.attributes.media?.data) {
			const _mediaUrl = recommendation.attributes.media.data.attributes.url;
		}

		// Safe access to functional goals
		if (recommendation.attributes.functionalGoals?.data) {
			recommendation.attributes.functionalGoals.data.forEach(_goal => {});
		}

		// Safe access to recommendation types
		if (recommendation.attributes.recommendationTypes?.data) {
			recommendation.attributes.recommendationTypes.data.forEach(_type => {});
		}
	});

	// TypeScript knows pagination structure
	const { pagination: _pagination } = response.meta;
}

/**
 * Example: Type-safe filter construction
 */
function buildFilters(): RecommendationFilters {
	return {
		functionalGoalIds: [1, 3, 5],
		personaId: 2,
		recommendationType: 'Exercise',
		page: 1,
		pageSize: 25,
	};
}

/**
 * Example: Mock API response with full type safety
 */
const mockResponse: StrapiRecommendationResponse = {
	data: [
		{
			id: 42,
			attributes: {
				title: 'Gentle Shoulder Stretches',
				recommendation:
					'## Instructions\n\n1. Stand with feet shoulder-width apart...',
				vitalflowId: 1001,
				media: {
					data: {
						id: 5,
						attributes: {
							url: '/uploads/shoulder-stretch.jpg',
							alternativeText: 'Shoulder stretch demonstration',
							width: 1920,
							height: 1080,
							formats: {
								thumbnail: { url: '/uploads/thumb_shoulder-stretch.jpg' },
								small: { url: '/uploads/small_shoulder-stretch.jpg' },
							},
						},
					},
				},
				functionalGoals: {
					data: [
						{
							id: 3,
							attributes: {
								name: 'Improve Mobility',
								description: 'Increase range of motion and reduce stiffness',
							},
						},
					],
				},
				recommendationTypes: {
					data: [
						{
							id: 2,
							attributes: {
								name: 'Exercise',
							},
						},
					],
				},
				createdAt: '2025-10-15T10:30:00.000Z',
				updatedAt: '2025-10-15T14:00:00.000Z',
				publishedAt: '2025-10-15T14:00:00.000Z',
			},
		},
	],
	meta: {
		pagination: {
			page: 1,
			pageSize: 25,
			pageCount: 4,
			total: 87,
		},
	},
};

// Example usage
handleRecommendationResponse(mockResponse);
const _filters = buildFilters();

export { handleRecommendationResponse, buildFilters, mockResponse };
