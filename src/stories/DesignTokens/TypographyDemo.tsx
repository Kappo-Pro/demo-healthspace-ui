/**
 * TypographyDemo - Typography scale and font system
 *
 * Shows font families, sizes, weights, line heights
 */

import React from 'react';

export const TypographyDemo: React.FC = () => {
	const fontSizes = [
		{ token: '--font-size-xs', label: 'Extra Small', pixels: '12px' },
		{ token: '--font-size-sm', label: 'Small', pixels: '14px' },
		{ token: '--font-size-base', label: 'Base', pixels: '18px' },
		{ token: '--font-size-lg', label: 'Large', pixels: '20px' },
		{ token: '--font-size-xl', label: 'Extra Large', pixels: '24px' },
		{ token: '--font-size-2xl', label: '2X Large', pixels: '30px' },
		{ token: '--font-size-3xl', label: '3X Large', pixels: '36px' },
		{ token: '--font-size-4xl', label: '4X Large', pixels: '48px' },
		{ token: '--font-size-5xl', label: '5X Large', pixels: '60px' },
		{ token: '--font-size-6xl', label: '6X Large', pixels: '72px' },
	];

	const fontWeights = [
		{ token: '--font-weight-light', value: '300', label: 'Light' },
		{ token: '--font-weight-normal', value: '400', label: 'Normal' },
		{ token: '--font-weight-medium', value: '500', label: 'Medium' },
		{ token: '--font-weight-semibold', value: '600', label: 'Semibold' },
		{ token: '--font-weight-bold', value: '700', label: 'Bold' },
		{ token: '--font-weight-extrabold', value: '800', label: 'Extrabold' },
	];

	const lineHeights = [
		{ token: '--line-height-none', value: '1', label: 'None' },
		{ token: '--line-height-tight', value: '1.25', label: 'Tight' },
		{ token: '--line-height-snug', value: '1.375', label: 'Snug' },
		{ token: '--line-height-normal', value: '1.5', label: 'Normal' },
		{ token: '--line-height-relaxed', value: '1.625', label: 'Relaxed' },
		{ token: '--line-height-loose', value: '2', label: 'Loose' },
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
				Typography System
			</h2>

			{/* Font Families */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					Font Families
				</h3>

				<div
					style={{
						display: 'grid',
						gap: 'var(--spacing-4)',
					}}
				>
					<div
						style={{
							padding: 'var(--spacing-6)',
							background: 'var(--surface-primary)',
							border: '1px solid var(--border-subtle)',
							borderRadius: 'var(--radius-lg)',
						}}
					>
						<div
							style={{
								fontFamily: 'var(--font-family-mono)',
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-secondary)',
								marginBottom: 'var(--spacing-2)',
							}}
						>
							--font-family-heading
						</div>
						<div
							style={{
								fontFamily: 'var(--font-family-heading)',
								fontSize: 'var(--font-size-2xl)',
								color: 'var(--text-primary)',
								fontWeight: 'var(--font-weight-semibold)',
							}}
						>
							Poppins - The quick brown fox jumps over the lazy dog
						</div>
						<div
							style={{
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-tertiary)',
								marginTop: 'var(--spacing-2)',
							}}
						>
							Use for: Headings, titles, brand moments
						</div>
					</div>

					<div
						style={{
							padding: 'var(--spacing-6)',
							background: 'var(--surface-primary)',
							border: '1px solid var(--border-subtle)',
							borderRadius: 'var(--radius-lg)',
						}}
					>
						<div
							style={{
								fontFamily: 'var(--font-family-mono)',
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-secondary)',
								marginBottom: 'var(--spacing-2)',
							}}
						>
							--font-family-primary
						</div>
						<div
							style={{
								fontFamily: 'var(--font-family-primary)',
								fontSize: 'var(--font-size-lg)',
								color: 'var(--text-primary)',
							}}
						>
							Inter - The quick brown fox jumps over the lazy dog
						</div>
						<div
							style={{
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-tertiary)',
								marginTop: 'var(--spacing-2)',
							}}
						>
							Use for: Body text, UI elements, forms
						</div>
					</div>

					<div
						style={{
							padding: 'var(--spacing-6)',
							background: 'var(--surface-primary)',
							border: '1px solid var(--border-subtle)',
							borderRadius: 'var(--radius-lg)',
						}}
					>
						<div
							style={{
								fontFamily: 'var(--font-family-mono)',
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-secondary)',
								marginBottom: 'var(--spacing-2)',
							}}
						>
							--font-family-mono
						</div>
						<div
							style={{
								fontFamily: 'var(--font-family-mono)',
								fontSize: 'var(--font-size-base)',
								color: 'var(--text-primary)',
							}}
						>
							SF Mono - The quick brown fox jumps over the lazy dog
						</div>
						<div
							style={{
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-tertiary)',
								marginTop: 'var(--spacing-2)',
							}}
						>
							Use for: Code snippets, technical content, token names
						</div>
					</div>
				</div>
			</div>

			{/* Font Sizes */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					Font Size Scale
				</h3>

				<div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
					{fontSizes.map((size) => (
						<div
							key={size.token}
							style={{
								padding: 'var(--spacing-4)',
								background: 'var(--surface-primary)',
								border: '1px solid var(--border-subtle)',
								borderRadius: 'var(--radius-md)',
								display: 'flex',
								alignItems: 'center',
								gap: 'var(--spacing-4)',
							}}
						>
							<div style={{ flex: '0 0 200px' }}>
								<div
									style={{
										fontFamily: 'var(--font-family-mono)',
										fontSize: 'var(--font-size-sm)',
										color: 'var(--text-primary)',
										fontWeight: 'var(--font-weight-medium)',
									}}
								>
									{size.token}
								</div>
								<div
									style={{
										fontSize: 'var(--font-size-xs)',
										color: 'var(--text-secondary)',
									}}
								>
									{size.pixels} • {size.label}
								</div>
							</div>
							<div
								style={{
									fontSize: `var(${size.token})`,
									color: 'var(--text-primary)',
									fontFamily: 'var(--font-family-primary)',
								}}
							>
								The quick brown fox
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Font Weights */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					Font Weights
				</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
						gap: 'var(--spacing-4)',
					}}
				>
					{fontWeights.map((weight) => (
						<div
							key={weight.token}
							style={{
								padding: 'var(--spacing-4)',
								background: 'var(--surface-primary)',
								border: '1px solid var(--border-subtle)',
								borderRadius: 'var(--radius-md)',
							}}
						>
							<div
								style={{
									fontFamily: 'var(--font-family-mono)',
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
									marginBottom: 'var(--spacing-2)',
								}}
							>
								{weight.token} ({weight.value})
							</div>
							<div
								style={{
									fontSize: 'var(--font-size-lg)',
									fontWeight: `var(${weight.token})`,
									color: 'var(--text-primary)',
								}}
							>
								{weight.label} Text
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Line Heights */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					Line Heights
				</h3>

				<div
					style={{
						display: 'grid',
						gap: 'var(--spacing-4)',
					}}
				>
					{lineHeights.map((lh) => (
						<div
							key={lh.token}
							style={{
								padding: 'var(--spacing-4)',
								background: 'var(--surface-primary)',
								border: '1px solid var(--border-subtle)',
								borderRadius: 'var(--radius-md)',
							}}
						>
							<div
								style={{
									fontFamily: 'var(--font-family-mono)',
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
									marginBottom: 'var(--spacing-2)',
								}}
							>
								{lh.token} ({lh.value} • {lh.label})
							</div>
							<div
								style={{
									fontSize: 'var(--font-size-base)',
									lineHeight: `var(${lh.token})`,
									color: 'var(--text-primary)',
								}}
							>
								The quick brown fox jumps over the lazy dog. The five boxing wizards jump
								quickly. Pack my box with five dozen liquor jugs. How vexingly quick daft
								zebras jump!
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Usage Example */}
			<div
				style={{
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
					Usage Example
				</h3>
				<pre
					style={{
						fontFamily: 'var(--font-family-mono)',
						fontSize: 'var(--font-size-sm)',
						color: 'var(--text-secondary)',
						background: 'var(--surface-primary)',
						padding: 'var(--spacing-4)',
						borderRadius: 'var(--radius-md)',
						overflow: 'auto',
						lineHeight: 'var(--line-height-relaxed)',
						margin: 0,
					}}
				>
{`import { typographyToken } from '@utils/design-system/tokens';

// In styled-components
const Heading = styled.h1\`
  font-family: \${typographyToken('--font-family-heading')};
  font-size: \${typographyToken('--font-size-3xl')};
  font-weight: \${typographyToken('--font-weight-bold')};
  line-height: \${typographyToken('--line-height-tight')};
\`;

// In inline styles
<h1 style={{
  fontFamily: 'var(--font-family-heading)',
  fontSize: 'var(--font-size-2xl)',
  fontWeight: 'var(--font-weight-semibold)',
  lineHeight: 'var(--line-height-snug)',
}}>
  Page Title
</h1>`}
				</pre>
			</div>
		</div>
	);
};
