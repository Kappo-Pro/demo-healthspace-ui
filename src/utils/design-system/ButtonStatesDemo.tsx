/**
 * Button States Demo Component
 *
 * Visual demonstration of all button state tokens added in Phase 1.
 * This component shows primary, secondary, and tertiary buttons in all states:
 * - Default
 * - Hover
 * - Active
 * - Disabled
 *
 * Usage:
 * ```tsx
 * import { ButtonStatesDemo } from '@utils/design-system/ButtonStatesDemo';
 *
 * <ButtonStatesDemo />
 * ```
 *
 * @version 1.0.0
 * @author VitalFlow UX Team
 */

import React, { useState } from 'react';
import { Flex, Switch, Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface ButtonVariant {
	name: string;
	prefix: 'primary' | 'secondary' | 'tertiary';
	description: string;
}

const buttonVariants: ButtonVariant[] = [
	{
		name: 'Primary',
		prefix: 'primary',
		description: 'Main call-to-action buttons (submit, save, create)',
	},
	{
		name: 'Secondary',
		prefix: 'secondary',
		description: 'Alternative actions (cancel, secondary submit)',
	},
	{
		name: 'Tertiary',
		prefix: 'tertiary',
		description: 'Subtle actions (dismiss, view details, navigation)',
	},
];

export function ButtonStatesDemo(): React.ReactElement {
	const [isDisabled, setIsDisabled] = useState(false);

	return (
		<div className="p-8 space-y-8 bg-surface-primary min-h-screen">
			<div className="max-w-6xl mx-auto">
				<Title level={1}>Button State Matrix</Title>
				<Text type="secondary">
					Visual demonstration of all button state tokens (Phase 1
					implementation)
				</Text>

				<Card className="mt-6">
					<Flex align="center" gap={12}>
						<Switch checked={isDisabled} onChange={setIsDisabled} />
						<Text>Toggle Disabled State</Text>
					</Flex>
				</Card>

				<div className="space-y-8 mt-8">
					{buttonVariants.map(({ name, prefix, description }) => (
						<Card key={prefix} title={`${name} Button`} className="shadow-md">
							<Text type="secondary" className="block mb-4">
								{description}
							</Text>

							{/* Interactive Button */}
							<div className="mb-6">
								<Text strong className="block mb-2">
									Interactive Demo
								</Text>
								<button
									disabled={isDisabled}
									className={`
                    px-6 py-3 rounded-lg border transition-all font-medium
                    bg-button-${prefix}-bg
                    text-button-${prefix}-text
                    border-button-${prefix}-border
                    hover:bg-button-${prefix}-bg-hover
                    hover:text-button-${prefix}-text-hover
                    hover:border-button-${prefix}-border-hover
                    active:bg-button-${prefix}-bg-active
                    active:text-button-${prefix}-text-active
                    active:border-button-${prefix}-border-active
                    disabled:bg-button-${prefix}-bg-disabled
                    disabled:text-button-${prefix}-text-disabled
                    disabled:border-button-${prefix}-border-disabled
                    disabled:cursor-not-allowed
                  `}>
									{name} Button
								</button>
								<Text type="secondary" className="ml-4">
									{isDisabled
										? 'Disabled State'
										: 'Try hovering and clicking'}
								</Text>
							</div>

							{/* State Matrix */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
								{/* Default State */}
								<div>
									<Text strong className="block mb-2">
										Default
									</Text>
									<button
										className={`
                      w-full px-4 py-2 rounded-lg border
                      bg-button-${prefix}-bg
                      text-button-${prefix}-text
                      border-button-${prefix}-border
                    `}>
										Default
									</button>
									<div className="text-xs text-gray-500 mt-2 space-y-1">
										<div>
											BG: <code>--button-{prefix}-bg</code>
										</div>
										<div>
											Text: <code>--button-{prefix}-text</code>
										</div>
										<div>
											Border: <code>--button-{prefix}-border</code>
										</div>
									</div>
								</div>

								{/* Hover State */}
								<div>
									<Text strong className="block mb-2">
										Hover
									</Text>
									<button
										className={`
                      w-full px-4 py-2 rounded-lg border
                      bg-button-${prefix}-bg-hover
                      text-button-${prefix}-text-hover
                      border-button-${prefix}-border-hover
                    `}>
										Hover
									</button>
									<div className="text-xs text-gray-500 mt-2 space-y-1">
										<div>
											BG: <code>--button-{prefix}-bg-hover</code>
										</div>
										<div>
											Text: <code>--button-{prefix}-text-hover</code>
										</div>
										<div>
											Border: <code>--button-{prefix}-border-hover</code>
										</div>
									</div>
								</div>

								{/* Active State */}
								<div>
									<Text strong className="block mb-2">
										Active
									</Text>
									<button
										className={`
                      w-full px-4 py-2 rounded-lg border
                      bg-button-${prefix}-bg-active
                      text-button-${prefix}-text-active
                      border-button-${prefix}-border-active
                    `}>
										Active
									</button>
									<div className="text-xs text-gray-500 mt-2 space-y-1">
										<div>
											BG: <code>--button-{prefix}-bg-active</code>
										</div>
										<div>
											Text: <code>--button-{prefix}-text-active</code>
										</div>
										<div>
											Border: <code>--button-{prefix}-border-active</code>
										</div>
									</div>
								</div>

								{/* Disabled State */}
								<div>
									<Text strong className="block mb-2">
										Disabled
									</Text>
									<button
										disabled
										className={`
                      w-full px-4 py-2 rounded-lg border cursor-not-allowed
                      bg-button-${prefix}-bg-disabled
                      text-button-${prefix}-text-disabled
                      border-button-${prefix}-border-disabled
                    `}>
										Disabled
									</button>
									<div className="text-xs text-gray-500 mt-2 space-y-1">
										<div>
											BG: <code>--button-{prefix}-bg-disabled</code>
										</div>
										<div>
											Text: <code>--button-{prefix}-text-disabled</code>
										</div>
										<div>
											Border: <code>--button-{prefix}-border-disabled</code>
										</div>
									</div>
								</div>
							</div>

							{/* Token Reference */}
							<div className="mt-6 p-4 bg-gray-50 rounded-lg">
								<Text strong className="block mb-2">
									Token Reference
								</Text>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
									<div>
										<div className="font-bold mb-1">Background</div>
										<div>--button-{prefix}-bg</div>
										<div>--button-{prefix}-bg-hover</div>
										<div>--button-{prefix}-bg-active</div>
										<div>--button-{prefix}-bg-disabled</div>
									</div>
									<div>
										<div className="font-bold mb-1">Text</div>
										<div>--button-{prefix}-text</div>
										<div>--button-{prefix}-text-hover</div>
										<div>--button-{prefix}-text-active</div>
										<div>--button-{prefix}-text-disabled</div>
									</div>
									<div>
										<div className="font-bold mb-1">Border</div>
										<div>--button-{prefix}-border</div>
										<div>--button-{prefix}-border-hover</div>
										<div>--button-{prefix}-border-active</div>
										<div>--button-{prefix}-border-disabled</div>
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>

				{/* Usage Examples */}
				<Card title="Usage Examples" className="mt-8 shadow-md">
					<div className="space-y-6">
						<div>
							<Text strong className="block mb-2">
								Tailwind Utility Classes
							</Text>
							<pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
								{`<button className="
  bg-button-secondary-bg
  hover:bg-button-secondary-bg-hover
  active:bg-button-secondary-bg-active
  disabled:bg-button-secondary-bg-disabled

  text-button-secondary-text
  hover:text-button-secondary-text-hover
  active:text-button-secondary-text-active
  disabled:text-button-secondary-text-disabled

  border
  border-button-secondary-border
  hover:border-button-secondary-border-hover
  active:border-button-secondary-border-active
  disabled:border-button-secondary-border-disabled
">
  Secondary Action
</button>`}
							</pre>
						</div>

						<div>
							<Text strong className="block mb-2">
								CSS Variables
							</Text>
							<pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto text-sm">
								{`button {
  background: var(--button-tertiary-bg);
  color: var(--button-tertiary-text);
  border: 1px solid var(--button-tertiary-border);
}

button:hover:not(:disabled) {
  background: var(--button-tertiary-bg-hover);
  color: var(--button-tertiary-text-hover);
  border-color: var(--button-tertiary-border-hover);
}

button:active:not(:disabled) {
  background: var(--button-tertiary-bg-active);
  color: var(--button-tertiary-text-active);
  border-color: var(--button-tertiary-border-active);
}

button:disabled {
  background: var(--button-tertiary-bg-disabled);
  color: var(--button-tertiary-text-disabled);
  border-color: var(--button-tertiary-border-disabled);
  cursor: not-allowed;
}`}
							</pre>
						</div>
					</div>
				</Card>

				{/* Accessibility Notes */}
				<Card title="Accessibility Notes" className="mt-8 shadow-md">
					<div className="space-y-4">
						<div>
							<Text strong>WCAG AA Compliance</Text>
							<ul className="list-disc ml-6 mt-2 space-y-1">
								<li>
									Disabled text uses <code>--text-disabled</code> (gray-400):
									4.61:1 contrast ratio
								</li>
								<li>
									All states maintain sufficient contrast for readability
								</li>
								<li>
									Keyboard navigation supported with visible focus rings
								</li>
							</ul>
						</div>
						<div>
							<Text strong>Screen Reader Support</Text>
							<ul className="list-disc ml-6 mt-2 space-y-1">
								<li>
									Disabled buttons announce: "Button name, button, unavailable"
								</li>
								<li>
									Use <code>aria-label</code> for icon-only buttons
								</li>
								<li>
									Button states are semantically correct (not aria-disabled)
								</li>
							</ul>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}

export default ButtonStatesDemo;
