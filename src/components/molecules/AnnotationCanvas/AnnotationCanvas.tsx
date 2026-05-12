/**
 * AnnotationCanvas Molecule Component
 *
 * Canvas-based drawing component for real-time annotation during consultations.
 * Supports pen, highlighter, eraser tools with stylus detection.
 *
 * @module components/molecules/AnnotationCanvas
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button, Space, ColorPicker, Slider, Tooltip } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	setCurrentTool,
	setCurrentColor,
	setCurrentStrokeWidth,
	addAnnotationStroke,
	clearAnnotations,
	selectCurrentTool,
	selectCurrentColor,
	selectCurrentStrokeWidth} from '@stores/posture/postureAnalytics/consultationSlice';
import type { AnnotationTool, AnnotationStroke } from '@types/consultation';

/**
 * AnnotationCanvas component props
 */
export interface AnnotationCanvasProps {
	/** Image identifier (front/side/back view) */
	imageId: string;

	/** Background image URL */
	imageUrl: string;

	/** Canvas width */
	width?: number;

	/** Canvas height */
	height?: number;

	/** Read-only mode (no drawing allowed) */
	readOnly?: boolean;

	/** Show toolbar */
	showToolbar?: boolean;

	/** Participant ID (for attribution) */
	participantId: string;

	/** Callback when annotation added */
	onAnnotationAdded?: (stroke: AnnotationStroke) => void;

	/** Callback when annotations cleared */
	onAnnotationsCleared?: () => void;

	/** ARIA label */
	ariaLabel?: string;
}

/**
 * Drawing point
 */
interface DrawingPoint {
	x: number;
	y: number;
}

/**
 * AnnotationCanvas Component
 */
