import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { videoSize } from '@pages/PostureScan/constants';
import { PersonOrientation } from './SkeletonMedia';

type View = 'front' | 'left' | 'right' | 'back';

export type NamedAssessment = {
	[key: string]: boolean;
};

export type AngleBasedAssessment = {
	angle: number;
	assessment: NamedAssessment;
};

export type LegBasedAssessment = {
	leftLeg: AngleBasedAssessment;
	rightLeg: AngleBasedAssessment;
};

export type KneeBackAssessment = {
	kneeToHipRatio: number;
	assessment: NamedAssessment;
};

export type PostureAssessmentEntry =
	| AngleBasedAssessment
	| LegBasedAssessment
	| KneeBackAssessment;

export type PostureAssessmentMap = {
	roundedShoulders?: AngleBasedAssessment;
	kneeValgus?: LegBasedAssessment | KneeBackAssessment;
	kneeVarus?: LegBasedAssessment;
	kyphosis?: AngleBasedAssessment;
	lordosis?: AngleBasedAssessment;
	forwardHead?: AngleBasedAssessment;
	flatBack?: AngleBasedAssessment;
	scoliosis?: AngleBasedAssessment;
	anteriorPelvicTilt?: AngleBasedAssessment;
	posteriorPelvicTilt?: AngleBasedAssessment;
};

export type FullAssessmentValue = {
	[key in View]?: PostureAssessmentMap;
};

export function drawExclusionOverlay(
	ctx: CanvasRenderingContext2D,
	boxX: number,
	boxY: number,
	boxWidth: number,
	boxHeight: number,
	overlayColor = 'rgba(0, 0, 0, 0.5)', // equiv: var(--surface-overlay)
) {
	ctx.save();

	ctx.beginPath();
	ctx.rect(0, 0, videoSize.width, videoSize.height);

	ctx.rect(boxX + boxWidth, boxY, -boxWidth, boxHeight);

	// Set the fill color for the overlay
	ctx.fillStyle = overlayColor;

	// Fill everything except the box (using "evenodd" fill rule)
	ctx.fill('evenodd');

	ctx.restore();
}

export const FRONT_VIEW_CONNECTIONS = [
	{ start: 11, end: 12 },
	{ start: 11, end: 13 },
	{ start: 13, end: 15 },
	{ start: 12, end: 14 },
	{ start: 14, end: 16 },
	{ start: 11, end: 23 },
	{ start: 12, end: 24 },
	{ start: 23, end: 24 },
	{ start: 23, end: 25 },
	{ start: 25, end: 27 },
	{ start: 24, end: 26 },
	{ start: 26, end: 28 },
];

export const LEFT_VIEW_CONNECTIONS = [
	{ start: 11, end: 13 },
	{ start: 13, end: 15 },
	{ start: 11, end: 23 },
	{ start: 23, end: 25 },
	{ start: 25, end: 27 },
];

export const RIGHT_VIEW_CONNECTIONS = [
	{ start: 12, end: 14 },
	{ start: 14, end: 16 },
	{ start: 12, end: 24 },
	{ start: 24, end: 26 },
	{ start: 26, end: 28 },
];
export const BACK_VIEW_CONNECTIONS = FRONT_VIEW_CONNECTIONS;

export function drawVerticalLine(
	ctx: CanvasRenderingContext2D,
	color: 'red' | 'green' | 'yellow', // ignore
	x: number,
) {
	ctx.strokeStyle = color;
	ctx.lineWidth = 5;
	ctx.beginPath();
	// ctx.setLineDash(dashArray);
	ctx.moveTo(x, 0);
	ctx.lineTo(x, videoSize.height);
	ctx.stroke();
}

