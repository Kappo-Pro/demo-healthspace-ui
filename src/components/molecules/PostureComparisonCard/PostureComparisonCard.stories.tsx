/**
 * PostureComparisonCard Storybook Stories
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PostureComparisonCard } from './PostureComparisonCard';
import type { PostureComparison } from '@types/posture';

const meta: Meta<typeof PostureComparisonCard> = {
	title: 'Molecules/PostureComparisonCard',
	component: PostureComparisonCard,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: `
Side-by-side comparison of current vs baseline posture metrics.

### Features
- **Overall Score Comparison**: Visual comparison with trend indicators
- **Individual Metrics**: Detailed breakdown of each posture metric
- **Status Badges**: Color-coded status for both sessions
- **Responsive**: Mobile-friendly stacked layout
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof PostureComparisonCard>;

const improvementComparison: PostureComparison = {
	current: {
		sessionId: '2',
		timestamp: '2025-02-01T10:00:00Z',
		score: 85,
		metrics: {
			headAlignment: 90,
			shoulderSymmetry: 85,
			spineCurvature: 80,
			hipAlignment: 82,
			balance: 88,
		},
	},
	baseline: {
		sessionId: '1',
		timestamp: '2025-01-01T10:00:00Z',
		score: 72,
		metrics: {
			headAlignment: 75,
			shoulderSymmetry: 70,
			spineCurvature: 68,
			hipAlignment: 74,
			balance: 73,
		},
	},
	improvements: {
		overallChange: 18.06,
		metricChanges: {
			headAlignment: 20,
			shoulderSymmetry: 21.43,
			spineCurvature: 17.65,
			hipAlignment: 10.81,
			balance: 20.55,
		},
	},
};

export const Default: Story = {
	args: {
		comparison: improvementComparison,
		showMetricDetails: true,
		title: 'Posture Comparison',
	},
};

export const WithoutMetricDetails: Story = {
	args: {
		comparison: improvementComparison,
		showMetricDetails: false,
	},
};

const decliningComparison: PostureComparison = {
	current: {
		sessionId: '2',
		timestamp: '2025-02-01T10:00:00Z',
		score: 65,
		metrics: {
			headAlignment: 60,
			shoulderSymmetry: 68,
			spineCurvature: 70,
			hipAlignment: 63,
			balance: 64,
		},
	},
	baseline: {
		sessionId: '1',
		timestamp: '2025-01-01T10:00:00Z',
		score: 75,
		metrics: {
			headAlignment: 75,
			shoulderSymmetry: 78,
			spineCurvature: 72,
			hipAlignment: 76,
			balance: 74,
		},
	},
	improvements: {
		overallChange: -13.33,
		metricChanges: {
			headAlignment: -20,
			shoulderSymmetry: -12.82,
			spineCurvature: -2.78,
			hipAlignment: -17.11,
			balance: -13.51,
		},
	},
};

export const DecliningTrend: Story = {
	args: {
		comparison: decliningComparison,
		title: 'Recent Decline',
	},
};

export const InDashboard: Story = {
	render: () => (
		<div style={{ maxWidth: '800px', margin: '0 auto' }}>
			<PostureComparisonCard comparison={improvementComparison} />
		</div>
	),
};
