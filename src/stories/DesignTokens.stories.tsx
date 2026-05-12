/**
 * Design System Tokens - Interactive Documentation
 *
 * This Storybook demonstrates the complete design token system,
 * including colors, spacing, typography, shadows, and component tokens.
 *
 * Use these interactive examples to:
 * - Understand token hierarchy (primitive → semantic)
 * - See tokens in context
 * - Copy token names for use in components
 * - Test theme switching
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorPalette } from './DesignTokens/ColorPalette';
import { SpacingDemo } from './DesignTokens/SpacingDemo';
import { TypographyDemo } from './DesignTokens/TypographyDemo';
import { ShadowDemo } from './DesignTokens/ShadowDemo';
import { ButtonStates } from './DesignTokens/ButtonStates';
import { ComponentExamples } from './DesignTokens/ComponentExamples';
import { TokenReference } from './DesignTokens/TokenReference';
import '../styles/design-system.css';

const meta: Meta = {
	title: 'Design System/Tokens',
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
# Design Token System

VitalFlow uses a two-tier token system:

1. **Primitive Tokens** - Raw values (colors, spacing scale, etc.)
2. **Semantic Tokens** - Purpose-driven tokens that reference primitives

## Usage Guidelines

### ✅ DO:
- Use semantic tokens in components (\`--text-primary\`, \`--button-primary-bg\`)
- Use token utilities: \`colorToken()\`, \`spacingToken()\`, etc.
- Use Tailwind classes that map to tokens
- Reference tokens via CSS custom properties

### ❌ DON'T:
- Use primitive tokens directly (\`--color-purple-700\`)
- Hardcode color values (\`#6941c6\`)
- Mix token systems (legacy + new)

## Quick Start

\`\`\`typescript
import { colorToken, spacingToken, shadowToken } from '@utils/design-system/tokens';

// In styled-components
const Card = styled.div\`
  background: \${colorToken('--surface-primary')};
  padding: \${spacingToken('--spacing-6')};
  box-shadow: \${shadowToken('--shadow-md')};
  border-radius: var(--radius-lg);
\`;

// In inline styles
<div style={{
  color: colorToken('--text-primary'),
  padding: spacingToken('--spacing-4'),
}}>
  Content
</div>

// In Tailwind (uses design system tokens automatically)
<div className="bg-surface-primary p-6 shadow-md rounded-lg">
  Content
</div>
\`\`\`

## Token Categories

Explore interactive examples below:
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

/**
 * Complete color palette including brand, neutral, semantic, and alpha tokens.
 * Switch between light/dark themes to see semantic color adaptations.
 */
export const Colors: Story = {
	render: () => <ColorPalette />,
	parameters: {
		docs: {
			description: {
				story: `
### Color Token Hierarchy

**Primitive Colors** → Raw color values (purple-700, gray-50, etc.)
- Never use directly in components
- Foundation for semantic tokens

**Semantic Colors** → Purpose-driven colors (text-primary, button-primary-bg, etc.)
- Always use these in components
- Automatically adapt to themes
- Self-documenting code

**Alpha Colors** → Transparent variants for overlays and hover states
- Use for modal overlays (\`--color-black-alpha-50\`)
- Use for hover states (\`--color-purple-alpha-10\`)

\`\`\`typescript
// ✅ Good - semantic tokens
color: colorToken('--text-primary');
background: colorToken('--surface-elevated');

// ❌ Bad - primitive tokens
color: colorToken('--color-gray-900');
background: colorToken('--color-white');

// ❌ Bad - hardcoded values
color: '#171717';
background: '#ffffff';
\`\`\`
				`,
			},
		},
	},
};

/**
 * Spacing scale from 0 to 32 (0px to 128px).
 * Use these tokens for padding, margin, gap, and positioning.
 */
export const Spacing: Story = {
	render: () => <SpacingDemo />,
	parameters: {
		docs: {
			description: {
				story: `
### Spacing Scale (4px base unit)

Our spacing scale follows a consistent 4px grid system:

- \`--spacing-1\` = 4px
- \`--spacing-2\` = 8px
- \`--spacing-4\` = 16px
- \`--spacing-8\` = 32px
- \`--spacing-16\` = 64px

**Common Use Cases:**
- \`--spacing-1\` to \`--spacing-2\`: Tight spacing (icon padding, badge gaps)
- \`--spacing-3\` to \`--spacing-4\`: Default spacing (button padding, form gaps)
- \`--spacing-6\` to \`--spacing-8\`: Generous spacing (card padding, section gaps)
- \`--spacing-12\` to \`--spacing-32\`: Layout spacing (page sections, hero areas)

\`\`\`typescript
// ✅ Good - using spacing tokens
padding: spacingToken('--spacing-4');
gap: spacingToken('--spacing-6');

// ❌ Bad - hardcoded values
padding: '16px';
gap: '24px';
\`\`\`
				`,
			},
		},
	},
};