export function drawDashedLineHorizontal(
	ctx: CanvasRenderingContext2D,
	landmark: NormalizedLandmark,
) {
	const y = landmark.y * videoSize.height;

	ctx.strokeStyle = '#9747FF'; // equiv: var(--brand-primary)
	ctx.lineWidth = 2;
	// ctx.setLineDash(dashArray);
	ctx.beginPath();
	ctx.moveTo(0, y);
	ctx.lineTo(videoSize.width, y);
	ctx.stroke();
}
export function drawCenterLine(
	ctx: CanvasRenderingContext2D,
	color = 'blue',
	lineWidth = 2,
) {
	// const centerX = videoSize.width / 2;
	const centerX = ctx.canvas.width / 2;

	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.beginPath();
	// ctx.setLineDash(dashArray); // Using the same dash pattern as other lines
	ctx.moveTo(centerX, 0);
	ctx.lineTo(centerX, videoSize.height);
	ctx.stroke();
}

// export function drawCenteringBox(
// 	ctx: CanvasRenderingContext2D,
// 	boxX: number,
// 	boxY: number,
// 	boxWidth: number,
// 	boxHeight: number,
// 	color = 'rgba(80,77,255,0.55)',
// 	lineWidth = 3,
// ) {
// 	// Draw rectangle
// 	ctx.strokeStyle = color;
// 	ctx.lineWidth = lineWidth;
// 	ctx.beginPath();
// 	ctx.rect(boxX, boxY, boxWidth, boxHeight);
// 	ctx.stroke();
// }

export function drawCenteringBox(
	ctx: CanvasRenderingContext2D,
	boxX: number,
	boxY: number,
	boxWidth: number,
	boxHeight: number,
	// Canvas API requires hex
	// eslint-disable-next-line vitalflow/no-hardcoded-colors
	color = '#9f30ed', // brand-primary
	lineWidth = 1.354,
	// Canvas API requires rgba
	// eslint-disable-next-line vitalflow/no-hardcoded-colors
	overlay = 'rgba(159, 48, 237, 0.15)', // purple-alpha-15
	borderRadius = 10.829,
) {
	ctx.save();

	// Draw rounded rectangle with fill
	ctx.beginPath();
	ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
	ctx.fillStyle = overlay;
	ctx.fill();

	// Draw border
	ctx.strokeStyle = color;
	ctx.lineWidth = lineWidth;
	ctx.stroke();

	ctx.restore();
}

export function calculateAngle(
	pointA: { x: number; y: number },
	pointB: { x: number; y: number },
	pointC: { x: number; y: number },
) {
	const vectorAB = {
		x: pointA.x - pointB.x,
		y: pointA.y - pointB.y,
	};

	const vectorBC = {
		x: pointC.x - pointB.x,
		y: pointC.y - pointB.y,
	};

	const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;

	const magnitudeAB = Math.sqrt(
		vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y,
	);
	const magnitudeBC = Math.sqrt(
		vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y,
	);

	const angleRadians = Math.acos(dotProduct / (magnitudeAB * magnitudeBC));
	const angleDegrees = angleRadians * (180 / Math.PI);

	return angleDegrees;
}

export function assessRoundedShouldersFront(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const leftShoulder = { x: results[11].x * width, y: results[11].y * height };
	const rightShoulder = { x: results[12].x * width, y: results[12].y * height };

	const shoulderMid = {
		x: (leftShoulder.x + rightShoulder.x) / 2,
		y: (leftShoulder.y + rightShoulder.y) / 2,
	};
	const centerX = width / 2;
	const shoulderAngleDeg =
		Math.atan2(
			rightShoulder.y - leftShoulder.y,
			rightShoulder.x - leftShoulder.x,
		) *
		(180 / Math.PI);

	const deviationAngle = Math.abs(shoulderAngleDeg);
	const shoulderDeviation = (Math.abs(shoulderMid.x - centerX) / width) * 20;
	const totalDeviation = Math.min(20, deviationAngle * 0.5 + shoulderDeviation);

	return {
		angle: totalDeviation,
		assessment: { 'Rounded Shoulders': totalDeviation > 10 },
	};
}

