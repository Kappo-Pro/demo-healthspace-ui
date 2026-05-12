/**
 * SpacingDemo - Interactive spacing scale visualization
 *
 * Shows all spacing tokens with visual examples
 */

import React from 'react';

interface SpacingItemProps {
	token: string;
	label: string;
	pixels: string;
}

const SpacingItem: React.FC<SpacingItemProps> = ({ token, label, pixels }) => {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				marginBottom: 'var(--spacing-3)',
				padding: 'var(--spacing-3)',
				background: 'var(--surface-primary)',
				border: '1px solid var(--border-subtle)',
				borderRadius: 'var(--radius-md)',
			}}
		>
			{/* Token name */}
			<div style={{ flex: '0 0 180px', marginRight: 'var(--spacing-4)' }}>
				<div
					style={{
						fontFamily: 'var(--font-family-mono)',
						fontSize: 'var(--font-size-sm)',
						color: 'var(--text-primary)',
						fontWeight: 'var(--font-weight-medium)',
					}}
				>
					{token}
				</div>
				<div
					style={{
						fontSize: 'var(--font-size-xs)',
						color: 'var(--text-secondary)',
					}}
				>
					{pixels}
				</div>
			</div>

			{/* Visual representation */}
			<div
				style={{
					width: `var(${token})`,
					height: 'var(--spacing-8)',
					background: 'var(--brand-primary)',
					borderRadius: 'var(--radius-sm)',
					transition: 'all 150ms ease',
				}}
			/>

			{/* Label */}
			<div
				style={{
					marginLeft: 'var(--spacing-4)',
					fontSize: 'var(--font-size-sm)',
					color: 'var(--text-secondary)',
				}}
			>
				{label}
			</div>
		</div>
	);
};

export const SpacingDemo: React.FC = () => {
	const spacingTokens = [
		{ token: '--spacing-0', label: 'None', pixels: '0px' },
		{ token: '--spacing-0-5', label: 'Minimal', pixels: '2px' },
		{ token: '--spacing-1', label: 'Extra tight', pixels: '4px' },
		{ token: '--spacing-1-5', label: 'Very tight', pixels: '6px' },
		{ token: '--spacing-2', label: 'Tight', pixels: '8px' },
		{ token: '--spacing-2-5', label: 'Compact', pixels: '10px' },
		{ token: '--spacing-3', label: 'Cozy', pixels: '12px' },
		{ token: '--spacing-3-5', label: 'Comfortable', pixels: '14px' },
		{ token: '--spacing-4', label: 'Default', pixels: '16px' },
		{ token: '--spacing-5', label: 'Relaxed', pixels: '20px' },
		{ token: '--spacing-6', label: 'Spacious', pixels: '24px' },
		{ token: '--spacing-7', label: 'Extra spacious', pixels: '28px' },
		{ token: '--spacing-8', label: 'Generous', pixels: '32px' },
		{ token: '--spacing-9', label: 'Extra generous', pixels: '36px' },
		{ token: '--spacing-10', label: 'Roomy', pixels: '40px' },
		{ token: '--spacing-12', label: 'Very roomy', pixels: '48px' },
		{ token: '--spacing-14', label: 'Extra roomy', pixels: '56px' },
		{ token: '--spacing-16', label: 'Large', pixels: '64px' },
		{ token: '--spacing-20', label: 'Extra large', pixels: '80px' },
		{ token: '--spacing-24', label: 'Huge', pixels: '96px' },
		{ token: '--spacing-28', label: 'Extra huge', pixels: '112px' },
		{ token: '--spacing-32', label: 'Massive', pixels: '128px' },
	];

	return (
		<div style={{ padding: 'var(--spacing-6)' }}>
			<h2
				style={{
					fontFamily: 'var(--font-family-heading)',
					fontSize: 'var(--font-size-2xl)',
					color: 'var(--text-primary)',
					marginBottom: 'var(--spacing-2)',
				}}
			>
				Spacing Scale
			</h2>
			<p
				style={{
					fontSize: 'var(--font-size-base)',
					color: 'var(--text-secondary)',
					marginBottom: 'var(--spacing-8)',
					lineHeight: 'var(--line-height-relaxed)',
				}}
			>
				Our spacing system follows a consistent 4px base unit. Use these tokens for padding,
				margin, gap, and positioning to maintain visual rhythm.
			</p>

			{/* Spacing list */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				{spacingTokens.map((spacing) => (
					<SpacingItem key={spacing.token} {...spacing} />
				))}
			</div>

			{/* Common use cases */}
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
					Common Use Cases
				</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
						gap: 'var(--spacing-6)',
					}}
				>
					{/* Icon padding */}
					<div>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Icon Padding
						</h4>
						<div
							style={{
								display: 'flex',
								gap: 'var(--spacing-3)',
								alignItems: 'center',
							}}
						>
							<div
								style={{
									width: 'var(--spacing-10)',
									height: 'var(--spacing-10)',
									background: 'var(--brand-primary)',
									borderRadius: 'var(--radius-md)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									padding: 'var(--spacing-2)',
								}}
							>
								<div
									style={{
										width: 'var(--spacing-4)',
										height: 'var(--spacing-4)',
										background: 'white',
										borderRadius: '50%',
									}}
								/>
							</div>
							<code
								style={{
									fontFamily: 'var(--font-family-mono)',
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
								}}
							>
								padding: spacing-2
							</code>
						</div>
					</div>

					{/* Button padding */}
					<div>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Button Padding
						</h4>
						<button
							style={{
								background: 'var(--button-primary-bg)',
								color: 'var(--button-primary-text)',
								border: 'none',
								borderRadius: 'var(--radius-md)',
								padding: 'var(--spacing-2) var(--spacing-4)',
								fontSize: 'var(--font-size-sm)',
								fontWeight: 'var(--font-weight-medium)',
								cursor: 'pointer',
							}}
						>
							spacing-2 × spacing-4
						</button>
					</div>

					{/* Card padding */}
					<div>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Card Padding
						</h4>
						<div
							style={{
								background: 'var(--surface-primary)',
								border: '1px solid var(--border-subtle)',
								borderRadius: 'var(--radius-lg)',
								padding: 'var(--spacing-6)',
							}}
						>
							<div
								style={{
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
								}}
							>
								padding: spacing-6
							</div>
						</div>
					</div>

					{/* Stack gap */}
					<div>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Stack Gap
						</h4>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: 'var(--spacing-4)',
							}}
						>
							<div
								style={{
									background: 'var(--surface-brand)',
									padding: 'var(--spacing-2)',
									borderRadius: 'var(--radius-sm)',
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
								}}
							>
								Item 1
							</div>
							<div
								style={{
									background: 'var(--surface-brand)',
									padding: 'var(--spacing-2)',
									borderRadius: 'var(--radius-sm)',
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
								}}
							>
								Item 2
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Code example */}
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
{`import { spacingToken } from '@utils/design-system/tokens';

// In styled-components
const Card = styled.div\`
  padding: \${spacingToken('--spacing-6')};
  gap: \${spacingToken('--spacing-4')};
  margin-bottom: \${spacingToken('--spacing-8')};
\`;

// In inline styles
<div style={{
  padding: spacingToken('--spacing-4'),
  gap: spacingToken('--spacing-3'),
}}>
  Content
</div>

// With CSS custom properties
<div style={{
  padding: 'var(--spacing-6)',
  gap: 'var(--spacing-4)',
}}>
  Content
</div>`}
				</pre>
			</div>
		</div>
	);
};
