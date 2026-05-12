import { showCustomModal } from '@atoms/CustomModalInfo';
import { UntitledIcon } from '@atoms/Icon';
import { CardGridSkeleton } from '@atoms/Skeletons';
import {
	setOmniromRecord,
	setOmniromUpload,
} from '@stores/clinical/rehab/main';
import { myLibraryInfoAction } from '@stores/content/library';
import { getMyLibraryData } from '@stores/content/myLibrary/myLibrary';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { ExerciseProps, ProgramFilterOptions } from '@types';
import {
	Button,
	Col,
	Empty,
	Flex,
	Input,
	Pagination,
	Row,
	Tabs,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

import { router } from '@routers/routers';
import {
	getMySystemLibraryData,
	setPopoverState,
} from '@stores/clinical/functionalGoals';
import { setProgramModalSubKey } from '@stores/shared/patientDetail/patientDetail';
import { useNavigate } from 'react-router-dom';
import { ExerciseFilters } from './ExerciseFilters';

interface Region {
	[key: string]: string;
}
interface Exercise {
	id: number;
	vitalflowId: number;
	alignment_tips: string;
	body_regions: Region[];
	breathing: string;
	contraindications: string;
	createdAt: string;
	description: string;
	documentId: string;
	equipment_alternatives: string;
	exercise_categories: Category[];
	exercise_image: Media[];
	exercise_video: Media[];
	frequency: string;
	function: string | null;
	functional_applications: string;
	functional_goals: FunctionalGoal[];
	instructions: string;
	is_bilateral: boolean;
	joints: Joint[];
	locale: string;
	name: string;
	orientation: string;
	precautions: string;
	publishedAt: string;
	recommended_duration: string | null;
	supportive_surfaces: string;
	therapist_notes: string;
	updatedAt: string;
	title: string;
	videoUrl?: string;
	data?: Region[];
	weeklyReps?: number;
	dailyReps?: number;
	sets?: number;
	reps?: number;
	exerciseLibraryId?: number;
}
interface Category {
	id: number;
	name: string;
}

interface Media {
	id: number;
	url: string;
	mime?: string;
}

interface FunctionalGoal {
	id: number;
	name?: string;
}

interface Joint {
	id: number;
	name?: string;
}

export const MyExrciseModalData = (props: ExerciseProps) => {
	const { selectedExercises, setSelectedExercises, open, setOpen } = props;
	const { t } = useTranslation();
	const [searchValue, setSearchValue] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [libraryData, setLibraryData] = useState<Exercise[]>([]);
	const id = useTypedSelector(state => state.user.id);
	const [perpage, setPerPage] = useState(10);
	const [isGrid, setGrid] = useState(false);
	const [filterExercise, setFilterExercise] = useState('System Exercises');
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
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const selectedSideName = useTypedSelector(
		state => state.functionalGoals.selectedSideName,
	);
	const programModalSubKey = useTypedSelector(
		state => state.patientDetail.patientDetail.programModalSubKey,
	);

	const popoverState = useTypedSelector(
		state => state.functionalGoals.popoverState,
	);
	const onPageChange = (pageNumber: number, pageSize: number) => {
		setLibraryData([]);
		setPerPage(pageSize);
		handleApply(pageNumber);
	};

	const handleApply = async (pageNumber: number, search?: string) => {
		setIsLoading(true);
		dispatch(setPopoverState(false));

		const payload = {
			id: id,
			limit: 10,
			page: pageNumber || 1,
			title:
				search ?? searchValue
					? search ?? searchValue
					: programModalSubKey === '2'
						? ''
						: selectedSideName,
			filterOptions: filterOptions,
		};

		if (programModalSubKey === '2') {
			const action = await dispatch(getMyLibraryData(payload));
			const data = action.payload as Exercise[];
			dispatch(myLibraryInfoAction.myLibraryInfo(data));
			setLibraryData(data);
		} else {
			const action = await dispatch(getMySystemLibraryData(payload));
			const data = action.payload as Exercise[];
			setLibraryData(data);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		setSearchValue('');
		handleApply(1, '');
		// eslint-disable-next-line react-hooks/exhaustive-deps -- handleApply dependencies are managed internally
	}, [programModalSubKey]);

	const handleDivClick = (item: Exercise) => {
		if (programModalSubKey === '2') {
			if (
				selectedExercises?.find(
					exercise => exercise?.exerciseLibraryId === item?.id,
				)
			) {
				setSelectedExercises(
					selectedExercises?.filter(
						exercise => exercise?.exerciseLibraryId !== item?.id,
					),
				);
			} else {
				const exercise = {
					id: item?.id,
					exerciseLibraryId: item?.id,
					name: item?.title || item?.name,
					weeklyReps: item?.weeklyReps || 7,
					dailyReps: item?.dailyReps || 1,
					sets: item?.sets || 1,
					reps: item?.reps || 10,
					video: item?.videoUrl,
				};
				setSelectedExercises([...selectedExercises, exercise]);
			}
		} else {
			if (
				selectedExercises?.find(
					exercise => exercise?.strapiExerciseId === item?.vitalflowId,
				)
			) {
				setSelectedExercises(
					selectedExercises?.filter(
						exercise => exercise?.strapiExerciseId !== item?.vitalflowId,
					),
				);
			} else {
				const exercise = {
					id: item?.vitalflowId,
					strapiExerciseId: item?.vitalflowId,
					name: item?.title || item?.name,
					weeklyReps: item?.weeklyReps || 7,
					dailyReps: item?.dailyReps || 1,
					sets: item?.sets || 1,
					reps: item?.reps || 10,
					description: item?.description,
					image: item?.exercise_image[0]?.url,
					video: item?.exercise_video[0]?.url,
				};
				setSelectedExercises([...selectedExercises, exercise]);
			}
		}
	};
	const addExercise = () => {
		dispatch(setOmniromRecord(false));
		dispatch(setOmniromUpload(false));
		navigate(router.PROGRAMADDEXERCISES);
	};

	const handleKeyDown = (e: { key: string }) => {
		if (e.key === 'Enter') {
			handleApply(1);
		}
	};

	function renderData() {
		return (
			<div
				className={`exercise-library-container ${popoverState ? 'min-height-expanded' : ''}`}>
				<Flex
					justify="flex-start"
					align="center"
					gap={12}
					wrap="wrap"
					style={{
						paddingLeft: 'var(--spacing-4)',
						paddingRight: 'var(--spacing-4)',
					}}>
					{programModalSubKey != '2' && (
						<ExerciseFilters
							open={open}
							setOpen={setOpen}
							filterOptions={filterOptions}
							setFilterOptions={setFilterOptions}
							handleApply={handleApply}
							filterExercise={filterExercise}
							setFilterExercise={setFilterExercise}
							activeKey={'1'}
						/>
					)}
					<Input
						className="exercise-search-input"
						size="large"
						placeholder={t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.search',
						)}
						value={searchValue}
						onKeyDown={handleKeyDown}
						onChange={e => setSearchValue(e.target.value)}
						suffix={<UntitledIcon name="search" />}
					/>
					{programModalSubKey != '1' && (
						<Button onClick={addExercise} size="large">
							{t(
								'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.recordExercise',
							)}
						</Button>
					)}
					<Flex
						gap={8}
						align="center"
						justify="flex-end"
						style={{ marginLeft: 'auto' }}>
						{selectedExercises.length != 0 && (
							<div className="selected-count-badge">
								<Typography.Text
									style={{
										color: 'var(--text-on-brand)',
										fontSize: 'var(--font-size-sm)',
										fontWeight: 'var(--font-weight-semibold)',
									}}>
									{selectedExercises.length}
								</Typography.Text>
							</div>
						)}
						<Flex justify="flex-end">
							<div
								onClick={() => setGrid(false)}
								className={`view-toggle-button view-toggle-left ${!isGrid ? 'view-toggle-active' : ''}`}>
								<UntitledIcon
									name="list"
									size={24}
									color={
										isGrid ? 'var(--text-tertiary)' : 'var(--text-primary)'
									}
								/>
							</div>
							<div
								onClick={() => setGrid(true)}
								className={`view-toggle-button view-toggle-right ${isGrid ? 'view-toggle-active' : ''}`}>
								<UntitledIcon
									name="dashboard"
									size={20}
									color={
										isGrid ? 'var(--text-primary)' : 'var(--text-tertiary)'
									}
								/>
							</div>
						</Flex>
					</Flex>
				</Flex>
				<div
					style={{
						maxHeight: popoverState ? '70vh' : '42vh',
						overflowX: 'hidden',
						overflowY: 'auto',
					}}>
					{isLoading ? (
						<CardGridSkeleton count={4} columns={2} />
					) : libraryData && libraryData.data && libraryData.data.length > 0 ? (
						!isGrid ? (
							libraryData?.data?.map((item: Exercise) => {
								const isSelected =
									programModalSubKey === '2'
										? selectedExercises?.find(
												exercise => exercise?.exerciseLibraryId === item?.id,
											)
										: selectedExercises?.find(
												exercise =>
													exercise?.strapiExerciseId === item?.vitalflowId,
											);
								return (
									<div style={{ marginBottom: 'var(--spacing-4)' }}>
										<Flex
											gap={16}
											className={`exercise-card ${isSelected ? 'exercise-card-selected' : ''}`}
											onClick={() => handleDivClick(item)}
											key={item.id}>
											<div
												onClick={e => {
													e.stopPropagation();
													showCustomModal({
														video:
															item?.videoUrl || item?.exercise_video[0]?.url,
														name: item?.title || item?.name,
														description: item?.description,
													});
												}}
												className={`custom-image-container`}>
												<div className="w-40 flex-shrink-0 image-wrapper">
													{item?.videoUrl ? (
														<video
															src={item?.videoUrl}
															controls={false}
															className="rounded-lg w-full h-full"
														/>
													) : (
														<img
															src={item?.exercise_image && item?.exercise_image[0]?.url}
															className="rounded-lg w-[150px] h-full"
														/>
													)}
													<div className="play-button">
														<UntitledIcon name="playCircle" size={50} />
													</div>
												</div>
											</div>
											<div className="exercise-details">
												<Typography.Text className="exercise-title">
													{item?.title || item?.name}
												</Typography.Text>
												<Typography.Text className="exercise-reps">
													{t(
														'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.weekly',
													)}{' '}
													{item?.weeklyReps || 7}X{' '}
													{t(
														'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.daily',
													)}{' '}
													{item?.dailyReps || 1}X{' '}
													{t(
														'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.sets',
													)}{' '}
													{item?.sets || 1}X{' '}
													{t(
														'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.reps',
													)}{' '}
													{item?.reps || 10}X
												</Typography.Text>
												<Typography.Text className="exercise-description">
													{item?.description}
												</Typography.Text>
											</div>
										</Flex>
									</div>
								);
							})
						) : (
							<Row gutter={[16, 16]}>
								{libraryData?.data?.map((item: Exercise) => {
									const isSelected =
										programModalSubKey === '2'
											? selectedExercises?.find(
													exercise => exercise?.exerciseLibraryId === item?.id,
												)
											: selectedExercises?.find(
													exercise =>
														exercise?.strapiExerciseId === item?.vitalflowId,
												);
									return (
										<Col xs={12} sm={12} md={12} lg={12} xl={12} key={item.id}>
											<Flex
												gap={12}
												align="center"
												className={`exercise-card-grid ${isSelected ? 'exercise-card-selected' : ''}`}
												onClick={() => handleDivClick(item)}>
												<div
													onClick={e => {
														e.stopPropagation();
														showCustomModal({
															video:
																item?.videoUrl ||
																item?.exercise_video?.[0]?.url,
															name: item?.title || item?.name,
															description: item?.description,
														});
													}}
													className="exercise-thumbnail-grid">
													<Flex
														align="center"
														justify="center"
														className="image-wrapper"
														style={{
															width: 'var(--spacing-14)',
															flexShrink: 0,
														}}>
														{item?.videoUrl ? (
															<video
																src={item?.videoUrl}
																controls={false}
																style={{
																	borderRadius: 'var(--radius-lg)',
																	width: '100%',
																	height: '100%',
																}}
															/>
														) : (
															<img
																src={item?.exercise_image[0]?.url}
																style={{
																	borderRadius: 'var(--radius-lg)',
																	width: '100%',
																	height: '100%',
																}}
															/>
														)}
														<div className="play-button">
															<UntitledIcon name="playCircle" size={50} />
														</div>
													</Flex>
												</div>
												<div className="exercise-details-grid">
													<Typography.Text className="exercise-title-grid">
														{item?.title || item?.name}
													</Typography.Text>
													<Flex
														justify="flex-start"
														gap={8}
														wrap="wrap"
														className="exercise-reps-grid">
														<Typography.Text>
															{t(
																'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.weekly',
															)}{' '}
															{item?.weeklyReps || 7}X
														</Typography.Text>
														<Typography.Text>
															{t(
																'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.daily',
															)}{' '}
															{item?.dailyReps || 1}X
														</Typography.Text>
														<Typography.Text>
															{t(
																'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.sets',
															)}{' '}
															{item?.sets || 1}X
														</Typography.Text>
														<Typography.Text>
															{t(
																'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.reps',
															)}{' '}
															{item?.reps || 10}X
														</Typography.Text>
													</Flex>
												</div>
											</Flex>
										</Col>
									);
								})}
							</Row>
						)
					) : (
						<Empty
							description={t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.noExercisesFound',
							)}
							image={Empty.PRESENTED_IMAGE_SIMPLE}
						/>
					)}
				</div>
				{!isLoading &&
					libraryData &&
					libraryData.data &&
					libraryData.data.length > 0 && (
						<Flex justify="center" style={{ marginTop: 'var(--spacing-4)' }}>
							<Pagination
								current={
									libraryData?.pagination?.currentPage ||
									libraryData?.meta?.pagination?.page
								}
								onChange={onPageChange}
								total={
									libraryData?.pagination?.totalCount ||
									libraryData?.meta?.pagination?.total
								}
								showSizeChanger={false}
								pageSize={perpage}
							/>
						</Flex>
					)}
			</div>
		);
	}

	return (
		<Tabs
			type="card"
			activeKey={programModalSubKey}
			className="modal-exercise-data select-none p-4"
			style={{ backgroundColor: 'var(--card-bg-color)' }}
			tabBarStyle={{ margin: 0 }}
			onChange={(activeKey: string) => {
				dispatch(setProgramModalSubKey(activeKey));
			}}
			items={[
				{
					label: t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.vitalflowLibrary',
					),
					key: '1',
					children: <>{renderData()}</>,
				},
				{
					label: t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.myLibrary',
					),
					key: '2',
					children: <>{renderData()}</>,
				},
			]}
		/>
	);
};