export function assessRoundedShouldersLateral(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const shoulder = { x: results[12].x * width, y: results[12].y * height };
	const ear = { x: results[8].x * width, y: results[8].y * height };

	const forwardDeviation = shoulder.x - ear.x; // +ve = rounded
	const personHeight = Math.abs(results[0].y - results[24].y) * height;
	const scaledDeviation = (forwardDeviation / personHeight) * 100;

	const deviationAngle =
		forwardDeviation > 0 ? Math.min(20, scaledDeviation * 2) : 0;

	return {
		angle: deviationAngle,
		assessment: { 'Rounded Shoulders': deviationAngle > 10 },
	};
}

export function assessKneeValgusFront(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const lHip = { x: results[23].x * width, y: results[23].y * height };
	const lKnee = { x: results[25].x * width, y: results[25].y * height };
	const lAnk = { x: results[27].x * width, y: results[27].y * height };

	const rHip = { x: results[24].x * width, y: results[24].y * height };
	const rKnee = { x: results[26].x * width, y: results[26].y * height };
	const rAnk = { x: results[28].x * width, y: results[28].y * height };

	const lAngle = calculateAngle(lHip, lKnee, lAnk);
	const rAngle = calculateAngle(rHip, rKnee, rAnk);

	return {
		leftLeg: { angle: lAngle, assessment: { 'Knee Valgus': lAngle < 175 } },
		rightLeg: { angle: rAngle, assessment: { 'Knee Valgus': rAngle < 175 } },
	};
}
export function assessKneeValgusBack(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const lHip = { x: results[23].x * width, y: results[23].y * height };
	const rHip = { x: results[24].x * width, y: results[24].y * height };
	const lKnee = { x: results[25].x * width, y: results[25].y * height };
	const rKnee = { x: results[26].x * width, y: results[26].y * height };
	const lAnk = { x: results[27].x * width, y: results[27].y * height };
	const rAnk = { x: results[28].x * width, y: results[28].y * height };

	const hipWidth = Math.abs(lHip.x - rHip.x);
	const kneeDistance = Math.abs(lKnee.x - rKnee.x);
	const ankleDistance = Math.abs(lAnk.x - rAnk.x);

	const kneeToHipRatio = kneeDistance / hipWidth;
	const kneeToAnkleRatio = kneeDistance / ankleDistance;

	const valgus = kneeToHipRatio < 0.8 || kneeToAnkleRatio < 0.8;
	const misalign =
		Math.abs((lHip.x + lAnk.x) / 2 - lKnee.x) > width * 0.02 ||
		Math.abs((rHip.x + rAnk.x) / 2 - rKnee.x) > width * 0.02;

	return {
		kneeToHipRatio,
		assessment: {
			'Knee Valgus': valgus,
			'Knee Misalignment': misalign,
		},
	};
}

export function assessKneeVarusFront(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const lHip = { x: results[23].x * width, y: results[23].y * height };
	const lKnee = { x: results[25].x * width, y: results[25].y * height };
	const lAnk = { x: results[27].x * width, y: results[27].y * height };

	const rHip = { x: results[24].x * width, y: results[24].y * height };
	const rKnee = { x: results[26].x * width, y: results[26].y * height };
	const rAnk = { x: results[28].x * width, y: results[28].y * height };

	const lAngle = calculateAngle(lHip, lKnee, lAnk);
	const rAngle = calculateAngle(rHip, rKnee, rAnk);

	return {
		leftLeg: { angle: lAngle, assessment: { 'Knee Varus': lAngle > 185 } },
		rightLeg: { angle: rAngle, assessment: { 'Knee Varus': rAngle > 185 } },
	};
}

