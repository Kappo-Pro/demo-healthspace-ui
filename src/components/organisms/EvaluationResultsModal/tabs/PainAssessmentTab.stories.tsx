/**
 * PainAssessmentTab Storybook Stories
 *
 * Visual documentation and testing for PainAssessmentTab component.
 *
 * @version 2.2.0
 * @story Story 2.2 - Create PainAssessmentTab Component
 */

import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { PainAssessmentTab } from './PainAssessmentTab';

const meta: Meta<typeof PainAssessmentTab> = {
	title: 'Organisms/EvaluationResultsModal/Tabs/PainAssessmentTab',
	component: PainAssessmentTab,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `
PainAssessmentTab displays detailed pain assessment data with:
- Pain locations with primary location highlighting
- Visual severity indicators for pain intensity (0-10 scale)
- Pain characteristics as tags
- Temporal patterns with labeled sections
- Functional impact with severity indicators
- Responsive layout (mobile/tablet/desktop)
				`,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PainAssessmentTab>;

/**
 * Complete pain assessment data showing all sections populated
 */
const completeData = {
	locations: [
		{ name: 'Lower Back (L4-L5)', isPrimary: true },
		{ name: 'Left Hip', isPrimary: false },
		{ name: 'Right Knee', isPrimary: false },
	],
	intensity: 6,
	characteristics: ['Sharp', 'Aching', 'Stabbing', 'Radiating'],
	temporalPatterns: {
		frequency: 'Intermittent - occurs 4-5 times per week',
		duration: 'Present for approximately 6 months',
		timeOfDay: 'Morning stiffness (30-45 min), increases in evening',
		aggravatingFactors:
			'Prolonged sitting (>30 min), bending forward, lifting objects >10 lbs',
		relievingFactors:
			'Heat application, gentle movement, rest in supine position',
	},
	functionalImpact: {
		mobility: {
			description:
				'Difficulty walking distances >15 minutes, limited stair climbing',
			severity: 'medium' as const,
		},
		sleep: {
			description:
				'Wakes 2-3 times per night due to pain, difficulty finding comfortable position',
			severity: 'high' as const,
		},
		activities: {
			description:
				'Unable to sit at desk for >1 hour, difficulty with household chores',
			severity: 'medium' as const,
		},
		selfCare: {
			description:
				'Difficulty with sock and shoe application, bending to tie shoes',
			severity: 'low' as const,
		},
	},
};

/**
 * High severity pain (8-10/10) with severe functional limitations
 */
const highSeverityData = {
	locations: [
		{ name: 'Lower Back (L3-S1)', isPrimary: true },
		{ name: 'Right Leg (Sciatica)', isPrimary: false },
	],
	intensity: 9,
	characteristics: ['Severe', 'Constant', 'Burning', 'Shooting', 'Electric'],
	temporalPatterns: {
		frequency: 'Constant - pain present 24/7 with fluctuating intensity',
		duration: 'Present for 3 months, worsening over past 2 weeks',
		timeOfDay: 'Severe all day, worst in morning and late evening',
		aggravatingFactors:
			'Any movement, standing, sitting, walking, coughing, sneezing',
		relievingFactors:
			'None consistently effective, minimal relief with strong medication',
	},
	functionalImpact: {
		mobility: {
			description:
				'Severely limited - requires walker for ambulation, cannot walk >50 feet',
			severity: 'high' as const,
		},
		sleep: {
			description:
				'Unable to sleep more than 2 hours consecutively, wakes every 30-60 minutes',
			severity: 'high' as const,
		},
		activities: {
			description:
				'Unable to perform work or household activities, dependent for grocery shopping',
			severity: 'high' as const,
		},
		selfCare: {
			description:
				'Significant difficulty with bathing, dressing, requires assistance for shoes',
			severity: 'high' as const,
		},
	},
};

/**
 * Minimal data - only locations and intensity
 */
const minimalData = {
	locations: ['Lower Back', 'Left Shoulder'],
	intensity: 4,
};

/**
 * Low severity pain with minimal impact
 */
const lowSeverityData = {
	locations: [{ name: 'Neck', isPrimary: true }],
	intensity: 2,
	characteristics: ['Dull', 'Aching'],
	temporalPatterns: {
		frequency: 'Occasional - 1-2 times per week',
		duration: 'Present for 2 weeks',
		timeOfDay: 'End of workday',
		aggravatingFactors: 'Prolonged computer work, poor posture',
		relievingFactors: 'Stretching, proper ergonomics, rest',
	},
	functionalImpact: {
		mobility: {
			description: 'Minimal impact, slight stiffness with prolonged positions',
			severity: 'low' as const,
		},
		sleep: {
			description: 'No impact on sleep quality',
			severity: 'low' as const,
		},
		activities: {
			description: 'Able to perform all activities with mild discomfort',
			severity: 'low' as const,
		},
	},
};

/**
 * Chronic pain with complex patterns
 */
const complexPatternsData = {
	locations: [
		{ name: 'Bilateral Knees', isPrimary: true },
		{ name: 'Left Ankle', isPrimary: false },
		{ name: 'Right Hip', isPrimary: false },
	],
	intensity: 7,
	characteristics: [
		'Throbbing',
		'Aching',
		'Stiffness',
		'Swelling',
		'Grinding',
		'Locking',
	],
	temporalPatterns: {
		frequency:
			'Daily with variable intensity, episodic severe flare-ups monthly',
		duration: 'Chronic condition - 5+ years, progressive worsening',
		timeOfDay:
			'Morning stiffness (60-90 min), improves midday, worsens with weather changes',
		aggravatingFactors:
			'Stairs, prolonged standing, kneeling, cold/damp weather, weight-bearing activities',
		relievingFactors:
			'Rest, ice application, elevation, NSAIDs, gentle ROM exercises, compression',
	},
	functionalImpact: {
		mobility: {
			description:
				'Difficulty with stairs (requires handrail), limited walking distance (2-3 blocks)',
			severity: 'high' as const,
		},
		sleep: {
			description:
				'Difficulty finding comfortable positions, wakes 1-2 times nightly',
			severity: 'medium' as const,
		},
		activities: {
			description:
				'Cannot participate in recreational activities, difficulty with grocery shopping',
			severity: 'high' as const,
		},
		selfCare: {
			description:
				'Difficulty with bathing (getting in/out of tub), sock application',
			severity: 'medium' as const,
		},
	},
};

/**
 * No data - empty state
 */
const noData = {};

// ============================================================
// Stories
// ============================================================

/**
 * Default story with complete pain assessment data
 */
export const Default: Story = {
	args: {
		data: completeData,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Complete pain assessment showing all sections with typical clinical data.',
			},
		},
	},
};

