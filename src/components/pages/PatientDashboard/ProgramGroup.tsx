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
		id: 1,
		name: 'Full Body',
		key: 'full',
		frontend: {
			styles: "{ right: '-270px', bottom: '200px' }",
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

export const mainTemplateGroup = [
	{
		id: 1,
		name: 'Full Body',
		key: 'full',
		frontend: {
			styles: "{ right: '815px', top: '15px' }",
		},
	},
	{
		id: 9,
		name: 'Baseline Scan',
		key: 'baseline',
		frontend: {
			styles: "{ right: '630px', top: '15px' }",
		},
	},
];

export const bodyPartMapping = {
	'Full Body': 'full',
	'Lower Limb': 'lowerBody',
	'Lower Limb Left': 'lowerLeft',
	'Lower Limb Right': 'lowerRight',
	'Upper Limb': 'upperBody',
	'Upper Limb Left': 'upperLeft',
	'Upper Limb Right': 'upperRight',
	Spine: 'spine',
	'Baseline Scan': 'baseline',
	Neck: 'neck',
	'Right Shoulder': 'rightShoulder',
	'Right Elbow': 'rightElbow',
	'Right Wrist': 'rightWrist',
	'Left Shoulder': 'leftShoulder',
	'Left Elbow': 'leftElbow',
	'Left Wrist': 'leftWrist',
	'Right Hip': 'rightHip',
	'Right Knee': 'rightKnee',
	'Left Hip': 'leftHip',
	'Left Knee': 'leftKnee',
};

export const JointsBodyPartMapping = {
	'Lumbar Spine': ['neck','spine'],
	'Thoracic Spine': ['neck','spine'],
	'Neck and Head': 'neck',
	'Shoulder': ['rightShoulder' , 'leftShoulder'],
	'Elbow': ['leftElbow','rightElbow'],
	'Wrist': ['leftWrist','rightWrist'],
	'Hip': ['leftHip','rightHip'],
	'Knee': ['leftKnee','rightKnee'],
	'Ankle and Foot':['leftAnkle','rightAnkle']
};