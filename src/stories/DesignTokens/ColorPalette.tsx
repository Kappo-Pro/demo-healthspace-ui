/**
 * ColorPalette - Interactive color token demonstration
 *
 * Shows all color categories with copy-to-clipboard functionality
 */

import React, { useState } from 'react';

interface ColorSwatchProps {
	token: string;
	label: string;
	showValue?: boolean;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ token, label, showValue = false }) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(token);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	// Get computed color value
	const computedValue = showValue
		? getComputedStyle(document.documentElement).getPropertyValue(token).trim()
		: '';

	return (
		<div
			onClick={handleCopy}
			style={{
				cursor: 'pointer',
				padding: 'var(--spacing-3)',
				border: '1px solid var(--border-subtle)',
				borderRadius: 'var(--radius-md)',
				transition: 'all 150ms ease',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.borderColor = 'var(--border-brand)';
				e.currentTarget.style.boxShadow = 'var(--shadow-md)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.borderColor = 'var(--border-subtle)';
				e.currentTarget.style.boxShadow = 'none';
			}}
		>
			<div
				style={{
					width: '100%',
					height: 'var(--spacing-16)',
					backgroundColor: `var(${token})`,
					borderRadius: 'var(--radius-sm)',
					marginBottom: 'var(--spacing-2)',
					border: '1px solid var(--border-subtle)',
				}}
			/>
			<div
				style={{
					fontSize: 'var(--font-size-sm)',
					fontFamily: 'var(--font-family-mono)',
					color: 'var(--text-primary)',
					fontWeight: 'var(--font-weight-medium)',
					marginBottom: 'var(--spacing-1)',
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
				{label}
			</div>
			{showValue && computedValue && (
				<div
					style={{
						fontSize: 'var(--font-size-xs)',
						fontFamily: 'var(--font-family-mono)',
						color: 'var(--text-tertiary)',
						marginTop: 'var(--spacing-1)',
					}}
				>
					{computedValue}
				</div>
			)}
			{copied && (
				<div
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						background: 'var(--surface-elevated)',
						color: 'var(--text-primary)',
						padding: 'var(--spacing-2) var(--spacing-3)',
						borderRadius: 'var(--radius-md)',
						boxShadow: 'var(--shadow-lg)',
						fontSize: 'var(--font-size-sm)',
						fontWeight: 'var(--font-weight-medium)',
						pointerEvents: 'none',
					}}
				>
					Copied!
				</div>
			)}
		</div>
	);
};

interface ColorSectionProps {
	title: string;
	description: string;
	colors: Array<{ token: string; label: string }>;
}

const ColorSection: React.FC<ColorSectionProps> = ({ title, description, colors }) => (
	<div style={{ marginBottom: 'var(--spacing-10)' }}>
		<h3
			style={{
				fontFamily: 'var(--font-family-heading)',
				fontSize: 'var(--font-size-xl)',
				color: 'var(--text-primary)',
				marginBottom: 'var(--spacing-2)',
			}}
		>
			{title}
		</h3>
		<p
			style={{
				fontSize: 'var(--font-size-base)',
				color: 'var(--text-secondary)',
				marginBottom: 'var(--spacing-6)',
				lineHeight: 'var(--line-height-relaxed)',
			}}
		>
			{description}
		</p>
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
				gap: 'var(--spacing-4)',
			}}
		>
			{colors.map((color) => (
				<ColorSwatch key={color.token} {...color} />
			))}
		</div>
	</div>
);

