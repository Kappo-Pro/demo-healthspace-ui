import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PostureMetricCard } from './PostureMetricCard';

const meta: Meta<typeof PostureMetricCard> = {
	title: 'Molecules/PostureMetricCard',
	component: PostureMetricCard,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PostureMetricCard>;

export const Default: Story = {
	args: {
		title: 'Shoulder Symmetry',
		value: 85,
		trend: 5.2,
	},
};
