import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { Target04 } from '@vitalflow-icons/general/target04';
import SelectedProgram from '@pages/PatientDashboard/SelectedProgram';
import { INTAKE_STEPS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { createProgram } from '@stores/shared/patientDetail/program';
import {
	SuggestedProgramItem,
	TSuggestedProgram,
	TSuggestedProgrammExerciseItem} from '@types';
import {
	Button,
	Carousel,
	Flex,
	Modal,
	Popover,
	Typography,
	message} from 'antd';
import { CarouselRef } from 'antd/es/carousel';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ExistingPatientCarousel.css';

const { Paragraph } = Typography;

const ExistingPatientDashboard = (props: {
	suggestedProgramData: SuggestedProgramItem[];
	fetchHomeData: (value: number) => void;
}) => {
	const dispatch = useTypedDispatch();
	const { suggestedProgramData, fetchHomeData } = props;
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const carouselRef = useRef<CarouselRef>(null);
	const [suggestedProgramModal, setSuggestedProgramModal] = useState(false);
	const [selectedProgramModalData, setSelectedProgramModalData] =
		useState(null);
	const scrollLeft = () => {
		if (carouselRef.current) {
			carouselRef.current.prev();
		}
	};

	const scrollRight = () => {
		if (carouselRef.current) {
			carouselRef.current.next();
		}
	};

	const handleOpenSuggestedProgram = item => {
		setSelectedProgramModalData({
			selectedProgram: item,
			domain: INTAKE_STEPS.SUGGESTED,
		});
		setSuggestedProgramModal(true);
	};

	const handleEnroll = async (item: TSuggestedProgram) => {
		const exercises: {
			strapiExerciseId: string;
			exerciseLibraryId: string;
			weeklyReps: number;
			dailyReps: number;
			sets: number;
			reps: number;
			order: number;
		}[] = [];
		item?.exercises?.forEach(
			(exercise: TSuggestedProgrammExerciseItem, index: number) => {
				const tempExercise = {
					strapiExerciseId: String(
						typeof exercise?.strapiExerciseId === 'object'
							? exercise?.strapiExerciseId?.vitalflowId
							: exercise?.strapiExerciseId || '',
					),
					exerciseLibraryId: exercise.exerciseLibraryId || '',
					weeklyReps: exercise.weeklyReps,
					dailyReps: exercise.dailyReps,
					sets: exercise.sets,
					reps: exercise.reps,
					order: index + 1,
				};
				exercises.push(tempExercise);
			},
		);
		const formData = new FormData();
		formData.append('name', item?.name);
		formData.append('duration', item?.duration.toString());
		formData.append('durationType', item?.durationType);
		formData.append('description', item?.description);
		formData.append(
			'thumbnail',
			typeof item?.thumbnail === 'string'
				? item?.thumbnail
				: item?.thumbnail?.url || '',
		);
		if (user.isPhysioterapist ? selectedUser?.id : user?.id) {
			formData.append(
				'userId',
				String(user.isPhysioterapist ? selectedUser?.id : user?.id),
			);
		} else {
			return;
		}
		formData.append('strapiProgramTemplateId', item?.id);
		exercises?.forEach((exercise, index) => {
			Object.keys(exercise).forEach(key => {
				if (exercise[key as keyof typeof exercise]) {
					formData.append(
						`exercises[create][${index}][${key}]`,
						exercise[key as keyof typeof exercise] as string,
					);
				}
			});
		});
		const data = await dispatch(createProgram(formData));
		if (data?.payload?.id) {
			message.destroy();
			message.success(t('patient.dashboard.new.enrolled'));
			fetchHomeData(1);
		} else {
			const errorMessage = data?.payload;
			message.destroy();
			message.error(errorMessage);
		}
	};

	return (
		<div className="existing-patient-carousel-container">
			<Carousel ref={carouselRef} autoplay>
				{suggestedProgramData?.map(item => (
					<div
						key={item.id}
						className="existing-patient-carousel-item"
						onClick={e => {
							e.stopPropagation();
							handleOpenSuggestedProgram(item);
						}}>
						<div className="existing-patient-image-wrapper">
							<div className="existing-patient-image-overlay"></div>
							<img
								src={
									item?.thumbnail?.url ||
									item?.exercises?.[0]?.strapiExerciseId?.exercise_image?.[0]
										?.url
								}
								alt={item?.name}
								className={`existing-patient-image ${item?.thumbnail ? 'existing-patient-object-cover' : 'existing-patient-object-contain'}`}
							/>
						</div>
						<div className="existing-patient-info">
							<Flex gap={16} className="existing-patient-duration">
								<Typography>
									<UntitledIcon name="calendar" size={14} /> {item?.duration}{' '}
									{item?.durationType
										? item.duration > 1
											? item.durationType.charAt(0).toUpperCase() +
												item.durationType.slice(1)
											: item.durationType.charAt(0).toUpperCase() +
												item.durationType.slice(1).replace(/s$/, '')
										: ''}
								</Typography>
							</Flex>
							<div className="existing-patient-title">
								<Paragraph className="existing-patient-program-name">
									{item?.name}
								</Paragraph>
								<Flex gap={16} className="existing-patient-functional-goals">
									{item?.functional_goals?.[0] && (
										<Paragraph className="existing-patient-goal-tag">
											{item.functional_goals[0].name}
										</Paragraph>
									)}
									{item?.functional_goals?.[1] && (
										<Paragraph className="existing-patient-goal-tag">
											{item.functional_goals[1].name}
										</Paragraph>
									)}
									{(item?.functional_goals?.length ?? 0) > 2 && (
										<Popover
											content={
												<div className="existing-patient-popover-content">
													<div className="existing-patient-popover-header">
														<Flex
															align="center"
															gap={8}
															className="existing-patient-popover-title">
															<Target04 />{' '}
															{t('patient.dashboard.new.functionalGoals')}
														</Flex>
													</div>
													<hr className="existing-patient-popover-divider" />
													{item?.functional_goals?.map(goal => (
														<li
															key={goal.name}
															style={{ marginBottom: 4 }}
															className="existing-patient-goal-tag">
															{goal.name}
														</li>
													))}
												</div>
											}
											trigger="hover"
											placement="topLeft">
											<Typography onClick={e => e.stopPropagation()}>
												{t('patient.dashboard.new.showAll')}
											</Typography>
										</Popover>
									)}
								</Flex>
							</div>
							<Popover
								content={item.description}
								trigger="hover"
								placement="topLeft"
								overlayInnerStyle={{
									maxWidth: '50vw',
									whiteSpace: 'normal',
								}}
								overlayStyle={{
									overflowX: 'hidden',
								}}
								autoAdjustOverflow>
								<Paragraph className="existing-patient-description">
									{item?.description}
								</Paragraph>
							</Popover>
							<Button
								onClick={e => {
									e.stopPropagation();
									handleEnroll(item as TSuggestedProgram);
								}}>
								{t('patient.dashboard.new.enroll')}
							</Button>
						</div>
					</div>
				))}
			</Carousel>
			<span
				className="existing-patient-carousel-left-arrow"
				onClick={scrollLeft}
				role="button"
				aria-label={t('common.carousel.previousSlide')}
				tabIndex={0}>
				<UntitledIcon name="leftOutlined" size={16} style={{ color: 'var(--stroke-default-white)' }} />
			</span>
			<span
				className="existing-patient-carousel-right-arrow"
				onClick={scrollRight}
				role="button"
				aria-label={t('common.carousel.nextSlide')}
				tabIndex={0}>
				<UntitledIcon name="rightOutlined" size={16} style={{ color: 'var(--stroke-default-white)' }} />
			</span>
			{suggestedProgramModal && (
				<Modal
					open={suggestedProgramModal}
					onCancel={() => setSuggestedProgramModal(false)}
					footer={null}
					width={MODAL_SIZES.XXLARGE}
					centered
					destroyOnHidden>
					<div style={{ padding: 'var(--spacing-4)' }}>
						<SelectedProgram state={{ state: selectedProgramModalData }} />
					</div>
				</Modal>
			)}
		</div>
	);
};

export default ExistingPatientDashboard;