export const ColorPalette: React.FC = () => {
	const [showValues, setShowValues] = useState(false);

	return (
		<div style={{ padding: 'var(--spacing-6)' }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: 'var(--spacing-8)',
				}}
			>
				<h2
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-2xl)',
						color: 'var(--text-primary)',
					}}
				>
					Color Tokens
				</h2>
				<label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
					<input
						type="checkbox"
						checked={showValues}
						onChange={(e) => setShowValues(e.target.checked)}
					/>
					<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
						Show computed values
					</span>
				</label>
			</div>

			{/* Brand Colors */}
			<ColorSection
				title="Brand Colors"
				description="Primary brand identity colors. Use these for main CTAs, links, and brand moments."
				colors={[
					{ token: '--brand-primary', label: 'Primary Brand' },
					{ token: '--brand-primary-hover', label: 'Primary Hover' },
					{ token: '--brand-secondary', label: 'Secondary Brand' },
					{ token: '--brand-accent', label: 'Accent' },
					{ token: '--brand-primary-light', label: 'Light Background' },
				]}
			/>

			{/* Text Colors */}
			<ColorSection
				title="Text Colors"
				description="Hierarchical text colors for readability. Use primary for body text, secondary for supporting text."
				colors={[
					{ token: '--text-primary', label: 'Primary Text' },
					{ token: '--text-secondary', label: 'Secondary Text' },
					{ token: '--text-tertiary', label: 'Tertiary Text' },
					{ token: '--text-quaternary', label: 'Quaternary Text' },
					{ token: '--text-placeholder', label: 'Placeholder' },
					{ token: '--text-disabled', label: 'Disabled' },
					{ token: '--text-brand', label: 'Brand Text' },
					{ token: '--text-link', label: 'Link' },
					{ token: '--text-link-hover', label: 'Link Hover' },
				]}
			/>

			{/* Surface Colors */}
			<ColorSection
				title="Surface & Background Colors"
				description="Used for cards, panels, modals, and page backgrounds. Creates visual hierarchy."
				colors={[
					{ token: '--surface-primary', label: 'Primary Surface' },
					{ token: '--surface-secondary', label: 'Secondary Surface' },
					{ token: '--surface-tertiary', label: 'Tertiary Surface' },
					{ token: '--surface-elevated', label: 'Elevated Surface' },
					{ token: '--surface-overlay', label: 'Overlay Surface' },
					{ token: '--surface-brand', label: 'Brand Surface' },
					{ token: '--bg-page', label: 'Page Background' },
					{ token: '--bg-canvas', label: 'Canvas Background' },
				]}
			/>

			{/* Semantic Colors */}
			<ColorSection
				title="Semantic Colors"
				description="Status and feedback colors. Use for success, error, warning, and info states."
				colors={[
					{ token: '--text-success', label: 'Success' },
					{ token: '--text-error', label: 'Error' },
					{ token: '--text-warning', label: 'Warning' },
					{ token: '--text-info', label: 'Info' },
					{ token: '--surface-success', label: 'Success Background' },
					{ token: '--surface-error', label: 'Error Background' },
					{ token: '--surface-warning', label: 'Warning Background' },
					{ token: '--surface-info', label: 'Info Background' },
				]}
			/>

			{/* Border Colors */}
			<ColorSection
				title="Border Colors"
				description="Subtle to prominent borders for visual separation and focus states."
				colors={[
					{ token: '--border-subtle', label: 'Subtle Border' },
					{ token: '--border-default', label: 'Default Border' },
					{ token: '--border-strong', label: 'Strong Border' },
					{ token: '--border-brand', label: 'Brand Border' },
					{ token: '--border-focus', label: 'Focus Border' },
					{ token: '--border-error', label: 'Error Border' },
					{ token: '--border-disabled', label: 'Disabled Border' },
				]}
			/>

			{/* Interactive States */}
			<ColorSection
				title="Button Colors"
				description="Button variant colors including all interactive states."
				colors={[
					{ token: '--button-primary-bg', label: 'Primary Default' },
					{ token: '--button-primary-bg-hover', label: 'Primary Hover' },
					{ token: '--button-primary-bg-active', label: 'Primary Active' },
					{ token: '--button-primary-bg-disabled', label: 'Primary Disabled' },
					{ token: '--button-secondary-bg', label: 'Secondary Default' },
					{ token: '--button-secondary-bg-hover', label: 'Secondary Hover' },
					{ token: '--button-destructive-bg', label: 'Destructive' },
					{ token: '--button-destructive-bg-hover', label: 'Destructive Hover' },
				]}
			/>

			{/* Alpha Colors */}
			<div style={{ marginTop: 'var(--spacing-10)' }}>
				<h3
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-xl)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-2)',
					}}
				>
					Alpha/Transparency Tokens
				</h3>
				<p
					style={{
						fontSize: 'var(--font-size-base)',
						color: 'var(--text-secondary)',
						marginBottom: 'var(--spacing-6)',
						lineHeight: 'var(--line-height-relaxed)',
					}}
				>
					Semi-transparent colors for overlays, hover states, and glassmorphism effects.
				</p>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
						gap: 'var(--spacing-3)',
					}}
				>
					{[5, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((opacity) => (
						<div
							key={`black-alpha-${opacity}`}
							style={{
								padding: 'var(--spacing-3)',
								border: '1px solid var(--border-subtle)',
								borderRadius: 'var(--radius-md)',
							}}
						>
							<div
								style={{
									width: '100%',
									height: 'var(--spacing-12)',
									backgroundColor: `var(--color-black-alpha-${opacity})`,
									borderRadius: 'var(--radius-sm)',
									marginBottom: 'var(--spacing-2)',
									border: '1px solid var(--border-subtle)',
								}}
							/>
							<div
								style={{
									fontSize: 'var(--font-size-xs)',
									fontFamily: 'var(--font-family-mono)',
									color: 'var(--text-secondary)',
								}}
							>
								black-alpha-{opacity}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Usage Tip */}
			<div
				style={{
					marginTop: 'var(--spacing-10)',
					padding: 'var(--spacing-6)',
					background: 'var(--surface-brand)',
					borderLeft: '4px solid var(--brand-primary)',
					borderRadius: 'var(--radius-md)',
				}}
			>
				<h4
					style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-lg)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-2)',
					}}
				>
					💡 Usage Tip
				</h4>
				<p
					style={{
						fontSize: 'var(--font-size-base)',
						color: 'var(--text-secondary)',
						lineHeight: 'var(--line-height-relaxed)',
						marginBottom: 'var(--spacing-3)',
					}}
				>
					Click any color swatch to copy its token name to your clipboard. Always use semantic tokens
					(like <code style={{ fontFamily: 'var(--font-family-mono)', background: 'var(--surface-primary)', padding: '2px 6px', borderRadius: '4px' }}>--text-primary</code>) instead of
					primitive tokens (like <code style={{ fontFamily: 'var(--font-family-mono)', background: 'var(--surface-primary)', padding: '2px 6px', borderRadius: '4px' }}>--color-gray-900</code>) in your components.
				</p>
			</div>
		</div>
	);
};
