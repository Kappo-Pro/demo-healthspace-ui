import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { IProgramExercise } from '@types';
import { Flex, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { LibraryData } from './LibraryData';

interface AddRomLibraryExerciseProps {
	isVisible: boolean;
	onOk: () => void;
	onCancel: () => void;
	selectedExercises: IProgramExercise[];
	setSelectedExercises: (selectedExercises: IProgramExercise[]) => void;
	subActiveKey: string;
	setSubActiveKey: (val: string) => void;
}

export const AddRomLibraryExercise = ({
	isVisible,
	onOk,
	onCancel,
	selectedExercises,
	setSelectedExercises,
	subActiveKey,
	setSubActiveKey,
}: AddRomLibraryExerciseProps) => {
	const { t } = useTranslation();

	return (
		<Modal
			title={
				<Flex gap={4}>
					<span>
						<UntitledIcon name="edit" />
					</span>
					<span className="titleStyle">
						{t('Patient.data.vitalscan-rom.createRomProgram')}
					</span>
				</Flex>
			}
			style={{ top: 20 }}
			open={isVisible}
			onCancel={onCancel}
			footer={false}
			width={MODAL_SIZES.XLARGE}
			className="select-none">
			<LibraryData
				onOk={onOk}
				selectedExercises={selectedExercises}
				setSelectedExercises={setSelectedExercises}
				subActiveKey={subActiveKey}
				setSubActiveKey={setSubActiveKey}
			/>
		</Modal>
	);
};
