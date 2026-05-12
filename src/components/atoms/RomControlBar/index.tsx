/**
 * RomControlBar - Floating control bar for ROM/Posture scan modals
 *
 * Design: Figma node 1402-14731
 * - Circular buttons with cream background
 * - Gray icons
 * - Pill-shaped playback control with slider
 * - Floats top-right over content
 */

import React, { useEffect, useCallback } from 'react';
import { Slider } from 'antd';
import {
	MdFullscreen,
	MdFullscreenExit,
	MdHelpOutline,
	MdOutlinePauseCircle,
	MdOutlinePlayCircle,
	MdOutlineSwitchCamera,
	MdRefresh,
	MdVolumeOff,
	MdVolumeUp,
} from 'react-icons/md';
import { TbWindowMaximize, TbWindowMinimize } from 'react-icons/tb';
import './style.css';

export interface RomControlBarProps {
	/** Play/Pause state */
	isPaused?: boolean;
	onTogglePause?: () => void;

	/** Volume control (0-100) */
	volume?: number;
	onVolumeChange?: (value: number) => void;

	/** Mute control */
	isMuted?: boolean;
	onToggleMute?: () => void;

	/** Help/Tutorial */
	onHelp?: () => void;

	/** Switch camera */
	onSwitchCamera?: () => void;

	/** Fullscreen toggle */
	isFullscreen?: boolean;
	onToggleFullscreen?: () => void;

	/** Video size mode */
	isSwitchMode?: boolean;
	onToggleSwitchMode?: () => void;

	/** Refresh/Retry */
	onRefresh?: () => void;

	/** Close modal */
	onClose?: () => void;

	/** Hide specific controls */
	hideVolume?: boolean;
	hideHelp?: boolean;
	hideSwitchCamera?: boolean;
	hideRefresh?: boolean;
	hideSwitchMode?: boolean;
	hideFullscreen?: boolean;

	/** Position */
	position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

	/** Custom className */
	className?: string;
}

export const RomControlBar: React.FC<RomControlBarProps> = ({
	isPaused = false,
	onTogglePause,
	volume = 100,
	onVolumeChange,
	isMuted = false,
	onToggleMute,
	onHelp,
	onSwitchCamera,
	isFullscreen = false,
	onToggleFullscreen,
	isSwitchMode = false,
	onToggleSwitchMode,
	onRefresh,
	onClose,
	hideVolume = false,
	hideHelp = false,
	hideSwitchCamera = false,
	hideRefresh = false,
	hideSwitchMode = false,
	hideFullscreen = false,
	position = 'top-right',
	className = '',
}) => {
	// Keyboard shortcut: M key toggles mute
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			// Ignore if user is typing in an input field
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
				return;
			}

			if ((e.key === 'm' || e.key === 'M') && onToggleMute && !hideVolume) {
				e.preventDefault();
				onToggleMute();
			}
		},
		[onToggleMute, hideVolume]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className={`rom-control-bar rom-control-bar--${position} ${className}`}>
			{/* Play/Pause Button */}
			{onTogglePause && (
				<button
					className="rom-control-btn"
					onClick={onTogglePause}
					title={isPaused ? 'Play' : 'Pause'}
					aria-label={isPaused ? 'Play' : 'Pause'}>
					{isPaused ? (
						<MdOutlinePlayCircle size={22} />
					) : (
						<MdOutlinePauseCircle size={22} />
					)}
				</button>
			)}

			{/* Volume Control - Pill shaped */}
			{!hideVolume && onVolumeChange && (
				<div className="rom-control-volume">
					<div
						onClick={onToggleMute}
						style={{ cursor: onToggleMute ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
						role={onToggleMute ? 'button' : undefined}
						tabIndex={onToggleMute ? 0 : undefined}
						title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
						onKeyDown={onToggleMute ? (e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								onToggleMute();
							}
						} : undefined}
						aria-label={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
						{isMuted ? <MdVolumeOff size={22} /> : <MdVolumeUp size={22} />}
					</div>
					<Slider
						min={0}
						max={100}
						value={isMuted ? 0 : (volume ?? 50)}
						onChange={onVolumeChange}
						className="rom-control-volume-slider"
						tooltip={{ formatter: null }}
						keyboard={false}
					/>
				</div>
			)}

			{/* Help Button */}
			{!hideHelp && onHelp && (
				<button
					className="rom-control-btn"
					onClick={onHelp}
					title="Help"
					aria-label="Help">
					<MdHelpOutline size={22} />
				</button>
			)}

			{/* Switch Camera */}
			{!hideSwitchCamera && onSwitchCamera && (
				<button
					className="rom-control-btn"
					onClick={onSwitchCamera}
					title="Switch Camera"
					aria-label="Switch Camera">
					<MdOutlineSwitchCamera size={22} />
				</button>
			)}

			{/* Refresh */}
			{!hideRefresh && onRefresh && (
				<button
					className="rom-control-btn"
					onClick={onRefresh}
					title="Refresh"
					aria-label="Refresh">
					<MdRefresh size={22} />
				</button>
			)}

			{/* Switch Mode (Video size) */}
			{!hideSwitchMode && onToggleSwitchMode && (
				<button
					className="rom-control-btn"
					onClick={onToggleSwitchMode}
					title={isSwitchMode ? 'Minimize Video' : 'Maximize Video'}
					aria-label={isSwitchMode ? 'Minimize Video' : 'Maximize Video'}>
					{isSwitchMode ? (
						<TbWindowMaximize size={22} />
					) : (
						<TbWindowMinimize size={22} />
					)}
				</button>
			)}

			{/* Fullscreen */}
			{!hideFullscreen && onToggleFullscreen && (
				<button
					className="rom-control-btn"
					onClick={onToggleFullscreen}
					title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
					aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
					{isFullscreen ? (
						<MdFullscreenExit size={22} />
					) : (
						<MdFullscreen size={22} />
					)}
				</button>
			)}
		</div>
	);
};

export default RomControlBar;
