import React, { useEffect, useRef } from 'react';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './CameraPresets.css';

/**
 * Camera preset type
 */
export type CameraPresetName = 'front' | 'side' | 'top' | 'diagonal';

/**
 * Props for CameraPresets component
 */
export interface CameraPresetsProps {
	/** Currently active preset */
	activePreset: CameraPresetName;

	/** Callback when preset changes */
	onPresetChange: (preset: CameraPresetName) => void;

	/** Whether presets are disabled (e.g., when 3D unavailable) */
	disabled?: boolean;
}

/**
 * Camera preset configuration
 */
interface PresetConfig {
	name: CameraPresetName;
	labelKey: string;
	shortcut: string;
}

const PRESETS: PresetConfig[] = [
	{ name: 'front', labelKey: 'frontView', shortcut: '1' },
	{ name: 'side', labelKey: 'sideView', shortcut: '2' },
	{ name: 'top', labelKey: 'topView', shortcut: '3' },
	{ name: 'diagonal', labelKey: 'diagonalView', shortcut: '4' },
];

/**
 * CameraPresets - Preset camera view buttons with keyboard shortcuts
 *
 * Features:
 * - 4 preset camera views (Front, Side, Top, Diagonal)
 * - Keyboard shortcuts (1, 2, 3, 4)
 * - Visual feedback for active preset
 * - WCAG 2.1 AA compliant
 * - Disabled state support
 *
 * @example
 * ```tsx
 * <CameraPresets
 *   activePreset="front"
 *   onPresetChange={(preset) => animateToPreset(preset)}
 *   disabled={false}
 * />
 * ```
 */
export const CameraPresets: React.FC<CameraPresetsProps> = ({
	activePreset,
	onPresetChange,
	disabled = false,
}) => {
	const { t } = useTypedTranslation();
	const toolbarRef = useRef<HTMLDivElement>(null);

	/**
	 * Handle keyboard shortcuts for camera presets (global)
	 */
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent): void => {
			// Don't handle shortcuts when disabled
			if (disabled) {
				return;
			}

			// Don't handle if user is typing in an input field
			const target = e.target as HTMLElement;
			if (
				target.tagName === 'INPUT' ||
				target.tagName === 'TEXTAREA' ||
				target.isContentEditable
			) {
				return;
			}

			// Map keys to presets
			const keyPresetMap: Record<string, CameraPresetName> = {
				'1': 'front',
				'2': 'side',
				'3': 'top',
				'4': 'diagonal',
			};

			const preset = keyPresetMap[e.key];

			if (preset) {
				e.preventDefault();
				onPresetChange(preset);
			}
		};

		// Attach to document for global keyboard shortcuts
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [disabled, onPresetChange]);

	/**
	 * Handle preset button click
	 */
	const handlePresetClick = (preset: CameraPresetName): void => {
		if (!disabled) {
			onPresetChange(preset);
		}
	};

	return (
		<div
			ref={toolbarRef}
			className="camera-presets"
			role="toolbar"
			aria-label={t('Patient.data.postures.viewer3D.cameraPresets.ariaLabel')}
			tabIndex={0}>
			{PRESETS.map(preset => {
				// Map labelKey to actual translation key
				let label: string;
				switch (preset.labelKey) {
					case 'frontView':
						label = t('Patient.data.postures.viewer3D.cameraPresets.frontView');
						break;
					case 'sideView':
						label = t('Patient.data.postures.viewer3D.cameraPresets.sideView');
						break;
					case 'topView':
						label = t('Patient.data.postures.viewer3D.cameraPresets.topView');
						break;
					case 'diagonalView':
						label = t(
							'Patient.data.postures.viewer3D.cameraPresets.diagonalView',
						);
						break;
					default:
						label = preset.labelKey;
				}
				return (
					<button
						key={preset.name}
						type="button"
						className={`preset-button ${activePreset === preset.name ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
						onClick={() => handlePresetClick(preset.name)}
						disabled={disabled}
						aria-pressed={activePreset === preset.name}
						aria-label={t(
							'Patient.data.postures.viewer3D.cameraPresets.buttonAriaLabel',
							{
								label,
								shortcut: preset.shortcut,
							},
						)}
						aria-disabled={disabled}>
						<span className="preset-label">{label}</span>
						<span className="preset-shortcut">{preset.shortcut}</span>
					</button>
				);
			})}
		</div>
	);
};
