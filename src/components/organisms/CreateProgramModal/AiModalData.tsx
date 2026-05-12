import { showCustomModal } from '@atoms/CustomModalInfo';
import { UntitledIcon } from '@atoms/Icon';
import { router } from '@routers/routers';
import { useTypedSelector } from '@stores/index';
import { IProgramData, IProgramExercise } from '@types';
import { Button, Collapse, Empty, Flex, Typography } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AddProgramPopup } from './AddProgramPopup';

const { Paragraph } = Typography;

interface ExerciseProps {
	searchValue?: string;
	setSearchValue: (value: string) => void;
	extraContent: (data: IProgramData) => ReactNode;
	fetchData: (pageNumber: number) => void;
	fetchOpenAiProgram: () => void;
	refresh: boolean;
	setRefresh: (refresh: boolean) => void;
	program: {
		data: IProgramData | null;
		errorMessage: string;
		statusCode: number;
	};
}

export const AiModalData = (props: ExerciseProps) => {
	const {
		extraContent,
		fetchData,
		fetchOpenAiProgram,
		refresh,
		setRefresh,
		program,
	} = props;
	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const userId = user?.isPhysioterapist ? selectedUser?.id : user?.id;

	const { t } = useTranslation();
	const [selectedProgram, setSelectedProgram] = useState<IProgramData | null>(
		program?.data,
	);
	const [isModalVisible, setModalVisible] = useState(false);
	const navigate = useNavigate();
	useEffect(() => setSelectedProgram(program?.data), [program]);

	const updateSelectedProgramExercises = (exerciseList: IProgramExercise[]) => {
		setSelectedProgram(prevState => {
			return prevState ? { ...prevState, exercises: exerciseList } : prevState;
		});
	};

	return (
		<>
			{program?.data ? (
				<>
					<Collapse
						defaultActiveKey={program?.data?.id}
						style={{
							overflowX: 'hidden',
							overflowY: 'auto',
							padding: 'var(--spacing-4)',
							borderRadius: '0px 0px var(--radius-md) var(--radius-md) ',
						}}
						className="select-none"
						bordered={false}>
						<Collapse.Panel
							className="program-collapse-panel"
							style={{ borderRadius: 'var(--radius-md) ' }}
							key={program?.data?.id}
							header={
								<Typography.Text
									style={{
										fontSize: 'var(--font-size-sm)',
										fontWeight: 'var(--font-weight-semibold)',
										color: 'var(--text-secondary)',
									}}>
									{program?.data?.name}
								</Typography.Text>
							}
							extra={extraContent(program?.data)}>
							{program?.data?.exercises?.filter(item => item?.id)?.length >
							0 ? (
								program?.data?.exercises
									?.filter(item => item?.id)
									.map((item, index) => (
										<div className="px-4 py-2" key={index}>
											<Flex
												className="cursor-pointer p-4 rounded-lg border-2 border-inherit w-full"
												gap={16}>
												<div
													onClick={e => {
														e.stopPropagation();
														showCustomModal({
															video:
																item?.video || item?.assets?.[0]?.video?.url,
															name: item?.name,
															description: item?.description,
														});
													}}
													className={`custom-image-container`}>
													<div className="w-40 flex-shrink-0 image-wrapper">
														<img
															src={item?.image || item?.assets?.[0]?.image?.url}
															alt=""
															className="rounded-lg w-full h-full"
														/>
														<div className="play-button">
															<UntitledIcon name="playCircle" size={50} />
														</div>
													</div>
												</div>
												<div className="flex-1 rounded-lg p-2">
													<Paragraph className="text-gray-600 font-semibold text-lg">
														{item?.name}
													</Paragraph>
													<Paragraph className="text-gray-400 font-semibold text-xs">
														{t(
															'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.weekly',
														)}{' '}
														{item?.weeklyReps}X&nbsp;
														{t(
															'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.daily',
														)}{' '}
														{item?.dailyReps}X&nbsp;
														{t(
															'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.sets',
														)}{' '}
														{item?.sets}X&nbsp;
														{t(
															'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.reps',
														)}{' '}
														{item?.reps}X
													</Paragraph>
													<Paragraph className="text-gray-600 mt-2">
														{item?.description}
													</Paragraph>
												</div>
											</Flex>
										</div>
									))
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
							)}
						</Collapse.Panel>
					</Collapse>
					{
						<Flex
							style={{ marginTop: 'var(--spacing-2)' }}
							justify="center"
							align="center"
							gap={8}>
							{program?.data?.exercises?.filter(item => item?.id)?.length >
								0 && (
								<div
									className="add-exercises-action-button"
									onClick={() => setModalVisible(true)}>
									<UntitledIcon name="plus" size="medium" />
									<Typography.Text
										style={{
											fontSize: 'var(--font-size-md)',
											color: 'var(--text-on-brand)',
											fontWeight: 'var(--font-weight-semibold)',
										}}>
										{t(
											'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.add',
										)}
									</Typography.Text>
								</div>
							)}
							<div
								className="generate-new-button"
								onClick={() => fetchOpenAiProgram()}>
								<UntitledIcon
									name="wand"
									size="medium"
									color="var(--text-on-brand)"
								/>
								<Typography.Text
									style={{
										fontSize: 'var(--font-size-md)',
										color: 'var(--text-on-brand)',
										fontWeight: 'var(--font-weight-semibold)',
									}}>
									{t(
										'Admin.data.menu.patientDetail.aiAssistantPrograms.generateNew',
									)}
								</Typography.Text>
							</div>
						</Flex>
					}
					{isModalVisible && (
						<AddProgramPopup
							onOk={() => {
								setModalVisible(false);
								fetchData(1);
								setRefresh(!refresh);
							}}
							refresh={refresh}
							setRefresh={setRefresh}
							isVisible={isModalVisible}
							onCancel={() => setModalVisible(false)}
							// TODO: Consider using exercises ?? defaultValue or exercises?.property instead of exercises!
							selectedExercises={selectedProgram?.exercises}
							setSelectedExercises={updateSelectedProgramExercises}
							program={selectedProgram}
						/>
					)}
				</>
			) : (
				<Flex
					vertical
					className="ai-error-container"
					justify="center"
					align="center"
					gap={8}>
					{program.statusCode == 404 ? (
						<Flex vertical gap={16} align="center">
							<UntitledIcon
								name="activity"
								size={56}
								color="var(--text-secondary)"
							/>
							<Paragraph>{program.errorMessage}</Paragraph>
							<Flex justify="center">
								<Button
									onClick={() => {
										navigate(`/${userId}${router.AIASSISTANT_START_SCAN}`);
									}}
									icon={<UntitledIcon name="arrowRight" size="small" />}
									iconPosition="end">
									{t('Admin.data.managePatient.omniRom.startScan')}
								</Button>
							</Flex>
						</Flex>
					) : (
						<>
							<UntitledIcon
								name="frown"
								size={40}
								color="var(--color-error-500)"
							/>
							<Paragraph>{program?.errorMessage}</Paragraph>
						</>
					)}
				</Flex>
			)}
		</>
	);
};
