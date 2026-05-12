import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { setVideoRecordState } from '@stores/onBoard/onBoard';
import { setUploadProgress } from '@stores/postures/postures';
import strapi from '@strapi';
import { FullAssessmentValue } from '@utils/PoseDetectionUtility';
import axios from 'axios';
import { stringify } from 'qs';
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { landmarksMapping, videoSize } from '../constants';
import { useControls } from '../hooks/UseControls';

type ViewTypeLeftOrRight = 'left' | 'right';

type ViewTypeFrontOrBack = 'front' | 'back';

interface ControlsProviderProps extends PropsWithChildren {
	mode: 'posture' | 'rom';
}
export interface PosturalBodyPoints {
	head?: number;
	ear: number;
	shoulder: number;
	elbow: number;
	hip: number;
	knee: number;
	ankle?: number;
	coordinates: NormalizedLandmark[];
	screenshot: string | null;
}

export interface StrapiPostureAnalytics {
	id: number;
	name: string;
	view: 'front' | 'left' | 'right' | 'back';
	video: {
		id: number;
		url: string;
	};
}

export interface PostureAnalyticsCompleted {
	userId: string;
	view: 'front' | 'left' | 'right' | 'back';
	head?: number;
	ear: number;
	shoulder: number;
	elbow: number;
	hip: number;
	knee: number;
	ankle?: number;
	coordinates: NormalizedLandmark[];
	screenshot: string | null;
	postureAnalyticsSessionId: string;
	completed: boolean;
}

export type PosturalAnalytics = StrapiPostureAnalytics &
	PostureAnalyticsCompleted;

interface ControlsContextData {
	isRepeat: boolean;
	isCompleted: boolean;
	positions: Partial<PosturalAnalytics>[];
	results: PosturalBodyPoints | null;
	onRepeat: (repeat: boolean) => void;
	onGetCurrent: (
		isReturnIndex?: boolean,
	) => number | Partial<PosturalAnalytics>;
	onNext: (startIndex?: number) => void;
	onReset: () => void;
	onMarkAsCompleted: () => void;
	onSubmit: () => void;
	postureAnalyticsSessionId: string;
	processAndCapturePosture: (
		landmarks: NormalizedLandmark[],
		dimensions: { width: number; height: number },
	) => void;
	isSkeletonVisible: boolean;
	setIsSkeletonVisible: (visible: boolean) => void;
	isPersonInBox: boolean;
	setIsPersonInBox: (inBox: boolean) => void;
	isAligned: boolean;
	setIsAligned: (inBox: boolean) => void;
	canvasDimensions: { width: number; height: number };
	setCanvasDimensions: (dimensions: { width: number; height: number }) => void;
	assessmentValue: FullAssessmentValue;
	setAssessmentValue: React.Dispatch<React.SetStateAction<FullAssessmentValue>>;
	shouldNavigate: boolean;
}

const ControlsContext = createContext<ControlsContextData>({
	isRepeat: false,
	isCompleted: false,
	postureAnalyticsSessionId: '',
	positions: [],
	results: null,
	onRepeat: () => {},
	onGetCurrent: () => 0,
	onNext: () => {},
	onReset: () => {},
	onMarkAsCompleted: () => {},
	onSubmit: () => {},
	processAndCapturePosture: () => {},
	isSkeletonVisible: false,
	setIsSkeletonVisible: () => {},
	isPersonInBox: false,
	setIsPersonInBox: () => {},
	setIsAligned: () => {},
	isAligned: false,
	canvasDimensions: { width: videoSize.width, height: videoSize.height },
	setCanvasDimensions: () => {},
	assessmentValue: {},
	setAssessmentValue: () => {},
	shouldNavigate: false,
});

// export const getPrintScreen = async () => {
// 	const canvas = await html2canvas(
// 		document.getElementById('printscreen_posture_analytics'),
// 	);

