import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { OPostureDetailView } from './OPostureDetailView';

const meta: Meta<typeof OPostureDetailView> = {
	title: 'Organisms/OPostureDetailView',
	component: OPostureDetailView,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OPostureDetailView>;

const mockSession = {
	id: '1',
	userId: '1',
	timestamp: '2025-01-15T10:00:00Z',
	duration: 300,
	poseData: [],
	analysis: {
		overallScore: 85,
		status: 'good' as const,
		metrics: {
			headAlignment: 90,
			shoulderSymmetry: 85,
			spineCurvature: 80,
			hipAlignment: 82,
			balance: 88,
		},
		issues: [],
		insights: [],
	},
	metadata: {
		deviceType: 'desktop' as const,
		cameraQuality: 'high' as const,
		lighting: 'good' as const,
	},
};

export const Default: Story = {
	args: {
		session: mockSession,
	},
};
