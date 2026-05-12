import { UseFullScreen } from '@pages/PostureScan/context/FullScreen.context';
import { useCallback } from 'react';

export function useFrameBounds() {
	const { isFullScreen } = UseFullScreen();

	const NORMAL_FRAME = {
		padX: 0.1,
		padYTop: 0.08,
		padYBot: 0.08,
		aspect: 9 / 15,
		border: 6,
		glow: 18,
		radius: 26,
	};

	const FULLSCREEN_FRAME = {
		padX: 0.1,
		padYTop: 0.08,
		padYBot: 0.25,
		aspect: 9 / 14,
		border: 6,
		glow: 18,
		radius: 26,
	};

	const frameConfig = isFullScreen ? FULLSCREEN_FRAME : NORMAL_FRAME;

	const getFrameBounds = useCallback(
		(canvasWidth: number, canvasHeight: number) => {
			const cfg = frameConfig;
			const visualInset = cfg.border / 2 + cfg.glow;

			const leftInset = canvasWidth * cfg.padX + visualInset;
			const rightInset = canvasWidth * cfg.padX + visualInset;
			const topInset = canvasHeight * cfg.padYTop + visualInset;
			const bottomInset = canvasHeight * cfg.padYBot + visualInset;

			const availableWidth = canvasWidth - leftInset - rightInset;
			const availableHeight = canvasHeight - topInset - bottomInset;

			let width = availableWidth;
			let height = width / cfg.aspect;
			if (height > availableHeight) {
				height = availableHeight;
				width = height * cfg.aspect;
			}

			const x = leftInset + (availableWidth - width) / 2;
			const y = topInset + (availableHeight - height) / 2;

			return {
				x: Math.round(x),
				y: Math.round(y),
				w: Math.round(width),
				h: Math.round(height),
			};
		},
		[frameConfig],
	);

	return { getFrameBounds, frameConfig };
}