export function assessKneeLateral(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const facingRight = results[0].z < 0;
	const hipIdx = facingRight ? 24 : 23;
	const kneeIdx = facingRight ? 26 : 25;
	const ankleIdx = facingRight ? 28 : 27;

	const hip = { x: results[hipIdx].x * width, y: results[hipIdx].y * height };
	const knee = {
		x: results[kneeIdx].x * width,
		y: results[kneeIdx].y * height,
	};
	const ankle = {
		x: results[ankleIdx].x * width,
		y: results[ankleIdx].y * height,
	};

	const kneeAngle = calculateAngle(hip, knee, ankle);
	const misalignment = Math.abs(kneeAngle - 180) > 5;

	return {
		angle: kneeAngle,
		assessment: { 'Knee Misalignment': misalignment },
	};
}

export function assessKyphosisLateral(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const nose = { x: results[0].x * width, y: results[0].y * height };
	const shoulder = { x: results[12].x * width, y: results[12].y * height };
	const hip = { x: results[24].x * width, y: results[24].y * height };

	const thoracicAngle = calculateAngle(nose, shoulder, hip);
	const deviation = Math.abs(180 - thoracicAngle); // expected 20-40Â°
	const kyphosisPresent = deviation > 40;

	return {
		angle: deviation,
		assessment: { Kyphosis: kyphosisPresent },
	};
}

export function assessLordosisLateral(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const shoulder = { x: results[12].x * width, y: results[12].y * height };
	const hip = { x: results[24].x * width, y: results[24].y * height };
	const knee = { x: results[26].x * width, y: results[26].y * height };

	const lumbarAngle = calculateAngle(shoulder, hip, knee);
	const deviation = Math.abs(180 - lumbarAngle); // normal 30-50Â°
	const lordosis = deviation > 50;

	return {
		angle: deviation,
		assessment: { Lordosis: lordosis },
	};
}

export function assessForwardHeadLateral(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const ear = { x: results[8].x * width, y: results[8].y * height };
	const shoulder = { x: results[12].x * width, y: results[12].y * height };

	const forwardDev = Math.abs(ear.x - shoulder.x);
	const personHeight = Math.abs(results[0].y - results[28].y) * height;
	const normDev = (forwardDev / personHeight) * 100;
	const headAngle = Math.min(20, normDev * 0.5);
	const forwardHead = headAngle > 10;

	return {
		angle: headAngle,
		assessment: { 'Forward Head Posture': forwardHead },
	};
}

export function assessFlatBackLateral(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const nose = { x: results[0].x * width, y: results[0].y * height };
	const shoulder = { x: results[12].x * width, y: results[12].y * height };
	const hip = { x: results[24].x * width, y: results[24].y * height };
	const knee = { x: results[26].x * width, y: results[26].y * height };

	const upperAngle = calculateAngle(nose, shoulder, hip);
	const lowerAngle = calculateAngle(shoulder, hip, knee);
	const avgCurve =
		(Math.abs(180 - upperAngle) + Math.abs(180 - lowerAngle)) / 2;

	return {
		angle: avgCurve,
		assessment: { 'Flat Back': avgCurve < 10 },
	};
}

export function assessScoliosisBack(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const lShoulder = { x: results[11].x * width, y: results[11].y * height };
	const rShoulder = { x: results[12].x * width, y: results[12].y * height };
	const lHip = { x: results[23].x * width, y: results[23].y * height };
	const rHip = { x: results[24].x * width, y: results[24].y * height };

	const shoulderMid = {
		x: (lShoulder.x + rShoulder.x) / 2,
		y: (lShoulder.y + rShoulder.y) / 2,
	};
	const hipMid = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };

	const lateralDev = Math.abs(shoulderMid.x - hipMid.x);
	const bodyWidth = Math.abs(lShoulder.x - rShoulder.x);
	const devRatio = (lateralDev / bodyWidth) * 100;
	const scolAngle = Math.min(30, devRatio);

	return {
		angle: scolAngle,
		assessment: { Scoliosis: scolAngle > 10 },
	};
}

