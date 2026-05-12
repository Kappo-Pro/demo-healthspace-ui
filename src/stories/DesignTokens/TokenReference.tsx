/**
 * TokenReference - Searchable token reference table
 *
 * Complete token reference with search and copy functionality
 */

import React, { useState, useMemo } from 'react';

interface Token {
	name: string;
	category: string;
	description: string;
	value?: string;
}

const tokenData: Token[] = [
	// Brand Colors
	{ name: '--brand-primary', category: 'Brand', description: 'Primary brand color' },
	{ name: '--brand-primary-hover', category: 'Brand', description: 'Primary brand hover state' },
	{ name: '--brand-secondary', category: 'Brand', description: 'Secondary brand color' },
	{ name: '--brand-accent', category: 'Brand', description: 'Accent brand color' },

	// Text Colors
	{ name: '--text-primary', category: 'Text', description: 'Primary text color' },
	{ name: '--text-secondary', category: 'Text', description: 'Secondary text color' },
	{ name: '--text-tertiary', category: 'Text', description: 'Tertiary text color' },
	{ name: '--text-quaternary', category: 'Text', description: 'Quaternary text color' },
	{ name: '--text-placeholder', category: 'Text', description: 'Placeholder text color' },
	{ name: '--text-disabled', category: 'Text', description: 'Disabled text color' },
	{ name: '--text-brand', category: 'Text', description: 'Brand text color' },
	{ name: '--text-link', category: 'Text', description: 'Link text color' },
	{ name: '--text-link-hover', category: 'Text', description: 'Link hover color' },
	{ name: '--text-success', category: 'Text', description: 'Success text color' },
	{ name: '--text-error', category: 'Text', description: 'Error text color' },
	{ name: '--text-warning', category: 'Text', description: 'Warning text color' },
	{ name: '--text-info', category: 'Text', description: 'Info text color' },

	// Surfaces
	{ name: '--surface-primary', category: 'Surface', description: 'Primary surface/background' },
	{ name: '--surface-secondary', category: 'Surface', description: 'Secondary surface' },
	{ name: '--surface-tertiary', category: 'Surface', description: 'Tertiary surface' },
	{ name: '--surface-elevated', category: 'Surface', description: 'Elevated surface (cards)' },
	{ name: '--surface-brand', category: 'Surface', description: 'Brand surface background' },
	{ name: '--bg-page', category: 'Surface', description: 'Page background' },
	{ name: '--bg-canvas', category: 'Surface', description: 'Canvas background' },

	// Borders
	{ name: '--border-subtle', category: 'Border', description: 'Subtle border' },
	{ name: '--border-default', category: 'Border', description: 'Default border' },
	{ name: '--border-strong', category: 'Border', description: 'Strong border' },
	{ name: '--border-brand', category: 'Border', description: 'Brand border' },
	{ name: '--border-focus', category: 'Border', description: 'Focus state border' },
	{ name: '--border-error', category: 'Border', description: 'Error border' },

	// Spacing
	{ name: '--spacing-1', category: 'Spacing', description: '4px spacing', value: '4px' },
	{ name: '--spacing-2', category: 'Spacing', description: '8px spacing', value: '8px' },
	{ name: '--spacing-3', category: 'Spacing', description: '12px spacing', value: '12px' },
	{ name: '--spacing-4', category: 'Spacing', description: '16px spacing', value: '16px' },
	{ name: '--spacing-6', category: 'Spacing', description: '24px spacing', value: '24px' },
	{ name: '--spacing-8', category: 'Spacing', description: '32px spacing', value: '32px' },
	{ name: '--spacing-12', category: 'Spacing', description: '48px spacing', value: '48px' },
	{ name: '--spacing-16', category: 'Spacing', description: '64px spacing', value: '64px' },

	// Shadows
	{ name: '--shadow-xs', category: 'Shadow', description: 'Extra small shadow' },
	{ name: '--shadow-sm', category: 'Shadow', description: 'Small shadow (cards)' },
	{ name: '--shadow-md', category: 'Shadow', description: 'Medium shadow (hover)' },
	{ name: '--shadow-lg', category: 'Shadow', description: 'Large shadow (dropdowns)' },
	{ name: '--shadow-xl', category: 'Shadow', description: 'Extra large shadow (modals)' },
	{ name: '--shadow-2xl', category: 'Shadow', description: '2X large shadow' },
	{ name: '--shadow-3xl', category: 'Shadow', description: '3X large shadow' },

	// Component - Card
	{ name: '--card-bg', category: 'Component', description: 'Card background' },
	{ name: '--card-border', category: 'Component', description: 'Card border' },
	{ name: '--card-shadow', category: 'Component', description: 'Card shadow' },

	// Component - Modal
	{ name: '--modal-bg', category: 'Component', description: 'Modal background' },
	{ name: '--modal-border', category: 'Component', description: 'Modal border' },
	{ name: '--modal-shadow', category: 'Component', description: 'Modal shadow' },
	{ name: '--modal-overlay', category: 'Component', description: 'Modal overlay' },

	// Component - Button
	{ name: '--button-primary-bg', category: 'Button', description: 'Primary button background' },
	{ name: '--button-primary-bg-hover', category: 'Button', description: 'Primary button hover' },
	{ name: '--button-primary-bg-active', category: 'Button', description: 'Primary button active' },
	{ name: '--button-primary-bg-disabled', category: 'Button', description: 'Primary button disabled' },
	{ name: '--button-primary-text', category: 'Button', description: 'Primary button text' },
	{ name: '--button-secondary-bg', category: 'Button', description: 'Secondary button background' },
	{ name: '--button-secondary-bg-hover', category: 'Button', description: 'Secondary button hover' },
	{ name: '--button-tertiary-bg', category: 'Button', description: 'Tertiary button background' },
	{ name: '--button-destructive-bg', category: 'Button', description: 'Destructive button background' },

	// Component - Input
	{ name: '--input-bg', category: 'Input', description: 'Input background' },
	{ name: '--input-bg-disabled', category: 'Input', description: 'Disabled input background' },
	{ name: '--input-border', category: 'Input', description: 'Input border' },
	{ name: '--input-border-hover', category: 'Input', description: 'Input hover border' },
	{ name: '--input-border-focus', category: 'Input', description: 'Input focus border' },
	{ name: '--input-border-error', category: 'Input', description: 'Input error border' },
	{ name: '--input-text', category: 'Input', description: 'Input text color' },
	{ name: '--input-text-placeholder', category: 'Input', description: 'Placeholder text' },

	// Typography
	{ name: '--font-family-heading', category: 'Typography', description: 'Heading font (Poppins)', value: 'Poppins' },
	{ name: '--font-family-primary', category: 'Typography', description: 'Body font (Inter)', value: 'Inter' },
	{ name: '--font-family-mono', category: 'Typography', description: 'Monospace font', value: 'SF Mono' },
	{ name: '--font-size-xs', category: 'Typography', description: 'Extra small', value: '12px' },
	{ name: '--font-size-sm', category: 'Typography', description: 'Small', value: '14px' },
	{ name: '--font-size-base', category: 'Typography', description: 'Base', value: '18px' },
	{ name: '--font-size-lg', category: 'Typography', description: 'Large', value: '20px' },
	{ name: '--font-size-xl', category: 'Typography', description: 'Extra large', value: '24px' },
	{ name: '--font-size-2xl', category: 'Typography', description: '2X large', value: '30px' },

	// Border Radius
	{ name: '--radius-sm', category: 'Border', description: 'Small radius', value: '4px' },
	{ name: '--radius-md', category: 'Border', description: 'Medium radius', value: '6px' },
	{ name: '--radius-lg', category: 'Border', description: 'Large radius', value: '8px' },
	{ name: '--radius-xl', category: 'Border', description: 'Extra large radius', value: '12px' },
	{ name: '--radius-full', category: 'Border', description: 'Full radius (circle)', value: '9999px' },
];

