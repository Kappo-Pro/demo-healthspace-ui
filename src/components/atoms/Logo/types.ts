export type LogoVariant = 'full' | 'icon' | 'wordmark';
export type LogoStyle = 'color' | 'mono' | 'outline';
export type LogoTheme = 'light' | 'dark' | 'default' | 'vibrant';
export type LogoFormat = 'svg' | 'png';
export type LogoOrientation = 'horizontal' | 'vertical';

export interface LogoBaseProps {
	/**
	 * Alternative text for accessibility
	 * @default "VitalFlow"
	 */
	alt?: string;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Inline styles
	 */
	style?: React.CSSProperties;

	/**
	 * Click handler
	 */
	onClick?: () => void;
}

export interface LogoProps extends LogoBaseProps {
	/**
	 * Logo variant to display
	 * @default "full"
	 */
	variant?: LogoVariant;

	/**
	 * Logo style
	 * @default "color"
	 */
	logoStyle?: LogoStyle;

	/**
	 * Logo theme override (defaults to app theme)
	 */
	theme?: LogoTheme;

	/**
	 * Width in pixels
	 */
	width?: number;

	/**
	 * Height in pixels (auto-calculated if not provided)
	 */
	height?: number;

	/**
	 * File format to use
	 * @default "svg"
	 */
	format?: LogoFormat;

	/**
	 * Orientation for full logo
	 * @default "horizontal"
	 */
	orientation?: LogoOrientation;

	/**
	 * Enable retina support for PNG (@2x)
	 * @default true
	 */
	retina?: boolean;
}

export interface LogoIconProps extends LogoBaseProps {
	/**
	 * Icon size in pixels
	 * @default 64
	 */
	size?: 16 | 32 | 48 | 64 | 128 | 256 | 512 | 1024;

	/**
	 * Icon style
	 * @default "color"
	 */
	iconStyle?: LogoStyle;

	/**
	 * Icon theme override (defaults to app theme)
	 */
	theme?: LogoTheme;

	/**
	 * File format to use
	 * @default "svg"
	 */
	format?: LogoFormat;
}

export interface LogoWordmarkProps extends LogoBaseProps {
	/**
	 * Wordmark style
	 * @default "color"
	 */
	wordmarkStyle?: LogoStyle;

	/**
	 * Wordmark theme override (defaults to app theme)
	 */
	theme?: LogoTheme;

	/**
	 * Width in pixels
	 */
	width?: number;

	/**
	 * Height in pixels (auto-calculated if not provided)
	 */
	height?: number;

	/**
	 * File format to use
	 * @default "svg"
	 */
	format?: LogoFormat;

	/**
	 * Enable retina support for PNG (@2x)
	 * @default true
	 */
	retina?: boolean;
}
