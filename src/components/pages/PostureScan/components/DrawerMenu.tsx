import { Drawer, List, Typography } from 'antd';
import { MdCheck } from 'react-icons/md';
import { UseMenu } from '../context/Menu.context';
import { UseFullScreen } from '../context/FullScreen.context';
import { UseControls } from '../context/Controls.context';

function ListHeader() {
	return (
		<Typography.Title
			level={5}
			style={{
				padding: '0 var(--spacing-2-5) 0 var(--spacing-10)',
				margin: 0,
				color: 'var(--text-color-on-dark)',
			}}>
			POSTURES
		</Typography.Title>
	);
}

function DrawerMenu() {
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
		<Drawer
			placement="left"
			closable={false}
			onClose={onToggleMenu}
			open={isMenuOpened}
			getContainer={false}
			forceRender={isFullScreen}
			style={{ height: isMenuOpened ? '100%' : 0 }}
			styles={{ body: { padding: 0, backgroundColor: 'var(--onboard-button-color)' } }}>
			<List
				style={{ height: '100%', maxHeight: '100%' }}
				header={<ListHeader />}
				dataSource={positions || []}
				renderItem={(item, index) => {
					const isCompleted = item?.completed;

					return (
						<List.Item
							style={{
								padding: 'var(--spacing-2-5) var(--spacing-5) var(--spacing-2-5) var(--spacing-10)',
								borderColor: 'var(--border-secondary-on-dark)',
								cursor: onGetCurrent(true) !== index ? 'pointer' : 'default',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
							onClick={() => onSelect(index)}>
							<Typography.Text
								style={{ color: isCompleted ? 'var(--text-color-on-dark)' : 'var(--text-tertiary-on-dark)' }}
								className="flex items-center justify-center">
								{item?.name?.toUpperCase()}
							</Typography.Text>
							{isCompleted && (
								<MdCheck className="exercise-check md-icon" size="24px" />
							)}
						</List.Item>
					);
				}}
			/>
		</Drawer>
	);
}

export default DrawerMenu;
