import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { updateProgram } from '@stores/shared/patientDetail/program';
import { IProgramData } from '@types';
import { Button, Flex, Switch, Typography, message } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

interface IExerciseHeaderProps {
	approved: boolean;
	setApproved: (value: boolean) => void;
	program: IProgramData;
	startProgramSession: () => void;
	setModalVisible: (value: boolean) => void;
	hoveredSession: string | null;
}

export default function ExerciseHeader(props: IExerciseHeaderProps) {
	const {
		approved,
		setApproved,
		program,
		startProgramSession,
		setModalVisible,
		hoveredSession,
	} = props;
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const user = useTypedSelector(state => state.user);

	const buttonStyle = {
		color: 'var(--button-text-color)',
		border: 'inherit',
		marginTop: '-5px',
	};

	const handleApproveProgram = useCallback(
		async (program: IProgramData, value: boolean) => {
			setApproved(value);
			const programData = {
				physioterapistId: user?.id,
				active: value,
				status: value ? 'approved' : 'draft',
			};
			try {
				await dispatch(
					updateProgram({
						programId: program?.id,
						programData: programData,
					}),
				);
				value
					? message.success(
							t('Admin.data.menu.patientDetail.aiAssistantPrograms.approved'),
						)
					: message.success(
							t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.disapproved',
							),
						);
			} catch (error) {
				setApproved(!value);
				message.error(
					t('Admin.data.menu.patientDetail.aiAssistantPrograms.updateFailed'),
				);
			}
		},
		[user?.id, dispatch, setApproved, t],
	);

	return (
		<Flex gap={12} style={{ height: 'var(--spacing-6)' }}>
			{hoveredSession === program.id && (
				<>
					<Button
						style={{ marginTop: '-5px' }}
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							setModalVisible(true);
						}}>
						<UntitledIcon name="edit" />
						<span className="text-gray-700 text-xs">
							{t('Admin.data.menu.patientDetail.aiAssistantPrograms.edit')}
						</span>
					</Button>
					<Flex className="h-fit px-1.5 rounded-lg" align="center" gap={4}>
						<Switch
							checked={approved}
							onChange={(value, event) => {
								event.stopPropagation();
								handleApproveProgram(program, value);
							}}
							style={{
								backgroundColor: approved
									? 'var(--mainmenu-bg-color)'
									: 'var(--color-gray-400)',
							}}
						/>
					</Flex>
					{!approved && (
						<Button disabled icon={<UntitledIcon name="playCircle" />}>
							{t('patient.progress.rehab.startSession')}
						</Button>
					)}
				</>
			)}
			{approved && (
				<Button
					icon={<UntitledIcon name="playCircle" size={'medium'} />}
					onClick={e => {
						e.stopPropagation();
						approved && startProgramSession();
					}}>
					{t('patient.progress.rehab.startSession')}
				</Button>
			)}
		</Flex>
	);
}
