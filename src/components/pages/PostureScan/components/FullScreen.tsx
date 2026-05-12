import { Tooltip } from 'antd';
import { MdFullscreen, MdFullscreenExit } from 'react-icons/md';
import { UseFullScreen } from '../context/FullScreen.context';
import { Divider } from 'antd';

function FullScreen() {
	const { isFullScreen, onFullScreen } = UseFullScreen();

	return (
		<>
			<Divider
				type="vertical"
				style={{ height: '34px', borderColor: 'var(--border-primary)' }}
			/>
			<Tooltip title={'Fullscreen'}>
				{isFullScreen ? (
					<MdFullscreenExit
						size={30}
						style={{
							verticalAlign: 'middle',
							cursor: 'pointer',
							color: 'var(--text-tertiary)',
						}}
						onClick={onFullScreen}
					/>
				) : (
					<MdFullscreen
						size={30}
						style={{
							verticalAlign: 'middle',
							cursor: 'pointer',
							color: 'var(--text-tertiary)',
						}}
						onClick={onFullScreen}
					/>
				)}
			</Tooltip>
		</>
	);
}

export default FullScreen;
