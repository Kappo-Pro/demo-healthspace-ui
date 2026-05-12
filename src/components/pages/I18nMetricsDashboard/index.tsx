/**
 * I18n Metrics Dashboard - Development Tool
 *
 * Real-time performance monitoring dashboard for i18n translation system.
 * Shows load times, cache hit rates, and performance trends.
 *
 * Usage:
 * - Add route to admin panel: `/admin/i18n-metrics`
 * - Development only (not for production)
 *
 * @see Story S13 (TRANSLATION-001)
 */

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Alert, Table, Badge } from 'antd';
import {
	PerformanceMonitor,
	type MetricsSummary,
	type PerformanceAlert,
	AlertLevel} from '../../../utils/i18n/performanceMonitor';
import { UntitledIcon } from '@atoms/Icon';

/**
 * I18n Metrics Dashboard Component
 */
const I18nMetricsDashboard: React.FC = () => {
	const [summary, setSummary] = useState<MetricsSummary>(
		PerformanceMonitor.getSummary(),
	);
	const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

	useEffect(() => {
		// Subscribe to performance alerts
		const unsubscribe = PerformanceMonitor.onAlert(alert => {
			setAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep last 10 alerts
		});

		// Update summary every 2 seconds
		const interval = setInterval(() => {
			setSummary(PerformanceMonitor.getSummary());
		}, 2000);

		return () => {
			unsubscribe();
			clearInterval(interval);
		};
	}, []);

	// Get performance status
	const getPerformanceStatus = () => {
		const config = PerformanceMonitor.getConfig();
		if (summary.averageLoadTime < config.slowLoadThreshold * 0.5) {
			return { status: 'success', text: 'Excellent' };
		} else if (summary.averageLoadTime < config.slowLoadThreshold) {
			return { status: 'warning', text: 'Good' };
		}
		return { status: 'error', text: 'Poor' };
	};

	const getCacheStatus = () => {
		if (summary.cacheHitRate >= 0.8) {
			return { status: 'success', text: 'Excellent' };
		} else if (summary.cacheHitRate >= 0.5) {
			return { status: 'warning', text: 'Moderate' };
		}
		return { status: 'error', text: 'Poor' };
	};

	const performanceStatus = getPerformanceStatus();
	const cacheStatus = getCacheStatus();

	// Prepare table data for recent samples
	const recentSamples = summary.samples
		.slice(-20)
		.reverse()
		.map((metric, index) => ({
			key: index,
			timestamp: new Date(metric.timestamp).toLocaleTimeString(),
			loadTime: metric.totalLoadTime.toFixed(1),
			cache: metric.cacheHit ? 'HIT' : 'MISS',
			strapi: metric.strapiRequestTime?.toFixed(1) || '-',
			language: metric.language,
			namespace: metric.namespace,
		}));

	const columns = [
		{
			title: 'Time',
			dataIndex: 'timestamp',
			key: 'timestamp',
			width: 120,
		},
		{
			title: 'Load Time (ms)',
			dataIndex: 'loadTime',
			key: 'loadTime',
			width: 120,
			render: (value: string) => {
				const numValue = parseFloat(value);
				const config = PerformanceMonitor.getConfig();
				const color =
					numValue < config.slowLoadThreshold * 0.5
						? 'success'
						: numValue < config.slowLoadThreshold
							? 'warning'
							: 'error';
				return <Badge status={color} text={value} />;
			},
		},
		{
			title: 'Cache',
			dataIndex: 'cache',
			key: 'cache',
			width: 100,
			render: (value: string) => (
				<Badge status={value === 'HIT' ? 'success' : 'default'} text={value} />
			),
		},
		{
			title: 'Strapi (ms)',
			dataIndex: 'strapi',
			key: 'strapi',
			width: 120,
		},
		{
			title: 'Language',
			dataIndex: 'language',
			key: 'language',
			width: 100,
		},
		{
			title: 'Namespace',
			dataIndex: 'namespace',
			key: 'namespace',
			width: 120,
		},
	];

	return (
		<div style={{ padding: 'var(--spacing-6)' }}>
			<h1>i18n Performance Metrics Dashboard</h1>
			<p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--spacing-6)' }}>
				Real-time monitoring of translation system performance. Development tool
				only.
			</p>

			{/* Degradation Alert */}
			{summary.degradationDetected && (
				<Alert
					message="Performance Degradation Detected"
					description="Multiple consecutive slow loads detected. Check Strapi backend health and network connectivity."
					type="error"
					showIcon
					icon={<UntitledIcon name="warning" size={16} />}
					style={{ marginBottom: 'var(--spacing-6)' }}
				/>
			)}

			{/* Key Metrics */}
			<Row gutter={16} style={{ marginBottom: 'var(--spacing-6)' }}>
				<Col span={6}>
					<Card>
						<Statistic
							title="Average Load Time"
							value={summary.averageLoadTime.toFixed(1)}
							suffix="ms"
							prefix={<UntitledIcon name="clock" size={20} />}
							valueStyle={{
								color:
									performanceStatus.status === 'success'
										? 'var(--color-success-600)'
										: performanceStatus.status === 'warning'
											? 'var(--color-warning-500)'
											: 'var(--color-error-600)',
							}}
						/>
						<div
							style={{
								marginTop: 'var(--spacing-2)',
								fontSize: 'var(--font-size-xs)',
								color: 'var(--color-gray-500)',
							}}>
							Status: {performanceStatus.text}
						</div>
					</Card>
				</Col>

				<Col span={6}>
					<Card>
						<Statistic
							title="Cache Hit Rate"
							value={(summary.cacheHitRate * 100).toFixed(1)}
							suffix="%"
							prefix={<UntitledIcon name="checkCircle" size={20} />}
							valueStyle={{
								color:
									cacheStatus.status === 'success'
										? 'var(--color-success-600)'
										: cacheStatus.status === 'warning'
											? 'var(--color-warning-500)'
											: 'var(--color-error-600)',
							}}
						/>
						<div
							style={{
								marginTop: 'var(--spacing-2)',
								fontSize: 'var(--font-size-xs)',
								color: 'var(--color-gray-500)',
							}}>
							Status: {cacheStatus.text}
						</div>
					</Card>
				</Col>

				<Col span={6}>
					<Card>
						<Statistic
							title="Slow Loads"
							value={summary.slowLoadCount}
							suffix={`/ ${summary.totalSamples}`}
							prefix={<UntitledIcon name="warning" size={20} />}
							valueStyle={{
								color:
									summary.slowLoadCount > 0
										? 'var(--color-warning-500)'
										: 'var(--color-success-600)',
							}}
						/>
						<div
							style={{
								marginTop: 'var(--spacing-2)',
								fontSize: 'var(--font-size-xs)',
								color: 'var(--color-gray-500)',
							}}>
							Threshold: {PerformanceMonitor.getConfig().slowLoadThreshold}ms
						</div>
					</Card>
				</Col>

				<Col span={6}>
					<Card>
						<Statistic
							title="Strapi Failures"
							value={summary.strapiFailureCount}
							suffix={`/ ${summary.totalSamples}`}
							prefix={<UntitledIcon name="lightning" size={20} />}
							valueStyle={{
								color:
									summary.strapiFailureCount > 0
										? 'var(--color-error-600)'
										: 'var(--color-success-600)',
							}}
						/>
						<div
							style={{
								marginTop: 'var(--spacing-2)',
								fontSize: 'var(--font-size-xs)',
								color: 'var(--color-gray-500)',
							}}>
							Backend availability
						</div>
					</Card>
				</Col>
			</Row>

			{/* Additional Stats */}
			<Row gutter={16} style={{ marginBottom: 'var(--spacing-6)' }}>
				<Col span={12}>
					<Card title="Load Time Range" size="small">
						<Row>
							<Col span={8}>
								<Statistic
									title="Min"
									value={summary.minLoadTime.toFixed(1)}
									suffix="ms"
									valueStyle={{ fontSize: 'var(--font-size-base)' }}
								/>
							</Col>
							<Col span={8}>
								<Statistic
									title="Max"
									value={summary.maxLoadTime.toFixed(1)}
									suffix="ms"
									valueStyle={{ fontSize: 'var(--font-size-base)' }}
								/>
							</Col>
							<Col span={8}>
								<Statistic
									title="Avg Strapi"
									value={summary.averageStrapiTime?.toFixed(1) || '-'}
									suffix={summary.averageStrapiTime ? 'ms' : ''}
									valueStyle={{ fontSize: 'var(--font-size-base)' }}
								/>
							</Col>
						</Row>
					</Card>
				</Col>

				<Col span={12}>
					<Card title="Recent Alerts" size="small">
						{alerts.length === 0 ? (
							<div
								style={{ color: 'var(--color-gray-500)', textAlign: 'center' }}>
								No recent alerts
							</div>
						) : (
							<div style={{ maxHeight: '120px', overflowY: 'auto' }}>
								{alerts.slice(0, 5).map((alert, index) => (
									<div
										key={index}
										style={{
											padding: '4px 0',
											borderBottom: '1px solid var(--color-gray-200)',
											fontSize: 'var(--font-size-xs)',
										}}>
										<Badge
											status={
												alert.level === AlertLevel.CRITICAL
													? 'error'
													: 'warning'
											}
											text={alert.message}
										/>
									</div>
								))}
							</div>
						)}
					</Card>
				</Col>
			</Row>

			{/* Recent Samples Table */}
			<Card title="Recent Translation Loads (Last 20)" size="small">
				{summary.totalSamples === 0 ? (
					<div
						style={{
							textAlign: 'center',
							color: 'var(--color-gray-500)',
							padding: 'var(--spacing-6)',
						}}>
						No metrics collected yet. Trigger translation loads to see data.
					</div>
				) : (
					<Table
						dataSource={recentSamples}
						columns={columns}
						pagination={false}
						size="small"
						scroll={{ y: 300 }}
					/>
				)}
			</Card>

			{/* Debug Info */}
			<Card title="Configuration" size="small" style={{ marginTop: 'var(--spacing-4)' }}>
				<Row gutter={16}>
					<Col span={8}>
						<div style={{ fontSize: 'var(--font-size-xs)' }}>
							<strong>Total Samples:</strong> {summary.totalSamples}
						</div>
						<div style={{ fontSize: 'var(--font-size-xs)' }}>
							<strong>Max Buffer:</strong>{' '}
							{PerformanceMonitor.getConfig().maxSamples}
						</div>
					</Col>
					<Col span={8}>
						<div style={{ fontSize: 'var(--font-size-xs)' }}>
							<strong>Slow Load Threshold:</strong>{' '}
							{PerformanceMonitor.getConfig().slowLoadThreshold}ms
						</div>
						<div style={{ fontSize: 'var(--font-size-xs)' }}>
							<strong>Degradation Threshold:</strong>{' '}
							{PerformanceMonitor.getConfig().degradationThreshold} consecutive
						</div>
					</Col>
					<Col span={8}>
						<div style={{ fontSize: 'var(--font-size-xs)' }}>
							<strong>Sampling Rate:</strong>{' '}
							{(PerformanceMonitor.getConfig().samplingRate * 100).toFixed(0)}%
						</div>
						<div style={{ fontSize: 'var(--font-size-xs)' }}>
							<strong>Environment:</strong> {process.env.NODE_ENV}
						</div>
					</Col>
				</Row>
			</Card>
		</div>
	);
};

export default I18nMetricsDashboard;
