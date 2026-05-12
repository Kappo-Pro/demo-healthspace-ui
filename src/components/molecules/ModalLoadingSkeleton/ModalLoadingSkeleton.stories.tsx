/**
 * ModalLoadingSkeleton Storybook Stories
 *
 * @story Story 3.1 - Code Splitting
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { ModalLoadingSkeleton } from './ModalLoadingSkeleton';

const meta = {
	title: 'Molecules/ModalLoadingSkeleton',
	component: ModalLoadingSkeleton,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Loading skeleton displayed while EvaluationResultsModal lazy loads. ' +
					'Provides visual feedback during code splitting / lazy loading delays.',
			},
		},
	},
	tags: ['autodocs'],
} satisfies Meta<typeof ModalLoadingSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default modal loading skeleton
 * Shows what users see while modal chunk is loading
 */
export const Default: Story = {};

/**
 * Mobile view of loading skeleton
 */
export const Mobile: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
	},
};

/**
 * Tablet view of loading skeleton
 */
export const Tablet: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'tablet',
		},
	},
};

/**
 * Desktop view of loading skeleton
 */
export const Desktop: Story = {
	parameters: {
		viewport: {
			defaultViewport: 'desktop',
		},
	},
};
