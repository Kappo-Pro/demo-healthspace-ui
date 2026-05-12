/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import i18n from 'i18next';

/**
 * WebGL capability context value
 */
export interface WebGLCapabilityContextValue {
	/** Whether WebGL is supported */
	isSupported: boolean;

	/** Whether WebGL check is in progress */
	isChecking: boolean;

	/** Error message if detection failed */
	error: string | null;
}

/**
 * Context for sharing WebGL capability across components
 */
export const WebGLCapabilityContext = createContext<
	WebGLCapabilityContextValue | undefined
>(undefined);

/**
 * Props for WebGLCapabilityProvider
 */
export interface WebGLCapabilityProviderProps {
	/** Child components */
	children: ReactNode;
}

/**
 * Detect WebGL support in the browser
 * @returns true if WebGL is supported, false otherwise
 */
const detectWebGLSupport = (): boolean => {
	try {
		const canvas = document.createElement('canvas');
		const gl =
			canvas.getContext('webgl') ||
			canvas.getContext('experimental-webgl') ||
			canvas.getContext('webgl2');

		if (!gl) {
			return false;
		}

		// Additional check: can we actually use it?
		if (typeof (gl as WebGLRenderingContext).getParameter !== 'function') {
			return false;
		}

		return true;
	} catch (error) {
		return false;
	}
};

/**
 * WebGLCapabilityProvider - Context provider for WebGL capability detection
 *
 * Detects WebGL support once on mount and shares the result with all children
 * via React Context. This prevents multiple expensive detection checks.
 *
 * Features:
 * - Single detection on mount
 * - Shared context across component tree
 * - Error handling
 * - Loading states
 *
 * @example
 * ```tsx
 * <WebGLCapabilityProvider>
 *   <PostureVisualization {...props} />
 * </WebGLCapabilityProvider>
 * ```
 */
export const WebGLCapabilityProvider: React.FC<
	WebGLCapabilityProviderProps
> = ({ children }) => {
	const [isSupported, setIsSupported] = useState<boolean>(false);
	const [isChecking, setIsChecking] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Detect WebGL support
		try {
			const supported = detectWebGLSupport();
			setIsSupported(supported);

			if (!supported) {
				setError(i18n.t('Patient.data.postures.viewer3D.webGLCapability.notSupported'));
			}
		} catch (err) {
			setIsSupported(false);
			setError(
				err instanceof Error ? err.message : i18n.t('Patient.data.postures.viewer3D.webGLCapability.unknownError'),
			);
		} finally {
			setIsChecking(false);
		}
	}, []);

	const value: WebGLCapabilityContextValue = {
		isSupported,
		isChecking,
		error,
	};

	return (
		<WebGLCapabilityContext.Provider value={value}>
			{children}
		</WebGLCapabilityContext.Provider>
	);
};
