import { PropsWithChildren, useEffect, useRef, useState } from 'react';

interface BorderAnimationProps {
	/** Duration in seconds to complete the border */
	duration: number;
	/** Whether animation is running */
	isAnimating: boolean;
	/** Border color */
	color?: string;
	/** Border width */
	borderWidth?: number;
	/** Border radius */
	borderRadius?: number;
}

/**
 * Animated border progress wrapper for modals/containers
 *
 * The border starts empty and progressively draws clockwise
 * until it completes 100% of the border.
 */
function BorderAnimation({
	children,
	duration,
	isAnimating,
	color = 'var(--color-success-500)',
	borderWidth = 3,
	borderRadius = 8,
}: PropsWithChildren<BorderAnimationProps>) {
	const containerRef = useRef<HTMLDivElement>(null);
	const pathRef = useRef<SVGPathElement>(null);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const animationRef = useRef<number>();
	const startTimeRef = useRef<number>();
	const [currentOffset, setCurrentOffset] = useState<number | null>(null);
	const hasCompletedRef = useRef(false);

	useEffect(() => {
		if (containerRef.current) {
			const { offsetWidth, offsetHeight } = containerRef.current;
			setDimensions({ width: offsetWidth, height: offsetHeight });
		}
	}, []);

	const w = dimensions.width;
	const h = dimensions.height;

	// Calculate perimeter for the rounded rectangle
	const straightEdges = 2 * (w - 2 * borderRadius) + 2 * (h - 2 * borderRadius);
	const corners = 2 * Math.PI * borderRadius;
	const perimeter = straightEdges + corners;

	// Initialize offset when perimeter is calculated
	useEffect(() => {
		if (perimeter > 0 && currentOffset === null && !hasCompletedRef.current) {
			setCurrentOffset(perimeter);
		}
	}, [perimeter, currentOffset]);

	// Create the path for a rounded rectangle (clockwise from top-center)
	const createRoundedRectPath = () => {
		const r = borderRadius;
		const halfW = w / 2;

		// Using arc commands (A) for perfect rounded corners
		return `
			M ${halfW} 0
			H ${w - r}
			A ${r} ${r} 0 0 1 ${w} ${r}
			V ${h - r}
			A ${r} ${r} 0 0 1 ${w - r} ${h}
			H ${r}
			A ${r} ${r} 0 0 1 0 ${h - r}
			V ${r}
			A ${r} ${r} 0 0 1 ${r} 0
			H ${halfW}
		`;
	};

	// Animation: progressively draw the border from 0% to 100%
	useEffect(() => {
		if (!isAnimating || perimeter === 0 || dimensions.width === 0 || hasCompletedRef.current) return;

		const durationMs = duration * 1000;

		const animate = (timestamp: number) => {
			if (!startTimeRef.current) {
				startTimeRef.current = timestamp;
			}

			const elapsed = timestamp - startTimeRef.current;
			const progress = Math.min(elapsed / durationMs, 1);

			// Start with full offset (nothing visible), animate to 0 (fully visible)
			const offset = perimeter * (1 - progress);
			setCurrentOffset(offset);

			if (progress < 1) {
				animationRef.current = requestAnimationFrame(animate);
			} else {
				hasCompletedRef.current = true;
			}
		};

		// Small delay to ensure SVG is mounted
		const timeoutId = setTimeout(() => {
			animationRef.current = requestAnimationFrame(animate);
		}, 50);

		return () => {
			clearTimeout(timeoutId);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [isAnimating, duration, perimeter, dimensions.width]);

	// Don't render SVG until we have dimensions and offset
	const showSvg = dimensions.width > 0 && dimensions.height > 0 && currentOffset !== null;

	return (
		<div
			ref={containerRef}
			style={{
				position: 'relative',
				display: 'inline-block',
			}}>
			{showSvg && (
				<svg
					style={{
						position: 'absolute',
						top: -borderWidth / 2,
						left: -borderWidth / 2,
						width: w + borderWidth,
						height: h + borderWidth,
						pointerEvents: 'none',
						zIndex: 10,
						overflow: 'visible',
					}}
					viewBox={`${-borderWidth / 2} ${-borderWidth / 2} ${w + borderWidth} ${h + borderWidth}`}>
					<defs>
						<filter id="border-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
							<feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur2" />
							<feMerge>
								<feMergeNode in="blur2" />
								<feMergeNode in="blur1" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
					</defs>
					<path
						ref={pathRef}
						d={createRoundedRectPath()}
						fill="none"
						stroke={color}
						strokeWidth={borderWidth}
						strokeLinecap="round"
						strokeDasharray={perimeter}
						strokeDashoffset={currentOffset}
						filter="url(#border-glow-filter)"
					/>
				</svg>
			)}
			{children}
		</div>
	);
}

export default BorderAnimation;
