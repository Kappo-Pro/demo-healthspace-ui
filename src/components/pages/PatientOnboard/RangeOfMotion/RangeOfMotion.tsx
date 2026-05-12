import { useTypedTranslation } from '@hooks/useTypedTranslation';
import RomFlow from '@organisms/RomFlow';
import { CompletionScreen } from '@organisms/RomFlow/CompletionScreen/CompletionScreen';
import { createOnBoardSession, resetAll } from '@stores/clinical/rom/main';
import { PLANS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getPlansByUserId } from '@stores/shared/settings/settings';
import { TOnBoardSymptomsProps } from '@types';
import { Button, Modal } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	MdClose,
	MdFullscreen,
	MdFullscreenExit,
	MdInfoOutline,
	MdMenu,
	MdOutlinePauseCircle,
	MdOutlinePlayCircle,
	MdOutlineSwitchCamera,
	MdOutlineVideocam,
} from 'react-icons/md';
import { TbWindowMaximize, TbWindowMinimize } from 'react-icons/tb';
import './RangeOfMotion.css';

const onBoardExerciseIds = [1, 2, 4, 8, 9, 11, 17, 18, 19, 21, 22, 23];

const RangeOfMotion = (props: TOnBoardSymptomsProps) => {
	const { setActiveStep, setProgressPercent } = props;
	const { t } = useTypedTranslation();
	const [scanState, setScanState] = useState(false);
	const user = useTypedSelector(state => state.user);
	const dispatch = useTypedDispatch();
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const onBoardRomCompletion = useTypedSelector(
		state => state.onBoard.onBoard.onBoardRomCompletion,
	);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isVirtualPt = planType === PLANS.VIRTUALPT;
	const isEarlyIntervention = planType === PLANS.EARLYINTERVENTION;
	const [isRomModalOpen, setRomModalOpen] = useState(false);
	const [showRomSplash, setShowRomSplash] = useState(true);
	const [isRomSplashVisible, setRomSplashVisible] = useState(showRomSplash);

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

	const initializePlans = useCallback(async () => {
		const id = user.isPhysioterapist ? selectedUser?.id : user?.id;
		await dispatch(getPlansByUserId(id));
	}, [user.isPhysioterapist, selectedUser?.id, user?.id, dispatch]);

	useEffect(() => {
		if (!onBoardRomCompletion) {
			initializePlans();
		}
	}, [initializePlans, onBoardRomCompletion]);

	useEffect(() => {
		if (!isRomModalOpen) {
			setRomSplashVisible(true);
			return;
		}

		const interval = setInterval(() => {
			if (romControlsRef.current) {
				setRomSplashVisible(romControlsRef.current.isSplashOpened);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [isRomModalOpen]);

	useEffect(() => {
		if (isVirtualPt) {
			setActiveStep(9);
			setProgressPercent(90);
		}
	}, [isVirtualPt, setActiveStep, setProgressPercent]);

	const handleFetch = async () => {
		await dispatch(
			createOnBoardSession({
				userId: user?.id,
				onBoardExerciseIds: onBoardExerciseIds,
			}),
		);
	};

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
				setScanState(false);
				setActiveStep(8);
				// Reset splash state for next open
				setShowRomSplash(true);
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

	if (isVirtualPt) return null;

	return (
		<div className="rom-medical-container">
			{!scanState ? (
				<>
					<div className="vitalscan-rom-intro-container">
						<div className="vitalscan-rom-image-container">
							<img
								className="vitalscan-rom-image"
								src="/images/dashboard/vitalscan-rom-pose-estimation.png"
								alt={t('Patient.data.onboard.omniRomImageAlt')}
							/>
						</div>
					</div>
					<div className={`onboard-footer`}>
						<Button
							type="primary"
							size="large"
							className="onboard-footer-btn"
							onClick={e => {
								e.stopPropagation();
								dispatch(resetAll());
								setScanState(true);
								handleFetch();
								setShowRomSplash(false);
								setRomModalOpen(true);
							}}>
							{t('Patient.data.onboard.discoverMobilityScore')}
						</Button>
					</div>
					{isEarlyIntervention && (
						<Button
							type="primary"
							size="large"
							onClick={() => {
								setActiveStep(9);
								setProgressPercent(90);
							}}>
							{t('Patient.data.onboard.skip')}
						</Button>
					)}
				</>
			) : (
				<>
					{!onBoardRomCompletion ? (
						<>
							<Modal
								open={isRomModalOpen}
								onCancel={confirmAndCloseRomModal}
								afterClose={cleanupCameraStreams}
								width="98%"
								centered
								footer={null}
								closeIcon={null}
								styles={{
									body: {
										height: '90vh',
										padding: 0,
										overflow: 'hidden',
									},
								}}
								destroyOnClose={true}>
								<div
									style={{
										height: '100%',
										display: 'flex',
										flexDirection: 'column',
									}}>
									{/* Custom Topbar */}
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											padding: 'var(--spacing-3) var(--spacing-5)',
											backgroundColor: 'var(--surface-primary)',
											borderBottom: '1px solid var(--border-default)',
											zIndex: 1000,
										}}>
										<div
											style={{
												display: 'flex',
												gap: 'var(--spacing-4)',
												alignItems: 'center',
											}}>
											<span
												style={{
													fontSize: 'var(--font-size-base)',
													fontWeight: 'var(--font-weight-semibold)',
													color: 'var(--text-color)',
												}}>
												ROM Scan
											</span>
											{!isRomSplashVisible && (
												<>
													<button
														onClick={() =>
															romControlsRef.current?.onToggleMenu()
														}
														className="modal-topbar-button"
														title="Exercise Menu">
														<MdMenu size={24} />
													</button>
													<button
														onClick={() =>
															romControlsRef.current?.onToggleInfo()
														}
														className="modal-topbar-button"
														title="Exercise Info">
														<MdInfoOutline size={24} />
													</button>
												</>
											)}
										</div>
										<div
											style={{
												display: 'flex',
												gap: 'var(--spacing-2)',
												alignItems: 'center',
											}}>
											{/* ROM Controls */}
											{!isRomSplashVisible && (
												<>
													<button
														onClick={() =>
															romControlsRef.current?.onTogglePauseVideo()
														}
														className="modal-topbar-button"
														title={
															romControlsRef.current?.isVideoPause
																? 'Play'
																: 'Pause'
														}>
														{romControlsRef.current?.isVideoPause ? (
															<MdOutlinePlayCircle size={24} />
														) : (
															<MdOutlinePauseCircle size={24} />
														)}
													</button>
													<button
														onClick={() =>
															romControlsRef.current?.onToggleTutorial()
														}
														className="modal-topbar-button"
														title="Tutorial">
														<MdOutlineVideocam size={24} />
													</button>
													<button
														onClick={() =>
															romControlsRef.current?.switchCamera()
														}
														className="modal-topbar-button"
														title="Switch Camera">
														<MdOutlineSwitchCamera size={24} />
													</button>
													<button
														onClick={() =>
															romControlsRef.current?.onTogglesSwitchMode()
														}
														className="modal-topbar-button"
														title={
															romControlsRef.current?.isSwitchMode
																? 'Minimize Video'
																: 'Maximize Video'
														}>
														{romControlsRef.current?.isSwitchMode ? (
															<TbWindowMaximize size={24} />
														) : (
															<TbWindowMinimize size={24} />
														)}
													</button>
													<div
														style={{
															width: '1px',
															height: 'var(--spacing-6)',
															backgroundColor: 'var(--border-default)',
															margin: '0 4px',
														}}
													/>
													<button
														onClick={() =>
															romControlsRef.current?.onFullscreen()
														}
														className="modal-topbar-button"
														title={
															romControlsRef.current?.isFullscreen
																? 'Exit Fullscreen'
																: 'Fullscreen'
														}>
														{romControlsRef.current?.isFullscreen ? (
															<MdFullscreenExit size={24} />
														) : (
															<MdFullscreen size={24} />
														)}
													</button>
												</>
											)}
											<button
												onClick={confirmAndCloseRomModal}
												className="modal-topbar-button"
												title="Close">
												<MdClose size={24} />
											</button>
										</div>
									</div>
									{/* Modal Content */}
									<div
										className="start-scan"
										style={{ flex: 1, overflow: 'auto', height: '100%' }}>
										<RomFlow
											isDashboard={true}
											hideTopbar={true}
											showSplashOnMount={showRomSplash}
											controlsRef={romControlsRef}
											onScanComplete={() => {
												setRomModalOpen(false);
											}}
										/>
									</div>
								</div>
							</Modal>
						</>
					) : (
						<>
							<CompletionScreen isDashboard={true} savedVoice={''} />
						</>
					)}
				</>
			)}
		</div>
	);
};

export default RangeOfMotion;
