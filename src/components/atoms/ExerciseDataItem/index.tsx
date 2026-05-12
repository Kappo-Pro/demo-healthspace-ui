import { UntitledIcon } from '@atoms/Icon';
import { ModalContentSkeleton } from '@atoms/Skeletons';
import { AddProgramPopup } from '@organisms/CreateProgramModal/AddProgramPopup';
import { useTheme } from '@providers/ThemeProvider';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import {
	selectExercise,
	selectProgram,
	updateProgram,
} from '@stores/shared/patientDetail/program';
import { CustomModalProps, IProgramData, IProgramExercise } from '@types';
import { lazyLoad } from '@utils/lazyLoad';
import {
	Button,
	Card,
	Collapse,
	Empty,
	Flex,
	Modal,
	Tag,
	Typography,
	message,
} from 'antd';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExerciseHeader from './ExerciseHeader';
import './style.css';

const { Paragraph } = Typography;

const Program = lazyLoad(() =>
	import('@organisms/ProgramFlow').then(m => ({ default: m.Program })),
);

const CustomModalInfo = (props: CustomModalProps) => {
	const { name, description, video } = props;

	const modalContent = (
		<Flex
			vertical
			align="center"
			justify="flex-start"
			className="select-none"
			style={{
				textAlign: 'center',
				height: 'calc(100vh - 120px)',
				overflow: 'auto',
			}}>
			<video
				controls
				className="video"
				preload="metadata"
				src={video}
				style={{
					width: '100%',
					maxHeight: 'calc(100vh - 250px)',
					objectFit: 'contain',
				}}
			/>
			<div className="select-none mt-6">
				<Typography.Title level={5}>{name}</Typography.Title>
				<Typography.Text>{description}</Typography.Text>
			</div>
		</Flex>
	);
	Modal.info({
		title: null,
		content: modalContent,
		maskClosable: true,
		icon: null,
		okButtonProps: { style: { display: 'none' } },
		closable: true,
		width: '90vw',
		style: { top: 20 },
		bodyStyle: {
			maxHeight: 'calc(100vh - 120px)',
			overflow: 'hidden',
			padding: 'var(--spacing-6)',
		},
	});
};

interface ExerciseDataItemProps {
	index: number;
	refresh: boolean;
	program: IProgramData;
	programExercises: IProgramExercise[];
	isLoading: boolean;
	setLoading: (isLoading: boolean) => void;
	setRefresh: (refresh: boolean) => void;
	session: boolean;
	setSession: (value: boolean) => void;
}

