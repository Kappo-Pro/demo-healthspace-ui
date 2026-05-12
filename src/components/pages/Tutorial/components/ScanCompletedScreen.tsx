import {
	CheckCircleTwoTone,
	HomeOutlined,
	RedoOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Tag, Typography } from 'antd';

import React, { useEffect } from 'react';
import {
	DEFAULT_ASSISTANT,
	Guide,
} from './cameraComponent/component/TutorialConstants';
import { useGlobalSpeech } from './cameraComponent/context/SpeechContext';
import { UseTutorialControls } from './cameraComponent/context/TutorialControls.context';

const { Title, Text } = Typography;

interface Props {
	onRestart: () => void;
}

const ScanCompletedScreen: React.FC<Props> = ({ onRestart }) => {
	const { speakText, cancelSpeech } = useGlobalSpeech();
	const { clearCompletedScans, results, clearResults } = UseTutorialControls();

	const selectedAssistant = DEFAULT_ASSISTANT;
	const voiceName = DEFAULT_ASSISTANT.voiceName;
	const rate = 1;

	useEffect(() => {
		clearCompletedScans();
		if (voiceName && selectedAssistant) {
			speakText(Guide.finished, voiceName, rate);
		}
		return () => cancelSpeech();
	}, []);

	const strokeFor = (angle: number, wfl: number, min: number) => {
		if (angle >= wfl) return 'var(--color-green-6)';
		if (angle >= min) return 'var(--color-gold-6)';
		return 'var(--color-red-5)';
	};

	return (
		<div style={{ padding: 'var(--spacing-8)', display: 'flex', justifyContent: 'center' }}>
			<Card
				style={{
					width: '100%',
					maxWidth: 800,
					textAlign: 'center',
					borderRadius: 12,
					boxShadow: '0 4px 16px var(--color-black-alpha-10)',
					padding: 'var(--spacing-12)',
				}}>
				<CheckCircleTwoTone twoToneColor="var(--color-green-6)" style={{ fontSize: 72 }} />
				<Title level={2} style={{ marginTop: 24 }}>
					Congratulations!
				</Title>
				<Text style={{ fontSize: 18 }}>
					You've successfully completed the entire VitalFlow tutorial tour.
					Great job following through the exercises with{' '}
					{selectedAssistant?.name}!
				</Text>
				<Row gutter={[16, 16]}>
					{results.map(r => (
						<Col key={r.id} xs={24} sm={12} lg={8}>
							<Card
								hoverable
								style={{ borderRadius: 12, overflow: 'hidden' }}
								bodyStyle={{ padding: 16 }}
								cover={
									<img
										src={r.imageSrc}
										alt={`${r.name} snapshot`}
										style={{
											display: 'block',
											width: '100%',
											height: 180,
											objectFit: 'cover',
										}}
									/>
								}>
								<Title level={4} style={{ marginBottom: 8 }}>
									{r.name}
								</Title>

								<div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
									<div>
										<Text type="secondary">WFL:</Text> &nbsp;<b>{r.wfl}°</b>
									</div>
									<div>
										<Text type="secondary">Min:</Text> &nbsp;<b>{r.min}°</b>
									</div>
									{typeof r.normal === 'number' && (
										<div>
											<Text type="secondary">Normal:</Text> &nbsp;
											<b>{r.normal}°</b>
										</div>
									)}
								</div>

								<Tag
									color={strokeFor(r.angle, r.wfl, r.min)}
									style={{
										fontSize: 16,
										padding: '6px 12px',
										borderRadius: 999,
									}}>
									Score: <b style={{ marginLeft: 6 }}>{r.angle.toFixed(0)}°</b>
								</Tag>
							</Card>
						</Col>
					))}
				</Row>

				<div style={{ marginTop: 32 }}>
					<Button
						type="primary"
						icon={<RedoOutlined />}
						size="large"
						onClick={onRestart}
						style={{
							backgroundColor: 'var(--color-purple-700)',
							borderColor: 'var(--color-purple-700)',
							marginRight: 12,
						}}>
						Restart Tour
					</Button>

					<Button
						icon={<HomeOutlined />}
						size="large"
						onClick={() => (window.location.href = '/')}>
						Go to Home
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default ScanCompletedScreen;
