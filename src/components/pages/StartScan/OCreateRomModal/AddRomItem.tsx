import { UntitledIcon } from '@atoms/Icon';
import {
	closestCorners,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { RomTemplateExercise } from '@types';
import { Button, Checkbox, Flex, Input, message, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useTranslation } from 'react-i18next';
import { AddExerciseItem } from './AddExerciseItem';

const { Paragraph } = Typography;

interface IAddRomItem {
	selectedExercises: RomTemplateExercise[];
	setSelectedExercises: (value: RomTemplateExercise[]) => void;
	handleRemoveExercise: (id: number | string) => void;
	romName: string;
	setRomName: (value: string) => void;
	romDescription: string;
	setRomDescription: (value: string) => void;
	isSaveTemplate: boolean;
	setSaveTemplate: (value: boolean) => void;
	SetLibraryModalVisible: (val: boolean) => void;
	handleCreateProgramTemplate: () => void;
	handleCreateRomProgram: () => void;
	handleUpdateRomProgram: () => void;
	isEdit: boolean;
}

const AddRomItem = (props: IAddRomItem) => {
	const {
		handleCreateRomProgram,
		handleUpdateRomProgram,
		isEdit,
		handleCreateProgramTemplate,
		setSaveTemplate,
		isSaveTemplate,
		romName,
		setRomName,
		romDescription,
		setRomDescription,
		selectedExercises,
		setSelectedExercises,
		handleRemoveExercise,
		SetLibraryModalVisible,
	} = props;
	const { t } = useTranslation();
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const getTaskPos = (id: string) =>
		selectedExercises?.findIndex(
			(exercise: { id: string }) => exercise.id === id,
		);

	const handleDragEnd = (event: { active: unknown; over: unknown }) => {
		const { active, over } = event;
		if (active.id === over.id) return;
		const originalPos = getTaskPos(active.id);
		const newPos = getTaskPos(over.id);
		const newArray = [...selectedExercises];
		[newArray[originalPos], newArray[newPos]] = [
			newArray[newPos],
			newArray[originalPos],
		];
		setSelectedExercises(newArray);
	};

	const updatePropertyAtIndex = (
		index: number,
		newReps: number,
		property: string,
	) => {
		setSelectedExercises(
			selectedExercises.map((exercise: RomTemplateExercise, idx: number) => {
				if (idx === index) {
					return {
						...exercise,
						[property]: newReps,
					};
				}
				return exercise;
			}),
		);
	};

	const handleSave = () => {
		if (!romName?.trim()) {
			message.error(t('Patient.data.vitalscan-rom.romNameErr'));
		} else if (!romDescription?.trim()) {
			message.error(t('Patient.data.vitalscan-rom.romDescriptionErr'));
		} else {
			if (isEdit) {
				handleUpdateRomProgram();
				isSaveTemplate && handleCreateProgramTemplate();
			} else {
				handleCreateRomProgram();
				isSaveTemplate && handleCreateProgramTemplate();
			}
		}
	};
	return (
		<>
			<Paragraph className="vitalscan-rom-edit-title">
				{t('Patient.data.vitalscan-rom.romTitle')}
			</Paragraph>
			<Flex align="flex-end" gap={8} className="margin-top-spacing">
				<Input
					className="vitalscan-rom-edit-input"
					placeholder={t('Patient.data.vitalscan-rom.romTitle')}
					value={romName}
					onChange={e => setRomName(e.target.value)}
				/>
			</Flex>
			<Paragraph className="vitalscan-rom-edit-title margin-top-spacing">
				{t('Patient.data.vitalscan-rom.romDescription')}
			</Paragraph>
			<Flex align="flex-end" gap={8} className="margin-top-spacing">
				<TextArea
					className="vitalscan-rom-edit-input"
					rows={3}
					placeholder={t('Patient.data.vitalscan-rom.romDescription')}
					value={romDescription}
					onChange={e => setRomDescription(e.target.value)}
				/>
			</Flex>
			<Button
				type="dashed"
				block
				icon={<UntitledIcon name="plus" size={20} />}
				onClick={() => SetLibraryModalVisible(true)}
				style={{
					marginTop: 'var(--spacing-4)',
					marginBottom: 'var(--spacing-4)',
				}}>
				{t('Patient.data.vitalscan-rom.addExercises')}
			</Button>
			<div
				style={{ maxHeight: '42vh', overflowX: 'hidden', overflowY: 'auto' }}>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCorners}
					onDragEnd={handleDragEnd}>
					<SortableContext
						items={selectedExercises || []}
						strategy={verticalListSortingStrategy}>
						{selectedExercises?.map(
							(item: RomTemplateExercise, index: number) => (
								<AddExerciseItem
									index={index}
									handleRemoveExercise={handleRemoveExercise}
									id={item.id}
									exercise={item}
									length={selectedExercises?.length}
									updatePropertyAtIndex={updatePropertyAtIndex}
								/>
							),
						)}
					</SortableContext>
				</DndContext>
			</div>
			<Flex align="center" justify="center" gap={8}>
				<Checkbox
					id={'selectSaveTemplate'}
					checked={isSaveTemplate}
					onChange={() => setSaveTemplate(!isSaveTemplate)}
				/>
				<Paragraph style={{ margin: 0 }}>
					{t('Admin.data.menu.patientDetail.aiAssistantPrograms.saveTemplate')}
				</Paragraph>
			</Flex>
			<Button
				block
				icon={<UntitledIcon name="check" />}
				onClick={handleSave}
				style={{
					marginTop: 'var(--spacing-2)',
					marginBottom: 'var(--spacing-2)',
				}}>
				{t('admin.menu.patientDetail.aiAssistantPrograms.save')}
			</Button>
		</>
	);
};

export default AddRomItem;
