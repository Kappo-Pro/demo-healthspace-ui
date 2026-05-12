import React, { useState, useEffect } from 'react';
import { Flex, Select, Empty, Spin, Modal, Tabs, Typography } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { ExerciseCard } from '@atoms/ExerciseCard';
import { VideoPlayer } from '@molecules/VideoPlayer';
import { InstructionPanel } from '@molecules/InstructionPanel';
import { ClinicalReasoningPanel } from '@molecules/ClinicalReasoningPanel';
import type {
	ExerciseLibrary,
	ExerciseRecommendationFilters,
	ExerciseSortOption,
	MuscleGroup,
	ClinicalReasoning} from '@types';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	fetchExerciseRecommendations,
	markExerciseComplete} from '@stores/posture/postures/postures';
import { selectExerciseRecommendations } from '@stores/posture/postures/selectors';
import { calculateReadability } from '@utils/readability/calculateReadability';
import './ExerciseRecommendation.css';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Generate mock clinical reasoning data for exercises
 * TODO: Replace with actual data from backend API
 */
const getMockClinicalReasoning = (
	exercise: ExerciseLibrary,
): ClinicalReasoning => {
	// Mock data based on exercise characteristics
	const reasoning: ClinicalReasoning = {
		exerciseId: exercise.id.toString(),
		explanation: '',
		postureFindings: [],
		expectedOutcome: '',
		timeline: '',
		evidenceLinks: [],
		benefits: [],
	};

	// Generate explanation based on muscle groups
	if (exercise.muscleGroups.includes('Neck/Shoulders')) {
		reasoning.explanation = `Your posture scan showed forward head posture and rounded shoulders. This ${exercise.title.toLowerCase()} helps correct these imbalances by strengthening the muscles that support your neck and upper back. When these muscles are stronger, your head naturally sits in a more balanced position over your shoulders.`;
		reasoning.postureFindings.push({
			id: '1',
			bodyArea: 'neck',
			measurement: '15° forward tilt',
			severity: 'moderate',
			priority: 'high',
			description: 'Forward head posture detected from scan analysis',
		});
		reasoning.postureFindings.push({
			id: '2',
			bodyArea: 'shoulders',
			measurement: '12° internal rotation',
			severity: 'mild',
			priority: 'medium',
			description: 'Rounded shoulders (often from desk work)',
		});
		reasoning.benefits = [
			'Strengthens neck muscles that support proper head position',
			'Reduces tension in upper back and shoulders',
			'Improves awareness of proper posture',
		];
		reasoning.expectedOutcome = 'Reduced neck tension and improved posture';
		reasoning.timeline = '2-3 weeks';
	} else if (exercise.muscleGroups.includes('Lower Back')) {
		reasoning.explanation = `Your scan revealed lower back curve irregularities. This ${exercise.title.toLowerCase()} strengthens your core and lower back muscles. A strong core provides essential support for your spine, reducing strain on your lower back.`;
		reasoning.postureFindings.push({
			id: '3',
			bodyArea: 'lower back',
			measurement: '8° anterior pelvic tilt',
			severity: 'moderate',
			priority: 'high',
			description: 'Excessive lower back curve',
		});
		reasoning.benefits = [
			'Strengthens core muscles that support your spine',
			'Reduces lower back strain and discomfort',
			'Improves pelvic alignment',
		];
		reasoning.expectedOutcome = 'Reduced lower back discomfort';
		reasoning.timeline = '3-4 weeks';
	} else {
		reasoning.explanation = `This ${exercise.title.toLowerCase()} targets key muscle groups that support better posture. Regular practice helps strengthen weak areas and improve overall body alignment.`;
		reasoning.postureFindings.push({
			id: '4',
			bodyArea: exercise.muscleGroups[0]?.toLowerCase() || 'core',
			measurement: 'Moderate imbalance detected',
			severity: 'mild',
			priority: 'medium',
			description: 'General postural imbalance in this area',
		});
		reasoning.benefits = [
			'Strengthens supporting muscle groups',
			'Improves overall body alignment',
			'Enhances movement patterns',
		];
		reasoning.expectedOutcome = 'Improved posture and body awareness';
		reasoning.timeline = '2-4 weeks';
	}

	// Add educational resources
	reasoning.evidenceLinks = [
		{
			id: '1',
			title: 'Understanding Forward Head Posture',
			url: '/resources/forward-head-posture',
			type: 'article',
			source: 'strapi',
			description: 'Learn about causes and treatment approaches',
		},
		{
			id: '2',
			title: 'Posture Correction Exercises',
			url: '/resources/posture-exercises-video',
			type: 'video',
			source: 'strapi',
			description: 'Video guide to effective posture exercises',
			duration: 180,
		},
	];

	// Calculate readability score
	const readabilityMetrics = calculateReadability(reasoning.explanation);
	reasoning.readabilityScore = readabilityMetrics.score;
	reasoning.avgSentenceLength = readabilityMetrics.avgWordsPerSentence;

	return reasoning;
};

