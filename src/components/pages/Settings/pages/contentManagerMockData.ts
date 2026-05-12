export const CONTENT_MANAGER_MOCK_DATA = {
	plans: [
		{
			title: 'Triage (injury risk assessment)',
			planType: "screening",
			description: `<p>Movement and posture screening to assess your flexibility.</p>
				<p>Tailored report with personal insights.</p>
				<p>Recommendations to improve your score.</p>`,
			thumbnail: '/images/dashboard/card-1.webp',
		},
		{
			title: 'Prehab (injury prevention)',
			planType: "earlyIntervention",
			description: `<p>All movement credit score features.</p>
				<p>Tailored Let’s Move programming to improve flexibility + strength + endurance.</p>
				<p>Personalized recommendations and training guides.</p>`,
			thumbnail: '/images/dashboard/card-2.webp',
		},
		{
			title: 'Rehab (virtual PT led program)',
			planType: "virtualPt",
			description: `<p>Virtual evaluation.</p>
				<p>Assignment of personalized care plan for recovery Asynchronous guided </p>
				<p>Let’s Move rehab sessions Virtual monitoring of activity with 1:1 support and communication </p>
				<p>Movement and posture screening </p>
				<p>Tailored health assessments and reports</p>`,
			thumbnail: '/images/dashboard/card-3.webp',
		},
	],
	preExistingConditions: {
		title:
			'I acknowledge I do not have any of the criteria listed above and am eligible to participate in this program.',
		description: `<p>1. Are there any pre-existing conditions or recent surgical procedures that impact your current functional movement?</p>
			<p>2. Do you have balance issues?</p>
			<p>3. Are you enrolled in any existing physical therapy program?</p>
			<p>4. Are you experiencing any joint discomfort that affects your mobility?</p>`,
		thumbnail: '/images/PreExistingCondition.png',
	},
	goals: [
		{
			title: 'Managing Discomfort',
			functionalGoalId: 1,
			description: `<p>Ease discomfort with rest, breathing, or movement to reduce stress and feel better</p>`,
			thumbnail:
				'/images/functional-goals/managing-discomfort.webp',
		},
		{
			title: 'Functional Independence & Daily Living',
			functionalGoalId: 2,
			description: `<p>Restore ROM, Strength, and Endurance Post-Injury, Pre/Post-Surgical Rehabilitation.</p>`,
			thumbnail:
				'/images/functional-goals/functional-independence.webp',
		},
		{
			title: 'Performance Enhancement',
			functionalGoalId: 3,
			description: `<p>Injury Prevention, Sports-Specific Training & Performance Optimization.</p>`,
			thumbnail:
				'/images/functional-goals/performance-enhancement.webp',
		},
		{
			title: 'Injury Prevention',
			functionalGoalId: 6,
			description: `<p>Improve strength, flexibility, balance, and movement control.</p>`,
			thumbnail:
				'/images/functional-goals/injury-prevention.webp',
		},
		{
			title: 'Holistic Well-being & Quality of Life',
			functionalGoalId: 7,
			description: `<p>Improve Overall Wellness & Stress Management, Enhance Quality of Life, Improve Cardiovascular and Respiratory Function, Weight Management.</p>`,
			thumbnail:
				'/images/functional-goals/holistic-wellbeing.webp',
		},
	],
};

export const PLAN_TYPES = ['screening', 'earlyIntervention', 'virtualPt'];

export const FUNCTIONAL_GOAL_IDS = [1, 2, 6, 7, 10];
