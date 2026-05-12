/**
 * Photogrammetry Capture Component
 *
 * Multi-angle photo capture interface for photogrammetry-based 3D reconstruction.
 * Guides user through 8-12 photo capture sequence around subject.
 *
 * @module organisms/OPhotogrammetryCapture
 * @since EPIC-001-S14
 *
 * @example
 * ```tsx
 * import { PhotogrammetryCapture } from '@organisms/OPhotogrammetryCapture';
 *
 * <PhotogrammetryCapture
 *   onComplete={(photos) => handlePhotos(photos)}
 *   onCancel={handleCancel}
 *   targetPhotoCount={12}
 *   angleIncrement={30}
 * />
 * ```
 */

import React, { useRef, useState, useEffect } from 'react';
import { Button, Space, Typography, Progress, Card, Alert } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { CapturePhoto } from '../../../services/photogrammetry/types';
import styled from 'styled-components';

const { Title, Text } = Typography;

/**
 * Styled Components
 */
const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 600px;
	background: var(--background-primary);
`;

const VideoContainer = styled.div`
	flex: 1;
	position: relative;
	background: var(--gray-900);
	border-radius: var(--border-radius-lg);
	overflow: hidden;
	margin-bottom: var(--spacing-4);
`;

const Video = styled.video`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

const Overlay = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
`;

const CircularGuide = styled.div<{ rotation: number }>`
	width: 300px;
	height: 300px;
	border: 3px dashed var(--brand-primary);
	border-radius: 50%;
	position: relative;
	transform: rotate(${props => props.rotation}deg);
	transition: transform 0.3s ease;

	&::after {
		content: '';
		position: absolute;
		top: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
		border-bottom: 20px solid var(--brand-primary);
	}
`;

const Controls = styled.div`
	padding: var(--spacing-4);
	background: var(--background-secondary);
	border-radius: var(--border-radius-lg);
`;

const PhotoGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
	gap: var(--spacing-2);
	margin-top: var(--spacing-3);
`;

const PhotoThumbnail = styled.div<{ captured: boolean }>`
	aspect-ratio: 1;
	background: ${props => (props.captured ? 'var(--success-100)' : 'var(--gray-200)')};
	border: 2px solid ${props => (props.captured ? 'var(--success-500)' : 'var(--gray-400)')};
	border-radius: var(--border-radius-md);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: 600;
	color: ${props => (props.captured ? 'var(--success-700)' : 'var(--gray-600)')};
`;

/**
 * Component Props
 */
export interface PhotogrammetryCaptureProps {
	/** Callback when capture is complete */
	onComplete: (photos: CapturePhoto[]) => void;
	/** Callback when user cancels */
	onCancel: () => void;
	/** Target number of photos to capture */
	targetPhotoCount?: number;
	/** Angle increment between photos (degrees) */
	angleIncrement?: number;
}

/**
 * Photogrammetry Capture Component
 *
 * Implements AC1: Multi-angle photo capture workflow.
 */
