import { AudioProvider } from '@organisms/ORom/context/AudioContext';
import { CameraPermissionSplash } from '@molecules/CameraPermissionSplash';
import { Col, Row } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useCallback, useEffect, useRef, useState } from 'react';
import Capture from './components/Capture';
import DrawerMenu from './components/DrawerMenu';
import Lines from './components/Lines';
import Logo from './components/Logo';
import PostureProgressCard from './components/PostureProgressCard';
import PostureTopBar from './components/PostureTopBar';
import PostureVoiceWidget from './components/PostureVoiceWidget';
import Topbar from './components/Topbar';
import Transitions from './components/Transitions';
import {
	ControlsProvider,
	PosturalAnalytics,
	UseControls,
} from './context/Controls.context';
import {
	FullScreenProvider,
	UseFullScreen,
} from './context/FullScreen.context';

// PostureView type is imported from PostureScreen.context
import Controls from './components/Controls';
import { MenuProvider, UseMenu } from './context/Menu.context';
import {
	PostureScreenAudioProvider,
	PostureView,
	UsePostureScreenAudio,
} from './context/PostureScreen.context';
import {
	SwitchVideoProvider,
	UseSwitchVideo,
} from './context/SwitchVideo.context';
import {
	TransitionProvider,
	TransitionStates,
	UseTransition,
} from './context/Transition.context';

interface PostureScanProps {
	isDashboard?: boolean;
	hideTopbar?: boolean;
	controlsRef?: React.MutableRefObject<{
		onFullScreen: () => void;
		onToggleMenu: () => void;
		onSwitchCamera: () => void;
		isFullScreen: boolean;
		// Audio controls
		volume: number;
		muted: boolean;
		setVolume: (v: number) => void;
		setMuted: (m: boolean) => void;
	} | null>;
	onProgressUpdate?: (data: Partial<PosturalAnalytics>) => void;
	onScanComplete?: () => void;
	/** Callback when audio state changes (for syncing with external controls) */
	onAudioStateChange?: (state: { volume: number; muted: boolean }) => void;
	/** Callback when splash screen completes */
	onSplashComplete?: () => void;
}

function PostureScan(props: PostureScanProps) {
	const { isDashboard, hideTopbar, controlsRef, onScanComplete, onAudioStateChange, onSplashComplete } = props;
	return (
		<AudioProvider>
			<FullScreenProvider>
				<SwitchVideoProvider>
					<ControlsProvider mode="posture">
						<MenuProvider>
							<TransitionProvider>
								<PostureScreenAudioProvider>
									<PostureScanContent
										isDashboard={isDashboard}
										hideTopbar={hideTopbar}
										controlsRef={controlsRef}
										onProgressUpdate={props.onProgressUpdate}
										onScanComplete={onScanComplete}
										onAudioStateChange={onAudioStateChange}
										onSplashComplete={onSplashComplete}
									/>
								</PostureScreenAudioProvider>
							</TransitionProvider>
						</MenuProvider>
					</ControlsProvider>
				</SwitchVideoProvider>
			</FullScreenProvider>
		</AudioProvider>
	);
}

