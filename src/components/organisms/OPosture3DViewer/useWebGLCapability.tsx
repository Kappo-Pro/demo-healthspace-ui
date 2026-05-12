import { useContext } from 'react';
import { WebGLCapabilityContext } from './WebGLCapabilityProvider';

/**
 * Hook return type
 */
export interface UseWebGLCapabilityReturn {
	/** Whether WebGL is supported */
	isSupported: boolean;

	/** Whether WebGL check is in progress */
	isChecking: boolean;

	/** Error message if detection failed */
	error: string | null;
}

/**
 * useWebGLCapability - Custom hook for accessing WebGL capability detection
 *
 * Must be used within WebGLCapabilityProvider context.
 *
 * Features:
 * - Automatic WebGL detection
 * - Error handling
 * - Loading states
 * - Context-based sharing
 *
 * @throws {Error} If used outside WebGLCapabilityProvider
 *
 * @example
 * ```tsx
 * const { t } = useTranslation();
 * const { isSupported, isChecking } = useWebGLCapability();
 *
 * if (isChecking) {
 *   return <div>{t('Patient.data.postures.webGLCapability.checking')}</div>;
 * }
 *
 * return (
 *   <button disabled={!isSupported}>
 *     {isSupported ? 'View in 3D' : '3D Not Available'}
 *   </button>
 * );
 * ```
 */
export const useWebGLCapability = (): UseWebGLCapabilityReturn => {
	const context = useContext(WebGLCapabilityContext);

	if (context === undefined) {
		throw new Error(
			'useWebGLCapability must be used within WebGLCapabilityProvider',
		);
	}

	return context;
};
