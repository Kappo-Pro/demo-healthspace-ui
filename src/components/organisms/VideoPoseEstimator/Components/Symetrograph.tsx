import { memo, useEffect, useRef } from 'react';

interface Axys {
	x: number;
	y: number;
}

const videoSize = {
	width: 1280,
	height: 720,
};

function drawLine(ctx: CanvasRenderingContext2D, a: Axys, b: Axys) {
	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.strokeStyle = 'var(--color-lime-500)';
	ctx.stroke();
}

function drawSymetrograph(ctx: CanvasRenderingContext2D) {
	const width = videoSize.width;
	const height = videoSize.height;

	ctx.clearRect(0, 0, width, height);

	for (let x = 0; x <= width; x += 50) {
		drawLine(ctx, { x, y: 0 }, { x, y: height });
	}

	for (let y = 0; y <= height; y += 50) {
		drawLine(ctx, { x: 0, y }, { x: width, y });
	}
}

function Symetrograph({ isFullscreen: _isFullscreen }: { isFullscreen: boolean }) {
	const canvasSymetrographRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		drawSymetrograph(
			canvasSymetrographRef.current?.getContext(
				'2d',
			) as CanvasRenderingContext2D,
		);
	}, []);

	return (
		<canvas
			id="canvasSymetrograph"
			ref={canvasSymetrographRef}
			width={videoSize.width}
			height={videoSize.height}
			style={{
				width: "100vw",
				height: "100vh",
				zIndex: 3,
				position: 'absolute',
				pointerEvents: 'none',
				top: 0,
				left: 0,
			}}
		/>
	);
}

export default memo(Symetrograph);
