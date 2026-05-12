import PostureScan from '@pages/PostureScan';
import { PosturalAnalytics } from '@pages/PostureScan/context/Controls.context';
import { PLANS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getPostureByPage,
	getPostureBySession,
	getPostureBySessionInActivityStream,
	setSelectedScan,
	setTempSelectedScan,
} from '@stores/postures/postures';
import { TOnBoardPostureProps } from '@types';
import { Button, Flex, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	MdClose,
	MdFullscreen,
	MdFullscreenExit,
	MdMenu,
	MdOutlineSwitchCamera,
} from 'react-icons/md';
import './PostureAnalysis.css';

const PostureAnalysis = (props: TOnBoardPostureProps) => {
	const { setActiveStep, setProgressPercent, onComplete } = props;
	const { t } = useTranslation();
	const videoRecordState = useTypedSelector(
		state => state.onBoard.onBoard.videoRecordState,
	);
	const [scanState, setScanState] = useState(false);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const planType = savedUserPlans?.planType;
	const isVirtualPt = planType === PLANS.VIRTUALPT;
	const isEarlyIntervention = planType === PLANS.EARLYINTERVENTION;
	const [isPostureModalOpen, setPostureModalOpen] = useState(false);
	const [isPostureFullscreen, setPostureFullscreen] = useState(false);
	const [scanProgress, setScanProgress] =
		useState<Partial<PosturalAnalytics> | null>(null);
	const onBoardPostureCompletion = useTypedSelector(
		state => state.onBoard.onBoard.onBoardPostureCompletion,
	);
	const [isLoading, setLoading] = useState(true);
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	useEffect(() => {
		if (isVirtualPt) {
			onComplete();
			if (setActiveStep) {
				setActiveStep(9);
			}
			setProgressPercent(90);
		} else {
			if (setActiveStep) {
				setActiveStep(9);
			}
		}
	}, [isVirtualPt, onComplete, setActiveStep, setProgressPercent]);

	const handleProgressUpdate = (data: Partial<PosturalAnalytics>) => {
		setScanProgress(data);
	};

	// Ref to access Posture control handlers
	const postureControlsRef = useRef<{
		onFullScreen: () => void;
		onToggleMenu: () => void;
		onSwitchCamera: () => void;
		isFullScreen: boolean;
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
				setScanState(false);
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

	// Sync Posture fullscreen state from ref to trigger re-renders
	useEffect(() => {
		if (!isPostureModalOpen) {
			setPostureFullscreen(false);
			return;
		}

		const interval = setInterval(() => {
			if (postureControlsRef.current) {
				setPostureFullscreen(postureControlsRef.current.isFullScreen);
			}
		}, 100);

		return () => clearInterval(interval);
	}, [isPostureModalOpen]);

	const handleClick = async () => {
		onComplete();
	};

	const fetchSessionData = async () => {
		try {
			const data = await dispatch(
				getPostureByPage({
					userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
					page: 1,
				}),
			);

			const sessionItem = data?.payload?.data[0];
			const sessionId = sessionItem?.id;

			if (sessionId && sessionItem) {
				// Fetch the report data
				const reportResult = await dispatch(getPostureBySession({ sessionId }));
				await dispatch(
					getPostureBySessionInActivityStream({ sessionId: sessionId }),
				).unwrap();
				dispatch(
					setSelectedScan({
						item: sessionItem,
						postureReportData: {
							data: [reportResult.payload],
							pagination: null,
						},
					}),
				);
				dispatch(setTempSelectedScan({ item: sessionItem }));
			}
			setLoading(false);
		} catch (error) {
			console.error('Error fetching session data:', error);
			setLoading(false);
		}
	};

	if (isVirtualPt) return null;

	return (
		<>
			<div className="posture-medical-container">
				{!scanState ? (
					<>
						<div className="posture-intakeing-container">
							<div
								className="posture-intakeing-card posture-intake-card"
								style={{
									backgroundImage: `url(/images/posture-intake.svg)`,
									backgroundSize: 'cover',
									backgroundPosition: 'top center',
								}}>
								<div />

								<div
									className="posture-intake-content"
									style={{ width: '75%', top: '20%' }}>
									<div className="acknowledge-box posture-intake-acknowledge">
										<span
											className="posture-intake-checkbox-label"
											style={{
												color: 'var(--text-primary)',
												textAlign: 'center',
												marginBottom: 'var(--spacing-2-5)',
											}}>
											{t('Patient.data.onboard.postureAnalysisDescription')}
										</span>
										<Flex vertical gap={8} style={{ width: '100%' }}>
											<Button
												type="primary"
												className="onboard-btn"
												size="large"
												onClick={e => {
													e.stopPropagation();
													setScanState(true);
													setPostureModalOpen(true);
												}}>
												{t('patient.dashboard.startPostureScan').toUpperCase()}
											</Button>
										</Flex>
									</div>
								</div>
							</div>
						</div>
					</>
				) : (
					<>
						{!onBoardPostureCompletion && (
							<Modal
								open={isPostureModalOpen}
								onCancel={confirmAndClosePostureModal}
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
									{/* Custom Topbar - Hidden when fullscreen */}
									{!isPostureFullscreen && (
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
											<span
												style={{
													fontSize: 'var(--font-size-base)',
													fontWeight: 'var(--font-weight-semibold)',
													color: 'var(--text-color)',
												}}>
												Posture Scan
											</span>
											{scanProgress?.view && (
												<span
													style={{
														fontSize: 'var(--font-size-base)',
														fontWeight: 'bold',
														color: 'var(--color-purple-700)',
														marginLeft: 'var(--spacing-3)',
													}}>
													{{
														front: 'Front View',
														back: 'Back View',
														left: 'Left Side',
														right: 'Right Side',
													}[scanProgress.view] || scanProgress.view}
												</span>
											)}
											<div
												style={{
													display: 'flex',
													gap: 'var(--spacing-2)',
													alignItems: 'center',
												}}>
												{/* Posture Controls */}
												<button
													onClick={() =>
														postureControlsRef.current?.onToggleMenu()
													}
													className="modal-topbar-button"
													title="Menu">
													<MdMenu size={24} />
												</button>
												<button
													onClick={() =>
														postureControlsRef.current?.onSwitchCamera()
													}
													className="modal-topbar-button"
													title="Switch Camera">
													<MdOutlineSwitchCamera size={24} />
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
														postureControlsRef.current?.onFullScreen()
													}
													className="modal-topbar-button"
													title={
														postureControlsRef.current?.isFullScreen
															? 'Exit Fullscreen'
															: 'Fullscreen'
													}>
													{postureControlsRef.current?.isFullScreen ? (
														<MdFullscreenExit size={24} />
													) : (
														<MdFullscreen size={24} />
													)}
												</button>
												<button
													onClick={confirmAndClosePostureModal}
													className="modal-topbar-button"
													title="Close">
													<MdClose size={24} />
												</button>
											</div>
										</div>
									)}
									{/* Modal Content */}
									<div
										className="start-scan"
										style={{ flex: 1, overflow: 'auto', height: '100%' }}>
										<PostureScan
											isDashboard={true}
											hideTopbar={!isPostureFullscreen}
											controlsRef={postureControlsRef}
											onProgressUpdate={handleProgressUpdate}
											onScanComplete={async () => {
												// Cleanup camera BEFORE closing modal
												await cleanupCameraStreams();
												setPostureModalOpen(false);
												// Directly call onComplete to move to dashboard
												onComplete();
											}}
										/>
									</div>
								</div>
							</Modal>
						)}
					</>
				)}
			</div>
			{!scanState && (
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					{isEarlyIntervention && (
						<Button
							type="primary"
							size="large"
							disabled={videoRecordState}
							onClick={() => {
								onComplete();
								setProgressPercent(90);
							}}>
							{t('Patient.data.onboard.skip')?.toUpperCase()}
						</Button>
					)}
				</div>
			)}
		</>
	);
};

export default PostureAnalysis;
