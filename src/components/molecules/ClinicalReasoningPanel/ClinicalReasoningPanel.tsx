/**
 * ClinicalReasoningPanel.tsx
 *
 * Molecule component for displaying clinical reasoning for exercises
 * Story 2.7 - FR26 Clinical Reasoning Transparency
 *
 * Displays plain language explanation of why an exercise was recommended,
 * linked to specific posture findings, with educational resources.
 */

import React from 'react';
import { Flex, Tag, Typography, Divider } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { EducationalContentLink } from '@atoms/EducationalContentLink';
import type { ClinicalReasoning, PriorityLevel, SeverityLevel } from '@types';
import './ClinicalReasoningPanel.css';

const { Title, Text, Paragraph } = Typography;

export interface ClinicalReasoningPanelProps {
	/** Clinical reasoning data */
	reasoning: ClinicalReasoning;
	/** Custom class name */
	className?: string;
}

/**
 * ClinicalReasoningPanel - Display clinical reasoning for exercise recommendations
 *
 * Features:
 * - Plain language explanation (Flesch Reading Ease ≥60)
 * - Posture findings with measurements and severity
 * - Expected outcomes and timeline
 * - Benefits list
 * - Educational resource links
 * - Priority and severity indicators
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <ClinicalReasoningPanel
 *   reasoning={{
 *     exerciseId: '1',
 *     explanation: 'This stretch helps correct forward head posture...',
 *     postureFindings: [
 *       {
 *         id: '1',
 *         bodyArea: 'neck',
 *         measurement: '15° forward tilt',
 *         severity: 'moderate',
 *         priority: 'high',
 *         description: 'Forward head posture detected'
 *       }
 *     ],
 *     expectedOutcome: 'Reduced neck tension',
 *     timeline: '2-3 weeks',
 *     evidenceLinks: [],
 *     benefits: ['Strengthens neck muscles', 'Improves posture']
 *   }}
 * />
 * ```
 */
export const ClinicalReasoningPanel: React.FC<ClinicalReasoningPanelProps> = ({
	reasoning,
	className = '',
}) => {
	const { t } = useTranslation();

	// Get severity color
	const getSeverityColor = (severity: SeverityLevel): string => {
		switch (severity) {
			case 'mild':
				return 'success';
			case 'moderate':
				return 'warning';
			case 'severe':
				return 'error';
			default:
				return 'default';
		}
	};

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
				return <UntitledIcon name="infoCircle" size={14} />;
			case 'low':
				return <UntitledIcon name="checkCircle" size={14} />;
			default:
				return null;
		}
	};

	return (
		<div
			className={`clinical-reasoning-panel ${className}`}
			role="region"
			aria-label={t('Admin.data.clinical.reasoningLabel')}>
			{/* Main explanation */}
			<div className="clinical-reasoning-panel__explanation">
				<Title
					level={5}
					className="clinical-reasoning-panel__explanation-title">
					Why This Exercise?
				</Title>
				<Paragraph className="clinical-reasoning-panel__explanation-text">
					{reasoning.explanation}
				</Paragraph>
			</div>

			<Divider className="clinical-reasoning-panel__divider" />

			{/* Posture findings */}
			{reasoning.postureFindings.length > 0 && (
				<div className="clinical-reasoning-panel__findings">
					<Title level={5} className="clinical-reasoning-panel__section-title">
						Your Posture Findings
					</Title>
					<Flex vertical gap="small">
						{reasoning.postureFindings.map(finding => (
							<div
								key={finding.id}
								className="clinical-reasoning-panel__finding">
								<Flex justify="space-between" align="start" gap="small">
									<div className="clinical-reasoning-panel__finding-content">
										<Text
											strong
											className="clinical-reasoning-panel__finding-area">
											{finding.bodyArea.charAt(0).toUpperCase() +
												finding.bodyArea.slice(1)}
										</Text>
										<Text className="clinical-reasoning-panel__finding-measurement">
											{finding.measurement}
										</Text>
										<Paragraph className="clinical-reasoning-panel__finding-description">
											{finding.description}
										</Paragraph>
									</div>
									<Flex gap="4px" wrap="wrap" justify="flex-end">
										<Tag
											color={getSeverityColor(finding.severity)}
											className="clinical-reasoning-panel__severity-tag">
											{finding.severity}
										</Tag>
										<Tag
											color={getPriorityColor(finding.priority)}
											icon={getPriorityIcon(finding.priority)}
											className="clinical-reasoning-panel__priority-tag">
											{finding.priority} priority
										</Tag>
									</Flex>
								</Flex>
							</div>
						))}
					</Flex>
				</div>
			)}

			{/* Benefits */}
			{reasoning.benefits.length > 0 && (
				<>
					<Divider className="clinical-reasoning-panel__divider" />
					<div className="clinical-reasoning-panel__benefits">
						<Title
							level={5}
							className="clinical-reasoning-panel__section-title">
							How This Helps
						</Title>
						<ul className="clinical-reasoning-panel__benefits-list">
							{reasoning.benefits.map((benefit, index) => (
								<li
									key={index}
									className="clinical-reasoning-panel__benefit-item">
									<UntitledIcon name="checkCircle" size={14} className="clinical-reasoning-panel__benefit-icon" />
									<Text>{benefit}</Text>
								</li>
							))}
						</ul>
					</div>
				</>
			)}

			{/* Expected outcome and timeline */}
			<Divider className="clinical-reasoning-panel__divider" />
			<div className="clinical-reasoning-panel__outcome">
				<Flex gap="middle" wrap="wrap">
					<div className="clinical-reasoning-panel__outcome-item">
						<Text
							type="secondary"
							className="clinical-reasoning-panel__outcome-label">
							<UntitledIcon name="clock" size={14} /> Expected Timeline
						</Text>
						<Text strong className="clinical-reasoning-panel__outcome-value">
							{reasoning.timeline}
						</Text>
					</div>
					<Divider
						type="vertical"
						className="clinical-reasoning-panel__outcome-divider"
					/>
					<div className="clinical-reasoning-panel__outcome-item">
						<Text
							type="secondary"
							className="clinical-reasoning-panel__outcome-label">
							Expected Outcome
						</Text>
						<Text strong className="clinical-reasoning-panel__outcome-value">
							{reasoning.expectedOutcome}
						</Text>
					</div>
				</Flex>
			</div>

			{/* Educational resources */}
			{reasoning.evidenceLinks.length > 0 && (
				<>
					<Divider className="clinical-reasoning-panel__divider" />
					<div className="clinical-reasoning-panel__resources">
						<Title
							level={5}
							className="clinical-reasoning-panel__section-title">
							Learn More
						</Title>
						<Flex gap="small" wrap="wrap">
							{reasoning.evidenceLinks.map(resource => (
								<EducationalContentLink
									key={resource.id}
									resource={resource}
									variant="button"
									size="small"
								/>
							))}
						</Flex>
					</div>
				</>
			)}

			{/* Readability score (debug mode - hidden in production) */}
			{reasoning.readabilityScore !== undefined &&
				process.env.NODE_ENV === 'development' && (
					<div className="clinical-reasoning-panel__debug">
						<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
							Readability: {reasoning.readabilityScore.toFixed(1)} (
							{reasoning.readabilityScore >= 60 ? '✓ Pass' : '✗ Fail'})
						</Text>
					</div>
				)}
		</div>
	);
};
