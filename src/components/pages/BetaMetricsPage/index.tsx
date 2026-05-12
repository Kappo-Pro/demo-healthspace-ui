/**
 * Beta Metrics Page
 *
 * Admin page for viewing and analyzing beta program validation results.
 * Displays comprehensive metrics for all 5 strategic goals with statistical analysis and ROI.
 *
 * @see Story 4.5 - Quantitative Beta Validation
 * @see docs/beta-program/success-criteria.md
 */

import React, { useState, useEffect } from 'react';
import { Layout, message } from 'antd';
import { OBetaMetricsDashboard } from '@organisms/OBetaMetricsDashboard';
import type { BetaValidationResults } from '@types/betaMetrics';
import { generateMockBetaResults } from '@utils/analytics/mockBetaData';
import { exportToCSV } from '@utils/analytics/statisticalAnalysis';
import { exportROIToCSV } from '@utils/analytics/roiCalculation';

const { Content } = Layout;

/**
 * Beta Metrics Page Component
 */
export const BetaMetricsPage: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<BetaValidationResults | null>(null);

	/**
	 * Load beta validation data
	 *
	 * In production, this would fetch data from analytics APIs:
	 * - Google Analytics 4 / Mixpanel for engagement metrics
	 * - Sentry for error rates
	 * - Custom API for triage time tracking
	 * - Survey platform (Typeform) for NPS/SUS
	 */
	const loadData = async (): Promise<void> => {
		setLoading(true);
		setError(null);

		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			// In production, replace with:
			// const response = await fetch('/api/beta/validation-results');
			// const data = await response.json();

			const mockData = generateMockBetaResults();
			setData(mockData);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load beta metrics');
			message.error('Failed to load beta metrics');
		} finally {
			setLoading(false);
		}
	};

	/**
	 * Handle data refresh
	 */
	const handleRefresh = (): void => {
		message.info('Refreshing beta metrics...');
		loadData();
	};

	/**
	 * Handle export to various formats
	 */
	const handleExport = (format: 'pdf' | 'csv' | 'json'): void => {
		if (!data) return;

		try {
			if (format === 'csv') {
				// Export statistical analysis to CSV
				const statisticsCSV = exportToCSV(data.statisticalAnalysis);
				const roiCSV = exportROIToCSV(data.roi);

				// Combine both CSVs
				const fullCSV = `STATISTICAL ANALYSIS\n${statisticsCSV}\n\nROI ANALYSIS\n${roiCSV}`;

				// Download CSV
				const blob = new Blob([fullCSV], { type: 'text/csv' });
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `beta-validation-results-${data.programId}.csv`;
				link.click();
				window.URL.revokeObjectURL(url);

				message.success('CSV exported successfully');
			} else if (format === 'json') {
				// Export full data as JSON
				const json = JSON.stringify(data, null, 2);
				const blob = new Blob([json], { type: 'application/json' });
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				link.download = `beta-validation-results-${data.programId}.json`;
				link.click();
				window.URL.revokeObjectURL(url);

				message.success('JSON exported successfully');
			} else if (format === 'pdf') {
				// PDF export would require a library like jsPDF or server-side generation
				message.info('PDF export coming soon. Use CSV for now.');
			}
		} catch (err) {
			message.error('Export failed');
		}
	};

	// Load data on mount
	useEffect(() => {
		loadData();
	}, []);

	return (
		<Layout style={{ minHeight: '100vh', padding: 'var(--spacing-6)' }}>
			<Content style={{ maxWidth: 1600, margin: '0 auto', width: '100%' }}>
				<OBetaMetricsDashboard
					data={data ?? undefined}
					loading={loading}
					error={error}
					onRefresh={handleRefresh}
					onExport={handleExport}
				/>
			</Content>
		</Layout>
	);
};

export default BetaMetricsPage;