/**
 * Typography scale including font families, sizes, weights, line heights, and letter spacing.
 */
export const Typography: Story = {
	render: () => <TypographyDemo />,
	parameters: {
		docs: {
			description: {
				story: `
### Typography System

**Font Families:**
- \`--font-family-heading\`: Poppins (headings, brand text)
- \`--font-family-primary\`: Inter (body text, UI)
- \`--font-family-mono\`: SF Mono (code, technical content)

**Font Sizes:** xs (12px) to 6xl (72px)

**Font Weights:** light (300) to extrabold (800)

**Line Heights:** none (1.0) to loose (2.0)

\`\`\`typescript
// ✅ Good - using typography tokens
fontFamily: 'var(--font-family-heading)';
fontSize: 'var(--font-size-lg)';
fontWeight: 'var(--font-weight-semibold)';
lineHeight: 'var(--line-height-normal)';

// ❌ Bad - hardcoded values
fontFamily: 'Poppins, sans-serif';
fontSize: '20px';
fontWeight: 600;
lineHeight: 1.5;
\`\`\`
				`,
			},
		},
	},
};

/**
 * Shadow scale from xs to 3xl for elevation and depth.
 */
export const Shadows: Story = {
	render: () => <ShadowDemo />,
	parameters: {
		docs: {
			description: {
				story: `
### Shadow Elevation Scale

Shadows create visual hierarchy and depth:

- \`--shadow-xs\`: Subtle borders (1px shadow)
- \`--shadow-sm\`: Low elevation (cards, list items)
- \`--shadow-md\`: Medium elevation (hover states)
- \`--shadow-lg\`: High elevation (dropdowns, popovers)
- \`--shadow-xl\`: Very high elevation (modals)
- \`--shadow-2xl\` & \`--shadow-3xl\`: Maximum elevation (overlays)

\`\`\`typescript
// ✅ Good - semantic shadow usage
boxShadow: shadowToken('--shadow-md'); // Card
boxShadow: shadowToken('--shadow-lg'); // Dropdown
boxShadow: shadowToken('--shadow-2xl'); // Modal

// ❌ Bad - hardcoded shadow
boxShadow: '0 4px 6px rgba(0,0,0,0.1)';
\`\`\`
				`,
			},
		},
	},
};

/**
 * Complete button state examples showing all variants and sizes.
 */
export const Buttons: Story = {
	render: () => <ButtonStates />,
	parameters: {
		docs: {
			description: {
				story: `
### Button Token System

**Variants:**
- Primary: Main actions (brand-colored)
- Secondary: Alternative actions (outlined)
- Tertiary: Subtle actions (ghost)
- Destructive: Dangerous actions (red)

**Sizes:**
- Small (\`--control-height-sm\`): 24px height
- Medium (\`--control-height-md\`): 32px height (default)
- Large (\`--control-height-lg\`): 40px height

**States:** default, hover, active, disabled

\`\`\`typescript
import { buttonStyle } from '@utils/design-system/tokens';

// Complete button style object
const Button = styled.button\`
  \${buttonStyle('primary', 'md')}
\`;

// Or use individual tokens
const CustomButton = styled.button\`
  background: \${buttonToken('--button-primary-bg')};
  color: \${buttonToken('--button-primary-text')};
  height: \${buttonToken('--button-height-md')};
  padding: 0 \${buttonToken('--button-padding-md')};

  &:hover {
    background: \${buttonToken('--button-primary-bg-hover')};
  }
\`;
\`\`\`
				`,
			},
		},
	},
};

/**
 * Real-world component examples showing token usage in cards, forms, and layouts.
 */
export const Components: Story = {
	render: () => <ComponentExamples />,
	parameters: {
		docs: {
			description: {
				story: `
### Component Token Patterns

See how tokens are used in real components:

1. **Cards** - Surface, border, shadow, spacing tokens
2. **Form Inputs** - Input tokens for all states
3. **Navigation** - Nav-specific semantic tokens
4. **Modals** - Overlay, elevated surface, shadow tokens

Each example shows the before/after of migrating from hardcoded values to tokens.
				`,
			},
		},
	},
};

