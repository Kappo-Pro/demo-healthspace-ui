import { UseControls } from '@pages/PostureScan/context/Controls.context';
import { UseFullScreen } from '@pages/PostureScan/context/FullScreen.context';
import { UseMenu } from '@pages/PostureScan/context/Menu.context';
import { Drawer, List, Spin, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
	MovementExercise,
	UseTutorialControls,
} from '../context/TutorialControls.context';

interface IExerciseListMenu {
	onToggleMenu: () => void;
}

const TutorialExerciseListMenu = (props: IExerciseListMenu) => {
	const { onToggleMenu } = props;
	// const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	// const { exercises, resultsExercises, currentExercise } = useTypedSelector(
	// 	state => state.rom.main,
	// );
	const { exerciseList, selectedScan, setSelectedScan } = UseTutorialControls();
	const onClickMenu = (exercise: MovementExercise) => {
		if (selectedScan?.id !== exercise.id) {
			onToggleMenu();
			setSelectedScan(exercise);

			// dispatch(goToExercise(exercise));
		}
	};

	if (!exerciseList) {
		return (
			<Spin
				spinning
				size={'large'}
				style={{
					backgroundColor: 'var(--color-white-alpha-70)',
					height: '100%',
					maxHeight: '100%',
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			/>
		);
	}

	return (
		<List
			style={{
				height: '100%',
				maxHeight: '100%',
			}}
			header={
				<Typography.Title
					level={5}
					style={{
						padding: '0 var(--spacing-2-5) 0 var(--spacing-10)',
						margin: 0,
						color: 'var(--color-white)',
					}}>
					{t('Patient.data.vitalscan-rom.exercises')}
				</Typography.Title>
			}
			dataSource={exerciseList || []}
			renderItem={exercise => {
				const isSelected = selectedScan?.id === exercise.id;
				return (
					<List.Item
						style={{
							padding: 'var(--spacing-2-5) var(--spacing-5) var(--spacing-2-5) var(--spacing-10)',
							borderColor: 'var(--color-white-alpha-20)',
							cursor: !isSelected ? 'pointer' : 'default',
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
						onClick={() => onClickMenu(exercise)}>
						<Typography.Text
							// style={{ color: 'white' }}
							style={{
								color: isSelected
									? 'var(--color-white)'
									: 'var(--color-white-alpha-50)',
							}}
							className="flex items-center justify-center">
							{(exercise?.name ? exercise.name : '')?.toUpperCase()}
						</Typography.Text>
						{/* {isCompleted && (
							<MdCheck className="exercise-check md-icon" size="24px" />
						)} */}
					</List.Item>
				);
			}}
		/>
	);
};

function TutorialMenu() {
	const { isMenuOpened, onToggleMenu } = UseMenu();
	const { isFullScreen } = UseFullScreen();
	const { positions, onGetCurrent, onNext } = UseControls();

	const onSelect = (index: number) => {
		if (onGetCurrent(true) !== index) {
			onNext(index);
			onToggleMenu();
		}
	};

	return (
		<>
			<Drawer
				placement="left"
				closable={false}
				onClose={onToggleMenu}
				open={isMenuOpened}
				getContainer={false}
				forceRender={isFullScreen}
				className={`${isMenuOpened ? 'h-full' : 'h-0'}`}
				bodyStyle={{
					padding: 0,
					backgroundColor: 'var(--onboard-button-color)',
					...(!isFullScreen && { aspectRatio: '4/2' }),
				}}>
				<TutorialExerciseListMenu onToggleMenu={onToggleMenu} />
			</Drawer>
		</>
	);
}

export default TutorialMenu;
