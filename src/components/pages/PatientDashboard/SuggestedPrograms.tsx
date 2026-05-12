import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { getMySystemIntakeTemplatesData } from '@stores/clinical/functionalGoals';
import { INTAKE_STEPS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setCurrentStep } from '@stores/shared/onBoard/onBoard';
import { createProgram } from '@stores/shared/patientDetail/program';
import {
	FormDataType,
	ProgramFilterOptions,
	SuggestedProgramItem,
} from '@types';
import {
	Button,
	Card,
	Checkbox,
	Empty,
	Flex,
	Modal,
	Spin,
	Steps,
	Typography,
	message,
} from 'antd';
import { SetStateAction, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GoalSelectionCard from './GoalSelectionCard';
import BodyWithHotspots from './IntakeProgramsBody';
import InitialCard from './IntakeProgramsInitialCard';
import SelectedProgram from './SelectedProgram';
import './style.css';
const { Title } = Typography;

export default function SuggestedPrograms(props: {
	current: number;
	fetchHomeData: (value: number) => void;
	setCurrent: (value: number) => void;
	suggestedProgramData: SuggestedProgramItem[];
	currentPage: number;
	setCurrentPage: (value: (prev: number) => number) => void;
}) {
	const {
		suggestedProgramData,
		currentPage,
		setCurrentPage,
		current,
		setCurrent,
		fetchHomeData,
	} = props;
	const [formData, setFormData] = useState<FormDataType>({
		goalSelection: null,
		experienceLevel: null,
		workoutPreference: null,
		timeAvailability: null,
	});
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const [activeImage, setActiveImage] = useState<number | null>(null);
	const [suggestedProgramModal, setSuggestedProgramModal] = useState(false);
	const [selectedProgramModalData, setSelectedProgramModalData] =
		useState(null);

	const scrollRef = useRef<HTMLDivElement | null>(null);
	const [isLoading, setLoading] = useState(true);
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [suggestedProgram, setSuggestedProgram] = useState<
		SuggestedProgramItem[]
	>([]);
	const [suggestedProgramPageCount, setSuggestedProgramPageCount] = useState(0);
	const [selectedGoal, setSelectedGoal] = useState('Performance Enhancement');
	const scrollLeft = () => {
		if (scrollRef.current) {
			const currentPosition = scrollRef.current?.scrollLeft;
			const targetPosition = currentPosition - 400;
			scrollToPosition(targetPosition, 300);
		}
	};
	const user = useTypedSelector(state => state.user);
	const checkUser = user.isPhysioterapist ? selectedUser : user;
	const showMiniBannerBasedFunctionalGoals =
		checkUser?.functionalGoals?.length > 0;

	const scrollRight = () => {
		if (scrollRef.current) {
			const currentPosition = scrollRef.current?.scrollLeft;
			const targetPosition = currentPosition + 400;
			scrollToPosition(targetPosition, 300);
		}
		if (
			scrollRef.current &&
			scrollRef.current.scrollLeft + scrollRef.current.offsetWidth >=
				scrollRef.current.scrollWidth
		) {
			handleNextPage();
		}
	};

	const handleOpenSuggestedProgram = item => {
		setSelectedProgramModalData({
			selectedProgram: item,
			domain: INTAKE_STEPS.SUGGESTED,
		});
		setSuggestedProgramModal(true);
	};

	const [isSelectAll, setIsSelectAll] = useState(false);

	const handleOpenProgram = (item: SuggestedProgramItem) => {
		setSelectedProgramModalData({
			selectedProgram: item,
			domain: INTAKE_STEPS.STEP_PROGRAM,
		});
	};

	const [filterOptions, setFilterOptions] = useState<ProgramFilterOptions>({
		goalSelection: '',
		bodyRegions: [],
		workoutType: '',
		experienceLevel: '',
		timeAvailability: '',
		bodyRegionIds: [],
		exerciseCategoriesIds: [],
		jointsIds: [],
		functionalGoalsIds: [],
		sideIds: [],
	});

	const handleNextPage = () => {
		setCurrentPage((prev: number) => prev + 1);
	};

	useEffect(() => {
		if (suggestedProgram && suggestedProgram.length > 0) {
			currentPage <= suggestedProgramPageCount && current === 2
				? fetchData()
				: message.warning(t('Admin.data.intakeProcess.reachedEnd'));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]); // current, fetchData, suggestedProgram, suggestedProgramPageCount, t are stable or excluded to prevent loops

	const scrollToPosition = (targetPosition: number, duration: number) => {
		const startTime = performance.now();
		const start = scrollRef.current?.scrollLeft;

		const scroll = (timestamp: number) => {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			if (scrollRef.current) {
				scrollRef.current.scrollLeft =
					(start ?? 0) + (targetPosition - (start ?? 0)) * progress;
			}
			if (progress < 1) {
				requestAnimationFrame(scroll);
			}
		};

		requestAnimationFrame(scroll);
	};

	const handleEnroll = async (item: SuggestedProgramItem) => {
		const exercises: {
			strapiExerciseId: string;
			exerciseLibraryId: string;
			weeklyReps: number;
			dailyReps: number;
			sets: number;
			reps: number;
			order: number;
		}[] = [];
		item?.exercises?.forEach((exercise, index: number) => {
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
		});
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

	const currentStep = useTypedSelector(
		state => state.onBoard.onBoard.currentStep,
	);

	const [selectedItems, setSelectedItems] = useState<SuggestedProgramItem[]>(
		[],
	);

	const handleCheckboxChange = (
		item: SuggestedProgramItem,
		isChecked: boolean,
	) => {
		setIsSelectAll(false);

		setSelectedItems(prev => {
			if (isChecked) {
				if (!prev.includes(item)) {
					return [...prev, item];
				}
				return prev;
			} else {
				return prev.filter(selectedItem => selectedItem !== item);
			}
		});
	};

	const handleSubmitSelected = () => {
		dispatch(setCurrentStep(INTAKE_STEPS.SUGGESTED));
		selectedItems.forEach(item => {
			handleEnroll(item);
		});
		setCurrent(0);
		setSelectedItems([]);
		setIsSelectAll(false);
	};

	const [selectedDropdown, setSelectedDropdown] = useState('');

	const handleGetStep = (step: SetStateAction<string>) => {
		dispatch(setCurrentStep(step));
	};

	const steps = [
		{
			title: t('Admin.data.intakeProcess.welcome'),
			content: <InitialCard />,
		},
		{
			title: t('Admin.data.intakeProcess.region'),
			content: (
				<BodyWithHotspots
					selectedDropdown={selectedDropdown}
					setSelectedDropdown={setSelectedDropdown}
				/>
			),
		},
		{
			title: t('Admin.data.intakeProcess.goals'),
			content: (
				<GoalSelectionCard
					formData={formData}
					setFormData={setFormData}
					selectedGoal={selectedGoal}
					handleGetStep={handleGetStep}
					onGoalChange={setSelectedGoal}
					filterOptions={filterOptions}
					setFilterOptions={setFilterOptions}
				/>
			),
		},
		{
			title: t('Admin.data.intakeProcess.programs'),
			content: (
				<>
					<Flex
						justify="center"
						vertical
						style={{ height: '100%', padding: '80px 20px' }}>
						<Title
							level={2}
							style={{
								marginBottom: 24,
								textAlign: 'center',
							}}>
							{t('Admin.data.intakeProcess.programMatch')}
						</Title>
						{isLoading ? (
							<Spin tip="Loading" size="large" />
						) : suggestedProgram.length > 0 ? (
							<div className="image-navigation-container">
								<div
									className="horizontal-scroll-container relative"
									ref={scrollRef}>
									{suggestedProgram?.map(
										(item: SuggestedProgramItem, index: number) => {
											const selected = selectedItems.filter(
												selected => selected.id === item.id,
											);
											return (
												<div
													key={index}
													className="custom-image-container-form"
													onMouseOver={() => setActiveImage(index)}
													onMouseLeave={() => setActiveImage(null)}
													onClick={() => {
														handleOpenProgram(item);
														setSuggestedProgramModal(true);
													}}>
													<div className="image-wrapper-form">
														{item?.exercises?.[0] ? (
															<>
																<img
																	src={
																		item?.thumbnail
																			? typeof item.thumbnail === 'string'
																				? item.thumbnail
																				: item.thumbnail.url
																			: item?.exercises[0]?.strapiExerciseId
																					?.exercise_image[0]?.url
																	}
																	alt={
																		item?.exercises[0]?.strapiExerciseId?.name
																	}
																	className="program-image-container-custom-class saturate-image"
																/>
																<div
																	className="primary-goal-list"
																	style={{
																		position: 'absolute',
																		right: '4px',
																		top: '2px',
																		zIndex: 1,
																	}}>
																	<Checkbox
																		value={item}
																		checked={selected.length > 0}
																		onClick={e => e.stopPropagation()}
																		onChange={e => {
																			e.stopPropagation();
																			handleCheckboxChange(
																				item,
																				e.target.checked,
																			);
																		}}
																	/>
																</div>
															</>
														) : (
															<video
																preload="metadata"
																src={
																	item?.exercises?.[0]?.exerciseLibrary
																		?.videoUrl
																}
																className="program-image-container-custom-class"
															/>
														)}
														<div className="overlay-content-css">
															<p className="program-text-container-custom-class">
																{item?.name}
															</p>
															{item?.exercises && (
																<>
																	<Flex justify="space-between">
																		<div className="exercise-count">
																			{item?.exercises.length}{' '}
																			{item?.exercises.length === 1
																				? t(
																						'Patient.data.newDashboard.exercise',
																					)
																				: t(
																						'Patient.data.newDashboard.exercises',
																					)}
																		</div>
																		<Flex
																			gap={4}
																			className="exercise-count-duration">
																			<UntitledIcon name="calendar" size={14} />
																			{item?.duration}{' '}
																			{item?.durationType
																				? item?.duration > 1
																					? item.durationType
																							.charAt(0)
																							.toUpperCase() +
																						item.durationType.slice(1)
																					: item.durationType
																							.charAt(0)
																							.toUpperCase() +
																						item.durationType
																							.slice(1)
																							.replace(/s$/, '')
																				: ''}
																		</Flex>
																	</Flex>
																</>
															)}
														</div>
													</div>
												</div>
											);
										},
									)}
								</div>
								<div className="navigation-buttons">
									<span className="nav-button left" onClick={scrollLeft}>
										<UntitledIcon
											name="leftOutlined"
											size={16}
											style={{ color: 'var(--stroke-default-white)' }}
										/>
									</span>
									<span className="nav-button right" onClick={scrollRight}>
										<UntitledIcon
											name="rightOutlined"
											size={16}
											style={{ color: 'var(--stroke-default-white)' }}
										/>
									</span>
								</div>
							</div>
						) : (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								className="suggested-intake"
							/>
						)}
					</Flex>
				</>
			),
		},
	];

	const id = useTypedSelector(state => state.user.id);

	const fetchData = async () => {
		const payload = {
			id: id,
			limit: 10,
			page: currentPage,
			title: '',
			searchValue: '',
			filterOptions: {
				bodyRegionIds: [],
				exerciseCategoriesIds: [],
				sideIds: [],
				bodyRegions: [],
				jointsIds: selectedDropdown,
				workoutType: formData.workoutPreference,
				timeAvailability: formData.timeAvailability,
				experienceLevel: formData.experienceLevel,
				goalSelection: formData.goalSelection,
				functionalGoalsIds: filterOptions?.functionalGoalsIds,
			},
		};
		try {
			currentPage === 1 && setLoading(true);
			const response = await dispatch(
				getMySystemIntakeTemplatesData(payload),
			).unwrap();

			const fetchedData = response.data;
			const paginationData = response.meta.pagination.pageSize;

			if (currentPage === 1) {
				setSuggestedProgram(fetchedData);
				setSuggestedProgramPageCount(paginationData);
			} else {
				setSuggestedProgram([...suggestedProgram, ...fetchedData]);
				setSuggestedProgramPageCount(paginationData);
			}
		} catch (error) {
			// Silently handle program template fetch errors
			// Context: User will see empty state if data unavailable
			console.error('[SuggestedPrograms] Error fetching templates:', error);
		}
		setLoading(false);
	};

	const next = () => {
		current === 2 && fetchData();
		setCurrent(current + 1);
	};

	const prev = () => {
		current === 2 && setCurrentPage(() => 1);
		setCurrent(current - 1);
	};

	useEffect(() => {
		if (suggestedProgram.length > 0) {
			if (selectedItems.length === suggestedProgram.length) {
				setIsSelectAll(true);
			} else setIsSelectAll(false);
		}
	}, [suggestedProgram, selectedItems]);

	useEffect(() => {
		if (current === 0) {
			setSelectedDropdown('');
			setFilterOptions({
				goalSelection: '',
				bodyRegions: [],
				workoutType: '',
				experienceLevel: '',
				timeAvailability: '',
				bodyRegionIds: [] as number[],
				exerciseCategoriesIds: [] as number[],
				jointsIds: [] as number[],
				functionalGoalsIds: [] as number[],
				sideIds: [] as number[],
			});
			setFormData({
				goalSelection: null,
				experienceLevel: null,
				workoutPreference: null,
				timeAvailability: null,
			});
			setSuggestedProgram([]);
		}
	}, [current]);

	// if (currentStep === '') {
	//   return <DashboardSkeleton />;
	// }

	const handleSelectAll = () => {
		const selectedData: SuggestedProgramItem[] = [];
		suggestedProgram.forEach(item => {
			if (!isSelectAll) {
				selectedData.push(item);
			}
		});
		setSelectedItems(selectedData);
		setIsSelectAll(!isSelectAll);
	};

	return (
		<>
			<div className="true-to-form-container">
				<Card
					className={`${current === 0 ? 'intake-programs' : 'goal-selection-card'}`}>
					<Steps
						style={{
							position: 'absolute',
							top: '20px',
							left: '20px',
							width: '97%',
							padding: 'var(--spacing-2-5)',
							borderRadius: 'var(--radius-xl)',
						}}
						current={current}
						items={steps}
					/>
					<div className="h-full">{steps[current].content}</div>
					{/* <div
						style={{
							marginTop: 24,
							position: 'absolute',
							bottom: '15px',
							left: '25px',
						}}>
						<Button
							className="skip"
							onClick={() => {
								dispatch(setCurrentStep(INTAKE_STEPS.SUGGESTED));
								setCurrent(0);
							}}>
							{t('Admin.data.intakeProcess.skip')}
						</Button>
					</div> */}
					<div
						style={{
							position: 'absolute',
							bottom: '36px',
							right: '36px',
						}}>
						{current > 0 && (
							<Button style={{ margin: '0 8px' }} onClick={prev}>
								{t('Admin.data.intakeProcess.previous')}
							</Button>
						)}
						{current < steps.length - 1 && (
							<Button onClick={next}>{t('Patient.data.vitalscan-rom.next')}</Button>
						)}
						{current === steps.length - 1 && (
							<>
								<Button
									onClick={() => handleSelectAll()}
									style={{ margin: '0 10px' }}>
									{!isSelectAll
										? `${t('Admin.data.intakeProcess.selectAll')}`
										: `${t('Admin.data.intakeProcess.deselectAll')}`}
								</Button>
								<Button
									disabled={selectedItems.length === 0}
									onClick={() => handleSubmitSelected()}>
									{t('Admin.data.intakeProcess.enroll')}
								</Button>
							</>
						)}
					</div>
				</Card>
				<div id="suggested-programs" style={{ marginTop: 'var(--spacing-6)' }}>
					<Typography className="my-suggested-program-container">
						<span style={{ color: 'var(--text-color-root)' }}>
							{t('patient.dashboard.new.suggestedPrograms')}
						</span>
						<span className="suggested-programs-tips">
							{t('patient.dashboard.new.suggestedProgramsTips')}
						</span>
					</Typography>
					<div className="image-navigation-container">
						<div
							className="horizontal-scroll-container relative"
							ref={scrollRef}>
							{suggestedProgramData?.map(
								(item: SuggestedProgramItem, index: number) => {
									return (
										<div
											key={index}
											className={`custom-image-container-form ${activeImage === index ? 'active-image' : ''}`}
											onMouseOver={() => setActiveImage(index)}
											onMouseLeave={() => setActiveImage(null)}
											onClick={e => {
												e.stopPropagation();
												handleOpenSuggestedProgram(item);
											}}>
											<div className="image-wrapper-form">
												{item?.exercises && item.exercises[0] ? (
													<img
														src={
															item?.thumbnail
																? typeof item.thumbnail === 'string'
																	? item.thumbnail
																	: item.thumbnail.url
																: item?.exercises?.[0]?.strapiExerciseId
																		?.exercise_image?.[0]?.url
														}
														alt={item?.exercises[0]?.strapiExerciseId?.name}
														className="program-image-container-custom-class saturate-image"
													/>
												) : (
													<video
														preload="metadata"
														src={
															// TODO: Consider using exercises ?? defaultValue or exercises?.property instead of exercises!
															item?.exercises?.[0]?.exerciseLibrary?.videoUrl
														}
														className="program-image-container-custom-class"
													/>
												)}
												<div className="overlay-content-css">
													<p
														className={`program-text-container-custom-class ${activeImage === index ? 'mb-2' : ''}`}>
														{item?.name}
													</p>
													<Button
														onClick={e => {
															e.stopPropagation();
															handleEnroll(item);
														}}>
														{t('patient.dashboard.new.enroll')}
													</Button>

													<div className="hover-details">
														{item?.exercises && (
															<>
																<div className="exercise-count">
																	{item?.exercises.length}{' '}
																	{item?.exercises.length === 1
																		? t('Patient.data.newDashboard.exercise')
																		: t('Patient.data.newDashboard.exercises')}
																</div>
																<div className="exercise-count-duration">
																	<UntitledIcon name="calendar" size={14} />{' '}
																	{item?.duration}{' '}
																	{item?.durationType
																		? item?.duration > 1
																			? item.durationType
																					.charAt(0)
																					.toUpperCase() +
																				item.durationType.slice(1)
																			: item.durationType
																					.charAt(0)
																					.toUpperCase() +
																				item.durationType
																					.slice(1)
																					.replace(/s$/, '')
																		: ''}
																</div>
															</>
														)}
													</div>
												</div>
											</div>
										</div>
									);
								},
							)}
						</div>
						<div className="navigation-buttons">
							<span
								className="nav-button left"
								onClick={scrollLeft}
								role="button"
								aria-label={t('common.carousel.previousSlide')}
								tabIndex={0}>
								<UntitledIcon
									name="leftOutlined"
									size={16}
									style={{ color: 'var(--stroke-default-white)' }}
								/>
							</span>
							<span
								className="nav-button right"
								onClick={scrollRight}
								role="button"
								aria-label={t('common.carousel.nextSlide')}
								tabIndex={0}>
								<UntitledIcon
									name="rightOutlined"
									size={16}
									style={{ color: 'var(--stroke-default-white)' }}
								/>
							</span>
						</div>
					</div>
				</div>
			</div>
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
		</>
	);
}
