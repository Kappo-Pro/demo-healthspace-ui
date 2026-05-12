/**
 * ComponentExamples - Real-world component patterns using design tokens
 *
 * Shows practical examples of token usage in common UI patterns
 */

import React from 'react';

export const ComponentExamples: React.FC = () => {
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
				Component Examples
			</h2>
			<p
				style={{
					fontSize: 'var(--font-size-base)',
					color: 'var(--text-secondary)',
					marginBottom: 'var(--spacing-8)',
					lineHeight: 'var(--line-height-relaxed)',
				}}
			>
				Real-world examples showing how design tokens come together to build consistent,
				themeable components.
			</p>

			{/* Card Example */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					1. Card Component
				</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
						gap: 'var(--spacing-6)',
					}}
				>
					{/* Example card */}
					<div
						style={{
							background: 'var(--card-bg)',
							border: '1px solid var(--card-border)',
							borderRadius: 'var(--radius-lg)',
							boxShadow: 'var(--card-shadow)',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								background: 'var(--card-header-bg)',
								borderBottom: '1px solid var(--card-header-border)',
								padding: 'var(--spacing-4)',
							}}
						>
							<h4
								style={{
									fontFamily: 'var(--font-family-heading)',
									fontSize: 'var(--font-size-lg)',
									color: 'var(--text-primary)',
									margin: 0,
								}}
							>
								Patient Summary
							</h4>
						</div>
						<div style={{ padding: 'var(--spacing-6)' }}>
							<p
								style={{
									fontSize: 'var(--font-size-base)',
									color: 'var(--text-secondary)',
									marginBottom: 'var(--spacing-4)',
									lineHeight: 'var(--line-height-relaxed)',
								}}
							>
								This card uses semantic tokens that automatically adapt to the active theme.
							</p>
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
								View Details
							</button>
						</div>
					</div>

					{/* Token breakdown */}
					<div
						style={{
							padding: 'var(--spacing-6)',
							background: 'var(--surface-secondary)',
							borderRadius: 'var(--radius-lg)',
						}}
					>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Tokens Used:
						</h4>
						<pre
							style={{
								fontFamily: 'var(--font-family-mono)',
								fontSize: 'var(--font-size-xs)',
								color: 'var(--text-secondary)',
								lineHeight: 'var(--line-height-relaxed)',
								margin: 0,
							}}
						>
{`background: --card-bg
border: --card-border
shadow: --card-shadow
radius: --radius-lg

header:
  background: --card-header-bg
  border: --card-header-border
  padding: --spacing-4

body:
  padding: --spacing-6
  color: --text-secondary`}
						</pre>
					</div>
				</div>
			</div>

			{/* Form Input Example */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					2. Form Input Component
				</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
						gap: 'var(--spacing-6)',
					}}
				>
					{/* Form examples */}
					<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
						{/* Normal input */}
						<div>
							<label
								style={{
									display: 'block',
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-primary)',
									fontWeight: 'var(--font-weight-medium)',
									marginBottom: 'var(--spacing-2)',
								}}
							>
								Patient Name
							</label>
							<input
								type="text"
								placeholder="Enter patient name..."
								style={{
									width: '100%',
									height: 'var(--input-height-md)',
									padding: '0 var(--input-padding-md)',
									fontSize: 'var(--input-font-md)',
									background: 'var(--input-bg)',
									color: 'var(--input-text)',
									border: '1px solid var(--input-border)',
									borderRadius: 'var(--radius-md)',
									outline: 'none',
									transition: 'border-color 150ms ease',
								}}
								onFocus={(e) => {
									e.currentTarget.style.borderColor = 'var(--input-border-focus)';
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = 'var(--input-border)';
								}}
							/>
						</div>

						{/* Error state */}
						<div>
							<label
								style={{
									display: 'block',
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-primary)',
									fontWeight: 'var(--font-weight-medium)',
									marginBottom: 'var(--spacing-2)',
								}}
							>
								Email Address
							</label>
							<input
								type="email"
								placeholder="invalid@email"
								style={{
									width: '100%',
									height: 'var(--input-height-md)',
									padding: '0 var(--input-padding-md)',
									fontSize: 'var(--input-font-md)',
									background: 'var(--input-bg)',
									color: 'var(--input-text)',
									border: '1px solid var(--input-border-error)',
									borderRadius: 'var(--radius-md)',
									outline: 'none',
								}}
							/>
							<div
								style={{
									fontSize: 'var(--font-size-xs)',
									color: 'var(--text-error)',
									marginTop: 'var(--spacing-1)',
								}}
							>
								Please enter a valid email address
							</div>
						</div>

						{/* Disabled state */}
						<div>
							<label
								style={{
									display: 'block',
									fontSize: 'var(--font-size-sm)',
									color: 'var(--text-disabled)',
									fontWeight: 'var(--font-weight-medium)',
									marginBottom: 'var(--spacing-2)',
								}}
							>
								Medical Record Number
							</label>
							<input
								type="text"
								value="MRN-123456"
								disabled
								style={{
									width: '100%',
									height: 'var(--input-height-md)',
									padding: '0 var(--input-padding-md)',
									fontSize: 'var(--input-font-md)',
									background: 'var(--input-bg-disabled)',
									color: 'var(--input-text-disabled)',
									border: '1px solid var(--border-disabled)',
									borderRadius: 'var(--radius-md)',
									cursor: 'not-allowed',
								}}
							/>
						</div>
					</div>

					{/* Token breakdown */}
					<div
						style={{
							padding: 'var(--spacing-6)',
							background: 'var(--surface-secondary)',
							borderRadius: 'var(--radius-lg)',
						}}
					>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Input Tokens:
						</h4>
						<pre
							style={{
								fontFamily: 'var(--font-family-mono)',
								fontSize: 'var(--font-size-xs)',
								color: 'var(--text-secondary)',
								lineHeight: 'var(--line-height-relaxed)',
								margin: 0,
							}}
						>
{`default:
  background: --input-bg
  color: --input-text
  border: --input-border
  height: --input-height-md
  padding: --input-padding-md

focus:
  border: --input-border-focus

error:
  border: --input-border-error
  message: --text-error

disabled:
  background: --input-bg-disabled
  color: --input-text-disabled
  border: --border-disabled`}
						</pre>
					</div>
				</div>
			</div>

			{/* Navigation Example */}
			<div style={{ marginBottom: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-4)',
					}}
				>
					3. Navigation Component
				</h3>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
						gap: 'var(--spacing-6)',
					}}
				>
					{/* Nav example */}
					<div
						style={{
							background: 'var(--nav-bg)',
							padding: 'var(--spacing-4)',
							borderRadius: 'var(--radius-lg)',
						}}
					>
						<nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
							<a
								href="#"
								style={{
									display: 'block',
									color: 'var(--nav-text)',
									textDecoration: 'none',
									padding: 'var(--spacing-3)',
									borderRadius: 'var(--radius-md)',
									fontSize: 'var(--font-size-sm)',
									fontWeight: 'var(--font-weight-medium)',
									background: 'var(--nav-item-active-bg)',
								}}
							>
								Dashboard (Active)
							</a>
							<a
								href="#"
								style={{
									display: 'block',
									color: 'var(--nav-text)',
									textDecoration: 'none',
									padding: 'var(--spacing-3)',
									borderRadius: 'var(--radius-md)',
									fontSize: 'var(--font-size-sm)',
									fontWeight: 'var(--font-weight-medium)',
									transition: 'background 150ms ease',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = 'var(--nav-item-hover-bg)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'transparent';
								}}
							>
								Patients
							</a>
							<a
								href="#"
								style={{
									display: 'block',
									color: 'var(--nav-text)',
									textDecoration: 'none',
									padding: 'var(--spacing-3)',
									borderRadius: 'var(--radius-md)',
									fontSize: 'var(--font-size-sm)',
									fontWeight: 'var(--font-weight-medium)',
									transition: 'background 150ms ease',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = 'var(--nav-item-hover-bg)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'transparent';
								}}
							>
								Reports
							</a>
						</nav>
					</div>

					{/* Token breakdown */}
					<div
						style={{
							padding: 'var(--spacing-6)',
							background: 'var(--surface-secondary)',
							borderRadius: 'var(--radius-lg)',
						}}
					>
						<h4
							style={{
								fontSize: 'var(--font-size-base)',
								fontWeight: 'var(--font-weight-semibold)',
								color: 'var(--text-primary)',
								marginBottom: 'var(--spacing-3)',
							}}
						>
							Navigation Tokens:
						</h4>
						<pre
							style={{
								fontFamily: 'var(--font-family-mono)',
								fontSize: 'var(--font-size-xs)',
								color: 'var(--text-secondary)',
								lineHeight: 'var(--line-height-relaxed)',
								margin: 0,
							}}
						>
{`background: --nav-bg
text: --nav-text
padding: --spacing-4
gap: --spacing-2

item:
  active: --nav-item-active-bg
  hover: --nav-item-hover-bg
  padding: --spacing-3
  radius: --radius-md`}
						</pre>
					</div>
				</div>
			</div>

			{/* Best Practices */}
			<div
				style={{
					padding: 'var(--spacing-6)',
					background: 'var(--surface-brand)',
					borderLeft: '4px solid var(--brand-primary)',
					borderRadius: 'var(--radius-md)',
				}}
			>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-lg)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-3)',
					}}
				>
					Best Practices
				</h3>
				<ul
					style={{
						fontSize: 'var(--font-size-base)',
						color: 'var(--text-secondary)',
						lineHeight: 'var(--line-height-relaxed)',
						margin: 0,
						paddingLeft: 'var(--spacing-6)',
					}}
				>
					<li>Always use semantic tokens (--text-primary) over primitives (--color-gray-900)</li>
					<li>Use token utility functions for type safety and IDE autocomplete</li>
					<li>Group related tokens logically (card tokens, input tokens, etc.)</li>
					<li>Test components in both light and dark themes</li>
					<li>Use control size tokens for consistent form element sizing</li>
					<li>Leverage hover/active/disabled state tokens for interactive elements</li>
				</ul>
			</div>
		</div>
	);
};
