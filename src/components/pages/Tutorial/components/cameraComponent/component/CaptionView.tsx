import { useCallback, useEffect, useState } from 'react';
import { UseTutorialControls } from '../context/TutorialControls.context';

import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import {
	TransitionStates,
	UseTransitionTutorial,
} from '../context/TransitionTutorial.context';
import { SemiCircleGauge } from './SemiCircleGauge';

type Point = { x: number; y: number; z?: number };
type Scan = {
	function?: string;
	pointsToCalculateAngle?: {
		a?: { value: number };
		b?: { value: number };
		c?: { value: number };
	};
	wfl?: number;
	min?: number;
	normal?: number;
};
type CanvasDimensions = { width: number; height: number };

const getAngleFunction = (
	fnString: string,
):
	| ((points: Point[], sizes?: { width: number; height: number }) => number)
	| null => {
	try {
		return new Function(`return ${fnString}`)();
	} catch (e) {
		console.error('Error parsing function:', e);
		return null;
	}
};

const looksPixel = (pts: Point[]) =>
	pts.some(p => p.x > 1 || p.y > 1 || p.x < 0 || p.y < 0);

const toNormalized = (pts: Point[], w: number, h: number) =>
	pts.map(p => ({ x: p.x / w, y: p.y / h, z: p.z ?? 0 }));

const safeAcos = (v: number) => Math.acos(Math.min(1, Math.max(-1, v)));

const isFiniteNumber = (v: unknown) => typeof v === 'number' && isFinite(v);

const extractPointsFromResults = (results: Point[], selectedScan: Scan) => {
	const ids = [
		selectedScan?.pointsToCalculateAngle?.a?.value,
		selectedScan?.pointsToCalculateAngle?.b?.value,
		selectedScan?.pointsToCalculateAngle?.c?.value,
	];
	return ids.map(id => results?.[id as number]).filter(Boolean);
};

const getStrokeColor = (angle: number, scan: Scan): string => {
	if (!scan) return '#' + 'd9d9d9';
	const { wfl = 0, min = 0 } = scan;
	if (angle >= wfl) return '#' + '52c41a';
	if (angle >= min) return '#' + 'faad14';
	return '#' + 'ff4d4f';
};

const getLabelText = (angle: number, scan: Scan): string => {
	if (!scan) return '';
	const { wfl = 0, min = 0 } = scan;
	if (angle >= wfl) return 'Better';
	if (angle >= min) return 'Good';
	return 'Adjust';
};

function CaptionView() {
	const {
		selectedScan,
		canvasDimensions,
		setLatestAngle,
		setLatestCoordinates,
		setDualAngle,
		clearDualAngles,
	} = UseTutorialControls();
	const [angle, setAngle] = useState<number | null>(null);
	const { transition } = UseTransitionTutorial();

	useEffect(() => {
		clearDualAngles();
	}, [selectedScan?.id, clearDualAngles]);

	const calculeRotations = useCallback(
		(results: NormalizedLandmark[]) => {
			const allAngles: number[] = [];

			const defaultValue = { value: 0 };
			let a = defaultValue,
				b = defaultValue,
				c = defaultValue,
				d = defaultValue;

			if (selectedScan?.pointsToValidatePosition) {
				({ a, b, c, d } = selectedScan?.pointsToValidatePosition);
			}

			const funcStr = selectedScan?.function;
			if (!funcStr) return;

			const angleValuesObj = eval(`(${funcStr})`)([
				results[a?.value],
				results[b?.value],
				results[c?.value],
				results[d?.value],
			]);

			if (typeof angleValuesObj === 'object') {
				const isBilateral = selectedScan?.bodySideTitle?.toLowerCase() === 'shoulder';

				Object.entries(angleValuesObj).forEach(([side, val]) => {
					const v = Math.floor(Number(val) || 0);
					if (isBilateral && (side === 'left' || side === 'right')) {
						setDualAngle(side, v);
					}

					const anyVal = Math.floor(
						Number(Object.values(angleValuesObj)[0]) || 0,
					);
					setLatestAngle(anyVal);
					setAngle(anyVal);
					setLatestCoordinates(results);
				});
			}
		},
		[selectedScan, setDualAngle, setLatestAngle, setLatestCoordinates],
	);

	useEffect(() => {
		const listener = (event: Event) => {
			const results = (event as CustomEvent<{ results: Point[] }>).detail
				?.results;

			if (!Array.isArray(results) || !selectedScan?.function) return;
			const angleFn = getAngleFunction(selectedScan.function);
			if (!angleFn) return;
			const rawPoints = extractPointsFromResults(results, selectedScan as Scan);
			if (!rawPoints.length) return;
			const width = Math.max(
				1,
				(canvasDimensions as CanvasDimensions)?.width ?? 1,
			);
			const height = Math.max(
				1,
				(canvasDimensions as CanvasDimensions)?.height ?? 1,
			);
			const sizes = { width, height };
			if (
				String(selectedScan?.vitalflowId) === '50' ||
				String(selectedScan?.vitalflowId) === '51'
			) {
				calculeRotations(results as NormalizedLandmark[]);
			} else {
				try {
					let out: number | undefined;

					if (angleFn.length >= 2) {
						const normalized = looksPixel(rawPoints)
							? toNormalized(rawPoints, width, height)
							: rawPoints;
						out = angleFn(normalized, sizes);
					} else {
						out = angleFn(rawPoints);
					}

					if (isFiniteNumber(out)) {
						setAngle(out);
						setLatestAngle(out);
						setLatestCoordinates(results);
					}
				} catch {
				}
			}
		};
		window.addEventListener('resultsTutorial', listener);
		return () => window.removeEventListener('resultsTutorial', listener);
	}, [selectedScan, canvasDimensions]);

	const showMeter =
		angle !== null && transition?.value === TransitionStates.READYSETGO;

	const normal = Math.max(1, selectedScan?.normal || 180);
	const pct = Math.max(0, Math.min(((angle ?? 0) / normal) * 100, 100));

	const fillColor =
		angle !== null
			? getStrokeColor(angle, selectedScan as Scan)
			: '#' + 'd9d9d9';

	return (
		<>
			{showMeter && (
				<SemiCircleGauge
					value={pct}
					color={fillColor}
					label={getLabelText(angle!, selectedScan as Scan)}
				/>
			)}
		</>
	);
}

export default CaptionView;