function PostureScanContent(props: PostureScanProps) {
	const { ref, isFullScreen, onFullScreen } = UseFullScreen();
	const { isDashboard, hideTopbar, controlsRef, onScanComplete, onAudioStateChange, onSplashComplete } = props;
	const { onSwitchCamera, setPermissionGranted } = UseSwitchVideo();

	const { onGetCurrent, isPersonInBox, isAligned, setIsAligned, positions } = UseControls();
	const { transition, onNextTransition } = UseTransition();
	const { onToggleMenu } = UseMenu();

	const [showProgressCard, setShowProgressCard] = useState(false);
	const [showPermissionSplash, setShowPermissionSplash] = useState(true);

	// Handle camera permission ready from splash screen
	const handlePermissionReady = useCallback(
		(stream: MediaStream) => {
			// Stop the stream - SwitchVideoProvider will create its own
			stream.getTracks().forEach(track => track.stop());

			// Mark permission as granted in the context
			setPermissionGranted(true);

			// Hide permission splash and show main content
			setShowPermissionSplash(false);

			// Notify parent that splash is complete
			onSplashComplete?.();
		},
		[setPermissionGranted, onSplashComplete],
	);

	const current = onGetCurrent() as Partial<PosturalAnalytics>;
	const currentIndex = onGetCurrent(true) as number;

	// Transform positions for PostureProgressCard
	const postureViews = positions.map((pos, index) => ({
		id: String(pos.id || index),
		name: pos.view || '',
		label: pos.name || '',
		completed: pos.completed || false,
	}));

	const handleProgressMenuClick = () => {
		setShowProgressCard(prev => !prev);
	};

	useEffect(() => {
		props.onProgressUpdate?.(current);
	}, [current, props.onProgressUpdate]);

	const {
		volume,
		muted,
		setVolume,
		setMuted,
		startCalibration,
		stopCalibration,
		setPoseDetected,
		resetForNewView,
		calibrationState,
	} = UsePostureScreenAudio();

	// Derived state
	const view = current?.view?.toLowerCase() as PostureView | undefined;
	const isCalibrating = transition?.value === TransitionStates.CALIBRATION;
	const isAlignedNow = isPersonInBox && isAligned;

	// Track previous view and calibration state
	const prevViewRef = useRef<string | undefined>(undefined);
	const wasCalibrating = useRef(false);
	const calibrationStartedForView = useRef<string | null>(null);
	const prevCalibrationStateRef = useRef(calibrationState);
	// Track alignment state for reading in setTimeout (avoids stale closure)
	const isAlignedNowRef = useRef(isAlignedNow);
	isAlignedNowRef.current = isAlignedNow;

	// Notify parent of audio state changes for external controls sync
	useEffect(() => {
		onAudioStateChange?.({ volume, muted });
	}, [volume, muted, onAudioStateChange]);

	// Handle view changes and calibration mode
	useEffect(() => {
		// Handle view change - reset audio
		// Skip on initial view (prevViewRef undefined) to let intro audio play
		if (view && prevViewRef.current && view !== prevViewRef.current) {
			resetForNewView(view);
			calibrationStartedForView.current = null;
		}
		// Always update the ref when view is defined
		if (view) {
			prevViewRef.current = view;
		}

		// Handle calibration mode
		if (isCalibrating && view) {
			// Only start calibration once per view
			if (calibrationStartedForView.current !== view) {
				calibrationStartedForView.current = view;
				// Small delay to ensure resetForNewView completes
				const timeoutId = setTimeout(() => {
					// Read current alignment state from ref (avoids stale closure)
					// If already aligned, skip calibration loop and go directly to instruction
					startCalibration(view, isAlignedNowRef.current);
				}, 50);
				return () => clearTimeout(timeoutId);
			}
			wasCalibrating.current = true;
		} else {
			// Exiting calibration mode - stop audio
			if (wasCalibrating.current) {
				stopCalibration();
				calibrationStartedForView.current = null;
			}
			wasCalibrating.current = false;
		}
	}, [isCalibrating, view, resetForNewView, startCalibration, stopCalibration]);

	// Handle alignment state changes - notify audio context
	useEffect(() => {
		// Only notify if we're in calibration mode
		if (isCalibrating) {
			setPoseDetected(isAlignedNow);
		}
	}, [isAlignedNow, isCalibrating, setPoseDetected]);

	// Advance from CALIBRATION to READYSETGO only when instruction completes
	// (not during calibration audio loop waits)
	useEffect(() => {
		const instructionJustCompleted =
			prevCalibrationStateRef.current === 'playing_instruction' &&
			calibrationState === 'idle';

		if (
			instructionJustCompleted &&
			transition?.value === TransitionStates.CALIBRATION
		) {
			onNextTransition();
		}

		prevCalibrationStateRef.current = calibrationState;
	}, [calibrationState, transition, onNextTransition]);

	// Expose control handlers through ref for external topbar
	useEffect(() => {
		if (controlsRef) {
			controlsRef.current = {
				onFullScreen,
				onToggleMenu,
				onSwitchCamera,
				isFullScreen,
				// Audio controls
				volume,
				muted,
				setVolume,
				setMuted,
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [controlsRef, isFullScreen, volume, muted, setVolume, setMuted]);

	// Show camera permission splash before main content
	if (showPermissionSplash) {
		return (
			<CameraPermissionSplash
				onReady={handlePermissionReady}
				requireAudio={false}
			/>
		);
	}

	return (
		<Row
			align="middle"
			justify="center"
			style={{
				background: 'var(--p-text-color)',
			}}>
			<Col
				ref={ref}
				style={{
					maxWidth: isDashboard || isFullScreen ? '100%' : 1280,
					aspectRatio: '16/9',
					width: '100%',
				}}>
				{!hideTopbar && <Topbar isDashboard={isDashboard} />}
				<Content
					style={{
						zIndex: 1,
						background: 'var(--color-black)',
						overflow: 'hidden',
						maxWidth: isDashboard || isFullScreen ? '100%' : 1280,
						width: '100%',
						height: isDashboard ? '100%' : isFullScreen ? '97vh' : '100%',
						position: 'relative',
						aspectRatio: '16/9',
					}}>
					<DrawerMenu />
					{/* Posture scan progress UI */}
					{current?.view && (
						<PostureTopBar
							currentViewNumber={currentIndex + 1}
							totalViews={positions.length}
							currentViewName={current.view}
							onMenuClick={handleProgressMenuClick}
							isCountingDown={transition?.value === TransitionStates.READYSETGO}
						/>
					)}
					{showProgressCard && postureViews.length > 0 && (
						<PostureProgressCard
							views={postureViews}
							currentViewIndex={currentIndex}
						/>
					)}
					<Transitions>
						<Lines />
						<div
							style={{
								height: '100%',
								width: '100%',
								background: 'var(--color-black)',
							}}>
							<Capture />
						</div>
						<Capture />
						<Controls
							isDashboard={isDashboard}
							onScanComplete={onScanComplete}
						/>
						{/* Hide built-in voice widget when in dashboard mode - uses RomControlBar instead */}
						{!isDashboard && <PostureVoiceWidget />}
					</Transitions>
					<Logo />
				</Content>
			</Col>
		</Row>
	);
}

export default PostureScan;
