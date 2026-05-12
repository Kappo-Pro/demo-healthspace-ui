/**
 * ANTD-046 Task 3: Tooltip Component Variants
 *
 * Reusable tooltip components with standardized configurations.
 * All variants are built on Ant Design's Tooltip with consistent behavior.
 */

/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Tooltip as AntTooltip, TooltipProps as AntTooltipProps } from 'antd';
import { TOOLTIP_CONFIGS, TOOLTIP_STYLES } from './tooltipConfig';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TooltipProps extends AntTooltipProps {
	/** Optional style override */
	overlayStyle?: React.CSSProperties;
}

// ============================================================================
// STANDARD TOOLTIP
// ============================================================================

/**
 * Standard Tooltip with default configuration
 * - Shows on hover
 * - Top placement
 * - Slight delay (300ms)
 *
 * @example
 * ```tsx
 * <Tooltip title="Help text">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.default.placement,
	trigger = TOOLTIP_CONFIGS.default.trigger,
	mouseEnterDelay = TOOLTIP_CONFIGS.default.mouseEnterDelay,
	mouseLeaveDelay = TOOLTIP_CONFIGS.default.mouseLeaveDelay,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			mouseEnterDelay={mouseEnterDelay}
			mouseLeaveDelay={mouseLeaveDelay}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

// ============================================================================
// CLICK TOOLTIP
// ============================================================================

/**
 * Click Tooltip (shows on click)
 * - Good for mobile/touch interfaces
 * - Top placement
 * - Requires click to show
 *
 * @example
 * ```tsx
 * <ClickTooltip title="Click to see info">
 *   <Button>Click me</Button>
 * </ClickTooltip>
 * ```
 */
export const ClickTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.click.placement,
	trigger = TOOLTIP_CONFIGS.click.trigger,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

// ============================================================================
// FOCUS TOOLTIP
// ============================================================================

/**
 * Focus Tooltip (shows on focus)
 * - Good for form fields
 * - Right placement
 * - Shows when element receives focus
 *
 * @example
 * ```tsx
 * <FocusTooltip title="Enter your email">
 *   <Input placeholder="Email" />
 * </FocusTooltip>
 * ```
 */
export const FocusTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.focus.placement,
	trigger = TOOLTIP_CONFIGS.focus.trigger,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

// ============================================================================
// INSTANT TOOLTIP
// ============================================================================

/**
 * Instant Tooltip (no delay)
 * - Shows immediately on hover
 * - Good for critical information
 * - Top placement
 *
 * @example
 * ```tsx
 // TODO: Consider using Important ?? defaultValue or Important?.property instead of Important!
 * <InstantTooltip title="Important!">
 *   <Icon type="warning" />
 * </InstantTooltip>
 * ```
 */
export const InstantTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.instant.placement,
	trigger = TOOLTIP_CONFIGS.instant.trigger,
	mouseEnterDelay = TOOLTIP_CONFIGS.instant.mouseEnterDelay,
	mouseLeaveDelay = TOOLTIP_CONFIGS.instant.mouseLeaveDelay,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			mouseEnterDelay={mouseEnterDelay}
			mouseLeaveDelay={mouseLeaveDelay}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

// ============================================================================
// ICON BUTTON TOOLTIP
// ============================================================================

/**
 * Icon Button Tooltip
 * - Optimized for icon-only buttons
 * - Quick display (200ms delay)
 * - Top placement
 *
 * @example
 * ```tsx
 * <IconButtonTooltip title="Edit">
 *   <Button icon={<EditOutlined />} />
 * </IconButtonTooltip>
 * ```
 */
export const IconButtonTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.iconButton.placement,
	trigger = TOOLTIP_CONFIGS.iconButton.trigger,
	mouseEnterDelay = TOOLTIP_CONFIGS.iconButton.mouseEnterDelay,
	mouseLeaveDelay = TOOLTIP_CONFIGS.iconButton.mouseLeaveDelay,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			mouseEnterDelay={mouseEnterDelay}
			mouseLeaveDelay={mouseLeaveDelay}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

// ============================================================================
// HELP TOOLTIP
// ============================================================================

/**
 * Help Tooltip
 * - For question mark icons
 * - Shows on hover or click
 * - Right placement
 *
 * @example
 * ```tsx
 * <HelpTooltip title="This field is for your primary email address">
 *   <QuestionCircleOutlined />
 * </HelpTooltip>
 * ```
 */
export const HelpTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.help.placement,
	trigger = TOOLTIP_CONFIGS.help.trigger,
	mouseEnterDelay = TOOLTIP_CONFIGS.help.mouseEnterDelay,
	mouseLeaveDelay = TOOLTIP_CONFIGS.help.mouseLeaveDelay,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			mouseEnterDelay={mouseEnterDelay}
			mouseLeaveDelay={mouseLeaveDelay}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

// ============================================================================
// STATUS TOOLTIPS
// ============================================================================

/**
 * Error Tooltip
 * - Red color scheme
 * - Bottom-right placement
 * - Quick display
 *
 * @example
 * ```tsx
 * <ErrorTooltip title="This field is required">
 *   <Input status="error" />
 * </ErrorTooltip>
 * ```
 */
