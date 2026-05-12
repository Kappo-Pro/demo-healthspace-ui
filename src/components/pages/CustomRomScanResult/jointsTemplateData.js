import { IRomPatientResult } from '@types';

export const evalScore = record => {
	// Helper to check if value is left/right object
	const isLeftRightObject = (val) => {
		return val && typeof val === 'object' && !Array.isArray(val) && ('left' in val || 'right' in val);
	};

	// Priority: validatedScorePt → validatedScore → score (matches vitalflow-admin logic)
	const rawScore = record?.validatedScorePt ?? record?.validatedScore ?? record?.score;

	// If score is a left/right object, extract based on title
	if (isLeftRightObject(rawScore)) {
		const baseTitle = record?.title || '';
		const isLeft = baseTitle.toLowerCase().includes('left');
		const extractedScore = isLeft ? rawScore.left : rawScore.right;
		return Math.min(100, Math.round(extractedScore || 0));
	}

	// If score is a number, return it directly (capped at 100)
	if (typeof rawScore === 'number') {
		return Math.min(100, Math.round(rawScore));
	}

	// Fallback: calculate from value (legacy logic)
	const value =
		(typeof record?.validatedValuePt === 'number' ? record.validatedValuePt : null) ??
		(typeof record?.validatedValue === 'number' ? record.validatedValue : null) ??
		record?.value;

	if (value == -1) return Math.max(0);
	if (record?.normal == 0) return Math.max(100 - value || 0, 0);
	else if (value >= record?.normal) return 100;
	else return parseFloat((value / record?.normal) * 100).toFixed(2);
};

export const jointsTemplateData = [
	{
		key: 'rightShoulder',
		joint: 'Right Shoulder',
		position: { top: 85, left: 40 },
	},
	{
		key: 'leftShoulder',
		joint: 'Left Shoulder',
		position: { top: 85, left: 105 },
	},
	{
		key: 'rightHip',
		joint: 'Right Hip',
		position: { top: 185, left: 52 },
	},
	{
		key: 'leftHip',
		joint: 'Left Hip',
		position: { top: 185, left: 91 },
	},
	{
		key: 'rightKnee',
		joint: 'Right Knee',
		position: { top: 298, left: 48 },
	},
	{
		key: 'leftKnee',
		joint: 'Left Knee',
		position: { top: 298, left: 95 },
	},
	{
		key: 'rightElbow',
		joint: 'Right Elbow',
		position: { top: 145, left: 22 },
	},
	{
		key: 'leftElbow',
		joint: 'Left Elbow',
		position: { top: 145, left: 120 },
	},
	{
		key: 'rightWrist',
		joint: 'Right Wrist',
		position: { top: 195, left: 13 },
	},
	{
		key: 'leftWrist',
		joint: 'Left Wrist',
		position: { top: 195, left: 130 },
	},
	{
		key: 'neck',
		joint: 'Neck',
		position: { top: 65, left: 72 },
	},
	{
		key: 'spine',
		joint: 'Spine',
		position: { top: 130, left: 72 },
	},
];

export const sittingJointsTemplateData = [
	{
		key: 'rightShoulder',
		joint: 'Right Shoulder',
		position: { top: 176, left: 105 },
	},
	{
		key: 'leftShoulder',
		joint: 'Left Shoulder',
		position: { top: 176, left: 165 },
	},
	{
		key: 'rightHip',
		joint: 'Right Hip',
		position: { top: 242, left: 120 },
	},
	{
		key: 'leftHip',
		joint: 'Left Hip',
		position: { top: 242, left: 150 },
	},
	{
		key: 'rightKnee',
		joint: 'Right Knee',
		position: { top: 300, left: 100 },
	},
	{
		key: 'leftKnee',
		joint: 'Left Knee',
		position: { top: 300, left: 168 },
	},
	{
		key: 'rightElbow',
		joint: 'Right Elbow',
		position: { top: 220, left: 95 },
	},
	{
		key: 'leftElbow',
		joint: 'Left Elbow',
		position: { top: 220, left: 177 },
	},
	{
		key: 'rightWrist',
		joint: 'Right Wrist',
		position: { top: 252, left: 95 },
	},
	{
		key: 'leftWrist',
		joint: 'Left Wrist',
		position: { top: 252, left: 176 },
	},
	{
		key: 'neck',
		joint: 'Neck',
		position: { top: 150, left: 135 },
	},
	{
		key: 'spine',
		joint: 'Spine',
		position: { top: 206, left: 134 },
	},
];