export function assessAnteriorPelvicTiltLateral(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const shoulder = { x: results[12].x * width, y: results[12].y * height };
	const hip = { x: results[24].x * width, y: results[24].y * height };
	const knee = { x: results[26].x * width, y: results[26].y * height };

	const pelvicAngle = calculateAngle(shoulder, hip, knee);
	const tiltAngle = Math.abs(180 - pelvicAngle); // normal 5-10Â°
	const anteriorTilt = tiltAngle > 10;

	return {
		angle: tiltAngle,
		assessment: { 'Anterior Pelvic Tilt': anteriorTilt },
	};
}

export function assessPosteriorPelvicTiltLateral(
	results: NormalizedLandmark[],
	width: number,
	height: number,
) {
	if (!results?.length) return null;

	const shoulder = { x: results[12].x * width, y: results[12].y * height };
	const hip = { x: results[24].x * width, y: results[24].y * height };
	const knee = { x: results[26].x * width, y: results[26].y * height };

	const pelvicAngle = calculateAngle(shoulder, hip, knee);
	const tiltAngle = 180 - pelvicAngle; // posterior if negative
	const posteriorTilt = tiltAngle < 0;

	return {
		angle: Math.abs(tiltAngle),
		assessment: { 'Posterior Pelvic Tilt': posteriorTilt },
	};
}

type AssessmentResult = {
	status: 'normal' | 'mild' | 'moderate' | 'severe';
	confidence: number; // between 0 and 1
	angle?: number; // optional, used when relevant
	notes?: string;
};

type PostureAssessments = {
	roundedShoulders?: AssessmentResult;
	kneeValgus?: AssessmentResult;
	kneeVarus?: AssessmentResult;
	kyphosis?: AssessmentResult;
	lordosis?: AssessmentResult;
	forwardHead?: AssessmentResult;
	flatBack?: AssessmentResult;
	scoliosis?: AssessmentResult;
	anteriorPelvicTilt?: AssessmentResult;
	posteriorPelvicTilt?: AssessmentResult;
};

export function assessPosture(
	results: NormalizedLandmark[],
	width: number,
	height: number,
	ctx: CanvasRenderingContext2D,
	currentView: 'front' | 'left' | 'right' | 'back' | undefined,
): PostureAssessments | undefined {
	if (!results || results.length === 0) return;

	const assessments: PostureAssessments = {};

	switch (currentView) {
		case 'front':
			Object.assign(assessments, {
				roundedShoulders: assessRoundedShouldersFront(results, width, height),
				kneeValgus: assessKneeValgusFront(results, width, height),
				kneeVarus: assessKneeVarusFront(results, width, height),
			});
			break;

		case 'back':
			Object.assign(assessments, {
				kneeValgus: assessKneeValgusBack(results, width, height),
				scoliosis: assessScoliosisBack(results, width, height),
			});
			break;
		case 'left':
		case 'right':
			Object.assign(assessments, {
				roundedShoulders: assessRoundedShouldersLateral(results, width, height),
				kyphosis: assessKyphosisLateral(results, width, height),
				lordosis: assessLordosisLateral(results, width, height),
				forwardHead: assessForwardHeadLateral(results, width, height),
				flatBack: assessFlatBackLateral(results, width, height),
				anteriorPelvicTilt: assessAnteriorPelvicTiltLateral(
					results,
					width,
					height,
				),
				posteriorPelvicTilt: assessPosteriorPelvicTiltLateral(
					results,
					width,
					height,
				),
			});
			break;
		default:
			Object.assign(assessments, {
				roundedShoulders: assessRoundedShouldersFront(results, width, height),
				kneeValgus: assessKneeValgusFront(results, width, height),
				kneeVarus: assessKneeVarusFront(results, width, height),
			});
	}

	return assessments;
}
// export function assessPosture(
//     results: NormalizedLandmark[],
//     width: number,
//     height: number,
//     ctx: CanvasRenderingContext2D,
//     currentView: 'front' | 'left' | 'right' | 'back' | undefined,
// ) {
//     if (!results || results.length === 0) return;

