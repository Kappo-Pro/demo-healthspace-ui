import { ResultExerciseValidation } from '@types';
import './style.css';
import { Flex, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { ModalContentSkeleton } from '@atoms/Skeletons';

interface ISingleResultProps {
	exerciseName: string;
	enableToSendResult?: boolean;
	isPaused?: boolean;
	onNextTransition: () => void;
	resultExerciseValidation?: ResultExerciseValidation | null;
}

function SingleResult(props: ISingleResultProps) {
	const { t } = useTranslation();
	const { uploadProgress } = useTypedSelector(state => state.rom.main);
	const uploadStatusPosture  = useTypedSelector(state => state.postures.postures.uploadProgress);
	const [uploadStatus, setUploadStatus] = useState<number>(uploadProgress || uploadStatusPosture || 0);

useEffect(() => {
		if (uploadProgress || uploadStatusPosture) {
			setUploadStatus(uploadProgress || uploadStatusPosture);
		}
	}, [uploadProgress, uploadStatusPosture]);

	const { resultsExercises, exercises } = useTypedSelector(
		state => state.rom.main,
	);
	const [showSpin, setSpin] = useState<boolean>(false);
	const _dispatch = useTypedDispatch();

	useEffect(() => {
		if (
			uploadStatus === 100 &&
			resultsExercises.length + 1 != exercises?.length
		) {
			props.onNextTransition?.();
		} else if (
			uploadStatus === 100 &&
			resultsExercises.length + 1 == exercises?.length
		) {
			setSpin(true);
		}
	}, [uploadStatus, resultsExercises, exercises?.length, props]);

	return (
		<Flex
			justify="center"
			align="center"
			className="w-full h-full"
			style={{
				position: 'absolute',
				zIndex: 3,
				background:
					'linear-gradient(130deg, rgba(166, 126, 255, 0.84) 0%, rgba(89, 101, 255, 0.84) 100%)',
				textAlign: 'center',
				color: 'var(--text-on-brand)',
			}}>
			<div className="w-1/2">
				<>
					<Typography.Title level={4} style={{ color: 'var(--text-on-brand)' }}>
						COMPLETED
					</Typography.Title>
					{showSpin ? (
						<ModalContentSkeleton />
					) : (
						<>
							<Typography.Title
								level={3}
								style={{
									color: 'var(--text-on-brand)',
									backgroundColor: 'var(--color-success-600)',
									padding: 10,
									borderRadius: '50px',
								}}>
								{`${props.exerciseName?.toUpperCase()} \u00a0\u00a0\u00a0`}
							</Typography.Title>
							<div className="upload-container">
								{uploadStatus > 0 ? (
									<>
										<div className="upload-label">
											Uploading, Please wait... {uploadStatus.toFixed(0)}%
										</div>
										<div className="upload-bar">
											<div
												className="upload-progress"
												style={{ width: `${uploadStatus}%` }}></div>
										</div>
									</>
								) : (
									<span className="upload-label">{t('Patient.data.vitalscan-rom.processing')}</span>
								)}
							</div>
						</>
					)}
				</>
			</div>
		</Flex>
	);
}

export default SingleResult;
