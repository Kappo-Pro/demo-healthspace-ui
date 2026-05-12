/**
 * RomPrograms - ROM Programs management page
 *
 * Standalone page component for /admin/rom-programs route
 * Displays custom ROM programs using the CustomOptionsList component
 */

import { AspectRatioModal } from '@atoms/Modal';
import { RomControlBar } from '@atoms/RomControlBar';
import { getStoredVolume, saveVolume } from '@hooks/usePersistedVolume';
import RomFlow from '@organisms/RomFlow';
import CustomOptionsList from '@pages/StartScan/CustomOptionsList';
import '@pages/StartScan/style.css';
import { Modal } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const RomPrograms: React.FC = () => {
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState(false);
	const [refresh, setRefresh] = useState(false);
	const [isRomModalOpen, setRomModalOpen] = useState(false);
	const [showRomSplash, setShowRomSplash] = useState(false);
	const [romModalKey, setRomModalKey] = useState(0);
	const [isRomSplashVisible, setRomSplashVisible] = useState(showRomSplash);
	const [cameraCount, setCameraCount] = useState(0);
	const [romControlState, setRomControlState] = useState(() => ({
		volume: getStoredVolume(),
		isMuted: false,
		isPaused: false,
		isFullscreen: false,
		isSwitchMode: false,
		isTransitionTimeScreen: false,
	}));

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

	// Detect number of cameras
	useEffect(() => {
		const detectCameras = async () => {
			try {
				const devices = await navigator.mediaDevices.enumerateDevices();
				const videoInputs = devices.filter(
					device => device.kind === 'videoinput',
				);
				setCameraCount(videoInputs.length);
			} catch {
				setCameraCount(1);
			}
		};
		detectCameras();
	}, []);

	// Cleanup camera streams
	const cleanupCameraStreams = async () => {
		const videos = document.querySelectorAll('video');
		const allTracks: MediaStreamTrack[] = [];

		videos.forEach(video => {
			const stream = video.srcObject as MediaStream | null;
			if (stream) {
				const tracks = stream.getTracks();
				allTracks.push(...tracks);
				video.srcObject = null;
				video.pause();
				video.load();
			}
		});

		allTracks.forEach(track => {
			track.stop();
		});

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
				await cleanupCameraStreams();
				setRomModalOpen(false);
				setRomModalKey(prev => prev + 1);
				setShowRomSplash(true);
			},
		});
	};

	// Handle RomFlow state changes
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

	return (
		<div className="total-patient-main-div">
			<CustomOptionsList
				isLoading={isLoading}
				refresh={refresh}
				setRefresh={setRefresh}
				setLoading={setIsLoading}
				setRomModalOpen={setRomModalOpen}
				setShowRomSplash={setShowRomSplash}
			/>

			<AspectRatioModal
				open={isRomModalOpen}
				onCancel={confirmAndCloseRomModal}
				afterClose={cleanupCameraStreams}
				destroyOnClose={true}>
				<div
					style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
					<div
						className="start-scan"
						style={{
							flex: 1,
							overflow: 'auto',
							height: '100%',
							position: 'relative',
						}}>
						{/* Floating Control Bar */}
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
		</div>
	);
};

export default RomPrograms;
