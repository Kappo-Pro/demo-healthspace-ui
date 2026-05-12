/**
 * ClinicalSummaryCard.tsx
 *
 * Molecule component for displaying clinical assessment summary
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 *
 * Displays top posture concerns, priority rankings, overall assessment,
 * and expected improvement timeline.
 */

import React from 'react';
import { Card, Flex, Tag, Typography, Divider } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { ClinicalSummary, PriorityLevel } from '@types';
import './ClinicalSummaryCard.css';

const { Title, Text, Paragraph } = Typography;

export interface ClinicalSummaryCardProps {
	/** Clinical summary data */
	summary: ClinicalSummary;
	/** Show full details or compact view */
	variant?: 'full' | 'compact';
	/** Custom class name */
	className?: string;
}

/**
 * ClinicalSummaryCard - Display clinical assessment summary
 *
 * Features:
 * - Top 3 posture concerns with priorities
 * - Overall clinical assessment
 * - Treatment plan summary
 * - Expected improvement timeline
 * - Progress indicators
 * - Full and compact variants
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <ClinicalSummaryCard
 *   summary={{
 *     topConcerns: [
 *       {
 *         id: '1',
 *         bodyArea: 'neck',
 *         measurement: '15° forward tilt',
 *         severity: 'moderate',
 *         priority: 'high',
 *         description: 'Forward head posture'
 *       }
 *     ],
 *     overallAssessment: 'Moderate postural imbalances detected...',
 *     treatmentPlan: 'Focus on neck and shoulder strengthening...',
 *     progressIndicators: ['Improved neck mobility', 'Reduced tension'],
 *     expectedImprovementTimeline: '4-6 weeks',
 *     generatedAt: '2025-10-24T10:00:00Z'
 *   }}
 *   variant="full"
 * />
 * ```
 */
