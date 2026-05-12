import { Flex } from 'antd';
import './style.css';

export default function MyProgramUnavailableScreen() {
	return (
		<div className="program-unavailable-banner">
			<Flex gap={20} className="program-unavailable-content-inner">
				<img
					src="/images/dashboard/program-unavailable.svg"
					alt="paused-program"
					style={{
						width: '120px',
						height: '120px',
					}}
				/>
				<div>
					<h3 className="program-unavailable-title">
						Programs Temporarily Unavailable
					</h3>
					<p className="program-unavailable-description">
						We've paused your exercise program since you reported pain or an
						injury. Your VitalFlow coach will review your condition and create a
						new plan for your recovery. Take care, and we'll get you back on
						track soon!
					</p>
				</div>
			</Flex>
		</div>
	);
}
