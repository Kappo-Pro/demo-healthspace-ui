/**
 * TabLoadingSkeleton Storybook Stories
 *
 * @story Story 3.1 - Code Splitting
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { TabLoadingSkeleton } from './TabLoadingSkeleton';

const meta = {
	title: 'Organisms/EvaluationResultsModal/TabLoadingSkeleton',
	component: TabLoadingSkeleton,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Loading skeleton displayed while individual tab content lazy loads. ' +
					'Provides visual feedback during tab switching when tab chunk is loading.',
			},
		},
	},
	tags: ['autodocs'],
} satisfies Meta<typeof TabLoadingSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default tab loading skeleton
 * Shows what users see while tab chunk is loading
 */
export const Default: Story = {};

/**
 * Mobile view of tab skeleton
 */
export const Mobile: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
	},
};

/**
 * Tablet view of tab skeleton
 */
export const Tablet: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'tablet',
		},
	},
};

/**
 * Desktop view of tab skeleton
 */
export const Desktop: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'desktop',
		},
	},
};
