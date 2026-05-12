import { CSSProperties, ReactNode } from 'react';
import './style.css';

export type ClosedCaptionVariant = 'default' | 'success' | 'error' | 'warning';

interface ClosedCaptionProps {
	/** Caption text or content */
	children: ReactNode;
	/** Visual variant for state indication */
	variant?: ClosedCaptionVariant;
	/** Whether the caption is visible */
	visible?: boolean;
	/** Custom z-index (default: 50) */
	zIndex?: number;
	/** Override styles for positioning */
	style?: CSSProperties;
	/** Position from bottom in pixels (default: 80) */
	bottom?: number;
}

/**
 * ClosedCaption - Pill-shaped caption overlay for audio sync
 *
 * Displays text synchronized with audio playback in a pill-shaped container.
 * Supports state variants for visual feedback.
 *
 * @example
 * // Default state
 * <ClosedCaption visible={isPlaying}>
 *   Step back and ensure your full body is visible
 * </ClosedCaption>
 *
 * // Success state
 * <ClosedCaption variant="success" visible={isAligned}>
 *   Great! Hold that position
 * </ClosedCaption>
 *
 * // Error state
 * <ClosedCaption variant="error" visible={hasError}>
 *   Please face the camera
 * </ClosedCaption>
 */
export function ClosedCaption({
	children,
	variant = 'default',
	visible = true,
	zIndex = 50,
	style,
	bottom = 80,
}: ClosedCaptionProps) {
	if (!visible || !children) return null;

	return (
		<div
			className={`closed-caption closed-caption--${variant}`}
			style={{
				zIndex,
				bottom,
				...style,
			}}
			role="status"
			aria-live="polite"
			aria-label="Caption"
		>
			<span className="closed-caption__text">{children}</span>
		</div>
	);
}

export default ClosedCaption;
