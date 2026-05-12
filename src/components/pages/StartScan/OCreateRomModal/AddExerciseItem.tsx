import { MenuOutlined } from '@ant-design/icons';
import { UntitledIcon } from '@atoms/Icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExerciseVideoModal } from '@pages/StartScan/OCreateRomModal/ExerciseVideoModal';
import { RomTemplateExercise } from '@types';
import { Flex, Select, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';

const { Paragraph } = Typography;

interface AddExerciseItemProps {
	exercise: RomTemplateExercise;
	id: string;
	handleRemoveExercise: (id: number | string) => void;
	length: number;
	updatePropertyAtIndex: (
		index: number,
		newReps: number,
		property: string,
	) => void;
	index: number;
}

const Option = Select;

export const AddExerciseItem = ({
	index,
	updatePropertyAtIndex,
	length,
	exercise,
	id,
	handleRemoveExercise,
}: AddExerciseItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });
	const { t } = useTranslation();
	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	const [displayData, setDisplayData] = useState({
		image: '',
		video: '',
		name: '',
		description: '',
	});
	const [videoModalOpen, setVideoModalOpen] = useState(false);
	const [selectedExercise, setSelectedExercise] = useState<{
		name: string;
		description: string;
		video: string;
	} | null>(null);

	useEffect(() => {
		exercise && setExercisData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [exercise]);

	const setExercisData = () => {
		let tableData = {
			image: '',
			video: '',
			name: '',
			description: '',
		};
		const lib = exercise?.exerciseLibrary;
		const omni = exercise?.strapiOmniRomExercise;
		const OmniRomExerciseId = exercise?.OmniRomExerciseId;
		if (lib) {
			tableData = {
				image: '',
				video: exercise?.exerciseLibrary?.video || '',
				name: exercise?.exerciseLibrary?.title || '',
				description: exercise?.exerciseLibrary?.description || '',
			};
		} else if (omni) {
			tableData = {
				image: exercise?.strapiOmniRomExercise?.image?.url || '',
				video: exercise?.strapiOmniRomExercise?.video?.url || '',
				name: exercise?.strapiOmniRomExercise?.name || '',
				description: exercise?.strapiOmniRomExercise?.description || '',
			};
		} else if (OmniRomExerciseId) {
			tableData = {
				image: exercise?.OmniRomExerciseId?.image?.url || '',
				video: exercise?.OmniRomExerciseId?.video?.url || '',
				name: exercise?.OmniRomExerciseId?.name || '',
				description: exercise?.OmniRomExerciseId?.description || '',
			};
		} else {
			tableData = {
				image: exercise?.image || '',
				video: exercise?.video || '',
				name: exercise.name || '',
				description: exercise.description || '',
			};
		}
		setDisplayData(tableData);
	};

	return (
		<Flex
			align="center"
			className="exercise-item-container"
			key={exercise.id}
			style={style}>
			<Flex
				ref={setNodeRef}
				{...listeners}
				{...attributes}
				className="drag-handle"
				align="center"
				justify="center">
				<MenuOutlined />
			</Flex>
			<div
				className="exercise-content-wrapper"
				onClick={e => e.stopPropagation()}>
				<Flex className="exercise-info-section" gap={8} align="center">
					<div
						className="exercise-image-container"
						onClick={e => {
							e.preventDefault();
							e.stopPropagation();
							setSelectedExercise({
								video: displayData?.video,
								name: displayData?.name,
								description: displayData?.description,
							});
							setVideoModalOpen(true);
						}}>
						<div className="image-wrapper">
							{displayData?.image ? (
								<img src={displayData?.image} className="edit-rom-image" />
							) : (
								<video
									src={displayData?.video}
									controls={false}
									className="exercise-video"
								/>
							)}
							<div className="play-button-css addon-top">
								<UntitledIcon name="playCircle" size={50} />
							</div>
						</div>
					</div>
					<Paragraph className="exercise-name">{displayData?.name}</Paragraph>
				</Flex>
				<Flex justify="flex-end" align="center">
					<Flex vertical className="transition-time-container">
						<Paragraph className="transition-time-label">
							{t('Patient.data.vitalscan-rom.transitionTime')}
						</Paragraph>
						<Flex>
							<Select
								className="transition-time-select"
								bordered={false}
								onChange={e =>
									updatePropertyAtIndex(index, parseInt(e), 'transitionTime')
								}
								value={exercise?.transitionTime?.toString() || '3'}>
								<Option value="3">3 {t('Patient.data.vitalscan-rom.secs')}</Option>
								<Option value="5">5 {t('Patient.data.vitalscan-rom.secs')}</Option>
								<Option value="8">8 {t('Patient.data.vitalscan-rom.secs')}</Option>
								<Option value="0">{t('Patient.data.vitalscan-rom.manual')}</Option>
							</Select>
						</Flex>
					</Flex>
				</Flex>
			</div>
			{length > 1 && (
				<Flex
					className="remove-button-container"
					align="center"
					justify="center">
					<MdAdd
						onClick={() => handleRemoveExercise(exercise?.id)}
						className="remove-exercise-icon"
					/>
				</Flex>
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
		</Flex>
	);
};
