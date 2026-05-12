import { UsePostureScreenAudio } from '@pages/PostureScan/context/PostureScreen.context';
import { useTypedSelector } from '@stores/index';
import { PostureView, ResultExerciseValidation } from '@stores/interfaces';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';

interface ISingleResultProps {
	exerciseName: string;
	enableToSendResult?: boolean;
	isPaused?: boolean;
	onNextTransition: () => void;
	resultExerciseValidation?: ResultExerciseValidation | null;
	postureScan?: boolean;
	isCompleted?: boolean;
	/** Current view index (0-3) - kept for compatibility */
	viewIndex?: number;
}

function SingleResult(props: ISingleResultProps) {
	const { t } = useTranslation();
	const { postureScan = false, exerciseName, viewIndex } = props;
	const { uploadProgress } = useTypedSelector(state => state.rom.main);
	const uploadStatusPosture = useTypedSelector(
		state => state.postures.postures.uploadProgress,
	);
	const [uploadStatus, setUploadStatus] = useState<number>(
		uploadProgress || uploadStatusPosture || 0,
	);
	const { play } = UsePostureScreenAudio();
	const [audioCompleted, setAudioCompleted] = useState<boolean>(false);
	const [minDisplayMet, setMinDisplayMet] = useState<boolean>(false);

	// Minimum display time to let blur animation complete
	useEffect(() => {
		const minDisplayTimer = setTimeout(() => {
			setMinDisplayMet(true);
		}, 2500);
		return () => clearTimeout(minDisplayTimer);
	}, []);

	useEffect(() => {
		if (postureScan) {
			const view = exerciseName.toLowerCase() as PostureView;

			const playCongratsAudio = async () => {
				// Play congratulations only - intro audio now plays during INTRO state
				await play(view, 'congratulations');
				setAudioCompleted(true);
			};

			playCongratsAudio();

			// Fallback timeout in case audio fails to play (browser restrictions)
			const fallbackTimer = setTimeout(() => {
				setAudioCompleted(true);
			}, 4000);

			return () => clearTimeout(fallbackTimer);
		}
	}, [postureScan, exerciseName, play]);

	useEffect(() => {
		// Sync local state with Redux - handle all values including 0
		const reduxProgress = uploadProgress ?? uploadStatusPosture ?? 0;
		setUploadStatus(reduxProgress);
	}, [uploadProgress, uploadStatusPosture]);

	const { resultsExercises, exercises } = useTypedSelector(
		state => state.rom.main,
	);
	const { isCompleted, onNextTransition } = props;

	useEffect(() => {
		const isRomComplete =
			resultsExercises.length + 1 != exercises?.length && uploadStatus === 100;

		const isPostureComplete =
			postureScan && (uploadStatus === 100 || isCompleted);

		// Wait for both audio and minimum display time before transitioning
		const canTransition = audioCompleted && minDisplayMet;

		if ((isRomComplete || isPostureComplete) && canTransition) {
			onNextTransition?.();
		}
	}, [uploadStatus, resultsExercises, audioCompleted, minDisplayMet, postureScan, exercises, isCompleted, onNextTransition]);

	return (
		<div className="single-result">
			<div className="single-result-content">
				<h1 className="completed-title">{t('common.postureScan.result.scanComplete')}</h1>
				{uploadStatus > 0 && (
					<div className="upload-container">
						<div className="upload-label">
							{t('common.postureScan.result.uploading')} {uploadStatus.toFixed(0)}%
						</div>
						<div className="upload-bar">
							<div
								className="upload-progress"
								style={{ width: `${uploadStatus}%` }}></div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default SingleResult;
