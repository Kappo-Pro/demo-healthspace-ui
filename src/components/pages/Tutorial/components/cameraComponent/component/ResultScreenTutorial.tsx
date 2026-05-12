import { Progress, Typography } from 'antd';
import { useEffect } from 'react';
import { useGlobalSpeech } from '../context/SpeechContext';

const { Title, Text } = Typography;

type Props = {
	imageSrc?: string | null;
	isSaving?: boolean;
	percent?: number;
	statusText?: string;
};

export default function ResultScreenTutorial({
	imageSrc,
	isSaving = true,
	percent,
	statusText = 'Finalizing your results…',
}: Props) {
	const isIndeterminate = typeof percent !== 'number' || Number.isNaN(percent);

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				zIndex: 3,
				width: '100%',
				height: '100%',
				background: ' rgba(130, 80, 255, 0.75)',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				overflow: 'hidden',
				padding: 24,
			}}>
			<div
				style={{
					width: '80%',
					borderRadius: 24,
					padding: 24,
				}}>
				<div style={{ textAlign: 'center', marginBottom: 16 }}>
					<Title
						level={3}
						style={{ color: 'var(--color-white)', margin: 0, fontWeight: 'var(--font-weight-bold)' }}>
						Preparing Your Results
					</Title>
				</div>

				<div style={{ display: 'grid', gap: 18, justifyItems: 'center' }}>
					<div
						style={{
							aspectRatio: '4 / 3',
							borderRadius: 16,
							overflow: 'hidden',
							position: 'relative',
						}}>
						{imageSrc ? (
							<img
								src={imageSrc}
								alt="Captured posture"
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									display: 'block',
								}}
							/>
						) : (
							<div
								style={{
									position: 'absolute',
									inset: 0,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: 'rgba(255,255,255,0.7)',
									fontSize: 18,
								}}>
								No snapshot available.
							</div>
						)}
					</div>

					<div style={{ width: 'min(72vw, 560px)' }}>
						<div style={{ marginBottom: 6, textAlign: 'center' }}>
							<Text style={{ color: 'var(--color-white)', fontWeight: 'var(--font-weight-semibold)', fontSize: 20 }}>
								{statusText}
							</Text>
						</div>

						{isSaving ? (
							isIndeterminate ? (
								<Progress percent={99} status="active" showInfo={false} />
							) : (
								<Progress
									percent={Math.max(0, Math.min(100, Math.round(percent)))}
									status="active"
								/>
							)
						) : (
							<Progress percent={100} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
