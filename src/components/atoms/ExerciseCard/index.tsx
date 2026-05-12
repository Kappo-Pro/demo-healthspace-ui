import React from 'react';
import { Card, Flex, Tag, Typography, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ExerciseDifficulty } from '@types';
import { UntitledIcon } from '@atoms/Icon';
import './ExerciseCard.css';

const { Text, Title } = Typography;

export interface ExerciseCardProps {
	/** Exercise ID */
	id: number;
	/** Exercise title */
	title: string;
	/** Exercise description */
	description?: string;
	/** Thumbnail URL */
	thumbnailUrl: string;
	/** Duration in seconds */
	duration: number;
	/** Difficulty level */
	difficulty: ExerciseDifficulty;
	/** Is exercise completed */
	isCompleted?: boolean;
	/** Current streak count */
	streak?: number;
	/** Click handler */
	onClick?: () => void;
	/** Completion checkbox handler */
	onToggleComplete?: (completed: boolean) => void;
	/** Show completion checkbox */
	showCheckbox?: boolean;
	/** Class name */
	className?: string;
}

/**
 * ExerciseCard - Displays exercise preview with metadata (Story 2.3)
 *
 * Features:
 * - Thumbnail with duration overlay
 * - Difficulty badge
 * - Completion checkbox
 * - Streak counter
 * - Clickable to view details
 * - Keyboard accessible
 *
 * @example
 * ```tsx
 * <ExerciseCard
 *   id={1}
 *   title="Shoulder Stretch"
 *   thumbnailUrl="/exercises/shoulder.jpg"
 *   duration={300}
 *   difficulty="beginner"
 *   streak={5}
 *   onToggleComplete={(checked) => markComplete(checked)}
 * />
 * ```
 */
export const ExerciseCard: React.FC<ExerciseCardProps> = ({
	title,
	description,
	thumbnailUrl,
	duration,
	difficulty,
	isCompleted = false,
	streak = 0,
	onClick,
	onToggleComplete,
	showCheckbox = true,
	className = '',
}) => {
	const { t } = useTranslation();

	// Format duration (seconds to mm:ss)
	const formatDuration = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	// Get difficulty color
	const getDifficultyColor = (level: ExerciseDifficulty): string => {
		switch (level) {
			case 'beginner':
				return 'success';
			case 'intermediate':
				return 'warning';
			case 'advanced':
				return 'error';
			default:
				return 'default';
		}
	};

	// Get translated difficulty label
	const getDifficultyLabel = (level: ExerciseDifficulty): string => {
		switch (level) {
			case 'beginner':
				return t('Patient.data.postures.exercises.filters.difficulty.beginner');
			case 'intermediate':
				return t(
					'Patient.data.postures.exercises.filters.difficulty.intermediate',
				);
			case 'advanced':
				return t('Patient.data.postures.exercises.filters.difficulty.advanced');
			default:
				return level;
		}
	};

	return (
		<Card
			hoverable={!!onClick}
			onClick={onClick}
			className={`exercise-card ${className} ${isCompleted ? 'completed' : ''}`}
			style={{
				borderRadius: 'var(--radius-xl)',
				overflow: 'hidden',
				cursor: onClick ? 'pointer' : 'default',
			}}
			bodyStyle={{ padding: 0 }}
			role="article"
			aria-label={`Exercise: ${title}`}>
			{/* Thumbnail with duration overlay */}
			<div
				style={{
					position: 'relative',
					width: '100%',
					height: 180,
					overflow: 'hidden',
				}}>
				<img
					src={thumbnailUrl}
					alt={title}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
				/>
				{/* Duration badge */}
				<div
					style={{
						position: 'absolute',
						bottom: 'var(--spacing-2)',
						right: 'var(--spacing-2)',
						background: 'var(--color-gray-900)',
						opacity: 0.9,
						color: 'var(--text-on-dark)',
						padding: 'var(--spacing-1) var(--spacing-2)',
						borderRadius: 'var(--radius-sm)',
						fontSize: 'var(--font-size-xs)',
						fontWeight: 'var(--font-weight-semibold)',
						display: 'flex',
						alignItems: 'center',
						gap: 'var(--spacing-1)',
					}}>
					<UntitledIcon name="clock" />
					{formatDuration(duration)}
				</div>
			</div>

			{/* Content */}
			<Flex vertical gap="var(--spacing-2)" style={{ padding: 'var(--spacing-4)' }}>
				{/* Title and difficulty */}
				<Flex justify="space-between" align="start">
					<Title
						level={5}
						style={{
							margin: 0,
							fontSize: 'var(--font-size-md)',
							fontWeight: 'var(--font-weight-semibold)',
							flex: 1,
						}}>
						{title}
					</Title>
					<Tag
						color={getDifficultyColor(difficulty)}
						style={{ marginLeft: 'var(--spacing-2)' }}
						aria-label={t('common.difficulty', {
							level: getDifficultyLabel(difficulty),
						})}>
						{getDifficultyLabel(difficulty)}
					</Tag>
				</Flex>

				{/* Description */}
				{description && (
					<Text
						type="secondary"
						style={{
							fontSize: 'var(--font-size-sm)',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}>
						{description}
					</Text>
				)}

				{/* Footer: Completion checkbox and streak */}
				<Flex justify="space-between" align="center">
					{showCheckbox && onToggleComplete && (
						<Checkbox
							checked={isCompleted}
							onChange={e => onToggleComplete(e.target.checked)}
							onClick={e => e.stopPropagation()}
							aria-label={`Mark ${title} as complete`}>
							<Text style={{ fontSize: 'var(--font-size-sm)' }}>
								{t('Patient.data.exercises.markComplete')}
							</Text>
						</Checkbox>
					)}

					{streak > 0 && (
						<Flex align="center" gap="var(--spacing-1)">
							<UntitledIcon
								name="trophy"
								style={{ color: 'var(--brand-warning)', fontSize: 'var(--font-size-md)' }}
							/>
							<Text
								style={{
									fontSize: 'var(--font-size-sm)',
									fontWeight: 'var(--font-weight-semibold)',
									color: 'var(--brand-warning)',
								}}
								aria-label={t('common.exercise.streak.ariaLabel', {
									count: streak,
								})}>
								{streak === 1
									? t('common.exercise.streak.single', { count: streak })
									: t('common.exercise.streak.plural', { count: streak })}
							</Text>
							<UntitledIcon
								name="fire"
								style={{ color: 'var(--brand-error)', fontSize: 'var(--font-size-md)' }}
							/>
						</Flex>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};