/**
 * Complete token reference table with search and copy functionality.
 */
export const TokenReference: Story = {
	render: () => <TokenReference />,
	parameters: {
		docs: {
			description: {
				story: `
### Token Reference Guide

Interactive reference for all design tokens:

- **Search** by name or category
- **Copy** token names with one click
- **See live values** computed from CSS
- **Filter** by type (color, spacing, etc.)

Use this as a quick reference when implementing components.
				`,
			},
		},
	},
};

/**
 * Theme switching demonstration showing how semantic tokens adapt.
 */
export const ThemeSwitching: Story = {
	render: () => (
		<div style={{ padding: 'var(--spacing-6)' }}>
			<h2 style={{
				fontFamily: 'var(--font-family-heading)',
				fontSize: 'var(--font-size-2xl)',
				marginBottom: 'var(--spacing-4)',
				color: 'var(--text-primary)'
			}}>
				Theme Switching
			</h2>
			<p style={{
				fontSize: 'var(--font-size-base)',
				color: 'var(--text-secondary)',
				marginBottom: 'var(--spacing-8)',
				lineHeight: 'var(--line-height-relaxed)'
			}}>
				Use the theme switcher in your app's ThemeProvider to see how semantic tokens automatically adapt.
				Primitive tokens stay constant, semantic tokens change based on theme.
			</p>

			<div style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
				gap: 'var(--spacing-6)'
			}}>
				{/* Card showing adaptive colors */}
				<div style={{
					background: 'var(--card-bg)',
					border: '1px solid var(--card-border)',
					borderRadius: 'var(--radius-lg)',
					padding: 'var(--spacing-6)',
					boxShadow: 'var(--card-shadow)',
				}}>
					<h3 style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-lg)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-3)',
					}}>
						Adaptive Card
					</h3>
					<p style={{
						color: 'var(--text-secondary)',
						marginBottom: 'var(--spacing-4)',
					}}>
						This card uses semantic tokens that adapt to the active theme.
					</p>
					<button style={{
						background: 'var(--button-primary-bg)',
						color: 'var(--button-primary-text)',
						border: 'none',
						padding: 'var(--spacing-2) var(--spacing-4)',
						borderRadius: 'var(--radius-md)',
						fontSize: 'var(--font-size-sm)',
						fontWeight: 'var(--font-weight-medium)',
						cursor: 'pointer',
					}}>
						Primary Action
					</button>
				</div>

				{/* Code example */}
				<div style={{
					background: 'var(--surface-secondary)',
					border: '1px solid var(--border-subtle)',
					borderRadius: 'var(--radius-lg)',
					padding: 'var(--spacing-6)',
				}}>
					<h3 style={{
						fontFamily: 'var(--font-family-heading)',
						fontSize: 'var(--font-size-lg)',
						color: 'var(--text-primary)',
						marginBottom: 'var(--spacing-3)',
					}}>
						Token Usage
					</h3>
					<pre style={{
						fontFamily: 'var(--font-family-mono)',
						fontSize: 'var(--font-size-sm)',
						color: 'var(--text-secondary)',
						background: 'var(--surface-primary)',
						padding: 'var(--spacing-4)',
						borderRadius: 'var(--radius-md)',
						overflow: 'auto',
						margin: 0,
					}}>
{`// Semantic tokens adapt
background: var(--card-bg);
color: var(--text-primary);

// Themes override these:
[data-theme="dark"] {
  --card-bg: #262626;
  --text-primary: #fafafa;
}`}
					</pre>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: `
### How Theme Switching Works

1. **Primitive tokens** are defined in \`primitives.css\` (never change)
2. **Semantic tokens** reference primitives in \`semantic.css\`
3. **Theme files** override semantic tokens for each theme:
   - \`themes/light.css\`
   - \`themes/dark.css\`
   - \`themes/vibrant.css\`

\`\`\`css
/* primitives.css - never changes */
--color-purple-700: #6941c6;
--color-gray-900: #171717;

/* semantic.css - defaults */
--text-primary: var(--color-gray-900);
--brand-primary: var(--color-purple-700);

/* themes/dark.css - overrides */
[data-theme="dark"] {
  --text-primary: var(--color-gray-50);
  --brand-primary: var(--color-lime-400);
}
\`\`\`

Your components use semantic tokens and automatically adapt when the theme changes.
				`,
			},
		},
	},
};
