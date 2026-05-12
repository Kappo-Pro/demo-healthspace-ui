import { Flex, Modal, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddRomPopup from './AddRomPopup';
import { LibraryData } from './LibraryData';
// REMOVED: import { Check } from '@vitalflow-icons/general/check';
import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { CustomRom, RomProgramExercise } from '@types';
import RomTemplate from './RomTemplate';

interface CreateRomPlaylistModalProps {
	isVisible: boolean;
	onCancel: () => void;
	refresh: boolean;
	setRefresh: (refresh: boolean) => void;
	activeKey: string;
	setActiveKey: (val: string) => void;
	subActiveKey: string;
	setSubActiveKey: (val: string) => void;
}

export default function CreateRomModal(props: CreateRomPlaylistModalProps) {
	const {
		isVisible,
		onCancel,
		setRefresh,
		refresh,
		activeKey,
		setActiveKey,
		subActiveKey,
		setSubActiveKey,
	} = props;
	const { t } = useTranslation();
	const [selectedExercises, setSelectedExercises] = useState<
		RomProgramExercise[]
	>([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [selectedRom, setSelectedRom] = useState<CustomRom | null>();

	const handleCancel = () => {
		onCancel();
		setSelectedExercises([]);
		setSelectedRom(null);
		setActiveKey('1');
	};

	return (
		<Modal
			title={
				<Flex align="center" gap={16}>
					<UntitledIcon name="edit" />
					<span className="titleStyle">
						{t('Patient.data.vitalscan-rom.createRomProgram')}
					</span>
				</Flex>
			}
			style={{ top: 20 }}
			open={isVisible}
			onCancel={handleCancel}
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
							<LibraryData
								selectedExercises={selectedExercises}
								setSelectedExercises={setSelectedExercises}
								setModalVisible={setModalVisible}
								subActiveKey={subActiveKey}
								setSubActiveKey={setSubActiveKey}
							/>
						),
					},
					{
						label: t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.selectTemplate',
						),
						key: '2',
						children: (
							<RomTemplate
								onCancel={handleCancel}
								refresh={refresh}
								setRefresh={setRefresh}
							/>
						),
					},
				].filter(Boolean)}
			/>
			{isModalVisible && (
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
					subActiveKey={subActiveKey}
					setSubActiveKey={setSubActiveKey}
					outerModal={onCancel}
				/>
			)}
		</Modal>
	);
}
