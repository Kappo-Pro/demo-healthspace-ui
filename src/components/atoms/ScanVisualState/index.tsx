import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import BorderGlow from '../BorderGlow';
import DashedBox from '../DashedBox';
import { FlickeringGrid } from '../FlickeringGrid';
import StateOverlay from '../StateOverlay';
import './style.css';

export type ScanState = 'title' | 'idle' | 'error' | 'active' | 'success' | 'scanning' | 'calibrating';

interface ScanVisualStateProps extends PropsWithChildren {
	/** Current scan state determining visual feedback */
	state: ScanState;
	/** Whether to show border glow (default: true) */
	showBorderGlow?: boolean;
	/** Whether to show overlay (default: true) */
	showOverlay?: boolean;
	/** Whether to show flickering grid (default: true) */
	showGrid?: boolean;
	/** Border glow speed multiplier (default: 2) */
	glowSpeed?: number;
	/** Border radius in pixels (default: 12) */
	borderRadius?: number;
	/** Overlay opacity (default: 0.1) */
	overlayOpacity?: number;
	/** Content/video opacity to let background show through (default: 0.8) */
	contentOpacity?: number;
	/** Flickering grid opacity (default: 0.15) */
	gridOpacity?: number;
	/** Transition duration in ms (default: 400) */
	transitionDuration?: number;
	/** Custom z-index for content (default: 1) */
	zIndex?: number;
	/** Additional className */
	className?: string;
	/** Additional inline styles */
	style?: React.CSSProperties;
	/** Slot for captions - renders above all overlays (z-index: 120) */
	captionsSlot?: React.ReactNode;
	/** Slot for title content - renders above overlay but below captions (z-index: 80) */
	titleSlot?: React.ReactNode;
	/** Upload progress percentage (0-100) for success state */
	uploadProgress?: number;
	/** Custom success title (uses translation if not provided) */
	successTitle?: string;
}

/**
 * Unified visual state controller for scan modals.
 * Manages background color, overlay, and border glow with smooth transitions.
 *
 * States:
 * - title: Dark purple overlay with glow (instruction audio playing)
 * - idle: Vignette effect - radial transparent center (waiting for user)
 * - calibrating: Shows alignment box with grid and scan animation (user needs to position)
 * - error: Red tint, error glow (alignment failed)
 * - active: Brand tint, brand glow (countdown/processing)
 * - success: Green tint, success glow (completion)
 * - scanning: Brand tint with lighter purples, faster flickering grid (readysetgo countdown)
 *
 * @example
 * // Basic usage
 * <ScanVisualState state={isError ? 'error' : isAligned ? 'success' : 'idle'}>
 *   <video ... />
 * </ScanVisualState>
 *
 * // Custom options
 * <ScanVisualState
 *   state="scanning"
 *   showBorderGlow={true}
 *   overlayOpacity={0.15}
 *   transitionDuration={300}
 * >
 *   {children}
 * </ScanVisualState>
 */
