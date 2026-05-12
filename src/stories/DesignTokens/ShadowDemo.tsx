/**
 * ShadowDemo - Shadow elevation scale visualization
 *
 * Shows all shadow tokens with interactive examples
 */

import React from 'react';

export const ShadowDemo: React.FC = () => {
	const shadows = [
		{ token: '--shadow-xs', label: 'Extra Small', use: 'Subtle borders, minimal depth' },
		{ token: '--shadow-sm', label: 'Small', use: 'Cards, list items' },
		{ token: '--shadow-md', label: 'Medium', use: 'Hover states, raised cards' },
		{ token: '--shadow-lg', label: 'Large', use: 'Dropdowns, popovers' },
		{ token: '--shadow-xl', label: 'Extra Large', use: 'Modals, dialogs' },
		{ token: '--shadow-2xl', label: '2X Large', use: 'Major overlays' },
		{ token: '--shadow-3xl', label: '3X Large', use: 'Maximum elevation' },
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
				Shadow Elevation Scale
			</h2>
			<p
				style={{
					fontSize: 'var(--font-size-base)',
					color: 'var(--text-secondary)',
					marginBottom: 'var(--spacing-8)',
					lineHeight: 'var(--line-height-relaxed)',
				}}
			>
				Shadows create visual hierarchy and depth. Use progressively larger shadows for
				higher elevation levels.
			</p>

			{/* Shadow examples */}
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
					gap: 'var(--spacing-8)',
					marginBottom: 'var(--spacing-10)',
				}}
			>
				{shadows.map((shadow) => (
					<div
						key={shadow.token}
						style={{
							background: 'var(--surface-primary)',
							padding: 'var(--spacing-6)',
							borderRadius: 'var(--radius-lg)',
							boxShadow: `var(${shadow.token})`,
							transition: 'transform 200ms ease',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = 'translateY(-4px)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = 'translateY(0)';
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
							{shadow.token}
						</div>
						<div
							style={{
								fontSize: 'var(--font-size-lg)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-2)',
							}}
						>
							{shadow.label}
						</div>
						<div
							style={{
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-tertiary)',
							}}
						>
							{shadow.use}
						</div>
					</div>
				))}
			</div>

			{/* Semantic shadow usage */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					Semantic Shadow Usage
				</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
						gap: 'var(--spacing-6)',
					}}
				>
					{/* Card shadow */}
					<div>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Card Shadow
						</h4>
						<div
							style={{
								background: 'var(--card-bg)',
								border: '1px solid var(--card-border)',
								borderRadius: 'var(--radius-lg)',
								padding: 'var(--spacing-4)',
								boxShadow: 'var(--card-shadow)',
							}}
						>
							<div
								style={{
									fontFamily: 'var(--font-family-mono)',
									fontSize: 'var(--font-size-xs)',
									color: 'var(--text-tertiary)',
								}}
							>
								--card-shadow
							</div>
							<div
								style={{
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
									marginTop: 'var(--spacing-2)',
								}}
							>
								Standard card elevation
							</div>
						</div>
					</div>

					{/* Modal shadow */}
					<div>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Modal Shadow
						</h4>
						<div
							style={{
								background: 'var(--modal-bg)',
								border: '1px solid var(--modal-border)',
								borderRadius: 'var(--radius-lg)',
								padding: 'var(--spacing-4)',
								boxShadow: 'var(--modal-shadow)',
							}}
						>
							<div
								style={{
									fontFamily: 'var(--font-family-mono)',
									fontSize: 'var(--font-size-xs)',
									color: 'var(--text-tertiary)',
								}}
							>
								--modal-shadow
							</div>
							<div
								style={{
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
									marginTop: 'var(--spacing-2)',
								}}
							>
								High elevation overlay
							</div>
						</div>
					</div>

					{/* Dropdown shadow */}
					<div>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Dropdown Shadow
						</h4>
						<div
							style={{
								background: 'var(--dropdown-bg)',
								border: '1px solid var(--dropdown-border)',
								borderRadius: 'var(--radius-md)',
								padding: 'var(--spacing-4)',
								boxShadow: 'var(--dropdown-shadow)',
							}}
						>
							<div
								style={{
									fontFamily: 'var(--font-family-mono)',
									fontSize: 'var(--font-size-xs)',
									color: 'var(--text-tertiary)',
								}}
							>
								--dropdown-shadow
							</div>
							<div
								style={{
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-secondary)',
									marginTop: 'var(--spacing-2)',
								}}
							>
								Menu elevation
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Interactive example */}
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
					Interactive Example
				</h3>
				<p
					style={{
						fontSize: 'var(--font-size-base)',
						color: 'var(--text-secondary)',
						marginBottom: 'var(--spacing-6)',
					}}
				>
					Hover over cards above to see shadow transitions in action. Shadows help indicate
					interactive states.
				</p>

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
{`import { shadowToken } from '@utils/design-system/tokens';

// In styled-components
const Card = styled.div\`
  box-shadow: \${shadowToken('--shadow-sm')};
  transition: box-shadow 200ms ease;

  &:hover {
    box-shadow: \${shadowToken('--shadow-md')};
  }
\`;

// Semantic shadow tokens
const Modal = styled.div\`
  box-shadow: \${shadowToken('--modal-shadow')};
\`;

const Dropdown = styled.div\`
  box-shadow: \${shadowToken('--dropdown-shadow')};
\`;`}
				</pre>
			</div>
		</div>
	);
};
