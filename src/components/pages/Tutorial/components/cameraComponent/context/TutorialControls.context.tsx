import { videoSize } from '@pages/PostureScan/constants';
import { useTypedSelector } from '@stores/index';
import html2canvas from 'html2canvas';
import { t } from 'i18next';
import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { TourExercises } from '../component/TutorialConstants';

export interface ExerciseMedia {
	id: number;
	documentId: string;
	url: string;
	src?: string;
}

export interface Point {
	id: number;
	documentId: string;
	value: number;
	name: string;
}

export interface PointsToCalculateAngle {
	id: number;
	a: Point;
	b: Point;
	c: Point | null;
	d: Point | null;
}

export interface MovementExercise {
	id: string;
	documentId: string;
	name: string;
	description: string;
	order: number;
	function: string;
	bodySideTitle: string;
	movementTitle: string;
	vitalflowId: number;
	video: ExerciseMedia;
	image: ExerciseMedia;
	portraitVideo: ExerciseMedia;
	portraitImage: ExerciseMedia;
	pointsToCalculateAngle: PointsToCalculateAngle;
	pointsToValidatePosition: PointsToCalculateAngle;
	transitionTime: number;
	strapiOmniRomExerciseId: number;
	normal: number;
	wfl: number;
	min: number;
	max: number | null;
	visibility: string;
	instruction: string;
	finished: string;
}

export interface ExerciseResult {
	id: string;
	name: string;
	imageSrc: string;
	angle: number;
	wfl: number;
	min: number;
	normal?: number;
	ts: number;
}

export type ResultBus = {
	screenshot?: string | null;
	angle?: number | null;
	coordinates?: Array<{ x: number; y: number; z?: number }>;
	dualAngles?: Partial<Record<'left' | 'right', number>>;
};

type AnyExercise = {
	id: string;
	name: string;
	video?: { id?: number; documentId?: string; url?: string; src?: string };
	visibility?: string;
	instruction?: string;
};

interface ControlsContextData {
	isBodyVisible: boolean;
	setBodyVisible: (visible: boolean) => void;

	canvasDimensions: { width: number; height: number };
	setCanvasDimensions: (dimensions: { width: number; height: number }) => void;

	exerciseList: MovementExercise[];
	setExerciseList: (exercises: MovementExercise[]) => void;

	selectedScan: MovementExercise | null;
	setSelectedScan: (exercise: MovementExercise | null) => void;

	completedScanIds: string[];
	markScanAsCompleted: (id: string) => void;
	clearCompletedScans: () => void;

	isAligned: boolean;
	setIsAligned: (aligned: boolean) => void;

	isPersonCentered: boolean;
	setIsPersonCentered: (centered: boolean) => void;

	hasShownInfoInterlude: boolean;
	setHasShownInfoInterlude: (v: boolean) => void;

	latestAngle: number | null;
	setLatestAngle: (a: number | null) => void;

	results: ExerciseResult[];
	addResult: (r: ExerciseResult) => void;
	clearResults: () => void;

	resultBus: ResultBus;
	setLatestScreenshot: (dataUrl: string | null) => void;
	setLatestCoordinates: (
		coords?: Array<{ x: number; y: number; z?: number }>,
	) => void;
	resetResultBus: () => void;

	setDualAngle: (side: 'left' | 'right', value: number) => void;
	clearDualAngles: () => void;

	hasSentResult: (key: string) => boolean;
	markResultSent: (key: string) => void;
	resetSentResults: () => void;
}

const TutorialControlsContext = createContext<ControlsContextData>({
	isBodyVisible: false,
	setBodyVisible: () => {},
	completedScanIds: [],
	markScanAsCompleted: () => {},
	canvasDimensions: { width: videoSize.width, height: videoSize.height },
	setCanvasDimensions: () => {},
	exerciseList: [],
	setExerciseList: () => {},
	selectedScan: null,
	setSelectedScan: () => {},
	clearCompletedScans: () => {},
	isAligned: false,
	setIsAligned: () => {},
	isPersonCentered: false,
	setIsPersonCentered: () => {},
	hasShownInfoInterlude: false,
	setHasShownInfoInterlude: () => {},
	latestAngle: null,
	setLatestAngle: () => {},
	results: [],
	addResult: () => {},
	clearResults: () => {},
	resultBus: {},
	setLatestScreenshot: () => {},
	setLatestCoordinates: () => {},
	resetResultBus: () => {},

	setDualAngle: () => {},
	clearDualAngles: () => {},

	hasSentResult: () => false,
	markResultSent: () => {},
	resetSentResults: () => {},
});

const donorByName = new Map(
	TourExercises.map(e => [
		e.name.trim().toLowerCase(),
		{
			videoSrc: e.video?.src,
			visibility: e.visibility,
			instruction: e.instruction,
			finished: e.finished,
		},
	]),
);

function enrichWithTourBits<T extends AnyExercise>(reduxList: T[]): T[] {
	return reduxList
		.map(item => {
			const donor = donorByName.get(item.name.trim().toLowerCase());

			if (!donor) {
				return null;
			}

			return {
				...item,
				video: {
					...(item.video ?? {}),
					src: item.video?.src ?? donor.videoSrc,
				},
				visibility: item.visibility ?? donor.visibility,
				instruction: item.instruction ?? donor.instruction,
				finished: donor?.finished ?? item.name,
			};
		})
		.filter(e => e !== null) as T[];
}

export const getPrintScreen = async () => {
	const canvas = await html2canvas(
		document.getElementById('cameraComponent') as HTMLElement,
	);
	return canvas.toDataURL();
};