function ScanVisualState({
	state,
	children,
	showBorderGlow = true,
	showOverlay = true,
	showGrid = true,
	glowSpeed = 2,
	borderRadius = 12,
	overlayOpacity = 0.1,
	contentOpacity = 0.8,
	gridOpacity = 0.15,
	transitionDuration = 400,
	zIndex = 1,
	className = '',
	style = {},
	captionsSlot,
	titleSlot,
	uploadProgress,
	successTitle,
}: ScanVisualStateProps) {
	const { t } = useTranslation();
	const isActive = !['title', 'idle', 'calibrating'].includes(state);
	const isScanning = state === 'scanning';
	const isCalibrating = state === 'calibrating';
	const isTitle = state === 'title';
	const isIdle = state === 'idle';
	const isSuccess = state === 'success';

	// Map scan state to variant
	const variantMap = {
		title: 'title',
		idle: 'idle',
		calibrating: 'calibrating',
		error: 'error',
		active: 'brand',
		success: 'success',
		scanning: 'scanning',
	} as const;

	// Map scan state to grid color (CSS variables)
	const gridColorMap = {
		title: 'var(--brand-primary)',
		idle: 'var(--brand-primary)',
		calibrating: 'var(--color-white)',
		error: 'var(--color-error-500)',
		active: 'var(--brand-primary)',
		success: 'var(--color-success-500)',
		scanning: 'var(--color-purple-400)',
	} as const;

	const variant = variantMap[state];
	const gridColor = gridColorMap[state];

	// Scanning state has faster flickering
	const flickerChance = isScanning ? 0.25 : 0.1;

	// Grid opacity based on state - fade out during calibrating and title
	const stateGridOpacity = {
		title: 0, // Hidden during title slides
		idle: gridOpacity * 0.5, // Subtle during idle
		calibrating: 0, // Hide during calibrating
		error: gridOpacity * 0.5,
		active: gridOpacity,
		success: gridOpacity,
		scanning: gridOpacity * 1.5,
	}[state];

	return (
		<div
			className={`scan-visual-state scan-visual-state--${state} ${className}`}
			style={{
				...style,
				zIndex,
				'--scan-transition': `${transitionDuration}ms`,
				'--content-opacity': isActive ? contentOpacity : 1,
			} as React.CSSProperties}
		>
			{/* Background layer with color transition */}
			<div className="scan-visual-state__background" aria-hidden="true" />

			{/* Border glow - title/idle uses slower speed */}
			{showBorderGlow && (
				<BorderGlow
					variant={isCalibrating ? 'error' : isIdle ? 'idle' : isTitle ? 'idle' : variant}
					visible={true}
					speed={isTitle || isIdle ? 0.5 : glowSpeed}
					borderRadius={borderRadius}
					zIndex={110}
				/>
			)}

			{/* Content - no z-index to avoid stacking context issues */}
			<div className="scan-visual-state__content">
				{children}
			</div>

			{/* Flickering grid overlay - state-aware color, speed, and opacity */}
			{showGrid && stateGridOpacity > 0 && (
				<div className="scan-visual-state__grid" aria-hidden="true">
					<FlickeringGrid
						squareSize={4}
						gridGap={6}
						color={gridColor}
						maxOpacity={stateGridOpacity}
						flickerChance={flickerChance}
					/>
				</div>
			)}

			{/* State overlay - above content for title/success (video under overlay), above for others */}
			{/* idle uses vignette effect instead of solid overlay */}
			{showOverlay && !isIdle && (
				<StateOverlay
					variant={isCalibrating ? 'error' : variant}
					visible={true}
					opacity={isTitle || state === 'success' ? 0.8 : state === 'calibrating' ? 0.3 : overlayOpacity}
					transitionDuration={transitionDuration}
					zIndex={50}
				/>
			)}

			{/* Title slot - renders above overlay but below captions */}
			{/* Also used for built-in success state content */}
			{(titleSlot || isSuccess) && (
				<div className="scan-visual-state__title">
					{titleSlot}
					{isSuccess && !titleSlot && (
						<div className="scan-visual-state__success">
							<h1 className="scan-visual-state__success-title">
								{successTitle || t('common.postureScan.result.scanComplete')}
							</h1>
							{uploadProgress !== undefined && uploadProgress > 0 && (
								<div className="scan-visual-state__upload">
									<div className="scan-visual-state__upload-label">
										{t('common.postureScan.result.uploading')} {uploadProgress.toFixed(0)}%
									</div>
									<div className="scan-visual-state__upload-bar">
										<div
											className="scan-visual-state__upload-progress"
											style={{ width: `${uploadProgress}%` }}
										/>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* Vignette overlay for idle state - transparent center */}
			{isIdle && (
				<div className="scan-visual-state__vignette" aria-hidden="true" />
			)}

			{/* Calibrating state - alignment box with grid and scan line */}
			{isCalibrating && (
				<DashedBox
					width={40}
					height={90}
					borderRadius={borderRadius}
					strokeColor="var(--color-white)"
					fillColor="var(--color-black-alpha-30)"
					borderWidth={2}
					dashLength={8}
					gapLength={6}
					animationDuration={2}
					animated={true}
					zIndex={60}
					showGrid={true}
					gridSize={32}
					gridColor="var(--color-white)"
					gridOpacity={0.4}
				/>
			)}

			{/* Captions slot - renders above all overlays */}
			{captionsSlot && (
				<div className="scan-visual-state__captions">
					{captionsSlot}
				</div>
			)}
		</div>
	);
}

export default ScanVisualState;
