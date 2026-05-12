import { UntitledIcon } from '@atoms/Icon';
import { RomProgramExercise } from '@types';
import { Button, Tabs, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CarespaceLibraryData } from './CarespaceLibraryData';
import { MyExerciseData } from './MyExerciseData';

const { Paragraph } = Typography;

interface LibraryDataProps {
	setSelectedExercises: (selectedExercises: RomProgramExercise[]) => void;
	selectedExercises: RomProgramExercise[];
	setModalVisible?: (value: boolean) => void;
	onOk?: () => void;
	subActiveKey: string;
	setSubActiveKey?: (value: string) => void;
}

export const LibraryData = ({
	selectedExercises,
	setSelectedExercises,
	setModalVisible,
	onOk,
	subActiveKey,
	setSubActiveKey,
}: LibraryDataProps) => {
	const { t } = useTranslation();
	const [isGrid, setGrid] = useState(false);

	return (
		<Tabs
			type="card"
			activeKey={subActiveKey}
			onChange={value => setSubActiveKey && setSubActiveKey(value)}
			className="mainTabs select-none p-4"
			tabBarStyle={{ margin: 0 }}
			items={[
				{
					label: t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.vitalflowLibrary',
					),
					key: '1',
					children: (
						<>
							<CarespaceLibraryData
								setGrid={setGrid}
								isGrid={isGrid}
								selectedExercises={selectedExercises}
								setSelectedExercises={setSelectedExercises}
							/>
							{selectedExercises.length !== 0 && (
								<Button
									block
									type="primary"
									icon={<UntitledIcon name="plus" size={20} />}
									onClick={() => (onOk ? onOk() : setModalVisible?.(true))}
									style={{
										backgroundColor: 'var(--color-success-500)',
										marginTop: 'var(--spacing-4)',
										marginBottom: 'var(--spacing-4)',
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
								</Button>
							)}
						</>
					),
				},
				{
					label: t(
						'Admin.data.menu.patientDetail.aiAssistantPrograms.myLibrary',
					),
					key: '2',
					children: (
						<>
							<MyExerciseData
								setGrid={setGrid}
								isGrid={isGrid}
								selectedExercises={selectedExercises}
								setSelectedExercises={setSelectedExercises}
							/>
							{selectedExercises.length !== 0 && (
								<Button
									block
									type="primary"
									icon={<UntitledIcon name="plus" size={20} />}
									onClick={() => (onOk ? onOk() : setModalVisible?.(true))}
									style={{
										backgroundColor: 'var(--color-success-500)',
										marginTop: 'var(--spacing-4)',
										marginBottom: 'var(--spacing-4)',
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
								</Button>
							)}
						</>
					),
				},
			]}
		/>
	);
};
