import Loading from '@atoms/PLoading';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { UseControls } from '@pages/PostureScan/context/Controls.context';
import {
	TransitionStates,
	UseTransition,
} from '@pages/PostureScan/context/Transition.context';
import {
	ETransitions,
	TTransitions,
	clearPoseData,
	clearDualAngles,
	setPoseData,
	storeDualAngleValue,
} from '@stores/clinical/rom/main';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { CustomRomExercise } from '@types';
import { getJointToHighlight } from '@utils/SkeletonMedia';
import usePrevious from '@utils/usePrevious.hook';
import { Content } from 'antd/lib/layout/layout';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import Mediapipe from './mediapipe';

const _limit = 0.6;

const BASE_LIMIT = 0.6;
const NECK_LIMIT = 0.4;

const getVisLimit = (exerciseName?: string) => {
	const n = exerciseName?.toLowerCase() || '';
	const isNeck = n.includes('neck flexion') || n.includes('neck extension');
	return isNeck ? NECK_LIMIT : BASE_LIMIT;
};

interface IVideoPoseEstimatorProps {
	isCompleted: boolean;
	currentExercise: CustomRomExercise | null;
	transition: TTransitions | null;
	cameraId: string | null;
	loading: boolean;
	onBodyPointsVisible: (param: boolean) => void;
	onExerciseValueAndCoordinates: (
		value: number,
		ccordinates: NormalizedLandmark[],
	) => void;
	onLoading: () => void;
	onNextTransition: (param: TTransitions) => void;
	onShowIncorrectSide?: (param: boolean) => void;
	selfieMode?: boolean;
	isSwitchMode?: boolean;
	isFullscreen: boolean;
}

const _neckFlexionLocal = (positions: NormalizedLandmark[]) => {
	const [ear, shoulder, nose] = positions;

	const dist = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);
	const a = dist(ear, shoulder);
	const b = dist(ear, nose);
	const c = dist(shoulder, nose);

	if (a < 1e-6 || b < 1e-6) return 0;

	let cosTheta = (a * a + b * b - c * c) / (2 * a * b);
	cosTheta = Math.max(-1, Math.min(1, cosTheta));
	const angleDeg = Math.acos(cosTheta) * (180 / Math.PI);

	let flexion = 140 - angleDeg;
	flexion = Math.max(0, flexion);

	return Math.round(flexion * 100) / 100;
};

const neckExtensionLocal = (positions: NormalizedLandmark[]) => {
	const [ear, shoulder, nose] = positions;

	const dist = (a: NormalizedLandmark, b: NormalizedLandmark) => Math.hypot(a.x - b.x, a.y - b.y);
	const a = dist(ear, shoulder);
	const b = dist(ear, nose);
	const c = dist(shoulder, nose);

	if (a < 1e-6 || b < 1e-6) return 0;

	let cosTheta = (a * a + b * b - c * c) / (2 * a * b);
	cosTheta = Math.max(-1, Math.min(1, cosTheta));
	const angleDeg = Math.acos(cosTheta) * (180 / Math.PI);

	let extension = angleDeg - 80;
	extension = Math.max(0, extension);

	return Math.round(extension * 100) / 100;
};

