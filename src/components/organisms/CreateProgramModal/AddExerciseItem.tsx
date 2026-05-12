import { showCustomModal } from '@atoms/CustomModalInfo';
import { UntitledIcon } from '@atoms/Icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IProgramExercise } from '@types';
import { Button, Flex, Input, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Paragraph } = Typography;

interface AddExerciseItemProps {
	length: number;
	updatePropertyAtIndex: (
		index: number,
		newReps: number,
		property: string,
	) => void;
	index: number;
	exercise: IProgramExercise;
	id: string;
	handleRemoveExercise: (id: number | string) => void;
}

export const AddExerciseItem = ({
	length,
	exercise,
	index,
	id,
	updatePropertyAtIndex,
	handleRemoveExercise,
}: AddExerciseItemProps) => {
	const { t } = useTranslation();
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id });

	const style = {
		transition,
		transform: CSS.Transform.toString(transform),
	};

	return (
		<Flex
			justify="space-between"
			align="center"
			className="relative"
			key={exercise.id}
			style={style}
			{...attributes}>
			<Flex
				ref={setNodeRef}
				{...listeners}
				className="p-1 h-[95px]"
				align="center"
				justify="center"
				style={{
					backgroundColor: 'var(--default-menu-color)',
					cursor: 'grab',
				}}>
				<div className="survey-image-css">
					<img src="/images/menu.svg" />
				</div>
			</Flex>
			<div className="bg-gray-50 my-2 p-2 grid grid-cols-6 gap-4 items-center">
				<Flex className="col-span-2" gap={8} align="center">
					<div
						className="custom-image-container"
						style={{ width: 'var(--spacing-20)' }}
						onClick={e => {
							e.stopPropagation();
							showCustomModal({
								video: exercise?.video
									? exercise?.video
									: exercise?.exerciseLibrary?.videoUrl,
								name: exercise?.name
									? exercise?.name
									: exercise?.exerciseLibrary?.title,
								description: exercise?.description
									? exercise?.description
									: exercise?.exerciseLibrary?.description || 'N/A',
							});
						}}>
						{exercise?.image ? (
							<div className="image-wrapper w-20 h-20 flex-shrink-0">
								<img
									src={exercise?.image}
									className="w-20 h-20 border border-primary-200"
									alt=""
								/>
								<div className="play-button">
									<UntitledIcon name="playCircle" />
								</div>
							</div>
						) : (
							<div className="image-wrapper w-20 h-20 flex-shrink-0">
								<video
									src={
										exercise?.video
											? exercise?.video
											: exercise?.exerciseLibrary?.videoUrl
									}
									controls={false}
									className="rounded-lg w-full h-full"
								/>
								<div className="play-button">
									<UntitledIcon name="playCircle" size={50} />
								</div>
							</div>
						)}
					</div>
					<span className="col-span-1 mx-3 font-semibold text-black">
						{exercise?.name ? exercise?.name : exercise?.exerciseLibrary?.title}
					</span>
				</Flex>
				<div
					className="col-span-1 text-black"
					style={{ fontSize: 'var(--font-size-xs)' }}>
					<label>
						*
						{t('Admin.data.menu.patientDetail.aiAssistantPrograms.repititions')}
					</label>
					<Input
						type="number"
						className="w-full"
						placeholder={t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.repititions',
						)}
						defaultValue={
							exercise?.name ? exercise?.reps : exercise?.exerciseLibrary?.reps
						}
						onChange={e =>
							updatePropertyAtIndex(index, parseInt(e.target.value), 'reps')
						}
					/>
					{(exercise?.reps > 100 || exercise?.reps < 1) && (
						<Paragraph className="text-xs h-12 text-red-400">
							{t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.repititions',
							)}{' '}
							{t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.validationRange',
							)}
						</Paragraph>
					)}
				</div>
				<div
					className="col-span-1 text-black"
					style={{ fontSize: 'var(--font-size-xs)' }}>
					<label>
						*
						{t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerSession',
						)}
					</label>
					<Input
						type="number"
						className="w-full"
						placeholder={t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerSession',
						)}
						defaultValue={
							exercise?.name ? exercise?.sets : exercise?.exerciseLibrary?.sets
						}
						onChange={e =>
							updatePropertyAtIndex(index, parseInt(e.target.value), 'sets')
						}
					/>
					{(exercise?.sets > 100 || exercise?.sets < 1) && (
						<Paragraph className="text-xs h-12 text-red-400">
							{t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerSession',
							)}{' '}
							{t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.validationRange',
							)}
						</Paragraph>
					)}
				</div>
				<div
					className="col-span-1 text-black"
					style={{ fontSize: 'var(--font-size-xs)' }}>
					<label>
						*{t('Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerDay')}
					</label>
					<Input
						type="number"
						className="w-full"
						placeholder={t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerDay',
						)}
						defaultValue={
							exercise?.name
								? exercise?.dailyReps
								: exercise?.exerciseLibrary?.dailyReps
						}
						onChange={e =>
							updatePropertyAtIndex(
								index,
								parseInt(e.target.value),
								'dailyReps',
							)
						}
					/>
					{(exercise?.dailyReps > 100 || exercise?.dailyReps < 1) && (
						<Paragraph className="text-xs h-12 text-red-400">
							{t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerDay',
							)}{' '}
							{t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.validationRange',
							)}
						</Paragraph>
					)}
				</div>
				<div
					className="col-span-1 text-black"
					style={{ fontSize: 'var(--font-size-xs)' }}>
					<label>
						*
						{t('Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerWeek')}
					</label>
					<Input
						type="number"
						className="w-full"
						placeholder={t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerWeek',
						)}
						defaultValue={
							exercise?.name
								? exercise?.weeklyReps
								: exercise?.exerciseLibrary?.weeklyReps
						}
						onChange={e =>
							updatePropertyAtIndex(
								index,
								parseInt(e.target.value),
								'weeklyReps',
							)
						}
					/>
					{(exercise?.weeklyReps > 100 || exercise?.weeklyReps < 1) && (
						<Paragraph className="text-xs h-12 text-red-400">
							{t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.setsPerWeek',
							)}{' '}
							{t(
								'Admin.data.menu.patientDetail.aiAssistantPrograms.validationRange',
							)}
						</Paragraph>
					)}
				</div>
			</div>
			{length > 1 && (
				<Button
					type="text"
					danger
					size="large"
					onClick={e => {
						e.stopPropagation();
						e.preventDefault();
						// Try both the id prop and exercise.id
						handleRemoveExercise(exercise?.id || id);
					}}
					icon={<UntitledIcon name="closeCircle" />}
					style={{
						height: '95px',
						width: '60px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				/>
			)}
		</Flex>
	);
};
