import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { useTheme } from '@providers/ThemeProvider';
import {
	getBodyRegions,
	getCategories,
	getFunctionalGoals,
	getJointWithBodyRegion,
	getJoints,
	setPopoverState,
} from '@stores/clinical/functionalGoals';
import { USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getSuggestedProgram,
	setModalVisible,
} from '@stores/shared/onBoard/onBoard';
import {
	getOpenAiProgram,
	getPreviousCarespaceAiProgram,
	getPreviousOpenAiProgram,
	resetCarespaceAiProgram,
	resetOpenAiProgram,
} from '@stores/shared/patientDetail/program';
import { useGetSettingsQuery } from '@stores/shared/settings/settingsApi';
import {
	CreateProgramModalProps,
	IProgramData,
	IProgramExercise,
	IProgramTemplate,
} from '@types';
import { Button, Flex, Modal, Tabs, Typography } from 'antd';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddProgramPopup } from './AddProgramPopup';
import { AiModalData } from './AiModalData';
import loadingAi from './LoadingAi.json';
import { MyExrciseModalData } from './MyExerciseModalData';
import { TemplateModalData } from './TemplateModalData';
import './style.css';

const { Paragraph } = Typography;

export const CreateProgramModal = (props: CreateProgramModalProps) => {
	const {
		isVisible,
		onCancel,
		setRefresh,
		fetchData,
		refresh,
		searchValue,
		setSearchValue,
	} = props;

	const { t } = useTranslation();
	const { theme } = useTheme();
	const loadRef = useRef<LottieRefCurrentProps>(null);
	const [loadingMessage, setLoadingMessage] = useState('');
	const [activeKey, setActiveKey] = useState<string>('1');
	const [openFilter, setOpenFilter] = useState(false);
	const [selectedExercises, setSelectedExercises] = useState<
		IProgramExercise[]
	>([]);
	const [selectedProgram, setSelectedProgram] =
		useState<IProgramTemplate | null>();
	const [_suggestedProgramData, setSuggestedProgramData] = useState([]);
	const isModalVisible = useTypedSelector(
		state => state.onBoard.onBoard.isModalVisible,
	);
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const [previousExercises] = useState<IProgramExercise[]>([]);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const programTemplate = useTypedSelector(
		state => state.patientDetail.program.programTemplate,
	);
	const { openAiProgram, vitalflowAiProgram } = useTypedSelector(state => ({
		openAiProgram: state.patientDetail.program.openAiProgram,
		vitalflowAiProgram: state.patientDetail.program.vitalflowAiProgram,
	}));
	const { data: settingsData } = useGetSettingsQuery();
	const openaiApiKey =
		(settingsData as { openaiApiKey?: string })?.openaiApiKey || '';
	const [activeSubKey, setActiveSubKey] = useState('1');
	const [programId, setProgramId] = useState('null');
	const [strapiId, setStrapiId] = useState<number>(0);

	useEffect(() => {
		// Move function inside to avoid dependency issues
		const fetchingDataforFilters = async () => {
			await dispatch(getJoints());
			await dispatch(getCategories());
			await dispatch(getBodyRegions());
			await dispatch(getJointWithBodyRegion());
			await dispatch(getFunctionalGoals());
		};

		user?.profile?.role != USER_ROLES.USER && fetchingDataforFilters();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user?.profile?.role]); // dispatch is stable from Redux

	useEffect(() => {
		setOpenFilter(false);
	}, [isVisible, activeKey, onCancel]);

	useEffect(() => {
		dispatch(resetOpenAiProgram());
		getTemplate(1);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- getTemplate is stable and dispatch is stable
	}, [user, selectedUser]);

	useEffect(() => {
		activeKey == '3' && setActiveKey('1');
		// eslint-disable-next-line react-hooks/exhaustive-deps -- activeKey is intentionally excluded to avoid loops
	}, [isVisible]);

	const loadMessages = () => {
		setLoadingMessage(
			t(
				'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.fetchData',
			),
		);
		setTimeout(
			() =>
				setLoadingMessage(
					t(
						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.collectingResults',
					),
				),
			3500,
		);
		setTimeout(
			() =>
				setLoadingMessage(
					t(
						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.gatherData',
					),
				),
			6000,
		);
		setTimeout(
			() =>
				setLoadingMessage(
					t(
						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.reviewGoals',
					),
				),
			9000,
		);
		setTimeout(
			() =>
				setLoadingMessage(
					t(
						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.evaluatePain',
					),
				),
			11500,
		);
		setTimeout(
			() =>
				setLoadingMessage(
					t(
						'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.determineExercises',
					),
				),
			13000,
		);
	};

	const getTemplate = async (current: number) => {
		try {
			const data = await dispatch(getSuggestedProgram(current));
			setSuggestedProgramData(data.payload);
		} catch {
			setSuggestedProgramData([]);
		}
	};

	const fetchPreviousOpenAiProgram = async () => {
		loadRef.current?.setSpeed(0.5);
		loadMessages();
		dispatch(getPreviousOpenAiProgram(selectedUser?.id));
	};

	const fetchPreviousCarespaceAiProgram = async () => {
		loadRef.current?.setSpeed(0.5);
		loadMessages();
		dispatch(resetCarespaceAiProgram());
		dispatch(getPreviousCarespaceAiProgram(selectedUser?.id));
	};

	const fetchOpenAiProgram = async () => {
		loadRef.current?.setSpeed(0.5);
		loadMessages();
		dispatch(resetOpenAiProgram());
		await dispatch(getOpenAiProgram(selectedUser?.id));
	};

	const fetchCarespaceAiProgram = async () => {
		loadRef.current?.setSpeed(0.5);
		loadMessages();
		dispatch(resetCarespaceAiProgram());
		await dispatch(getPreviousCarespaceAiProgram(selectedUser?.id));
	};

	const updateSelectedProgramExercises = (exerciseList: IProgramExercise[]) => {
		setSelectedProgram(prevState => {
			return prevState ? { ...prevState, exercises: exerciseList } : prevState;
		});
	};

	const extraContent = (data: IProgramData | IProgramTemplate) => {
		const isSelected = selectedProgram?.id === data.id;
		const handleSelectClick = () => {
			if (activeSubKey === '1') {
				setStrapiId(parseInt(data?.vitalflowId));
			} else if (activeSubKey === '2') {
				setProgramId(data?.id);
			}
		};
		return (
			<Flex gap={8} align="center">
				<Typography.Text>
					<span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
						{t(
							'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.duration',
						)}
					</span>{' '}
					{data?.duration} {data?.durationType}
				</Typography.Text>
				{activeKey === '2' && (
					<Button
						type={isSelected ? 'primary' : 'default'}
						onClick={event => {
							event.stopPropagation();
							if (isSelected) setSelectedProgram(null);
							else {
								if (!('clientId' in data)) {
									data = {
										...data,
										exercises: data?.exercises?.map(item => ({
											...item,
											strapiExerciseId:
												typeof item?.strapiExerciseId === 'number'
													? item?.strapiExerciseId
													: // TODO: Consider using vitalflowId ?? defaultValue or vitalflowId?.property instead of vitalflowId!
														item?.strapiExerciseId?.vitalflowId,
											image:
												typeof item?.strapiExerciseId !== 'number'
													? item?.strapiExerciseId?.exercise_image?.[0]?.url ??
														''
													: '',
											name:
												typeof item?.strapiExerciseId !== 'number'
													? item?.strapiExerciseId?.name ?? ''
													: '',
										})),
									};
								}
								setSelectedProgram(data);
								dispatch(setModalVisible(true));
							}
							handleSelectClick();
						}}
						style={{
							backgroundColor: isSelected
								? 'var(--color-success-500)'
								: 'var(--surface-secondary)',
							borderColor: isSelected
								? 'var(--color-success-500)'
								: 'var(--border-default)',
							color: isSelected
								? 'var(--text-on-brand)'
								: 'var(--text-primary)',
						}}>
						{isSelected
							? t('Admin.data.menu.patientDetail.aiAssistantPrograms.selected')
							: t('Admin.data.menu.patientDetail.aiAssistantPrograms.select')}
					</Button>
				)}
			</Flex>
		);
	};

	const handleCancel = () => {
		dispatch(setPopoverState(false));
		onCancel();
		setSelectedExercises([]);
		setSelectedProgram(null);
		dispatch(setModalVisible(false));
		setActiveKey('1');
		setActiveSubKey('1');
	};

	useEffect(() => {
		dispatch(setPopoverState(false));
	}, [activeKey, dispatch]);

	return (
		<Modal
			title={
				<Typography.Text
					style={{
						fontSize: 'var(--font-size-xl)',
						fontWeight: 'var(--font-weight-semibold)',
						color: 'var(--text-primary)',
					}}>
					<UntitledIcon name="edit" />{' '}
					{t('Admin.data.menu.patientDetail.aiAssistantPrograms.create')}
				</Typography.Text>
			}
			open={isVisible}
			onCancel={handleCancel}
			style={{ top: 20 }}
			footer={false}
			width={MODAL_SIZES.XLARGE}
			className="select-none create-program-modal">
			<Tabs
				defaultActiveKey={activeKey}
				activeKey={activeKey}
				className="select-none"
				tabBarStyle={{ margin: 0 }}
				onChange={value => setActiveKey(value)}
				items={[
					{
						label: t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.chooseLibrary',
						),
						key: '1',
						children: (
							<div className="rounded-none">
								<MyExrciseModalData
									selectedExercises={selectedExercises}
									open={openFilter}
									setOpen={setOpenFilter}
									setSelectedExercises={setSelectedExercises}
								/>
								{selectedExercises.length !== 0 && (
									<div
										className="add-exercises-action-button"
										onClick={() => dispatch(setModalVisible(true))}>
										<UntitledIcon
											name="plus"
											style={{ color: 'var(--text-on-brand)' }}
										/>
										<Typography.Text
											style={{
												fontSize: 'var(--font-size-md)',
												color: 'var(--text-on-brand)',
												fontWeight: 'var(--font-weight-semibold)',
											}}>
											{t(
												'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.add',
											)}{' '}
											{selectedExercises.length}{' '}
											{selectedExercises.length === 1
												? t(
														'Admin.data.menu.patientDetail.aiAssistantPrograms.exercise',
													)
												: t(
														'Admin.data.menu.patientDetail.aiAssistantPrograms.exercises',
													)}
										</Typography.Text>
									</div>
								)}
							</div>
						),
					},
					{
						label: t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.selectTemplate',
						),
						key: '2',
						children: (
							<TemplateModalData
								fetchData={fetchData}
								searchValue={searchValue}
								setSearchValue={setSearchValue}
								program={programTemplate}
								open={openFilter}
								setOpen={setOpenFilter}
								extraContent={extraContent}
								activeSubKey={activeSubKey}
								setActiveSubKey={setActiveSubKey}
							/>
						),
					},
					openaiApiKey && {
						label: (
							<span onClick={() => fetchPreviousOpenAiProgram()}>
								{t(
									'Admin.data.menu.patientDetail.aiAssistantPrograms.generateAi',
								)}
							</span>
						),
						key: '3',
						children: openAiProgram.loading ? (
							<Flex
								vertical
								justify="center"
								align="center"
								gap={8}
								className="ai-loading-container">
								<Lottie
									style={{ width: '300px' }}
									lottieRef={loadRef}
									animationData={(loadingAi as Record<string, unknown>)[theme]}
									loop={true}
									autoplay={true}
								/>
								<Typography.Text className="ai-loading-message">
									{loadingMessage}
								</Typography.Text>
							</Flex>
						) : (
							<div>
								<AiModalData
									program={openAiProgram}
									refresh={refresh}
									setRefresh={setRefresh}
									fetchOpenAiProgram={fetchOpenAiProgram}
									fetchData={fetchData}
									searchValue={searchValue}
									setSearchValue={setSearchValue}
									extraContent={extraContent}
								/>
							</div>
						),
					},
					{
						label: (
							<span onClick={() => fetchPreviousCarespaceAiProgram()}>
								{t(
									'Admin.data.menu.patientDetail.aiAssistantPrograms.generateCarespace',
								)}
							</span>
						),
						key: '4',
						children: vitalflowAiProgram.loading ? (
							<Flex
								vertical
								justify="center"
								align="center"
								gap={8}
								className="ai-loading-container">
								<Lottie
									style={{ width: '300px' }}
									lottieRef={loadRef}
									animationData={(loadingAi as Record<string, unknown>)[theme]}
									loop={true}
									autoplay={true}
								/>
								<Typography.Text className="ai-loading-message">
									{loadingMessage}
								</Typography.Text>
							</Flex>
						) : (
							<div>
								<AiModalData
									program={vitalflowAiProgram}
									refresh={refresh}
									setRefresh={setRefresh}
									fetchOpenAiProgram={fetchCarespaceAiProgram}
									fetchData={fetchData}
									searchValue={searchValue}
									setSearchValue={setSearchValue}
									extraContent={extraContent}
								/>
							</div>
						),
					},
				].filter(Boolean)}
			/>
			{isModalVisible && (
				<AddProgramPopup
					onOk={() => {
						dispatch(setModalVisible(false));
						setSelectedExercises([]);
						handleCancel();
						fetchData(1);
						setRefresh(!refresh);
					}}
					refresh={refresh}
					setRefresh={setRefresh}
					programId={programId}
					strapiId={strapiId}
					isVisible={isModalVisible}
					activeKey={activeKey}
					setSearchValue={setSearchValue}
					thumbnailValue={
						activeSubKey === '1'
							? selectedProgram?.thumbnail?.url
							: selectedProgram?.thumbnail
					}
					onCancel={() => {
						dispatch(setModalVisible(false));
						setSelectedProgram(null);
					}}
					selectedExercises={
						activeKey == '1'
							? selectedExercises
							: selectedProgram?.exercises ?? []
					}
					setSelectedExercises={
						activeKey == '1'
							? setSelectedExercises
							: updateSelectedProgramExercises
					}
					program={activeKey == '1' ? null : selectedProgram}
					isSaveTemplateVisible={
						selectedProgram?.exercises?.length === previousExercises?.length &&
						selectedProgram?.exercises?.every(e1 =>
							previousExercises.some(e2 => {
								return (
									e1.id === e2.id &&
									e1.reps === e2.reps &&
									e1.sets === e2.sets &&
									e1.dailyReps === e2.dailyReps &&
									e1.weeklyReps === e2.weeklyReps
								);
							}),
						)
					}
				/>
			)}
		</Modal>
	);
};
