import { UntitledIcon } from '@atoms/Icon';
import { Card } from 'antd';
import React from 'react';
import './ExerciseProgressCard.css';

export interface Exercise {
	id: string | number;
	name: string;
	completed: boolean;
}

interface ExerciseProgressCardProps {
	exercises: Exercise[];
	currentExerciseIndex?: number;
	onExerciseClick?: (exerciseIndex: number) => void;
}

/**
 * Exercise Progress Card
 *
 * Displays a list of exercises with their completion status
 * Shows checkmark for completed exercises, clock icon for pending
 */
export const ExerciseProgressCard: React.FC<ExerciseProgressCardProps> = ({
	exercises,
	currentExerciseIndex = 0,
	onExerciseClick,
}) => {
	const handleExerciseClick = (index: number) => {
		onExerciseClick?.(index);
	};

	return (
		<Card className="exercise-progress-card" bordered={false}>
			<h3 className="exercise-progress-title">Exercises</h3>
			<div className="exercise-list">
				{exercises.map((exercise, index) => {
					const isCompleted = exercise.completed;
					const isCurrent = index === currentExerciseIndex;

					return (
						<div
							key={exercise.id}
							className={`exercise-item ${isCurrent ? 'current' : ''}`}
							onClick={() => handleExerciseClick(index)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleExerciseClick(index);
								}
							}}>
							<span className="exercise-name">{exercise.name}</span>
							<UntitledIcon
								name={isCompleted ? 'checkCircle' : 'clock'}
								size="small"
								color={isCompleted ? 'var(--brand-primary)' : 'var(--text-tertiary)'}
							/>
						</div>
					);
				})}
			</div>
		</Card>
	);
};

export default ExerciseProgressCard;