/**
 * High severity pain (9/10) with severe functional limitations
 */
export const HighSeverity: Story = {
	args: {
		data: highSeverityData,
	},
	parameters: {
		docs: {
			description: {
				story:
					'High severity pain (9/10) requiring immediate clinical attention. Shows severe functional impact across all domains.',
			},
		},
	},
};

/**
 * Low severity pain (2/10) with minimal impact
 */
export const LowSeverity: Story = {
	args: {
		data: lowSeverityData,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Low severity pain (2/10) with minimal functional impact. Typical for recent onset musculoskeletal issues.',
			},
		},
	},
};

/**
 * Minimal data - only locations and intensity
 */
export const MinimalData: Story = {
	args: {
		data: minimalData,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Minimal pain data showing empty states for characteristics, patterns, and impact. Demonstrates graceful handling of incomplete assessments.',
			},
		},
	},
};

/**
 * Complex chronic pain with multiple locations and patterns
 */
export const ComplexPatterns: Story = {
	args: {
		data: complexPatternsData,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Complex chronic pain scenario with multiple locations, characteristics, and detailed temporal patterns. Shows how component handles extensive clinical data.',
			},
		},
	},
};

/**
 * No data - complete empty state
 */
export const NoData: Story = {
	args: {
		data: noData,
	},
	parameters: {
		docs: {
			description: {
				story:
					'Complete empty state when no pain assessment data is available. Shows global fallback message.',
			},
		},
	},
};

/**
 * Mobile viewport (375px) with complete data
 */
export const MobileView: Story = {
	args: {
		data: completeData,
	},
	parameters: {
		viewport: {
			defaultViewport: 'mobile1',
		},
		docs: {
			description: {
				story:
					'Mobile viewport showing single-column stacked layout. All content remains accessible and readable.',
			},
		},
	},
};

/**
 * Tablet viewport (768px) with complete data
 */
export const TabletView: Story = {
	args: {
		data: completeData,
	},
	parameters: {
		viewport: {
			defaultViewport: 'tablet',
		},
		docs: {
			description: {
				story:
					'Tablet viewport showing two-column grid layout. Locations/intensity on left, characteristics/patterns on right.',
			},
		},
	},
};

/**
 * String array locations (legacy format)
 */
export const StringArrayLocations: Story = {
	args: {
		data: {
			locations: ['Lower Back', 'Left Hip', 'Right Knee'],
			intensity: 5,
			characteristics: ['Sharp', 'Aching'],
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Legacy format with locations as string array (no primary designation). Component handles both formats gracefully.',
			},
		},
	},
};

/**
 * Partial functional impact (only some categories)
 */
export const PartialFunctionalImpact: Story = {
	args: {
		data: {
			locations: [{ name: 'Lower Back', isPrimary: true }],
			intensity: 6,
			functionalImpact: {
				mobility: {
					description: 'Difficulty with prolonged standing',
					severity: 'medium' as const,
				},
				sleep: {
					description: 'Minimal sleep disruption',
					severity: 'low' as const,
				},
				// No activities or selfCare data
			},
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Partial functional impact data (only mobility and sleep). Shows how component handles incomplete impact assessments.',
			},
		},
	},
};

/**
 * Multiple pain characteristics
 */
export const ManyCharacteristics: Story = {
	args: {
		data: {
			locations: ['Widespread'],
			intensity: 7,
			characteristics: [
				'Sharp',
				'Dull',
				'Aching',
				'Burning',
				'Stabbing',
				'Throbbing',
				'Shooting',
				'Tingling',
				'Numbness',
				'Cramping',
			],
		},
	},
	parameters: {
		docs: {
			description: {
				story:
					'Multiple pain characteristics demonstrating tag wrapping behavior. Typical for complex pain syndromes.',
			},
		},
	},
};
