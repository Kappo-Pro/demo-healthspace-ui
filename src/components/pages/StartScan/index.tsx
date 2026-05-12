import { AspectRatioModal } from '@atoms/Modal';
import { RomControlBar } from '@atoms/RomControlBar';
import { VideoCard } from '@atoms/VideoCard';
import { getStoredVolume, saveVolume } from '@hooks/usePersistedVolume';
import RomFlow from '@organisms/RomFlow';
import PostureScan from '@pages/PostureScan';
import { PosturalAnalytics } from '@pages/PostureScan/context/Controls.context';
import CreateRomModal from '@pages/StartScan/OCreateRomModal';
import { resetAll, setOmniromUpload } from '@stores/clinical/rehab/main';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { Modal } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import './style.css';

const ROM_PREVIEW_BASE_URL =
	'https://risecxlibrary.blob.core.windows.net/rom-preview/cards';

export default function AiAssistantStartScan() {
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const dispatch = useTypedDispatch();
	const [openRomPlaylist, setOpenRomPlaylist] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [searchValue, setSearchValue] = useState<string>('');
	const [isLoading, setLoading] = useState<boolean>(true);
	const { state } = useLocation();
	const [activeKey, setActiveKey] = useState<string>('1');
	const [subActiveKey, setSubActiveKey] = useState<string>('1');
	const [isRomModalOpen, setRomModalOpen] = useState(false);
	const [isPostureModalOpen, setPostureModalOpen] = useState(false);
	const [romModalKey, setRomModalKey] = useState(0);
	const [postureModalKey, setPostureModalKey] = useState(0);
	const [showRomSplash, setShowRomSplash] = useState(true);
	const [isRomSplashVisible, setRomSplashVisible] = useState(showRomSplash);

	// Handle edit flow - open modal when coming from edit
	useEffect(() => {
		if (state?.isEdit && state?.skipSplash) {
			setShowRomSplash(false);
			setRomModalOpen(true);
		}
	}, [state?.isEdit, state?.skipSplash, state?.sessionId]);
	const [isPostureFullscreen, setPostureFullscreen] = useState(false);
	const [scanProgress, setScanProgress] =
		useState<Partial<PosturalAnalytics> | null>(null);
	const [cameraCount, setCameraCount] = useState(0);
	const [romControlState, setRomControlState] = useState(() => ({
		volume: getStoredVolume(),
		isMuted: false,
		isPaused: false,
		isFullscreen: false,
		isSwitchMode: false,
		isTransitionTimeScreen: false,
	}));
	const [postureControlState, setPostureControlState] = useState(() => ({
		volume: getStoredVolume(),
		isMuted: false,
		isFullscreen: false,
	}));
	const [isPostureSplashVisible, setPostureSplashVisible] = useState(true);

	const handleProgressUpdate = (data: Partial<PosturalAnalytics>) => {
		setScanProgress(data);
	};

	// Sync audio state from PostureScan context to local state for RomControlBar
	const handlePostureAudioStateChange = useCallback(
		(state: { volume: number; muted: boolean }) => {
			setPostureControlState(prev => ({
				...prev,
				volume: state.volume,
				isMuted: state.muted,
			}));
		},
		[],
	);

	// Ref to access ROM control handlers
	const romControlsRef = useRef<{
		onFullscreen: () => void;
		onTogglePauseVideo: () => void;
		onToggleTutorial: () => void;
		switchCamera: () => void;
		onTogglesSwitchMode: () => void;
		onToggleMenu: () => void;
		onToggleInfo: () => void;
		isFullscreen: boolean;
		isVideoPause: boolean;
		isSwitchMode: boolean;
		isSplashOpened: boolean;
	} | null>(null);

	// Ref to access Posture control handlers
	const postureControlsRef = useRef<{
		onFullScreen: () => void;
		onToggleMenu: () => void;
		onSwitchCamera: () => void;
		isFullScreen: boolean;
		// Audio controls
		volume: number;
		muted: boolean;
		setVolume: (v: number) => void;
		setMuted: (m: boolean) => void;
	} | null>(null);

	// Force cleanup of camera streams when modals close
	const cleanupCameraStreams = async () => {
		// 1. Stop all video elements
		const videos = document.querySelectorAll('video');
		const allTracks: MediaStreamTrack[] = [];

		videos.forEach(video => {
			const stream = video.srcObject as MediaStream | null;
			if (stream) {
				const tracks = stream.getTracks();
				allTracks.push(...tracks);
				video.srcObject = null;
				video.pause();
				video.load(); // Force video element to reset
			}
		});

		// 2. Stop all collected tracks
		allTracks.forEach(track => {
			track.stop();
		});

		// 3. Enumerate devices for verification (optional)
		try {
			await navigator.mediaDevices.enumerateDevices();
		} catch (error) {
			// Silently handle enumeration errors
		}
	};

	const confirmAndCloseRomModal = () => {
		Modal.confirm({
			title: 'Close ROM Scan',
			content:
				'Are you sure you want to close the ROM scan? Your progress will be lost.',
			okText: 'Yes, Close',
			okType: 'danger',
			cancelText: 'Cancel',
			onOk: async () => {
				// Cleanup BEFORE closing
				await cleanupCameraStreams();
				// Then close modal and force remount on next open
				setRomModalOpen(false);
				setRomModalKey(prev => prev + 1);
				// Reset splash state for next open
				setShowRomSplash(true);
			},
		});
	};

	const confirmAndClosePostureModal = () => {
		Modal.confirm({
			title: 'Close Posture Scan',
			content:
				'Are you sure you want to close the posture scan? Your progress will be lost.',
			okText: 'Yes, Close',
			okType: 'danger',
			cancelText: 'Cancel',
			onOk: async () => {
				// Cleanup BEFORE closing
				await cleanupCameraStreams();
				// Then close modal and force remount on next open
				setPostureModalOpen(false);
				setPostureModalKey(prev => prev + 1);
			},
		});
	};

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;

	useEffect(() => {
		if (sessionStorage.getItem('freshEntry') && isIpad) {
			setTimeout(() => {
				window.location.reload();
			}, 1000);
			sessionStorage.removeItem('freshEntry');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Detect number of cameras to conditionally show switch camera button
	useEffect(() => {
		const detectCameras = async () => {
			try {
				const devices = await navigator.mediaDevices.enumerateDevices();
				const videoInputs = devices.filter(
					device => device.kind === 'videoinput',
				);
				setCameraCount(videoInputs.length);
			} catch {
				setCameraCount(1); // Default to 1 if detection fails
			}
		};
		detectCameras();
	}, []);

	useEffect(() => {
		dispatch(setOmniromUpload(false));
		setSubActiveKey('1');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (state?.showPopup) {
			setOpenRomPlaylist(true);
			setSubActiveKey('2');
		}
		// Note: isEdit && skipSplash is now handled in initial state (lines 28-36)
	}, [state]);

	// Callback handler for RomFlow state changes
	const handleRomStateChange = useCallback(
		(state: {
			isFullscreen: boolean;
			isVideoPause: boolean;
			isSwitchMode: boolean;
			isSplashOpened: boolean;
			isTransitionTimeScreen: boolean;
		}) => {
			setRomSplashVisible(state.isSplashOpened);
			setRomControlState(prev => ({
				...prev,
				isFullscreen: state.isFullscreen,
				isPaused: state.isVideoPause,
				isSwitchMode: state.isSwitchMode,
				isTransitionTimeScreen: state.isTransitionTimeScreen,
			}));
		},
		[],
	);

	const scanCards = [
		{
			videoSrc: `${ROM_PREVIEW_BASE_URL}/rom-scan.mp4`,
			posterSrc: `${ROM_PREVIEW_BASE_URL}/rom-scan-poster.webp`,
			title: t('Patient.data.startScan.rom.title', 'Range of Motion'),
			description: t(
				'Patient.data.startScan.rom.description',
				'Measure joint flexibility and movement range with AI-guided assessments',
			),
			onClick: () => {
				dispatch(resetAll());
				setShowRomSplash(true);
				setRomModalOpen(true);
			},
		},
		{
			videoSrc: `${ROM_PREVIEW_BASE_URL}/posture-scan.mp4`,
			posterSrc: `${ROM_PREVIEW_BASE_URL}/posture-scan-poster.webp`,
			title: t('Patient.data.startScan.posture.title', 'Posture Analysis'),
			description: t(
				'Patient.data.startScan.posture.description',
				'Analyze body alignment and identify postural imbalances',
			),
			onClick: () => {
				setPostureSplashVisible(true);
				setPostureModalOpen(true);
			},
		},
		{
			videoSrc: `${ROM_PREVIEW_BASE_URL}/body-composition.mp4`,
			posterSrc: `${ROM_PREVIEW_BASE_URL}/body-composition-poster.webp`,
			title: t(
				'Patient.data.startScan.bodyComposition.title',
				'Body Composition',
			),
			description: t(
				'Patient.data.startScan.bodyComposition.description',
				'Get 3D visualization of your body with precise measurements and composition analysis',
			),
			title: t(
				'Patient.data.startScan.bodyComposition.title',
				'Body Composition',
			),
			description: t(
				'Patient.data.startScan.bodyComposition.description',
				'Get 3D visualization of your body with precise measurements and composition analysis',
			),
			comingSoon: true,
		},
	];

	const visibleCards = user?.isPhysioterapist
		? scanCards
		: scanCards.slice(0, 2);
	const containerClass =
		visibleCards.length === 3 ? 'three-cards' : 'two-cards';

	return (
		<div className="start-scan">
			<CreateRomModal
				isVisible={openRomPlaylist}
				onCancel={() => setOpenRomPlaylist(false)}
				refresh={refresh}
				setRefresh={setRefresh}
				setSearchValue={setSearchValue}
				searchValue={searchValue ?? ''}
				activeKey={activeKey}
				setActiveKey={setActiveKey}
				subActiveKey={subActiveKey}
				setSubActiveKey={setSubActiveKey}
			/>
			<div className={`start-scan-cards-container ${containerClass}`}>
				{visibleCards.map((card, index) => (
					<VideoCard
						key={index}
						videoSrc={card.videoSrc}
						posterSrc={card.posterSrc}
						title={card.title}
						description={card.description}
						onClick={card.onClick}
						comingSoon={card.comingSoon}
						comingSoonText={t(
							'Patient.data.startScan.comingSoon',
							'Coming Soon',
						)}
					/>
				))}
			</div>

			<AspectRatioModal
				open={isRomModalOpen}
				onCancel={confirmAndCloseRomModal}
				afterClose={cleanupCameraStreams}
				destroyOnClose={true}>
				<div
					style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
					{/* Modal Content */}
					<div
						className="start-scan"
						style={{
							flex: 1,
							overflow: 'auto',
							height: '100%',
							position: 'relative',
						}}>
						{/* Floating Control Bar - hide during splash and transition time screens */}
						{!isRomSplashVisible && !romControlState.isTransitionTimeScreen && (
							<RomControlBar
								isPaused={romControlState.isPaused}
								onTogglePause={() =>
									romControlsRef.current?.onTogglePauseVideo()
								}
								volume={romControlState.volume}
								isMuted={romControlState.isMuted}
								onVolumeChange={value => {
									setRomControlState(prev => ({ ...prev, volume: value }));
									saveVolume(value);
								}}
								onToggleMute={() =>
									setRomControlState(prev => ({
										...prev,
										isMuted: !prev.isMuted,
									}))
								}
								onHelp={() => romControlsRef.current?.onToggleTutorial()}
								onSwitchCamera={() => romControlsRef.current?.switchCamera()}
								isSwitchMode={romControlState.isSwitchMode}
								onToggleSwitchMode={() =>
									romControlsRef.current?.onTogglesSwitchMode()
								}
								isFullscreen={romControlState.isFullscreen}
								onToggleFullscreen={() =>
									romControlsRef.current?.onFullscreen()
								}
								hideRefresh
								hideSwitchCamera={cameraCount <= 1}
								position="bottom-right"
							/>
						)}
						<RomFlow
							key={romModalKey}
							isDashboard={true}
							hideTopbar={true}
							hideControls={true}
							showSplashOnMount={showRomSplash}
							volume={romControlState.volume}
							isMuted={romControlState.isMuted}
							controlsRef={romControlsRef}
							onStateChange={handleRomStateChange}
							onScanComplete={() => {
								setRomModalOpen(false);
								setRomModalKey(prev => prev + 1);
							}}
						/>
					</div>
				</div>
			</AspectRatioModal>
			<AspectRatioModal
				open={isPostureModalOpen}
				onCancel={confirmAndClosePostureModal}
				afterClose={cleanupCameraStreams}
				destroyOnClose={true}>
				<div
					style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
					{/* Modal Content */}
					<div
						className="start-scan"
						style={{
							flex: 1,
							overflow: 'auto',
							height: '100%',
							position: 'relative',
						}}>
						{/* Floating Control Bar - hide during splash */}
						{!isPostureSplashVisible && (
							<RomControlBar
								volume={postureControlState.volume}
								isMuted={postureControlState.isMuted}
								onVolumeChange={value =>
									postureControlsRef.current?.setVolume(value)
								}
								onToggleMute={() =>
									postureControlsRef.current?.setMuted(
										!postureControlState.isMuted,
									)
								}
								onSwitchCamera={() =>
									postureControlsRef.current?.onSwitchCamera()
								}
								isFullscreen={postureControlState.isFullscreen}
								onToggleFullscreen={() =>
									postureControlsRef.current?.onFullScreen()
								}
								hideHelp
								hideRefresh
								hideSwitchMode
								hideSwitchCamera={cameraCount <= 1}
								position="bottom-right"
							/>
						)}
						<PostureScan
							key={postureModalKey}
							isDashboard={true}
							hideTopbar={!isPostureFullscreen}
							controlsRef={postureControlsRef}
							onProgressUpdate={handleProgressUpdate}
							onAudioStateChange={handlePostureAudioStateChange}
							onSplashComplete={() => setPostureSplashVisible(false)}
						/>
					</div>
				</div>
			</AspectRatioModal>
		</div>
	);
}
