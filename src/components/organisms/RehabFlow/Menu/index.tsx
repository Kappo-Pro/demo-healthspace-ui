
import { useTypedDispatch, useTypedSelector } from '@stores/index'
import { goToExercise } from '@stores/clinical/rehab/main'
import { Flex, List, Spin, Typography } from 'antd'
import { UntitledIcon } from '@atoms/Icon'
import { IRehabExercisesLibrary } from '@types'
import { useTranslation } from 'react-i18next'

interface IExerciseListMenu {
	onToggleMenu: () => void
}

function Menu(props: IExerciseListMenu) {
	const { onToggleMenu } = props
	const dispatch = useTypedDispatch()
	const {t} = useTranslation()
	const {
		exercises,
		exercisesCompleted,
		currentExercise
	} = useTypedSelector((state) => state.rehab.main)

	const onClickMenu = (exercise: IRehabExercisesLibrary) => {
		if (currentExercise?.id !== exercise.id) {
			onToggleMenu()
			dispatch(goToExercise(exercise))
		}
	}

	if (!exercises) {
		return (
			<Flex
				justify="center"
				align="center"
				className="w-full h-full" style={{
					backgroundColor: 'var(--surface-primary)b8',
					maxHeight: '100%' }}>
				<Spin
					spinning
					size={'large'}
				/>
			</Flex>
		)
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
						color: 'var(--surface-primary)80',
					}}
				>
					{t('Patient.data.vitalscan-rom.exercises')}
				</Typography.Title>
			}
			dataSource={exercises || []}
			renderItem={(exercise) => {
				const isDone = exercisesCompleted?.find(
					(exer) => (exer?.id === exercise?.id) || (exer?.rehabExerciseToPatientId === exercise?.id)
				)
				return (
					<List.Item
						style={{
							padding: 'var(--spacing-2-5) var(--spacing-5) var(--spacing-2-5) var(--spacing-10)',
							borderColor: 'var(--surface-primary)33',
							cursor: currentExercise?.id !== exercise.id ? 'pointer' : 'default',
						}}
						onClick={() => onClickMenu(exercise)}
					>
						<Typography.Text
							style={{ color: isDone ? 'var(--surface-primary)' : 'var(--surface-primary)80' }}
						>
							{exercise?.rehabExercisesLibrary &&
								exercise?.rehabExercisesLibrary?.title?.toUpperCase()}
							{!exercise.rehabExercisesLibrary &&
								exercise?.strapiExercise?.name?.toUpperCase()}
						</Typography.Text>
						{isDone && <UntitledIcon
							name="check"
							size={20}
							className="exercise-check md-icon"
						/>}
					</List.Item>
				)
			}}
		/>
	)
}

export default Menu
