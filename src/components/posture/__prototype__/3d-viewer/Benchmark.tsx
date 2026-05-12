 
/**
 * 3D Visualization Benchmark Harness
 *
 * PROTOTYPE ONLY - Story 1.8 Technology Spike
 *
 * Purpose: Performance testing and comparison framework
 * - Tests 3D Three.js renderer vs 2D Canvas
 * - Measures FPS, memory, battery drain
 * - Collects device-specific metrics
 * - Generates ADR recommendation data
 *
 * @module posture/__prototype__/3d-viewer/Benchmark
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
	Card,
	Button,
	Table,
	Alert,
	Space,
	Statistic,
	Row,
	Col,
	Tag} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import Posture3DViewer, { PerformanceMetrics } from './Posture3DViewer';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

/**
 * Benchmark results for ADR decision-making
 */
interface BenchmarkResults {
	deviceInfo: {
		userAgent: string;
		platform: string;
		cores: number;
		memory: number;
		devicePixelRatio: number;
	};
	metrics: {
		avgFps: number;
		minFps: number;
		maxFps: number;
		memoryUsageMB: number;
		renderTime: number;
	};
	timestamp: string;
	duration: number;
	frameCount: number;
}

/**
 * Mock pose data for benchmarking
 */
const generateMockLandmarks = (): NormalizedLandmark[] => {
	return Array.from({ length: 33 }, () => ({
		x: Math.random(),
		y: Math.random(),
		z: Math.random() * 0.5,
		visibility: 0.9 + Math.random() * 0.1,
	}));
};

/**
 * Benchmark component for 3D visualization performance testing
 */
