/**
 * Icon Types
 *
 * Type definitions for the UntitledIcon component.
 */
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type { IconRegistry } from './iconRegistry';

/**
 * Icon name type - derived from registry keys
 */
export type IconName = keyof typeof IconRegistry;

/**
 * Icon size type - predefined sizes or custom pixel value
 */
export type IconSize = 'small' | 'medium' | 'large' | 'xlarge' | number;

/**
 * UntitledIcon component props
 */
export interface UntitledIconProps
	extends Omit<CustomIconComponentProps, 'component' | 'width' | 'height'> {
	/** Icon name from registry */
	name: IconName;
	/** Icon size - predefined or custom pixels */
	size?: IconSize;
	/** Icon color (overrides currentColor) */
	color?: string;
	/** Icon width (optional, uses size if not provided) */
	width?: number | string;
	/** Icon height (optional, uses size if not provided) */
	height?: number | string;
	/** Additional className */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Click handler */
	onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
	/** Mouse enter handler */
	onMouseEnter?: (e: React.MouseEvent<HTMLSpanElement>) => void;
	/** Mouse leave handler */
	onMouseLeave?: (e: React.MouseEvent<HTMLSpanElement>) => void;
	/** Spin animation (for loading icons) */
	spin?: boolean;
	/** ARIA label for accessibility */
	'aria-label'?: string;
	/** Hide from screen readers */
	'aria-hidden'?: boolean | 'true' | 'false';
}
