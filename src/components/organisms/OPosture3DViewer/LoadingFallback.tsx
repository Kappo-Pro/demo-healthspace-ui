import React from 'react';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

export const LoadingFallback: React.FC = () => {
	const { t } = useTypedTranslation();

	return (
		<div
			className="posture-3d-loading"
			role="status"
			aria-live="polite"
			aria-label={t('Patient.data.postures.viewer3D.loadingFallback.ariaLabel')}>
			<div className="posture-3d-loading-spinner" aria-hidden="true" />
			<p className="posture-3d-loading-text">{t('Patient.data.postures.viewer3D.loadingFallback.loadingText')}</p>
		</div>
	);
};

export default LoadingFallback;
