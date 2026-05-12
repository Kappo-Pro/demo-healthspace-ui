import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { IProgramExercise } from '@types';
import { Button, Modal, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MyExrciseModalData } from './MyExerciseModalData';

interface AddLibraryExerciseModalProps {
	isVisible: boolean;
	onOk: () => void;
	onCancel: () => void;
	selectedExercises: IProgramExercise[];
	setSelectedExercises: (selectedExercises: IProgramExercise[]) => void;
}

export const AddLibraryExerciseModal = ({
	isVisible,
	onOk,
	onCancel,
	selectedExercises,
	setSelectedExercises,
}: AddLibraryExerciseModalProps) => {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	return (
		<Modal
			title={
				<Typography.Text
					style={{
						fontSize: 'var(--font-size-xl)',
						fontWeight: 'var(--font-weight-semibold)',
						color: 'var(--text-primary)',
					}}>
					{t('Admin.data.menu.patientDetail.aiAssistantPrograms.create')}
				</Typography.Text>
			}
			style={{ top: 20 }}
			open={isVisible}
			onCancel={onCancel}
			footer={false}
			width={MODAL_SIZES.XLARGE}
			className="select-none">
			<div className="rounded-none p-4">
				<MyExrciseModalData
					open={open}
					setOpen={setOpen}
					selectedExercises={selectedExercises}
					setSelectedExercises={setSelectedExercises}
				/>
				{selectedExercises.length !== 0 && (
					<Button
						type="primary"
						size="large"
						block
						icon={<UntitledIcon name="plus" />}
						onClick={() => onOk()}
						style={{
							backgroundColor: 'var(--color-success-500)',
							borderColor: 'var(--color-success-500)',
							marginTop: 'var(--spacing-4)',
						}}>
						{t(
							'Admin.data.menu.patientDetail.aiAssistantCreateProgramModal.add',
						)}{' '}
						{selectedExercises.length}{' '}
						{selectedExercises.length === 1
							? t('Admin.data.menu.patientDetail.aiAssistantPrograms.exercise')
							: t(
									'Admin.data.menu.patientDetail.aiAssistantPrograms.exercises',
								)}
					</Button>
				)}
			</div>
		</Modal>
	);
};
