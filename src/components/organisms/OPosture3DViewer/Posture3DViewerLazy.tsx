import React, { Suspense, useState, useEffect } from 'react';
import { Posture3DViewerProps } from './Posture3DViewer';
import { LoadingFallback } from './LoadingFallback';
import { ErrorBoundary } from './ErrorBoundary';
import './Posture3DViewerLazy.css';

// Lazy load the heavy 3D viewer component
const Posture3DViewer = React.lazy(() => import('./Posture3DViewer'));

export const Posture3DViewerLazy: React.FC<Posture3DViewerProps> = props => {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Track when component is fully loaded
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 100);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className="posture-3d-viewer-lazy"
			role="status"
			aria-live="polite"
			aria-busy={isLoading}
			aria-label={isLoading ? 'Loading 3D viewer' : '3D viewer loaded'}>
			<ErrorBoundary>
				<Suspense fallback={<LoadingFallback />}>
					<Posture3DViewer {...props} />
				</Suspense>
			</ErrorBoundary>
		</div>
	);
};

export default Posture3DViewerLazy;
