/**
 * ButtonStates - Complete button token demonstration
 *
 * Shows all button variants, sizes, and states
 */

import React from 'react';

interface ButtonExampleProps {
	variant: 'primary' | 'secondary' | 'tertiary' | 'destructive';
	size: 'sm' | 'md' | 'lg';
	state: 'default' | 'hover' | 'active' | 'disabled';
	label: string;
}

const ButtonExample: React.FC<ButtonExampleProps> = ({ variant, size, state, label }) => {
	const getButtonStyles = () => {
		const baseStyles = {
			border: 'none',
			borderRadius: `var(--button-radius-${size})`,
			height: `var(--button-height-${size})`,
			padding: `0 var(--button-padding-${size})`,
			fontSize: `var(--button-font-${size})`,
			fontWeight: 'var(--font-weight-medium)',
			cursor: state === 'disabled' ? 'not-allowed' : 'pointer',
			transition: 'all 150ms ease',
			fontFamily: 'var(--font-family-primary)',
		};

		const stateStyles = (() => {
			switch (state) {
				case 'hover':
					return {
						background: `var(--button-${variant}-bg-hover)`,
						color: `var(--button-${variant}-text)`,
						border:
							variant === 'secondary'
								? '1px solid var(--button-secondary-border-hover)'
								: 'none',
					};
				case 'active':
					return {
						background: `var(--button-${variant}-bg-active)`,
						color: `var(--button-${variant}-text)`,
						border:
							variant === 'secondary'
								? '1px solid var(--button-secondary-border-active)'
								: 'none',
					};
				case 'disabled':
					return {
						background: `var(--button-${variant}-bg-disabled)`,
						color: `var(--button-${variant}-text-disabled)`,
						border:
							variant === 'secondary'
								? '1px solid var(--button-secondary-border-disabled)'
								: 'none',
						opacity: variant === 'tertiary' ? '0.5' : '1',
					};
				default:
					return {
						background: `var(--button-${variant}-bg)`,
						color: `var(--button-${variant}-text)`,
						border:
							variant === 'secondary' ? '1px solid var(--button-secondary-border)' : 'none',
					};
			}
		})();

		return { ...baseStyles, ...stateStyles };
	};

	return (
		<button style={getButtonStyles()} disabled={state === 'disabled'}>
			{label}
		</button>
	);
};

