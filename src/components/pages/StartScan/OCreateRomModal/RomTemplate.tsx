import { UntitledIcon } from '@atoms/Icon';
import { CustomRomTemplate, RomProgramExercise } from '@types';
import { Button, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddRomPopup from './AddRomPopup';
import MyTemplate from './MyTemplate';
import './RomTemplate.css';
import SystemTemplate from './SystemTemplate';

interface IRomTemplate {
	onCancel: () => void;
	refresh: boolean;
	setRefresh: (value: boolean) => void;
}

const RomTemplate = (props: IRomTemplate) => {
	const { refresh, setRefresh, onCancel } = props;
	const { t } = useTranslation();
	const [selectedRom, setSelectedRom] = useState<CustomRomTemplate | null>();
	const [isModalVisible, setModalVisible] = useState(false);
	const [selectedExercises, setSelectedExercises] = useState<
		RomProgramExercise[]
	>([]);

	const handleCancel = () => {
		setSelectedExercises([]);
		setSelectedRom(null);
		setModalVisible(false);
	};

	const extraContent = (data: CustomRomTemplate) => {
		const isSelected = selectedRom?.id === data.id;

		return (
			<div
				className="extra-content"
				onClick={event => {
					event.stopPropagation();
				}}>
				<Button
					onClick={() => {
						if (isSelected) setSelectedRom(null);
						else {
							if (!('clientId' in data)) {
								data = {
									...data,
									exercises: data?.exercises?.map((item: unknown) => ({
										...item,
										strapiExerciseId:
											typeof item?.strapiExerciseId === 'number'
												? item?.strapiExerciseId
												: item?.strapiExerciseId?.vitalflowId ?? null,
										image:
											typeof item?.strapiExerciseId !== 'number'
												? item?.strapiExerciseId?.exercise_image?.[0]?.url ?? ''
												: '',
										name:
											typeof item?.strapiExerciseId !== 'number'
												? item?.strapiExerciseId?.name ?? ''
												: '',
									})),
								};
							}
							setSelectedRom(data);
							setSelectedExercises(data?.exercises || []);
							setModalVisible(true);
						}
					}}
					className={`select-button ${
						isSelected ? 'bg-selected' : 'bg-unselected'
					}`}>
					<UntitledIcon name="check" />
					{isSelected
						? t('Admin.data.menu.patientDetail.aiAssistantPrograms.selected')
						: t('Admin.data.menu.patientDetail.aiAssistantPrograms.select')}
				</Button>
			</div>
		);
	};

	return (
		<>
			<Tabs
				type="card"
				className="mainTabs select-none p-4"
				tabBarStyle={{ margin: 0 }}
				items={[
					{
						label: t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.myTemplates',
						),
						key: '1',
						children: <MyTemplate extra={extraContent} refresh={refresh} />,
					},
					{
						label: t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.systemTemplates',
						),
						key: '2',
						children: <SystemTemplate extra={extraContent} />,
					},
				]}
			/>
			{isModalVisible && selectedRom && (
				<AddRomPopup
					isVisible={isModalVisible}
					onCancel={() => {
						setModalVisible(false);
						setSelectedRom(null);
					}}
					onOk={() => {
						setModalVisible(false);
						setSelectedExercises([]);
						handleCancel();
						setRefresh(!refresh);
					}}
					refresh={refresh}
					setRefresh={setRefresh}
					selectedExercises={selectedExercises}
					setSelectedExercises={setSelectedExercises}
					selectedRom={selectedRom}
					outerModal={onCancel}
				/>
			)}
		</>
	);
};

export default RomTemplate;
