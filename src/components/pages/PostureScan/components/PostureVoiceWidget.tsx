import { Slider } from 'antd';
import { BiVolumeFull, BiVolumeMute } from 'react-icons/bi';
import { UsePostureScreenAudio } from '../context/PostureScreen.context';

const PostureVoiceWidget = ({ inline = false }: { inline?: boolean }) => {
	const { volume, setVolume, muted, setMuted } = UsePostureScreenAudio();

	const wrapperStyle = inline
		? {
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				width: '100%',
				justifyContent: 'center',
				borderRadius: 8,
				pointerEvents: 'auto',
				zIndex: 999999,
			}
		: {
				position: 'absolute',
				bottom: 10,
				right: 20,
				display: 'flex',
				alignItems: 'center',
				gap: 12,
				zIndex: 999999,
				pointerEvents: 'auto',
			};

	return (
		<div style={wrapperStyle}>
			{muted ? (
				<BiVolumeMute
					color="white"
					size={24}
					onClick={() => setMuted(false)}
					style={{ cursor: 'pointer' }}
				/>
			) : (
				<BiVolumeFull
					color="white"
					size={24}
					onClick={() => setMuted(true)}
					style={{ cursor: 'pointer' }}
				/>
			)}

			<Slider
				min={0}
				max={100}
				step={1}
				value={muted ? 0 : volume}
				onChange={val => {
					setVolume(val);
					if (val > 0) setMuted(false);
					else setMuted(true);
				}}
				style={{ width: 150 }}
			/>
		</div>
	);
};

export default PostureVoiceWidget;