export function TutorialControlsProvider({
	children,
}: Readonly<PropsWithChildren>) {
	const [isBodyVisible, setBodyVisible] = useState<boolean>(false);
	const [isAligned, setIsAligned] = useState<boolean>(false);
	const [exerciseList, setExerciseList] = useState<MovementExercise[]>([]);
	const [selectedScan, setSelectedScan] = useState<MovementExercise | null>(
		null,
	);
	const [completedScanIds, setCompletedScanIds] = useState<string[]>([]);
	const [isPersonCentered, setIsPersonCentered] = useState<boolean>(false);
	const [hasShownInfoInterlude, setHasShownInfoInterlude] = useState(false);
	t;
	const [canvasDimensions, setCanvasDimensions] = useState<{
		width: number;
		height: number;
	}>({ width: videoSize.width, height: videoSize.height });
	const [latestAngle, setLatestAngle] = useState<number | null>(null);
	const [results, setResults] = useState<ExerciseResult[]>([]);

	const [sentResultMap, setSentResultMap] = useState<Record<string, true>>({});

	const hasSentResult = useCallback(
		(key: string) => !!sentResultMap[key],
		[sentResultMap],
	);

	const reduxExercises = useTypedSelector(
		state => state.rom?.main?.exercises as AnyExercise[] | undefined,
	);

	const setDualAngle = useCallback((side: 'left' | 'right', value: number) => {
		setResultBus(prev => ({
			...prev,
			dualAngles: { ...(prev.dualAngles ?? {}), [side]: value },
		}));
	}, []);

	const clearDualAngles = useCallback(() => {
		setResultBus(prev => ({ ...prev, dualAngles: {} }));
	}, []);

	useEffect(() => {
		if (!reduxExercises?.length) return;
		const newExercises = enrichWithTourBits(reduxExercises);
		setExerciseList(newExercises as MovementExercise[]);
		setSelectedScan(newExercises[0] as MovementExercise);
	}, [reduxExercises]);

	const markResultSent = useCallback((key: string) => {
		setSentResultMap(prev => (prev[key] ? prev : { ...prev, [key]: true }));
	}, []);

	const resetSentResults = useCallback(() => {
		setSentResultMap({});
	}, []);

	useEffect(() => {
		if (
			exerciseList.length > 0 &&
			completedScanIds.length === exerciseList.length
		) {
			setSentResultMap({});
		}
	}, [completedScanIds.length, exerciseList.length]);

	const [resultBus, setResultBus] = useState<ResultBus>({});

	const setLatestScreenshot = useCallback((dataUrl: string | null) => {
		setResultBus(prev => ({ ...prev, screenshot: dataUrl || null }));
	}, []);

	const setLatestCoordinates = useCallback(
		(coords?: Array<{ x: number; y: number; z?: number }>) => {
			setResultBus(prev => ({ ...prev, coordinates: coords || [] }));
		},
		[],
	);

	const resetResultBus = useCallback(() => setResultBus({}), []);

	const addResult = useCallback((r: ExerciseResult) => {
		setResults(prev => {
			const without = prev.filter(x => x.id !== r.id);
			return [...without, r];
		});
	}, []);

	const clearResults = useCallback(() => setResults([]), []);

	const markScanAsCompleted = useCallback((id: string) => {
		setCompletedScanIds(prev => (prev.includes(id) ? prev : [...prev, id]));
	}, []);

	const clearCompletedScans = useCallback(() => {
		setCompletedScanIds([]);
		setHasShownInfoInterlude(false);
	}, []);

	const setLatestAngleBridged = useCallback((a: number | null) => {
		setLatestAngle(a);
		setResultBus(prev => ({ ...prev, angle: a ?? null }));
	}, []);

	const values = useMemo(
		() => ({
			isBodyVisible,
			setBodyVisible,
			canvasDimensions,
			setCanvasDimensions,
			exerciseList,
			setExerciseList,
			selectedScan,
			setSelectedScan,
			completedScanIds,
			markScanAsCompleted,
			clearCompletedScans,
			isAligned,
			setIsAligned,
			isPersonCentered,
			setIsPersonCentered,
			hasShownInfoInterlude,
			setHasShownInfoInterlude,
			latestAngle,
			setLatestAngle: setLatestAngleBridged,
			results,
			addResult,
			clearResults,
			resultBus,
			setLatestScreenshot,
			setLatestCoordinates,
			resetResultBus,
			hasSentResult,
			markResultSent,
			resetSentResults,
			setDualAngle,
			clearDualAngles,
		}),
		[
			isBodyVisible,
			canvasDimensions,
			exerciseList,
			selectedScan,
			completedScanIds,
			isAligned,
			isPersonCentered,
			hasShownInfoInterlude,
			latestAngle,
			results,
			resultBus,

			// fns
			setBodyVisible,
			setCanvasDimensions,
			setExerciseList,
			setSelectedScan,
			markScanAsCompleted,
			clearCompletedScans,
			setIsAligned,
			setIsPersonCentered,
			setHasShownInfoInterlude,
			setLatestAngleBridged,
			addResult,
			clearResults,
			setLatestScreenshot,
			setLatestCoordinates,
			resetResultBus,
			hasSentResult,
			markResultSent,
			resetSentResults,
			setDualAngle,
			clearDualAngles,
		],
	);

	return (
		<TutorialControlsContext.Provider value={values}>
			{children}
		</TutorialControlsContext.Provider>
	);
}

export function UseTutorialControls() {
	return useContext(TutorialControlsContext);
}
