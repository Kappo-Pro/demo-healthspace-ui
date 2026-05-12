/**
 * PostureJourneyView Organism Component
 * Story 2.1: Patient Journey Timeline View (FR6)
 * Story 2.5: Empty States with Contextual Guidance (FR9)
 * Story 2.6: Mobile Touch Optimization (FR10)
 *
 * Main timeline organism that visualizes patient's posture improvement journey.
 *
 * Features:
 * - Horizontal timeline with milestone markers (AC1)
 * - Milestone celebrations with encouraging messages (AC2)
 * - Progress metrics display (AC3)
 * - Mobile optimization: swipeable timeline <768px (AC4)
 * - Keyboard navigation and screen reader support (AC5)
 * - Framer Motion scroll animations
 * - Empty state handling with contextual guidance (Story 2.5)
 * - Optional tour/walkthrough for first-time users (Story 2.5)
 * - Mobile touch optimization (Story 2.6):
 *   - Pull-to-refresh on mobile
 *   - Haptic feedback on interactions
 *   - Swipe gestures for timeline navigation
 *   - Touch-optimized targets (≥44px)
 *
 * Composition:
 * - Ant Design Timeline (base)
 * - MilestoneMarker atoms
 * - ProgressMetrics molecule
 * - EmptyState atom (enhanced)
 * - PostureInfoModal molecule
 * - Framer Motion animations
 * - React Joyride tour
 * - Pull-to-refresh wrapper
 *
 * @see selectPatientJourney selector
 */

import React, { useState, useRef, useEffect } from 'react';
import { Timeline, Typography, Spin, Button } from 'antd';
import { motion } from 'framer-motion';
import { useGesture } from '@use-gesture/react';
import { UntitledIcon } from '@atoms/Icon';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTypedSelector } from '@stores/index';
import { selectPatientJourney } from '@stores/posture/postureAnalytics/selectors';
import { MilestoneMarker } from '@atoms/MilestoneMarker';
import { ProgressMetrics } from '@molecules/ProgressMetrics';
import { EmptyState } from '@components/ui/LoadingStates/EmptyState';
import { PostureInfoModal } from '@molecules/PostureInfoModal';
import type { PatientMilestone } from '@types/posture';
import { getEmptyStateType } from '@utils/emptyStates/getEmptyStateType';
import {
	getEmptyStateConfig,
	getEmptyStateDescription} from '@config/emptyStates/postureAnalytics';
import {
	POSTURE_ANALYTICS_TOUR_STEPS,
	POSTURE_ANALYTICS_TOUR_CONFIG,
	isTourCompleted,
	markTourCompleted} from '@config/tours/postureAnalyticsTour';
import { triggerHaptic, HapticPattern } from '@utils/haptics/triggerHaptic';
import './PostureJourneyView.css';
import '@styles/mobile-touch.css';

const { Title, Text } = Typography;

export interface PostureJourneyViewProps {
	/** Optional: Override default patient ID (uses current user from Redux) */
	patientId?: string;

	/** Show compact mode (for sidebars) */
	compact?: boolean;

	/** Loading state */
	loading?: boolean;

