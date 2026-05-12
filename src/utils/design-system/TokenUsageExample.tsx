/**
 * Design Token Usage Examples
 *
 * Demonstrates various ways to use type-safe design tokens in React components.
 * This file serves as both documentation and a test of the token system.
 *
 * @example
 * ```typescript
 * import { TokenUsageExample } from '@utils/design-system/TokenUsageExample';
 *
 * function App() {
 *   return <TokenUsageExample />;
 * }
 * ```
 */

import React from 'react';
import styled from 'styled-components';
import {
	token,
	colorToken,
	spacingToken,
	shadowToken,
	tokens,
	buttonStyle,
	cardStyle,
	inputStyle
} from './tokens';
import type { ColorToken, SpacingToken } from '../../types/design-tokens';

/* ============================================
   EXAMPLE 1: Inline Styles with Type Safety
   ============================================ */

export function Example1_InlineStyles() {
	return (
		<div
			style={{
				backgroundColor: colorToken('--surface-primary'),
				padding: spacingToken('--spacing-6'),
				borderRadius: '8px',
				boxShadow: token('--shadow-md'),
				border: `1px solid ${colorToken('--border-default')}`
			}}
		>
			<h3
				style={{
					color: colorToken('--text-primary'),
					marginBottom: spacingToken('--spacing-4'),
					fontFamily: token('--font-family-heading')
				}}
			>
				Type-Safe Inline Styles
			</h3>
			<p style={{ color: colorToken('--text-secondary') }}>
				All tokens are type-checked at compile time!
			</p>
		</div>
	);
}

/* ============================================
   EXAMPLE 2: Styled-Components with Tokens Proxy
   ============================================ */

const StyledCard = styled.div`
	background-color: ${tokens['--surface-primary']};
	padding: ${tokens['--spacing-6']};
	border-radius: ${tokens['--radius-lg']};
	box-shadow: ${tokens['--shadow-md']};
	border: 1px solid ${tokens['--border-default']};
	transition: ${tokens['--transition-card']};

	&:hover {
		box-shadow: ${tokens['--shadow-lg']};
		transform: translateY(-2px);
	}
`;

const StyledHeading = styled.h3`
	color: ${tokens['--text-primary']};
	font-family: ${tokens['--font-family-heading']};
	font-size: ${tokens['--font-size-xl']};
	margin-bottom: ${tokens['--spacing-4']};
`;

const StyledText = styled.p`
	color: ${tokens['--text-secondary']};
	font-size: ${tokens['--font-size-base']};
	line-height: ${tokens['--line-height-relaxed']};
`;

export function Example2_StyledComponents() {
	return (
		<StyledCard>
			<StyledHeading>Styled-Components with Tokens</StyledHeading>
			<StyledText>
				Using the tokens proxy for convenient access with full type safety!
			</StyledText>
		</StyledCard>
	);
}

/* ============================================
   EXAMPLE 3: Composite Style Functions
   ============================================ */

export function Example3_CompositeStyles() {
	// Get pre-configured button styles
	const primaryButtonStyles = buttonStyle('primary', 'md');
	const secondaryButtonStyles = buttonStyle('secondary', 'sm');

	// Get pre-configured card styles
	const elevatedCardStyles = cardStyle(true);

	// Get pre-configured input styles
	const largeInputStyles = inputStyle('lg', false);

	return (
		<div style={elevatedCardStyles}>
			<h3 style={{ marginBottom: spacingToken('--spacing-4') }}>
				Composite Style Functions
			</h3>

			<div style={{ display: 'flex', gap: spacingToken('--spacing-3'), marginBottom: spacingToken('--spacing-4') }}>
				<button style={primaryButtonStyles as React.CSSProperties}>
					Primary Button
				</button>
				<button style={secondaryButtonStyles as React.CSSProperties}>
					Secondary
				</button>
			</div>

			<input
				type="text"
				placeholder="Large input with error handling"
				style={largeInputStyles as React.CSSProperties}
			/>
		</div>
	);
}

/* ============================================
   EXAMPLE 4: Dynamic Token Selection
   ============================================ */

interface StatusBadgeProps {
	status: 'success' | 'warning' | 'error' | 'info';
	children: React.ReactNode;
}

export function Example4_DynamicTokens({ status, children }: StatusBadgeProps) {
	// Type-safe dynamic token selection
	const bgToken: ColorToken = `--badge-bg-${status}` as ColorToken;
	const textToken: ColorToken = `--badge-text-${status}` as ColorToken;

	return (
		<span
			style={{
				backgroundColor: colorToken(bgToken),
				color: colorToken(textToken),
				padding: `${spacingToken('--spacing-1')} ${spacingToken('--spacing-3')}`,
				borderRadius: spacingToken('--spacing-1'),
				fontSize: token('--font-size-sm'),
				fontWeight: token('--font-weight-medium')
			}}
		>
			{children}
		</span>
	);
}

/* ============================================
   EXAMPLE 5: Responsive Spacing
   ============================================ */

