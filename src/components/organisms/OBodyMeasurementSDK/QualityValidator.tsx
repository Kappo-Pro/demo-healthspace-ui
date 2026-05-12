/**
 * QualityValidator Component
 *
 * Displays quality assessment feedback for pose capture.
 * Shows lighting, distance, and pose clarity indicators.
 *
 * @module organisms/OBodyMeasurementSDK/QualityValidator
 * @since EPIC-001-S4
 */

import React from 'react';
import { Progress } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import type { QualityFlags } from '@hooks/useQualityValidation';

export interface QualityValidatorProps {
	/** Quality assessment flags */
	qualityFlags: QualityFlags;

	/** Overall quality score (0-100) */
	score: number;

	/** Feedback messages */
	feedbackMessages: string[];
}

const Container = styled.div`
	position: absolute;
	top: var(--spacing-md);
	left: var(--spacing-md);
	background: var(--overlay-bg);
	border-radius: var(--border-radius-md);
	padding: var(--spacing-md);
	backdrop-filter: blur(8px);
	min-width: 250px;
	z-index: 10;
`;

const QualityScore = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-sm);
	margin-bottom: var(--spacing-sm);
`;

const ScoreLabel = styled.span`
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	color: var(--text-inverted);
`;

const Indicators = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	margin-bottom: var(--spacing-sm);
`;

const Indicator = styled.div<{ status: 'good' | 'warning' | 'error' }>`
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	font-size: var(--font-size-sm);
	color: ${props =>
		props.status === 'good'
			? 'var(--success-500)'
			: props.status === 'warning'
				? 'var(--warning-500)'
				: 'var(--error-500)'};
`;

const FeedbackMessages = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-xs);
	padding-top: var(--spacing-sm);
	border-top: 1px solid var(--border-overlay);
`;

const FeedbackMessage = styled.div`
	font-size: var(--font-size-sm);
	color: var(--text-inverted);
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
`;

/**
 * Quality Validator Component
 *
 * Displays real-time quality feedback for pose capture.
 *
 * @param props - Component props
 */
export const QualityValidator: React.FC<QualityValidatorProps> = ({
	qualityFlags,
	score,
	feedbackMessages,
}) => {
	const getQualityColor = (score: number): string => {
		if (score >= 90) return 'var(--success-500)';
		if (score >= 70) return 'var(--warning-500)';
		return 'var(--error-500)';
	};

	const getIndicatorStatus = (
		flag: 'good' | 'poor' | 'optimal' | 'too-close' | 'too-far' | 'clear' | 'occluded'
	): 'good' | 'warning' | 'error' => {
		if (flag === 'good' || flag === 'optimal' || flag === 'clear') return 'good';
		if (flag === 'too-close' || flag === 'too-far') return 'warning';
		return 'error';
	};

	const getIconForStatus = (status: 'good' | 'warning' | 'error') => {
		switch (status) {
			case 'good':
				return <UntitledIcon name="checkCircle" size="small" />;
			case 'warning':
				return <UntitledIcon name="warning" size="small" />;
			case 'error':
				return <UntitledIcon name="closeCircle" size="small" />;
		}
	};

	return (
		<Container data-testid="quality-validator">
			<QualityScore>
				<ScoreLabel>Quality:</ScoreLabel>
				<Progress
					percent={score}
					size="small"
					strokeColor={getQualityColor(score)}
					showInfo={false}
					style={{ flex: 1 }}
				/>
				<ScoreLabel>{score}%</ScoreLabel>
			</QualityScore>

			<Indicators>
				<Indicator status={getIndicatorStatus(qualityFlags.lighting)}>
					{getIconForStatus(getIndicatorStatus(qualityFlags.lighting))}
					Lighting: {qualityFlags.lighting}
				</Indicator>

				<Indicator status={getIndicatorStatus(qualityFlags.distance)}>
					{getIconForStatus(getIndicatorStatus(qualityFlags.distance))}
					Distance: {qualityFlags.distance}
				</Indicator>

				<Indicator status={getIndicatorStatus(qualityFlags.pose)}>
					{getIconForStatus(getIndicatorStatus(qualityFlags.pose))}
					Pose: {qualityFlags.pose}
				</Indicator>
			</Indicators>

			{feedbackMessages.length > 0 && (
				<FeedbackMessages>
					{feedbackMessages.map((message, index) => (
						<FeedbackMessage key={index}>
							<UntitledIcon name="infoCircle" size="small" />
							{message}
						</FeedbackMessage>
					))}
				</FeedbackMessages>
			)}
		</Container>
	);
};
