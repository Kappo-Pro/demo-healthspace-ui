import { UntitledIcon } from '@atoms/Icon';
import React from 'react';
import './RomTopBar.css';

interface RomTopBarProps {
	currentExerciseNumber: number;
	totalExercises: number;
	currentExerciseName: string;
	onMenuClick?: () => void;
	onInfoClick?: () => void;
}

/**
 * ROM Top Bar
 *
 * Displays current exercise progress and control buttons
 * Shows exercise counter, name, and action buttons (menu, info)
 */
export const RomTopBar: React.FC<RomTopBarProps> = ({
	currentExerciseNumber,
	totalExercises,
	currentExerciseName,
	onMenuClick,
	onInfoClick,
}) => {
	const handleMenuClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onMenuClick?.();
	};

	const handleInfoClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onInfoClick?.();
	};

	return (
		<div className="rom-top-bar">
			<button
				className="rom-top-bar-button"
				onClick={handleMenuClick}
				aria-label="Toggle exercise list"
				type="button">
				<UntitledIcon name="list" size="small" color="var(--text-secondary)" />
			</button>
			<button
				className="rom-top-bar-button"
				onClick={handleInfoClick}
				aria-label="Show exercise info"
				type="button">
				<UntitledIcon
					name="infoCircle"
					size="small"
					color="var(--text-secondary)"
				/>
			</button>
			<span className="rom-top-bar-text">
				{currentExerciseNumber}/{totalExercises} {currentExerciseName}
			</span>
		</div>
	);
};

export default RomTopBar;
