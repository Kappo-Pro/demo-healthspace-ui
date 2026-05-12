import './style.css';

export type StateOverlayVariant = 'brand' | 'success' | 'error' | 'scanning' | 'idle' | 'calibrating' | 'title';

interface StateOverlayProps {
	/** Visual variant determining the fill color */
	variant?: StateOverlayVariant;
	/** Whether the overlay is visible (opacity transitions smoothly) */
	visible?: boolean;
	/** Custom z-index (default: 1) */
	zIndex?: number;
	/** Fill opacity when visible (0-1, default: 0.1) */
	opacity?: number;
	/** Transition duration in ms (default: 300) */
	transitionDuration?: number;
}

/**
 * Full-screen state overlay with smooth color transitions.
 * Companion to BorderGlow - provides a subtle fill that matches border state.
 *
 * Features:
 * - Smooth transitions between states (no hard cuts)
 * - Configurable opacity (default 10%)
 * - Matches BorderGlow color variants
 *
 * @example
 * // Error state overlay
 * <StateOverlay variant="error" visible />
 *
 * // Success state with custom opacity
 * <StateOverlay variant="success" visible opacity={0.15} />
 *
 * // Smooth transition between states
 * <StateOverlay variant={isAligned ? 'success' : 'error'} visible />
 */
function StateOverlay({
	variant = 'brand',
	visible = true,
	zIndex = 1,
	opacity = 0.1,
	transitionDuration = 300,
}: StateOverlayProps) {
	return (
		<div
			className={`state-overlay state-overlay--${variant}`}
			style={
				{
					zIndex,
					'--overlay-opacity': visible ? opacity : 0,
					'--overlay-transition': `${transitionDuration}ms`,
				} as React.CSSProperties
			}
			aria-hidden="true"
		/>
	);
}

export default StateOverlay;
