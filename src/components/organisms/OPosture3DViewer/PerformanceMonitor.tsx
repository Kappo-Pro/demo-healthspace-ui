import React, { useState, useEffect, useRef } from 'react';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './PerformanceMonitor.css';

interface PerformanceMonitorProps {
	visible?: boolean;
}

interface PerformanceMemory {
	usedJSHeapSize: number;
	jsHeapSizeLimit: number;
	totalJSHeapSize: number;
}

declare global {
	interface Performance {
		memory?: PerformanceMemory;
	}
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
	visible = false,
}) => {
	const { t } = useTypedTranslation();
	const [fps, setFps] = useState(60);
	const [memory, setMemory] = useState(0);

	const frameCountRef = useRef(0);
	const lastTimeRef = useRef(performance.now());
	const rafIdRef = useRef<number | null>(null);
	const intervalIdRef = useRef<number | null>(null);

	useEffect(() => {
		if (!visible) return;

		// FPS tracking via requestAnimationFrame
		const trackFrame = () => {
			frameCountRef.current++;
			rafIdRef.current = requestAnimationFrame(trackFrame);
		};

		// Start frame tracking
		rafIdRef.current = requestAnimationFrame(trackFrame);

		// Calculate FPS every second
		intervalIdRef.current = window.setInterval(() => {
			const currentTime = performance.now();
			const elapsed = (currentTime - lastTimeRef.current) / 1000;

			if (elapsed > 0) {
				const currentFps = frameCountRef.current / elapsed;
				setFps(currentFps);
			}

			// Reset for next measurement
			frameCountRef.current = 0;
			lastTimeRef.current = currentTime;

			// Update memory if available
			if (performance.memory) {
				const usedMemoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
				setMemory(usedMemoryMB);
			} else {
				setMemory(0);
			}
		}, 1000);

		// Cleanup
		return () => {
			if (rafIdRef.current !== null) {
				cancelAnimationFrame(rafIdRef.current);
			}
			if (intervalIdRef.current !== null) {
				clearInterval(intervalIdRef.current);
			}
		};
	}, [visible]);

	if (!visible) return null;

	const lowFps = fps < 30;
	const highMemory = memory > 500;

	return (
		<div
			className="performance-monitor"
			role="region"
			aria-label={t('Patient.data.postures.viewer3D.performanceMonitor.ariaLabel')}
			aria-live="polite"
			aria-atomic="false">
			<div
				className="metric"
				aria-label={t('Patient.data.postures.viewer3D.performanceMonitor.fpsAriaLabel', {
					value: fps.toFixed(0),
					warning: lowFps ? t('Patient.data.postures.viewer3D.performanceMonitor.lowFpsWarning') : '',
				})}>
				{t('Patient.data.postures.viewer3D.performanceMonitor.fps', { value: fps.toFixed(0) })}{' '}
				{lowFps && (
					<span aria-label={t('Patient.data.postures.viewer3D.performanceMonitor.warningIconAriaLabel', { type: 'Low frame rate' })}>
						⚠️
					</span>
				)}
			</div>
			<div
				className="metric"
				aria-label={t('Patient.data.postures.viewer3D.performanceMonitor.memoryAriaLabel', {
					value: memory.toFixed(0),
					warning: highMemory ? t('Patient.data.postures.viewer3D.performanceMonitor.highMemoryWarning') : '',
				})}>
				{t('Patient.data.postures.viewer3D.performanceMonitor.memory', { value: memory.toFixed(0) })}{' '}
				{highMemory && (
					<span aria-label={t('Patient.data.postures.viewer3D.performanceMonitor.warningIconAriaLabel', { type: 'High memory usage' })}>
						⚠️
					</span>
				)}
			</div>
		</div>
	);
};
