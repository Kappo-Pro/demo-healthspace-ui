import './style.css';

export type AnimatedBorderVariant = 'success' | 'error' | 'warning' | 'info';

interface AnimatedBorderProps {
	/** Visual variant determining the color */
	variant?: AnimatedBorderVariant;
	/** Whether the border is visible */
	visible?: boolean;
	/** Custom z-index (default: 100) */
	zIndex?: number;
	/** Show circling border beam effect */
	showBeam?: boolean;
	/** Duration of beam rotation in seconds (default: 3) */
	beamDuration?: number;
}

/**
 * Animated pulsing border overlay for video/scan areas.
 * Used during countdown states to provide visual feedback.
 *
 * @example
 * // Success state (green) - user is aligned
 * <AnimatedBorder variant="success" visible={isReadySetGo} />
 *
 * // Error state (red) - user needs to adjust
 * <AnimatedBorder variant="error" visible={hasError} />
 *
 * // With circling border beam effect
 * <AnimatedBorder variant="error" visible showBeam beamDuration={2} />
 */
function AnimatedBorder({
	variant = 'success',
	visible = true,
	zIndex = 100,
	showBeam = false,
	beamDuration = 3,
}: AnimatedBorderProps) {
	if (!visible) return null;

	const beamClass = showBeam ? 'animated-border--with-beam' : '';

	return (
		<div
			className={`animated-border animated-border--${variant} ${beamClass}`}
			style={{
				zIndex,
				'--beam-duration': `${beamDuration}s`,
			} as React.CSSProperties}
		/>
	);
}

export default AnimatedBorder;
