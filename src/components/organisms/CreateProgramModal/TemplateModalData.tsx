import { showCustomModal } from '@atoms/CustomModalInfo';
import { UntitledIcon } from '@atoms/Icon';
import { CardGridSkeleton } from '@atoms/Skeletons';
import { SearchLg } from '@vitalflow-icons/general/searchLg';
import {
	getMySystemTemplatesData,
	setPopoverState,
} from '@stores/clinical/functionalGoals';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getProgramTemplate } from '@stores/shared/patientDetail/program';
import {
	IProgramData,
	IProgramTemplate,
	ProgramFilterOptions,
	ProgramTemplateResponse,
} from '@types';
import {
	Collapse,
	Empty,
	Flex,
	Input,
	Pagination,
	Tabs,
	Typography,
} from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExerciseFilters } from './ExerciseFilters';

const { Paragraph } = Typography;

interface ExerciseProps {
	searchValue?: string;
	setSearchValue: (value: string) => void;
	extraContent: (data: IProgramData) => ReactNode;
	program: ProgramTemplateResponse;
	fetchData: (pageNumber: number) => void;
	open: boolean;
	setOpen: (value: boolean) => void;
	activeSubKey: string;
	setActiveSubKey: (value: string) => void;
}

export const TemplateModalData = (props: ExerciseProps) => {
	const {
		searchValue,
		extraContent,
		setSearchValue,
		open,
		setOpen,
		activeSubKey,
		setActiveSubKey,
	} = props;
	const [filterExercise, setFilterExercise] = useState('System Templates');
	const { t } = useTranslation();
	const [filterOptions, setFilterOptions] = useState<ProgramFilterOptions>({
		bodyRegionIds: [],
		exerciseCategoriesIds: [],
		jointsIds: [],
		functionalGoalsIds: [],
	});

	const onPageChange = (pageNumber: number) => {
		setSuggestedProgramData([]);
		handleApply(pageNumber);
	};

	const [isLoading, setIsLoading] = useState(false);
	const id = useTypedSelector(state => state.user.id);
	const [suggestedProgramData, setSuggestedProgramData] = useState([]);
	const dispatch = useTypedDispatch();
	const popoverState = useTypedSelector(
		state => state.functionalGoals.popoverState,
	);

	useEffect(() => {
		setSearchValue('');
		handleApply(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- handleApply dependencies are managed internally
	}, [activeSubKey]);
	const handleApply = async (pageNumber: number) => {
		setIsLoading(true);
		dispatch(setPopoverState(false));
		const payload = {
			id: id,
			limit: 10,
			page: pageNumber ? pageNumber : 1,
			title: searchValue ? searchValue : '',
			searchValue: searchValue ? searchValue : '',
			filterOptions: filterOptions,
		};
		if (activeSubKey === '2') {
			try {
				const data = await dispatch(getProgramTemplate(payload))?.unwrap();
				setSuggestedProgramData(data);
			} catch {
				setSuggestedProgramData([]);
			}
		} else {
			try {
				const data = await dispatch(getMySystemTemplatesData(payload));
				setSuggestedProgramData(data.payload);
			} catch {
				setSuggestedProgramData([]);
			}
		}
		setIsLoading(false);
	};

	const handleKeyDown = (e: { key: string }) => {
		if (e.key === 'Enter') {
			handleApply(1);
		}
	};
	function renderData() {
		return (
			<div className={`${popoverState ? 'min-h-[650px]' : ''}`}>
				<Flex
					justify="space-between"
					align="center"
					gap={16}
					className="pl-4 pr-4">
					{activeSubKey != '2' && (
						<ExerciseFilters
							open={open}
							setOpen={setOpen}
							setFilterOptions={setFilterOptions}
							handleApply={handleApply}
							filterExercise={filterExercise}
							setFilterExercise={setFilterExercise}
							activeSubKey={'2'}
							filterOptions={filterOptions}
						/>
					)}
					<Input
						className="w-full my-3 h-10"
						placeholder={t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.search',
						)}
						value={searchValue}
						onKeyDown={handleKeyDown}
						onChange={e => setSearchValue(e.target.value)}
						suffix={
							<SearchLg height={15} width={15} color="stroke-neutral-950" />
						}
					/>
				</Flex>
				<div
					style={{ maxHeight: popoverState ? '100%' : '42vh', overflowX: 'hidden', overflowY: 'auto' }}>
					{isLoading ? (
						<CardGridSkeleton count={4} columns={1} />
					) : (
						<>
							{!suggestedProgramData?.data ||
							suggestedProgramData?.data?.length === 0 ? (
								<Empty
									className="bg-gray-50 p-10 m-0"
									image={Empty.PRESENTED_IMAGE_SIMPLE}
									description={
										<span className="text-gray-300">
											{t(
												'Admin.data.menu.patientDetail.aiAssistantPrograms.noProgram',
											)}
										</span>
									}
								/>
							) : (
								<Flex vertical gap={8}>
									<Collapse
										style={{
											overflowX: 'hidden',
											overflowY: 'auto',
											padding: 'var(--spacing-4)',
											borderRadius: 'var(--radius-md)',
										}}
										className="select-none collapse-panel-container"
										bordered={false}>
										{suggestedProgramData?.data?.map(
											(data: IProgramTemplate) => {
												const sortedExercises = [
													...(data?.exercises || []),
												].sort((a, b) => a.order - b.order);
												return (
													<Collapse.Panel
														className="program-collapse-panel collapse-panel-container"
														style={{ borderBottom: '0px' }}
														key={''}
														header={
															<Typography.Text
																style={{
																	fontSize: 'var(--font-size-sm)',
																	fontWeight: 'var(--font-weight-semibold)',
																	color: 'var(--text-secondary)',
																}}>
																{data?.name}
															</Typography.Text>
														}
														extra={extraContent(data)}>
														{sortedExercises?.map(item => {
															return (
																<div className="px-4 py-2">
																	<Flex
																		className="cursor-pointer p-4 rounded-lg border-2 border-inherit w-full"
																		gap={16}
																		key={item?.name}>
																		<div
																			onClick={e => {
																				e.stopPropagation();
																				showCustomModal({
																					video: item?.video
																						? item?.video
																						: item?.exerciseLibrary?.videoUrl ||
																							item?.strapiExerciseId
																								?.exercise_video[0]?.url,
																					name: item?.name
																						? item?.name
																						: item?.exerciseLibrary?.title ||
																							item?.strapiExerciseId?.name,
																					description: item?.description
																						? item?.description
																						: item?.exerciseLibrary
																								?.description ||
																							item?.strapiExerciseId
																								?.description,
																				});
																			}}
																			className={`custom-image-container`}>
																			<div className="w-40 flex-shrink-0 image-wrapper">
																				{item?.strapiExerciseId ||
																				item?.image ? (
																					<img
																						src={
																							(item?.strapiExerciseId
																								?.exercise_image &&
																								item?.strapiExerciseId
																									?.exercise_image[0]?.url) ||
																							item?.image
																						}
																						alt=""
																						className="rounded-lg w-full h-full"
																					/>
																				) : (
																					<video
																						src={
																							item?.exerciseLibrary?.videoUrl
																						}
																						className="rounded-lg w-full h-full"
																					/>
																				)}
																				<div className="play-button">
																					<UntitledIcon
																						name="playCircle"
																						size={50}
																					/>
																				</div>
																			</div>
																		</div>
																		<div className="flex-1 rounded-lg p-2">
																			<Paragraph className="font-semibold text-lg">
																				{item?.name
																					? item?.name
																					: item?.exerciseLibrary?.title ||
																						item?.strapiExerciseId?.name}
																			</Paragraph>
																			{item?.name ? (
																				<Paragraph className="text-gray-400 font-semibold text-xs">
																					{t(
																						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.weekly',
																					)}{' '}
																					{item?.weeklyReps}X{' '}
																					{t(
																						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.daily',
																					)}{' '}
																					{item?.dailyReps}X{' '}
																					{t(
																						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.sets',
																					)}{' '}
																					{item?.sets}X{' '}
																					{t(
																						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.reps',
																					)}{' '}
																					{item?.reps}X
																				</Paragraph>
																			) : (
																				<Paragraph className="text-gray-400 font-semibold text-xs">
																					{t(
																						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.weekly',
																					)}{' '}
																					{item?.exerciseLibrary?.weeklyReps ||
																						item?.weeklyReps}
																					X{' '}
																					{t(
																						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.daily',
																					)}{' '}
																					{item?.exerciseLibrary?.dailyReps ||
																						item?.dailyReps}
																					X{' '}
																					{t(
																						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.sets',
																					)}{' '}
																					{item?.exerciseLibrary?.sets ||
																						item?.sets}
																					X{' '}
																					{t(
																						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.reps',
																					)}{' '}
																					{item?.exerciseLibrary?.reps ||
																						item?.reps}
																					X
																				</Paragraph>
																			)}
																			<Paragraph className="text-gray-600 mt-2">
																				{item?.description
																					? item?.description
																					: item?.exerciseLibrary
																							?.description ||
																						item?.strapiExerciseId?.description}
																			</Paragraph>
																		</div>
																	</Flex>
																</div>
															);
														})}
													</Collapse.Panel>
												);
											},
										)}
									</Collapse>
								</Flex>
							)}
						</>
					)}
				</div>
				<div>
					{!isLoading && suggestedProgramData?.data?.length > 0 && (
						<Flex justify="center" style={{ marginTop: 'var(--spacing-4)' }}>
							<Pagination
								current={
									suggestedProgramData?.pagination?.currentPage ||
									suggestedProgramData?.meta?.pagination?.page
								}
								showSizeChanger={false}
								onChange={onPageChange}
								total={
									suggestedProgramData?.pagination?.totalCount ||
									suggestedProgramData?.meta?.pagination?.total
								}
							/>
						</Flex>
					)}
				</div>
			</div>
		);
	}

	return (
		<Tabs
			type="card"
			defaultActiveKey={activeSubKey}
			activeKey={activeSubKey}
			className="modal-exercise-data select-none p-4"
			style={{ backgroundColor: 'var(--card-bg-color)' }}
			tabBarStyle={{ margin: 0 }}
			onChange={(activeSubKey: string) => {
				setActiveSubKey(activeSubKey);
			}}
			items={[
				{
					label: t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.systemTemplates',
					),
					key: '1',
					children: <>{renderData()}</>,
				},
				{
					label: t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.myTemplates',
					),
					key: '2',
					children: <>{renderData()}</>,
				},
			]}
		/>
	);
};
