import {
	createContext,
	PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { getStoredVolume, saveVolume } from '@hooks/usePersistedVolume';

export type PostureView = 'front' | 'left' | 'right' | 'back';

export type PostureAudioKey =
	| 'visibility'
	| 'instruction'
	| 'congratulations'
	| 'frame'
	| 'wrongSide';

export type SharedAudioKey =
	| 'success'
	| 'poseLost'
	| 'leftTip';

export type ViewTransitionAudioKey =
	| 'title1'
	| 'title2'
	| 'title3'
	| 'title4';

const FILE_NAME_MAP: Record<PostureAudioKey, string> = {
	visibility: 'visibility.mp3',
	instruction: 'instruction.mp3',
	congratulations: 'congratulations.mp3',
	frame: 'frame.mp3',
	wrongSide: 'wrongSide.mp3',
};

const SHARED_FILE_MAP: Record<SharedAudioKey, string> = {
	success: 'success.mp3',
	poseLost: 'poseLost.mp3',
	leftTip: 'leftTip.mp3',
};

const VIEW_TRANSITION_FILE_MAP: Record<ViewTransitionAudioKey, string> = {
	title1: 'title1.mp3',
	title2: 'title2.mp3',
	title3: 'title3.mp3',
	title4: 'title4.mp3',
};

function buildSrc(view: PostureView, key: PostureAudioKey) {
	return `/posture/${view}/${FILE_NAME_MAP[key]}`;
}

function buildSharedSrc(key: SharedAudioKey) {
	return `/posture/shared/${SHARED_FILE_MAP[key]}`;
}

function buildViewTransitionSrc(key: ViewTransitionAudioKey) {
	return `/posture/view-transitions/${VIEW_TRANSITION_FILE_MAP[key]}`;
}

// Audio state machine states
export type CalibrationAudioState =
	| 'idle'
	| 'playing_visibility'
	| 'waiting_after_visibility'
	| 'playing_frame'
	| 'waiting_after_frame'
	| 'stabilizing'
	| 'playing_instruction'
	| 'instruction_paused'
	| 'playing_wrongSide'
	| 'playing_poseLost'
	| 'playing_view_intro'
	| 'playing_congratulations';

// Timing constants
const WAIT_AFTER_AUDIO_MS = 3000; // 3s wait between calibration audio
const STABILIZATION_DELAY_MS = 2000; // 2s stabilization before instruction
const POSE_DEBOUNCE_MS = 300; // 300ms debounce for pose detection stability

interface PostureScreenAudioContextData {
	// Basic audio state
	isPlaying: boolean;
	muted: boolean;
	volume: number;
	currentView: PostureView | null;
	currentKey: PostureAudioKey | SharedAudioKey | ViewTransitionAudioKey | null;
	currentSrc: string | null;

	// Calibration state machine
	calibrationState: CalibrationAudioState;
	isPoseDetected: boolean;

	// Basic controls
	play: (
		view: PostureView,
		key?: PostureAudioKey,
		onEnded?: () => void,
	) => Promise<void>;
	stop: () => void;
	setVolume: (v: number) => void;
	setMuted: (m: boolean) => void;

	// Calibration flow controls
	startCalibration: (view: PostureView, isAlreadyAligned?: boolean) => void;
	stopCalibration: () => void;
	setPoseDetected: (detected: boolean) => void;
	resetForNewView: (view: PostureView) => void;

	// New audio controls
	playShared: (key: SharedAudioKey) => Promise<void>;
	playWrongSide: (view: PostureView) => Promise<void>;
	playCongratulations: (view: PostureView) => Promise<void>;
	playViewIntro: (viewIndex: number) => Promise<void>;
}

const PostureScreenAudioContext = createContext<PostureScreenAudioContextData>({
	isPlaying: false,
	muted: false,
	volume: 100,
	currentView: null,
	currentKey: null,
	currentSrc: null,
	calibrationState: 'idle',
	isPoseDetected: false,
	play: async () => {},
	stop: () => {},
	setVolume: () => {},
	setMuted: () => {},
	startCalibration: () => {},
	stopCalibration: () => {},
	setPoseDetected: () => {},
	resetForNewView: () => {},
	playShared: async () => {},
	playWrongSide: async () => {},
	playCongratulations: async () => {},
	playViewIntro: async () => {},
});

export function PostureScreenAudioProvider({ children }: PropsWithChildren) {
	const audioRef = useRef<HTMLAudioElement | null>(null);

	// Basic audio state
	const [isPlaying, setIsPlaying] = useState(false);
	const [muted, setMuted] = useState(false);
	const [volume, setVolumeState] = useState(getStoredVolume);
	const [currentView, setCurrentView] = useState<PostureView | null>(null);
	const [currentKey, setCurrentKey] = useState<PostureAudioKey | SharedAudioKey | ViewTransitionAudioKey | null>(null);
	const [currentSrc, setCurrentSrc] = useState<string | null>(null);

	// Calibration state machine - use both state and ref
	const [calibrationState, setCalibrationStateRaw] =
		useState<CalibrationAudioState>('idle');
	const calibrationStateRef = useRef<CalibrationAudioState>('idle');
	const [isPoseDetected, setIsPoseDetectedState] = useState(false);

	// Update both state and ref together
	const setCalibrationState = useCallback((state: CalibrationAudioState) => {
		calibrationStateRef.current = state;
		setCalibrationStateRaw(state);
	}, []);

	// Track instruction audio position for pause/resume
	const instructionPositionRef = useRef<number>(0);
	const instructionViewRef = useRef<PostureView | null>(null);
	const hasInstructionToResumeRef = useRef<boolean>(false);

	// Current view ref for callbacks
	const currentViewRef = useRef<PostureView | null>(null);
	useEffect(() => {
		currentViewRef.current = currentView;
	}, [currentView]);

	// Timer refs for cleanup
	const waitTimerRef = useRef<NodeJS.Timeout | null>(null);
	const stabilizationTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Store resolve functions for pending waits (to interrupt them)
	const waitResolveRef = useRef<(() => void) | null>(null);
	const stabilizationResolveRef = useRef<(() => void) | null>(null);

	// Track if we're in a valid playing state (to ignore stale callbacks)
	const playingKeyRef = useRef<string | null>(null);

	// Prevent concurrent calibration loops
	const loopIdRef = useRef<number>(0);
	const isLoopRunningRef = useRef<boolean>(false);

	// Store cleanup function for current audio play
	const audioCleanupRef = useRef<(() => void) | null>(null);

	// Initialize audio element
	if (!audioRef.current) {
		audioRef.current = new Audio();
		audioRef.current.preload = 'auto';
	}

	// Clear all timers and resolve pending waits
	const clearTimers = useCallback(() => {
		if (waitTimerRef.current) {
			clearTimeout(waitTimerRef.current);
			waitTimerRef.current = null;
		}
		// Resolve any pending wait to unblock the loop
		if (waitResolveRef.current) {
			waitResolveRef.current();
			waitResolveRef.current = null;
		}
		if (stabilizationTimerRef.current) {
			clearTimeout(stabilizationTimerRef.current);
			stabilizationTimerRef.current = null;
		}
		// Resolve any pending stabilization wait
		if (stabilizationResolveRef.current) {
			stabilizationResolveRef.current();
			stabilizationResolveRef.current = null;
		}
	}, []);

	// Stop audio helper
	const stopAudio = useCallback(() => {
		// Invalidate current loop
		loopIdRef.current++;
		isLoopRunningRef.current = false;
		// Clean up any pending audio listeners
		if (audioCleanupRef.current) {
			audioCleanupRef.current();
			audioCleanupRef.current = null;
		}
		const a = audioRef.current;
		if (a) {
			a.pause();
			a.currentTime = 0;
		}
		playingKeyRef.current = null;
		setIsPlaying(false);
	}, []);

	// Play audio and return promise that resolves when audio ends
	const playAudioAsync = useCallback(
		(view: PostureView, key: PostureAudioKey, startTime?: number): Promise<void> => {
			return new Promise((resolve) => {
				const a = audioRef.current;
				if (!a) {
					resolve();
					return;
				}

				// Clean up previous audio play if any
				if (audioCleanupRef.current) {
					audioCleanupRef.current();
					audioCleanupRef.current = null;
				}

				const src = buildSrc(view, key);
				const playId = `${key}-${Date.now()}`;
				playingKeyRef.current = playId;

				let resolved = false;

				const doResolve = (_reason: string) => {
					if (resolved) {
						return;
					}
					resolved = true;
					// Remove listeners
					a.removeEventListener('ended', onEnded);
					a.removeEventListener('error', onError);
					a.removeEventListener('loadeddata', onLoadedData);
					if (audioCleanupRef.current === cleanupAndResolve) {
						audioCleanupRef.current = null;
					}
					if (playingKeyRef.current === playId) {
						playingKeyRef.current = null;
					}
					resolve();
				};

				// Cleanup function that also resolves the promise (used by stopAudio)
				const cleanupAndResolve = () => {
					doResolve('interrupted');
				};

				const onEnded = () => {
					doResolve('ended');
				};

				const onError = (e: Event) => {
					console.error('[Audio] Error event for:', key, e);
					doResolve('error');
				};

				const onLoadedData = () => {
					// Set currentTime after data is loaded
					if (startTime !== undefined && startTime > 0) {
						a.currentTime = startTime;
					}
				};

				audioCleanupRef.current = cleanupAndResolve;
				a.addEventListener('ended', onEnded);
				a.addEventListener('error', onError);
				a.addEventListener('loadeddata', onLoadedData);

				// Stop current audio and set new source
				a.pause();
				a.src = src;
				// Only set currentTime to 0 here; non-zero startTime is set in loadeddata handler
				a.currentTime = 0;
				setCurrentSrc(src);
				setCurrentView(view);
				setCurrentKey(key);

				// Play directly - modern browsers return a promise
				a.play()
					.then(() => {
						// Playback started
					})
					.catch((err) => {
						if (err instanceof Error && err.name === 'AbortError') {
							// AbortError means audio was interrupted - don't resolve, let stopAudio handle it
							return;
						}
						console.error('[Audio] Play failed for:', key, err);
						doResolve('play-error');
					});
			});
		},
		[],
	);

	// Audio element play/pause event listeners for isPlaying state
	useEffect(() => {
		const a = audioRef.current;
		if (!a) return;

		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);

		a.addEventListener('play', onPlay);
		a.addEventListener('pause', onPause);

		return () => {
			a.removeEventListener('play', onPlay);
			a.removeEventListener('pause', onPause);
		};
	}, []);

	// Sync volume/mute with audio element
	useEffect(() => {
		const a = audioRef.current;
		if (a) {
			a.volume = Math.max(0, Math.min(1, volume / 100));
			a.muted = muted;
		}
	}, [volume, muted]);

	// Run calibration loop
	const runCalibrationLoop = useCallback(
		async (view: PostureView) => {
			// Prevent concurrent loops
			if (isLoopRunningRef.current) {
				return;
			}

			// Generate unique loop ID
			const myLoopId = ++loopIdRef.current;
			isLoopRunningRef.current = true;

			const shouldContinue = () => {
				return loopIdRef.current === myLoopId;
			};

			try {
				while (shouldContinue()) {
					// Play visibility
					setCalibrationState('playing_visibility');
					await playAudioAsync(view, 'visibility');
					if (!shouldContinue()) break;

					// Wait 3 seconds
					setCalibrationState('waiting_after_visibility');
					await new Promise<void>((resolve) => {
						waitResolveRef.current = resolve;
						waitTimerRef.current = setTimeout(() => {
							waitResolveRef.current = null;
							resolve();
						}, WAIT_AFTER_AUDIO_MS);
					});
					if (!shouldContinue()) break;

					// Play frame
					setCalibrationState('playing_frame');
					await playAudioAsync(view, 'frame');
					if (!shouldContinue()) break;

					// Wait 3 seconds
					setCalibrationState('waiting_after_frame');
					await new Promise<void>((resolve) => {
						waitResolveRef.current = resolve;
						waitTimerRef.current = setTimeout(() => {
							waitResolveRef.current = null;
							resolve();
						}, WAIT_AFTER_AUDIO_MS);
					});
					// Loop continues
				}
			} finally {
				if (loopIdRef.current === myLoopId) {
					isLoopRunningRef.current = false;
				}
			}
		},
		[playAudioAsync, setCalibrationState],
	);

	// Run instruction with stabilization
	const runInstruction = useCallback(
		async (view: PostureView, resumePosition = 0) => {
			// Wait for stabilization
			setCalibrationState('stabilizing');
			await new Promise<void>((resolve) => {
				stabilizationResolveRef.current = resolve;
				stabilizationTimerRef.current = setTimeout(() => {
					stabilizationResolveRef.current = null;
					resolve();
				}, STABILIZATION_DELAY_MS);
			});

			// Check if we should continue
			if (calibrationStateRef.current !== 'stabilizing') {
				return;
			}

			// Play instruction
			setCalibrationState('playing_instruction');
			await playAudioAsync(view, 'instruction', resumePosition);

			// Check if completed normally (cast to full type to avoid TS narrowing issue)
			const stateAfterInstruction = calibrationStateRef.current as CalibrationAudioState;
			if (stateAfterInstruction === 'playing_instruction') {
				instructionPositionRef.current = 0;
				hasInstructionToResumeRef.current = false;
				setCalibrationState('idle');
			}
		},
		[playAudioAsync, setCalibrationState],
	);

	// Debounce ref for pose detection to avoid flickering
	const poseDebounceRef = useRef<NodeJS.Timeout | null>(null);
	const lastPoseStateRef = useRef<boolean>(false);

	// Handle pose detection changes with debouncing
	const setPoseDetected = useCallback(
		(detected: boolean) => {
			// Clear any pending debounce
			if (poseDebounceRef.current) {
				clearTimeout(poseDebounceRef.current);
				poseDebounceRef.current = null;
			}

			// If state hasn't changed, ignore
			if (detected === lastPoseStateRef.current) {
				setIsPoseDetectedState(detected);
				return;
			}

			const currentState = calibrationStateRef.current;
			const view = currentViewRef.current;

			if (detected) {
				// Pose detected - check if we should transition to instruction
				const isInCalibration =
					currentState === 'playing_visibility' ||
					currentState === 'waiting_after_visibility' ||
					currentState === 'playing_frame' ||
					currentState === 'waiting_after_frame';

				if (isInCalibration && view) {
					// Debounce pose detection to confirm pose is stable
					poseDebounceRef.current = setTimeout(() => {
						poseDebounceRef.current = null;
						lastPoseStateRef.current = true;
						setIsPoseDetectedState(true);

						// Stop calibration loop and start instruction
						clearTimers();
						stopAudio();

						// Check if we have instruction to resume
						const resumePos =
							hasInstructionToResumeRef.current &&
							instructionViewRef.current === view
								? instructionPositionRef.current
								: 0;
						runInstruction(view, resumePos);
					}, POSE_DEBOUNCE_MS);
				} else {
					// Not in calibration, just update state
					lastPoseStateRef.current = true;
					setIsPoseDetectedState(true);
				}
			} else {
				// Pose lost - handle based on current state
				lastPoseStateRef.current = false;
				setIsPoseDetectedState(false);

				if (currentState === 'playing_instruction') {
					// Save instruction position and pause
					const a = audioRef.current;
					if (a) {
						instructionPositionRef.current = a.currentTime;
						instructionViewRef.current = view;
						hasInstructionToResumeRef.current = true;
						a.pause();
					}
					setCalibrationState('instruction_paused');
					// Play poseLost audio then restart calibration
					if (view) {
						setTimeout(async () => {
							// Play poseLost audio
							const audio = audioRef.current;
							if (audio) {
								setCalibrationState('playing_poseLost');
								audio.src = buildSharedSrc('poseLost');
								audio.currentTime = 0;
								setCurrentSrc(audio.src);
								setCurrentKey('poseLost');
								try {
									await audio.play();
									await new Promise<void>(resolve => {
										const onEnd = () => {
											audio.removeEventListener('ended', onEnd);
											resolve();
										};
										audio.addEventListener('ended', onEnd);
									});
								} catch {
									// Ignore play errors
								}
							}
							runCalibrationLoop(view);
						}, 100);
					}
				} else if (currentState === 'stabilizing') {
					// Cancel stabilization, go back to calibration
					clearTimers();
					if (view) {
						runCalibrationLoop(view);
					}
				}
			}
		},
		[clearTimers, stopAudio, runCalibrationLoop, runInstruction, setCalibrationState],
	);

	// Start calibration for a view
	const startCalibration = useCallback(
		(view: PostureView, isAlreadyAligned?: boolean) => {
			// Clear pose debounce timer
			if (poseDebounceRef.current) {
				clearTimeout(poseDebounceRef.current);
				poseDebounceRef.current = null;
			}
			clearTimers();
			stopAudio();
			setCurrentView(view);
			currentViewRef.current = view;

			// If pose is already detected, skip calibration loop and go directly to instruction
			if (isAlreadyAligned) {
				lastPoseStateRef.current = true;
				setIsPoseDetectedState(true);
				runInstruction(view, 0);
			} else {
				lastPoseStateRef.current = false;
				runCalibrationLoop(view);
			}
		},
		[clearTimers, stopAudio, runCalibrationLoop, runInstruction],
	);

	// Stop calibration completely
	const stopCalibration = useCallback(() => {
		// Clear pose debounce timer
		if (poseDebounceRef.current) {
			clearTimeout(poseDebounceRef.current);
			poseDebounceRef.current = null;
		}
		clearTimers();
		stopAudio();
		setCalibrationState('idle');
	}, [clearTimers, stopAudio, setCalibrationState]);

	// Reset for new view (clears instruction position)
	const resetForNewView = useCallback(
		(view: PostureView) => {
			// Clear pose debounce timer
			if (poseDebounceRef.current) {
				clearTimeout(poseDebounceRef.current);
				poseDebounceRef.current = null;
			}
			lastPoseStateRef.current = false;
			clearTimers();
			stopAudio();
			instructionPositionRef.current = 0;
			instructionViewRef.current = null;
			hasInstructionToResumeRef.current = false;
			setCurrentView(view);
			currentViewRef.current = view;
			setCalibrationState('idle');
			setIsPoseDetectedState(false);
			// Set grace period timestamp to prevent wrongSide from triggering immediately
			viewChangeTimestampRef.current = Date.now();
		},
		[clearTimers, stopAudio, setCalibrationState],
	);

	// Legacy play function for backwards compatibility
	const play = useCallback(
		async (
			view: PostureView,
			key: PostureAudioKey = 'visibility',
			onEnded?: () => void,
		) => {
			await playAudioAsync(view, key);
			onEnded?.();
		},
		[playAudioAsync],
	);

	const stop = useCallback(() => {
		stopAudio();
	}, [stopAudio]);

	const setVolume = useCallback((v: number) => {
		const clamped = Math.max(0, Math.min(100, v));
		setVolumeState(clamped);
		if (v > 0) setMuted(false);
		saveVolume(clamped);
	}, []);

	// Play shared audio (progress, success, poseLost, etc.)
	const playSharedAudioAsync = useCallback(
		(key: SharedAudioKey): Promise<void> => {
			return new Promise((resolve) => {
				const a = audioRef.current;
				if (!a) {
					resolve();
					return;
				}

				if (audioCleanupRef.current) {
					audioCleanupRef.current();
					audioCleanupRef.current = null;
				}

				const src = buildSharedSrc(key);
				const playId = `shared-${key}-${Date.now()}`;
				playingKeyRef.current = playId;

				let resolved = false;

				const doResolve = (reason: string) => {
					if (resolved) return;
					resolved = true;
					a.removeEventListener('ended', onEnded);
					a.removeEventListener('error', onError);
					if (audioCleanupRef.current === cleanupAndResolve) {
						audioCleanupRef.current = null;
					}
					if (playingKeyRef.current === playId) {
						playingKeyRef.current = null;
					}
					resolve();
				};

				const cleanupAndResolve = () => doResolve('interrupted');
				const onEnded = () => doResolve('ended');
				const onError = () => doResolve('error');

				audioCleanupRef.current = cleanupAndResolve;
				a.addEventListener('ended', onEnded);
				a.addEventListener('error', onError);

				a.pause();
				a.src = src;
				a.currentTime = 0;
				setCurrentSrc(src);
				setCurrentKey(key);

				a.play().catch(() => doResolve('play-error'));
			});
		},
		[],
	);

	// Play shared audio with state tracking
	const playShared = useCallback(
		async (key: SharedAudioKey) => {
			const prevState = calibrationStateRef.current;
			if (key === 'poseLost') {
				setCalibrationState('playing_poseLost');
			}
			await playSharedAudioAsync(key);
			// Restore previous state after shared audio
			if (calibrationStateRef.current === 'playing_poseLost') {
				setCalibrationState(prevState);
			}
		},
		[playSharedAudioAsync, setCalibrationState],
	);

	// Track when wrongSide audio last ended (for debounce)
	const lastWrongSideEndRef = useRef<number>(0);
	const WRONG_SIDE_DEBOUNCE_MS = 3000;

	// Track when view changed (grace period before wrongSide can trigger)
	const viewChangeTimestampRef = useRef<number>(0);
	const VIEW_CHANGE_GRACE_MS = 3000; // 3s grace period after view change (covers visibility audio)

	// Play wrong side audio for orientation confusion (with built-in debounce)
	// Handles all views: left/right lateral confusion and front/back facing confusion
	const playWrongSide = useCallback(
		async (view: PostureView) => {
			// Check if calibration hasn't started yet for this view
			// This prevents wrongSide from playing before visibility.mp3
			const currentState = calibrationStateRef.current;
			if (currentState === 'idle') {
				return;
			}

			const now = Date.now();

			// Check grace period after view change - let visibility play first
			const timeSinceViewChange = now - viewChangeTimestampRef.current;
			if (viewChangeTimestampRef.current > 0 && timeSinceViewChange < VIEW_CHANGE_GRACE_MS) {
				return;
			}

			// Check debounce - time since last wrongSide audio ENDED
			const timeSinceLastEnd = now - lastWrongSideEndRef.current;
			if (lastWrongSideEndRef.current > 0 && timeSinceLastEnd < WRONG_SIDE_DEBOUNCE_MS) {
				return;
			}

			// Stop current calibration loop before playing wrongSide
			// This invalidates the loop ID so runCalibrationLoop can start fresh after
			stopAudio();
			clearTimers();
			setCalibrationState('playing_wrongSide');
			await playAudioAsync(view, 'wrongSide');

			// Update end timestamp for debounce
			lastWrongSideEndRef.current = Date.now();

			// Resume calibration after wrong side audio
			if (calibrationStateRef.current === 'playing_wrongSide') {
				runCalibrationLoop(view);
			}
		},
		[playAudioAsync, setCalibrationState, runCalibrationLoop, stopAudio, clearTimers],
	);

	// Play congratulations audio after capture
	const playCongratulations = useCallback(
		async (view: PostureView) => {
			setCalibrationState('playing_congratulations');
			await playAudioAsync(view, 'congratulations');
			setCalibrationState('idle');
		},
		[playAudioAsync, setCalibrationState],
	);

	// Play view title audio during INTRO state (1-indexed: title1 for front, title2 for left, etc.)
	const playViewIntroAudioAsync = useCallback(
		(key: ViewTransitionAudioKey): Promise<void> => {
			return new Promise((resolve) => {
				const a = audioRef.current;
				if (!a) {
					resolve();
					return;
				}

				if (audioCleanupRef.current) {
					audioCleanupRef.current();
					audioCleanupRef.current = null;
				}

				const src = buildViewTransitionSrc(key);
				const playId = `view-intro-${key}-${Date.now()}`;
				playingKeyRef.current = playId;

				let resolved = false;

				const doResolve = (_reason: string) => {
					if (resolved) return;
					resolved = true;
					a.removeEventListener('ended', onEnded);
					a.removeEventListener('error', onError);
					if (audioCleanupRef.current === cleanupAndResolve) {
						audioCleanupRef.current = null;
					}
					if (playingKeyRef.current === playId) {
						playingKeyRef.current = null;
					}
					resolve();
				};

				const cleanupAndResolve = () => doResolve('interrupted');
				const onEnded = () => doResolve('ended');
				const onError = (e: Event) => {
					console.error('[ViewTitle] Error loading audio:', e);
					doResolve('error');
				};

				audioCleanupRef.current = cleanupAndResolve;
				a.addEventListener('ended', onEnded);
				a.addEventListener('error', onError);

				a.pause();
				a.src = src;
				a.currentTime = 0;
				setCurrentSrc(src);
				setCurrentKey(key);

				a.play()
					.then(() => {
						// Playback started
					})
					.catch((err) => {
						console.error('[ViewTitle] Play failed:', key, err);
						doResolve('play-error');
					});
			});
		},
		[],
	);

	// Play view title audio (0-indexed: 0 for front, 1 for left, 2 for right, 3 for back)
	const playViewIntro = useCallback(
		async (viewIndex: number) => {
			const titleMap: Record<number, ViewTransitionAudioKey> = {
				0: 'title1',
				1: 'title2',
				2: 'title3',
				3: 'title4',
			};
			const key = titleMap[viewIndex];
			if (key) {
				setCalibrationState('playing_view_intro');
				await playViewIntroAudioAsync(key);
				setCalibrationState('idle');
			} else {
				console.warn('[ViewTitle] No key found for index:', viewIndex);
			}
		},
		[playViewIntroAudioAsync, setCalibrationState],
	);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			// Clear pose debounce timer
			if (poseDebounceRef.current) {
				clearTimeout(poseDebounceRef.current);
				poseDebounceRef.current = null;
			}
			clearTimers();
			stopAudio();
		};
	}, [clearTimers, stopAudio]);

	const value = useMemo(
		() => ({
			isPlaying,
			muted,
			volume,
			currentView,
			currentKey,
			currentSrc,
			calibrationState,
			isPoseDetected,
			play,
			stop,
			setVolume,
			setMuted,
			startCalibration,
			stopCalibration,
			setPoseDetected,
			resetForNewView,
			playShared,
			playWrongSide,
			playCongratulations,
			playViewIntro,
		}),
		[
			isPlaying,
			muted,
			volume,
			currentView,
			currentKey,
			currentSrc,
			calibrationState,
			isPoseDetected,
			play,
			stop,
			setVolume,
			setMuted,
			startCalibration,
			stopCalibration,
			setPoseDetected,
			resetForNewView,
			playShared,
			playWrongSide,
			playCongratulations,
			playViewIntro,
		],
	);

	return (
		<PostureScreenAudioContext.Provider value={value}>
			{children}
		</PostureScreenAudioContext.Provider>
	);
}

export function UsePostureScreenAudio() {
	return useContext(PostureScreenAudioContext);
}
