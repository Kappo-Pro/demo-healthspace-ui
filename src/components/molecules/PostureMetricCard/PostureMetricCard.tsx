/**
 * PostureMetricCard Molecule Component
 * Displays individual posture metric with trend
 */

import React from 'react';
import { Card, Progress } from 'antd';
import { TrendIndicator } from '@atoms/TrendIndicator/TrendIndicator';
import './PostureMetricCard.css';

export interface PostureMetricCardProps {
	title: string;
	value: number;
	trend?: number;
	max?: number;
	className?: string;
}

export const PostureMetricCard: React.FC<PostureMetricCardProps> = ({
	title,
	value,
	trend,
	max = 100,
	className = '',
}) => {
	const percentage = (value / max) * 100;

	return (
		<Card className={`posture-metric-card ${className}`.trim()}>
			<div className="posture-metric-card__header">
				<h4>{title}</h4>
				{trend !== undefined && <TrendIndicator value={trend} />}
			</div>
			<div className="posture-metric-card__value">
				{value}/{max}
			</div>
			<Progress percent={percentage} showInfo={false} />
		</Card>
	);
};

export default PostureMetricCard;
