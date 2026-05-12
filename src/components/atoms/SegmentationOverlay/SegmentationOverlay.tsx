import React, { useEffect, useRef } from 'react';
import type { BlurredFrameData } from '@workers/types';

interface SegmentationOverlayProps {
	/** Pre-composited blurred frame from worker */
	frame: BlurredFrameData | null;
	/** Width of the video/container */
	width: number;
	/** Height of the video/container */
	height: number;
	/** Additional CSS classes */
	className?: string;
	/** Additional inline styles */
	style?: React.CSSProperties;
}

/**
 * SegmentationOverlay - Worker-Composited Display
 *
 * Simply draws the pre-composited ImageBitmap from the worker.
 * All blur + mask compositing happens in the worker for:
 * - Perfect frame sync (mask matches the video frame)
 * - No main thread overhead
 * - Zero-copy ImageBitmap transfer
 */
export const SegmentationOverlay: React.FC<SegmentationOverlayProps> = ({
	frame,
	width,
	height,
	className = '',
	style,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const lastSizeRef = useRef<{ w: number; h: number } | null>(null);

	// Draw the pre-composited frame
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !frame || !frame.bitmap) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Resize canvas if needed
		const sizeChanged =
			!lastSizeRef.current ||
			lastSizeRef.current.w !== frame.width ||
			lastSizeRef.current.h !== frame.height;

		if (sizeChanged) {
			canvas.width = frame.width;
			canvas.height = frame.height;
			lastSizeRef.current = { w: frame.width, h: frame.height };
		}

		// Draw the pre-composited bitmap (single draw call)
		ctx.drawImage(frame.bitmap, 0, 0);

		// Close the bitmap after drawing to free memory
		frame.bitmap.close();
	}, [frame]);

	return (
		<canvas
			ref={canvasRef}
			className={className}
			style={{
				width,
				height,
				pointerEvents: 'none',
				imageRendering: 'auto',
				...style,
			}}
		/>
	);
};

export default SegmentationOverlay;