// 	return canvas.toDataURL();
// };
export const getPrintScreen = (
	dims?: { width: number; height: number }, // optional override
): string => {
	// Find elements without prop drilling
	const video = document.getElementById('romVideo') as HTMLVideoElement | null;
	const overlay = document.getElementById(
		'romOverlay',
	) as HTMLCanvasElement | null;

	if (!video || !overlay) {
		console.warn('[Screenshot] Missing elements - video:', !!video, 'overlay:', !!overlay);
		return '';
	}

	// Prefer explicit dims (from context) → fall back to intrinsic
	const width = dims?.width ?? video.videoWidth;
	const height = dims?.height ?? video.videoHeight;

	if (!width || !height) {
		console.warn('[Screenshot] Invalid dimensions - width:', width, 'height:', height);
		return '';
	}

	// Composite at the same pixel grid used for landmark math
	const out = document.createElement('canvas');
	out.width = width;
	out.height = height;
	const ctx = out.getContext('2d');
	if (!ctx) {
		console.warn('[Screenshot] Failed to get 2d context');
		return '';
	}

	// 1) current video frame (ignores CSS scaling/object-fit)
	try {
		ctx.drawImage(video, 0, 0, width, height);
	} catch (error) {
		console.error('[Screenshot] Failed to draw video frame:', error);
		return '';
	}

	// 2) current overlay pixels (already drawn in that same space)
	ctx.drawImage(overlay, 0, 0, width, height);

	const dataUrl = out.toDataURL('image/png');

	return dataUrl;
};

function invertSignal(number: number, condition: boolean): number {
	return condition ? -number : number;
}

const vectorAngle = (x: number[], y: number[]): number => {
	return Math.acos(
		x.reduce((acc: number, n: number, i: number) => acc + n * y[i], 0) /
			(Math.hypot(...x) * Math.hypot(...y)),
	);
};

function drawAngleMeasurementHorizontal(
	A: NormalizedLandmark,
	B: NormalizedLandmark,
	canvasSize: { width: number; height: number },
) {
	const C = { x: B.x, y: A.y };

	const AB = { x: B.x - A.x, y: B.y - A.y };
	const CA = { x: C.x - A.x, y: C.y - A.y };

	const angle =
		vectorAngle(
			[AB.x * canvasSize.width, AB.y * canvasSize.height],
			[CA.x * canvasSize.width, CA.y * canvasSize.height],
		) *
		(180 / Math.PI);

	return Math.trunc(invertSignal(angle, B.y > A.y));
}

function drawAngleMeasurementVerticalLeftAndRight(
	A: NormalizedLandmark,
	B: NormalizedLandmark,
	lineBase: NormalizedLandmark,
	canvasSize: { width: number; height: number },
): number {
	const C = { x: lineBase.x, y: A.y };
	const D = { x: lineBase.x, y: B.y };

	const AD = { x: D.x - A.x, y: D.y - A.y };
	const DC = { x: C.x - D.x, y: C.y - D.y };

	const angle: number =
		vectorAngle(
			[AD.x * canvasSize.width, AD.y * canvasSize.height],
			[DC.x * canvasSize.width, DC.y * canvasSize.height],
		) *
		(180 / Math.PI);

	const result = A.x < C.x ? angle - 180 : 180 - angle;

	return Math.trunc(result);
}

function drawAngleMeasurementVertical(
	A: NormalizedLandmark,
	B: NormalizedLandmark,
	C: NormalizedLandmark,
	canvasSize: { width: number; height: number },
): number {
	const newA: NormalizedLandmark = {
		...A,
		x: (A.x + B.x) / 2,
		y: (A.y + B.y) / 2,
	};

	const newB: NormalizedLandmark = {
		...B,
		x: (A.x + B.x) / 2,
		y: 0,
	};

	const AB = { x: newB.x - newA.x, y: newB.y - newA.y };
	const CA = { x: C.x - newA.x, y: C.y - newA.y };

	const angle =
		vectorAngle(
			[AB.x * canvasSize.width, AB.y * canvasSize.height],
			[CA.x * canvasSize.width, CA.y * canvasSize.height],
		) *
		(180 / Math.PI);

	return Math.trunc(invertSignal(angle, newB.y > newA.y));
}