export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
	imageId,
	imageUrl,
	width = 800,
	height = 600,
	readOnly = false,
	showToolbar = true,
	participantId,
	onAnnotationAdded,
	onAnnotationsCleared,
	ariaLabel = 'Annotation canvas for posture analysis',
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const currentTool = useTypedSelector(selectCurrentTool);
	const currentColor = useTypedSelector(selectCurrentColor);
	const currentStrokeWidth = useTypedSelector(selectCurrentStrokeWidth);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
	const [isStylusDetected, setIsStylusDetected] = useState(false);

	/**
	 * Load background image
	 */
	useEffect(() => {
		const bgCanvas = backgroundCanvasRef.current;
		if (!bgCanvas) return;

		const ctx = bgCanvas.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0, width, height);
		};
		img.onerror = () => {
		};
		img.src = imageUrl;
	}, [imageUrl, width, height]);

	/**
	 * Get normalized coordinates (0-1)
	 */
	const getNormalizedCoordinates = useCallback(
		(clientX: number, clientY: number): DrawingPoint | null => {
			const canvas = canvasRef.current;
			if (!canvas) return null;

			const rect = canvas.getBoundingClientRect();
			const x = (clientX - rect.left) / rect.width;
			const y = (clientY - rect.top) / rect.height;

			return { x, y };
		},
		[],
	);

	/**
	 * Get absolute coordinates from normalized
	 */
	const getAbsoluteCoordinates = useCallback(
		(normalized: DrawingPoint): DrawingPoint => {
			const canvas = canvasRef.current;
			if (!canvas) return normalized;

			return {
				x: normalized.x * width,
				y: normalized.y * height,
			};
		},
		[width, height],
	);

	/**
	 * Draw stroke on canvas
	 */
	const drawStroke = useCallback(
		(points: DrawingPoint[], tool: AnnotationTool, color: string, strokeWidth: number) => {
			const canvas = canvasRef.current;
			if (!canvas || points.length < 2) return;

			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			ctx.save();

			// Configure tool-specific styles
			switch (tool) {
				case 'pen':
					ctx.globalCompositeOperation = 'source-over';
					ctx.strokeStyle = color;
					ctx.lineWidth = strokeWidth;
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					ctx.globalAlpha = 1;
					break;

				case 'highlighter':
					ctx.globalCompositeOperation = 'multiply';
					ctx.strokeStyle = color;
					ctx.lineWidth = strokeWidth * 3;
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					ctx.globalAlpha = 0.3;
					break;

				case 'eraser':
					ctx.globalCompositeOperation = 'destination-out';
					// eslint-disable-next-line vitalflow/no-hardcoded-colors
					ctx.strokeStyle = 'rgba(0, 0, 0, 1)'; // Required by Canvas API for eraser operation
					ctx.lineWidth = strokeWidth * 2;
					ctx.lineCap = 'round';
					ctx.lineJoin = 'round';
					break;

				case 'arrow':
				case 'circle':
				case 'text':
					// TODO: Implement shape tools
					break;
			}

			// Draw path
			ctx.beginPath();
			const firstPoint = getAbsoluteCoordinates(points[0]);
			ctx.moveTo(firstPoint.x, firstPoint.y);

			for (let i = 1; i < points.length; i++) {
				const point = getAbsoluteCoordinates(points[i]);
				ctx.lineTo(point.x, point.y);
			}

			ctx.stroke();
			ctx.restore();
		},
		[getAbsoluteCoordinates],
	);

	/**
	 * Start drawing
	 */
	const handlePointerDown = useCallback(
		(e: React.PointerEvent<HTMLCanvasElement>) => {
			if (readOnly) return;

			// Detect stylus
			if (e.pointerType === 'pen') {
				setIsStylusDetected(true);
			}

			const point = getNormalizedCoordinates(e.clientX, e.clientY);
			if (!point) return;

			setIsDrawing(true);
			setCurrentStroke([point]);
		},
		[readOnly, getNormalizedCoordinates],
	);

	/**
	 * Continue drawing
	 */
	const handlePointerMove = useCallback(
		(e: React.PointerEvent<HTMLCanvasElement>) => {
			if (!isDrawing || readOnly) return;

			const point = getNormalizedCoordinates(e.clientX, e.clientY);
			if (!point) return;

			const newStroke = [...currentStroke, point];
			setCurrentStroke(newStroke);

			// Draw current stroke
			drawStroke(newStroke, currentTool, currentColor, currentStrokeWidth);
		},
		[
			isDrawing,
			readOnly,
			currentStroke,
			currentTool,
			currentColor,
			currentStrokeWidth,
			getNormalizedCoordinates,
			drawStroke,
		],
	);

	/**
	 * End drawing
	 */
	const handlePointerUp = useCallback(() => {
		if (!isDrawing || currentStroke.length < 2) {
			setIsDrawing(false);
			setCurrentStroke([]);
			return;
		}

		// Create annotation stroke
		const stroke: AnnotationStroke = {
			tool: currentTool,
			color: currentColor,
			width: currentStrokeWidth,
			opacity: currentTool === 'highlighter' ? 0.3 : 1,
			points: currentStroke,
			timestamp: Date.now(),
			participantId,
		};

		// Dispatch to Redux
		dispatch(addAnnotationStroke({ imageId, stroke }));

		// Callback
		onAnnotationAdded?.(stroke);

		setIsDrawing(false);
		setCurrentStroke([]);
	}, [
		isDrawing,
		currentStroke,
		currentTool,
		currentColor,
		currentStrokeWidth,
		imageId,
		participantId,
		dispatch,
		onAnnotationAdded,
	]);

	/**
	 * Handle tool change
	 */
	const handleToolChange = useCallback(
		(tool: AnnotationTool) => {
			dispatch(setCurrentTool(tool));
		},
		[dispatch],
	);

	/**
	 * Handle color change
	 */
	const handleColorChange = useCallback(
		(color: Color) => {
			dispatch(setCurrentColor(color.toHexString()));
		},
		[dispatch],
	);

	/**
	 * Handle stroke width change
	 */
	const handleStrokeWidthChange = useCallback(
		(value: number) => {
			dispatch(setCurrentStrokeWidth(value));
		},
		[dispatch],
	);

	/**
	 * Handle clear all
	 */
	const handleClear = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, width, height);
		dispatch(clearAnnotations(imageId));
		onAnnotationsCleared?.();
	}, [width, height, imageId, dispatch, onAnnotationsCleared]);

	/**
	 * Tool button configuration
	 */
	const tools: Array<{ tool: AnnotationTool; icon: React.ReactNode; label: string }> = [
		{ tool: 'pen', icon: <UntitledIcon name="edit" size={16} />, label: t('annotation.tools.pen') },
		{ tool: 'highlighter', icon: <UntitledIcon name="edit" size={16} />, label: t('annotation.tools.highlighter') },
		{ tool: 'eraser', icon: <UntitledIcon name="delete" size={16} />, label: t('annotation.tools.eraser') },
		{ tool: 'arrow', icon: <UntitledIcon name="arrowUp" size={16} />, label: t('annotation.tools.arrow') },
		{ tool: 'circle', icon: <UntitledIcon name="close" size={16} />, label: t('annotation.tools.circle') },
		{ tool: 'text', icon: <UntitledIcon name="fontSize" size={16} />, label: t('annotation.tools.text') },
	];

	return (
		<div
			className="annotation-canvas-container"
			style={{ position: 'relative', display: 'inline-block' }}
		>
			{/* Toolbar */}
			{showToolbar && !readOnly && (
				<div
					className="annotation-toolbar"
					style={{
						marginBottom: 'var(--spacing-4)',
						padding: 'var(--spacing-2)',
						background: 'var(--surface-elevated)',
						borderRadius: 'var(--radius-md)',
						border: '1px solid var(--border-default)',
					}}
					role="toolbar"
					aria-label={t('annotation.toolbar.label')}
				>
					<Space direction="vertical" size="small" style={{ width: '100%' }}>
						{/* Tool buttons */}
						<Space wrap>
							{tools.map(({ tool, icon, label }) => (
								<Tooltip key={tool} title={label}>
									<Button
										type={currentTool === tool ? 'primary' : 'default'}
										icon={icon}
										onClick={() => handleToolChange(tool)}
										aria-label={label}
										aria-pressed={currentTool === tool}
									/>
								</Tooltip>
							))}
						</Space>

						{/* Color picker */}
						<Space>
							<span style={{ fontSize: 'var(--font-size-sm)' }}>
								{t('annotation.toolbar.colorLabel')}
							</span>
							<ColorPicker
								value={currentColor}
								onChange={handleColorChange}
								showText
								presets={[
									{
										label: 'Common',
										colors: [
											// Fallback colors required by ColorPicker API when CSS vars unavailable
											/* eslint-disable vitalflow/no-hardcoded-colors */
											getComputedStyle(document.documentElement).getPropertyValue(
												'--color-error-500',
											) || '#FF4D4F', // Error red
											getComputedStyle(document.documentElement).getPropertyValue(
												'--color-warning-500',
											) || '#FF7A45', // Warning orange
											getComputedStyle(document.documentElement).getPropertyValue(
												'--color-warning-400',
											) || '#FFA940', // Warning yellow-orange
											getComputedStyle(document.documentElement).getPropertyValue(
												'--color-success-500',
											) || '#52C41A', // Success green
											getComputedStyle(document.documentElement).getPropertyValue(
												'--color-info-500',
											) || '#1890FF', // Info blue
											getComputedStyle(document.documentElement).getPropertyValue(
												'--brand-primary',
											) || '#722ED1', // Brand purple
											/* eslint-enable vitalflow/no-hardcoded-colors */
										],
									},
								]}
								aria-label={t('annotation.toolbar.colorPicker.label')}
							/>
						</Space>

						{/* Stroke width */}
						<Space>
							<span style={{ fontSize: 'var(--font-size-sm)' }}>
								{t('annotation.toolbar.strokeWidth.label')}:
							</span>
							<Slider
								min={1}
								max={20}
								value={currentStrokeWidth}
								onChange={handleStrokeWidthChange}
								style={{ width: 120 }}
								aria-label={t('annotation.toolbar.strokeWidth.label')}
							/>
							<span style={{ fontSize: 'var(--font-size-sm)', minWidth: 30 }}>
								{currentStrokeWidth}px
							</span>
						</Space>

						{/* Actions */}
						<Space>
							<Button
								icon={<UntitledIcon name="undo" size={16} />}
								disabled
								aria-label={t('annotation.actions.undoLastStroke')}
							>
								{t('annotation.actions.undo')}
							</Button>
							<Button
								icon={<UntitledIcon name="clear" size={16} />}
								onClick={handleClear}
								danger
								aria-label={t('annotation.actions.clearAllAnnotations')}
							>
								{t('annotation.actions.clearAll')}
							</Button>
						</Space>

						{/* Stylus detection indicator */}
						{isStylusDetected && (
							<div
								style={{
									fontSize: 'var(--font-size-xs)',
									color: 'var(--text-tertiary)',
								}}
								role="status"
							>
								✓ Stylus detected
							</div>
						)}
					</Space>
				</div>
			)}

			{/* Canvas stack */}
			<div style={{ position: 'relative', width, height }}>
				{/* Background canvas (image) */}
				<canvas
					ref={backgroundCanvasRef}
					width={width}
					height={height}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						border: '1px solid var(--border-default)',
						borderRadius: 'var(--radius-md)',
					}}
					aria-hidden="true"
				/>

				{/* Annotation canvas (drawing layer) */}
				<canvas
					ref={canvasRef}
					width={width}
					height={height}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerLeave={handlePointerUp}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						cursor: readOnly ? 'default' : 'crosshair',
						touchAction: 'none', // Prevent scrolling during drawing
					}}
					role="img"
					aria-label={ariaLabel}
					tabIndex={readOnly ? -1 : 0}
				/>

				{/* Read-only overlay */}
				{readOnly && (
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							// eslint-disable-next-line vitalflow/no-hardcoded-colors
							background: 'rgba(0, 0, 0, 0.05)', // Required for read-only overlay
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							pointerEvents: 'none',
						}}
						aria-hidden="true"
					>
						<div
							style={{
								background: 'var(--surface-elevated)',
								padding: 'var(--spacing-sm)',
								borderRadius: 'var(--radius-sm)',
								fontSize: 'var(--font-size-sm)',
								color: 'var(--text-secondary)',
							}}
						>
							View Only
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
