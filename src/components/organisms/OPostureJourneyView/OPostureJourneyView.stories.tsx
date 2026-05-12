import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { OPostureJourneyView } from './OPostureJourneyView';

const meta: Meta<typeof OPostureJourneyView> = {
	title: 'Organisms/OPostureJourneyView',
	component: OPostureJourneyView,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OPostureJourneyView>;

export const Default: Story = {
	args: {
		journeyState: {
			patientId: '1',
			startDate: '2025-01-01',
			sessions: [],
			milestones: [
				{
					id: '1',
					title: 'First Assessment',
					achievedAt: '2025-01-15T10:00:00Z',
					type: 'assessment',
				},
			],
			progress: {
				totalAssessments: 1,
				averageScore: 75,
				scoreImprovement: 0,
				adherenceRate: 100,
			},
		},
	},
};