export const PhotogrammetryCapture: React.FC<PhotogrammetryCaptureProps> = ({
	onComplete,
	onCancel,
	targetPhotoCount = 12,
	angleIncrement = 30,
}) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [photos, setPhotos] = useState<CapturePhoto[]>([]);
	const [currentAngle, setCurrentAngle] = useState(0);
	const [isCapturing, setIsCapturing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * Initialize camera stream
	 */
	useEffect(() => {
		const initCamera = async () => {
			try {
				const mediaStream = await navigator.mediaDevices.getUserMedia({
					video: {
						width: { ideal: 1920 },
						height: { ideal: 1080 },
						facingMode: 'user',
					},
				});

				setStream(mediaStream);

				if (videoRef.current) {
					videoRef.current.srcObject = mediaStream;
				}
			} catch (err) {
				console.error('[PhotogrammetryCapture] Camera init error:', err);
				setError('Failed to access camera. Please grant camera permissions.');
			}
		};

		initCamera();

		return () => {
			// Cleanup: Stop camera stream
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}
		};
	}, []);

	/**
	 * Capture current frame
	 */
	const handleCapture = async () => {
		if (!videoRef.current || isCapturing) return;

		setIsCapturing(true);

		try {
			// Capture frame from video
			const canvas = document.createElement('canvas');
			canvas.width = videoRef.current.videoWidth;
			canvas.height = videoRef.current.videoHeight;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Failed to get canvas context');
			}

			ctx.drawImage(videoRef.current, 0, 0);

			// Convert to blob
			const blob = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob(
					blob => {
						if (blob) resolve(blob);
						else reject(new Error('Failed to create blob'));
					},
					'image/jpeg',
					0.95
				);
			});

			// Create capture photo object
			const capturePhoto: CapturePhoto = {
				blob,
				angle: currentAngle,
				timestamp: Date.now(),
				index: photos.length,
			};

			const newPhotos = [...photos, capturePhoto];
			setPhotos(newPhotos);

			// Move to next angle
			const nextAngle = (currentAngle + angleIncrement) % 360;
			setCurrentAngle(nextAngle);

			// Check if complete
			if (newPhotos.length >= targetPhotoCount) {
				// Stop camera
				if (stream) {
					stream.getTracks().forEach(track => track.stop());
				}

				// Complete
				onComplete(newPhotos);
			}
		} catch (err) {
			console.error('[PhotogrammetryCapture] Capture error:', err);
			setError('Failed to capture photo. Please try again.');
		} finally {
			setIsCapturing(false);
		}
	};

	/**
	 * Handle cancel
	 */
	const handleCancel = () => {
		// Stop camera
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
		}

		onCancel();
	};

	const progress = (photos.length / targetPhotoCount) * 100;

	return (
		<Container>
			<Title level={3} style={{ marginBottom: 'var(--spacing-4)' }}>
				<UntitledIcon name="camera" size="large" /> Photogrammetry Capture
			</Title>

			{error && (
				<Alert
					type="error"
					message={error}
					closable
					onClose={() => setError(null)}
					style={{ marginBottom: 'var(--spacing-4)' }}
				/>
			)}

			<Alert
				type="info"
				message="Photo Capture Instructions"
				description={
					<Space direction="vertical" size="small">
						<Text>
							• Stand in front of the camera at arm's length distance
						</Text>
						<Text>
							• Rotate {angleIncrement}° between each photo (follow the guide)
						</Text>
						<Text>
							• Capture {targetPhotoCount} photos total (360° coverage)
						</Text>
						<Text>• Keep lighting consistent throughout capture</Text>
					</Space>
				}
				showIcon
				style={{ marginBottom: 'var(--spacing-4)' }}
			/>

			<VideoContainer>
				<Video ref={videoRef} autoPlay playsInline muted />
				<Overlay>
					<CircularGuide rotation={currentAngle} />
				</Overlay>
			</VideoContainer>

			<Controls>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					{/* Progress */}
					<div>
						<Space style={{ width: '100%', justifyContent: 'space-between' }}>
							<Text strong>
								Progress: {photos.length} / {targetPhotoCount}
							</Text>
							<Text type="secondary">{Math.round(progress)}%</Text>
						</Space>
						<Progress percent={progress} showInfo={false} />
					</div>

					{/* Photo grid */}
					<PhotoGrid>
						{Array.from({ length: targetPhotoCount }).map((_, index) => (
							<PhotoThumbnail key={index} captured={index < photos.length}>
								{index + 1}
							</PhotoThumbnail>
						))}
					</PhotoGrid>

					{/* Action buttons */}
					<Space style={{ width: '100%', justifyContent: 'space-between' }}>
						<Button size="large" onClick={handleCancel}>
							Cancel
						</Button>
						<Button
							type="primary"
							size="large"
							onClick={handleCapture}
							disabled={isCapturing || photos.length >= targetPhotoCount}
							icon={<UntitledIcon name="camera" size="medium" />}
							loading={isCapturing}
						>
							Capture Photo ({photos.length + 1}/{targetPhotoCount})
						</Button>
					</Space>
				</Space>
			</Controls>
		</Container>
	);
};

export default PhotogrammetryCapture;
