/**
 * Device Capability Tests
 *
 * Tests device detection and graceful degradation logic.
 */

import {
	checkDeviceCapability,
	testModelComplexity,
	getFallbackComplexity,
} from '../deviceCapability';
import { getRecommendedModelComplexity, canDeviceRunGHUM } from '@config/mediapipe';

// Mock Worker
class MockWorker {
	private messageHandler: ((event: MessageEvent) => void) | null = null;

	constructor() {}

	addEventListener(type: string, handler: (event: MessageEvent) => void): void {
		if (type === 'message') {
			this.messageHandler = handler;
		}
	}

	removeEventListener(type: string, handler: (event: MessageEvent) => void): void {
		if (type === 'message' && this.messageHandler === handler) {
			this.messageHandler = null;
		}
	}

	postMessage(message: unknown): void {
		setTimeout(() => {
			if (!this.messageHandler) return;

			const msg = message as { type: string; payload?: unknown };

			if (msg.type === 'INIT_BLAZEPOSE') {
				this.messageHandler(
					new MessageEvent('message', {
						data: { type: 'INIT_SUCCESS' },
					})
				);
			} else if (msg.type === 'DETECT_POSE') {
				const mockLandmarks = Array.from({ length: 33 }, (_, i) => ({
					x: Math.random(),
					y: Math.random(),
					z: Math.random() * 0.5 - 0.25,
					visibility: 0.8 + Math.random() * 0.2,
				}));

				this.messageHandler(
					new MessageEvent('message', {
						data: {
							type: 'POSE_RESULT',
							payload: {
								result: {
									landmarks: mockLandmarks,
									worldLandmarks: mockLandmarks,
								},
								duration: 250,
							},
						},
					})
				);
			}
		}, 10);
	}

	terminate(): void {
		this.messageHandler = null;
	}
}

(global as typeof globalThis & { Worker: typeof Worker }).Worker =
	MockWorker as unknown as typeof Worker;

describe('Device Capability', () => {
	describe('Model Complexity Selection', () => {
		it('should select appropriate model complexity', () => {
			const complexity = getRecommendedModelComplexity();

			// Should return 0, 1, or 2
			expect([0, 1, 2]).toContain(complexity);
		});

		it('should detect if device can run GHUM', () => {
			const canRun = canDeviceRunGHUM();

			// Should return boolean
			expect(typeof canRun).toBe('boolean');
		});
	});

	describe('Device Detection', () => {
		const originalUserAgent = navigator.userAgent;

		afterEach(() => {
			// Restore original user agent
			Object.defineProperty(navigator, 'userAgent', {
				value: originalUserAgent,
				configurable: true,
			});
		});

		it('should detect desktop device', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
				configurable: true,
			});

			const complexity = getRecommendedModelComplexity();

			// Desktop should get GHUM (complexity=2)
			// Note: This might vary based on implementation
			expect(complexity).toBeGreaterThanOrEqual(1);
		});

		it('should detect old iOS device and recommend Lite model', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'iPhone OS 12_0',
				configurable: true,
			});

			const complexity = getRecommendedModelComplexity();

			// Old iOS should get Lite (complexity=0)
			expect(complexity).toBe(0);
		});

		it('should detect modern mobile and recommend Full model', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'iPhone OS 15_0',
				configurable: true,
			});

			const complexity = getRecommendedModelComplexity();

			// Modern iOS should get Full or GHUM (complexity=1 or 2)
			expect(complexity).toBeGreaterThanOrEqual(1);
		});

		it('should handle old Android devices', () => {
			Object.defineProperty(navigator, 'userAgent', {
				value: 'Android 8.0',
				configurable: true,
			});

			const complexity = getRecommendedModelComplexity();

			// Old Android should get Lite (complexity=0)
			expect(complexity).toBe(0);
		});
	});

	describe('Capability Testing', () => {
		it('should run device capability check', async () => {
			const capability = await checkDeviceCapability();

			expect(capability).toBeDefined();
			expect(typeof capability.canRunGHUM).toBe('boolean');
			expect([0, 1, 2]).toContain(capability.recommendedComplexity);
		}, 10000);

		it('should test specific model complexity', async () => {
			const duration = await testModelComplexity(1);

			expect(duration).not.toBeNull();
			expect(duration).toBeGreaterThan(0);
		}, 5000);

		it('should handle failed capability test', async () => {
			// Mock worker to fail
			const originalWorker = (global as typeof globalThis & { Worker: typeof Worker }).Worker;

			class FailingWorker extends MockWorker {
				postMessage(message: unknown): void {
					setTimeout(() => {
						if (!this['messageHandler']) return;

						const msg = message as { type: string };
						if (msg.type === 'INIT_BLAZEPOSE') {
							this['messageHandler']!(
								new MessageEvent('message', {
									data: { type: 'ERROR', payload: { error: 'Init failed' } },
								})
							);
						}
					}, 10);
				}
			}

			(global as typeof globalThis & { Worker: typeof Worker }).Worker =
				FailingWorker as unknown as typeof Worker;

			const capability = await checkDeviceCapability();

			// Should fall back to Lite
			expect(capability.canRunGHUM).toBe(false);
			expect(capability.recommendedComplexity).toBe(0);

			// Restore
			(global as typeof globalThis & { Worker: typeof Worker }).Worker = originalWorker;
		}, 5000);
	});

	describe('Fallback Logic', () => {
		it('should provide fallback from GHUM to Full', () => {
			const fallback = getFallbackComplexity(2);
			expect(fallback).toBe(1);
		});

		it('should provide fallback from Full to Lite', () => {
			const fallback = getFallbackComplexity(1);
			expect(fallback).toBe(0);
		});

		it('should return null when already at Lite', () => {
			const fallback = getFallbackComplexity(0);
			expect(fallback).toBeNull();
		});
	});
});
