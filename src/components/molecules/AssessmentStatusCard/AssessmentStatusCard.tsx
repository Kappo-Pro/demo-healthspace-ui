import React from 'react';
import { Card, Badge, Button } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import type { AssessmentStatusCardProps } from './types';
import { StyledCard } from './styles';
import { getStatusBadge, getCTAText } from './utils';
import { useDebounce } from '@hooks/useDebounce';

/**
 * AssessmentStatusCard displays individual assessment status with badge, date, score, and CTA
 * EPIC-006-S2: Implements debounce to prevent double-tap submissions
 */
export const AssessmentStatusCard: React.FC<AssessmentStatusCardProps> = ({
	type,
	status,
	lastUpdated,
	score,
	onAction,
}) => {
	const badgeConfig = getStatusBadge(status);
	const { debouncedCallback, isDebouncing } = useDebounce(onAction, 300);

	return (
		<StyledCard>
			<Card.Meta
				title={
					<span>
						{type.toUpperCase()} Assessment {badgeConfig.icon}
					</span>
				}
				description={
					<>
						<Badge status={badgeConfig.color} text={badgeConfig.text} />
						{lastUpdated && (
							<p>
								Last updated {formatDistanceToNow(new Date(lastUpdated))} ago
							</p>
						)}
						{score !== null && <p>Score: {score}/100</p>}
					</>
				}
			/>
			<Button
				type="primary"
				onClick={debouncedCallback}
				loading={isDebouncing}
				aria-label={`${getCTAText(status)} ${type.toUpperCase()} assessment`}
			>
				{getCTAText(status)}
			</Button>
		</StyledCard>
	);
};
