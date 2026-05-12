import './style.css';

interface DashedBoxProps {
	/** Width as percentage of parent (default: 40) */
	width?: number;
	/** Height as percentage of parent (default: 90) */
	height?: number;
	/** Border radius in pixels */
	borderRadius?: number;
	/** Stroke color */
	strokeColor?: string;
	/** Fill color (with opacity) */
	fillColor?: string;
	/** Border width in pixels */
	borderWidth?: number;
	/** Dash length in pixels */
	dashLength?: number;
	/** Gap length in pixels */
	gapLength?: number;
	/** Animation duration in seconds */
	animationDuration?: number;
	/** Whether animation is active */
	animated?: boolean;
	/** Custom z-index */
	zIndex?: number;
	/** Show grid pattern inside (default: false) */
	showGrid?: boolean;
	/** Grid cell size in pixels (default: 40) */
	gridSize?: number;
	/** Grid line color */
	gridColor?: string;
	/** Grid line opacity (0-1, default: 0.3) */
	gridOpacity?: number;
}

/**
 * Animated dashed box overlay using CSS.
 * Creates a "marching ants" effect with animated border.
 *
 * @example
 * <DashedBox
 *   width={40} height={90}
 *   strokeColor="var(--brand-primary)"
 *   animated
 * />
 */
function DashedBox({
	width = 40,
	height = 90,
	borderRadius = 12,
	strokeColor = 'var(--brand-primary)',
	fillColor = 'var(--color-purple-alpha-10)',
	borderWidth = 2,
	dashLength = 8,
	gapLength = 6,
	animationDuration = 2,
	animated = true,
	zIndex = 10,
	showGrid = false,
	gridSize = 40,
	gridColor = 'var(--brand-primary)',
	gridOpacity = 0.3,
}: DashedBoxProps) {
	const dashTotal = dashLength + gapLength;

	return (
		<div
			className={`dashed-box ${animated ? 'dashed-box--animated' : ''}`}
			style={{
				'--box-width': `${width}%`,
				'--box-height': `${height}%`,
				'--border-radius': `${borderRadius}px`,
				'--stroke-color': strokeColor,
				'--fill-color': fillColor,
				'--border-width': `${borderWidth}px`,
				'--dash-length': `${dashLength}px`,
				'--gap-length': `${gapLength}px`,
				'--dash-total': `${dashTotal}px`,
				'--animation-duration': `${animationDuration}s`,
				zIndex,
			} as React.CSSProperties}
			aria-hidden="true"
		>
			{showGrid && (
				<>
					<svg
						className="dashed-box__grid"
						width="100%"
						height="100%"
						style={{ opacity: gridOpacity }}
					>
						<defs>
							<pattern
								id="grid-pattern"
								width={gridSize}
								height={gridSize}
								patternUnits="userSpaceOnUse"
							>
								<path
									d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
									fill="none"
									stroke={gridColor}
									strokeWidth="1"
								/>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid-pattern)" />
					</svg>
					<div className="dashed-box__scan-line" />
				</>
			)}
		</div>
	);
}

export default DashedBox;
