import * as THREE from 'three';

/**
 * Options for camera animation
 */
export interface CameraAnimationOptions {
	/** THREE.js camera to animate */
	camera: THREE.Camera;

	/** OrbitControls instance */
	controls: {
		target: THREE.Vector3;
		update: () => void;
	};

	/** Target camera position [x, y, z] */
	targetPosition: [number, number, number];

	/** Target lookAt position [x, y, z] */
	targetLookAt: [number, number, number];

	/** Animation duration in milliseconds (default: 400) */
	duration?: number;

	/** Callback when animation completes */
	onComplete?: () => void;
}

/**
 * Ease-in-out cubic easing function
 * @param t - Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Animate camera position and lookAt target smoothly over time
 *
 * Uses requestAnimationFrame for smooth 60fps animation and
 * ease-in-out cubic easing for natural movement.
 *
 * @param options - Animation configuration
 * @returns Cancel function to stop animation
 *
 * @example
 * ```ts
 * const cancel = animateCamera({
 *   camera: myCamera,
 *   controls: myControls,
 *   targetPosition: [3, 0, 0],
 *   targetLookAt: [0, 0, 0],
 *   duration: 300,
 *   onComplete: () =>  * });
 *
 * // Cancel animation if needed
 * cancel();
 * ```
 */
export function animateCamera(options: CameraAnimationOptions): () => void {
	const {
		camera,
		controls,
		targetPosition,
		targetLookAt,
		duration = 400,
		onComplete,
	} = options;

	// Store initial positions
	const startPosition = new THREE.Vector3().copy(camera.position);
	const startLookAt = new THREE.Vector3().copy(controls.target);

	// Create target vectors
	const endPosition = new THREE.Vector3(...targetPosition);
	const endLookAt = new THREE.Vector3(...targetLookAt);

	let animationFrameId: number | null = null;
	let startTime: number | null = null;
	let cancelled = false;

	/**
	 * Animation frame update function
	 */
	const animate = (currentTime: number): void => {
		if (cancelled) {
			return;
		}

		// Initialize start time on first frame
		if (startTime === null) {
			startTime = currentTime;
		}

		// Calculate progress (0 to 1)
		const elapsed = currentTime - startTime;
		const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1;

		// Apply easing
		const easedProgress = easeInOutCubic(progress);

		// Interpolate camera position
		camera.position.lerpVectors(startPosition, endPosition, easedProgress);

		// Interpolate controls target (lookAt)
		controls.target.lerpVectors(startLookAt, endLookAt, easedProgress);

		// Update controls
		controls.update();

		// Continue animation or complete
		if (progress < 1) {
			animationFrameId = requestAnimationFrame(animate);
		} else {
			// Ensure final values are exact
			camera.position.copy(endPosition);
			controls.target.copy(endLookAt);
			controls.update();

			// Call completion callback
			if (onComplete) {
				onComplete();
			}
		}
	};

	// Start animation
	animationFrameId = requestAnimationFrame(animate);

	/**
	 * Cancel function to stop animation
	 */
	return (): void => {
		cancelled = true;

		if (animationFrameId !== null) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	};
}