export const ExerciseDataItem = ({
	setSession,
	session,
	refresh,
	programExercises: _programExercises,
	program,
	isLoading,
	setRefresh,
}: ExerciseDataItemProps) => {
	const { t } = useTranslation();
	const programs = useTypedSelector(
		state => state.patientDetail.program.program,
	);
	const [_bulletPosition, setBulletPosition] = useState<number>();
	const [exercises, setExercises] = useState<IProgramExercise[]>(() => {
		const sortedExercise = [...(program?.exercises ?? [])];
		return sortedExercise.sort((a, b) => a.order - b.order);
	});
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);
	const [showNextPrevious, setShowNextPrevious] = useState(false);
	const [isModalVisible, setModalVisible] = useState(false);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const scrollRef = useRef(null);
	const [approved, setApproved] = useState(
		program?.status?.toLowerCase() == 'approved',
	);
	const [isOpen, setIsOpen] = useState(false);
	const [hoveredSession, setHoveredSession] = useState<string | null>(null);
	const { theme: _theme } = useTheme();
	const [isProgramModalVisible, setIsProgramModalVisible] = useState(false);

	useEffect(() => {
		if (
			programs?.data?.length === 1 &&
			session &&
			programs?.data[0]?.status === 'approved'
		) {
			startProgramSession();
			setSession(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		setApproved(program?.status?.toLowerCase() == 'approved');
		setExercises(() => {
			const sortedExercise = [...(program?.exercises ?? [])];
			return sortedExercise.sort((a, b) => a.order - b.order);
		});
	}, [program, isModalVisible]);

	const onScroll = () => {
		setBulletPosition(
			Math.floor(
				(scrollRef.current?.scrollLeft * position()) /
					scrollRef.current?.scrollWidth,
			),
		);
	};

	const position = () =>
		Math.floor(scrollRef.current?.scrollWidth / 1300) < 10
			? Math.floor(scrollRef.current?.scrollWidth / 1300)
			: 10;
	const _scrollWidth = () => scrollRef.current?.scrollWidth;

	useEffect(() => {
		setBulletPosition(1);
	}, [user, selectedUser, refresh]);

	const scrollLeft = () => {
		const currentPosition = scrollRef.current?.scrollLeft;
		const targetPosition = currentPosition - 400;
		scrollToPosition(targetPosition, 300);
	};

	const scrollRight = () => {
		const currentPosition = scrollRef.current?.scrollLeft;
		const targetPosition = currentPosition + 400;
		scrollToPosition(targetPosition, 300);
	};

	const scrollToPosition = (targetPosition: number, duration: number) => {
		const startTime = performance.now();
		const start = scrollRef.current?.scrollLeft;

		const scroll = timestamp => {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			scrollRef.current.scrollLeft =
				start + (targetPosition - start) * progress;

			if (progress < 1) {
				requestAnimationFrame(scroll);
			}
		};

		requestAnimationFrame(scroll);
	};

	const _handleApproveProgram = async (
		program: IProgramData,
		value: boolean,
	) => {
		const programData = {
			physioterapistId: user?.id,
			active: value,
			status: value ? 'approved' : 'draft',
		};
		await dispatch(
			updateProgram({
				programId: program?.id,
				programData: programData,
			}),
		).then(() =>
			value
				? message.success(
						t('Admin.data.menu.patientDetail.aiAssistantPrograms.approved'),
					)
				: message.success(
						t('Admin.data.menu.patientDetail.aiAssistantPrograms.disapproved'),
					),
		);
		setRefresh(!refresh);
	};

	const deleteProgram = async (program: IProgramData) => {
		const programData = {
			name: program?.name,
			active: false,
			duration: program?.duration,
			durationType: program?.durationType,
		};
		await dispatch(
			updateProgram({
				programId: program?.id,
				programData: programData,
			}),
		);
		setRefresh(!refresh);
	};

	const startProgramSession = () => {
		dispatch(selectProgram(program));
		dispatch(selectExercise(exercises));
		setIsProgramModalVisible(true);
		dispatch(setActiveTab(''));
	};

	const handleProgramModalClose = () => {
		Modal.confirm({
			title: t('common.exitConfirmationTitle', 'Exit Session'),
			content: t('common.exitConfirmationMessage', 'Are you sure you want to exit the session? Your progress might not be saved.'),
			onOk: () => {
				setIsProgramModalVisible(false);
			},
			onCancel: () => {},
			okText: t('common.yes', 'Yes'),
			cancelText: t('common.no', 'No'),
			centered: true,
		});
	};

	return (
		<>
			<Collapse
				className="collapse-panel-container"
				bordered={false}
				activeKey={isOpen ? program.id : undefined}>
				<Collapse.Panel
					style={{ minHeight: 'var(--spacing-12)' }}
					key={program.id}
					onClick={() => setIsOpen(!isOpen)}
					header={
						<Flex
							justify="space-between"
							className="exercise-start-session-button"
							onMouseEnter={() => setHoveredSession(program.id)}
							onMouseLeave={() => setHoveredSession(null)}>
							<Flex gap={4} align="center">
								<span className="text-sm font-semibold text-gray-600">
									{program?.name}
								</span>
								{program?.originType === 'manual' ? (
									<Tag>
										{t(
											'Admin.data.menu.patientDetail.aiAssistantPrograms.byPT',
										)}
									</Tag>
								) : (
									<Tag>
										{t(
											'Admin.data.menu.patientDetail.aiAssistantPrograms.byAI',
										)}
									</Tag>
								)}
							</Flex>
							{user.isPhysioterapist ? (
								<ExerciseHeader
									approved={approved}
									setApproved={setApproved}
									program={program}
									startProgramSession={startProgramSession}
									setModalVisible={setModalVisible}
									hoveredSession={hoveredSession}
								/>
							) : (
								<div>
									{' '}
									<Button
										icon={<UntitledIcon name="playCircle" />}
										onClick={e => {
											e.stopPropagation();
											startProgramSession();
										}}>
										{t('patient.progress.rehab.startSession')}
									</Button>
								</div>
							)}
						</Flex>
					}>
					{!isLoading ? (
						program ? (
							<div
								className="w-full p-[15px] bg-gray-50 rounded-lg overflow-hidden"
								onClick={e => e.stopPropagation()}>
								<Flex align="center" justify="center" className="mb-2">
									<span className="font-semibold mr-1">
										{t(
											'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.startDate',
										)}
									</span>
									<span className="mx-1">
										{program?.startAt
											? moment(program?.startAt).local().format('LL')
											: 'N/A'}
									</span>
									|
									<span className="ml-1 font-semibold mr-1">
										{t(
											'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.duration',
										)}
									</span>
									<span>{`${program?.duration} ${program?.durationType}`}</span>
								</Flex>
								{exercises?.length === 0 ? (
									<Empty
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
									<div
										style={{ width: '100%', position: 'relative' }}
										onMouseOver={() => setShowNextPrevious(true)}
										onMouseOut={() => setShowNextPrevious(false)}>
										<Flex
											ref={scrollRef}
											className="overflow-x-auto"
											gap={16}
											style={{
												backgroundColor: 'var(--collapse-bg-color)',
												padding: 'var(--spacing-2)',
												borderRadius: 'var(--radius-lg)',
											}}
											onScroll={onScroll}>
											{exercises?.map(item => {
												return (
													<Card
														style={{ minWidth: '250px', maxWidth: '250px' }}>
														<div
															onClick={() =>
																CustomModalInfo({
																	video:
																		item?.video ||
																		item?.exerciseLibrary?.videoUrl,
																	name:
																		item?.name || item?.exerciseLibrary?.title,
																	description:
																		item?.description ||
																		item?.exerciseLibrary?.description,
																})
															}
															className="w-full h-auto rounded-lg relative image-wrapper"
															style={{ cursor: 'pointer' }}>
															{item?.image ? (
																<div style={{
																	height: '200px',
																	backgroundColor: 'var(--text-secondary)',
																	borderRadius: '6px',
																	display: 'flex',
																	justifyContent: 'center',
																	alignItems: 'center',
																}}>
																	<img
																		src={item?.image}
																		alt=""
																		className="w-full h-[200px] rounded-t-lg"
																		style={{
																			borderRadius: '6px',
																			maxHeight: '210px',
																		}}
																	/>
																</div>
															) : (
																<video
																	className="video"
																	preload="metadata"
																	src={item?.exerciseLibrary?.videoUrl}
																	width="100%"
																	height="100%"
																/>
															)}
															<div className="play-button">
																<UntitledIcon name="playCircle" />
															</div>
														</div>
														<div className="w-full">
															<Paragraph className="text-gray-600 font-semibold text-lg mb-2" style={{marginTop:"12px"}}>
																{item?.name || item?.exerciseLibrary?.title}
															</Paragraph>
															<Paragraph className="text-gray-400 font-semibold text-xs mb-2">
																{t('Patient.data.rehab.weekly').toLowerCase()}:{' '}
																{item?.weeklyReps}X{' '}
																{t('Patient.data.rehab.daily').toLowerCase()}:{' '}
																{item?.dailyReps}X{' '}
																{t('Patient.data.rehab.sets').toLowerCase()}:{' '}
																{item?.sets}X{' '}
																{t('Patient.data.rehab.reps').toLowerCase()}:{' '}
																{item?.reps}X
															</Paragraph>
															<Paragraph className="text-gray-500">
																{item?.description ||
																	item?.exerciseLibrary?.description}
															</Paragraph>
														</div>
													</Card>
												);
											})}
										</Flex>
										{exercises?.length > 4 && showNextPrevious && (
											<div>
												<span
													className="scroll-btn scroll-btn-left"
													onClick={scrollLeft}>
													<UntitledIcon name="chevronLeft" />
												</span>

												<span
													className="scroll-btn scroll-btn-right"
													onClick={scrollRight}>
													<UntitledIcon name="chevronRight" />
												</span>
											</div>
										)}
									</div>
								)}
							</div>
						) : (
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={
									<span className="text-gray-300">
										{t(
											'Admin.data.menu.patientDetail.aiAssistantPrograms.noProgram',
										)}
									</span>
								}
							/>
						)
					) : (
						<ModalContentSkeleton />
					)}
				</Collapse.Panel>
				<AddProgramPopup
					isEdit
					onOk={() => {
						setModalVisible(false);
						setExercises([]);
						setRefresh(!refresh);
					}}
					deleteProgram={deleteProgram}
					refresh={refresh}
					setRefresh={setRefresh}
					isVisible={isModalVisible}
					onCancel={() => setModalVisible(false)}
					selectedExercises={exercises}
					setSelectedExercises={setExercises}
					program={program}
				/>
			</Collapse>
			<Modal
				open={isProgramModalVisible}
				onCancel={handleProgramModalClose}
				width="100vw"
				title={<div style={{ height: 'var(--spacing-2)' }}></div>}
				style={{ top: 0, padding: 0 }}
				bodyStyle={{
					height: 'calc(100vh - 64px)',
					overflowY: 'auto',
					padding: 0,
				}}
				footer={null}
				closable
				maskClosable={false}
				destroyOnClose
				className="full-modal-no-scroll">
				<Program setIsProgramModalVisible={setIsProgramModalVisible} />
			</Modal>
		</>
	);
};
