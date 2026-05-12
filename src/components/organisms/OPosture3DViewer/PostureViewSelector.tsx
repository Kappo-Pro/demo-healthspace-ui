import React from 'react';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './PostureViewSelector.css';

/**
 * Props for PostureViewSelector component
 */
export interface PostureViewSelectorProps {
	/** Current view mode */
	currentView: '2d' | '3d';

	/** Callback when view changes */
	onChange: (view: '2d' | '3d') => void;

	/** Whether 3D view is available (WebGL support) */
	is3DAvailable?: boolean;

	/** Optional additional CSS class */
	className?: string;
}

/**
 * PostureViewSelector - Toggle component for switching between 2D and 3D posture views
 *
 * Features:
 * - Two-option toggle (2D/3D)
 * - Keyboard navigation (Enter, Space)
 * - WebGL detection integration
 * - WCAG 2.1 AA compliant
 * - Smooth transitions
 *
 * @example
 * ```tsx
 * <PostureViewSelector
 *   currentView="2d"
 *   onChange={(view) => }
 *   is3DAvailable={true}
 * />
 * ```
 */
export const PostureViewSelector: React.FC<PostureViewSelectorProps> = ({
	currentView,
	onChange,
	is3DAvailable = true,
	className = '',
}) => {
	const { t } = useTypedTranslation();
	/**
	 * Handle keyboard navigation for view options
	 */
	const handleKeyDown = (e: React.KeyboardEvent, view: '2d' | '3d'): void => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();

			// Don't allow switching to 3D if unavailable
			if (view === '3d' && !is3DAvailable) {
				return;
			}

			onChange(view);
		}
	};

	/**
	 * Handle click on view option
	 */
	const handleClick = (view: '2d' | '3d'): void => {
		// Don't allow switching to 3D if unavailable
		if (view === '3d' && !is3DAvailable) {
			return;
		}

		onChange(view);
	};

	return (
		<div
			className={`posture-view-selector ${className}`.trim()}
			role="radiogroup"
			aria-label={t('Patient.data.postures.viewer3D.postureViewSelector.ariaLabel')}>
			{/* 2D View Option */}
			<button
				role="radio"
				aria-checked={currentView === '2d'}
				onClick={() => handleClick('2d')}
				onKeyDown={e => handleKeyDown(e, '2d')}
				className={`view-option ${currentView === '2d' ? 'active' : ''}`}
				type="button">
				{t('Patient.data.postures.viewer3D.postureViewSelector.2dView')}
			</button>

			{/* 3D View Option */}
			<button
				role="radio"
				aria-checked={currentView === '3d'}
				{...(!is3DAvailable && { 'aria-disabled': true })}
				disabled={!is3DAvailable}
				onClick={() => handleClick('3d')}
				onKeyDown={e => handleKeyDown(e, '3d')}
				className={`view-option ${currentView === '3d' ? 'active' : ''} ${
					!is3DAvailable ? 'disabled' : ''
				}`}
				title={!is3DAvailable ? t('Patient.data.postures.viewer3D.postureViewSelector.3dViewDisabledTitle') : undefined}
				type="button">
				{t('Patient.data.postures.viewer3D.postureViewSelector.3dView')}
			</button>
		</div>
	);
};
