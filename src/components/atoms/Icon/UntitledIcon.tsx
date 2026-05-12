/**
 * UntitledIcon Component
 *
 * Direct wrapper for Untitled UI icons (renders icons natively without Ant Design wrapper).
 * Preserves original SVG attributes (fill="none", stroke attributes) for proper outline rendering.
 * Provides type-safe icon names, sizing, and accessibility features.
 *
 * Default color: var(--icon-color) which is:
 * - Dark theme: var(--brand-primary) (purple)
 * - Light theme: var(--color-neutral-800) (dark gray)
 *
 * @example
 * ```tsx
 * <UntitledIcon name="search" size="medium" />
 * <UntitledIcon name="user" size={24} color="var(--brand-primary)" />
 * <UntitledIcon name="close" aria-label="Close dialog" onClick={handleClose} />
 * ```
 */
import React from 'react';
import { IconRegistry } from './iconRegistry';
import type { UntitledIconProps } from './types';
import { getIconSize } from './utils';

export const UntitledIcon: React.FC<UntitledIconProps> = ({
	name,
	size,
	color,
	width,
	height,
	style,
	className,
	onClick,
	onMouseEnter,
	onMouseLeave,
	spin,
	'aria-label': ariaLabel,
	'aria-hidden': ariaHidden,
	...restProps
}) => {
	const IconComponent = IconRegistry[name];

	// Warn if icon not found (development only)
	if (!IconComponent) {
		if (process.env.NODE_ENV === 'development') {
			console.warn(`[UntitledIcon] Icon "${name}" not found in registry`);
		}
		return null;
	}

	// Calculate size (UntitledUI icons use width/height props)
	// If size is a number, use it directly; otherwise parse from getIconSize or default to 20
	const numericSize = typeof size === 'number'
		? size
		: (size ? parseInt(getIconSize(size) || '20', 10) : 20);
	const iconSize = getIconSize(size);
	const finalWidth = width || iconSize;
	const finalHeight = height || iconSize;

	// Render UntitledUI icon directly (preserves fill="none" and stroke attributes)
	return (
		<IconComponent
			size={numericSize}
			color={color}
			style={style}
			className={className}
			onClick={onClick}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			aria-label={ariaLabel}
			aria-hidden={ariaHidden}
			{...restProps}
		/>
	);
};

// Export with display name for debugging
UntitledIcon.displayName = 'UntitledIcon';
