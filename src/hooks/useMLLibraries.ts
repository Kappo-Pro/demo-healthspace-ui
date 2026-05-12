/**
 * useMLLibraries Hook
 *
 * React hook for lazy loading ML/AI libraries with loading states
 * Provides a clean API for components that need MediaPipe or TensorFlow
 *
 * Usage:
 * ```typescript
 * const { libraries, loading, error, loadMediaPipe, loadTensorFlow } = useMLLibraries();
 *
 * useEffect(() => {
 *   loadMediaPipe(); // Loads when component mounts
 * }, []);
 * ```
 */

import { useState, useCallback } from 'react';
import {
	preloadMediaPipeLibraries,
	preloadTensorFlowLibraries,
} from '@utils/MLLibraryLoader';

export interface MLLibraries {
	mediaPipeTasks?: typeof import('@mediapipe/tasks-vision');
	mediaPipeCamera?: typeof import('@mediapipe/camera_utils');
	mediaPipeDrawing?: typeof import('@mediapipe/drawing_utils');
	tensorFlow?: typeof import('@tensorflow/tfjs');
	handpose?: typeof import('@tensorflow-models/handpose');
	fingerpose?: typeof import('fingerpose');
	tfWasm?: typeof import('@tensorflow/tfjs-backend-wasm');
}

export interface UseMLLibrariesReturn {
	libraries: MLLibraries;
	loading: boolean;
	error: Error | null;
	loadMediaPipe: () => Promise<void>;
	loadTensorFlow: () => Promise<void>;
	loadAll: () => Promise<void>;
}

/**
 * Hook for lazy loading ML/AI libraries
 *
 * @returns {UseMLLibrariesReturn} Object containing libraries, loading state, and load functions
 *
 * @example
 * // Load MediaPipe for posture analysis
 * const { libraries, loading, loadMediaPipe } = useMLLibraries();
 * useEffect(() => { loadMediaPipe(); }, []);
 *
 * @example
 * // Load TensorFlow for gesture recognition
 * const { libraries, loading, loadTensorFlow } = useMLLibraries();
 * useEffect(() => { loadTensorFlow(); }, []);
 */
export function useMLLibraries(): UseMLLibrariesReturn {
	const [libraries, setLibraries] = useState<MLLibraries>({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	/**
	 * Load MediaPipe libraries for posture/ROM analysis
	 */
	const loadMediaPipe = useCallback(async () => {
		if (libraries.mediaPipeTasks) {
			// Already loaded
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const [tasks, camera, drawing] = await preloadMediaPipeLibraries();

			setLibraries(prev => ({
				...prev,
				mediaPipeTasks: tasks,
				mediaPipeCamera: camera,
				mediaPipeDrawing: drawing,
			}));
		} catch (err) {
			const error =
				err instanceof Error
					? err
					: new Error('Failed to load MediaPipe libraries');
			setError(error);
		} finally {
			setLoading(false);
		}
	}, [libraries.mediaPipeTasks]);

	/**
	 * Load TensorFlow libraries for gesture recognition
	 */
	const loadTensorFlow = useCallback(async () => {
		if (libraries.tensorFlow) {
			// Already loaded
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const [tf, handposeLib, fingerposeLib, tfWasm] =
				await preloadTensorFlowLibraries();

			// Set TensorFlow backend to WASM
			await tf.setBackend('wasm');
			await tf.ready();

			setLibraries(prev => ({
				...prev,
				tensorFlow: tf,
				handpose: handposeLib,
				fingerpose: fingerposeLib,
				tfWasm: tfWasm,
			}));
		} catch (err) {
			const error =
				err instanceof Error
					? err
					: new Error('Failed to load TensorFlow libraries');
			setError(error);
		} finally {
			setLoading(false);
		}
	}, [libraries.tensorFlow]);

	/**
	 * Load all ML libraries (MediaPipe + TensorFlow)
	 * Use this if both features are needed
	 */
	const loadAll = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			await Promise.all([loadMediaPipe(), loadTensorFlow()]);
		} catch (err) {
			const error =
				err instanceof Error ? err : new Error('Failed to load ML libraries');
			setError(error);
		} finally {
			setLoading(false);
		}
	}, [loadMediaPipe, loadTensorFlow]);

	return {
		libraries,
		loading,
		error,
		loadMediaPipe,
		loadTensorFlow,
		loadAll,
	};
}

/**
 * Simple hook that returns loading state while libraries load
 * Useful for showing spinners during ML library initialization
 */
export function useMLLibraryStatus() {
	const [isLoadingML, setIsLoadingML] = useState(false);

	const startMLLoading = useCallback(() => {
		setIsLoadingML(true);
	}, []);

	const stopMLLoading = useCallback(() => {
		setIsLoadingML(false);
	}, []);

	return {
		isLoadingML,
		startMLLoading,
		stopMLLoading,
	};
}
