import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ClosedCaption } from './index';

const meta: Meta<typeof ClosedCaption> = {
	title: 'Atoms/ClosedCaption',
	component: ClosedCaption,
	parameters: {
		layout: 'fullscreen',
		backgrounds: {
			default: 'dark',
			values: [
				{ name: 'dark', value: '#1a1a2e' },
				{ name: 'video', value: '#000' },
			],
		},
	},
	decorators: [
		(Story) => (
			<div style={{
				position: 'relative',
				height: '100vh',
				background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
			}}>
				<Story />
			</div>
		),
	],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'success', 'error', 'warning'],
		},
		visible: {
			control: 'boolean',
		},
		bottom: {
			control: { type: 'range', min: 20, max: 200, step: 10 },
		},
	},
};

export default meta;
type Story = StoryObj<typeof ClosedCaption>;

export const Default: Story = {
	args: {
		children: 'Step back and ensure your full body is visible',
		variant: 'default',
		visible: true,
		bottom: 80,
	},
};

export const Success: Story = {
	args: {
		children: 'Great! Hold that position',
		variant: 'success',
		visible: true,
		bottom: 80,
	},
};

export const Error: Story = {
	args: {
		children: 'Please face the camera',
		variant: 'error',
		visible: true,
		bottom: 80,
	},
};

export const Warning: Story = {
	args: {
		children: 'Move closer to the camera',
		variant: 'warning',
		visible: true,
		bottom: 80,
	},
};

export const LongText: Story = {
	args: {
		children: 'Please step back from the camera and make sure your entire body from head to toe is visible in the frame',
		variant: 'default',
		visible: true,
		bottom: 80,
	},
};

export const AllVariants: Story = {
	render: () => (
		<div style={{ position: 'relative', height: '100vh' }}>
			<ClosedCaption variant="default" visible bottom={320}>
				Default: Step back and ensure your full body is visible
			</ClosedCaption>
			<ClosedCaption variant="success" visible bottom={240}>
				Success: Great! Hold that position
			</ClosedCaption>
			<ClosedCaption variant="error" visible bottom={160}>
				Error: Please face the camera
			</ClosedCaption>
			<ClosedCaption variant="warning" visible bottom={80}>
				Warning: Move closer to the camera
			</ClosedCaption>
		</div>
	),
};
