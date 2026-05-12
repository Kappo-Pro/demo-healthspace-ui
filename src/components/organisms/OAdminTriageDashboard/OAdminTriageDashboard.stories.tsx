import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { OAdminTriageDashboard } from './OAdminTriageDashboard';

const meta: Meta<typeof OAdminTriageDashboard> = {
	title: 'Organisms/OAdminTriageDashboard',
	component: OAdminTriageDashboard,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OAdminTriageDashboard>;

export const Default: Story = {
	args: {
		patients: [
			{
				patientId: '1',
				patientName: 'John Doe',
				latestAssessment: {
					sessionId: '1',
					timestamp: '2025-01-15',
					score: 85,
					status: 'good',
				},
				history: { totalAssessments: 5, averageScore: 80, trend: 'improving' },
				criticalIssues: [],
				flags: {
					requiresReview: false,
					missedAssessments: false,
					rapidDeteriorationg: false,
				},
			},
		],
	},
};