const spacings: SpacingToken[] = [
	'--spacing-0',
	'--spacing-1',
	'--spacing-2',
	'--spacing-4',
	'--spacing-6',
	'--spacing-8',
	'--spacing-12'
];

export function Example5_ResponsiveSpacing() {
	return (
		<div style={{ padding: spacingToken('--spacing-6') }}>
			<h3 style={{ marginBottom: spacingToken('--spacing-4') }}>
				Spacing Scale
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: spacingToken('--spacing-2') }}>
				{spacings.map(spacing => (
					<div
						key={spacing}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: spacingToken('--spacing-3')
						}}
					>
						<div
							style={{
								width: spacingToken(spacing),
								height: spacingToken('--spacing-4'),
								backgroundColor: colorToken('--brand-primary'),
								borderRadius: spacingToken('--spacing-1')
							}}
						/>
						<code style={{ fontSize: token('--font-size-sm') }}>
							{spacing}
						</code>
					</div>
				))}
			</div>
		</div>
	);
}

/* ============================================
   EXAMPLE 6: Theme-Aware Component
   ============================================ */

const ThemeCard = styled.div`
	background-color: ${tokens['--surface-elevated']};
	color: ${tokens['--text-primary']};
	padding: ${tokens['--spacing-6']};
	border-radius: ${tokens['--radius-lg']};
	box-shadow: ${tokens['--shadow-xl']};
	transition: ${tokens['--transition-card']};

	/* Will automatically adapt to theme changes */
	border: 1px solid ${tokens['--border-subtle']};
`;

const ThemeButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
	background-color: ${props =>
		props.variant === 'secondary'
			? tokens['--button-secondary-bg']
			: tokens['--button-primary-bg']};
	color: ${props =>
		props.variant === 'secondary'
			? tokens['--button-secondary-text']
			: tokens['--button-primary-text']};
	border: 1px solid
		${props =>
			props.variant === 'secondary'
				? tokens['--button-secondary-border']
				: tokens['--button-primary-border']};
	padding: ${tokens['--spacing-3']} ${tokens['--spacing-6']};
	border-radius: ${tokens['--radius-md']};
	font-size: ${tokens['--font-size-base']};
	font-weight: ${tokens['--font-weight-medium']};
	cursor: pointer;
	transition: ${tokens['--transition-button']};

	&:hover {
		background-color: ${props =>
			props.variant === 'secondary'
				? tokens['--button-secondary-bg-hover']
				: tokens['--button-primary-bg-hover']};
	}

	&:active {
		background-color: ${props =>
			props.variant === 'secondary'
				? tokens['--button-secondary-bg-active']
				: tokens['--button-primary-bg-active']};
	}

	&:disabled {
		background-color: ${props =>
			props.variant === 'secondary'
				? tokens['--button-secondary-bg-disabled']
				: tokens['--button-primary-bg-disabled']};
		cursor: not-allowed;
		opacity: ${tokens['--opacity-60']};
	}
`;

export function Example6_ThemeAware() {
	return (
		<ThemeCard>
			<h3 style={{ marginBottom: spacingToken('--spacing-4') }}>
				Theme-Aware Component
			</h3>
			<p style={{ marginBottom: spacingToken('--spacing-4'), color: colorToken('--text-secondary') }}>
				This component automatically adapts to theme changes (light/dark/vibrant)
			</p>
			<div style={{ display: 'flex', gap: spacingToken('--spacing-3') }}>
				<ThemeButton variant="primary">Primary Action</ThemeButton>
				<ThemeButton variant="secondary">Secondary Action</ThemeButton>
			</div>
		</ThemeCard>
	);
}

/* ============================================
   EXAMPLE 7: All Examples Combined
   ============================================ */

export function TokenUsageExample() {
	return (
		<div
			style={{
				padding: spacingToken('--spacing-8'),
				backgroundColor: colorToken('--bg-page'),
				minHeight: '100vh'
			}}
		>
			<h1
				style={{
					color: colorToken('--text-primary'),
					fontFamily: token('--font-family-heading'),
					fontSize: token('--font-size-4xl'),
					marginBottom: spacingToken('--spacing-8')
				}}
			>
				Design Token Usage Examples
			</h1>

			<div
				style={{
					display: 'grid',
					gap: spacingToken('--spacing-6'),
					gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
				}}
			>
				<Example1_InlineStyles />
				<Example2_StyledComponents />
				<Example3_CompositeStyles />
				<Example6_ThemeAware />

				<div>
					<h3 style={{ marginBottom: spacingToken('--spacing-4') }}>
						Status Badges
					</h3>
					<div style={{ display: 'flex', gap: spacingToken('--spacing-2'), flexWrap: 'wrap' }}>
						<Example4_DynamicTokens status="success">Success</Example4_DynamicTokens>
						<Example4_DynamicTokens status="warning">Warning</Example4_DynamicTokens>
						<Example4_DynamicTokens status="error">Error</Example4_DynamicTokens>
						<Example4_DynamicTokens status="info">Info</Example4_DynamicTokens>
					</div>
				</div>

				<Example5_ResponsiveSpacing />
			</div>
		</div>
	);
}

export default TokenUsageExample;
