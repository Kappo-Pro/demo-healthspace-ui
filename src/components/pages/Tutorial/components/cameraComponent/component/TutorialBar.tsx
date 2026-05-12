import { ArrowLeftOutlined } from '@ant-design/icons';
import Controls from '@pages/PostureScan/components/Controls';
import FullScreen from '@pages/PostureScan/components/FullScreen';
import SwitchVideo from '@pages/PostureScan/components/SwitchVideo';
import { UseTutorialControls } from '@pages/Tutorial/components/cameraComponent/context/TutorialControls.context';
import { Button, Col, Menu, Row } from 'antd';

interface TutorialBarProps {
	isDashboard?: boolean;
	onBack: () => void;
}

function TutorialBar({ isDashboard, onBack }: TutorialBarProps) {
	const { selectedScan } = UseTutorialControls();
	return (
		<Row
			align="middle"
			justify="space-between"
			style={{
				height: '35px',
				backgroundColor: 'var(--color-black)',
				padding: '0 var(--spacing-2)',
			}}>
			<Col flex="auto">
				<Row align="middle" gutter={8}>
					<Col>
						<Button
							type="text"
							icon={<ArrowLeftOutlined />}
							onClick={onBack}
							style={{
								color: 'var(--color-white)',
								display: 'flex',
								alignItems: 'center',
								padding: '0 var(--spacing-2)',
							}}>
							Back
						</Button>
					</Col>
					{selectedScan && (
						<Col>
							<div
								style={{
									color: 'var(--color-white)',
									display: 'flex',
									alignItems: 'center',
									padding: '0 var(--spacing-2)',
								}}>
								{selectedScan?.bodySideTitle} {selectedScan?.movementTitle}
							</div>
						</Col>
					)}
					<Col>
						<Menu />
					</Col>
				</Row>
			</Col>

			<Col>
				<Row align="middle" gutter={4}>
					<Controls isDashboard={isDashboard} />
					<FullScreen />
					<SwitchVideo />
				</Row>
			</Col>
		</Row>
	);
}

export default TutorialBar;
