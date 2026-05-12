import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import {
	FilesetResolver,
	PoseLandmarker,
	PoseLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { getRomActivityStreamById } from '@stores/activity/activityStream/activityStream';
import {
	editAnnotationLandmarks,
	editPatientResults,
	editvalidatedValuePt,
	getAnnotationLandmarks,
	getAuditClarifications,
	saveAuditClassifications,
} from '@stores/clinical/rom/main';
import { USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { OmniRomRomPatientResult, PoseLandmark } from '@stores/interfaces';
import {
	AutoComplete,
	Button,
	Layout,
	Modal,
	Popover,
	Select,
	Spin,
	Tag,
	Tooltip,
	message,
} from 'antd';
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import ACanvas from './components/ACanvas';
import ACanvasControls from './components/ACanvasControls';
import AToolbar from './components/AToolbar';
import { AnnotationErrorBoundary } from './components/ErrorBoundary';
import MLeftSidebar from './components/MLeftSidebar';
import TextInputModal from './components/TextInputModa';
import CompassOverlay from './components/molecules/MAngleToolMeasurement/CompassOverlay';
import RightSideBar from './components/molecules/RightSideBar';
import { EXERCISE_NAMES, getExerciseConfig } from './constants/exerciseConfigs';
import { WithAuthProps } from './hoc/withAuth';
import { useCanvasState } from './hooks/useCanvasState';
import './style.css';
import { calculateExerciseAngle } from './utils/exerciseCalculations';
import {
	repositionLandmarksForNewExercise,
	updateLandmarkVisibility,
} from './utils/landmarkMapping';
import {
	createSafeErrorMessage,
	validateColor,
	validateThickness,
} from './utils/validation';

const { Content, Sider } = Layout;

type ImageAnnotationProps = Partial<WithAuthProps> & {
	showComparison?: boolean;
	editingSide?: 'left' | 'right' | null;
	isSaveConfirmationVisible?: boolean;
	onCloseSaveConfirmation?: () => void;
};

type ViewMode = 'current' | 'validated' | 'pt-verified';

export const ImageAnnotation: React.FC<ImageAnnotationProps> = forwardRef(
	(
		{
			fetchSessionData,
			record,
			imageUrl,
			handleCancel,
			canvasLoading,
			setCanvasLoading,
			showComparison = false,
			editingSide = null,
			isSaveConfirmationVisible,
			onCloseSaveConfirmation,
		},
		ref,
	) => {
		const { t } = useTranslation();
		const dispatch = useTypedDispatch();
		const user = useTypedSelector(state => state.user);
		const isUser = user?.profile?.role !== USER_ROLES.USER;

		// Canvas refs
		const canvasRef = useRef<HTMLCanvasElement | null>(null);
		const imageLayerCanvasRef = useRef<HTMLCanvasElement | null>(null);
		const isAnalyzingRef = useRef(false);
		const currentRecordIdRef = useRef<string | null>(null);

		// Canvas state management
		const {
			canvasState,
			updateCanvasState,
			setCanvasState,
			updateCanvasDimensions,
			undo,
			redo,
			canUndo,
			canRedo,
			toggleAngleTool,
			updateAngleToolState,
		} = useCanvasState();

		// View mode and display state
		const [viewMode, setViewMode] = useState<ViewMode>('current');
		const [zoom, setZoom] = useState(1);
		const [pan, setPan] = useState({ x: 0, y: 0 });
		const [hoveredLandmark, setHoveredLandmark] = useState<number | null>(null);

		// Landmark state for different modes
		const [validatedRecordData, setValidatedRecordData] =
			useState<typeof record>(record);
		const [validatedLandmarksVisibility, setValidatedLandmarksVisibility] =
			useState<{ [index: number]: boolean }>({});
		const [ptVerifiedLandmarks, setPtVerifiedLandmarks] = useState<unknown[]>(
			[],
		);
		const [originalPtVerifiedLandmarks, setOriginalPtVerifiedLandmarks] =
			useState<unknown[]>([]);
		const [ptVerifiedLandmarksVisibility, setPtVerifiedLandmarksVisibility] =
			useState<{ [index: number]: boolean }>({});
		const [preliminaryLandmarksVisibility, setPreliminaryLandmarksVisibility] =
			useState<{ [index: number]: boolean }>({});
		const [hasPTData, setHasPTData] = useState(false);

		// Initialization state
		const [initializedCurrent, setInitializedCurrent] = useState(false);
		const [initializedValidated, setInitializedValidated] = useState(false);
		const [initializedPtVerified, setInitializedPtVerified] = useState(false);

		// Loading state
		const [saving, setSaving] = useState(false);
		const [analyzing, setAnalyzing] = useState(false);
		const [reloadingValidation, setReloadingValidation] = useState(false);

		// Angle measurement state
		const [angleStart, setAngleStart] = useState(0);
		const [angleEnd, setAngleEnd] = useState<number | undefined | '0' | '-'>(
			() => {
				const value = record?.value;
				if (editingSide && typeof value === 'object' && value !== null) {
					return value[editingSide] ?? 0;
				}
				if (typeof value === 'number') {
					return value;
				}
				return 0;
			},
		);

		// Text annotation state
		const [showTextModal, setShowTextModal] = useState(false);
		const [clickPosition, setClickPosition] = useState<{
			x: number;
			y: number;
		} | null>(null);

		// Audit classifications state
		const [auditClassifications, setAuditClassifications] = useState<
			{ value: string; label: string }[]
		>([]);
		const [selectedClassifications, setSelectedClassifications] = useState<
			string[]
		>([]);

		// Exercise selection state
		const [selectedExercise, setSelectedExercise] = useState<string>('');
		const [previousExercise, setPreviousExercise] = useState<string>('');
		const [recalculatedValue, setRecalculatedValue] = useState<number | null>(
			null,
		);
		const [typingExercise, setTypingExercise] = useState<string>('');

		// Memoize AutoComplete options to prevent infinite re-renders
		const exerciseOptions = useMemo(
			() => EXERCISE_NAMES.map(name => ({ value: name, label: name })),
			[],
		);

		const filterExerciseOption = useCallback(
			(inputValue: string, option: unknown) =>
				option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1,
			[],
		);

		const getLandmarkSide = useCallback(
			(index: number): 'left' | 'right' | 'center' => {
				const leftIndices = [
					1, 2, 3, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31,
				];
				const rightIndices = [
					4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32,
				];

				if (leftIndices.includes(index)) return 'left';
				if (rightIndices.includes(index)) return 'right';
				return 'center';
			},
			[],
		);

		const shouldShowLandmarkForSide = useCallback(
			(index: number): boolean => {
				if (!editingSide) return true;

				const landmarkSide = getLandmarkSide(index);
				if (landmarkSide === 'center') return true;

				return landmarkSide === editingSide;
			},
			[editingSide, getLandmarkSide],
		);

		useEffect(() => {
			if (!ptVerifiedLandmarks?.length || !ptVerifiedLandmarksVisibility)
				return;
			setPtVerifiedLandmarks(prev =>
				prev.map((landmark, index) => {
					if (
						Object.prototype.hasOwnProperty.call(
							ptVerifiedLandmarksVisibility,
							index,
						)
					) {
						return {
							...landmark,
							visible: ptVerifiedLandmarksVisibility[index],
						};
					}
					return landmark;
				}),
			);
		}, [ptVerifiedLandmarksVisibility]);

		const validatedLandmarksWithVisibility = useMemo(() => {
			if (!validatedRecordData?.validatedCoordinates) return [];
			return validatedRecordData.validatedCoordinates.map((coord, idx) => {
				const baseVisibility = validatedLandmarksVisibility[idx] !== false;
				const sideVisibility = shouldShowLandmarkForSide(idx);

				return {
					index: idx,
					name: `Point ${idx + 1}`,
					color: 'var(--color-green-6)',
					x: coord.x,
					y: coord.y,
					z: coord.z || 0,
					visible: baseVisibility && sideVisibility,
					group: 'validated',
				};
			});
		}, [
			validatedRecordData?.validatedCoordinates,
			validatedLandmarksVisibility,
			shouldShowLandmarkForSide,
		]);

		const ptVerifiedLandmarksWithVisibility = useMemo(() => {
			if (!ptVerifiedLandmarks || ptVerifiedLandmarks.length === 0) {
				return [];
			}

			const result = ptVerifiedLandmarks.map((coord, idx) => {
				const landmarkSide = getLandmarkSide(idx);
				let finalVisible: boolean;

				// Priority 1: User explicitly toggled visibility (RightSideBar)
				if (ptVerifiedLandmarksVisibility[idx] !== undefined) {
					finalVisible = ptVerifiedLandmarksVisibility[idx];
				}
				// Priority 2: Apply editingSide filter for initial state
				else if (editingSide) {
					const shouldShowForSide =
						landmarkSide === editingSide || landmarkSide === 'center';
					finalVisible = shouldShowForSide;
				}
				// Priority 3: Use coord.visible if available
				else if ('visible' in coord && coord.visible !== undefined) {
					finalVisible = coord.visible;
				}
				// Priority 4: Default to visible
				else {
					finalVisible = true;
				}

				return {
					index: idx,
					name: `Point ${idx + 1}`,
					color: 'var(--color-orange-500)',
					x: coord.x,
					y: coord.y,
					z: coord.z || 0,
					visible: finalVisible,
					visibility: coord.visibility || 1,
					group: 'pt-verified',
				};
			});

			return result;
		}, [
			ptVerifiedLandmarks,
			ptVerifiedLandmarksVisibility,
			editingSide,
			getLandmarkSide,
		]);

		const preliminaryLandmarksWithVisibility = useMemo(() => {
			if (!canvasState.landmarks || canvasState.landmarks.length === 0) {
				return [];
			}

			return canvasState.landmarks.map((coord, idx) => {
				// Use preliminaryLandmarksVisibility state if set, otherwise use coord.visible
				const visible =
					preliminaryLandmarksVisibility[idx] !== undefined
						? preliminaryLandmarksVisibility[idx]
						: coord.visible !== undefined
							? coord.visible
							: false;

				const sideVisibility = shouldShowLandmarkForSide(idx);

				return {
					index: idx,
					name: `Point ${idx + 1}`,
					color: 'var(--color-error-500)',
					x: coord.x,
					y: coord.y,
					z: coord.z || 0,
					visible: visible && sideVisibility,
					visibility: coord.visibility || 1,
					group: 'current',
				};
			});
		}, [
			canvasState.landmarks,
			preliminaryLandmarksVisibility,
			shouldShowLandmarkForSide,
		]);

		const checkIfEditAllowed = () => {
			if (viewMode === 'current' || viewMode === 'validated') {
				if (!hasPTData || ptVerifiedLandmarks.length === 0) {
					const sourceLandmarks =
						validatedRecordData?.validatedCoordinates ||
						record?.coordinates ||
						[];
					const landmarksWithVisibility =
						copyValidatedLandmarksWithVisibility(sourceLandmarks);
					setPtVerifiedLandmarks(landmarksWithVisibility);
					setHasPTData(true);
				}
				setViewMode('pt-verified');
				return false;
			}
			return true;
		};

		const copyValidatedLandmarksWithVisibility = (
			sourceLandmarks: unknown[],
		) => {
			return sourceLandmarks.map((coord: unknown, idx: number) => {
				const hasValidatedVisibility = Object.prototype.hasOwnProperty.call(
					validatedLandmarksVisibility,
					idx,
				);
				const visible = hasValidatedVisibility
					? validatedLandmarksVisibility[idx] !== false
					: coord.visible !== undefined
						? coord.visible
						: true;

				return {
					...coord,
					visible,
				};
			});
		};

		const safeUpdateCanvasState = useCallback(
			(updates: unknown) => {
				if (viewMode === 'current' || viewMode === 'validated') {
					if ('isDragging' in updates && updates.isDragging === true) {
						if (!hasPTData || ptVerifiedLandmarks.length === 0) {
							const sourceLandmarks =
								validatedRecordData?.validatedCoordinates ||
								record?.coordinates ||
								[];
							const landmarksWithVisibility =
								copyValidatedLandmarksWithVisibility(sourceLandmarks);
							setPtVerifiedLandmarks(landmarksWithVisibility);
							setHasPTData(true);
						}
						setViewMode('pt-verified');
						return;
					}
					if ('landmarks' in updates && canvasState.isDragging) {
						if (!hasPTData || ptVerifiedLandmarks.length === 0) {
							const sourceLandmarks =
								validatedRecordData?.validatedCoordinates ||
								record?.coordinates ||
								[];
							const landmarksWithVisibility =
								copyValidatedLandmarksWithVisibility(sourceLandmarks);
							setPtVerifiedLandmarks(landmarksWithVisibility);
							setHasPTData(true);
						}
						setViewMode('pt-verified');
						return;
					}
				}

				if (viewMode === 'validated' && 'landmarks' in updates) {
					const { landmarks, ...rest } = updates;
					updateCanvasState(rest);
				} else if (viewMode === 'pt-verified' && 'landmarks' in updates) {
					if (canvasState.isDragging && canvasState.draggedLandmark !== null) {
						const updatedLandmarks = updates.landmarks.map((lm: unknown) => ({
							x: lm.x,
							y: lm.y,
							z: lm.z || 0,
							visibility: lm.visibility || 1,
							visible: lm.visible !== undefined ? lm.visible : true,
						}));
						setPtVerifiedLandmarks(updatedLandmarks);
					}

					const { landmarks, ...rest } = updates;
					updateCanvasState(rest);
				} else {
					updateCanvasState(updates);
				}
			},
			[
				viewMode,
				updateCanvasState,
				canvasState.isDragging,
				canvasState.draggedLandmark,
				hasPTData,
				ptVerifiedLandmarks,
				validatedRecordData?.validatedCoordinates,
				validatedLandmarksVisibility,
			],
		);

		const fetchAuditOptions = useCallback(async () => {
			const options = await dispatch(getAuditClarifications());
			const data = options.payload.data.map(
				(item: { vitalflowId: number; name: string }) => ({
					value: item.vitalflowId,
					label: item.name,
				}),
			);
			setAuditClassifications(data);
		}, [dispatch]);

		const fetchData = useCallback(async () => {
			if (!record?.romPatientResultId) return;

			const key = 'loadingLandmarks';
			message.loading({
				content: t('Admin.data.imageAnnotation.runningAi'),
				key,
				duration: 0,
			});

			try {
				setAnalyzing(true);
				const data = await dispatch(
					getAnnotationLandmarks(record.romPatientResultId),
				);
				message.destroy(key);

				const landmarks = data?.payload?.landmarks || [];

				if (!record.title.toLowerCase().includes('neck')) {
					await handleAIMediapipeAnalysis();
				}

				if (landmarks && landmarks.length > 0) {
					// Apply side-based filtering to loaded landmarks if editing a specific side
					const processedLandmarks = landmarks.map(
						(coord: unknown, idx: number) => {
							const landmarkSide = getLandmarkSide(idx);

							let finalVisible: boolean;

							if (editingSide) {
								// When editing a specific side, side filtering takes priority
								// This ensures that landmarks for the selected side are always shown
								const shouldShowForSide =
									landmarkSide === editingSide || landmarkSide === 'center';
								finalVisible = shouldShowForSide;
							} else {
								// When no side is specified, use original visibility
								finalVisible =
									coord.visible !== undefined ? coord.visible : true;
							}

							return {
								...coord,
								visible: finalVisible,
							};
						},
					);

					setOriginalPtVerifiedLandmarks(landmarks);
					setPtVerifiedLandmarks(processedLandmarks);
					setHasPTData(true);

					setCanvasState(prev => ({
						...prev,
						annotations: data?.payload?.annotations || [],
						originalAnnotations: data?.payload?.annotations || [],
						deletedAnnotationIds: [],
					}));
				}

				if (landmarks && landmarks.length > 0) {
					setViewMode('pt-verified');
				} else if (
					record?.validatedCoordinates &&
					record?.validatedValue !== null &&
					record?.validatedValue !== undefined
				) {
					setViewMode('validated');
				} else {
					setViewMode('current');
				}

				return data;
			} catch (error) {
				console.error('Failed to load landmarks', error);
				throw error;
			} finally {
				setAnalyzing(false);
			}
		}, [record, t, dispatch, setCanvasState, editingSide, getLandmarkSide]);

		const reloadValidationData = useCallback(async () => {
			if (!record?.romSessionId) return;

			setReloadingValidation(true);
			const key = 'reloadingValidation';
			message.loading({
				content: 'Reloading validation data...',
				key,
				duration: 0,
			});

			try {
				const response = await dispatch(
					getRomActivityStreamById({ romId: record.romSessionId }),
				);
				message.destroy(key);

				if (response?.payload) {
					const sessionData = response.payload as unknown;

					const updatedResult = sessionData?.romPatientResults
						?.flatMap((r: unknown) => r?.results || [])
						?.find(
							(res: unknown) =>
								res?.romPatientResultId === record?.romPatientResultId,
						);

					if (
						updatedResult?.validatedCoordinates &&
						updatedResult?.validatedValue !== null
					) {
						setValidatedRecordData({
							...record,
							validatedCoordinates: updatedResult.validatedCoordinates,
							validatedValue: updatedResult.validatedValue,
						});
						message.success('Validation data loaded successfully');
					} else {
						message.warning(
							'Validation data is still processing. Please try again in a moment.',
						);
					}

					if (fetchSessionData) {
						fetchSessionData(record.romSessionId);
					}
				} else {
					message.warning('No data received. Please try again.');
				}
			} catch (error) {
				message.destroy(key);
				message.error('Failed to reload validation data');
				console.error('Failed to reload validation data:', error);
			} finally {
				setReloadingValidation(false);
			}
		}, [record, dispatch, fetchSessionData]);

		const handleAIMediapipeAnalysis = async () => {
			if (isAnalyzingRef.current) return; // Prevent concurrent analysis
			isAnalyzingRef.current = true;

			try {
				setAnalyzing(true);
				setInitializedCurrent(false);
				setInitializedValidated(false);
				setInitializedPtVerified(false);
				// Clear visibility states to allow fresh initialization
				setPreliminaryLandmarksVisibility({});
				setPtVerifiedLandmarksVisibility({});
				setValidatedLandmarksVisibility({});

				if (viewMode === 'pt-verified') {
					setPtVerifiedLandmarks([]);
				} else {
					setCanvasState(prev => ({ ...prev, landmarks: [] }));
				}

				message.loading(t('Admin.data.imageAnnotation.runningAi'), 0);

				const vision = await FilesetResolver.forVisionTasks(
					'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
				);

				const landmarker = await PoseLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath:
							'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
						delegate: 'GPU',
					},
					runningMode: 'IMAGE',
					numPoses: 1,
				});

				const img = new Image();
				img.crossOrigin = 'anonymous';
				img.src = imageUrl ?? '';

				await new Promise((res, rej) => {
					img.onload = res;
					img.onerror = rej;
				});

				const canvas = document.createElement('canvas');
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				const ctx = canvas.getContext('2d');
				ctx?.drawImage(img, 0, 0);

				const poseResult: PoseLandmarkerResult =
					await landmarker.detect(canvas);

				// Set all landmarks as visible by default - RightSideBar will control visibility based on exercise
				const landmarks = (poseResult.landmarks?.[0] || []).map((l, idx) => ({
					index: idx,
					name: `Point ${idx + 1}`,
					color: 'var(--color-error-500)',
					x: l.x,
					y: l.y,
					z: l.z ?? 0,
					visibility: l.visibility ?? 1,
					visible: true, // Default to visible, RightSideBar will hide based on exercise name
					group: 'current',
				}));

				if (viewMode === 'pt-verified') {
					setPtVerifiedLandmarks(landmarks);
				} else {
					setCanvasState(prev => ({ ...prev, landmarks }));
				}

				message.destroy();
				message.success(
					landmarks.length
						? t('Admin.data.imageAnnotation.aiSuccess')
						: t('Admin.data.imageAnnotation.aiFailure'),
				);
			} catch (err) {
				console.error('MediaPipe Tasks PoseLandmarker error:', err);
				message.destroy();
			} finally {
				setAnalyzing(false);
				isAnalyzingRef.current = false;
			}
		};

		const handleSave = async () => {
			try {
				setSaving(true);
				const originalIds = new Set(
					canvasState.originalAnnotations.map(a => a.id),
				);

				const create = canvasState.annotations
					.filter(a => !originalIds.has(a.id))
					.map(({ id, ...rest }) => rest);

				const update = canvasState.annotations
					.filter(a => originalIds.has(a.id))
					.map(({ createdAt, updatedAt, ...rest }) => rest);

				const deleted = (canvasState.deletedAnnotationIds || []).filter(
					id => !id.startsWith('annotation-'),
				);

				let landmarksToSave;
				if (viewMode === 'pt-verified') {
					if (ptVerifiedLandmarks && ptVerifiedLandmarks.length > 0) {
						// If editing a specific side (left/right split records), preserve landmarks from both sides
						if (editingSide) {
							// IMPORTANT: When saving left side edits, we must preserve right side landmarks (and vice versa)
							// Use the original PT-verified landmarks loaded from API as the base (contains latest saved state for both sides)
							const existingLandmarks =
								originalPtVerifiedLandmarks.length > 0
									? originalPtVerifiedLandmarks
									: validatedRecordData?.validatedCoordinates ||
										record?.coordinates ||
										[];

							// Create a merged array by combining:
							// - Edited landmarks for the current side (from ptVerifiedLandmarks)
							// - Unchanged landmarks for the opposite side (from existingLandmarks)
							landmarksToSave = existingLandmarks.map(
								(coord: unknown, idx: number) => {
									const landmarkSide = getLandmarkSide(idx);

									// Use edited landmarks for current side and center (center landmarks are shared)
									if (
										landmarkSide === editingSide ||
										landmarkSide === 'center'
									) {
										const editedLandmark = ptVerifiedLandmarks[idx] || coord;
										return {
											x: editedLandmark.x,
											y: editedLandmark.y,
											z: editedLandmark.z || 0,
											visibility: editedLandmark.visibility || 1,
											visible:
												editedLandmark.visible !== undefined
													? editedLandmark.visible
													: true,
										};
									}

									// Preserve existing landmarks for the opposite side but normalize structure
									return {
										x: coord.x,
										y: coord.y,
										z: coord.z || 0,
										visibility: coord.visibility || 1,
										visible: coord.visible !== undefined ? coord.visible : true,
									};
								},
							);
						} else {
							// No side specified (not a left/right split), normalize all landmarks
							landmarksToSave = ptVerifiedLandmarks.map((coord: unknown) => ({
								x: coord.x,
								y: coord.y,
								z: coord.z || 0,
								visibility: coord.visibility || 1,
								visible: coord.visible !== undefined ? coord.visible : true,
							}));
						}
					} else {
						landmarksToSave =
							record?.coordinates?.map((coord: PoseLandmark) => ({
								x: coord.x,
								y: coord.y,
								z: coord.z || 0,
								visibility: coord.visibility || 1,
								visible: false,
							})) || [];
					}
				} else {
					landmarksToSave =
						canvasState.landmarks && canvasState.landmarks.length > 0
							? canvasState.landmarks.map((coord: unknown) => ({
									x: coord.x,
									y: coord.y,
									z: coord.z || 0,
									visibility: coord.visibility || 1,
									visible: coord.visible !== undefined ? coord.visible : true,
								}))
							: record?.coordinates?.map((coord: PoseLandmark) => ({
									x: coord.x,
									y: coord.y,
									z: coord.z || 0,
									visibility: coord.visibility || 1,
									visible: false,
								})) || [];
				}

				await dispatch(
					editAnnotationLandmarks({
						id: record?.romPatientResultId ?? '',
						annotations: { create, update, delete: deleted },
						landmarks: landmarksToSave,
					}),
				);

				updateCanvasState({ selectedTool: 'select' });

				// Update title if it has changed
				if (selectedExercise && selectedExercise !== record?.title) {
					await dispatch(
						editPatientResults({
							id: record?.romPatientResultId,
							editData: { title: selectedExercise },
						}),
					);
				}

				if (record?.validatedValuePt !== angleEnd) {
					await handleValueSave();
				}
				if (selectedClassifications != record?.auditClassificationStrapiId) {
					await handleSaveClassifications();
				}
			} catch (err) {
				message.error(createSafeErrorMessage((err as Error).message));
			} finally {
				setSaving(false);
				handleCancel?.();
			}
		};

		const handleValueSave = async () => {
			let validatedValuePtToSave: number | { left?: number; right?: number } =
				angleEnd as number;

			// If we're editing a specific side (left or right), merge it with the original object
			if (editingSide && (record as unknown)?.originalValidatedValuePt) {
				const originalValue = (record as unknown).originalValidatedValuePt;
				if (typeof originalValue === 'object' && originalValue !== null) {
					// Preserve the object structure and update only the specific side
					validatedValuePtToSave = {
						...originalValue,
						[editingSide]: angleEnd,
					};
				}
			} else if (editingSide && typeof angleEnd === 'number') {
				// Create a new object if original was not an object but we have a side specified
				const originalValue =
					(record as unknown)?.originalValidatedValuePt ||
					(record as unknown)?.originalValidatedValue ||
					(record as unknown)?.originalValue;
				if (typeof originalValue === 'object' && originalValue !== null) {
					validatedValuePtToSave = {
						left: originalValue.left,
						right: originalValue.right,
						[editingSide]: angleEnd,
					};
				}
			}

			const payload = {
				validatedValuePt: validatedValuePtToSave,
			};

			try {
				await dispatch(
					editvalidatedValuePt({
						editData: payload,
						id: record?.romPatientResultId ?? '',
					}),
				).unwrap();
				updateCanvasState({ selectedTool: 'select' });
				fetchSessionData?.(record?.romSessionId?.toString() ?? '');
				handleCancel?.();
			} catch (err) {
				console.error(err);
				message.error('Failed to save results');
			}
		};

		const handleSaveClassifications = async () => {
			if (!record?.romPatientResultId) {
				message.error('No result ID available');
				return;
			}

			try {
				await dispatch(
					saveAuditClassifications({
						sessionId: record?.romPatientResultId,
						selectedClassifications,
					}),
				);

				message.success(t('Admin.data.imageAnnotation.successClassifications'));

				if (record?.romSessionId && fetchSessionData) {
					fetchSessionData(record.romSessionId);
				}
			} catch (error) {
				console.error(
					t('Admin.data.imageAnnotation.errorClassifications'),
					error,
				);
				message.error(t('Admin.data.imageAnnotation.errorClassifications'));
			}
		};

		useImperativeHandle(ref, () => ({
			handleSave,
		}));

		const handleTextOk = (inputText: string) => {
			if (!inputText || !clickPosition) {
				setShowTextModal(false);
				return;
			}

			const newAnnotation = {
				id: `annotation-${Date.now()}`,
				type: 'text' as const,
				points: [{ x: clickPosition.x, y: clickPosition.y }],
				color: canvasState.currentColor,
				thickness: canvasState.currentThickness,
				text: inputText,
				fontSize: 24,
			};

			updateCanvasState({
				annotations: [...canvasState.annotations, newAnnotation],
				selectedTool: 'select',
			});

			setShowTextModal(false);
		};

		const handleCanvasClick = (x: number, y: number) => {
			if (canvasState.selectedTool === 'text') {
				setClickPosition({ x, y });
				setShowTextModal(true);
			}
		};

		const handleToolSelect = (tool: string) => {
			try {
				if (!tool) throw new Error('Invalid tool selection');
				updateCanvasState({ selectedTool: tool });

				if (tool === 'angle') {
					toggleAngleTool();
					setViewMode('pt-verified');
				} else if (canvasState.angleTool.isActive)
					updateAngleToolState({ isActive: false });
			} catch (err) {
				message.error(createSafeErrorMessage((err as Error).message));
			}
		};

		const handleColorChange = (color: string) => {
			const validation = validateColor(color);
			if (!validation.isValid) {
				message.error(validation.error);
				return;
			}

			const { selectedAnnotationId, annotations } = canvasState;
			const currentAnnotation = annotations.find(
				a => a.id === selectedAnnotationId,
			);

			if (currentAnnotation) {
				const updatedAnnotations = annotations.map(a =>
					a.id === currentAnnotation.id ? { ...a, color } : a,
				);
				updateCanvasState({
					annotations: updatedAnnotations,
					currentAnnotation: { ...currentAnnotation, color },
					currentColor: color,
				});
			} else {
				updateCanvasState({ currentColor: color });
			}
		};

		const handleThicknessChange = (thickness: number) => {
			const validation = validateThickness(thickness);
			if (!validation.isValid) {
				message.error(validation.error);
				return;
			}

			const { selectedAnnotationId, annotations } = canvasState;
			const currentAnnotation = annotations.find(
				a => a.id === selectedAnnotationId,
			);

			if (currentAnnotation) {
				const updatedAnnotations = annotations.map(a =>
					a.id === currentAnnotation.id ? { ...a, thickness } : a,
				);
				updateCanvasState({
					annotations: updatedAnnotations,
					currentAnnotation: { ...currentAnnotation, thickness },
					currentThickness: thickness,
				});
			} else {
				updateCanvasState({ currentThickness: thickness });
			}
		};

		const handleFontSizeChange = useCallback((size: number) => {
			const validatedSize = Math.max(8, Math.min(size, 72));

			const { selectedAnnotationId, annotations } = canvasState;
			const currentAnnotation = annotations.find(
				a => a.id === selectedAnnotationId,
			);

			if (currentAnnotation && currentAnnotation.type === 'text') {
				const updatedAnnotations = annotations.map(a =>
					a.id === currentAnnotation.id ? { ...a, fontSize: validatedSize } : a,
				);
				updateCanvasState({
					annotations: updatedAnnotations,
					currentFontSize: validatedSize,
				});
			} else {
				updateCanvasState({ currentFontSize: validatedSize });
			}
		}, [canvasState.annotations, canvasState.selectedAnnotationId, updateCanvasState]);

		const handleExport = () => {
			const imageCanvas = imageLayerCanvasRef.current;
			const annotationCanvas = canvasRef.current;

			if (!imageCanvas || !annotationCanvas) {
				message.error(t('Admin.data.imageAnnotation.noCanvas'));
				return;
			}

			setTimeout(() => {
				const mergedCanvas = document.createElement('canvas');
				mergedCanvas.width = imageCanvas.width;
				mergedCanvas.height = imageCanvas.height;

				const ctx = mergedCanvas.getContext('2d');
				if (!ctx)
					return message.error(t('Admin.data.imageAnnotation.failCanvas'));

				ctx.drawImage(imageCanvas, 0, 0);
				ctx.drawImage(annotationCanvas, 0, 0);

				const link = document.createElement('a');
				link.download = `patient-analysis-${viewMode}.png`;
				link.href = mergedCanvas.toDataURL('image/png');
				link.click();

				message.success(t('Admin.data.imageAnnotation.imageExport'));
			}, 100);
		};

		const handleClear = () => {
			updateCanvasState({
				annotations: [],
				originalAnnotations: [],
				deletedAnnotationIds: canvasState.annotations.map(a => a.id),
			});
			message.success(t('Admin.data.imageAnnotation.annotationClear'));
		};

		const handleClearLandmarks = () => {
			if (viewMode === 'pt-verified') {
				setPtVerifiedLandmarks([]);
			} else {
				updateCanvasState({ landmarks: [] });
			}
			setInitializedCurrent(false);
			setInitializedValidated(false);
			message.success(t('Admin.data.imageAnnotation.landmarkClear'));
		};

		const handleLandmarkPositionUpdate = (
			index: number,
			x: number,
			y: number,
		) => {
			if (viewMode === 'validated') return;
			if (!checkIfEditAllowed()) return;

			if (viewMode === 'pt-verified') {
				const updated = ptVerifiedLandmarks.map((lm, i) =>
					i === index ? { ...lm, x, y } : lm,
				);
				setPtVerifiedLandmarks(updated);
			} else {
				const updated = canvasState.landmarks.map((lm, i) =>
					i === index ? { ...lm, x, y } : lm,
				);
				updateCanvasState({ landmarks: updated });
			}
		};

		const handleLandmarkVisibilityToggle = (
			index: number,
			visible: boolean,
		) => {
			if (viewMode === 'validated') {
				setValidatedLandmarksVisibility(prev => ({
					...prev,
					[index]: visible,
				}));
			} else if (viewMode === 'pt-verified') {
				setPtVerifiedLandmarksVisibility(prev => ({
					...prev,
					[index]: visible,
				}));
			} else {
				// For preliminary mode, use separate visibility state
				setPreliminaryLandmarksVisibility(prev => ({
					...prev,
					[index]: visible,
				}));
			}
		};

		const handleBatchLandmarkVisibilityToggle = (
			indices: number[],
			visible: boolean,
		) => {
			if (viewMode === 'validated') {
				const updates: { [key: number]: boolean } = {};
				indices.forEach(i => {
					updates[i] = visible;
				});
				setValidatedLandmarksVisibility(prev => ({
					...prev,
					...updates,
				}));
			} else if (viewMode === 'pt-verified') {
				const updates: { [key: number]: boolean } = {};
				indices.forEach(i => {
					updates[i] = visible;
				});
				setPtVerifiedLandmarksVisibility(prev => ({
					...prev,
					...updates,
				}));
			} else {
				// For preliminary mode, use separate visibility state
				const updates: { [key: number]: boolean } = {};
				indices.forEach(i => {
					updates[i] = visible;
				});
				setPreliminaryLandmarksVisibility(prev => ({
					...prev,
					...updates,
				}));
			}
		};

		useEffect(() => {
			setCanvasState(prev => ({ ...prev, annotations: [] }));
			setValidatedRecordData(record);

			const classifications =
				(record as OmniRomRomPatientResult)?.auditClassificationStrapiId || [];
			setSelectedClassifications(
				Array.isArray(classifications) ? classifications : [],
			);

			// Check if we're viewing a different record (not just a re-render)
			const recordId = record?.romPatientResultId?.toString() || null;
			const isNewRecord = recordId !== currentRecordIdRef.current;

			if (isNewRecord) {
				// New record - always initialize from record.title
				currentRecordIdRef.current = recordId;
				if (record?.title) {
					setSelectedExercise(record.title);
					setPreviousExercise(record.title);
					setTypingExercise(record.title);
				}
			}
			// If same record (just a re-render), keep the user's selected exercise
		}, [record, setCanvasState]);

		useEffect(() => {
			if (
				viewMode === 'pt-verified' &&
				(!ptVerifiedLandmarks || ptVerifiedLandmarks.length === 0)
			) {
				// Use validated coordinates if available, otherwise fall back to preliminary coordinates
				const sourceLandmarks =
					validatedRecordData?.validatedCoordinates ||
					record?.coordinates ||
					[];
				if (sourceLandmarks.length > 0) {
					const landmarksWithVisibility =
						copyValidatedLandmarksWithVisibility(sourceLandmarks);
					setPtVerifiedLandmarks(landmarksWithVisibility);
					setHasPTData(true);
				}
			}
		}, [
			viewMode,
			ptVerifiedLandmarks,
			validatedRecordData?.validatedCoordinates,
			record?.coordinates,
			validatedLandmarksVisibility,
		]);

		useEffect(() => {
			if (!imageUrl) return;

			const loadImage = async () => {
				try {
					setCanvasLoading?.(true);
					fetchAuditOptions();
					const img = new Image();
					img.crossOrigin = 'anonymous';

					img.onload = async () => {
						updateCanvasState({ image: img, selectedTool: 'select' });
						updateAngleToolState({ isActive: false });
						setCanvasLoading?.(false);

						if (record?.romPatientResultId) {
							await fetchData();
						}
					};

					img.onerror = () => {
						img.src = '/images/empty-image.png';
						message.error(t('Admin.data.imageAnnotation.failImage'));
						setCanvasLoading?.(false);
					};

					img.src = imageUrl;
				} catch {
					message.error(t('Admin.data.imageAnnotation.failImage'));
					setCanvasLoading?.(false);
				}
			};

			loadImage();
		}, [imageUrl]);

		useEffect(() => {
			const displayValue = getDisplayValue();
			if (typeof displayValue === 'number') {
				setAngleEnd(displayValue);
			} else if (displayValue === '0' || displayValue === '-') {
				setAngleEnd(displayValue);
			}
		}, [record, viewMode, editingSide]);

		// Recalculate angle when PT verified landmarks change (e.g., when dragging)
		useEffect(() => {
			if (
				!selectedExercise ||
				viewMode !== 'pt-verified' ||
				!ptVerifiedLandmarks ||
				ptVerifiedLandmarks.length === 0
			) {
				return;
			}

			// Don't recalculate if we're currently dragging (will recalculate on drag end)
			if (canvasState.isDragging) {
				return;
			}

			// Calculate the angle using the selected exercise's function
			const imageSizes = canvasRef.current
				? {
						width: canvasRef.current.width,
						height: canvasRef.current.height,
					}
				: undefined;

			const calculatedAngle = calculateExerciseAngle(
				selectedExercise,
				ptVerifiedLandmarks,
				imageSizes,
			);

			if (
				calculatedAngle !== null &&
				Math.abs(calculatedAngle - (recalculatedValue || 0)) > 0.1
			) {
				setRecalculatedValue(calculatedAngle);
				setAngleEnd(Math.round(calculatedAngle));
			}
		}, [
			ptVerifiedLandmarks,
			selectedExercise,
			viewMode,
			canvasState.isDragging,
			recalculatedValue,
		]);

		// Reset landmark initialization when exercise changes
		useEffect(() => {
			if (selectedExercise) {
				setInitializedCurrent(false);
				setInitializedValidated(false);
				setInitializedPtVerified(false);
				// Clear all visibility states to allow re-initialization
				setPreliminaryLandmarksVisibility({});
				setPtVerifiedLandmarksVisibility({});
				setValidatedLandmarksVisibility({});
			}
		}, [selectedExercise]);

		// Auto-trigger AI analysis when switching to preliminary mode
		useEffect(() => {
			if (
				viewMode === 'current' &&
				!record?.title?.toLowerCase().includes('neck') &&
				imageUrl &&
				(!canvasState.landmarks || canvasState.landmarks.length === 0) &&
				!isAnalyzingRef.current
			) {
				handleAIMediapipeAnalysis();
			}

			if (viewMode !== 'pt-verified' && canvasState.angleTool.isActive) {
				setCanvasState(prev => ({
					...prev,
					angleTool: { ...prev.angleTool, isActive: false },
				}));
			}
		}, [viewMode, canvasState.angleTool.isActive, imageUrl, record?.title]);

		const landmarksForMode = useMemo(() => {
			let landmarks;
			switch (viewMode) {
				case 'validated':
					landmarks = validatedLandmarksWithVisibility;
					break;
				case 'pt-verified':
					landmarks = ptVerifiedLandmarksWithVisibility;
					break;
				default:
					landmarks = preliminaryLandmarksWithVisibility;
			}

			return landmarks;
		}, [
			viewMode,
			validatedLandmarksWithVisibility,
			ptVerifiedLandmarksWithVisibility,
			preliminaryLandmarksWithVisibility,
		]);

		const getCanvasStateForMode = () => {
			if (viewMode === 'validated') {
				return {
					...canvasState,
					image: canvasState.image,
					selectedTool: canvasState.selectedTool,
					annotations: canvasState.annotations,
					currentAnnotation: canvasState.currentAnnotation,
					selectedAnnotationId: canvasState.selectedAnnotationId,
					landmarks: validatedLandmarksWithVisibility,
				};
			}
			if (viewMode === 'pt-verified') {
				return {
					...canvasState,
					landmarks: ptVerifiedLandmarksWithVisibility,
				};
			}
			return {
				...canvasState,
				landmarks: preliminaryLandmarksWithVisibility,
			};
		};

		// Handle exercise change (only when actually committed, not while typing)
		const handleExerciseChange = useCallback(
			(newExercise: string) => {
				if (!newExercise || !isUser) {
					return;
				}

				// If same as already selected, skip
				if (newExercise === selectedExercise) {
					return;
				}

				// Use current selectedExercise as previous if it exists, otherwise use record title
				const previousEx = selectedExercise || record?.title || '';

				// Get current landmarks based on view mode
				let currentLandmarks: unknown[] = [];
				if (viewMode === 'pt-verified' && ptVerifiedLandmarks.length > 0) {
					currentLandmarks = [...ptVerifiedLandmarks];
				} else if (
					viewMode === 'validated' &&
					validatedRecordData?.validatedCoordinates
				) {
					currentLandmarks = [...validatedRecordData.validatedCoordinates];
				} else if (record?.coordinates) {
					currentLandmarks = [...record.coordinates];
				}

				if (currentLandmarks.length === 0) {
					return;
				}

				try {
					// Reposition landmarks for new exercise
					const repositionedLandmarks = repositionLandmarksForNewExercise(
						currentLandmarks,
						previousEx,
						newExercise,
					);

					// Update landmark visibility based on new exercise
					const landmarksWithVisibility = updateLandmarkVisibility(
						repositionedLandmarks,
						newExercise,
					);

					// Update visibility state for the new landmarks
					const newVisibilityState: { [index: number]: boolean } = {};
					landmarksWithVisibility.forEach((lm, idx) => {
						if (lm.visible !== undefined) {
							newVisibilityState[idx] = lm.visible;
						}
					});

					// Auto-switch to pt-verified mode FIRST
					if (viewMode !== 'pt-verified') {
						setViewMode('pt-verified');
						if (!hasPTData) {
							setHasPTData(true);
						}
					}

					// Update all landmark-related states together
					setPtVerifiedLandmarks(landmarksWithVisibility);
					setPtVerifiedLandmarksVisibility(newVisibilityState);

					// Calculate the angle using the selected exercise's function
					const imageSizes = canvasRef.current
						? {
								width: canvasRef.current.width,
								height: canvasRef.current.height,
							}
						: undefined;

					const calculatedAngle = calculateExerciseAngle(
						newExercise,
						landmarksWithVisibility,
						imageSizes,
					);

					if (calculatedAngle !== null) {
						setRecalculatedValue(calculatedAngle);
						setAngleEnd(Math.round(calculatedAngle));
					}

					// Update state
					setPreviousExercise(newExercise);
					setSelectedExercise(newExercise);
				} catch (error) {
					console.error('Error during landmark repositioning:', error);
				}
			},
			[
				isUser,
				selectedExercise,
				previousExercise,
				viewMode,
				ptVerifiedLandmarks,
				validatedRecordData,
				record,
				hasPTData,
				canvasRef,
			],
		);

		// Handle blur - auto-complete with best match
		const handleExerciseBlur = useCallback(() => {
			if (!typingExercise || typingExercise === selectedExercise) return;

			// Find best match from exercise names
			const exactMatch = EXERCISE_NAMES.find(name => name === typingExercise);
			if (exactMatch) {
				handleExerciseChange(exactMatch);
				return;
			}

			// Find case-insensitive match
			const caseInsensitiveMatch = EXERCISE_NAMES.find(
				name => name.toLowerCase() === typingExercise.toLowerCase(),
			);
			if (caseInsensitiveMatch) {
				setTypingExercise(caseInsensitiveMatch);
				handleExerciseChange(caseInsensitiveMatch);
				return;
			}

			// Find partial match (starts with typed text)
			const partialMatch = EXERCISE_NAMES.find(name =>
				name.toLowerCase().startsWith(typingExercise.toLowerCase()),
			);
			if (partialMatch) {
				setTypingExercise(partialMatch);
				handleExerciseChange(partialMatch);
				return;
			}

			// Find contains match
			const containsMatch = EXERCISE_NAMES.find(name =>
				name.toLowerCase().includes(typingExercise.toLowerCase()),
			);
			if (containsMatch) {
				setTypingExercise(containsMatch);
				handleExerciseChange(containsMatch);
				return;
			}

			// No match found - revert to previous
			setTypingExercise(selectedExercise);
		}, [typingExercise, selectedExercise, handleExerciseChange]);

		const getDisplayValue = () => {
			// If we have a recalculated value from exercise selection or dragging, use it
			if (recalculatedValue !== null && viewMode === 'pt-verified') {
				return Math.round(recalculatedValue);
			}

			const extractSideValue = (val: unknown) => {
				if (val == null) return null;
				if (editingSide && typeof val === 'object') {
					return val[editingSide];
				}
				if (typeof val === 'number') return val;
				return null;
			};

			const validatedValue = extractSideValue(
				validatedRecordData?.validatedValue,
			);
			if (viewMode === 'pt-verified') {
				const ptValue = extractSideValue(record?.validatedValuePt);

				if (ptValue !== null && ptValue !== undefined) {
					return Math.round(ptValue);
				}

				if (validatedValue !== null && validatedValue !== undefined) {
					return Math.round(validatedValue);
				}

				return '0';
			}

			if (viewMode === 'validated') {
				return validatedValue !== null && validatedValue !== undefined
					? Math.round(validatedValue)
					: '0';
			}

			const currentValue = extractSideValue(record?.value);
			return currentValue ?? '-';
		};

		const renderCanvas = (key: string) => {
			const extractRecordValue = () => {
				const val =
					viewMode === 'validated'
						? validatedRecordData?.validatedValue
						: record?.value;
				if (editingSide && typeof val === 'object' && val !== null) {
					return val[editingSide];
				}
				if (typeof val === 'number') return val;
				return null;
			};

			return (
				<ACanvas
					key={key}
					canvasRef={canvasRef}
					imageLayerCanvasRef={imageLayerCanvasRef}
					aiLandMarks={landmarksForMode}
					hoveredLandmark={hoveredLandmark}
					setHoveredLandmark={setHoveredLandmark}
					canvasState={getCanvasStateForMode()}
					onStateChange={safeUpdateCanvasState}
					onMouseMove={() => {}}
					onDimensionsChange={updateCanvasDimensions}
					onCanvasClick={handleCanvasClick}
					record={extractRecordValue()}
					valueLabel={viewMode === 'validated' ? 'Validated' : 'Current'}
					zoom={zoom}
					pan={pan}
					onZoomChange={setZoom}
					onPanChange={setPan}
				/>
			);
		};

		const renderValidationProcessing = () => (
			<div className="validation-processing-overlay">
				<div className="validation-processing-label">
					Processing validation data...
				</div>
				<ReloadOutlined
					className="validation-reload-icon"
					spin={reloadingValidation}
					onClick={reloadValidationData}
					title="Reload validation data"
				/>
			</div>
		);

		const isValidationProcessing =
			viewMode === 'validated' &&
			(!validatedRecordData?.validatedCoordinates ||
				validatedRecordData?.validatedValue === null ||
				validatedRecordData?.validatedValue === undefined);

		return (
			<>
				{!canvasLoading ? (
					<AnnotationErrorBoundary>
						<Layout className="poc-annotation-layout">
							<div className="comparison-title">
								{isUser ? (
									<div
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 'var(--spacing-2)',
										}}>
										<AutoComplete
											className="theme-select-dropdown"
											value={typingExercise}
											onChange={setTypingExercise}
											onSelect={handleExerciseChange}
											onBlur={handleExerciseBlur}
											style={{ width: 250 }}
											placeholder={
												record?.title || 'Select or type exercise name'
											}
											options={exerciseOptions}
											filterOption={filterExerciseOption}
											allowClear
										/>
										{(selectedExercise || record?.title) &&
											(() => {
												const exerciseName = selectedExercise || record?.title;
												if (!exerciseName) return null;
												try {
													const config = getExerciseConfig(exerciseName);
													return config ? (
														<Tooltip
															title={
																<div>
																	<strong>Required Landmarks:</strong>
																	<ul
																		style={{
																			margin: '4px 0',
																			paddingLeft: 'var(--spacing-5)',
																		}}>
																		{config.landmarkIndices.map(lm => (
																			<li key={lm.index}>
																				{lm.name} (#{lm.index})
																			</li>
																		))}
																	</ul>
																	{config.description && (
																		<div
																			style={{
																				marginTop: 'var(--spacing-2)',
																				fontSize: 'var(--font-size-xs)',
																				opacity: 0.9,
																			}}>
																			{config.description}
																		</div>
																	)}
																</div>
															}
															placement="right">
															<InfoCircleOutlined
																style={{
																	color: 'var(--color-daybreak-blue-6)',
																	cursor: 'pointer',
																}}
															/>
														</Tooltip>
													) : null;
												} catch (error) {
													console.error(
														'Error rendering exercise config:',
														error,
													);
													return null;
												}
											})()}
									</div>
								) : (
									<span>{record?.title ?? ''}</span>
								)}
								{isUser && (
									<Select
										value={viewMode}
										onChange={setViewMode}
										style={{ width: 140, marginLeft: 16 }}
										options={[
											{
												value: 'validated',
												label: t('Admin.data.imageAnnotation.verified'),
											},
											{
												value: 'current',
												label: t('Admin.data.imageAnnotation.preliminary'),
											},
											...(hasPTData
												? [{ value: 'pt-verified', label: 'PT Verified' }]
												: []),
										]}
									/>
								)}
								<span className="comparison-value">
									{!isUser
										? (() => {
												const extractValue = (val: unknown) => {
													if (
														editingSide &&
														typeof val === 'object' &&
														val !== null
													) {
														return val[editingSide];
													}
													if (typeof val === 'number') return val;
													return null;
												};
												const displayVal =
													extractValue(record?.validatedValuePt) ??
													extractValue(record?.validatedValue) ??
													extractValue(record?.value);
												return Math.round(displayVal ?? 0);
											})()
										: viewMode === 'pt-verified' &&
											  canvasState.angleTool.isActive
											? angleEnd
											: Math.round(getDisplayValue() as number)}
									°
								</span>
								{isUser && (
									<Select
										mode="multiple"
										className="theme-select-dropdown"
										placeholder={t(
											'Admin.data.imageAnnotation.selectClassifications',
										)}
										value={selectedClassifications}
										onChange={setSelectedClassifications}
										style={{ width: 500, marginLeft: 16 }}
										options={auditClassifications}
										maxTagCount="responsive"
									/>
								)}
								{!isUser && selectedClassifications?.length > 0 && (
									<>
										{selectedClassifications.slice(0, 2).map(id => {
											const classification = auditClassifications?.find(
												c => c.value === id,
											);
											return (
												<Tag key={id}>
													{classification ? classification.label : id}
												</Tag>
											);
										})}

										{selectedClassifications.length > 2 && (
											<Popover
												placement="top"
												content={
													<div
														style={{
															display: 'flex',
															flexDirection: 'column',
															gap: 4,
														}}>
														{selectedClassifications.slice(2).map(id => {
															const classification = auditClassifications?.find(
																c => c.value === id,
															);
															return (
																<Tag key={id} style={{ width: 'fit-content' }}>
																	{classification ? classification.label : id}
																</Tag>
															);
														})}
													</div>
												}>
												<Tag style={{ cursor: 'pointer' }}>
													Show All (+{selectedClassifications.length - 2})
												</Tag>
											</Popover>
										)}
									</>
								)}
							</div>

							<div className="comparison-toolbar-container">
								<ACanvasControls
									showGrid={canvasState.showGrid}
									gridSize={canvasState.gridSize}
									onShowGridChange={showGrid => updateCanvasState({ showGrid })}
									onGridSizeChange={gridSize => updateCanvasState({ gridSize })}
								/>
								<div className="zoom-controls-toolbar">
									<button
										className="zoom-btn"
										onClick={() => setZoom(Math.max(zoom * 0.8, 0.5))}
										title="Zoom Out">
										−
									</button>
									<div className="zoom-percentage">
										{Math.round(zoom * 100)}%
									</div>
									<button
										className="zoom-btn"
										onClick={() => setZoom(Math.min(zoom * 1.2, 5))}
										title="Zoom In">
										+
									</button>
									<div className="divider"></div>
									<button
										className="reset-btn"
										onClick={() => {
											setZoom(1);
											setPan({ x: 0, y: 0 });
										}}>
										{t('Admin.data.imageAnnotation.reset')}
									</button>
									<div className="help-text">
										{t('Admin.data.imageAnnotation.dragPan')}
									</div>
								</div>
								{isUser && (
									<AToolbar
										aiMediapipeAnalysis={handleAIMediapipeAnalysis}
										onExport={handleExport}
										onUndo={undo}
										onRedo={redo}
										onClear={handleClear}
										onClearLandMarks={handleClearLandmarks}
										canUndo={canUndo}
										canRedo={canRedo}
										saving={saving}
										analyzing={analyzing}
										title={record?.title}
										isValidatedMode={viewMode === 'validated'}
										viewMode={viewMode}
									/>
								)}
							</div>

							<Layout
								className="poc-annotation-content-layout"
								style={
									showComparison
										? { display: 'flex', flexDirection: 'row' }
										: {}
								}>
								{isUser && showComparison && (
									<Sider width={64} className="poc-annotation-left-sider">
										<MLeftSidebar
											selectedTool={canvasState.selectedTool}
											onToolSelect={handleToolSelect}
											currentColor={canvasState.currentColor}
											onColorChange={handleColorChange}
											currentThickness={canvasState.currentThickness}
											onThicknessChange={handleThicknessChange}
											canvasState={canvasState}
											onStateChange={updateCanvasState}
										/>
									</Sider>
								)}

								{showComparison ? (
									<div className="comparison-container">
										<div className="single-canvas-view">
											<Content className="poc-annotation-canvas-content single-canvas-content">
												{isValidationProcessing
													? renderValidationProcessing()
													: renderCanvas('comparison-canvas')}
											</Content>
											{isUser &&
												viewMode === 'pt-verified' &&
												canvasState.angleTool.isActive && (
													<CompassOverlay
														setAngleStart={setAngleStart}
														angleStart={angleStart}
														angleEnd={angleEnd || 0}
														setAngleEnd={setAngleEnd}
													/>
												)}
										</div>
									</div>
								) : (
									<>
										{isUser && (
											<Sider width={64} className="poc-annotation-left-sider">
												<MLeftSidebar
													selectedTool={canvasState.selectedTool}
													onToolSelect={handleToolSelect}
													currentColor={canvasState.currentColor}
													onColorChange={handleColorChange}
													currentThickness={canvasState.currentThickness}
													onThicknessChange={handleThicknessChange}
													canvasState={canvasState}
													onStateChange={updateCanvasState}
												/>
											</Sider>
										)}
										<Content className="poc-annotation-canvas-content">
											{isValidationProcessing
												? renderValidationProcessing()
												: renderCanvas('main-canvas')}
											{isUser &&
												viewMode === 'pt-verified' &&
												canvasState.angleTool.isActive && (
													<CompassOverlay
														setAngleStart={setAngleStart}
														angleStart={angleStart}
														angleEnd={angleEnd || 0}
														setAngleEnd={setAngleEnd}
													/>
												)}
										</Content>
									</>
								)}

								<TextInputModal
									visible={showTextModal}
									onOk={handleTextOk}
									onCancel={() => {
										updateCanvasState({ selectedTool: 'select' });
										setShowTextModal(false);
									}}
								/>

								<Sider
									width={320}
									className="poc-annotation-right-sider"
									style={{ padding: 16 }}>
									<RightSideBar
										key={viewMode}
										landmarks={landmarksForMode}
										exerciseName={selectedExercise || record?.title || ''}
										onUpdateLandmarkPosition={handleLandmarkPositionUpdate}
										onToggleLandmarkVisibility={handleLandmarkVisibilityToggle}
										initialized={
											viewMode === 'validated'
												? initializedValidated
												: viewMode === 'pt-verified'
													? initializedPtVerified
													: initializedCurrent
										}
										setInitialized={
											viewMode === 'validated'
												? setInitializedValidated
												: viewMode === 'pt-verified'
													? setInitializedPtVerified
													: setInitializedCurrent
										}
										onBatchToggleLandmarkVisibility={
											handleBatchLandmarkVisibilityToggle
										}
									/>
								</Sider>
							</Layout>
						</Layout>
					</AnnotationErrorBoundary>
				) : (
					<Spin className="spin-css" tip="Loading" size="large" />
				)}

				<Modal
					open={isSaveConfirmationVisible}
					centered
					rootClassName="save-modal"
					closable={false}
					zIndex={3000}
					footer={[
						<Button
							key="cancel"
							onClick={() => {
								onCloseSaveConfirmation?.();
								handleCancel?.();
							}}>
							Cancel
						</Button>,
						<Button
							key="save"
							type="primary"
							loading={saving}
							onClick={handleSave}>
							Yes, Save
						</Button>,
					]}>
					Are you sure you want to save your changes?
				</Modal>
			</>
		);
	},
);