export interface ExerciseRecommendationProps {
	/** Session ID for filtering recommendations */
	sessionId?: string;
	/** Maximum number of exercises to display */
	maxExercises?: number;
	/** Enable filtering */
	showFilters?: boolean;
	/** Enable sorting */
	showSorting?: boolean;
	/** Class name */
	className?: string;
}

/**
 * ExerciseRecommendation - Exercise recommendation grid with filtering (Story 2.3)
 *
 * Features:
 * - Grid layout with 3-5 exercises
 * - Filtering by muscle group and difficulty
 * - Sorting by priority, duration, difficulty, alphabetical
 * - Modal detail view with video player and instructions
 * - Adherence tracking with completion checkbox
 * - Streak counter
 * - Responsive design
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <ExerciseRecommendation
 *   sessionId="session-123"
 *   maxExercises={5}
 *   showFilters
 *   showSorting
 * />
 * ```
 */
export const ExerciseRecommendation: React.FC<ExerciseRecommendationProps> = ({
	sessionId,
	maxExercises = 5,
	showFilters = true,
	showSorting = true,
	className = '',
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const exercises = useTypedSelector(state =>
		selectExerciseRecommendations(state, sessionId),
	);
	const loading = useTypedSelector(
		state => state.postures.postures.exerciseRecommendationsLoading,
	);
	const exerciseTracking = useTypedSelector(
		state => state.postures.postures.exerciseTracking,
	);
	const userId = useTypedSelector(state => state.user?.user?.id);

	const [filters, setFilters] = useState<ExerciseRecommendationFilters>({
		muscleGroup: 'All',
		difficulty: 'All',
	});
	const [sortBy, setSortBy] = useState<ExerciseSortOption>('priority');
	const [selectedExercise, setSelectedExercise] =
		useState<ExerciseLibrary | null>(null);
	const [detailModalOpen, setDetailModalOpen] = useState(false);

	// Fetch recommendations on mount
	useEffect(() => {
		dispatch(fetchExerciseRecommendations({ sessionId }));
	}, [dispatch, sessionId]);

	// Filter exercises
	const filteredExercises = exercises.filter(exercise => {
		if (
			filters.muscleGroup !== 'All' &&
			!exercise.muscleGroups.includes(filters.muscleGroup as MuscleGroup)
		) {
			return false;
		}
		if (
			filters.difficulty !== 'All' &&
			exercise.difficulty !== filters.difficulty
		) {
			return false;
		}
		return true;
	});

	// Sort exercises
	const sortedExercises = [...filteredExercises].sort((a, b) => {
		switch (sortBy) {
			case 'alphabetical':
				return a.title.localeCompare(b.title);
			case 'duration':
				return a.duration - b.duration;
			case 'difficulty': {
				const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
				return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
			}
			case 'priority':
			default:
				// Priority order is default from API
				return 0;
		}
	});

	// Limit to max exercises
	const displayedExercises = sortedExercises.slice(0, maxExercises);

	// Handle exercise completion toggle
	const handleToggleComplete = (exerciseId: number, completed: boolean) => {
		if (!userId) return;

		if (completed) {
			dispatch(
				markExerciseComplete({
					userId,
					exerciseId: exerciseId.toString(),
					date: new Date().toISOString(),
				}),
			);
		}
	};

	// Get streak for exercise
	const getStreak = (exerciseId: number): number => {
		if (!exerciseTracking || !exerciseTracking.exercises) return 0;
		const tracking = exerciseTracking.exercises[exerciseId.toString()];
		return tracking?.currentStreak || 0;
	};

	// Get completion status
	const isCompleted = (exerciseId: number): boolean => {
		if (!exerciseTracking || !exerciseTracking.exercises) return false;
		const tracking = exerciseTracking.exercises[exerciseId.toString()];
		return tracking?.completions.length > 0 || false;
	};

	// Open exercise detail modal
	const handleExerciseClick = (exercise: ExerciseLibrary) => {
		setSelectedExercise(exercise);
		setDetailModalOpen(true);
	};

	// Close detail modal
	const handleCloseDetail = () => {
		setDetailModalOpen(false);
		setSelectedExercise(null);
	};

	if (loading) {
		return (
			<Flex justify="center" align="center" style={{ padding: 48 }}>
				<Spin
					size="large"
					tip={t('Patient.data.exercises.recommendation.loadingTip')}
				/>
			</Flex>
		);
	}

	if (exercises.length === 0) {
		return (
			<Empty
				description={t(
					'Patient.data.exercises.recommendation.noRecommendations',
				)}
				image={Empty.PRESENTED_IMAGE_SIMPLE}
				style={{ padding: 48 }}
			/>
		);
	}

	return (
		<div className={`exercise-recommendation ${className}`}>
			<Flex vertical gap={24}>
				{/* Header */}
				<Flex justify="space-between" align="center" wrap="wrap" gap={16}>
					<div>
						<Title level={3} style={{ margin: 0 }}>
							{t('Patient.data.exercises.recommendation.title')}
						</Title>
						<Text type="secondary">
							{displayedExercises.length === 1
								? t('Patient.data.exercises.recommendation.subtitle', {
										count: displayedExercises.length,
									})
								: t('Patient.data.exercises.recommendation.subtitle_plural', {
										count: displayedExercises.length,
									})}
						</Text>
					</div>

					{/* Filters and Sorting */}
					<Flex gap={12} wrap="wrap">
						{showFilters && (
							<>
								<Select
									placeholder={t(
										'Patient.data.exercises.recommendation.filters.muscleGroup.placeholder',
									)}
									value={filters.muscleGroup}
									onChange={value =>
										setFilters(prev => ({ ...prev, muscleGroup: value }))
									}
									style={{ width: 180 }}
									aria-label={t(
										'Patient.data.exercises.recommendation.filters.muscleGroup.label',
									)}
									suffixIcon={<UntitledIcon name="filter" size={16} />}>
									<Option value="All">
										{t(
											'Patient.data.exercises.recommendation.filters.muscleGroup.all',
										)}
									</Option>
									<Option value="Neck/Shoulders">
										{t(
											'Patient.data.exercises.recommendation.filters.muscleGroup.neckShoulders',
										)}
									</Option>
									<Option value="Upper Back">
										{t(
											'Patient.data.exercises.recommendation.filters.muscleGroup.upperBack',
										)}
									</Option>
									<Option value="Lower Back">
										{t(
											'Patient.data.exercises.recommendation.filters.muscleGroup.lowerBack',
										)}
									</Option>
									<Option value="Core">
										{t(
											'Patient.data.exercises.recommendation.filters.muscleGroup.core',
										)}
									</Option>
									<Option value="Hips/Pelvis">
										{t(
											'Patient.data.exercises.recommendation.filters.muscleGroup.hipsPelvis',
										)}
									</Option>
								</Select>

								<Select
									placeholder={t(
										'Patient.data.exercises.recommendation.filters.difficulty.placeholder',
									)}
									value={filters.difficulty}
									onChange={value =>
										setFilters(prev => ({ ...prev, difficulty: value }))
									}
									style={{ width: 150 }}
									aria-label={t(
										'Patient.data.exercises.recommendation.filters.difficulty.label',
									)}
									suffixIcon={<UntitledIcon name="filter" size={16} />}>
									<Option value="All">
										{t(
											'Patient.data.exercises.recommendation.filters.difficulty.all',
										)}
									</Option>
									<Option value="beginner">
										{t(
											'Patient.data.exercises.recommendation.filters.difficulty.beginner',
										)}
									</Option>
									<Option value="intermediate">
										{t(
											'Patient.data.exercises.recommendation.filters.difficulty.intermediate',
										)}
									</Option>
									<Option value="advanced">
										{t(
											'Patient.data.exercises.recommendation.filters.difficulty.advanced',
										)}
									</Option>
								</Select>
							</>
						)}

						{showSorting && (
							<Select
								value={sortBy}
								onChange={setSortBy}
								style={{ width: 150 }}
								aria-label={t(
									'Patient.data.exercises.recommendation.sort.label',
								)}
								suffixIcon={<UntitledIcon name="sortAscending" size={16} />}>
								<Option value="priority">
									{t('Patient.data.exercises.recommendation.sort.priority')}
								</Option>
								<Option value="alphabetical">
									{t('Patient.data.exercises.recommendation.sort.alphabetical')}
								</Option>
								<Option value="duration">
									{t('Patient.data.exercises.recommendation.sort.duration')}
								</Option>
								<Option value="difficulty">
									{t('Patient.data.exercises.recommendation.sort.difficulty')}
								</Option>
							</Select>
						)}
					</Flex>
				</Flex>

				{/* Exercise Grid */}
				{filteredExercises.length === 0 ? (
					<Empty
						description={t(
							'Patient.data.exercises.recommendation.noMatchingFilters',
						)}
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : (
					<div
						className="exercise-grid"
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
							gap: 24,
						}}>
						{displayedExercises.map(exercise => (
							<ExerciseCard
								key={exercise.id}
								id={exercise.id}
								title={exercise.title}
								description={exercise.description}
								thumbnailUrl={exercise.thumbnailUrl}
								duration={exercise.duration}
								difficulty={exercise.difficulty}
								isCompleted={isCompleted(exercise.id)}
								streak={getStreak(exercise.id)}
								onClick={() => handleExerciseClick(exercise)}
								onToggleComplete={completed =>
									handleToggleComplete(exercise.id, completed)
								}
								showCheckbox
							/>
						))}
					</div>
				)}
			</Flex>

			{/* Exercise Detail Modal */}
			<Modal
				open={detailModalOpen}
				onCancel={handleCloseDetail}
				footer={null}
				width="90%"
				style={{ maxWidth: 1200, top: 20 }}
				destroyOnClose>
				{selectedExercise && (
					<Tabs
						defaultActiveKey="reasoning"
						items={[
							{
								key: 'reasoning',
								label: t(
									'Patient.data.exercises.recommendation.modal.tabs.reasoning',
								),
								children: (
									<div style={{ padding: 'var(--spacing-6) 0' }}>
										<ClinicalReasoningPanel
											reasoning={getMockClinicalReasoning(selectedExercise)}
										/>
									</div>
								),
							},
							{
								key: 'video',
								label: t(
									'Patient.data.exercises.recommendation.modal.tabs.video',
								),
								children: (
									<VideoPlayer
										videoUrl={selectedExercise.videoUrl}
										posterUrl={selectedExercise.thumbnailUrl}
										captionsUrl={selectedExercise.captionsUrl}
										loop
									/>
								),
							},
							{
								key: 'instructions',
								label: t(
									'Patient.data.exercises.recommendation.modal.tabs.instructions',
								),
								children: (
									<InstructionPanel
										title={selectedExercise.title}
										instructions={selectedExercise.instructions}
										reps="10-15 repetitions"
										sets="2-3 sets"
										safetyTips={selectedExercise.safetyTips}
										contraindications={selectedExercise.contraindications}
										correctnessGuidance="You should feel a gentle stretch without pain. Your movements should be controlled and smooth."
									/>
								),
							},
							{
								key: 'transcript',
								label: t(
									'Patient.data.exercises.recommendation.modal.tabs.transcript',
								),
								children: (
									<div style={{ padding: 'var(--spacing-6) 0' }}>
										<Title level={4}>
											{t(
												'Patient.data.exercises.recommendation.modal.transcript.title',
											)}
										</Title>
										<Text>
											{t(
												'Patient.data.exercises.recommendation.modal.transcript.comingSoon',
											)}
										</Text>
									</div>
								),
							},
						]}
					/>
				)}
			</Modal>
		</div>
	);
};

export default ExerciseRecommendation;
