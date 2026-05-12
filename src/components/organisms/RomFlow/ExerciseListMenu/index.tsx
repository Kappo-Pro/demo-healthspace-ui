import { UntitledIcon } from '@atoms/Icon';
import { goToExercise } from '@stores/clinical/rom/main';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { RomProgramExercise } from '@types';
import { Flex, List, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

interface IExerciseListMenu {
	onToggleMenu: () => void;
}

const ExerciseListMenu = (props: IExerciseListMenu) => {
	const { onToggleMenu } = props;
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const { exercises, resultsExercises, currentExercise } = useTypedSelector(
		state => state.rom.main,
	);

	const onClickMenu = (exercise: RomProgramExercise) => {
		if (currentExercise?.id !== exercise.id) {
			onToggleMenu();
			dispatch(goToExercise(exercise));
		}
	};

	if (!exercises) {
		return (
			<Flex
				justify="center"
				align="center"
				className="w-full h-full"
				style={{
					backgroundColor: 'var(--surface-primary)',
					maxHeight: '100%',
				}}>
				<Spin spinning size={'large'} />
			</Flex>
		);
	}

	return (
		<List
			className="h-full"
			style={{
				maxHeight: '100%',
			}}
			header={
				<Typography.Title
					level={5}
					style={{
						padding: '0 var(--spacing-2-5) 0 var(--spacing-10)',
						margin: 0,
						color: 'var(--text-primary)',
					}}>
					{t('Patient.data.vitalscan-rom.exercises')}
				</Typography.Title>
			}
			dataSource={exercises || []}
			renderItem={exercise => {
				const isCompleted = resultsExercises.find(
					exer => exer?.id === exercise?.id,
				);
				return (
					<List.Item
						style={{
							padding: 'var(--spacing-2-5) var(--spacing-5) var(--spacing-2-5) var(--spacing-10)',
							borderColor: 'var(--border-default)',
							backgroundColor:
								currentExercise?.id === exercise.id
									? 'var(--primary-100)'
									: 'transparent',
							cursor:
								currentExercise?.id !== exercise.id ? 'pointer' : 'default',
						}}
						onClick={() => onClickMenu(exercise)}>
						<Flex justify="space-between" align="center" className="w-full">
							<Typography.Text
								style={{
									color: isCompleted
										? 'var(--text-primary)'
										: 'var(--text-secondary)',
								}}>
								{(exercise?.name
									? exercise?.name
									: exercise?.title
								)?.toUpperCase()}
							</Typography.Text>
							{isCompleted && (
								<UntitledIcon
									name="check"
									size={20}
									className="exercise-check md-icon"
								/>
							)}
						</Flex>
					</List.Item>
				);
			}}
		/>
	);
};

export default ExerciseListMenu;
