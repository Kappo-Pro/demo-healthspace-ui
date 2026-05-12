import { UntitledIcon } from '@atoms/Icon';
import { ExerciseVideoModal } from '@pages/StartScan/OCreateRomModal/ExerciseVideoModal';
import { updateCustomRom } from '@stores/clinical/rom/customRom';
import {
	createCustomSession,
	createSession,
	resetAll,
	selectExercise,
	setSession,
} from '@stores/clinical/rom/main';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { CustomRom, CustomRomExercise } from '@types';
import {
	Button,
	Card,
	Collapse,
	Empty,
	Flex,
	Modal,
	Switch,
	Typography,
	message,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddRomPopup from './OCreateRomModal/AddRomPopup';

const { Paragraph } = Typography;
interface CustomRomDataItemProps {
	program: CustomRom;
	refresh: boolean;
	setRefresh: (val: boolean) => void;
	updateProgramExercises: (ex: CustomRomExercise[]) => void;
	setRomModalOpen: (value: boolean) => void;
	setShowRomSplash: (value: boolean) => void;
}

export const CustomRomDataItem = ({
	program,
	refresh,
	setRefresh,
	updateProgramExercises,
	setRomModalOpen,
	setShowRomSplash,
}: CustomRomDataItemProps) => {
	const { t } = useTranslation();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const dispatch = useTypedDispatch();
	const [isOpen, setIsOpen] = useState(false);
	const [isEditModalVisible, setIsEditModalVisible] = useState(false);
	const [showNextPrevious, setShowNextPrevious] = useState(false);
	const [hoveredSession, setHoveredSession] = useState<string | null>(null);
	const [approved, setApproved] = useState(program?.active == true);
	const [videoModalOpen, setVideoModalOpen] = useState(false);
	const [selectedExercise, setSelectedExercise] = useState<{
		name: string;
		description: string;
		video: string;
	} | null>(null);
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);

	useEffect(() => {
		setApproved(program?.active == true);
	}, [program]);

	const scrollLeft = () => {
		const currentPosition = scrollRef.current?.scrollLeft ?? 0;
		const targetPosition = currentPosition - 400;
		scrollToPosition(targetPosition, 300);
	};

	const handleStartSession = async (
		e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>,
	) => {
		e.stopPropagation();
		dispatch(resetAll());
		if (pendingSession) {
			setIsModalVisible(true);
		} else {
			await dispatch(
				createCustomSession({
					userId: user.isPhysioterapist ? selectedUser?.id : user?.id,
					romProgramId: program?.id,
				}),
			);
			dispatch(selectExercise(program?.exercises));
			setShowRomSplash(false);
			setRomModalOpen(true);
		}
	};

	const scrollRight = () => {
		const currentPosition = scrollRef.current?.scrollLeft ?? 0;
		const targetPosition = currentPosition + 400;
		scrollToPosition(targetPosition, 300);
	};

	const scrollToPosition = (targetPosition: number, duration: number) => {
		const startTime = performance.now();
		const start = scrollRef.current?.scrollLeft ?? 0;

		const scroll = (timestamp: number) => {
			const elapsed = timestamp - startTime;
			const progress = Math.min(elapsed / duration, 1);
			if (scrollRef.current) {
				scrollRef.current.scrollLeft =
					start + (targetPosition - start) * progress;
			}

			if (progress < 1) {
				requestAnimationFrame(scroll);
			}
		};

		requestAnimationFrame(scroll);
	};

	const pendingSession = program?.customRomSession?.find(
		session =>
			session?.completed == false &&
			session?.customRomSessionExercise?.length < program?.exercises.length,
	);

	const handleNo = async () => {
		setIsModalVisible(false);
		await dispatch(
			createSession({
				id: pendingSession?.id,
				userId: user.isPhysioterapist ? selectedUser.id : user.id,
				customRomId: program?.id,
			}),
		);
		dispatch(selectExercise(program?.exercises));
		setShowRomSplash(false);
		setRomModalOpen(true);
	};

	const handleYes = async () => {
		setIsModalVisible(false);
		dispatch(
			setSession({
				session: pendingSession,
				exercises: program?.exercises,
			}),
		);
		setShowRomSplash(false);
		setRomModalOpen(true);
	};

	const handleApproveProgram = async (value: boolean) => {
		await dispatch(
			updateCustomRom({
				programId: program?.id,
				programData: {
					active: value,
				},
			}),
		).then(() =>
			value
				? message.success(
						t('Admin.data.menu.patientDetail.aiAssistantPrograms.approved'),
					)
				: message.success(
						t('Admin.data.menu.patientDetail.aiAssistantPrograms.disabled'),
					),
		);
	};

	return (
		<>
			<Collapse bordered={false} activeKey={isOpen ? program.id : undefined}>
				<Collapse.Panel
					key={program?.id}
					collapsible="icon"
					header={
						<Flex
							justify="space-between"
							align="center"
							onMouseEnter={() => setHoveredSession(program.id)}
							onMouseLeave={() => setHoveredSession(null)}
							style={{ height: 'var(--spacing-6)' }}>
							<Flex
								gap={4}
								align="center"
								onClick={() => setIsOpen(!isOpen)}
								style={{ cursor: 'pointer', flex: 1 }}>
								<Paragraph style={{ margin: 0 }}>{program?.title}</Paragraph>
							</Flex>
							{user.isPhysioterapist ? (
								<Flex
									gap={12}
									align="center"
									onClick={e => e.stopPropagation()}>
									{hoveredSession === program.id && (
										<>
											<Flex
												align="center"
												gap={4}
												onClick={e => {
													e.stopPropagation();
													setIsEditModalVisible(true);
												}}
												style={{ cursor: 'pointer' }}>
												<UntitledIcon name="edit" size="small" />
												<Paragraph style={{ margin: 0 }}>
													{t(
														'Admin.data.menu.patientDetail.aiAssistantPrograms.edit',
													)}
												</Paragraph>
											</Flex>
											<Flex
												align="center"
												gap={4}
												onClick={e => e.stopPropagation()}>
												<Switch
													checked={approved}
													onChange={(value, event) => {
														event.stopPropagation();
														setApproved(value);
														handleApproveProgram(value);
													}}
													style={{
														backgroundColor: approved
															? 'var(--mainmenu-bg-color)'
															: 'var(--color-gray-400)',
													}}
												/>
											</Flex>
											{!approved && (
												<Button
													disabled
													icon={<UntitledIcon name="playCircle" />}>
													{t('patient.progress.rehab.startSession')}
												</Button>
											)}
										</>
									)}
									{approved && (
										<Button
											icon={<UntitledIcon name="playCircle" />}
											onClick={async e => handleStartSession(e)}>
											{t('patient.progress.rehab.startSession')}
										</Button>
									)}
								</Flex>
							) : (
								<div onClick={e => e.stopPropagation()}>
									<Button
										style={{
											color: 'var(--button-text-color)',
											backgroundColor: 'var(--button-color)',
											border: 'inherit',
										}}
										icon={<UntitledIcon name="playCircle" />}
										onClick={async e => handleStartSession(e)}>
										{t('patient.progress.rehab.startSession')}
									</Button>
								</div>
							)}
						</Flex>
					}>
					{program && (
						<div
							className="w-full p-[15px] bg-gray-50 rounded-lg overflow-hidden"
							onClick={e => e.stopPropagation()}>
							{program?.exercises?.length === 0 ? (
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
									onMouseOver={() => setShowNextPrevious(true)}
									onMouseOut={() => setShowNextPrevious(false)}
									className="w-full relative">
									<Flex
										ref={scrollRef}
										gap={16}
										className="overflow-x-auto"
										style={{
											backgroundColor: 'var(--collapse-bg-color)',
											padding: 'var(--spacing-2)',
											borderRadius: 'var(--radius-lg)',
										}}>
										{program?.exercises?.map(item => {
											const image = item?.image?.url;
											const video = item?.video?.url
												? item?.video?.url
												: item?.video;
											const name = item?.name ? item?.name : item?.title;
											const description = item?.description;

											return (
												<Card
													hoverable
													className="exercise-card-div"
													styles={{
														body: { padding: 0 },
													}}
													cover={
														<div
															onClick={() => {
																setSelectedExercise({
																	video: video,
																	name: name,
																	description: description,
																});
																setVideoModalOpen(true);
															}}>
															{image ? (
																<img
																	className="video"
																	src={image}
																	width="100%"
																	height="100%"
																	style={{
																		borderTopLeftRadius: '6px',
																		borderTopRightRadius: '6px',
																	}}
																/>
															) : (
																<video
																	className="video"
																	preload="metadata"
																	src={video}
																	width="100%"
																	height="100%"
																/>
															)}
															<div className="play-button-css">
																<UntitledIcon name="playCircle" size={50} />
															</div>
														</div>
													}>
													<div className="main-para-div">
														<Paragraph className="exercise-title-name">
															{name}
														</Paragraph>
														<Paragraph>{description}</Paragraph>
													</div>
												</Card>
											);
										})}
									</Flex>
									{program?.exercises?.length > 4 && showNextPrevious && (
										<>
											<span
												onClick={scrollLeft}
												className="left-arrow-container">
												<UntitledIcon
													name="chevronLeft"
													size={24}
													color="var(--color-white)"
												/>
											</span>
											<span
												onClick={scrollRight}
												className="right-arrow-container">
												<UntitledIcon
													name="chevronRight"
													size={24}
													color="var(--color-white)"
												/>
											</span>
										</>
									)}
								</div>
							)}
						</div>
					)}
				</Collapse.Panel>
			</Collapse>
			{isModalVisible && (
				<Modal
					title={t('Patient.data.vitalscan-rom.continueSession')}
					open={isModalVisible}
					onCancel={() => setIsModalVisible(false)}
					footer={null}
					centered>
					<Paragraph>
						{t('Patient.data.vitalscan-rom.continueSessionQuestion')}
					</Paragraph>
					<div className="text-right">
						<Button
							type="default"
							onClick={handleNo}
							style={{ marginRight: 'var(--spacing-2-5)' }}>
							{t('Patient.data.vitalscan-rom.no')}
						</Button>
						<Button type="primary" onClick={handleYes}>
							{t('Patient.data.vitalscan-rom.yes')}
						</Button>
					</div>
				</Modal>
			)}
			{isEditModalVisible && (
				<AddRomPopup
					isVisible={isEditModalVisible}
					onCancel={() => setIsEditModalVisible(false)}
					onOk={() => setIsEditModalVisible(false)}
					refresh={refresh}
					setRefresh={setRefresh}
					selectedExercises={program?.exercises}
					setSelectedExercises={exercises => updateProgramExercises(exercises)}
					selectedRom={program}
					isEdit
				/>
			)}
			{selectedExercise && (
				<ExerciseVideoModal
					open={videoModalOpen}
					onClose={() => {
						setVideoModalOpen(false);
						setSelectedExercise(null);
					}}
					name={selectedExercise.name}
					description={selectedExercise.description}
					video={selectedExercise.video}
				/>
			)}
		</>
	);
};
