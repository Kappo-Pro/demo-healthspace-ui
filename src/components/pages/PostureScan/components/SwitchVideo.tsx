import { Divider, Tooltip } from 'antd';
import { MdOutlineSwitchCamera } from 'react-icons/md';
import { UseSwitchVideo } from '../context/SwitchVideo.context';

function SwitchVideo() {
	const { isSwitchMode, onSwitchCamera } = UseSwitchVideo();

	if (!isSwitchMode) return null;

	return (
		<>
			<Divider
				type="vertical"
				style={{ height: '34px', borderColor: 'var(--color-gray-900)' }}
			/>
			<Tooltip title={'Switch Camera'}>
				<MdOutlineSwitchCamera
					size={30}
					style={{
						verticalAlign: 'middle',
						cursor: 'pointer',
					}}
					onClick={onSwitchCamera}
					color="var(--color-gray-600)"
				/>
			</Tooltip>
		</>
	);
}

export default SwitchVideo;
