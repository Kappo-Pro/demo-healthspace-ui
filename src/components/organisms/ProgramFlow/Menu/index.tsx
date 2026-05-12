
import { useTypedDispatch, useTypedSelector } from '@stores/index'
import { UntitledIcon } from '@atoms/Icon';
import { UserListSkeleton } from '@atoms/Skeletons'
import { List, Typography } from 'antd'

import { IProgramExercise } from '@types'
import { useTranslation } from 'react-i18next'
import { goToExercise } from '@stores/shared/patientDetail/program'

function Menu({ onToggleMenu }: { onToggleMenu: () => void }) {
	const dispatch = useTypedDispatch()
	const { t } = useTranslation()
	const { exercises, currentExercise, completedExercises } = useTypedSelector((state) => state.patientDetail.program.main)

	const onClickMenu = (exercise: IProgramExercise) => {
		if (currentExercise?.id !== exercise.id) {
			onToggleMenu()
			dispatch(goToExercise(exercise))
		}
	}

	if (!exercises) {
		return <UserListSkeleton count={6} />;
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
				const isDone = completedExercises.find(exer => exer.id == exercise.id)
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
							{exercise?.name ? <>
							{exercise?.name?.toUpperCase()}
							</>:<>{exercise?.exerciseLibrary?.title?.toUpperCase()}</>}
						</Typography.Text>
						{isDone && <UntitledIcon name="check" size={20} />}
					</List.Item>
				)
			}}
		/>
	)
}

export default Menu