export const ErrorTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.error.placement,
	trigger = TOOLTIP_CONFIGS.error.trigger,
	mouseEnterDelay = TOOLTIP_CONFIGS.error.mouseEnterDelay,
	mouseLeaveDelay = TOOLTIP_CONFIGS.error.mouseLeaveDelay,
	color = TOOLTIP_CONFIGS.error.color,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			mouseEnterDelay={mouseEnterDelay}
			mouseLeaveDelay={mouseLeaveDelay}
			color={color}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

/**
 * Warning Tooltip
 * - Orange color scheme
 * - Bottom placement
 * - Quick display
 *
 * @example
 * ```tsx
 * <WarningTooltip title="This action cannot be undone">
 *   <Button danger>Delete</Button>
 * </WarningTooltip>
 * ```
 */
export const WarningTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.warning.placement,
	trigger = TOOLTIP_CONFIGS.warning.trigger,
	mouseEnterDelay = TOOLTIP_CONFIGS.warning.mouseEnterDelay,
	mouseLeaveDelay = TOOLTIP_CONFIGS.warning.mouseLeaveDelay,
	color = TOOLTIP_CONFIGS.warning.color,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			mouseEnterDelay={mouseEnterDelay}
			mouseLeaveDelay={mouseLeaveDelay}
			color={color}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

/**
 * Success Tooltip
 * - Green color scheme
 * - Top placement
 * - Quick display
 *
 * @example
 * ```tsx
 * <SuccessTooltip title="Changes saved successfully">
 *   <CheckCircleOutlined />
 * </SuccessTooltip>
 * ```
 */
export const SuccessTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.success.placement,
	trigger = TOOLTIP_CONFIGS.success.trigger,
	mouseEnterDelay = TOOLTIP_CONFIGS.success.mouseEnterDelay,
	mouseLeaveDelay = TOOLTIP_CONFIGS.success.mouseLeaveDelay,
	color = TOOLTIP_CONFIGS.success.color,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			mouseEnterDelay={mouseEnterDelay}
			mouseLeaveDelay={mouseLeaveDelay}
			color={color}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

/**
 * Info Tooltip
 * - Blue color scheme
 * - Top placement
 * - Standard delay
 *
 * @example
 * ```tsx
 * <InfoTooltip title="Additional information">
 *   <InfoCircleOutlined />
 * </InfoTooltip>
 * ```
 */
export const InfoTooltip: React.FC<TooltipProps> = ({
	placement = TOOLTIP_CONFIGS.info.placement,
	trigger = TOOLTIP_CONFIGS.info.trigger,
	mouseEnterDelay = TOOLTIP_CONFIGS.info.mouseEnterDelay,
	mouseLeaveDelay = TOOLTIP_CONFIGS.info.mouseLeaveDelay,
	color = TOOLTIP_CONFIGS.info.color,
	overlayStyle = TOOLTIP_STYLES.default,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			mouseEnterDelay={mouseEnterDelay}
			mouseLeaveDelay={mouseLeaveDelay}
			color={color}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

// ============================================================================
// STYLED TOOLTIPS
// ============================================================================

/**
 * Wide Tooltip (for longer text)
 * - Max width: 500px
 * - Standard hover behavior
 *
 * @example
 * ```tsx
 * <WideTooltip title="This is a longer tooltip with more detailed information">
 *   <Button>Hover for details</Button>
 * </WideTooltip>
 * ```
 */
export const WideTooltip: React.FC<TooltipProps> = ({
	placement = 'top',
	trigger = 'hover',
	overlayStyle = TOOLTIP_STYLES.wide,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

/**
 * Multiline Tooltip (for multiple lines)
 * - Max width: 400px
 * - Preserves line breaks
 *
 * @example
 * ```tsx
 * <MultilineTooltip title="Line 1\nLine 2\nLine 3">
 *   <Button>Hover me</Button>
 * </MultilineTooltip>
 * ```
 */
export const MultilineTooltip: React.FC<TooltipProps> = ({
	placement = 'top',
	trigger = 'hover',
	overlayStyle = TOOLTIP_STYLES.multiline,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

/**
 * Code Tooltip (for code snippets)
 * - Monospace font
 * - Max width: 600px
 *
 * @example
 * ```tsx
 * <CodeTooltip title="npm install @package/name">
 *   <CodeOutlined />
 * </CodeTooltip>
 * ```
 */
export const CodeTooltip: React.FC<TooltipProps> = ({
	placement = 'top',
	trigger = 'hover',
	overlayStyle = TOOLTIP_STYLES.code,
	...props
}) => {
	return (
		<AntTooltip
			placement={placement}
			trigger={trigger}
			overlayStyle={overlayStyle}
			{...props}
		/>
	);
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default Tooltip;

// Re-export types, configurations, and utilities for convenience
export type { TooltipProps as AntTooltipProps } from 'antd';
export type { TooltipPlacement } from './tooltipConfig';
export {
	TOOLTIP_CONFIGS,
	TOOLTIP_STYLES,
	COMMON_TOOLTIPS,
	truncateText,
	formatMultilineTooltip,
	formatKeyboardShortcut,
	getAutoPlacement,
	shouldDisableTooltip,
	createTooltipWithIcon,
	createAccessibleTooltip,
	isTooltipTooLong,
	shouldUsePopover} from './tooltipConfig';
