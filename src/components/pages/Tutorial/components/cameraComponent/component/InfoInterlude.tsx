import { InfoCircleFilled } from '@ant-design/icons';
import { Button } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
	seconds?: number;
	onComplete: () => void;
	title?: string;
	subtitle?: string;
};

export default function InfoInterlude({
	seconds = 5,
	onComplete,
	title,
	subtitle,
}: Props) {
	const [remain, setRemain] = useState(seconds);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	useEffect(() => setRemain(seconds), [seconds]);

	useEffect(() => {
		if (remain <= 0) {
			handleComplete();
			return;
		}
		const id = setTimeout(() => setRemain(r => r - 1), 1000);
		return () => clearTimeout(id);
	}, [remain]);

	const startCamera = useCallback(async () => {
		try {
			streamRef.current = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1280 },
					height: { ideal: 720 },
					facingMode: 'user',
				},
				audio: false,
			});
			if (videoRef.current) {
				videoRef.current.srcObject = streamRef.current;
				await videoRef.current.play().catch(() => {});
			}
		} catch (e) {
			console.warn('Camera unavailable:', e);
		}
	}, []);

	const stopCamera = useCallback(() => {
		streamRef.current?.getTracks().forEach(t => t.stop());
		streamRef.current = null;
	}, []);

	useEffect(() => {
		startCamera();
		return stopCamera;
	}, [startCamera, stopCamera]);

	const handleComplete = useCallback(() => {
		stopCamera();
		onComplete();
	}, [stopCamera, onComplete]);

	return (
		<div className="cs-info" style={{ background: 'transparent' }}>
			<video
				ref={videoRef}
				playsInline
				muted
				autoPlay
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					zIndex: 1,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'var(--color-black-alpha-45)',
					zIndex: 2,
				}}
			/>
			<div className="cs-info__card" style={{ zIndex: 3 }}>
				<img
					src={`/ai-agents/chair.png`}
					alt="Chair instruction"
					style={{
						width: 'clamp(180px, 35vw, 300px)',
						height: 'auto',
						objectFit: 'contain',
					}}
				/>
				<div className="cs-info__title">
					<InfoCircleFilled style={{ fontSize: 'clamp(32px, 3.5vw, 50px)' }} />
					<span>{title}</span>
				</div>
				<div className="cs-info__subtitle">{subtitle}</div>
				<div className="cs-info__count" aria-live="polite">
					{remain}
				</div>
				<Button type="primary" size="large" onClick={handleComplete}>
					Start now
				</Button>
			</div>
		</div>
	);
}
