import { UntitledIcon } from '@atoms/Icon';
import React from 'react';
import './PostureTopBar.css';

interface PostureTopBarProps {
	currentViewNumber: number;
	totalViews: number;
	currentViewName: string;
	onMenuClick?: () => void;
	/** When true, shows green fill animation from left to right (3 second countdown) */
	isCountingDown?: boolean;
}

/**
 * Posture Top Bar
 *
 * Displays current posture view progress and control buttons
 * Shows view counter, name, and action buttons (menu, info)
 */
export const PostureTopBar: React.FC<PostureTopBarProps> = ({
	currentViewNumber,
	totalViews,
	currentViewName,
	onMenuClick,
	isCountingDown = false,
}) => {
	const handleMenuClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMenuClick?.();
	};

	const formatViewName = (name: string) => {
		const viewLabels: Record<string, string> = {
			front: 'Front View',
			left: 'Left Side',
			right: 'Right Side',
			back: 'Back View',
		};
		return viewLabels[name.toLowerCase()] || name;
	};

	return (
		<div className={`posture-top-bar ${isCountingDown ? 'posture-top-bar--counting' : ''}`}>
			{/* Green fill animation background */}
			{isCountingDown && <div className="posture-top-bar-fill" />}
			<button
				className="posture-top-bar-button"
				onClick={handleMenuClick}
				aria-label="Toggle view list"
				type="button">
				<UntitledIcon name="list" size="small" color="currentColor" />
			</button>
			<span className="posture-top-bar-text">
				{currentViewNumber}/{totalViews} {formatViewName(currentViewName)}
			</span>
		</div>
	);
};

export default PostureTopBar;