//     const assessments: {
//         roundedShoulders?:
//             | ReturnType<typeof assessRoundedShouldersFront>
//             | ReturnType<typeof assessRoundedShouldersLateral>;
//         kneeValgus?:
//             | ReturnType<typeof assessKneeValgusFront>
//             | ReturnType<typeof assessKneeValgusBack>;
//     } = {};

//     switch (currentView) {
//         case 'front':
//             assessments.roundedShoulders = assessRoundedShouldersFront(
//                 results,
//                 width,
//                 height,
//                 ctx,
//             );
//             assessments.kneeValgus = assessKneeValgusFront(
//                 results,
//                 width,
//                 height,
//                 ctx,
//             );
//             break;
//         case 'back':
//             assessments.kneeValgus = assessKneeValgusBack(
//                 results,
//                 width,
//                 height,
//                 ctx,
//             );
//             break;
//         case 'left':
//         case 'right':
//             assessments.roundedShoulders = assessRoundedShouldersLateral(
//                 results,
//                 width,
//                 height,
//                 ctx,
//             );
//             break;
//         default:
//             // Default to front view if not specified
//             assessments.roundedShoulders = assessRoundedShouldersFront(
//                 results,
//                 width,
//                 height,
//                 ctx,
//             );
//             assessments.kneeValgus = assessKneeValgusFront(
//                 results,
//                 width,
//                 height,
//                 ctx,
//             );
//     }

//     return assessments;
// }

export function isPersonInBoxFn(
	results: NormalizedLandmark[],
	boxX: number,
	boxY: number,
	boxWidth: number,
	boxHeight: number,
	width: number,
	height: number,
): boolean {
	if (!results || results.length === 0) return false;

	const leftShoulder = results[11];
	const rightShoulder = results[12];
	const leftHip = results[23];
	const rightHip = results[24];
	const nose = results[0];

	const leftShoulderX = leftShoulder.x * width;
	const rightShoulderX = rightShoulder.x * width;
	const leftHipX = leftHip.x * width;
	const rightHipX = rightHip.x * width;
	const noseX = nose.x * width;

	const leftShoulderY = leftShoulder.y * height;
	const rightShoulderY = rightShoulder.y * height;
	const leftHipY = leftHip.y * height;
	const rightHipY = rightHip.y * height;
	const noseY = nose.y * height;

	return (
		noseX >= boxX &&
		noseX <= boxX + boxWidth &&
		noseY >= boxY &&
		noseY <= boxY + boxHeight &&
		leftShoulderX >= boxX &&
		leftShoulderX <= boxX + boxWidth &&
		leftShoulderY >= boxY &&
		leftShoulderY <= boxY + boxHeight &&
		rightShoulderX >= boxX &&
		rightShoulderX <= boxX + boxWidth &&
		rightShoulderY >= boxY &&
		rightShoulderY <= boxY + boxHeight &&
		leftHipX >= boxX &&
		leftHipX <= boxX + boxWidth &&
		leftHipY >= boxY &&
		leftHipY <= boxY + boxHeight &&
		rightHipX >= boxX &&
		rightHipX <= boxX + boxWidth &&
		rightHipY >= boxY &&
		rightHipY <= boxY + boxHeight
	);
}

