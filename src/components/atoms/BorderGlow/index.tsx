import './style.css';

export type BorderGlowVariant = 'brand' | 'success' | 'error' | 'apple' | 'scanning' | 'idle';

interface BorderGlowProps {
	/** Visual variant determining the color palette */
	variant?: BorderGlowVariant;
	/** Whether the glow is visible */
	visible?: boolean;
	/** Custom z-index (default: 100) */
	zIndex?: number;
	/** Animation speed multiplier (default: 1) */
	speed?: number;
	/** Border radius in pixels (default: 0) */
	borderRadius?: number;
	/** Intensity of the glow (0-1, default: 1) */
	intensity?: number;
}

/**
 * Apple Intelligence-style animated border glow effect.
 * Uses layered gradients with staggered blur for depth.
 *
 * Six variants available:
 * - brand: VitalFlow purple/blue palette
 * - success: Green tones for aligned/ready states
 * - error: Red/orange tones for error/warning states
 * - apple: Original Apple Intelligence rainbow palette
 * - scanning: Lighter purple shades with more activity (for readysetgo countdown)
 * - idle: Subtle dark gray glow for default/waiting states
 *
 * @example
 * // Brand glow for premium UI elements
 * <BorderGlow variant="brand" visible />
 *
 * // Success state - user is aligned
 * <BorderGlow variant="success" visible speed={1.5} />
 *
 * // Error state with reduced intensity
 * <BorderGlow variant="error" visible intensity={0.7} />
 *
 * // Scanning state - active countdown
 * <BorderGlow variant="scanning" visible speed={2.5} />
 */
function BorderGlow({
	variant = 'brand',
	visible = true,
	zIndex = 100,
	speed = 1,
	borderRadius = 0,
	intensity = 1,
}: BorderGlowProps) {
	if (!visible) return null;

	const duration = 2 / speed;

	return (
		<div
			className={`border-glow border-glow--${variant}`}
			style={
				{
					zIndex,
					'--glow-duration': `${duration}s`,
					'--glow-radius': `${borderRadius}px`,
					'--glow-intensity': intensity,
				} as React.CSSProperties
			}
			aria-hidden="true"
		>
			{/* Pulsing glow overlay */}
			<div className="border-glow__pulse" />
			{/* Layer 1: Sharp edge (no blur) */}
			<div className="border-glow__layer border-glow__layer--1" />
			{/* Layer 2: Soft inner glow */}
			<div className="border-glow__layer border-glow__layer--2" />
			{/* Layer 3: Medium outer glow */}
			<div className="border-glow__layer border-glow__layer--3" />
			{/* Layer 4: Diffuse ambient glow */}
			<div className="border-glow__layer border-glow__layer--4" />
		</div>
	);
}

export default BorderGlow;
