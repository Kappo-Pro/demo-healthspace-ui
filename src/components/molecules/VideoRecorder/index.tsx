import { UntitledIcon } from '@atoms/Icon';
import { useTypedSelector } from '@stores/index';
import { RehabVideoState } from '@types';
import { Tooltip } from 'antd';
import {
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import ReactVideoRecorder, { VideoActionsProps } from 'react-video-recorder';
import counterSound from '../../organisms/RomFlow/TransitionTime/counterSound.mp3';
import './style.css';
interface IVideoRecordProps {
	timeLimit: number;
	cameraId: string | null;
	onRecordFinished: (videoBlob: Blob) => void;
	audio?: boolean;
	videoBlob?: null | Blob;
	videoState?: RehabVideoState;
	isFullscreen?: boolean;
	getTimeLeft: (timeLeft: number) => void;
	bandwidth?: boolean;
	isWindowsEdge?: boolean;
	isMuted?: boolean;
}

function VideoRecord(props: IVideoRecordProps, ref: any) {
	const {
		timeLimit,
		onRecordFinished,
		videoBlob,
		videoState,
		isFullscreen,
		getTimeLeft,
		bandwidth = false,
		isWindowsEdge = false,
		isMuted = false,
	} = props;
	const [saving, setSaving] = useState(false);
	const [mute, setMute] = useState(false);
	const { transitionTime } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const { t } = useTranslation();
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const objectUrlRef = useRef<string | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.muted = mute;
		}
	}, [mute]);

	// Handle isMuted prop for the recording stream
	useEffect(() => {
		const toggleAudioTracks = (stream: MediaStream) => {
			const audioTracks = stream.getAudioTracks();
			audioTracks.forEach(track => {
				track.enabled = !isMuted;
			});
		};

		// 1. Try to get stream from ref.current (if it's a video element)
		if (ref?.current && ref.current instanceof HTMLVideoElement && ref.current.srcObject instanceof MediaStream) {
			toggleAudioTracks(ref.current.srcObject);
		}

		// 2. Try to find a video element within the wrapper
		// react-video-recorder might wrap the video element
		const wrapper = document.querySelector('.program-video-recorder');
		if (wrapper) {
			const videoElements = wrapper.getElementsByTagName('video');
			for (let i = 0; i < videoElements.length; i++) {
				const video = videoElements[i];
				if (video.srcObject instanceof MediaStream) {
					toggleAudioTracks(video.srcObject);
				}
			}
		}

		// 3. Fallback: Search all video elements if still recording
		if (videoState === RehabVideoState.RECORDING || videoState === RehabVideoState.READY) {
			const allVideos = document.getElementsByTagName('video');
			for (let i = 0; i < allVideos.length; i++) {
				const video = allVideos[i];
				if (video.srcObject instanceof MediaStream) {
					toggleAudioTracks(video.srcObject);
				}
			}
		}
	}, [isMuted, ref, videoState]);

	const videoElement = useMemo(() => {
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		}

		if (videoBlob) {
			const blobUrl = URL.createObjectURL(videoBlob);
			const isImage = videoBlob.type.startsWith('image/');

			// If it's an image (from Windows Edge image capture), render as image
			if (isImage) {
				return (
					<img
						src={blobUrl}
						alt="Captured exercise"
						style={{ width: '100%', height: '100%', objectFit: 'cover' }}
					/>
				);
			}

			// Otherwise render as video
			return (
				<video
					ref={videoRef}
					autoPlay
					loop
					muted={mute}
					src={blobUrl}
					onLoadedMetadata={e => {
						// Handle autoplay promise to prevent interruption errors
						const video = e.currentTarget;
						const playPromise = video.play();
						if (playPromise !== undefined) {
							playPromise.catch(() => {
								// Autoplay failures handled gracefully
							});
						}
					}}
				/>
			);
		}
		return null;
	}, [videoBlob, mute]);

	const runCountDown = useCallback(
		({ isRunningCountdown }: VideoActionsProps) => {
			if (isRunningCountdown) {
				return (
					<InternalCountdown
						transitionTime={transitionTime ?? 3}
						bandwidth={bandwidth}
					/>
				);
			}
			return null;
		},
		[transitionTime, bandwidth],
	);

	const onRecordingComplete = (vidBlob: Blob) => {
		setSaving(true);
		if (ref && 'current' in ref && ref.current) {
			try {
				(
					ref.current as { handleStopReplaying: () => void }
				).handleStopReplaying();
			} catch {
				// Replay stop errors handled gracefully
			}
		}
		// Faster saving time for Windows Edge to reduce memory pressure
		const savingDelay = isWindowsEdge ? 1500 : 3000;

		setTimeout(() => {
			if (vidBlob) {
				onRecordFinished(vidBlob);
				setSaving(false);
			} else {
				// Handle missing blob
				// Missing blob handled by not calling onRecordFinished
			}
		}, savingDelay);
	};

	const stopStreamedVideo = useCallback(() => {
		if (ref?.current) {
			const stream = ref.current.srcObject as MediaStream;
			if (stream) {
				const tracks = stream.getTracks();

				tracks.forEach(track => {
					track.stop();
				});
			}

			ref.current.srcObject = null;
		}
	}, [ref]);

	useEffect(() => {
		return () => {
			// Stop audio playback before unmounting
			if (audioRef.current) {
				try {
					audioRef.current.pause();
					audioRef.current.currentTime = 0;
				} catch {
					// Ignore cleanup errors
				}
			}

			// Stop video playback before unmounting
			if (videoRef.current) {
				try {
					videoRef.current.pause();
					// Revoke blob URL to prevent memory leaks
					if (
						videoRef.current.src &&
						videoRef.current.src.startsWith('blob:')
					) {
						URL.revokeObjectURL(videoRef.current.src);
					}
				} catch {
					// Ignore cleanup errors
				}
			}

			// Clear recording interval
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}

			// Stop video streams
			stopStreamedVideo();
			// Revoke object URL on unmount to prevent memory leak (critical for Edge)
			if (objectUrlRef.current) {
				URL.revokeObjectURL(objectUrlRef.current);
				objectUrlRef.current = null;
			}
		};
	}, [stopStreamedVideo]);

	useEffect(() => {
		setMute(true);
	}, [videoState]);

	// ReactVideoRecorder treats timeLimit as total duration including countdown.
	// We add transitionTime to ensure we get a full 60s of recording after the countdown.
	const TIME_LIMIT_MS = timeLimit + (transitionTime ?? 3) * 1000;
	const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS / 1000);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const handleStartRecording = () => {
		setTimeLeft(TIME_LIMIT_MS / 1000);
		intervalRef.current = setInterval(() => {
			setTimeLeft(prev => {
				if (prev <= 1) {
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};
	const handleRecordingComplete = (videoBlob: Blob) => {
		clearInterval(intervalRef.current!);

		if (isWindowsEdge && videoBlob) {
			if (typeof (window as unknown).gc === 'function') {
				try {
					(window as unknown).gc();
				} catch {
					// ignore
				}
			}
		}

		onRecordingComplete(videoBlob);
	};

	useEffect(() => {
		getTimeLeft && getTimeLeft(timeLeft);
	}, [timeLeft]);

	// Windows Edge specific video constraints to prevent crashes
	const videoConstraints = isWindowsEdge
		? {
				width: { ideal: 1280, max: 1280 },
				height: { ideal: 720, max: 720 },
				frameRate: { ideal: 24, max: 30 },
				facingMode: 'user',
			}
		: {
				width: { ideal: 1920 },
				height: { ideal: 1080 },
				facingMode: 'user',
			};

	// Check codec support and fallback if needed
	// Safari: let browser choose native format (MP4)
	// Windows Edge: use conservative WebM options
	// Other browsers: use default
	const getOptimalMimeType = () => {
		if (typeof MediaRecorder === 'undefined') return undefined;

		// Safari doesn't support WebM, let it use native MP4
		const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		if (isSafari) return undefined;

		// Windows Edge needs specific codec handling
		if (!isWindowsEdge) return undefined;

		const codecs = [
			'video/webm;codecs=vp8',
			'video/webm;codecs=vp9',
			'video/webm',
			undefined,
		];

		for (const codec of codecs) {
			if (!codec || MediaRecorder.isTypeSupported(codec)) {
				return codec;
			}
		}

		return undefined;
	};

	const mimeType = getOptimalMimeType();

	return (
		<>
			<ReactVideoRecorder
				ref={ref}
				isOnInitially
				isReplayingVideo={false}
				wrapperClassName={`video-record-item program-video-recorder w-full ${isFullscreen ? 'full-height' : ''}`}
				timeLimit={timeLimit}
				renderActions={runCountDown}
				countdownTime={(transitionTime ?? 3) * 1000}
				onStartRecording={handleStartRecording}
				onRecordingComplete={handleRecordingComplete}
				constraints={{
					audio: true,
					video: videoConstraints,
				}}
				mimeType={mimeType}
				chunkSize={isWindowsEdge ? 5000 : 250}
				dataAvailableTimeout={2000}
			/>
			{saving && <div style={{ textAlign: 'center' }}>Saving...</div>}
			{(videoState === RehabVideoState.RATING ||
				videoState === RehabVideoState.REPLAYING) && (
				<div className="absolute top-0 left-0 w-[420px]">
					{videoElement}
					<div className="absolute left-2 bottom-2 bg-surface-overlay rounded-full p-2">
						<Tooltip
							title={
								mute
									? t('Patient.data.rehab.unmute')
									: t('Patient.data.rehab.mute')
							}>
							<div
								onClick={() => setMute(!mute)}
								className="align-middle cursor-pointer"
								style={{ position: 'relative', display: 'inline-block' }}>
								<UntitledIcon
									name="audio"
									size={20}
									style={{ color: 'var(--icon-on-dark)' }}
								/>
								{mute && (
									<div
										style={{
											position: 'absolute',
											top: '50%',
											left: '50%',
											transform: 'translate(-50%, -50%) rotate(-45deg)',
											width: '120%',
											height: 2,
											backgroundColor: 'var(--icon-on-dark)',
										}}
									/>
								)}
							</div>
						</Tooltip>
					</div>
				</div>
			)}
		</>
	);
}

const InternalCountdown = ({
	transitionTime,
	bandwidth,
}: {
	transitionTime: number;
	bandwidth: boolean;
}) => {
	const [counterTime, setCounterTime] = useState<number>(transitionTime);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const { t } = useTranslation();

	useEffect(() => {
		audioRef.current = new Audio(counterSound);
		let counter = transitionTime;

		const interval = setInterval(() => {
			if (audioRef.current && !bandwidth && counter > 0) {
				audioRef.current.currentTime = 0;
				const playPromise = audioRef.current.play();
				if (playPromise !== undefined) {
					playPromise.catch(() => {});
				}
			}
			counter -= 1;
			setCounterTime(counter);

			if (counter <= 0) {
				clearInterval(interval);
			}
		}, 1000);

		return () => {
			clearInterval(interval);
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
			}
		};
	}, [transitionTime, bandwidth]);

	if (counterTime < 1) return null;

	return (
		<div
			style={{
				position: 'absolute',
				zIndex: 10,
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: 42,
					color: 'var(--color-white)',
					fontWeight: 'bold',
					textShadow: '2px 2px 4px var(--color-black)',
					textAlign: 'center',
				}}>
				{t('Patient.data.vitalscan-rom.getPosition')}
				<br />
				<div
					className="bg-primary-600 shadow-black shadow-md rounded-full"
					style={{
						width: 100,
						height: 100,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 42,
						fontWeight: 'bold',
						backgroundColor: 'var(--sidebar-item-active-bg)',
						color: 'var(--color-white)',
						borderRadius: '50%',
						marginTop: '10px',
					}}>
					{counterTime}
				</div>
				{!bandwidth && (
					<audio
						ref={audioRef}
						src={counterSound}
						preload="auto"
						style={{ display: 'none' }}
					/>
				)}
			</div>
		</div>
	);
};

export default forwardRef(VideoRecord);