export function ControlsProvider({ children, mode }: ControlsProviderProps) {
	const [positions, setPositions] = useState<Partial<PosturalAnalytics>[]>([]);
	const [isRepeat, setIsRepeat] = useState(false);
	const [isSkeletonVisible, setIsSkeletonVisible] = useState<boolean>(false);
	const [isPersonInBox, setIsPersonInBox] = useState<boolean>(false);
	const [isAligned, setIsAligned] = useState<boolean>(false);
	const [postureAnalyticsSessionId, setPostureAnalyticsSessionId] = useState<
		string | null
	>(null);
	const [results, setResults] = useState<PosturalBodyPoints | null>(null);
	const [canvasDimensions, setCanvasDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: videoSize.width, height: videoSize.height });
	const [assessmentValue, setAssessmentValue] = useState<FullAssessmentValue>(
		{},
	);
	const [shouldNavigate, setShouldNavigate] = useState<boolean>(false);

	const dispatch = useTypedDispatch();

	// Callback to update positions when completion status changes
	const handlePositionsChange = useCallback(
		(updatedPositions: Partial<PosturalAnalytics>[]) => {
			setPositions(updatedPositions);
		},
		[],
	);

	const { onGetCurrent, onNext, onReset, onMarkAsCompleted, isCompleted } =
		useControls(positions, handlePositionsChange);

	const userId = useTypedSelector(state => {
		const selectedUser = state.contacts.main.selectedUser;
		const user = state.user;
		return user.isPhysioterapist ? selectedUser?.id : user?.id;
	});

	const onRepeat = useCallback(
		async (repeat = true) => {
			setIsRepeat(repeat);
		},
		[setIsRepeat],
	);

	const onGetPositions = async () => {
		const query = stringify({
			fields: ['name', 'view'],
			order: ['order:desc'],
			populate: {
				video: {
					fields: ['url'],
				},
			},
		});

		const { data } = await strapi.get(`/posture-analytics?${query}`);

		const positions = data.data as PosturalAnalytics[];

		const sortedPositions = positions.sort((a, b) => {
			const order = { front: 0, left: 1, right: 2, back: 3 };
			return (
				order[a.view as keyof typeof order] -
				order[b.view as keyof typeof order]
			);
		});

		setPositions(sortedPositions);
	};

	const isLeftOrRightView = (view: string): view is ViewTypeLeftOrRight => {
		return view === 'left' || view === 'right';
	};

	const onStartSession = useCallback(async () => {
		try {
			const { data } = await axios.post('/posture-analytics/sessions', {
				userId,
			});

			data?.id && setPostureAnalyticsSessionId(data.id);
		} catch (error) {
			console.error(error);
		}
	}, [userId]);

	const getResultLeftAndRight = (
		view: ViewTypeLeftOrRight,
		landmarks: NormalizedLandmark[],
		canvasSize: { width: number; height: number },
	): Omit<PosturalBodyPoints, 'coordinates' | 'screenshot'> => {
		return {
			ear: drawAngleMeasurementVerticalLeftAndRight(
				landmarks[landmarksMapping[view].ear[0]],
				landmarks[landmarksMapping[view].ear[1]],
				landmarks[landmarksMapping[view].ear[2]],
				canvasSize,
			),
			shoulder: drawAngleMeasurementVerticalLeftAndRight(
				landmarks[landmarksMapping[view].shoulder[0]],
				landmarks[landmarksMapping[view].shoulder[1]],
				landmarks[landmarksMapping[view].shoulder[2]],
				canvasSize,
			),
			elbow: drawAngleMeasurementVerticalLeftAndRight(
				landmarks[landmarksMapping[view].elbow[0]],
				landmarks[landmarksMapping[view].elbow[1]],
				landmarks[landmarksMapping[view].elbow[2]],
				canvasSize,
			),
			hip: drawAngleMeasurementVerticalLeftAndRight(
				landmarks[landmarksMapping[view].hip[0]],
				landmarks[landmarksMapping[view].hip[1]],
				landmarks[landmarksMapping[view].hip[2]],
				canvasSize,
			),
			knee: drawAngleMeasurementVerticalLeftAndRight(
				landmarks[landmarksMapping[view].knee[0]],
				landmarks[landmarksMapping[view].knee[1]],
				landmarks[landmarksMapping[view].knee[2]],
				canvasSize,
			),
		};
	};

	const getResultFrontAndBack = (
		view: ViewTypeFrontOrBack,
		landmarks: NormalizedLandmark[],
		canvasSize: { width: number; height: number },
	): Omit<PosturalBodyPoints, 'coordinates' | 'screenshot'> => {
		return {
			head: drawAngleMeasurementVertical(
				landmarks[landmarksMapping[view].head[0]],
				landmarks[landmarksMapping[view].head[1]],
				landmarks[landmarksMapping[view].head[2]],
				canvasSize,
			),
			ear: drawAngleMeasurementHorizontal(
				landmarks[landmarksMapping[view].ear[0]],
				landmarks[landmarksMapping[view].ear[1]],
				canvasSize,
			),
			shoulder: drawAngleMeasurementHorizontal(
				landmarks[landmarksMapping[view].shoulder[0]],
				landmarks[landmarksMapping[view].shoulder[1]],
				canvasSize,
			),
			elbow: drawAngleMeasurementHorizontal(
				landmarks[landmarksMapping[view].elbow[0]],
				landmarks[landmarksMapping[view].elbow[1]],
				canvasSize,
			),
			hip: drawAngleMeasurementHorizontal(
				landmarks[landmarksMapping[view].hip[0]],
				landmarks[landmarksMapping[view].hip[1]],
				canvasSize,
			),
			knee: drawAngleMeasurementHorizontal(
				landmarks[landmarksMapping[view].knee[0]],
				landmarks[landmarksMapping[view].knee[1]],
				canvasSize,
			),
			ankle: drawAngleMeasurementHorizontal(
				landmarks[landmarksMapping[view].ankle[0]],
				landmarks[landmarksMapping[view].ankle[1]],
				canvasSize,
			),
		};
	};

	const processAndCapturePosture = useCallback(
		async (
			landmarks: NormalizedLandmark[],
			canvasSize: { width: number; height: number },
		) => {
			const printscreen = await getPrintScreen(canvasDimensions);

			const { view } = onGetCurrent(false) as Partial<PosturalAnalytics>;

			if (view && isLeftOrRightView(view)) {
				const result = {
					...getResultLeftAndRight(view, landmarks, canvasSize),
					coordinates: landmarks,
					screenshot: printscreen,
				};

				setResults(result);
			} else if (view) {
				const result = {
					...getResultFrontAndBack(view, landmarks, canvasSize),
					coordinates: landmarks,
					screenshot: printscreen,
				};
				setResults(result);
			} else {
				console.error('[PostureCapture] View not found');
			}
		},
		[setResults, onGetCurrent, canvasDimensions],
	);

	const onSubmitAssessment = useCallback(async () => {
		const body = {
			userId,
			sessionId: postureAnalyticsSessionId,
			front: assessmentValue.front,
			back: assessmentValue.back,
			left: assessmentValue.left,
			right: assessmentValue.right,
		};

		try {
			await axios.post('/posture-analytics/report', body);
			setShouldNavigate(true);
		} catch (error) {
			console.error(error, 'error posture analytics report');
		}
	}, [assessmentValue, userId, postureAnalyticsSessionId]);

	function hasAllViews(data: Record<string, unknown>): boolean {
		const requiredViews = ['front', 'left', 'right', 'back'];
		return requiredViews.every(view => view in data);
	}

	const onSubmit = useCallback(async () => {
		const { view } = onGetCurrent(false) as Partial<PosturalAnalytics>;
		dispatch(setVideoRecordState(true));

		const body = {
			userId,
			view,
			postureAnalyticsSessionId,
			...results,
		};

		const isComplete = hasAllViews(assessmentValue);

		if (isComplete) {
			await onSubmitAssessment();
		}

		try {
			await axios.post('/posture-analytics', body, {
				onUploadProgress: progressEvent => {
					const progress = Math.round(
						(progressEvent.loaded * 100) / progressEvent.total!,
					);
					dispatch(setUploadProgress(progress));
				},
			});

			onMarkAsCompleted();
			dispatch(setUploadProgress(0));
		} catch (error) {
			console.error('[PostureSubmit] POST failed:', error);
		}
	}, [
		onGetCurrent,
		onMarkAsCompleted,
		userId,
		postureAnalyticsSessionId,
		results,
		assessmentValue,
		onSubmitAssessment,
		dispatch,
	]);

	useEffect(() => {
		if (mode === 'posture') {
			onGetPositions();
			onStartSession();
			return () => {
				setPositions([]);
				setIsRepeat(false);
				setResults(null);
				setPostureAnalyticsSessionId(null);
			};
		}
	}, []);

	const values = useMemo(
		() => ({
			positions,
			onGetCurrent,
			onNext,
			onReset,
			isRepeat,
			isCompleted,
			onRepeat,
			onMarkAsCompleted,
			onSubmit,
			postureAnalyticsSessionId,
			processAndCapturePosture,
			results,
			isSkeletonVisible,
			setIsSkeletonVisible,
			isPersonInBox,
			setIsPersonInBox,
			isAligned,
			setIsAligned,
			canvasDimensions,
			setCanvasDimensions,
			assessmentValue,
			setAssessmentValue,
			shouldNavigate,
		}),
		[
			positions,
			isRepeat,
			isCompleted,
			onRepeat,
			onGetCurrent,
			onNext,
			onReset,
			onMarkAsCompleted,
			onSubmit,
			postureAnalyticsSessionId,
			processAndCapturePosture,
			results,
			isSkeletonVisible,
			setIsSkeletonVisible,
			isPersonInBox,
			setIsPersonInBox,
			isAligned,
			setIsAligned,
			canvasDimensions,
			setCanvasDimensions,
			assessmentValue,
			setAssessmentValue,
			shouldNavigate,
		],
	);

	return (
		<ControlsContext.Provider value={values}>
			{children}
		</ControlsContext.Provider>
	);
}

export function UseControls() {
	return useContext(ControlsContext);
}
