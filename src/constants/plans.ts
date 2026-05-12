export const PLAN_TYPES = ['screening', 'earlyIntervention', 'virtualPt'];

export const FUNCTIONAL_GOAL_IDS = [1, 2, 6, 7, 10];

export const PRE_DEFAULT_QUESTIONS = [
	'Are there any pre-existing conditions or recent surgical procedures that impact your current functional movement?',
	'Do you have balance issues?',
	'Are you enrolled in any existing physical therapy program?',
	'Are you experiencing any joint discomfort that affects your mobility?',
];

export const CONTENT_MANAGER_MOCK_DATA = {
	plans: [
		{
			title: 'Triage (injury risk assessment)',
			planType: 'screening',
			description: `<Paragraph>Movement and posture screening to assess your flexibility.</Paragraph>
				<Paragraph>Tailored report with personal insights.</Paragraph>
				<Paragraph>Recommendations to improve your score.</Paragraph>`,
			thumbnail: '/images/dashboard/card-1.webp',
		},
		{
			title: 'Prehab (injury prevention)',
			planType: 'earlyIntervention',
			description: `<Paragraph>All movement credit score features.</Paragraph>
				<Paragraph>Tailored Let's Move programming to improve flexibility + strength + endurance.</Paragraph>
				<Paragraph>Personalized recommendations and training guides.</Paragraph>`,
			thumbnail: '/images/dashboard/card-2.webp',
		},
		{
			title: 'Rehab (virtual PT led program)',
			planType: 'virtualPt',
			description: `<p>Virtual evaluation.</p>
				<Paragraph>Assignment of personalized care plan for recovery Asynchronous guided </Paragraph>
				<Paragraph>Let's Move rehab sessions Virtual monitoring of activity with 1:1 support and communication </Paragraph>
				<Paragraph>Movement and posture screening </Paragraph>
				<Paragraph>Tailored health assessments and reports</Paragraph>`,
			thumbnail: '/images/dashboard/card-3.webp',
		},
	],
	preExistingConditions: {
		title:
			'I acknowledge I do not have any of the criteria listed above and am eligible to participate in this program.',
		description: `<Paragraph>1. Are there any pre-existing conditions or recent surgical procedures that impact your current functional movement?</Paragraph>
			<Paragraph>2. Do you have balance issues?</Paragraph>
			<Paragraph>3. Are you enrolled in any existing physical therapy program?</Paragraph>
			<Paragraph>4. Are you experiencing any joint discomfort that affects your mobility?</Paragraph>`,
		thumbnail: '/images/PreExistingCondition.png',
	},
	goals: [
		{
			title: 'Managing Discomfort',
			functionalGoalId: 1,
			description: `<Paragraph>Ease discomfort with rest, breathing, or movement to reduce stress and feel better</Paragraph>`,
			thumbnail:
				'/images/functional-goals/managing-discomfort.webp',
		},
		{
			title: 'Functional Independence & Daily Living',
			functionalGoalId: 2,
			description: `<Paragraph>Restore ROM, Strength, and Endurance Post-Injury, Pre/Post-Surgical Rehabilitation.</Paragraph>`,
			thumbnail:
				'/images/functional-goals/functional-independence.webp',
		},
		{
			title: 'Performance Enhancement',
			functionalGoalId: 10,
			description: `<Paragraph>Injury Prevention, Sports-Specific Training & Performance Optimization.</Paragraph>`,
			thumbnail:
				'/images/functional-goals/performance-enhancement.webp',
		},
		{
			title: 'Injury Prevention',
			functionalGoalId: 6,
			description: `<Paragraph>Improve strength, flexibility, balance, and movement control.</Paragraph>`,
			thumbnail:
				'/images/functional-goals/injury-prevention.webp',
		},
		{
			title: 'Holistic Well-being & Quality of Life',
			functionalGoalId: 7,
			description: `<Paragraph>Improve Overall Wellness & Stress Management, Enhance Quality of Life, Improve Cardiovascular and Respiratory Function, Weight Management.</Paragraph>`,
			thumbnail:
				'/images/functional-goals/holistic-wellbeing.webp',
		},
	],
};
