'use client';

import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Size of each square in pixels */
	squareSize?: number;
	/** Gap between squares in pixels */
	gridGap?: number;
	/** Probability of a square flickering per frame (0-1) */
	flickerChance?: number;
	/** Color of the squares (any valid CSS color) */
	color?: string;
	/** Fixed width (defaults to container width) */
	width?: number;
	/** Fixed height (defaults to container height) */
	height?: number;
	/** Additional CSS classes */
	className?: string;
	/** Maximum opacity of squares (0-1) */
	maxOpacity?: number;
}

/**
 * FlickeringGrid
 *
 * A performant flickering grid background using HTML5 Canvas.
 * Ideal for overlays and ambient background effects.
 *
 * Based on Magic UI's FlickeringGrid component.
 * @see https://magicui.design/docs/components/flickering-grid
 */
export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
	squareSize = 4,
	gridGap = 6,
	flickerChance = 0.3,
	color, // Must be passed - use CSS var like 'var(--brand-primary)'
	width,
	height,
	className = '',
	maxOpacity = 0.3,
	...props
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isInView, setIsInView] = useState(true); // Start visible by default
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

	const memoizedColor = useMemo(() => {
		const toRGBA = (colorValue: string | undefined) => {
			if (typeof window === 'undefined' || !colorValue) {
				// SSR fallback - transparent (eslint: fallback required for SSR)
				 
				return 'rgba(0, 0, 0,';
			}
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = 1;
			const ctx = canvas.getContext('2d');
			 
			if (!ctx) return 'rgba(0, 0, 0,';

			// Resolve CSS variable if needed
			let resolvedColor = colorValue;
			if (colorValue.startsWith('var(')) {
				const varName = colorValue.slice(4, -1);
				resolvedColor =
					getComputedStyle(document.documentElement).getPropertyValue(
						varName,
					) || colorValue;
			}

			ctx.fillStyle = resolvedColor;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
			// Dynamic color from extracted pixel values
			// eslint-disable-next-line vitalflow/no-hardcoded-colors
			return `rgba(${r}, ${g}, ${b},`;
		};
		return toRGBA(color);
	}, [color]);

	const setupCanvas = useCallback(
		(canvas: HTMLCanvasElement, width: number, height: number) => {
			const dpr = window.devicePixelRatio || 1;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			const cols = Math.floor(width / (squareSize + gridGap));
			const rows = Math.floor(height / (squareSize + gridGap));

			const squares = new Float32Array(cols * rows);
			for (let i = 0; i < squares.length; i++) {
				squares[i] = Math.random() * maxOpacity;
			}

			return { cols, rows, squares, dpr };
		},
		[squareSize, gridGap, maxOpacity],
	);

	const updateSquares = useCallback(
		(squares: Float32Array, deltaTime: number) => {
			for (let i = 0; i < squares.length; i++) {
				if (Math.random() < flickerChance * deltaTime) {
					squares[i] = Math.random() * maxOpacity;
				}
			}
		},
		[flickerChance, maxOpacity],
	);

	const drawGrid = useCallback(
		(
			ctx: CanvasRenderingContext2D,
			width: number,
			height: number,
			cols: number,
			rows: number,
			squares: Float32Array,
			dpr: number,
		) => {
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = 'transparent';
			ctx.fillRect(0, 0, width, height);

			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					const opacity = squares[i * rows + j];
					ctx.fillStyle = `${memoizedColor}${opacity})`;
					ctx.fillRect(
						i * (squareSize + gridGap) * dpr,
						j * (squareSize + gridGap) * dpr,
						squareSize * dpr,
						squareSize * dpr,
					);
				}
			}
		},
		[memoizedColor, squareSize, gridGap],
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationFrameId: number;
		let gridParams: ReturnType<typeof setupCanvas>;

		const updateCanvasSize = () => {
			// Use provided dimensions, container dimensions, or fallback to parent/window
			const newWidth =
				width ||
				container.clientWidth ||
				container.parentElement?.clientWidth ||
				window.innerWidth;
			const newHeight =
				height ||
				container.clientHeight ||
				container.parentElement?.clientHeight ||
				window.innerHeight;
			setCanvasSize({ width: newWidth, height: newHeight });
			gridParams = setupCanvas(canvas, newWidth, newHeight);
		};

		updateCanvasSize();

		let lastTime = 0;
		const animate = (time: number) => {
			if (!isInView) return;

			const deltaTime = (time - lastTime) / 1000;
			lastTime = time;

			updateSquares(gridParams.squares, deltaTime);
			drawGrid(
				ctx,
				canvas.width,
				canvas.height,
				gridParams.cols,
				gridParams.rows,
				gridParams.squares,
				gridParams.dpr,
			);
			animationFrameId = requestAnimationFrame(animate);
		};

		const resizeObserver = new ResizeObserver(() => {
			updateCanvasSize();
		});

		resizeObserver.observe(container);

		const intersectionObserver = new IntersectionObserver(
			([entry]) => {
				setIsInView(entry.isIntersecting);
			},
			{ threshold: 0 },
		);

		intersectionObserver.observe(canvas);

		if (isInView) {
			animationFrameId = requestAnimationFrame(animate);
		}

		return () => {
			cancelAnimationFrame(animationFrameId);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
		};
	}, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

	return (
		<div
			ref={containerRef}
			className={`h-full w-full ${className}`}
			style={{ minHeight: '100%', minWidth: '100%', ...props.style }}
			{...props}>
			<canvas
				ref={canvasRef}
				style={{
					width: canvasSize.width || '100%',
					height: canvasSize.height || '100%',
					display: 'block',
				}}
			/>
		</div>
	);
};

export default FlickeringGrid;
