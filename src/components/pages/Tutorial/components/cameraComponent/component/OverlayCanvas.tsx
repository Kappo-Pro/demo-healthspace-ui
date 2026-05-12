// components/OverlayCanvas.tsx
import { UseFullScreen } from '@pages/PostureScan/context/FullScreen.context';
import { useEffect, useRef } from 'react';
import { useFrameBounds } from '../hooks/useFrameBounds';

interface Props {
	canvasWidth: number;
	canvasHeight: number;
	isBodyVisible: boolean;
	isCentered: boolean;
	isOriented: boolean;
	expectedSide: 'left' | 'right';
}

interface FrameConfig {
	border: number;
	glow: number;
	radius: number;
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
	ctx.beginPath();
	ctx.moveTo(x + rr, y);
	ctx.lineTo(x + w - rr, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
	ctx.lineTo(x + w, y + h - rr);
	ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
	ctx.lineTo(x + rr, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
	ctx.lineTo(x, y + rr);
	ctx.quadraticCurveTo(x, y, x + rr, y);
	ctx.closePath();
}

const OverlayCanvas: React.FC<Props> = ({
	canvasWidth,
	canvasHeight,
	isBodyVisible,
	isCentered,
	isOriented,
	expectedSide,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { isFullScreen } = UseFullScreen();

	const { getFrameBounds, frameConfig } = useFrameBounds();

	const drawFrame = (
		ctx: CanvasRenderingContext2D,
		bounds: { x: number; y: number; w: number; h: number },
		canvasWidth: number,
		canvasHeight: number,
		cfg: FrameConfig,
	) => {
		const { border, glow, radius } = cfg;

		// Canvas 2D context requires computed values from CSS custom properties
		// Fallbacks are necessary for initial render before styles load
		const rootStyles = getComputedStyle(document.documentElement);
		const overlayBg = rootStyles.getPropertyValue('--overlay-bg').trim();
		const purpleShadow = rootStyles.getPropertyValue('--color-purple-700').trim();
		const purpleStroke = rootStyles.getPropertyValue('--color-purple-700').trim();
		const whiteColor = rootStyles.getPropertyValue('--color-white').trim();

		ctx.save();
		ctx.fillStyle = overlayBg || 'rgba(0,0,0,0.45)'; /* canvas fallback */
		ctx.beginPath();
		ctx.rect(0, 0, canvasWidth, canvasHeight);
		drawRoundedRect(ctx, bounds.x, bounds.y, bounds.w, bounds.h, radius);
		ctx.fill('evenodd');
		ctx.restore();

		ctx.save();
		ctx.shadowColor = purpleShadow || 'rgba(80,77,255,0.55)'; /* canvas fallback */
		ctx.shadowBlur = glow;
		ctx.lineWidth = border;
		ctx.strokeStyle = purpleStroke || '#6941c6'; /* canvas fallback */
		drawRoundedRect(ctx, bounds.x, bounds.y, bounds.w, bounds.h, radius);
		ctx.stroke();
		ctx.restore();

		ctx.save();
		ctx.lineWidth = 2;
		ctx.strokeStyle = whiteColor ? `rgba(255,255,255,0.65)` : 'rgba(255,255,255,0.65)'; /* canvas opacity */
		const inset = border;
		drawRoundedRect(
			ctx,
			bounds.x + inset / 2,
			bounds.y + inset / 2,
			bounds.w - inset,
			bounds.h - inset,
			Math.max(0, radius - inset / 2),
		);
		ctx.stroke();
		ctx.restore();
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();

		const width = isFullScreen
			? window.innerWidth
			: canvas.getBoundingClientRect().width;
		const height = isFullScreen
			? window.innerHeight
			: canvas.getBoundingClientRect().height;
		canvas.width = width * dpr;
		canvas.height = height * dpr;

		if (typeof ctx.resetTransform === 'function') {
			ctx.resetTransform();
			ctx.scale(dpr, dpr);
		} else {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		}

		ctx.clearRect(0, 0, width, height);

		if (isCentered && isBodyVisible && isOriented) return;

		if (!isCentered) {
			const bounds = getFrameBounds(width, height);
			drawFrame(ctx, bounds, width, height, frameConfig);
		}
	}, [
		canvasWidth,
		canvasHeight,
		isBodyVisible,
		isCentered,
		isOriented,
		expectedSide,
		isFullScreen,
		frameConfig,
		getFrameBounds,
	]);

	return (
		<canvas
			id="overlayCanvas"
			ref={canvasRef}
			width={canvasWidth}
			height={canvasHeight}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				pointerEvents: 'none',
				zIndex: 5,
			}}
		/>
	);
};

export default OverlayCanvas;