export const ButtonStates: React.FC = () => {
	const variants: Array<'primary' | 'secondary' | 'tertiary' | 'destructive'> = [
		'primary',
		'secondary',
		'tertiary',
		'destructive',
	];
	const sizes: Array<'sm' | 'md' | 'lg'> = ['sm', 'md', 'lg'];
	const states: Array<'default' | 'hover' | 'active' | 'disabled'> = [
		'default',
		'hover',
		'active',
		'disabled',
	];

	return (
		<div style={{ padding: 'var(--spacing-6)' }}>
			<h2
				style={{
					fontFamily: 'var(--font-family-heading)',
					fontSize: 'var(--font-size-2xl)',
					color: 'var(--text-primary)',
					marginBottom: 'var(--spacing-8)',
				}}
			>
				Button System
			</h2>

			{/* Button variants */}
			{variants.map((variant) => (
				<div key={variant} style={{ marginBottom: 'var(--spacing-10)' }}>
					<h3
						style={{
							fontFamily: 'var(--font-family-heading)',
							fontSize: 'var(--font-size-xl)',
							color: 'var(--text-primary)',
							marginBottom: 'var(--spacing-2)',
							textTransform: 'capitalize',
						}}
					>
						{variant} Buttons
					</h3>
					<p
						style={{
							fontSize: 'var(--font-size-base)',
							color: 'var(--text-secondary)',
							marginBottom: 'var(--spacing-6)',
						}}
					>
						{variant === 'primary' && 'Main call-to-action buttons. Use sparingly for primary actions.'}
						{variant === 'secondary' &&
							'Alternative actions. Outlined style for less emphasis than primary.'}
						{variant === 'tertiary' &&
							'Subtle actions. Ghost style for minimal visual weight.'}
						{variant === 'destructive' &&
							'Dangerous or destructive actions. Use with caution dialogs.'}
					</p>

					{/* States */}
					<div style={{ marginBottom: 'var(--spacing-6)' }}>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							States
						</h4>
						<div
							style={{
								display: 'flex',
								gap: 'var(--spacing-4)',
								flexWrap: 'wrap',
							}}
						>
							{states.map((state) => (
								<div
									key={state}
									style={{
										padding: 'var(--spacing-4)',
										background: 'var(--surface-secondary)',
										borderRadius: 'var(--radius-md)',
										minWidth: '140px',
									}}
								>
									<div
										style={{
											fontSize: 'var(--font-size-xs)',
											color: 'var(--text-tertiary)',
											marginBottom: 'var(--spacing-2)',
											textTransform: 'capitalize',
										}}
									>
										{state}
									</div>
									<ButtonExample
										variant={variant}
										size="md"
										state={state}
										label={`${variant.charAt(0).toUpperCase()}${variant.slice(1)}`}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Sizes */}
					<div style={{ marginBottom: 'var(--spacing-6)' }}>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Sizes
						</h4>
						<div
							style={{
								display: 'flex',
								gap: 'var(--spacing-4)',
								alignItems: 'center',
								flexWrap: 'wrap',
							}}
						>
							{sizes.map((size) => (
								<div
									key={size}
									style={{
										padding: 'var(--spacing-4)',
										background: 'var(--surface-secondary)',
										borderRadius: 'var(--radius-md)',
									}}
								>
									<div
										style={{
											fontSize: 'var(--font-size-xs)',
											color: 'var(--text-tertiary)',
											marginBottom: 'var(--spacing-2)',
											textTransform: 'uppercase',
										}}
									>
										{size} ({size === 'sm' ? '24px' : size === 'md' ? '32px' : '40px'})
									</div>
									<ButtonExample
										variant={variant}
										size={size}
										state="default"
										label={`Size ${size.toUpperCase()}`}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Token reference */}
					<div
						style={{
							padding: 'var(--spacing-4)',
							background: 'var(--surface-primary)',
							border: '1px solid var(--border-subtle)',
							borderRadius: 'var(--radius-md)',
						}}
					>
						<h4
							style={{
								fontFamily: 'var(--font-family-mono)',
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-2)',
							}}
						>
							Tokens Used:
						</h4>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
								gap: 'var(--spacing-2)',
								fontSize: 'var(--font-size-xs)',
								fontFamily: 'var(--font-family-mono)',
								color: 'var(--text-secondary)',
							}}
						>
							<div>--button-{variant}-bg</div>
							<div>--button-{variant}-bg-hover</div>
							<div>--button-{variant}-bg-active</div>
							<div>--button-{variant}-bg-disabled</div>
							<div>--button-{variant}-text</div>
							<div>--button-{variant}-text-disabled</div>
						</div>
					</div>
				</div>
			))}

			{/* Control size tokens */}
			<div
				style={{
					marginTop: 'var(--spacing-10)',
					padding: 'var(--spacing-6)',
					background: 'var(--surface-secondary)',
					borderRadius: 'var(--radius-lg)',
				}}
			>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					Control Size Tokens
				</h3>
				<p
					style={{
						fontSize: 'var(--font-size-base)',
						color: 'var(--text-secondary)',
						marginBottom: 'var(--spacing-6)',
						lineHeight: 'var(--line-height-relaxed)',
					}}
				>
					Button sizes use the standardized control size system. These tokens ensure consistent sizing
					across all form controls (buttons, inputs, selects).
				</p>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
						gap: 'var(--spacing-4)',
					}}
				>
					{sizes.map((size) => (
						<div
							key={size}
							style={{
								padding: 'var(--spacing-4)',
								background: 'var(--surface-primary)',
								borderRadius: 'var(--radius-md)',
							}}
						>
							<h4
								style={{
									fontSize: 'var(--font-size-base)',
									fontWeight: 'var(--font-weight-semibold)',
									color: 'var(--text-primary)',
									marginBottom: 'var(--spacing-3)',
									textTransform: 'uppercase',
								}}
							>
								{size}
							</h4>
							<div
								style={{
									fontSize: 'var(--font-size-sm)',
									fontFamily: 'var(--font-family-mono)',
									color: 'var(--text-secondary)',
									lineHeight: 'var(--line-height-relaxed)',
								}}
							>
								<div>Height: --button-height-{size}</div>
								<div>Padding: --button-padding-{size}</div>
								<div>Font: --button-font-{size}</div>
								<div>Radius: --button-radius-{size}</div>
								<div>Icon: --button-icon-{size}</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Usage example */}
			<div
				style={{
					marginTop: 'var(--spacing-10)',
					padding: 'var(--spacing-6)',
					background: 'var(--surface-primary)',
					border: '1px solid var(--border-subtle)',
					borderRadius: 'var(--radius-lg)',
				}}
			>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					Usage Example
				</h3>
				<pre
					style={{
						fontFamily: 'var(--font-family-mono)',
						fontSize: 'var(--font-size-sm)',
						color: 'var(--text-secondary)',
						background: 'var(--surface-secondary)',
						padding: 'var(--spacing-4)',
						borderRadius: 'var(--radius-md)',
						overflow: 'auto',
						lineHeight: 'var(--line-height-relaxed)',
						margin: 0,
					}}
				>
{`import { buttonToken, buttonStyle } from '@utils/design-system/tokens';

// Option 1: Use complete button style helper
const PrimaryButton = styled.button\`
  \${buttonStyle('primary', 'md')}
\`;

// Option 2: Use individual tokens
const CustomButton = styled.button\`
  background: \${buttonToken('--button-primary-bg')};
  color: \${buttonToken('--button-primary-text')};
  height: \${buttonToken('--button-height-md')};
  padding: 0 \${buttonToken('--button-padding-md')};
  font-size: \${buttonToken('--button-font-md')};
  border-radius: \${buttonToken('--button-radius-md')};

  &:hover {
    background: \${buttonToken('--button-primary-bg-hover')};
  }

  &:active {
    background: \${buttonToken('--button-primary-bg-active')};
  }

  &:disabled {
    background: \${buttonToken('--button-primary-bg-disabled')};
    color: \${buttonToken('--button-primary-text-disabled')};
  }
\`;`}
				</pre>
			</div>
		</div>
	);
};
