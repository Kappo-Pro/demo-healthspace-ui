/**
 * ProgressDashboard Organism Component
 *
 * Displays comprehensive milestone progress tracking including:
 * - All earned milestones in responsive grid
 * - Progress toward next milestones
 * - Total milestone counter
 * - Filter by milestone type
 * - Empty state handling
 *
 * Features:
 * - Responsive grid layout (mobile-first)
 * - Filter dropdown for milestone types
 * - Progress bars for unearned milestones
 * - Click milestone for details
 * - Loading states
 * - Empty state with motivational message
 *
 * @example
 * ```tsx
 * <ProgressDashboard
 *   earnedMilestones={milestones}
 *   milestoneProgress={progress}
 *   loading={false}
 * />
 * ```
 */

import React, { useState, useMemo } from 'react';
import { Card, Select, Empty, Spin, Progress } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Milestone, MilestoneProgress } from '@types/milestones';
import { MilestoneBadge } from '@atoms/MilestoneBadge';
import { UntitledIcon } from '@atoms/Icon';
import './ProgressDashboard.css';

const { Option } = Select;

export interface ProgressDashboardProps {
	/** Earned milestones */
	earnedMilestones: Milestone[];

	/** Progress toward unearned milestones */
	milestoneProgress: MilestoneProgress[];

	/** Loading state */
	loading?: boolean;

	/** Click handler for milestone details */
	onMilestoneClick?: (milestone: Milestone) => void;

	/** Additional CSS class */
	className?: string;
}

/**
 * Milestone type filter options
 */
const FILTER_OPTIONS = [
	{ label: 'All Milestones', value: 'all' },
	{ label: 'Scan Milestones', value: 'scan' },
	{ label: 'Exercise Streaks', value: 'exercise' },
	{ label: 'Improvements', value: 'improvement' },
];

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
	earnedMilestones,
	milestoneProgress,
	loading = false,
	onMilestoneClick,
	className = '',
}) => {
	const { t } = useTranslation();
	const [filterType, setFilterType] = useState<string>('all');

	// Filter milestones by type
	const filteredMilestones = useMemo(() => {
		if (filterType === 'all') return earnedMilestones;

		return earnedMilestones.filter(milestone => {
			switch (filterType) {
				case 'scan':
					return [
						'first_scan',
						'one_week_consistency',
						'one_month_consistency',
					].includes(milestone.type);
				case 'exercise':
					return [
						'exercise_streak_7',
						'exercise_streak_14',
						'exercise_streak_30',
					].includes(milestone.type);
				case 'improvement':
					return milestone.type === 'first_improvement';
				default:
					return true;
			}
		});
	}, [earnedMilestones, filterType]);

	// Sort by date (newest first)
	const sortedMilestones = useMemo(() => {
		return [...filteredMilestones].sort(
			(a, b) =>
				new Date(b.dateAchieved).getTime() - new Date(a.dateAchieved).getTime(),
		);
	}, [filteredMilestones]);

	// Total count
	const totalEarned = earnedMilestones.length;

	// Loading state
	if (loading) {
		return (
			<div className="progress-dashboard progress-dashboard--loading">
				<Spin size="large" tip="Loading your progress..." />
			</div>
		);
	}

	return (
		<div className={`progress-dashboard ${className}`}>
			{/* Header Section */}
			<div className="progress-dashboard__header">
				<div className="progress-dashboard__title-section">
					<h2 className="progress-dashboard__title">
						<UntitledIcon name="trophy" className="progress-dashboard__title-icon" />
						Your Achievements
					</h2>
					<p className="progress-dashboard__subtitle">
						{totalEarned} milestone{totalEarned !== 1 ? 's' : ''} earned
					</p>
				</div>

				{/* Filter Dropdown */}
				{totalEarned > 0 && (
					<Select
						value={filterType}
						onChange={setFilterType}
						className="progress-dashboard__filter">
						{FILTER_OPTIONS.map(option => (
							<Option key={option.value} value={option.value}>
								{option.label}
							</Option>
						))}
					</Select>
				)}
			</div>

			{/* Earned Milestones Grid */}
			{sortedMilestones.length > 0 ? (
				<div className="progress-dashboard__earned-grid">
					{sortedMilestones.map(milestone => (
						<Card
							key={milestone.id}
							className="progress-dashboard__milestone-card"
							hoverable={!!onMilestoneClick}
							onClick={() => onMilestoneClick?.(milestone)}>
							<MilestoneBadge
								milestone={milestone}
								size="medium"
								showTooltip={false}
							/>
							<div className="progress-dashboard__milestone-info">
								<h4 className="progress-dashboard__milestone-name">
									{milestone.name}
								</h4>
								<p className="progress-dashboard__milestone-date">
									{new Date(milestone.dateAchieved).toLocaleDateString(
										'en-US',
										{
											month: 'short',
											day: 'numeric',
											year: 'numeric',
										},
									)}
								</p>
							</div>
						</Card>
					))}
				</div>
			) : (
				<Empty
					image={
						<UntitledIcon
							name="trophy"
							size={48}
							style={{
								color: 'var(--color-gray-300)',
							}}
						/>
					}
					description={
						<span>
							{filterType === 'all'
								? 'No milestones earned yet'
								: 'No milestones in this category'}
						</span>
					}
				/>
			)}

			{/* Progress Toward Next Milestones */}
			{milestoneProgress.length > 0 && (
				<div className="progress-dashboard__progress-section">
					<h3 className="progress-dashboard__section-title">
						<UntitledIcon name="rocket" /> Next Milestones
					</h3>
					<div className="progress-dashboard__progress-list">
						{milestoneProgress.map(progress => (
							<Card
								key={progress.milestoneType}
								className="progress-dashboard__progress-card"
								size="small">
								<div className="progress-dashboard__progress-header">
									<h4 className="progress-dashboard__progress-name">
										{progress.name}
									</h4>
									<span className="progress-dashboard__progress-percentage">
										{Math.round(progress.percentComplete)}%
									</span>
								</div>
								<Progress
									percent={progress.percentComplete}
									showInfo={false}
									strokeColor={{
										'0%': 'var(--color-info-500)',
										'100%': 'var(--color-success-500)',
									}}
									trailColor="var(--color-gray-100)"
								/>
								<p className="progress-dashboard__progress-status">
									{progress.current} / {progress.target} {progress.description}
								</p>
							</Card>
						))}
					</div>
				</div>
			)}

			{/* Empty State for No Progress */}
			{totalEarned === 0 && milestoneProgress.length === 0 && (
				<Card className="progress-dashboard__empty-state">
					<UntitledIcon
						name="trophy"
						size={48}
						style={{
							color: 'var(--color-gray-300)',
							marginBottom: 'var(--spacing-md)',
						}}
					/>
					<h3>{t('Patient.data.progress.dashboard.startYourJourney')}</h3>
					<p>
						{t('Patient.data.progress.dashboard.startYourJourneyDescription')}
					</p>
				</Card>
			)}
		</div>
	);
};

export default ProgressDashboard;
