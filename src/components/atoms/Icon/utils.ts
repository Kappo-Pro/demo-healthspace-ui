/**
 * Icon Utilities
 *
 * Helper functions for icon sizing and styling.
 */
import { IconSize } from './types';

/**
 * Predefined icon sizes (in pixels)
 */
export const ICON_SIZES = {
	small: 14,
	medium: 16,
	large: 20,
	xlarge: 24,
} as const;

/**
 * Convert IconSize to CSS pixel value
 *
 * @param size - Icon size (predefined string or number)
 * @returns CSS pixel string or undefined for default
 */
export function getIconSize(size?: IconSize): string | undefined {
	if (typeof size === 'number') {
		return `${size}px`;
	}
	if (size && size in ICON_SIZES) {
		return `${ICON_SIZES[size]}px`;
	}
	return undefined; // Default to 1em
}
