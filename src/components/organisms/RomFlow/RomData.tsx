import Main from '@organisms/RomFlow/Main';
import SplashPage from '@organisms/RomFlow/SplashPage';
import VideoPoseEstimator from '@organisms/VideoPoseEstimator';
import { RomControlBar } from '@atoms/RomControlBar';
import { UseControls } from '@pages/PostureScan/context/Controls.context';
import { useTheme } from '@providers/ThemeProvider';
import { toggleLoading, goToExercise, finishScanEarly } from '@stores/clinical/rom/main';
import { THEME } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { RowDataProps } from '@types';
import { Drawer, Flex, Modal, Typography } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ExerciseInfo from './ExerciseInfo';
import ExerciseListMenu from './ExerciseListMenu';
import ExerciseProgressCard from './ExerciseProgressCard';
import RomLogoHeader from './RomLogoHeader';
import RomResultData from './RomResultData';
import RomTopBar from './RomTopBar';
import Tutorial from './Tutorial';

const { Paragraph } = Typography;

export default function RomData(props: RowDataProps) {
	const {
		isSplashOpened,
		onFullscreen,
		setCompletionLoader,
		completionLoader,
		isDashboard,
		onToggleMenu,
		isVideoPause,
		onTogglePauseVideo,
		isFullscreen,
		onToggleTutorial,
		isSwitchMode,
		isMenuOpened,
		isTutorialOpened,
		onTogglesSplashPage,
		onExerciseValueAndCoordinates,
		onBodyPointsVisible,
		onNextTransition,
		fullscreenRef,
		isCompleted,
		setCompleted,
		setIsManual,
		isManual,
		onToggleInfo,
		isInfoOpened,
		onSavePhysicalAssessmentsMetrics,
		isSaving,
		hideTopbar,
		onScanComplete,
		onTransitionTimeChange,
		hideControls,
		volume,
		isMuted,
		onVolumeChange,
		onToggleMute,
		cameraCount = 1,
	} = props;
	const isCollapsible = useTypedSelector(
		state => state.patientDetail.patientDetail.isCollapsible,
	);
	const dispatch = useTypedDispatch();
	const {
		exercises,
		currentExercise,
		transition,
		loading,
		selfieMode,
		finishedExercises,
		cameraId,
		resultsExercises,
	} = useTypedSelector(state => state.rom.main);

	const exerciseNumber = exercises?.findIndex(
		(exer: unknown) => (exer as { id: string }).id === currentExercise?.id,
	);

	const onLoading = () => dispatch(toggleLoading(false));
	const [transitionTime, setTransitionTime] = useState<number>();
	const [isExerciseListVisible, setIsExerciseListVisible] = useState(false);
	const [isCompletionDialogVisible, setIsCompletionDialogVisible] = useState(false);
	const { theme } = useTheme();

	const toggleExerciseList = () => {
		setIsExerciseListVisible(prev => !prev);
	};

	const handleExerciseClick = (exerciseIndex: number) => {
		if (exercises && exercises[exerciseIndex]) {
			dispatch(goToExercise(exercises[exerciseIndex]));
			setIsExerciseListVisible(false);
		}
	};

	const handleGoBackToComplete = () => {
		if (!exercises || !resultsExercises) return;
		const firstIncomplete = exercises.find(
			(exercise: unknown) => !resultsExercises.some(
				(result: unknown) => String((result as { id?: string })?.id) === String((exercise as { id: string }).id)
			),
		);
		if (firstIncomplete) {
			dispatch(goToExercise(firstIncomplete));
			setIsCompletionDialogVisible(false);
		}
	};

	const handleFinishAsIs = () => {
		setIsCompletionDialogVisible(false);
		// Mark scan as finished early - this triggers the completion flow
		dispatch(finishScanEarly());
	};

	// Check for incomplete exercises after last exercise is submitted
	useEffect(() => {
		if (!exercises || !resultsExercises || !currentExercise) return;
		const isLastExercise = exerciseNumber === exercises.length - 1;
		// Use String() to handle type mismatches (number vs string IDs)
		const lastExerciseId = String(exercises[exercises.length - 1]?.id);
		const lastExerciseSubmitted = resultsExercises.some(
			(result: unknown) => String((result as { id?: string })?.id) === lastExerciseId
		);

		// Only show dialog after last exercise is submitted and there are still incomplete exercises
		if (isLastExercise && lastExerciseSubmitted) {
			const incompleteExercises = exercises.filter(
				(exercise: unknown) => !resultsExercises.some(
					(result: unknown) => String((result as { id?: string })?.id) === String((exercise as { id: string }).id)
				),
			);
			if (incompleteExercises.length > 0) {
				setIsCompletionDialogVisible(true);
			}
		}
	}, [exercises, resultsExercises, currentExercise, exerciseNumber]);

	// Notify parent when transition time screen visibility changes
	useEffect(() => {
		// TransitionTime screen shows when !transitionTime && !isManual
		const isShowing = !transitionTime && !isManual;
		onTransitionTimeChange?.(isShowing);
	}, [transitionTime, isManual, onTransitionTimeChange]);
	const { canvasDimensions } = UseControls();

	// Calculate aspect ratio from canvas dimensions
	const aspectRatio = useMemo(() => {
		if (
			!canvasDimensions ||
			canvasDimensions.width === 0 ||
			canvasDimensions.height === 0
		) {
			if (process.env.NODE_ENV === 'development') {
				console.warn('RomData: canvasDimensions not set, using fallback 16/9');
			}
			return '16/9';
		}
		return `${canvasDimensions.width}/${canvasDimensions.height}`;
	}, [canvasDimensions]);

	return (
		<div
			ref={fullscreenRef as React.Ref<HTMLDivElement>}
			style={{
				...(!isFullscreen &&
					!hideTopbar &&
					(isDashboard || !isCollapsible
						? { padding: 'var(--spacing-5) var(--spacing-10) var(--spacing-10) var(--spacing-10)' }
						: { padding: '0 var(--spacing-10) var(--spacing-10) var(--spacing-10)' })),
				width: hideTopbar ? '100%' : '90vw',
				height: hideTopbar ? '100%' : 'auto',
			}}>
			{!hideTopbar && (
				<Flex
					align="center"
					justify="center"
					className="h-[35px]"
					style={{
						backgroundColor:
							theme === THEME.VIBRANT
								? 'var(--primary-900)'
								: 'var(--color-black)',
					}}>
					<Flex flex={1}>
						<Flex align="center" className="pl-2">
							{!finishedExercises?.finished &&
								!isCompleted &&
								transitionTime && (
									<Flex flex={1} align="center" className="h-[35px]">
										<p style={{ color: 'var(--color-white)' }}>
											{currentExercise &&
												`${(exerciseNumber ?? 0) + 1}/${exercises?.length} ${(currentExercise?.name ? currentExercise?.name : currentExercise?.title)?.toUpperCase()}`}
										</p>
									</Flex>
								)}
						</Flex>
					</Flex>
					<RomResultData {...props} transitionTime={transitionTime ?? 0} />
				</Flex>
			)}

			<div
				className="relative z-10 overflow-hidden flex items-center justify-center"
				style={{
					height: hideTopbar
						? '100%'
						: isFullscreen
							? 'calc(100vh - 35px)'
							: 'auto',
					// maxHeight: isFullscreen ? 'none' : 'calc(100vh - 200px)',
				}}>
				<Drawer
					placement="left"
					closable={false}
					onClose={onToggleMenu}
					open={isMenuOpened}
					getContainer={false}
					forceRender={isFullscreen}
					className={`${isMenuOpened ? 'h-full' : 'h-0'}`}
					bodyStyle={{
						padding: 0,
						backgroundColor: 'var(--surface-primary)',
						...(!isFullscreen && {
							aspectRatio,
							maxHeight: 'calc(100vh - 250px)',
						}),
					}}>
					<ExerciseListMenu onToggleMenu={onToggleMenu} />
				</Drawer>

				<Drawer
					placement="top"
					closable={false}
					className="w-full"
					styles={{
						wrapper: {
							height: 'auto',
						},
					}}
					onClose={onToggleInfo}
					open={isInfoOpened}
					getContainer={false}
					forceRender={isFullscreen}
					bodyStyle={{
						backgroundColor:
							'color-mix(in srgb, var(--color-black) 65%, transparent)',
						backdropFilter: 'blur(8px)',
					}}>
					<ExerciseInfo />
				</Drawer>

				{isTutorialOpened ? (
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							zIndex: 100,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'var(--color-black)',
						}}>
						<Tutorial
							onToggleTutorial={onToggleTutorial}
							aspectRatio={aspectRatio}
							volume={volume}
							isMuted={isMuted}
							isPaused={isVideoPause}
						/>
					</div>
				) : isSplashOpened ? (
					<SplashPage onTogglesSplashPage={onTogglesSplashPage} />
				) : (
					<Main
						isVideoPause={isVideoPause}
						onTogglePauseVideo={onTogglePauseVideo}
						isSwitchMode={isSwitchMode}
						isFullscreen={isFullscreen}
						setIsManual={setIsManual}
						isManual={isManual}
						isCompleted={isCompleted}
						setCompleted={setCompleted}
						onSavePhysicalAssessmentsMetrics={onSavePhysicalAssessmentsMetrics}
						isSaving={isSaving}
						transitionTime={transitionTime ?? 0}
						completionLoader={completionLoader}
						setCompletionLoader={setCompletionLoader}
						isDashboard={isDashboard}
						onFullscreen={onFullscreen}
						setTransitionTime={setTransitionTime}
						onScanComplete={onScanComplete}
						aspectRatio={aspectRatio}
						hideControls={hideControls}
						volume={volume}
						isMuted={isMuted}>
						<VideoPoseEstimator
							loading={loading}
							currentExercise={currentExercise}
							isFullscreen={isFullscreen}
							onLoading={onLoading}
							isCompleted={isCompleted}
							onExerciseValueAndCoordinates={onExerciseValueAndCoordinates}
							onBodyPointsVisible={onBodyPointsVisible}
							selfieMode={selfieMode}
							cameraId={cameraId}
							transition={transition}
							isSwitchMode={isSwitchMode}
							onNextTransition={onNextTransition}
						/>
					</Main>
				)}
				<RomLogoHeader overCamera={!isTutorialOpened && !isSplashOpened && (transitionTime || isManual)} />
				{/* ROM Top Bar with toggle button */}
				{!isTutorialOpened && !isSplashOpened && transitionTime && (
					<RomTopBar
						currentExerciseNumber={(exerciseNumber ?? 0) + 1}
						totalExercises={exercises?.length ?? 0}
						currentExerciseName={(currentExercise?.name || currentExercise?.title || '')?.toUpperCase()}
						onMenuClick={toggleExerciseList}
						onInfoClick={onToggleInfo}
					/>
				)}
				{/* Exercise Progress Card - top left during scan */}
				{!isTutorialOpened && !isSplashOpened && transitionTime && isExerciseListVisible && exercises && (
					<ExerciseProgressCard
						exercises={exercises.map((exercise: unknown, index: number) => ({
							id: (exercise as { id: string }).id,
							name: (exercise as { name?: string; title?: string }).name || (exercise as { name?: string; title?: string }).title || `Exercise ${index + 1}`,
							completed: resultsExercises?.some((result: unknown) => (result as { id?: string })?.id === (exercise as { id: string }).id) ?? false,
						}))}
						currentExerciseIndex={exerciseNumber ?? 0}
						onExerciseClick={handleExerciseClick}
					/>
				)}
				{/* Floating Control Bar - inside fullscreen element */}
				{hideControls && !isSplashOpened && transitionTime && onVolumeChange && (
					<RomControlBar
						isPaused={isVideoPause}
						onTogglePause={onTogglePauseVideo}
						volume={volume}
						onVolumeChange={onVolumeChange}
						isMuted={isMuted}
						onToggleMute={onToggleMute}
						onHelp={onToggleTutorial}
						onSwitchCamera={props.switchCamera}
						isSwitchMode={isSwitchMode}
						onToggleSwitchMode={props.onTogglesSwitchMode}
						isFullscreen={isFullscreen}
						onToggleFullscreen={onFullscreen}
						hideRefresh
						hideSwitchCamera={cameraCount <= 1}
						position="bottom-right"
					/>
				)}
			</div>

			{/* Completion Dialog */}
			<Modal
				open={isCompletionDialogVisible}
				title="Incomplete Exercises"
				footer={[
					<button
						key="finish"
						onClick={handleFinishAsIs}
						style={{
							padding: 'var(--spacing-2-5) var(--spacing-5)',
							borderRadius: 'var(--radius-md)',
							border: '1px solid var(--border-primary)',
							background: 'var(--surface-primary)',
							color: 'var(--text-primary)',
							cursor: 'pointer',
							fontSize: 'var(--font-size-base)',
							fontWeight: 'var(--font-weight-medium)',
						}}>
						Finish As Is
					</button>,
					<button
						key="complete"
						onClick={handleGoBackToComplete}
						style={{
							padding: 'var(--spacing-2-5) var(--spacing-5)',
							borderRadius: 'var(--radius-md)',
							border: 'none',
							background: 'var(--brand-primary)',
							color: 'var(--text-on-dark)',
							cursor: 'pointer',
							fontSize: 'var(--font-size-base)',
							fontWeight: 'var(--font-weight-medium)',
						}}>
						Complete Missing
					</button>,
				]}
				centered
				closable={false}>
				<Paragraph style={{ marginBottom: 'var(--spacing-4)' }}>
					You've reached the last exercise, but some exercises are still incomplete.
					Would you like to go back and complete them, or finish the scan as is?
				</Paragraph>
				<Paragraph style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
					Incomplete exercises: {exercises?.filter((exercise: unknown) => !resultsExercises?.some((result: unknown) => (result as { id?: string })?.id === (exercise as { id: string }).id)).length}
				</Paragraph>
			</Modal>
		</div>
	);
}