	/** Additional CSS class */
	className?: string;
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * PostureJourneyView component
 */
export const PostureJourneyView: React.FC<PostureJourneyViewProps> = ({
	patientId,
	compact = false,
	loading = false,
	className = '',
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const journeyData = useTypedSelector(state =>
		selectPatientJourney(state, patientId),
	);
	const containerRef = useRef<HTMLDivElement>(null);
	const timelineRef = useRef<HTMLDivElement>(null);
	const [activeMilestone, setActiveMilestone] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);

	// Story 2.5: Empty state and tour state
	const [showInfoModal, setShowInfoModal] = useState(false);
	const [runTour, setRunTour] = useState(false);

	// Story 2.6: Mobile touch optimization
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Detect mobile viewport
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Story 2.5: Check if tour should run on first visit
	useEffect(() => {
		if (!loading && journeyData && !isTourCompleted() && !compact) {
			// Auto-start tour on first visit with data
			setRunTour(true);
		}
	}, [loading, journeyData, compact]);

	// Scroll animation setup (only if motion not reduced and component is mounted)
	// Note: Disabled for now due to hydration issues with useScroll
	// TODO: Re-enable after investigating proper SSR/hydration patterns
	// const { scrollYProgress } = useScroll({
	// 	target: containerRef,
	// 	offset: ['start end', 'end start'],
	// });
	// const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
	// const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

	// Story 2.6: Pull-to-refresh handler
	const handleRefresh = async () => {
		setIsRefreshing(true);
		triggerHaptic(HapticPattern.MEDIUM);

		try {
			// TODO: Dispatch action to refetch posture history
			// await dispatch(fetchPostureHistory()).unwrap();

			// Simulate refresh for now
			await new Promise(resolve => setTimeout(resolve, 1000));

			triggerHaptic(HapticPattern.SUCCESS);
		} catch (error) {
			triggerHaptic(HapticPattern.ERROR);
		} finally {
			setIsRefreshing(false);
		}
	};

	// Story 2.6: Swipe gesture for timeline navigation
	const bind = useGesture(
		{
			onDrag: ({ direction: [xDir], cancel }) => {
				if (!isMobile || !journeyData?.milestones) return;

				// Only handle horizontal swipes
				if (Math.abs(xDir) < 0.5) return;

				const currentIndex = journeyData.milestones.findIndex(
					m => m.id === activeMilestone,
				);

				// Swipe left = next milestone
				if (xDir < 0 && currentIndex < journeyData.milestones.length - 1) {
					setActiveMilestone(journeyData.milestones[currentIndex + 1].id);
					triggerHaptic(HapticPattern.LIGHT);
					cancel();
				}
				// Swipe right = previous milestone
				else if (xDir > 0 && currentIndex > 0) {
					setActiveMilestone(journeyData.milestones[currentIndex - 1].id);
					triggerHaptic(HapticPattern.LIGHT);
					cancel();
				}
			},
		},
		{
			drag: {
				axis: 'x',
				threshold: 50,
			},
		},
	);

	// Handle milestone click
	const handleMilestoneClick = (milestone: PatientMilestone) => {
		setActiveMilestone(milestone.id);
		triggerHaptic(HapticPattern.LIGHT);
		// Could trigger detail view modal here
	};

	// Handle keyboard navigation (arrow keys between milestones)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!journeyData?.milestones) return;

			const currentIndex = journeyData.milestones.findIndex(
				m => m.id === activeMilestone,
			);

			if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
				e.preventDefault();
				const nextIndex = Math.min(
					currentIndex + 1,
					journeyData.milestones.length - 1,
				);
				setActiveMilestone(journeyData.milestones[nextIndex].id);
			} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
				e.preventDefault();
				const prevIndex = Math.max(currentIndex - 1, 0);
				setActiveMilestone(journeyData.milestones[prevIndex].id);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [activeMilestone, journeyData]);

	// Story 2.5: Handle tour callbacks
	const handleTourCallback = (data: CallBackProps) => {
		const { status } = data;
		if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
			setRunTour(false);
			markTourCompleted();
		}
	};

	// Story 2.5: Empty state handlers
	const handlePrimaryCTA = (target: string) => {
		navigate(target);
	};

	const handleSecondaryCTA = (target: string) => {
		if (target === 'posture-info') {
			setShowInfoModal(true);
		}
	};

	// Loading state
	if (loading) {
		return (
			<div className="posture-journey-view posture-journey-view--loading">
				<Spin size="large" tip="Loading your journey..." />
			</div>
		);
	}

	// Story 2.5: Determine empty state type
	// TODO: Get actual exercise completion count from Redux state
	const exerciseCompletionCount = 0;
	const emptyStateResult = getEmptyStateType(
		journeyData,
		exerciseCompletionCount,
	);

	// Story 2.5: Render empty state if needed
	if (emptyStateResult) {
		const { type, data } = emptyStateResult;
		const config = getEmptyStateConfig(type);
		const description = getEmptyStateDescription(type, data);

		return (
			<div className="posture-journey-view posture-journey-view--empty">
				<EmptyState
					title={config.title}
					description={description}
					illustration={config.illustration}
					action={{
						label: config.primaryCTA.text,
						onClick: () => handlePrimaryCTA(config.primaryCTA.target),
					}}
					secondaryAction={
						config.secondaryCTA
							? {
									label: config.secondaryCTA.text,
									onClick: () =>
										handleSecondaryCTA(config.secondaryCTA?.target ?? ''),
								}
							: undefined
					}
					contextInfo={config.contextInfo}
				/>

				{/* Info Modal */}
				<PostureInfoModal
					open={showInfoModal}
					onClose={() => setShowInfoModal(false)}
				/>
			</div>
		);
	}

	const { milestones, progress } = journeyData;
	const shouldAnimate = !prefersReducedMotion();

	// Animation variants for timeline items
	const itemVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: (i: number) => ({
			opacity: 1,
			x: 0,
			transition: {
				delay: shouldAnimate ? i * 0.1 : 0,
				type: 'spring',
				stiffness: 100,
			},
		}),
	};

	// Story 2.6: Main content component
	const JourneyContent = () => (
		<motion.div
			ref={containerRef}
			className={`
				posture-journey-view
				${compact ? 'posture-journey-view--compact' : ''}
				${isMobile ? 'posture-journey-view--mobile' : ''}
				${className}
			`}
			initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
			animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.5, ease: 'easeOut' }}
			role="region"
			aria-label={t('Patient.data.postures.journeyView.ariaLabel')}>
			{/* Header */}
			<div className="posture-journey-view__header">
				<div className="posture-journey-view__header-content">
					<Title level={3}>{t('Patient.data.postures.journeyView.title')}</Title>
					<Text type="secondary">
						Track your progress from{' '}
						{new Date(journeyData.startDate).toLocaleDateString()}
					</Text>
				</div>

				{/* Story 2.5: Restart tour button */}
				{!compact && (
					<Button
						type="text"
						icon={<UntitledIcon name="playCircle" />}
						onClick={() => setRunTour(true)}
						className="posture-journey-view__tour-trigger"
						aria-label={t('Patient.data.postures.journeyView.startTour')}>
						{t('Patient.data.postures.journeyView.takeTour')}
					</Button>
				)}
			</div>

			{/* Progress Metrics */}
			<div className="progress-metrics">
				<ProgressMetrics
					totalAssessments={progress.totalAssessments}
					averageScore={progress.averageScore}
					scoreImprovement={progress.scoreImprovement}
					adherenceRate={progress.adherenceRate}
					compact={compact}
				/>
			</div>

			{/* Timeline - Story 2.6: Add swipe gesture support */}
			<div
				{...(isMobile ? bind() : {})}
				className="posture-journey-view__timeline scroll-container pan-x"
				ref={timelineRef}
				style={{ touchAction: 'pan-x' }}>
				<Title level={4}>{t('Patient.data.postures.journeyView.milestonesHeading')}</Title>

				<Timeline
					mode={isMobile ? 'left' : 'alternate'}
					className="posture-journey-timeline">
					{milestones.map((milestone, index) => (
						<Timeline.Item
							key={milestone.id}
							color={
								milestone.achievedAt
									? 'var(--color-success-500)'
									: 'var(--color-neutral-400)'
							}
							className="posture-journey-timeline__item timeline-item">
							<motion.div
								custom={index}
								initial={shouldAnimate ? 'hidden' : 'visible'}
								whileInView="visible"
								viewport={{ once: true, margin: '-50px' }}
								variants={itemVariants}>
								<MilestoneMarker
									milestone={milestone}
									isActive={activeMilestone === milestone.id}
									onClick={handleMilestoneClick}
								/>
							</motion.div>
						</Timeline.Item>
					))}
				</Timeline>
			</div>

			{/* Encouraging message */}
			{progress.scoreImprovement > 0 && (
				<motion.div
					className="posture-journey-view__encouragement"
					initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
					animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
					transition={{ delay: 0.5 }}>
					<Text
						strong
						style={{
							color: 'var(--color-success-600)',
							fontSize: 'var(--font-size-lg)',
						}}>
						🎉 Great progress! Keep it up!
					</Text>
				</motion.div>
			)}
		</motion.div>
	);

	return (
		<>
			{/* Story 2.5: Tour */}
			<Joyride
				steps={POSTURE_ANALYTICS_TOUR_STEPS}
				run={runTour}
				callback={handleTourCallback}
				{...POSTURE_ANALYTICS_TOUR_CONFIG}
			/>

			{/* Story 2.6: Wrap with pull-to-refresh on mobile */}
			{isMobile && !compact ? (
				<PullToRefresh
					onRefresh={handleRefresh}
					pullingContent=""
					refreshingContent={
						<div className="ptr-indicator">
							<Spin indicator={<UntitledIcon name="reload" spin />} />
						</div>
					}
					isPullable={!loading && !isRefreshing}
					resistance={2}
					maxPullDownDistance={80}>
					<JourneyContent />
				</PullToRefresh>
			) : (
				<JourneyContent />
			)}
		</>
	);
};

export default PostureJourneyView;