function VideoPoseEstimator(props: IVideoPoseEstimatorProps) {
	const {
		currentExercise,
		isFullscreen,
		onBodyPointsVisible,
		onExerciseValueAndCoordinates,
		transition,
		onNextTransition,
		isSwitchMode,
		cameraId,
		isCompleted,
	} = props;
	const [bodyPointsVisible, setBodyPointsVisible] = useState<boolean>(false);
	const [angleValue, setAngleValue] = useState<number | number[]>(0);
	const [coordinates, setCoordinates] = useState<NormalizedLandmark[]>([]);
	const [_debuggerEnabled, _setDebuggerEnabled] = useState<boolean>(true);
	const [poseEnabled, setPoseEnabled] = useState<boolean>(false);
	const [bodyPointsToHighlight, setBodyPointsToHighlight] = useState<number[]>(
		[],
	);
	const [showInstruction, setShowInstruction] = useState<boolean>(false);
	const [instructionText, setInstructionText] = useState<string>('');
	const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);

	// Show a 10s instruction when exercise is neck flexion/extension
	useEffect(() => {
		const name = currentExercise?.name?.toLowerCase() || '';

		let text = '';
		const currentTransition = transition?.value;
		const allowedTransitions = [
			ETransitions.INTRO,
			ETransitions.CALIBRATION,
			ETransitions.READYSETGO,
		];

		if (allowedTransitions.includes(currentTransition)) {
			if (name.includes('neck flexion') || name.includes('neck extension')) {
				text = `Face right so that your left shoulder is visible `;
			}
			// else if (name.includes('neck extension')) {
			// 	text = 'Face left so that your right shoulder is visible';
			// }
		}

		if (text) {
			setInstructionText(text);
			setShowInstruction(true);

			// const t = setTimeout(() => setShowInstruction(false), 10_000);
			// return () => clearTimeout(t);
		} else {
			setInstructionText('');
			setShowInstruction(false);
		}
	}, [currentExercise?.name, transition]);

	const { setTransitionToState } = UseTransition();

	const { isCustom } = useTypedSelector(state => state.rom.main);
	const dispatch = useTypedDispatch();
	const prevBodyPointsVisible = usePrevious(bodyPointsVisible);
	const videoSizeState = useTypedSelector(
		state => state.rom.main.videoSizeState,
	);

	const { canvasDimensions, setCanvasDimensions } = UseControls();

	const isIpad =
		/iPad|Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
	const hasSentValueRef = useRef(false);

	const handleVideoAspectRatio = useCallback((aspectRatio: number) => {
		setVideoAspectRatio(aspectRatio);
	}, []);

	const checkBodyIsVisible = useCallback(
		(results: NormalizedLandmark[]) => {
			const currLimit = getVisLimit(currentExercise?.name);

			if (isCustom) {
				if (currentExercise) {
					const validateBodyPoints = currentExercise?.exercises?.every(
						bodyPoint => {
							const defaultValue = { value: 0 };
							let a = defaultValue,
								b = defaultValue,
								c = defaultValue;
							if (bodyPoint?.strapiOmniRomExercise?.pointsToValidatePosition) {
								({ a, b, c } = bodyPoint?.strapiOmniRomExercise
									?.pointsToValidatePosition ?? {
									a: defaultValue,
									b: defaultValue,
									c: defaultValue,
								});
							}

							const isVisible =
								((results[a.value]?.visibility ?? 0) > currLimit &&
									(results[b.value]?.visibility ?? 0) > currLimit &&
									(results[c.value]?.visibility ?? 0) > currLimit) ||
								false;

							return isVisible;
						},
					);

					setBodyPointsVisible(validateBodyPoints || false);
				}
			} else {
				if (currentExercise) {
					const { a, b, c } = currentExercise?.pointsToValidatePosition ?? {
						a: { value: 0 },
						b: { value: 0 },
						c: { value: 0 },
					};
					const isVisible =
						((results[a.value]?.visibility ?? 0) > currLimit &&
							(results[b.value]?.visibility ?? 0) > currLimit &&
							(results[c.value]?.visibility ?? 0) > currLimit) ||
						false;
					setBodyPointsVisible(isVisible);
				} else {
					setBodyPointsVisible(true);
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Complex validation logic depends on exercise config, isCustom state changes invalidate callback unnecessarily
		[currentExercise],
	);

	const calculeAngle = useCallback(
		(results: NormalizedLandmark[]) => {
			const name = currentExercise?.name?.toLocaleLowerCase() || '';
			const isNeckExtension = name.includes('neck extension');

			if (isNeckExtension) {
				if (bodyPointsVisible && currentExercise) {
					let angleValueCalculated = 0;
					const nose = results[0];
					const leftShoulder = results[11];
					const leftEar = results[7];

					angleValueCalculated = neckExtensionLocal([
						leftEar,
						leftShoulder,
						nose,
					]);

					if (_debuggerEnabled) setAngleValue(angleValueCalculated);

					let result: number;
					if (
						angleValueCalculated !== undefined &&
						angleValueCalculated !== null &&
						!isNaN(angleValueCalculated)
					) {
						result = Math.floor(angleValueCalculated);
					} else {
						result = 0;
					}
					if (_debuggerEnabled) setAngleValue(angleValueCalculated);
					setCoordinates(results);

					currentExercise?.exercises?.forEach((bodypoint, index) => {
						dispatch(
							setPoseData({
								index: index,
								angleResult: result,
								coordinates: results,
							}),
						);
					});
				}
			} else if (isCustom) {
				if (bodyPointsVisible && currentExercise) {
					currentExercise?.exercises?.forEach((bodypoint, index) => {
						const defaultValue = { value: 0 };
						let a = defaultValue,
							b = defaultValue,
							c = defaultValue,
							d = defaultValue;
						if (bodypoint?.strapiOmniRomExercise?.pointsToValidatePosition) {
							({ a, b, c, d } = bodypoint?.strapiOmniRomExercise
								?.pointsToValidatePosition ?? {
								a: defaultValue,
								b: defaultValue,
								c: defaultValue,
								d: defaultValue,
							});
						}

						let angleValueCalculated = 0;
						if (bodypoint?.strapiOmniRomExercise?.function) {
							try {
								const func = new Function(
									'positions',
									'dimensions',
									`return (${bodypoint.strapiOmniRomExercise.function})(positions, dimensions);`
								);
								angleValueCalculated = func(
									[
										results[a?.value],
										results[b?.value],
										results[c?.value],
										results[d?.value],
									],
									{
										width: canvasDimensions?.width,
										height: canvasDimensions?.height,
									},
								);
							} catch (error) {
								console.error('Error executing angle calculation function:', error);
								angleValueCalculated = 0;
							}
						}

						if (_debuggerEnabled) setAngleValue(angleValueCalculated);

						let result: number;
						if (
							angleValueCalculated !== undefined &&
							angleValueCalculated !== null &&
							!isNaN(angleValueCalculated)
						) {
							result = Math.floor(angleValueCalculated);
						} else {
							result = 0;
						}
						if (_debuggerEnabled) setAngleValue(angleValueCalculated);
						setCoordinates(results);
						dispatch(
							setPoseData({
								index: index,
								angleResult: result,
								coordinates: results,
							}),
						);
					});
				}
			} else {
				if (bodyPointsVisible && currentExercise) {
					const defaultValue = { value: 0 };
					const { a, b, c, d } = currentExercise?.pointsToCalculateAngle ?? {
						a: defaultValue,
						b: defaultValue,
						c: defaultValue,
						d: defaultValue,
					};

					let angleValueCalculated = 0;
					if (currentExercise?.function) {
						try {
							const func = new Function(
								'positions',
								'dimensions',
								`return (${currentExercise.function})(positions, dimensions);`
							);
							angleValueCalculated = func(
								[
									results[a?.value],
									results[b?.value],
									results[c?.value],
									results[d?.value],
								],
								{
									width: canvasDimensions?.width,
									height: canvasDimensions?.height,
								},
							);
						} catch (error) {
							console.error('Error executing angle calculation function:', error);
							angleValueCalculated = 0;
						}
					}

					const result = Math.floor(+angleValueCalculated);

					if (result !== angleValue) {
						setAngleValue(result);
						setCoordinates(results);
					}
				} else {
					setAngleValue(0);
					setCoordinates(results);
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Complex angle calculation depends on exercise config, dispatch/debugger/canvas state changes invalidate callback unnecessarily
		[bodyPointsVisible, currentExercise],
	);

	const calculeRotations = useCallback(
		(results: NormalizedLandmark[]) => {
			if (bodyPointsVisible && currentExercise) {
				const allAngles: number[] = [];

				currentExercise?.exercises?.forEach((bodypoint, index) => {
					const defaultValue = { value: 0 };
					let a = defaultValue,
						b = defaultValue,
						c = defaultValue,
						d = defaultValue;

					if (bodypoint?.strapiOmniRomExercise?.pointsToValidatePosition) {
						({ a, b, c, d } = bodypoint?.strapiOmniRomExercise
							?.pointsToValidatePosition ?? {
							a: defaultValue,
							b: defaultValue,
							c: defaultValue,
							d: defaultValue,
						});
					}

					const funcStr = bodypoint?.strapiOmniRomExercise?.function;
					if (!funcStr) return;

					let angleValuesObj;
					try {
						const func = new Function(
							'positions',
							`return (${funcStr})(positions);`
						);
						angleValuesObj = func([
							results[a?.value],
							results[b?.value],
							results[c?.value],
							results[d?.value],
						]);
					} catch (error) {
						console.error('Error executing rotation calculation function:', error);
						return;
					}

					if (typeof angleValuesObj === 'object') {
						const isBilateral =
							(currentExercise as unknown as { bodySideTitle?: string })?.bodySideTitle?.toLowerCase() ===
							'shoulder';

						if (!isBilateral) {
							dispatch(clearDualAngles());
						}

						Object.entries(angleValuesObj).forEach(([side, val], subIndex) => {
							const result = Math.floor((val as number) ?? 0);
							allAngles.push(result);

							if (isBilateral) {
								dispatch(
									storeDualAngleValue({
										side,
										value: result,
										coordinates: results,
									}),
								);
							}

							dispatch(
								setPoseData({
									index: index * 2 + subIndex,
									angleResult: result,
									coordinates: results,
								}),
							);

							if (index === 0 && subIndex === 0) {
								setCoordinates(results);
							}
						});
					}
				});

				setAngleValue(allAngles);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Complex rotation calculation depends on exercise config, dispatch state changes invalidate callback unnecessarily
		[bodyPointsVisible, currentExercise],
	);

	// Track if we've already calculated the angle for this CLOSING transition
	const hasCalculatedClosingRef = useRef(false);

	// Reset the ref when transition changes away from CLOSING
	useEffect(() => {
		if (transition?.value !== ETransitions.CLOSING) {
			hasCalculatedClosingRef.current = false;
		}
	}, [transition?.value]);

	const frameCallback = useCallback(
		(results: NormalizedLandmark[]) => {
			if (!results) {
				setTransitionToState(TransitionStates.CALIBRATION);
				return;
			}
			if (transition?.value === ETransitions.CALIBRATION) {
				checkBodyIsVisible(results);
			}

			// Calculate angle ONCE during CLOSING transition (not every frame during READYSETGO)
			if (
				transition?.value === ETransitions.CLOSING &&
				!hasCalculatedClosingRef.current
			) {
				hasCalculatedClosingRef.current = true;
				if (
					String(currentExercise?.vitalflowId) === '50' ||
					String(currentExercise?.vitalflowId) === '51'
				) {
					dispatch(clearPoseData());
					calculeRotations(results);
				} else {
					dispatch(clearPoseData());
					calculeAngle(results);
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Frame callback depends on transition/exercise config, check/calculation functions are stable callbacks
		[transition, currentExercise],
	);

	useEffect(() => {
		const handleResults = (event: Event) => {
			const results = (event as CustomEvent).detail?.results;
			frameCallback(results);
		};

		window.addEventListener('results', handleResults);

		return () => {
			window.removeEventListener('results', handleResults);
		};
	}, [frameCallback]);

	useEffect(() => {
		if (bodyPointsVisible !== prevBodyPointsVisible) {
			onBodyPointsVisible(bodyPointsVisible);
		}
	}, [prevBodyPointsVisible, bodyPointsVisible, onBodyPointsVisible]);

	useEffect(() => {
		if (
			transition?.value === ETransitions.CLOSING &&
			!hasSentValueRef.current
		) {
			if (Array.isArray(angleValue)) {
				hasSentValueRef.current = true;
				angleValue.forEach(val => {
					onExerciseValueAndCoordinates(val, coordinates);
				});
			} else {
				onExerciseValueAndCoordinates(angleValue, coordinates);
			}
		}
	}, [transition, onExerciseValueAndCoordinates, angleValue, coordinates]);

	useEffect(() => {
		if (transition?.value === ETransitions.INTRO) {
			setAngleValue(0);
			hasSentValueRef.current = false;

			if (!isIpad) {
				setBodyPointsVisible(false);
				setCoordinates([]);
			}
		}
	}, [transition]);

	useEffect(() => {
		if (
			transition?.value === ETransitions.CALIBRATION &&
			bodyPointsVisible &&
			transition.next
		) {
			onNextTransition(transition.next);
		}
	}, [transition, bodyPointsVisible, onNextTransition]);

	useEffect(() => {
		if (transition?.value === ETransitions.CLOSING && isIpad) {
			setPoseEnabled(true);
		}
	}, [transition]);

	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (poseEnabled && isIpad) {
			timer = setTimeout(() => {
				setPoseEnabled(false);
			}, 9000);
		}

		return () => {
			clearTimeout(timer);
		};
	}, [poseEnabled]);

	useEffect(() => {
		if (!currentExercise) {
			setBodyPointsToHighlight([]);
			return;
		}

		let pointsToHighlight: number[] = [];
		const jointPoint = getJointToHighlight(currentExercise?.name || '');
		if (jointPoint) {
			// If jointPoint is an array, add all points
			if (Array.isArray(jointPoint)) {
				pointsToHighlight = jointPoint;
			} else {
				pointsToHighlight = [jointPoint];
			}
		} else {
			if (isCustom) {
				currentExercise?.exercises?.forEach(bodypoint => {
					const defaultValue = { value: 0 };
					let a = defaultValue,
						b = defaultValue,
						c = defaultValue,
						d = defaultValue;

					if (bodypoint?.strapiOmniRomExercise?.pointsToValidatePosition) {
						({ a, b, c, d } = bodypoint?.strapiOmniRomExercise
							?.pointsToValidatePosition ?? {
							a: defaultValue,
							b: defaultValue,
							c: defaultValue,
							d: defaultValue,
						});
					}

					if (a?.value) pointsToHighlight.push(a.value);
					if (b?.value) pointsToHighlight.push(b.value);
					if (c?.value) pointsToHighlight.push(c.value);
					if (d?.value) pointsToHighlight.push(d.value);
				});
			} else {
				if (currentExercise?.pointsToCalculateAngle) {
					const { a, b, c, d } = currentExercise.pointsToCalculateAngle;

					if (a?.value) pointsToHighlight.push(a.value);
					if (b?.value) pointsToHighlight.push(b.value);
					if (c?.value) pointsToHighlight.push(c.value);
					if (d?.value) pointsToHighlight.push(d.value);
				}
			}
		}

		setBodyPointsToHighlight(pointsToHighlight);
	}, [currentExercise, isCustom]);

	return (
		<Content>
			{!currentExercise && !isCompleted ? (
				<Loading />
			) : (
				<div className="h-full">
					<Mediapipe
						cameraId={cameraId}
						isFullscreen={isFullscreen}
						isSwitchMode={isSwitchMode ?? false}
						stopLandmarks={isIpad ? poseEnabled : false}
						bodyPointsToHighlight={bodyPointsToHighlight}
						videoSizeState={videoSizeState}
						setCanvasDimensions={setCanvasDimensions}
						onVideoAspectRatio={handleVideoAspectRatio}
					/>
					{/* </Typography.Title> */}

					{showInstruction && (
						<div
							style={{
								position: 'absolute',
								left: '50%',
								bottom: '8%',
								transform: 'translateX(-50%)',
								padding: 'var(--spacing-3) var(--spacing-4)',
								background:
									'color-mix(in srgb, var(--color-neutral-950) 65%, transparent)',
								color: 'var(--text-on-dark)',
								borderRadius: 'var(--spacing-3)',
								fontSize: 40,
								lineHeight: 1.35,
								textAlign: 'center',
								zIndex: 9,
								backdropFilter: 'blur(2px)',
								boxShadow:
									'0 6px 20px color-mix(in srgb, var(--color-neutral-950) 25%, transparent)',
								maxWidth: isSwitchMode ? 360 : 640,
								width: 'calc(100% - 32px)',
							}}>
							{instructionText}
						</div>
					)}
				</div>
			)}
		</Content>
	);
}

export default memo(VideoPoseEstimator);
