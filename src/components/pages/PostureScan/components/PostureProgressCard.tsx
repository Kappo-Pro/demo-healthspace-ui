import { UntitledIcon } from '@atoms/Icon';
import { Card } from 'antd';
import React from 'react';
import './PostureProgressCard.css';

export interface PostureView {
	id: string;
	name: string;
	label: string;
	completed: boolean;
}

interface PostureProgressCardProps {
	views: PostureView[];
	currentViewIndex?: number;
	onViewClick?: (viewIndex: number) => void;
}

const VIEW_LABELS: Record<string, string> = {
	front: 'Front View',
	left: 'Left Side',
	right: 'Right Side',
	back: 'Back View',
};

const VIEW_ICONS: Record<string, string> = {
	front: 'user',
	left: 'arrowLeft',
	right: 'arrowRight',
	back: 'userX',
};

/**
 * Posture Progress Card
 *
 * Displays a list of posture scan views with their completion status
 * Shows checkmark for completed views, clock icon for pending
 */
export const PostureProgressCard: React.FC<PostureProgressCardProps> = ({
	views,
	currentViewIndex = 0,
	onViewClick,
}) => {
	const handleViewClick = (index: number) => {
		onViewClick?.(index);
	};

	return (
		<Card className="posture-progress-card" bordered={false}>
			<h3 className="posture-progress-title">Scan Progress</h3>
			<div className="posture-view-list">
				{views.map((view, index) => {
					const isCompleted = view.completed;
					const isCurrent = index === currentViewIndex;
					const viewIcon = VIEW_ICONS[view.name.toLowerCase()] || 'user';

					return (
						<div
							key={view.id}
							className={`posture-view-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
							onClick={() => handleViewClick(index)}
							role="button"
							tabIndex={0}
							onKeyDown={e => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleViewClick(index);
								}
							}}>
							<div className="posture-view-icon">
								<UntitledIcon
									name={viewIcon as 'user' | 'arrowLeft' | 'arrowRight' | 'userX'}
									size="small"
									color={
										isCurrent
											? 'var(--brand-primary)'
											: isCompleted
												? 'var(--success-600)'
												: 'var(--text-tertiary)'
									}
								/>
							</div>
							<span className="posture-view-name">
								{VIEW_LABELS[view.name.toLowerCase()] || view.label || view.name}
							</span>
							<UntitledIcon
								name={isCompleted ? 'checkCircle' : 'clock'}
								size="small"
								color={
									isCompleted ? 'var(--success-600)' : 'var(--text-tertiary)'
								}
							/>
						</div>
					);
				})}
			</div>
		</Card>
	);
};

export default PostureProgressCard;