export const ClinicalSummaryCard: React.FC<ClinicalSummaryCardProps> = ({
	summary,
	variant = 'full',
	className = '',
}) => {
	// Get priority color
	const getPriorityColor = (priority: PriorityLevel): string => {
		switch (priority) {
			case 'high':
				return 'error';
			case 'medium':
				return 'warning';
			case 'low':
				return 'success';
			default:
				return 'default';
		}
	};

	// Get priority icon
	const getPriorityIcon = (priority: PriorityLevel): React.ReactNode => {
		switch (priority) {
			case 'high':
				return <UntitledIcon name="exclamationCircle" size={14} />;
			case 'medium':
				return <UntitledIcon name="clock" size={14} />;
			case 'low':
				return <UntitledIcon name="checkCircle" size={14} />;
			default:
				return null;
		}
	};

	// Compact variant
	if (variant === 'compact') {
		return (
			<Card
				className={`clinical-summary-card clinical-summary-card--compact ${className}`}
				size="small">
				<Flex vertical gap="small">
					<Title level={5} className="clinical-summary-card__title">
						Clinical Summary
					</Title>

					{/* Top concerns (compact) */}
					<div className="clinical-summary-card__concerns-compact">
						{summary.topConcerns.slice(0, 3).map((concern, index) => (
							<Flex
								key={concern.id}
								justify="space-between"
								align="center"
								gap="small"
								className="clinical-summary-card__concern-compact">
								<Text strong>
									{index + 1}. {concern.bodyArea}
								</Text>
								<Tag
									color={getPriorityColor(concern.priority)}
									icon={getPriorityIcon(concern.priority)}>
									{concern.priority}
								</Tag>
							</Flex>
						))}
					</div>

					{/* Timeline */}
					<Flex gap="small" align="center">
						<UntitledIcon name="clock" size={14} className="clinical-summary-card__timeline-icon" />
						<Text
							type="secondary"
							className="clinical-summary-card__timeline-text">
							Expected improvement: {summary.expectedImprovementTimeline}
						</Text>
					</Flex>
				</Flex>
			</Card>
		);
	}

	// Full variant
	return (
		<Card
			className={`clinical-summary-card clinical-summary-card--full ${className}`}>
			<Flex vertical gap="middle">
				<div className="clinical-summary-card__header">
					<Title level={4} className="clinical-summary-card__title">
						Your Clinical Summary
					</Title>
					<Text type="secondary" className="clinical-summary-card__date">
						Generated on {new Date(summary.generatedAt).toLocaleDateString()}
					</Text>
				</div>

				{/* Overall assessment */}
				<div className="clinical-summary-card__assessment">
					<Title level={5} className="clinical-summary-card__section-title">
						Overall Assessment
					</Title>
					<Paragraph className="clinical-summary-card__assessment-text">
						{summary.overallAssessment}
					</Paragraph>
				</div>

				<Divider className="clinical-summary-card__divider" />

				{/* Top concerns */}
				<div className="clinical-summary-card__concerns">
					<Title level={5} className="clinical-summary-card__section-title">
						Top 3 Posture Concerns
					</Title>
					<Flex vertical gap="small">
						{summary.topConcerns.slice(0, 3).map((concern, index) => (
							<div key={concern.id} className="clinical-summary-card__concern">
								<Flex justify="space-between" align="start" gap="small">
									<div className="clinical-summary-card__concern-content">
										<Flex gap="small" align="center">
											<Text
												strong
												className="clinical-summary-card__concern-number">
												{index + 1}.
											</Text>
											<div>
												<Text
													strong
													className="clinical-summary-card__concern-area">
													{concern.bodyArea.charAt(0).toUpperCase() +
														concern.bodyArea.slice(1)}
												</Text>
												<div>
													<Text
														type="secondary"
														className="clinical-summary-card__concern-measurement">
														{concern.measurement}
													</Text>
												</div>
												<Paragraph className="clinical-summary-card__concern-description">
													{concern.description}
												</Paragraph>
											</div>
										</Flex>
									</div>
									<Tag
										color={getPriorityColor(concern.priority)}
										icon={getPriorityIcon(concern.priority)}
										className="clinical-summary-card__priority-tag">
										{concern.priority} priority
									</Tag>
								</Flex>
							</div>
						))}
					</Flex>
				</div>

				<Divider className="clinical-summary-card__divider" />

				{/* Treatment plan */}
				<div className="clinical-summary-card__treatment">
					<Title level={5} className="clinical-summary-card__section-title">
						Treatment Approach
					</Title>
					<Paragraph className="clinical-summary-card__treatment-text">
						{summary.treatmentPlan}
					</Paragraph>
				</div>

				{/* Progress indicators */}
				{summary.progressIndicators.length > 0 && (
					<>
						<Divider className="clinical-summary-card__divider" />
						<div className="clinical-summary-card__indicators">
							<Title level={5} className="clinical-summary-card__section-title">
								What to Watch For
							</Title>
							<ul className="clinical-summary-card__indicators-list">
								{summary.progressIndicators.map((indicator, index) => (
									<li
										key={index}
										className="clinical-summary-card__indicator-item">
										<UntitledIcon name="checkCircle" size={14} className="clinical-summary-card__indicator-icon" />
										<Text>{indicator}</Text>
									</li>
								))}
							</ul>
						</div>
					</>
				)}

				<Divider className="clinical-summary-card__divider" />

				{/* Expected timeline */}
				<div className="clinical-summary-card__timeline">
					<Flex gap="small" align="center">
						<UntitledIcon name="clock" size={16} className="clinical-summary-card__timeline-icon" />
						<div>
							<Text
								type="secondary"
								className="clinical-summary-card__timeline-label">
								Expected Improvement Timeline
							</Text>
							<div>
								<Text strong className="clinical-summary-card__timeline-value">
									{summary.expectedImprovementTimeline}
								</Text>
								<Text
									type="secondary"
									className="clinical-summary-card__timeline-note">
									{' '}
									with consistent practice
								</Text>
							</div>
						</div>
					</Flex>
				</div>
			</Flex>
		</Card>
	);
};
