import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	saveProgramExercise,
	setCompleted,
} from '@stores/shared/patientDetail/program';
import { RebhabProgramExercise } from '@types';
import { Button, Carousel, Flex, Image, Modal, Typography } from 'antd';
import { CarouselRef } from 'antd/es/carousel';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadBar } from '../UploadBar';
import RateExercise from './RateExercise';
import VideoPlayer from './VideoPlayer';
import './style.css';

interface CompletionScreenProps {
	savedVoice: string;
	exercises: RebhabProgramExercise[];
	setExercises: (value: RebhabProgramExercise[]) => void;
	onFullscreenChange: () => void;
	patchAndSave: () => void;
	bandwidth?: boolean;
	setActiveStep: (value: number) => void;
}

export const PreCompletionScreen = (props: CompletionScreenProps) => {
	const {
		savedVoice,
		exercises,
		setExercises,
		onFullscreenChange,
		patchAndSave,
		bandwidth = false,
		setActiveStep,
	} = props;
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const dispatch = useTypedDispatch();
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { uploadProgress } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const [thumbnails, setThumbnails] = useState<string[]>([]);
	const [previewIndex, setPreviewIndex] = useState<number | null>(null);

	const { t } = useTranslation();

	useEffect(() => {
		onFullscreenChange();
		setActiveStep(7);
	}, []);

	useEffect(() => {
		if (
			savedVoice.toLowerCase().includes('save') ||
			savedVoice.toLowerCase().includes('save.')
		) {
			dispatch(setCompleted(true));
		}
	}, [savedVoice]);

	useEffect(() => {
		setCurrentSlide(currentExerciseIndex);
	}, [currentExerciseIndex]);

	function base64ToBlob(base64Data: string, contentType = 'image/png'): Blob {
		const byteCharacters: string = atob(base64Data.split(',')[1]);
		const byteArrays: Uint8Array[] = [];

		for (let offset = 0; offset < byteCharacters.length; offset += 512) {
			const slice: string = byteCharacters.slice(offset, offset + 512);
			const byteNumbers: number[] = new Array(slice.length)
				.fill(0)
				.map((_, i) => slice.charCodeAt(i));
			const byteArray: Uint8Array = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		return new Blob(byteArrays, { type: contentType });
	}

	const handleClick = async () => {
		setLoading(true);
		const submitExercisePromises = exercises.map(async (exercise, index) => {
			const form = new FormData();
			form.append(
				bandwidth ? 'image' : 'video',
				bandwidth
					? base64ToBlob(thumbnails[index], 'image/png')
					: exercise.video,
			);
			form.append('programSessionId', exercise.programSessionId);
			form.append('programExerciseId', exercise.programExerciseId);
			form.append(
				'exerciseDifficultyLevel',
				exercise.exerciseDifficultyLevel.toString(),
			);

			await dispatch(
				saveProgramExercise({
					user: selectedUser,
					exercise: exercise,
					index: index,
					form: form,
				}),
			);
		});

		await Promise.all(submitExercisePromises);
		setLoading(false);
		patchAndSave();
	};

	const updateExerciseDifficulty = (index: number, difficulty: number) => {
		const updatedExercises = exercises.map((exercise, i) =>
			i === index
				? { ...exercise, exerciseDifficultyLevel: difficulty }
				: exercise,
		);
		setExercises(updatedExercises);
	};

	const showModal = (index: number) => {
		setCurrentExerciseIndex(index);
		setIsModalVisible(true);
		setTimeout(() => {
			carouselRef.current?.goTo(index, true);
		}, 0);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	const carouselRef = useRef<CarouselRef>(null);
	const [currentSlide, setCurrentSlide] = useState(0);

	const handlePrev = () => {
		carouselRef?.current?.prev();
	};

	const handleNext = () => {
		carouselRef?.current?.next();
	};

	useEffect(() => {
		const generateThumbnails = async () => {
			const frames = await Promise.all(
				exercises.map(async exercise => {
					if (!exercise?.video) return '';

					let objectUrl: string | null = null;
					try {
						const videoBlob =
							exercise.video instanceof Blob
								? exercise.video
								: await (await fetch(exercise.video)).blob();

						// Check if it's an image blob (from Windows Edge image capture)
						if (videoBlob.type.startsWith('image/')) {
							// It's already an image, just convert to data URL
							return new Promise<string>(resolve => {
								const reader = new FileReader();
								reader.onloadend = () => resolve(reader.result as string);
								reader.readAsDataURL(videoBlob);
							});
						}

						// It's a video, extract a frame
						const video = document.createElement('video');
						objectUrl = URL.createObjectURL(videoBlob);
						video.src = objectUrl;
						video.crossOrigin = 'anonymous';
						video.muted = true;

						await new Promise<void>((resolve, reject) => {
							video.addEventListener('loadedmetadata', () => {
								video.currentTime =
									video.duration > 5 ? 5 : Math.min(1, video.duration - 0.1);
							});
							video.addEventListener('seeked', () => resolve());
							video.addEventListener('error', e => reject(e));
						});

						const canvas = document.createElement('canvas');
						canvas.width = video.videoWidth;
						canvas.height = video.videoHeight;
						const ctx = canvas.getContext('2d');
						if (ctx) {
							ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
							return canvas.toDataURL('image/png');
						}
						return '';
					} catch (err) {
						return '';
					} finally {
						// Always revoke object URL to prevent memory leak (critical for Edge)
						if (objectUrl) {
							URL.revokeObjectURL(objectUrl);
						}
					}
				}),
			);

			setThumbnails(frames);
		};

		if (bandwidth) {
			generateThumbnails();
		}
	}, [exercises, bandwidth]);

	return (
		<Flex vertical align="center" gap={12}>
			<Typography className="main-heading-label text-align-center p-2">
				{t('Admin.data.rehab.rehabPreAssessment.howDifficult')}
			</Typography>
			<div
				style={{
					height: '400px',
					overflowY: 'auto',
					width: '90%',
				}}>
				{exercises?.map((exercise, index) => (
					<div
						className="video-height-css"
						key={index}
						style={{
							marginBottom: 'var(--spacing-2-5)',
							backgroundColor: 'var(--brand-primary-alpha)',
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
						}}>
						<Flex align="center">
							{loading ? (
								<Flex
									vertical
									align="center"
									justify="center"
									style={{ marginTop: 'var(--spacing-4)' }}>
									<Typography>
										Saving {index + 1} of {exercises.length}
									</Typography>
									<UploadBar
										uploadProgress={
											uploadProgress.length > 0
												? uploadProgress[uploadProgress.length - 1].progress[
														index
													]
												: 0
										}
									/>
								</Flex>
							) : (
								<div
									className="image-wrapper gap-2 flex-shrink-0 mr-3 flex items-center"
									onClick={() =>
										!bandwidth ? showModal(index) : setPreviewIndex(index)
									}>
									{!bandwidth ? (
										<VideoPlayer
											video={exercise?.video}
											className="video-height-css"
											controls={false}
										/>
									) : (
										<Image
  src={thumbnails[index]}
  style={{ width: '150px', height: '90px' }}
  preview={{
    visible: previewIndex === index,
    onVisibleChange: visible => {
      if (!visible) {
        setPreviewIndex(null);
      }
    },
  }}
  onClick={() => setPreviewIndex(index)}
/>

									)}

									<div className="play-button">
										<UntitledIcon
											name={!bandwidth ? "playCircle" : "eye"}
											color="var(--color-white)"
										/>
									</div>
								</div>
							)}
							<Typography>{exercise?.name?.toUpperCase()}</Typography>
						</Flex>
						<div style={{ marginRight: 'var(--spacing-5)' }}>
							<RateExercise
								selectedRating={exercise?.exerciseDifficultyLevel}
								exercise={exercise}
								onRatingChange={rating =>
									updateExerciseDifficulty(index, rating)
								}
							/>
						</div>
					</div>
				))}
			</div>
			{!loading && (
				<Button onClick={handleClick}>
					{t('Admin.data.rehab.rehabPreAssessment.saveText')}
				</Button>
			)}
			<Modal
				visible={isModalVisible}
				className="background-color"
				onCancel={handleCancel}
				footer={null}
				width={800}
				closable={false}
				styles={{
					body: { background: 'var(--brand-primary)', borderRadius: 8 },
				}}>
				<div
					style={{
						backgroundColor: 'var(--brand-primary)',
						padding: 0,
						borderRadius: 'var(--spacing-2)',
					}}>
					<div style={{ position: 'relative' }}>
						<Carousel
							ref={carouselRef}
							afterChange={current => setCurrentSlide(current)}
							dots={false}>
							{exercises.map((exercise, index) => (
								<div
									key={index}
									style={{
										padding: 'var(--spacing-5)',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
									}}>
									{exercise?.video && (
										<VideoPlayer
											video={exercise?.video}
											controls={true}
											className="video-modal-height"
										/>
									)}
									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											width: '100%',
											alignItems: 'center',
											padding: 'var(--spacing-5)',
										}}>
										<Typography>{exercise?.name?.toUpperCase()}</Typography>
										<div>
											<RateExercise
												selectedRating={exercise?.exerciseDifficultyLevel}
												exercise={exercise}
												onRatingChange={rating =>
													updateExerciseDifficulty(index, rating)
												}
											/>
										</div>
									</div>
								</div>
							))}
						</Carousel>

						{exercises.length > 1 && currentSlide !== 0 && (
							<LeftOutlined
								onClick={handlePrev}
								style={{
									position: 'absolute',
									top: '50%',
									left: '-200px',
									transform: 'translateY(-50%)',
									fontSize: '42px',
									color: 'var(--color-white)',
									cursor: 'pointer',
									zIndex: 1,
								}}
							/>
						)}

						{exercises.length > 1 && currentSlide !== exercises.length - 1 && (
							<RightOutlined
								onClick={handleNext}
								style={{
									position: 'absolute',
									top: '50%',
									right: '-200px',
									transform: 'translateY(-50%)',
									fontSize: '42px',
									color: 'var(--color-white)',
									cursor: 'pointer',
									zIndex: 1,
								}}
							/>
						)}
					</div>
					<Button
						type="primary"
						onClick={handleCancel}
						style={{
							bottom: '0px',
							left: '50%',
							transform: 'translateX(-50%)',
							border: '2px solid',
							borderColor: 'var(--color-white)',
							color: 'var(--color-white)',
							borderRadius: 'var(--spacing-5)',
							padding: 'var(--spacing-2-5) var(--spacing-5)',
							margin: 'var(--spacing-5)',
							zIndex: 1000,
						}}>
						{t('Admin.data.rehab.rehabPreAssessment.closeText')}
					</Button>
				</div>
			</Modal>
		</Flex>
	);
};