export const TokenReference: React.FC = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState<string>('All');
	const [copiedToken, setCopiedToken] = useState<string>('');

	const categories = useMemo(() => {
		const cats = ['All', ...new Set(tokenData.map((t) => t.category))];
		return cats.sort();
	}, []);

	const filteredTokens = useMemo(() => {
		return tokenData.filter((token) => {
			const matchesSearch =
				token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				token.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = selectedCategory === 'All' || token.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [searchQuery, selectedCategory]);

	const handleCopy = (tokenName: string) => {
		navigator.clipboard.writeText(tokenName);
		setCopiedToken(tokenName);
		setTimeout(() => setCopiedToken(''), 2000);
	};

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
				Token Reference
			</h2>
			<p
				style={{
					fontSize: 'var(--font-size-base)',
					color: 'var(--text-secondary)',
					marginBottom: 'var(--spacing-6)',
					lineHeight: 'var(--line-height-relaxed)',
				}}
			>
				Search and explore all design tokens. Click any token to copy its name.
			</p>

			{/* Search and filter controls */}
			<div
				style={{
					display: 'flex',
					gap: 'var(--spacing-4)',
					marginBottom: 'var(--spacing-6)',
					flexWrap: 'wrap',
				}}
			>
				<input
					type="text"
					placeholder="Search tokens..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					style={{
						flex: '1 1 300px',
						height: 'var(--input-height-md)',
						padding: '0 var(--input-padding-md)',
						fontSize: 'var(--input-font-md)',
						background: 'var(--input-bg)',
						color: 'var(--input-text)',
						border: '1px solid var(--input-border)',
						borderRadius: 'var(--radius-md)',
						outline: 'none',
					}}
					onFocus={(e) => {
						e.currentTarget.style.borderColor = 'var(--input-border-focus)';
					}}
					onBlur={(e) => {
						e.currentTarget.style.borderColor = 'var(--input-border)';
					}}
				/>

				<select
					value={selectedCategory}
					onChange={(e) => setSelectedCategory(e.target.value)}
					style={{
						height: 'var(--input-height-md)',
						padding: '0 var(--input-padding-md)',
						fontSize: 'var(--input-font-md)',
						background: 'var(--input-bg)',
						color: 'var(--input-text)',
						border: '1px solid var(--input-border)',
						borderRadius: 'var(--radius-md)',
						cursor: 'pointer',
					}}
				>
					{categories.map((category) => (
						<option key={category} value={category}>
							{category}
						</option>
					))}
				</select>
			</div>

			{/* Results count */}
			<div
				style={{
					fontSize: 'var(--font-size-sm)',
					color: 'var(--text-tertiary)',
					marginBottom: 'var(--spacing-4)',
				}}
			>
				Showing {filteredTokens.length} of {tokenData.length} tokens
			</div>

			{/* Token table */}
			<div
				style={{
					background: 'var(--surface-primary)',
					border: '1px solid var(--border-subtle)',
					borderRadius: 'var(--radius-lg)',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '2fr 1fr 2fr 1fr',
						gap: 'var(--spacing-4)',
						padding: 'var(--spacing-4)',
						background: 'var(--surface-secondary)',
						borderBottom: '1px solid var(--border-subtle)',
						fontWeight: 'var(--font-weight-semibold)',
						fontSize: 'var(--font-size-sm)',
						color: 'var(--text-primary)',
					}}
				>
					<div>Token Name</div>
					<div>Category</div>
					<div>Description</div>
					<div>Value</div>
				</div>

				<div style={{ maxHeight: '600px', overflowY: 'auto' }}>
					{filteredTokens.length === 0 ? (
						<div
							style={{
								padding: 'var(--spacing-8)',
								textAlign: 'center',
								color: 'var(--text-tertiary)',
							}}
						>
							No tokens found matching your search.
						</div>
					) : (
						filteredTokens.map((token, index) => (
							<div
								key={token.name}
								onClick={() => handleCopy(token.name)}
								style={{
									display: 'grid',
									gridTemplateColumns: '2fr 1fr 2fr 1fr',
									gap: 'var(--spacing-4)',
									padding: 'var(--spacing-4)',
									borderBottom:
										index < filteredTokens.length - 1
											? '1px solid var(--border-subtle)'
											: 'none',
									cursor: 'pointer',
									transition: 'background 150ms ease',
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.background = 'var(--surface-secondary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background = 'transparent';
								}}
							>
								<div
									style={{
										fontFamily: 'var(--font-family-mono)',
										fontSize: 'var(--font-size-sm)',
										color: 'var(--text-brand)',
										fontWeight: 'var(--font-weight-medium)',
										position: 'relative',
									}}
								>
									{token.name}
									{copiedToken === token.name && (
										<span
											style={{
												position: 'absolute',
												left: '100%',
												marginLeft: 'var(--spacing-2)',
												fontSize: 'var(--font-size-xs)',
												color: 'var(--text-success)',
												fontWeight: 'var(--font-weight-normal)',
											}}
										>
											Copied!
										</span>
									)}
								</div>
								<div
									style={{
										fontSize: 'var(--font-size-sm)',
										color: 'var(--text-secondary)',
									}}
								>
									<span
										style={{
											display: 'inline-block',
											padding: '2px 8px',
											background: 'var(--surface-brand)',
											color: 'var(--text-brand)',
											borderRadius: 'var(--radius-sm)',
											fontSize: 'var(--font-size-xs)',
										}}
									>
										{token.category}
									</span>
								</div>
								<div
									style={{
										fontSize: 'var(--font-size-sm)',
										color: 'var(--text-secondary)',
									}}
								>
									{token.description}
								</div>
								<div
									style={{
										fontFamily: 'var(--font-family-mono)',
										fontSize: 'var(--font-size-xs)',
										color: 'var(--text-tertiary)',
									}}
								>
									{token.value || 'var()'}
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Usage tip */}
			<div
				style={{
					marginTop: 'var(--spacing-6)',
					padding: 'var(--spacing-4)',
					background: 'var(--surface-brand)',
					borderRadius: 'var(--radius-md)',
				}}
			>
				<div
					style={{
						fontSize: 'var(--font-size-sm)',
						color: 'var(--text-secondary)',
						lineHeight: 'var(--line-height-relaxed)',
					}}
				>
					<strong style={{ color: 'var(--text-primary)' }}>💡 Tip:</strong> Click any token
					to copy its name. Use in your components with utility functions like{' '}
					<code
						style={{
							fontFamily: 'var(--font-family-mono)',
							background: 'var(--surface-primary)',
							padding: '2px 6px',
							borderRadius: '4px',
						}}
					>
						colorToken()
					</code>
					,{' '}
					<code
						style={{
							fontFamily: 'var(--font-family-mono)',
							background: 'var(--surface-primary)',
							padding: '2px 6px',
							borderRadius: '4px',
						}}
					>
						spacingToken()
					</code>
					, or directly as CSS variables.
				</div>
			</div>
		</div>
	);
};