const Benchmark: React.FC = () => {
	const [isRunning, setIsRunning] = useState(false);
	const [landmarks, setLandmarks] = useState<NormalizedLandmark[]>(
		generateMockLandmarks(),
	);
	const [metricsHistory, setMetricsHistory] = useState<PerformanceMetrics[]>(
		[],
	);
	const [results, setResults] = useState<BenchmarkResults | null>(null);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const startTimeRef = useRef<number>(0);
	const frameCountRef = useRef<number>(0);

	/**
	 * Start benchmark
	 */
	const handleStart = useCallback(() => {
		setIsRunning(true);
		setMetricsHistory([]);
		setResults(null);
		startTimeRef.current = Date.now();
		frameCountRef.current = 0;

		// Update pose data at 30 FPS to simulate live feed
		intervalRef.current = setInterval(() => {
			setLandmarks(generateMockLandmarks());
			frameCountRef.current++;
		}, 1000 / 30);
	}, []);

	/**
	 * Stop benchmark and calculate results
	 */
	const handleStop = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}
		setIsRunning(false);

		if (metricsHistory.length === 0) return;

		const duration = (Date.now() - startTimeRef.current) / 1000;
		const fps = metricsHistory.map(m => m.fps);
		const memory = metricsHistory.map(m => m.memoryUsageMB);
		const renderTimes = metricsHistory.map(m => m.renderTime);

		const benchmarkResults: BenchmarkResults = {
			deviceInfo: {
				userAgent: navigator.userAgent,
				platform: navigator.platform,
				cores: navigator.hardwareConcurrency || 0,
				memory: (navigator as { deviceMemory?: number }).deviceMemory || 0,
				devicePixelRatio: window.devicePixelRatio,
			},
			metrics: {
				avgFps: fps.reduce((a, b) => a + b, 0) / fps.length,
				minFps: Math.min(...fps),
				maxFps: Math.max(...fps),
				memoryUsageMB: memory[memory.length - 1],
				renderTime: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
			},
			timestamp: new Date().toISOString(),
			duration,
			frameCount: frameCountRef.current,
		};

		setResults(benchmarkResults);
	}, [metricsHistory]);

	/**
	 * Cleanup on unmount
	 */
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	/**
	 * Collect metrics from 3D viewer
	 */
	const handleMetricsUpdate = useCallback((metrics: PerformanceMetrics) => {
		setMetricsHistory(prev => [...prev, metrics]);
	}, []);

	/**
	 * Download results as JSON
	 */
	const handleDownload = useCallback(() => {
		if (!results) return;

		const blob = new Blob([JSON.stringify(results, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `3d-viz-benchmark-${Date.now()}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}, [results]);

	/**
	 * Get performance rating
	 */
	const getPerformanceRating = (
		fps: number,
	): { text: string; color: string } => {
		if (fps >= 55) return { text: 'Excellent', color: "var(--color-success)" };
		if (fps >= 45) return { text: 'Good', color: "var(--color-warning-dark)" };
		return { text: 'Poor', color: "var(--color-error)" };
	};

	return (
		<div style={{ padding: 24 }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<Card title="3D Visualization Performance Benchmark">
					<Alert
						message="Technology Spike - Story 1.8"
						description="This benchmark measures Three.js performance for ADR-008 decision-making. Run for 30+ seconds for reliable data."
						type="info"
						showIcon
						style={{ marginBottom: 24 }}
					/>

					<Space>
						<Button
							type="primary"
							icon={<UntitledIcon name="play-circle" />}
							onClick={handleStart}
							disabled={isRunning}>
							Start Benchmark
						</Button>
						<Button
							danger
							icon={<UntitledIcon name="stop-circle" />}
							onClick={handleStop}
							disabled={!isRunning}>
							Stop & Analyze
						</Button>
						{results && (
							<Button icon={<UntitledIcon name="download" />} onClick={handleDownload}>
								Download Results
							</Button>
						)}
					</Space>
				</Card>

				{isRunning && (
					<Card title="Live 3D Viewer">
						<Posture3DViewer
							landmarks={landmarks}
							width={800}
							height={600}
							onMetricsUpdate={handleMetricsUpdate}
						/>
					</Card>
				)}

				{results && (
					<>
						<Card title="Device Information">
							<Row gutter={16}>
								<Col span={8}>
									<Statistic
										title="Platform"
										value={results.deviceInfo.platform}
									/>
								</Col>
								<Col span={8}>
									<Statistic
										title="CPU Cores"
										value={results.deviceInfo.cores}
									/>
								</Col>
								<Col span={8}>
									<Statistic
										title="Memory (GB)"
										value={results.deviceInfo.memory || 'Unknown'}
									/>
								</Col>
							</Row>
						</Card>

						<Card title="Performance Results">
							<Row gutter={16}>
								<Col span={6}>
									<Statistic
										title="Average FPS"
										value={results.metrics.avgFps.toFixed(1)}
										suffix={
											<Tag
												color={
													getPerformanceRating(results.metrics.avgFps).color
												}>
												{getPerformanceRating(results.metrics.avgFps).text}
											</Tag>
										}
									/>
								</Col>
								<Col span={6}>
									<Statistic
										title="Min FPS"
										value={results.metrics.minFps.toFixed(1)}
									/>
								</Col>
								<Col span={6}>
									<Statistic
										title="Max FPS"
										value={results.metrics.maxFps.toFixed(1)}
									/>
								</Col>
								<Col span={6}>
									<Statistic
										title="Memory (MB)"
										value={results.metrics.memoryUsageMB.toFixed(1)}
									/>
								</Col>
							</Row>
							<Row gutter={16} style={{ marginTop: 16 }}>
								<Col span={8}>
									<Statistic
										title="Avg Render Time (ms)"
										value={results.metrics.renderTime.toFixed(2)}
									/>
								</Col>
								<Col span={8}>
									<Statistic
										title="Duration (s)"
										value={results.duration.toFixed(1)}
									/>
								</Col>
								<Col span={8}>
									<Statistic
										title="Frames Rendered"
										value={results.frameCount}
									/>
								</Col>
							</Row>
						</Card>

						<Card title="ADR Recommendation">
							<Alert
								message={
									results.metrics.avgFps >= 55
										? 'Proceed to production'
										: results.metrics.avgFps >= 45
											? 'Acceptable for desktop, needs mobile optimization'
											: 'Not recommended - poor performance'
								}
								description={`Based on ${results.frameCount} frames over ${results.duration.toFixed(1)}s. Target: 60 FPS for smooth experience.`}
								type={
									results.metrics.avgFps >= 55
										? 'success'
										: results.metrics.avgFps >= 45
											? 'warning'
											: 'error'
								}
								showIcon
							/>
						</Card>
					</>
				)}

				{metricsHistory.length > 0 && (
					<Card title="Real-time Metrics">
						<Table
							dataSource={metricsHistory
								.slice(-10)
								.map((m, i) => ({ ...m, key: i }))}
							columns={[
								{ title: 'FPS', dataIndex: 'fps', render: v => v.toFixed(1) },
								{
									title: 'Render (ms)',
									dataIndex: 'renderTime',
									render: v => v.toFixed(2),
								},
								{
									title: 'Memory (MB)',
									dataIndex: 'memoryUsageMB',
									render: v => v.toFixed(1),
								},
								{
									title: 'Draw Calls',
									dataIndex: 'drawCalls',
								},
							]}
							pagination={false}
							size="small"
						/>
					</Card>
				)}
			</Space>
		</div>
	);
};

export default Benchmark;
