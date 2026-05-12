import { useState, useRef, useCallback } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { RehabVideoState } from '@types';
import type { ReactVideorRecordRef, RehabVideoState as VideoState } from '@types';
import { countdownTime } from '@stores/constants';

interface UseMediaCaptureOptions {
	/** Callback when video recording is finished */
	onRecordFinished?: (videoBlob: Blob) => void;
	/** Countdown time before recording starts (default: from constants) */
	countdownDuration?: number;
}

interface UseMediaCaptureReturn {
	/** Reference to the video recorder component */
	videoRef: React.RefObject<ReactVideorRecordRef>;
	/** The recorded video blob */
	videoBlob: Blob | null;
	/** Current state of video recording */
	videoState: VideoState;
	/** Whether the countdown timer is active */
	isStartingTimer: boolean;
	/** Selected image file(s) */
	imgFile: File[] | undefined;
	/** Start video recording (with countdown) */
	startRecord: () => void;
	/** Stop video recording */
	stopRecord: () => void;
	/** Discard recorded video */
	discardRecord: () => void;
	/** Handle countdown timer end */
	onEndedTimer: () => void;
	/** Handle image file selection */
	handleImgChange: (e: { target: { files: File[] } }) => void;
	/** Clear all media (video + images) */
	clearMedia: () => void;
	/** Set video blob manually */
	setVideoBlob: (blob: Blob | null) => void;
	/** Set image files manually */
	setImgFile: (files: File[] | undefined) => void;
	/** Callback for when video recording finishes */
	onRecordFinished: (blob: Blob) => void;
}

/**
 * Custom hook for managing video recording and image capture
 *
 * This hook encapsulates all media capture logic including video recording state machine,
 * countdown timers, image file handling, and cleanup operations.
 *
 * @example
 * ```tsx
 * const {
 *   videoRef,
 *   videoBlob,
 *   videoState,
 *   startRecord,
 *   stopRecord,
 *   discardRecord
 * } = useMediaCapture({
 *   onRecordFinished: (blob) =>  * });
 *
 * return (
 *   <VideoRecorder
 *     ref={videoRef}
 *     onRecordFinished={onRecordFinished}
 *   />
 * );
 * ```
 */
export function useMediaCapture(
	options: UseMediaCaptureOptions = {}
): UseMediaCaptureReturn {
	const { onRecordFinished, countdownDuration = countdownTime } = options;
	const { t } = useTranslation();

	// Refs
	const videoRef = useRef<ReactVideorRecordRef>(null);

	// State
	const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
	const [videoState, setVideoState] = useState<VideoState>(RehabVideoState.START);
	const [isStartingTimer, setStartingTimer] = useState(false);
	const [imgFile, setImgFile] = useState<File[] | undefined>([]);

	/**
	 * Start video recording with countdown timer
	 */
	const startRecord = useCallback(() => {
		videoRef?.current?.handleStartRecording();
		setVideoState(RehabVideoState.READY);

		setTimeout(() => {
			setStartingTimer(true);
			setVideoState(RehabVideoState.RECORDING);
		}, countdownDuration);
	}, [countdownDuration]);

	/**
	 * Stop video recording
	 */
	const stopRecord = useCallback(() => {
		videoRef?.current?.handleStopRecording?.();
		setVideoState(RehabVideoState.REPLAYING);
		setStartingTimer(false);
	}, []);

	/**
	 * Handle countdown timer end (automatically stops recording)
	 */
	const onEndedTimer = useCallback(() => {
		stopRecord();
	}, [stopRecord]);

	/**
	 * Discard recorded video and reset state
	 */
	const discardRecord = useCallback(() => {
		videoRef?.current?.handleStopReplaying();
		if (videoRef?.current?.recordedBlobs) {
			videoRef.current.recordedBlobs = [];
		}
		setVideoBlob(null);
		setVideoState(RehabVideoState.START);
	}, []);

	/**
	 * Handle image file selection
	 */
	const handleImgChange = useCallback((e: { target: { files: File[] } }) => {
		const files = e.target.files;
		if (files && files[0]) {
			setImgFile([files[0]]);
			message.success(t('patient.activity.imageSelected'));
		}
	}, [t]);

	/**
	 * Clear all media (video + images)
	 */
	const clearMedia = useCallback(() => {
		// Clear video
		videoRef?.current?.handleStopReplaying();
		if (videoRef?.current?.recordedBlobs) {
			videoRef.current.recordedBlobs = [];
		}
		videoRef?.current?.handleStopRecording();
		setVideoBlob(null);
		setVideoState(RehabVideoState.START);
		setStartingTimer(false);

		// Clear images
		setImgFile([]);
	}, []);

	/**
	 * Internal handler for when recording finishes
	 */
	const internalOnRecordFinished = useCallback((blob: Blob) => {
		if (blob) {
			setVideoBlob(blob);
			onRecordFinished?.(blob);
		}
	}, [onRecordFinished]);

	return {
		videoRef,
		videoBlob,
		videoState,
		isStartingTimer,
		imgFile,
		startRecord,
		stopRecord,
		discardRecord,
		onEndedTimer,
		handleImgChange,
		clearMedia,
		setVideoBlob,
		setImgFile,
		onRecordFinished: internalOnRecordFinished,
	};
}
