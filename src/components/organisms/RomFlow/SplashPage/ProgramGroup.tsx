export const bodyPoints = [
	{
		id: 0,
		name: 'Right Shoulder',
		position: 'front',
		styles: { top: '95px', left: '56px' },
		part: 'rightShoulder',
	},
	{
		id: 1,
		name: 'Left Shoulder',
		position: 'front',
		styles: { top: '96px', right: '62px' },
		part: 'leftShoulder',
	},
	{
		id: 2,
		name: 'Right Elbow',
		position: 'front',
		styles: { top: '172px', left: '34px' },
		part: 'rightElbow',
	},
	{
		id: 3,
		name: 'Left Elbow',
		position: 'front',
		styles: { top: '172px', right: '42px' },
		part: 'leftElbow',
	},
	{
		id: 6,
		name: 'Right Hip',
		position: 'front',
		styles: { top: '240px', left: '72px' },
		part: 'rightHip',
	},
	{
		id: 7,
		name: 'Left Hip',
		position: 'front',
		styles: { top: '240px', right: '82px' },
		part: 'leftHip',
	},
	{
		id: 8,
		name: 'Right Knee',
		position: 'front',
		styles: { top: '360px', right: '138px' },
		part: 'rightKnee',
	},
	{
		id: 9,
		name: 'Left Knee',
		position: 'front',
		styles: { top: '360px', right: '80px' },
		part: 'leftKnee',
	},
	{
		id: 9,
		name: 'Right Wrist',
		position: 'front',
		styles: { top: '240px', left: '24px' },
		part: 'rightWrist',
	},
	{
		id: 10,
		name: 'Left Wrist',
		position: 'front',
		styles: { top: '240px', right: '30px' },
		part: 'leftWrist',
	},
	{
		id: 11,
		name: 'Neck',
		position: 'front',
		styles: { top: '70px', left: '102px' },
		part: 'neck',
	},
	{
		id: 12,
		name: 'Spine',
		position: 'front',
		styles: { top: '156px', left: '100px' },
		part: 'spine',
	},
];

export const sittingBodyPoints = [
	{
		id: 0,
		name: 'Right Shoulder',
		position: 'front',
		styles: { top: '216px', left: '160px' },
		part: 'rightShoulder',
	},
	{
		id: 1,
		name: 'Left Shoulder',
		position: 'front',
		styles: { top: '216px', right: '174px' },
		part: 'leftShoulder',
	},
	{
		id: 2,
		name: 'Right Elbow',
		position: 'front',
		styles: { top: '276px', left: '140px' },
		part: 'rightElbow',
	},
	{
		id: 3,
		name: 'Left Elbow',
		position: 'front',
		styles: { top: '276px', left: '258px' },
		part: 'leftElbow',
	},
	{
		id: 6,
		name: 'Right Hip',
		position: 'front',
		styles: { top: '330px', left: '175px' },
		part: 'rightHip',
	},
	{
		id: 7,
		name: 'Left Hip',
		position: 'front',
		styles: { top: '330px', right: '190px' },
		part: 'leftHip',
	},
	{
		id: 8,
		name: 'Right Knee',
		position: 'front',
		styles: { top: '388px', left: '152px' },
		part: 'rightKnee',
	},
	{
		id: 9,
		name: 'Left Knee',
		position: 'front',
		styles: { top: '388px', right: '166px' },
		part: 'leftKnee',
	},
	{
		id: 9,
		name: 'Right Wrist',
		position: 'front',
		styles: { top: '316px', right: '152px' },
		part: 'rightWrist',
	},
	{
		id: 10,
		name: 'Left Wrist',
		position: 'front',
		styles: { top: '315px', left: '140px' },
		part: 'leftWrist',
	},
	{
		id: 11,
		name: 'Neck',
		position: 'front',
		styles: { top: '194px', left: '199px' },
		part: 'neck',
	},
	{
		id: 12,
		name: 'Spine',
		position: 'front',
		styles: { top: '270px', left: '199px' },
		part: 'spine',
	},
];

export const templateGroup = [
	{
		id: 5,
		name: 'Upper Limb',
		key: 'upperBody',
		frontend: {
			styles: "{ right: '60px', top: '10px' }",
		},
	},
	{
		id: 7,
		name: 'Upper Limb Right',
		key: 'upperRight',
		frontend: {
			styles: "{ left: '-400px', top: '140px' }",
		},
	},
	{
		id: 6,
		name: 'Upper Limb Left',
		key: 'upperLeft',
		frontend: {
			styles: "{ right: '-160px', top: '140px' }",
		},
	},
	{
		id: 2,
		name: 'Lower Limb',
		key: 'lowerBody',
		frontend: {
			styles: "{ right: '50px', bottom: '-110px' }",
		},
	},
	{
		id: 4,
		name: 'Lower Limb Right',
		key: 'lowerRight',
		frontend: {
			styles: "{ left: '-400px', bottom: '40px' }",
		},
	},
	{
		id: 3,
		name: 'Lower Limb Left',
		key: 'lowerLeft',
		frontend: {
			styles: "{ right: '-160px', bottom: '40px' }",
		},
	},
	{
		id: 9,
		name: 'Baseline Scan',
		key: 'full',
		frontend: {
			styles: "{ left: '-540px', bottom: '200px' }",
		},
	},
];

const BASELINE_HOTSPOTS = [
	{ id: 53, name: 'Left Shoulder' },
	{ id: 52, name: 'Right Shoulder' },
	{ id: 51, name: 'Left Hip' },
	{ id: 55, name: 'Right Hip' },
];

export const mainTemplateGroup = [
	{
		vitalflowId: 55,
		serialId: 194,
		name: 'Sitting Baseline Scan ',
		key: 'sittingBaseline',
		frontend: {
			styles: "{ right: '630px', top: '15px' }",
		},
		hotspotPoints: [
			{
				id: 51,
				name: 'Left Hip',
			},
			{
				id: 52,
				name: 'Right Shoulder',
			},
			{
				id: 53,
				name: 'Left Shoulder',
			},
			{
				id: 55,
				name: 'Right Hip',
			},
		],
	},
	{
		vitalflowId: 9,
		serialId: 195,
		name: 'Baseline Scan',
		key: 'baseline',
		frontend: {
			styles: "{ right: '630px', top: '15px' }",
		},
		hotspotPoints: BASELINE_HOTSPOTS,
	},
	{
		vitalflowId: 999,
		name: 'Audio Guided Tour (Beta)',
		key: 'audio_tour',
		frontend: { styles: "{ right: '450px', top: '15px' }" },
		hotspotPoints: BASELINE_HOTSPOTS,
		navigateTo: '/rom/tutorial',
	},
];

export const buttonStyle = {
	color: 'var(--brand-primary)',
	border: 'inherit',
	width: '100%',
};