export const determineOrientation = (
	landmarks: NormalizedLandmark[],
): PersonOrientation => {
	const get = (i: number) => landmarks[i];

	// Facial landmarks for FRONT/BACK detection
	const nose = get(0);
	const leftEar = get(7);
	const rightEar = get(8);

	const leftShoulder = get(11);
	const rightShoulder = get(12);
	const leftHip = get(23);
	const rightHip = get(24);

	const leftAnkle = get(27);
	const rightAnkle = get(28);
	const leftHeel = get(29);
	const rightHeel = get(30);
	const leftFoot = get(31);
	const rightFoot = get(32);

	const shouldersVisible =
		leftShoulder?.visibility > 0.7 && rightShoulder?.visibility > 0.7;

	if (shouldersVisible) {
		const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);

		const shoulderZDiff = Math.abs(leftShoulder.z - rightShoulder.z);
		const hipZDiff = Math.abs(leftHip.z - rightHip.z);
		const avgZDiff = (shoulderZDiff + hipZDiff) / 2;

		if (avgZDiff > 0.15) {
			if (leftShoulder.z < rightShoulder.z && leftHip.z < rightHip.z) {
				return PersonOrientation.LEFT;
			}
			if (rightShoulder.z < leftShoulder.z && rightHip.z < leftHip.z) {
				return PersonOrientation.RIGHT;
			}
		}

		// Detect FRONT vs BACK using shoulder x-position
		// When facing camera (FRONT): left shoulder appears on RIGHT side of image (mirrored)
		//   → leftShoulder.x > rightShoulder.x
		// When back to camera (BACK): left shoulder appears on LEFT side of image
		//   → leftShoulder.x < rightShoulder.x
		const shoulderXDiff = leftShoulder.x - rightShoulder.x;

		// Debug logging for orientation detection

		// Significant difference indicates clear FRONT or BACK
		// Positive diff = FRONT (left shoulder on right side of image)
		// Negative diff = BACK (left shoulder on left side of image)
		if (shoulderXDiff < -0.02) {
			return PersonOrientation.BACK;
		}

		const hipsVisible = leftHip?.visibility > 0.5 && rightHip?.visibility > 0.5;

		if (hipsVisible) {
			const hipWidth = Math.abs(rightHip.x - leftHip.x);
			const ratio = shoulderWidth / hipWidth;
			if (ratio > 1.2 || ratio < 0.8) return PersonOrientation.FRONT;
		}

		return PersonOrientation.FRONT;
	}

	if (leftShoulder?.visibility > 0.7 && rightShoulder?.visibility < 0.4) {
		return PersonOrientation.LEFT;
	}
	if (rightShoulder?.visibility > 0.7 && leftShoulder?.visibility < 0.4) {
		return PersonOrientation.RIGHT;
	}

	const feetVisible = [
		leftAnkle,
		rightAnkle,
		leftHeel,
		rightHeel,
		leftFoot,
		rightFoot,
	].every(lm => lm?.visibility > 0.5);

	if (feetVisible) {
		const leftDir = leftFoot.x - leftHeel.x;
		const rightDir = rightFoot.x - rightHeel.x;

		if (leftDir < -0.05 && rightDir < -0.05) return PersonOrientation.LEFT;
		if (leftDir > 0.05 && rightDir > 0.05) return PersonOrientation.RIGHT;

		const footGap = Math.abs(leftAnkle.x - rightAnkle.x);
		if (footGap > 0.1) return PersonOrientation.FRONT;
	}

	return PersonOrientation.FRONT;
};

// Tracks last 5 frames of each landmark
export const updateVisibilityHistory = (
	historyMap: Map<number, number[]>,
	landmarks: NormalizedLandmark[],
	maxFrames = 5,
) => {
	landmarks.forEach((lm, index) => {
		if (!historyMap.has(index)) {
			historyMap.set(index, []);
		}
		const history = historyMap.get(index)!;
		history.push(lm.visibility ?? 0);
		if (history.length > maxFrames) history.shift();
	});
};

export const getSmoothedVisibility = (
	historyMap: Map<number, number[]>,
	index: number,
): number => {
	const history = historyMap.get(index) || [];
	if (history.length === 0) return 0;
	return history.reduce((sum, v) => sum + v, 0) / history.length;
};

export const getOrientationConfidence = (
	historyMap: Map<number, number[]>,
	landmarks: NormalizedLandmark[],
): number => {
	const values = landmarks.map((lm, index) =>
		getSmoothedVisibility(historyMap, index),
	);
	const sum = values.reduce((a, b) => a + b, 0);
	return values.length ? sum / values.length : 0;
};

export const getAdaptiveThreshold = (index: number): number => {
	const lowThresholdJoints = new Set([13, 14, 15, 16]); // elbows, wrists
	return lowThresholdJoints.has(index) ? 0.4 : 0.6;
};
