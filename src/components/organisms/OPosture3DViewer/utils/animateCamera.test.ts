import { animateCamera } from './animateCamera';
import * as THREE from 'three';

describe('animateCamera', () => {
	let mockCamera: THREE.Camera;
	let mockControls: { target: THREE.Vector3; update: jest.Mock };

	beforeEach(() => {
		jest.clearAllMocks();

		// Create mock camera
		mockCamera = new THREE.PerspectiveCamera();
		mockCamera.position.set(0, 0, 5);

		// Create mock controls
		mockControls = {
			target: new THREE.Vector3(0, 0, 0),
			update: jest.fn(),
		};
	});

	describe('Return Value', () => {
		it('should return a cancel function', () => {
			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			const cancel = animateCamera({
				camera: mockCamera,
				controls: mockControls,
				targetPosition,
				targetLookAt,
				duration: 300,
			});

			expect(typeof cancel).toBe('function');
		});
	});

	describe('Function Signature', () => {
		it('should accept all required parameters', () => {
			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			expect(() => {
				animateCamera({
					camera: mockCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
				});
			}).not.toThrow();
		});

		it('should accept optional duration parameter', () => {
			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			expect(() => {
				animateCamera({
					camera: mockCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
					duration: 500,
				});
			}).not.toThrow();
		});

		it('should accept optional onComplete callback', () => {
			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];
			const onComplete = jest.fn();

			expect(() => {
				animateCamera({
					camera: mockCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
					onComplete,
				});
			}).not.toThrow();
		});
	});

	describe('requestAnimationFrame Integration', () => {
		it('should call requestAnimationFrame', () => {
			const rafSpy = jest.spyOn(global, 'requestAnimationFrame');

			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			animateCamera({
				camera: mockCamera,
				controls: mockControls,
				targetPosition,
				targetLookAt,
				duration: 300,
			});

			expect(rafSpy).toHaveBeenCalled();

			rafSpy.mockRestore();
		});

		it('should call cancelAnimationFrame when cancel function called', () => {
			const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame');

			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			const cancel = animateCamera({
				camera: mockCamera,
				controls: mockControls,
				targetPosition,
				targetLookAt,
				duration: 300,
			});

			cancel();

			expect(cancelSpy).toHaveBeenCalled();

			cancelSpy.mockRestore();
		});
	});

	describe('Edge Cases', () => {
		it('should handle zero duration', () => {
			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			expect(() => {
				animateCamera({
					camera: mockCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
					duration: 0,
				});
			}).not.toThrow();
		});

		it('should handle negative coordinates', () => {
			const targetPosition: [number, number, number] = [-3, -2, -1];
			const targetLookAt: [number, number, number] = [-1, -1, -1];

			expect(() => {
				animateCamera({
					camera: mockCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
					duration: 300,
				});
			}).not.toThrow();
		});

		it('should handle same start and end positions', () => {
			const targetPosition: [number, number, number] = [0, 0, 5];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			expect(() => {
				animateCamera({
					camera: mockCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
					duration: 300,
				});
			}).not.toThrow();
		});
	});

	describe('Type Safety', () => {
		it('should accept THREE.Camera types', () => {
			const perspectiveCamera = new THREE.PerspectiveCamera();
			const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1);

			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			expect(() => {
				animateCamera({
					camera: perspectiveCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
				});
			}).not.toThrow();

			expect(() => {
				animateCamera({
					camera: orthographicCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
				});
			}).not.toThrow();
		});

		it('should accept tuple position format', () => {
			const targetPosition: [number, number, number] = [3, 0, 0];
			const targetLookAt: [number, number, number] = [0, 0, 0];

			expect(() => {
				animateCamera({
					camera: mockCamera,
					controls: mockControls,
					targetPosition,
					targetLookAt,
				});
			}).not.toThrow();
		});
	});
});
