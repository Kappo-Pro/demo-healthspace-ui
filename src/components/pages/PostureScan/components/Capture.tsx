import { memo } from 'react';
import Mediapipe from './Mediapipe';

function Capture() {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'block',
				zIndex: 2,
				position: 'relative',
			}}>
			<Mediapipe />

			{/* <div
				style={{
					position: 'absolute',
					top: 0,
					right: 0,
					background: .var(--bg-overlay).,
					padding: '10px',
					borderRadius: '5px',
					zIndex: 20,
					display: 'flex',
					flexDirection: 'column',
					gap: '5px',
				}}>
				<p
					style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
					Facing: {personOrientation && personOrientation}
				</p>
				<p
					style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
					Transition: {transition && JSON.stringify(transition?.value)}
				</p>
			</div> */}
		</div>
	);
}

export default memo(Capture);
