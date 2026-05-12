/**
 * RecommendationCard Molecule Component
 * EPIC-019-S1: Display individual recommendation with title, preview, media, and metadata
 *
 * Features:
 * - Media thumbnail with fallback
 * - Markdown content preview (truncated)
 * - Functional goals as tags
 * - Recommendation type badge
 * - Hover effects
 * - Click handler for expansion
 * - Loading skeleton support
 */

import { Card, Tag, Typography } from 'antd';
import React, { useCallback, useMemo } from 'react';
import './RecommendationCard.css';
import type { RecommendationCardProps } from './types';

const { Paragraph } = Typography;

/**
 * Truncate markdown content for preview
 * Removes markdown syntax for clean display
 */
const truncateMarkdown = (
	content: string | undefined,
	maxLength = 120,
): string => {
	if (!content) return '';

	// Remove markdown syntax (headings, bold, italics, links, code)
	const plainText = content
		.replace(/#{1,6}\s/g, '') // Remove heading markers
		.replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
		.replace(/\*([^*]+)\*/g, '$1') // Remove italics
		.replace(/`([^`]+)`/g, '$1') // Remove inline code
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links (keep text)
		.replace(/\n/g, ' ') // Replace newlines with spaces
		.trim();

	// Truncate to max length
	if (plainText.length <= maxLength) {
		return plainText;
	}

	return `${plainText.substring(0, maxLength)}...`;
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
	recommendation,
	onClick,
	loading = false,
}) => {
	// Handle both Strapi v4 (attributes) and v5 (flat) response formats
	const { id } = recommendation;
	const data =
		'attributes' in recommendation ? recommendation.attributes : recommendation;
	const {
		title,
		recommendation: content,
		functionalGoals,
		recommendationTypes,
	} = data;

	// Truncate content for preview
	const contentPreview = useMemo(() => {
		return truncateMarkdown(content);
	}, [content]);

	// Get recommendation type for badge (handle both v4 and v5 formats)
	const recommendationType = useMemo(() => {
		// Strapi v5: array of objects with direct properties
		// Strapi v4: recommendationTypes.data[0].attributes.name
		if (!recommendationTypes) return undefined;

		const firstType = Array.isArray(recommendationTypes)
			? recommendationTypes[0]
			: recommendationTypes?.data?.[0];

		return firstType?.attributes?.name || firstType?.name;
	}, [recommendationTypes]);

	// Get functional goals (max 3) - handle both v4 and v5 formats
	const displayGoals = useMemo(() => {
		// Strapi v5: array of objects
		// Strapi v4: functionalGoals.data array
		const goalsArray = Array.isArray(functionalGoals)
			? functionalGoals
			: functionalGoals?.data || [];

		if (goalsArray.length === 0) return [];
		return goalsArray.slice(0, 3);
	}, [functionalGoals]);

	// Calculate overflow count
	const overflowCount = useMemo(() => {
		const goalsArray = Array.isArray(functionalGoals)
			? functionalGoals
			: functionalGoals?.data || [];
		const total = goalsArray.length;
		return total > 3 ? total - 3 : 0;
	}, [functionalGoals]);

	// Handle card click
	const handleClick = useCallback(() => {
		if (onClick) {
			onClick(id);
		}
	}, [onClick, id]);

	return (
		<Card
			className="recommendation-card"
			hoverable
			loading={loading}
			size="small"
			onClick={handleClick}
			aria-label={title}>
			{/* Type Badge */}
			{recommendationType && (
				<div className="recommendation-card-header">
					<Tag className="recommendation-card-type">
						{recommendationType}
					</Tag>
				</div>
			)}
			{/* Content Preview */}
			<Paragraph className="recommendation-card-preview">
				{contentPreview}
			</Paragraph>
			{/* Functional Goals Tags */}
			{displayGoals.length > 0 && (
				<div className="recommendation-card-tags">
					{displayGoals.map(goal => (
						<Tag key={goal.id} className="functional-goal-tag">
							{goal.attributes?.name || goal.name}
						</Tag>
					))}
					{overflowCount > 0 && <Tag>+{overflowCount} more</Tag>}
				</div>
			)}
		</Card>
	);
};

export default RecommendationCard;
