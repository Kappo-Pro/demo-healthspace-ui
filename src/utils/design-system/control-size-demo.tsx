/**
 * Control Size Tokens Demo
 *
 * Visual demonstration of control size variant tokens (sm, md, lg)
 * showing Ant Design components and custom Tailwind components.
 *
 * Usage:
 * Import this component to test control size tokens:
 * ```tsx
 * import ControlSizeDemo from '@utils/design-system/control-size-demo';
 * <ControlSizeDemo />
 * ```
 */

import React from 'react';
import { Button, Input, Select, Space, Card, Typography } from 'antd';
import { UntitledIcon } from '@atoms/Icon';

const { Title, Text } = Typography;

const selectOptions = [
	{ value: '1', label: 'Option 1' },
	{ value: '2', label: 'Option 2' },
	{ value: '3', label: 'Option 3' },
];

export const ControlSizeDemo: React.FC = () => {
	return (
		<div style={{ padding: 'var(--spacing-6)', maxWidth: '1200px', margin: '0 auto' }}>
			<Title level={2}>Control Size Tokens Demo</Title>
			<Text type="secondary">
				Demonstration of sm (24px), md (32px), and lg (40px) control sizes
			</Text>

			{/* Ant Design Components */}
			<Card title="Ant Design Components (using size prop)" style={{ marginTop: 24 }}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					{/* Buttons */}
					<div>
						<Title level={5}>Buttons</Title>
						<Space>
							<Button type="primary" size="small">
								Small (24px)
							</Button>
							<Button type="primary" size="middle">
								Middle (32px)
							</Button>
							<Button type="primary" size="large">
								Large (40px)
							</Button>
						</Space>
					</div>

					{/* Buttons with Icons */}
					<div>
						<Title level={5}>Buttons with Icons</Title>
						<Space>
							<Button type="primary" size="small" icon={<UntitledIcon name="search" />}>
								Small
							</Button>
							<Button type="primary" size="middle" icon={<UntitledIcon name="search" />}>
								Middle
							</Button>
							<Button type="primary" size="large" icon={<UntitledIcon name="search" />}>
								Large
							</Button>
						</Space>
					</div>

					{/* Inputs */}
					<div>
						<Title level={5}>Inputs</Title>
						<Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
							<Input size="small" placeholder="Small input (24px)" />
							<Input size="middle" placeholder="Middle input (32px)" />
							<Input size="large" placeholder="Large input (40px)" />
						</Space>
					</div>

					{/* Inputs with Prefix */}
					<div>
						<Title level={5}>Inputs with Prefix</Title>
						<Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
							<Input size="small" prefix={<UntitledIcon name="user" />} placeholder="Small" />
							<Input size="middle" prefix={<UntitledIcon name="user" />} placeholder="Middle" />
							<Input size="large" prefix={<UntitledIcon name="user" />} placeholder="Large" />
						</Space>
					</div>

					{/* Selects */}
					<div>
						<Title level={5}>Selects</Title>
						<Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
							<Select size="small" placeholder="Small select" options={selectOptions} style={{ width: '100%' }} />
							<Select size="middle" placeholder="Middle select" options={selectOptions} style={{ width: '100%' }} />
							<Select size="large" placeholder="Large select" options={selectOptions} style={{ width: '100%' }} />
						</Space>
					</div>
				</Space>
			</Card>

			{/* Custom Tailwind Components */}
			<Card title="Custom Components (using Tailwind utilities)" style={{ marginTop: 24 }}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					{/* Custom Buttons */}
					<div>
						<Title level={5}>Custom Buttons with Tailwind</Title>
						<Space>
							<button className="h-control-sm px-control-sm text-control-sm rounded-control-sm bg-brand-primary text-white border-0 cursor-pointer hover:opacity-90 transition-opacity">
								Small (h-control-sm)
							</button>
							<button className="h-control-md px-control-md text-control-md rounded-control-md bg-brand-primary text-white border-0 cursor-pointer hover:opacity-90 transition-opacity">
								Medium (h-control-md)
							</button>
							<button className="h-control-lg px-control-lg text-control-lg rounded-control-lg bg-brand-primary text-white border-0 cursor-pointer hover:opacity-90 transition-opacity">
								Large (h-control-lg)
							</button>
						</Space>
					</div>

					{/* Custom Inputs */}
					<div>
						<Title level={5}>Custom Inputs with Tailwind</Title>
						<Space direction="vertical" style={{ width: '100%', maxWidth: 400 }}>
							<input
								type="text"
								placeholder="Small (h-control-sm)"
								className="w-full h-control-sm px-control-sm text-control-sm rounded-control-sm border border-default focus:border-focus focus:outline-none"
							/>
							<input
								type="text"
								placeholder="Medium (h-control-md)"
								className="w-full h-control-md px-control-md text-control-md rounded-control-md border border-default focus:border-focus focus:outline-none"
							/>
							<input
								type="text"
								placeholder="Large (h-control-lg)"
								className="w-full h-control-lg px-control-lg text-control-lg rounded-control-lg border border-default focus:border-focus focus:outline-none"
							/>
						</Space>
					</div>

					{/* Icon Sizes */}
					<div>
						<Title level={5}>Icon Sizes</Title>
						<Space>
							<div className="flex items-center gap-2">
								<UntitledIcon name="search" style={{ fontSize: 'var(--control-icon-sm)' }} />
								<Text>Small (14px)</Text>
							</div>
							<div className="flex items-center gap-2">
								<UntitledIcon name="search" style={{ fontSize: 'var(--control-icon-md)' }} />
								<Text>Medium (16px)</Text>
							</div>
							<div className="flex items-center gap-2">
								<UntitledIcon name="search" style={{ fontSize: 'var(--control-icon-lg)' }} />
								<Text>Large (18px)</Text>
							</div>
						</Space>
					</div>
				</Space>
			</Card>

			{/* Size Comparison */}
			<Card title="Size Comparison" style={{ marginTop: 24 }}>
				<div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
					<div>
						<Text strong>Small (24px)</Text>
						<div style={{ height: 24, width: 100, background: 'var(--brand-primary)', borderRadius: 4 }} />
					</div>
					<div>
						<Text strong>Medium (32px)</Text>
						<div style={{ height: 32, width: 100, background: 'var(--brand-primary)', borderRadius: 6 }} />
					</div>
					<div>
						<Text strong>Large (40px)</Text>
						<div style={{ height: 40, width: 100, background: 'var(--brand-primary)', borderRadius: 8 }} />
					</div>
				</div>

				<div style={{ marginTop: 24 }}>
					<Title level={5}>Token Values</Title>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={{ borderBottom: '1px solid var(--border-default)' }}>
								<th style={{ textAlign: 'left', padding: 8 }}>Size</th>
								<th style={{ textAlign: 'left', padding: 8 }}>Height</th>
								<th style={{ textAlign: 'left', padding: 8 }}>Padding (H)</th>
								<th style={{ textAlign: 'left', padding: 8 }}>Font</th>
								<th style={{ textAlign: 'left', padding: 8 }}>Icon</th>
								<th style={{ textAlign: 'left', padding: 8 }}>Radius</th>
							</tr>
						</thead>
						<tbody>
							<tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
								<td style={{ padding: 8 }}><Text strong>Small</Text></td>
								<td style={{ padding: 8 }}>24px</td>
								<td style={{ padding: 8 }}>8px</td>
								<td style={{ padding: 8 }}>14px</td>
								<td style={{ padding: 8 }}>14px</td>
								<td style={{ padding: 8 }}>4px</td>
							</tr>
							<tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
								<td style={{ padding: 8 }}><Text strong>Medium</Text></td>
								<td style={{ padding: 8 }}>32px</td>
								<td style={{ padding: 8 }}>12px</td>
								<td style={{ padding: 8 }}>14px</td>
								<td style={{ padding: 8 }}>16px</td>
								<td style={{ padding: 8 }}>6px</td>
							</tr>
							<tr>
								<td style={{ padding: 8 }}><Text strong>Large</Text></td>
								<td style={{ padding: 8 }}>40px</td>
								<td style={{ padding: 8 }}>16px</td>
								<td style={{ padding: 8 }}>16px</td>
								<td style={{ padding: 8 }}>18px</td>
								<td style={{ padding: 8 }}>8px</td>
							</tr>
						</tbody>
					</table>
				</div>
			</Card>

			{/* CSS Variables Reference */}
			<Card title="CSS Variables Reference" style={{ marginTop: 24 }}>
				<div style={{ fontFamily: 'monospace', fontSize: 12 }}>
					<div style={{ marginBottom: 8 }}>
						<Text strong>Control Heights:</Text>
						<div>--control-height-sm: 24px</div>
						<div>--control-height-md: 32px</div>
						<div>--control-height-lg: 40px</div>
					</div>
					<div style={{ marginBottom: 8 }}>
						<Text strong>Control Padding:</Text>
						<div>--control-padding-sm: 8px</div>
						<div>--control-padding-md: 12px</div>
						<div>--control-padding-lg: 16px</div>
					</div>
					<div style={{ marginBottom: 8 }}>
						<Text strong>Control Font Sizes:</Text>
						<div>--control-font-sm: 14px</div>
						<div>--control-font-md: 14px</div>
						<div>--control-font-lg: 16px</div>
					</div>
					<div style={{ marginBottom: 8 }}>
						<Text strong>Control Icons:</Text>
						<div>--control-icon-sm: 14px</div>
						<div>--control-icon-md: 16px</div>
						<div>--control-icon-lg: 18px</div>
					</div>
					<div>
						<Text strong>Control Border Radius:</Text>
						<div>--control-radius-sm: 4px</div>
						<div>--control-radius-md: 6px</div>
						<div>--control-radius-lg: 8px</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default ControlSizeDemo;
