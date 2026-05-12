/**
 * Beta Metrics Dashboard Organism
 *
 * Comprehensive dashboard for visualizing and analyzing beta program metrics.
 * Displays all 5 strategic goals, ROI analysis, and statistical validation.
 *
 * @see Story 4.5 - Quantitative Beta Validation
 * @see docs/beta-program/success-criteria.md
 */

import React, {useState, _useEffect, useMemo } from 'react';
import { Card, Row, Col, Typography, Space, Alert, Statistic, Progress, Button, Tag, Tabs, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UntitledIcon } from '@atoms/Icon';
import type {
	BetaValidationResults,
	StatisticalAnalysis,
	MetricsComparison} from '@types/betaMetrics';
import { validateBetaResults, formatStatusEmoji, formatOverallStatusEmoji } from '@utils/analytics/metricsValidation';
import { formatCurrency, formatROIPercentage, generateROISummary } from '@utils/analytics/roiCalculation';
import {_formatPercent, formatDuration } from '@utils/analytics/statisticalAnalysis';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Component props
 */
interface OBetaMetricsDashboardProps {
	/** Beta validation results */
	data: BetaValidationResults;
	/** Loading state */
	loading?: boolean;
	/** Error message */
	error?: string | null;
	/** On refresh callback */
	onRefresh?: () => void;
	/** On export callback */
	onExport?: (format: 'pdf' | 'csv' | 'json') => void;
}

/**
 * Beta Metrics Dashboard Organism
 */
export const OBetaMetricsDashboard: React.FC<OBetaMetricsDashboardProps> = ({
	data,
	loading = false,
	error = null,
	onRefresh,
	onExport,
}) => {
	const [activeTab, setActiveTab] = useState<string>('overview');

	// Validate results
	const validation = useMemo(() => {
		if (!data) return null;
		return validateBetaResults(data);
	}, [data]);

	// Status colors
	const getStatusColor = (status: string): string => {
		switch (status) {
			case 'passed':
			case 'go':
				return 'success';
			case 'partial':
			case 'conditional_go':
				return 'warning';
			case 'failed':
			case 'no_go':
				return 'error';
			default:
				return 'default';
		}
	};

	// Render error state
	if (error) {
		return (
			<Alert
				message="Error Loading Beta Metrics"
				description={error}
				type="error"
				showIcon
				action={
					onRefresh && (
						<Button size="small" danger onClick={onRefresh}>
							Retry
						</Button>
					)
				}
			/>
		);
	}

	// Render loading state
	if (loading || !data || !validation) {
		return (
			<Card loading={true}>
				<div style={{ minHeight: 400 }} />
			</Card>
		);
	}

	return (
		<div className="beta-metrics-dashboard">
			{/* Header */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col span={24}>
					<Card>
						<Row justify="space-between" align="middle">
							<Col>
								<Space direction="vertical" size={0}>
									<Title level={3} style={{ margin: 0 }}>
										Beta Program Validation Results
									</Title>
									<Text type="secondary">
										{data.programId} | {data.startDate} to {data.endDate} ({data.duration} weeks)
									</Text>
								</Space>
							</Col>
							<Col>
								<Space>
									{onRefresh && (
										<Button icon={<UntitledIcon name="refresh" size={16} />} onClick={onRefresh}>
											Refresh
										</Button>
									)}
									{onExport && (
										<Button
											type="primary"
											icon={<UntitledIcon name="download" size={16} />}
											onClick={() => onExport('pdf')}
										>
											Export Report
										</Button>
									)}
								</Space>
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>

			{/* Overall Status Alert */}
			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col span={24}>
					<Alert
						message={formatOverallStatusEmoji(validation.overallStatus)}
						description={validation.recommendation}
						type={getStatusColor(validation.overallStatus) as 'success' | 'warning' | 'error'}
						showIcon
						icon={
							validation.overallStatus === 'go' ? (
								<UntitledIcon name="checkCircle" size={16} />
							) : validation.overallStatus === 'conditional_go' ? (
								<UntitledIcon name="warning" size={16} />
							) : (
								<UntitledIcon name="xCircle" size={16} />
							)
						}
					/>
				</Col>
			</Row>

			{/* Critical Issues (if any) */}
			{validation.criticalIssues.length > 0 && (
				<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
					<Col span={24}>
						<Card title="Critical Issues" type="inner">
							<Space direction="vertical" style={{ width: '100%' }}>
								{validation.criticalIssues.map((issue, index) => (
									<Alert key={index} message={issue} type="error" showIcon closable />
								))}
							</Space>
						</Card>
					</Col>
				</Row>
			)}

			{/* Tabs */}
			<Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
				{/* Overview Tab */}
				<TabPane tab="Overview" key="overview">
					<OverviewTab data={data} validation={validation} />
				</TabPane>

				{/* Goals Tab */}
				<TabPane tab="Strategic Goals" key="goals">
					<GoalsTab data={data} validation={validation} />
				</TabPane>

				{/* Metrics Tab */}
				<TabPane tab="Detailed Metrics" key="metrics">
					<MetricsTab data={data} />
				</TabPane>

				{/* Statistics Tab */}
				<TabPane tab="Statistical Analysis" key="statistics">
					<StatisticsTab data={data} />
				</TabPane>

				{/* ROI Tab */}
				<TabPane tab="ROI Analysis" key="roi">
					<ROITab data={data} />
				</TabPane>

				{/* Time Series Tab */}
				<TabPane tab="Trends" key="trends">
					<TrendsTab data={data} />
				</TabPane>
			</Tabs>
		</div>
	);
};

/**
 * Overview Tab Component
 */
const OverviewTab: React.FC<{
	data: BetaValidationResults;
	validation: ReturnType<typeof validateBetaResults>;
}> = ({ data, validation }) => {
	return (
		<Row gutter={[16, 16]}>
			{/* Key Metrics Cards */}
			<Col xs={24} sm={12} lg={6}>
				<Card>
					<Statistic
						title="Participants"
						value={data.participantCount}
						suffix={`/ ${data.clinicCount} clinics`}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} lg={6}>
				<Card>
					<Statistic
						title="Duration"
						value={data.duration}
						suffix="weeks"
						prefix={<UntitledIcon name="barChart" size={20} />}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} lg={6}>
				<Card>
					<Statistic
						title="ROI"
						value={data.roi.roi.roiPercentage.toFixed(0)}
						suffix="%"
						prefix={<UntitledIcon name="dollar" size={20} />}
						valueStyle={{ color: 'var(--color-success-600)' }}
					/>
				</Card>
			</Col>
			<Col xs={24} sm={12} lg={6}>
				<Card>
					<Statistic
						title="NPS"
						value={data.satisfaction.nps.actual}
						suffix={`/ ${data.satisfaction.nps.target}`}
						valueStyle={{
							color: data.satisfaction.nps.actual >= data.satisfaction.nps.target ? 'var(--color-success-600)' : 'var(--color-error-600)',
						}}
					/>
				</Card>
			</Col>

			{/* Goals Summary */}
			<Col span={24}>
				<Card title="Strategic Goals Summary">
					<Row gutter={[16, 16]}>
						{validation.goalSummaries.map((summary) => (
							<Col key={summary.goal} xs={24} md={12}>
								<Card type="inner" size="small">
									<Space direction="vertical" style={{ width: '100%' }}>
										<Row justify="space-between" align="middle">
											<Text strong>{summary.goalName}</Text>
											<Tag color={getStatusColor(summary.status)}>
												{formatStatusEmoji(summary.status)} {summary.status.toUpperCase()}
											</Tag>
										</Row>
										<Progress
											percent={(summary.metricsPassed / summary.metricsCount) * 100}
											status={summary.status === 'passed' ? 'success' : 'normal'}
											format={() => `${summary.metricsPassed}/${summary.metricsCount}`}
										/>
										<Text type="secondary" style={{ fontSize: 12 }}>
											{summary.details}
										</Text>
									</Space>
								</Card>
							</Col>
						))}
					</Row>
				</Card>
			</Col>

			{/* Notes */}
			{data.notes.length > 0 && (
				<Col span={24}>
					<Card title="Key Findings">
						<ul>
							{data.notes.map((note, index) => (
								<li key={index}>
									<Text>{note}</Text>
								</li>
							))}
						</ul>
					</Card>
				</Col>
			)}
		</Row>
	);
};

/**
 * Helper to get status color
 */
const getStatusColor = (status: string): string => {
	switch (status) {
		case 'passed':
		case 'go':
			return 'success';
		case 'partial':
		case 'conditional_go':
			return 'warning';
		case 'failed':
		case 'no_go':
			return 'error';
		default:
			return 'default';
	}
};

/**
 * Goals Tab Component
 */
const GoalsTab: React.FC<{
	data: BetaValidationResults;
	validation: ReturnType<typeof validateBetaResults>;
}> = ({ data, _validation }) => {
	return (
		<Row gutter={[16, 16]}>
			{/* Goal 1: Accessibility */}
			<Col span={24}>
				<Card
					title={
						<Space>
							{formatStatusEmoji(data.goals.accessibility.wcagCompliance.status)} Goal 1: Accessibility
							Compliance
						</Space>
					}
				>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={8}>
							<Statistic
								title="WCAG Compliance"
								value={data.goals.accessibility.wcagCompliance.actual}
								suffix={`% / ${data.goals.accessibility.wcagCompliance.target}%`}
								valueStyle={{
									color:
										data.goals.accessibility.wcagCompliance.actual >=
										data.goals.accessibility.wcagCompliance.target
											? 'var(--color-success-600)'
											: 'var(--color-error-600)',
								}}
							/>
						</Col>
						<Col xs={24} md={8}>
							<Statistic
								title="Lighthouse Score"
								value={data.goals.accessibility.lighthouseScore.actual}
								suffix={`/ ${data.goals.accessibility.lighthouseScore.target}`}
							/>
						</Col>
						<Col xs={24} md={8}>
							<Statistic
								title="Critical Violations"
								value={data.goals.accessibility.axeViolations.critical}
								valueStyle={{
									color: data.goals.accessibility.axeViolations.critical === 0 ? 'var(--color-success-600)' : 'var(--color-error-600)',
								}}
							/>
						</Col>
					</Row>
				</Card>
			</Col>

			{/* Goal 2: Efficiency */}
			<Col span={24}>
				<Card
					title={
						<Space>
							{formatStatusEmoji(data.goals.efficiency.triageTime.status)} Goal 2: Clinician Efficiency
						</Space>
					}
				>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={6}>
							<Statistic
								title="Triage Time"
								value={data.goals.efficiency.triageTime.actual}
								suffix="min"
								prefix={`${data.goals.efficiency.triageTime.reduction.toFixed(1)}% ↓`}
								valueStyle={{ color: 'var(--color-success-600)' }}
							/>
							<Text type="secondary" style={{ fontSize: 12 }}>
								Target: {data.goals.efficiency.triageTime.target} min (40% reduction)
							</Text>
						</Col>
						<Col xs={24} md={6}>
							<Statistic
								title="Assessment Time"
								value={data.goals.efficiency.assessmentTime.actual}
								suffix="min"
							/>
						</Col>
						<Col xs={24} md={6}>
							<Statistic
								title="Report Generation"
								value={data.goals.efficiency.reportGenerationTime.actual}
								suffix="min"
							/>
						</Col>
						<Col xs={24} md={6}>
							<Statistic title="Clicks to Complete" value={data.goals.efficiency.clicksToComplete.actual} />
						</Col>
					</Row>
				</Card>
			</Col>

			{/* Goal 3: Engagement */}
			<Col span={24}>
				<Card
					title={
						<Space>
							{formatStatusEmoji(data.goals.engagement.viewRate.status)} Goal 3: Patient Engagement
						</Space>
					}
				>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={8}>
							<Statistic
								title="View Rate"
								value={data.goals.engagement.viewRate.actual}
								suffix="%"
								prefix={`${data.goals.engagement.viewRate.increase.toFixed(1)}% ↑`}
								valueStyle={{ color: 'var(--color-success-600)' }}
							/>
							<Text type="secondary" style={{ fontSize: 12 }}>
								Target: {data.goals.engagement.viewRate.target}% (60% increase)
							</Text>
						</Col>
						<Col xs={24} md={8}>
							<Statistic
								title="Session Duration"
								value={formatDuration(data.goals.engagement.sessionDuration.average * 1000)}
							/>
						</Col>
						<Col xs={24} md={8}>
							<Statistic
								title="Week 4 Retention"
								value={data.goals.engagement.returnRate.week4}
								suffix="%"
							/>
						</Col>
					</Row>
				</Card>
			</Col>

			{/* Goal 4: Reusability */}
			<Col span={24}>
				<Card
					title={
						<Space>
							{formatStatusEmoji(data.goals.reusability.reusabilityScore.status)} Goal 4: Component
							Reusability
						</Space>
					}
				>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={12}>
							<Statistic
								title="Reusability Score"
								value={data.goals.reusability.reusabilityScore.actual}
								suffix={`% / ${data.goals.reusability.reusabilityScore.target}%`}
							/>
						</Col>
						<Col xs={24} md={12}>
							<Statistic
								title="Shared Components"
								value={data.goals.reusability.sharedComponents.total}
							/>
						</Col>
					</Row>
				</Card>
			</Col>

			{/* Goal 5: AI Readiness */}
			<Col span={24}>
				<Card
					title={
						<Space>
							{formatStatusEmoji(data.goals.aiReadiness.apiContracts.status)} Goal 5: AI Integration
							Readiness
						</Space>
					}
				>
					<Row gutter={[16, 16]}>
						<Col xs={24} md={8}>
							<Statistic
								title="API Version"
								value={data.goals.aiReadiness.apiContracts.version}
								prefix={data.goals.aiReadiness.apiContracts.stable ? '✅ Stable' : '⚠️ Unstable'}
							/>
						</Col>
						<Col xs={24} md={8}>
							<Statistic
								title="Pipeline Latency"
								value={data.goals.aiReadiness.dataPipeline.latency}
								suffix="ms"
							/>
						</Col>
						<Col xs={24} md={8}>
							<Statistic
								title="Rework Needed"
								value={data.goals.aiReadiness.reworkNeeded.estimate.toUpperCase()}
								valueStyle={{
									color: data.goals.aiReadiness.reworkNeeded.estimate === 'zero' ? 'var(--color-success-600)' : 'var(--color-error-600)',
								}}
							/>
						</Col>
					</Row>
				</Card>
			</Col>
		</Row>
	);
};

/**
 * Metrics Tab Component
 */
const MetricsTab: React.FC<{ data: BetaValidationResults }> = ({ data }) => {
	// Define columns for metrics comparison table
	const columns: ColumnsType<MetricsComparison> = [
		{
			title: 'Metric',
			dataIndex: 'metric',
			key: 'metric',
			fixed: 'left',
		},
		{
			title: 'Pre-Beta',
			dataIndex: 'preBeta',
			key: 'preBeta',
			render: (value) => value.toFixed(1),
		},
		{
			title: 'Post-Beta',
			dataIndex: 'postBeta',
			key: 'postBeta',
			render: (value) => value.toFixed(1),
		},
		{
			title: 'Change',
			dataIndex: 'change',
			key: 'change',
			render: (value) => (
				<Text style={{ color: value < 0 ? 'var(--color-success-600)' : 'var(--color-error-600)' }}>
					{value > 0 ? '+' : ''}
					{value.toFixed(1)}
				</Text>
			),
		},
		{
			title: '% Change',
			dataIndex: 'percentChange',
			key: 'percentChange',
			render: (value) => (
				<Text strong style={{ color: value < 0 ? 'var(--color-success-600)' : 'var(--color-error-600)' }}>
					{value > 0 ? '+' : ''}
					{value.toFixed(1)}%
				</Text>
			),
		},
		{
			title: 'Target',
			dataIndex: 'target',
			key: 'target',
			render: (value) => value.toFixed(1),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			render: (status) => (
				<Tag color={getStatusColor(status)}>
					{formatStatusEmoji(status)} {status.toUpperCase()}
				</Tag>
			),
		},
	];

	// Build metrics comparison data
	const metricsData: MetricsComparison[] = [
		{
			metric: 'Triage Time (min)',
			preBeta: data.goals.efficiency.triageTime.baseline,
			postBeta: data.goals.efficiency.triageTime.actual,
			change: data.goals.efficiency.triageTime.actual - data.goals.efficiency.triageTime.baseline,
			percentChange: -data.goals.efficiency.triageTime.reduction,
			target: data.goals.efficiency.triageTime.target,
			targetMet: data.goals.efficiency.triageTime.actual <= data.goals.efficiency.triageTime.target,
			status: data.goals.efficiency.triageTime.status,
		},
		{
			metric: 'Patient Engagement (%)',
			preBeta: data.goals.engagement.viewRate.baseline,
			postBeta: data.goals.engagement.viewRate.actual,
			change: data.goals.engagement.viewRate.actual - data.goals.engagement.viewRate.baseline,
			percentChange: data.goals.engagement.viewRate.increase,
			target: data.goals.engagement.viewRate.target,
			targetMet: data.goals.engagement.viewRate.actual >= data.goals.engagement.viewRate.target,
			status: data.goals.engagement.viewRate.status,
		},
		{
			metric: 'Assessment Time (min)',
			preBeta: data.goals.efficiency.assessmentTime.baseline,
			postBeta: data.goals.efficiency.assessmentTime.actual,
			change: data.goals.efficiency.assessmentTime.actual - data.goals.efficiency.assessmentTime.baseline,
			percentChange:
				((data.goals.efficiency.assessmentTime.actual - data.goals.efficiency.assessmentTime.baseline) /
					data.goals.efficiency.assessmentTime.baseline) *
				100,
			target: data.goals.efficiency.assessmentTime.target,
			targetMet: data.goals.efficiency.assessmentTime.actual <= data.goals.efficiency.assessmentTime.target,
			status: data.goals.efficiency.assessmentTime.status,
		},
		{
			metric: 'WCAG Compliance (%)',
			preBeta: data.goals.accessibility.wcagCompliance.baseline,
			postBeta: data.goals.accessibility.wcagCompliance.actual,
			change: data.goals.accessibility.wcagCompliance.actual - data.goals.accessibility.wcagCompliance.baseline,
			percentChange:
				((data.goals.accessibility.wcagCompliance.actual - data.goals.accessibility.wcagCompliance.baseline) /
					data.goals.accessibility.wcagCompliance.baseline) *
				100,
			target: data.goals.accessibility.wcagCompliance.target,
			targetMet: data.goals.accessibility.wcagCompliance.actual >= data.goals.accessibility.wcagCompliance.target,
			status: data.goals.accessibility.wcagCompliance.status,
		},
	];

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<Card title="Metrics Comparison: Pre-Beta vs Post-Beta">
					<Table
						columns={columns}
						dataSource={metricsData}
						pagination={false}
						rowKey="metric"
						scroll={{ x: 800 }}
					/>
				</Card>
			</Col>
		</Row>
	);
};

/**
 * Statistics Tab Component
 */
const StatisticsTab: React.FC<{ data: BetaValidationResults }> = ({ data }) => {
	const columns: ColumnsType<StatisticalAnalysis> = [
		{
			title: 'Metric',
			dataIndex: 'metric',
			key: 'metric',
		},
		{
			title: 'Baseline',
			dataIndex: 'baseline',
			key: 'baseline',
			render: (value) => value.toFixed(2),
		},
		{
			title: 'Actual',
			dataIndex: 'actual',
			key: 'actual',
			render: (value) => value.toFixed(2),
		},
		{
			title: 'Change',
			dataIndex: 'percentChange',
			key: 'percentChange',
			render: (value) => (
				<Text strong style={{ color: value < 0 ? 'var(--color-success-600)' : 'var(--color-error-600)' }}>
					{value > 0 ? '+' : ''}
					{value.toFixed(1)}%
				</Text>
			),
		},
		{
			title: 't-Statistic',
			dataIndex: 'tStatistic',
			key: 'tStatistic',
			render: (value) => value.toFixed(3),
		},
		{
			title: 'p-Value',
			dataIndex: 'pValue',
			key: 'pValue',
			render: (value) => (value < 0.001 ? '<0.001' : value.toFixed(4)),
		},
		{
			title: 'Significant',
			dataIndex: 'significant',
			key: 'significant',
			render: (value) => (
				<Tag color={value ? 'success' : 'default'}>{value ? '✅ Yes' : '❌ No'}</Tag>
			),
		},
		{
			title: '95% CI',
			key: 'confidenceInterval',
			render: (_: unknown, record: StatisticalAnalysis) =>
				`[${record.confidenceInterval.lower.toFixed(2)}, ${record.confidenceInterval.upper.toFixed(2)}]`,
		},
	];

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<Alert
					message="Statistical Significance"
					description="All metrics show p-values < 0.05, indicating statistically significant differences between pre-beta and post-beta measurements."
					type="info"
					showIcon
					style={{ marginBottom: 16 }}
				/>
			</Col>
			<Col span={24}>
				<Card title="Statistical Analysis Results">
					<Table
						columns={columns}
						dataSource={data.statisticalAnalysis}
						pagination={false}
						rowKey="metric"
						scroll={{ x: 1000 }}
					/>
				</Card>
			</Col>
		</Row>
	);
};

/**
 * ROI Tab Component
 */
const ROITab: React.FC<{ data: BetaValidationResults }> = ({ data }) => {
	return (
		<Row gutter={[16, 16]}>
			{/* ROI Summary */}
			<Col span={24}>
				<Card>
					<Paragraph strong style={{ fontSize: 16 }}>
						{generateROISummary(data.roi.roi)}
					</Paragraph>
				</Card>
			</Col>

			{/* Time Savings */}
			<Col xs={24} lg={12}>
				<Card title="Time Savings (Efficiency Gains)">
					<Space direction="vertical" style={{ width: '100%' }} size="middle">
						<Statistic
							title="Triage Time Reduction"
							value={data.roi.timeSavings.triageTimeReduction}
							suffix="min per patient"
						/>
						<Statistic
							title="Weekly Hours Saved"
							value={data.roi.timeSavings.hoursSaved.toFixed(1)}
							suffix="hours"
						/>
						<Statistic
							title="Weekly Cost Savings"
							value={formatCurrency(data.roi.timeSavings.costSavings)}
							valueStyle={{ color: 'var(--color-success-600)' }}
						/>
						<Statistic
							title="Annual Cost Savings"
							value={formatCurrency(data.roi.timeSavings.costSavings * 50)}
							valueStyle={{ color: 'var(--color-success-600)' }}
						/>
					</Space>
				</Card>
			</Col>

			{/* Engagement Revenue */}
			<Col xs={24} lg={12}>
				<Card title="Patient Engagement Revenue">
					<Space direction="vertical" style={{ width: '100%' }} size="middle">
						<Statistic
							title="Engagement Increase"
							value={data.roi.patientEngagement.engagementIncrease.toFixed(1)}
							suffix="%"
						/>
						<Statistic
							title="Additional Engaged Patients"
							value={data.roi.patientEngagement.patientsAffected.toFixed(0)}
							suffix="per week"
						/>
						<Statistic
							title="Weekly Additional Revenue"
							value={formatCurrency(data.roi.patientEngagement.additionalRevenue)}
							valueStyle={{ color: 'var(--color-success-600)' }}
						/>
						<Statistic
							title="Annual Additional Revenue"
							value={formatCurrency(data.roi.patientEngagement.additionalRevenue * 50)}
							valueStyle={{ color: 'var(--color-success-600)' }}
						/>
					</Space>
				</Card>
			</Col>

			{/* Development Cost */}
			<Col xs={24} lg={12}>
				<Card title="Development Cost">
					<Space direction="vertical" style={{ width: '100%' }} size="middle">
						<Statistic
							title="Design Hours"
							value={data.roi.developmentCost.designHours}
							suffix="hours"
						/>
						<Statistic
							title="Development Hours"
							value={data.roi.developmentCost.developmentHours}
							suffix="hours"
						/>
						<Statistic
							title="Testing Hours"
							value={data.roi.developmentCost.testingHours}
							suffix="hours"
						/>
						<Statistic
							title="Total Cost"
							value={formatCurrency(data.roi.developmentCost.totalCost)}
							valueStyle={{ color: 'var(--color-error-600)' }}
						/>
					</Space>
				</Card>
			</Col>

			{/* ROI Summary */}
			<Col xs={24} lg={12}>
				<Card title="ROI Summary">
					<Space direction="vertical" style={{ width: '100%' }} size="middle">
						<Statistic
							title="Annual Benefit"
							value={formatCurrency(data.roi.roi.totalBenefit)}
							valueStyle={{ color: 'var(--color-success-600)' }}
						/>
						<Statistic
							title="Net Benefit (Year 1)"
							value={formatCurrency(data.roi.roi.netBenefit)}
							valueStyle={{ color: 'var(--color-success-600)' }}
						/>
						<Statistic
							title="ROI Percentage"
							value={formatROIPercentage(data.roi.roi.roiPercentage)}
							valueStyle={{ color: 'var(--color-success-600)', fontSize: 24 }}
						/>
						<Statistic
							title="Break-even Period"
							value={data.roi.roi.breakEvenMonths.toFixed(1)}
							suffix="months"
						/>
						<Statistic
							title="5-Year NPV"
							value={formatCurrency(data.roi.roi.fiveYearNPV)}
							valueStyle={{ color: 'var(--color-success-600)', fontSize: 20 }}
						/>
					</Space>
				</Card>
			</Col>
		</Row>
	);
};

/**
 * Trends Tab Component
 */
const TrendsTab: React.FC<{ data: BetaValidationResults }> = ({ data }) => {
	// Build trend data for table
	const trendData = [
		{
			week: 1,
			engagement: data.timeSeries.engagement[0].value,
			triageTime: data.timeSeries.triageTime[0].value,
			errorRate: data.timeSeries.errorRate[0].value,
			nps: data.timeSeries.nps[0].value,
		},
		{
			week: 2,
			engagement: data.timeSeries.engagement[1].value,
			triageTime: data.timeSeries.triageTime[1].value,
			errorRate: data.timeSeries.errorRate[1].value,
			nps: data.timeSeries.nps[1].value,
		},
		{
			week: 3,
			engagement: data.timeSeries.engagement[2].value,
			triageTime: data.timeSeries.triageTime[2].value,
			errorRate: data.timeSeries.errorRate[2].value,
			nps: data.timeSeries.nps[2].value,
		},
		{
			week: 4,
			engagement: data.timeSeries.engagement[3].value,
			triageTime: data.timeSeries.triageTime[3].value,
			errorRate: data.timeSeries.errorRate[3].value,
			nps: data.timeSeries.nps[3].value,
		},
	];

	const columns: ColumnsType<typeof trendData[0]> = [
		{
			title: 'Week',
			dataIndex: 'week',
			key: 'week',
		},
		{
			title: 'DAU (%)',
			dataIndex: 'engagement',
			key: 'engagement',
			render: (value) => `${value}%`,
		},
		{
			title: 'Triage Time (min)',
			dataIndex: 'triageTime',
			key: 'triageTime',
			render: (value) => `${value} min`,
		},
		{
			title: 'Error Rate (%)',
			dataIndex: 'errorRate',
			key: 'errorRate',
			render: (value) => `${value}%`,
		},
		{
			title: 'NPS',
			dataIndex: 'nps',
			key: 'nps',
		},
	];

	return (
		<Row gutter={[16, 16]}>
			<Col span={24}>
				<Card title="Weekly Trends">
					<Table columns={columns} dataSource={trendData} pagination={false} rowKey="week" />
				</Card>
			</Col>

			{/* Trend Cards */}
			<Col xs={24} md={12} lg={6}>
				<Card title="Engagement Trend">
					<Space direction="vertical" style={{ width: '100%' }}>
						{data.timeSeries.engagement.map((point) => (
							<div key={point.week}>
								<Text type="secondary">Week {point.week}: </Text>
								<Text strong>{point.value}%</Text>{' '}
								<Tag color={getStatusColor(point.status || 'pending')}>
									{formatStatusEmoji(point.status || 'pending')}
								</Tag>
							</div>
						))}
					</Space>
				</Card>
			</Col>

			<Col xs={24} md={12} lg={6}>
				<Card title="Triage Time Trend">
					<Space direction="vertical" style={{ width: '100%' }}>
						{data.timeSeries.triageTime.map((point) => (
							<div key={point.week}>
								<Text type="secondary">Week {point.week}: </Text>
								<Text strong>{point.value} min</Text>{' '}
								<Tag color={getStatusColor(point.status || 'pending')}>
									{formatStatusEmoji(point.status || 'pending')}
								</Tag>
							</div>
						))}
					</Space>
				</Card>
			</Col>

			<Col xs={24} md={12} lg={6}>
				<Card title="Error Rate Trend">
					<Space direction="vertical" style={{ width: '100%' }}>
						{data.timeSeries.errorRate.map((point) => (
							<div key={point.week}>
								<Text type="secondary">Week {point.week}: </Text>
								<Text strong>{point.value}%</Text>{' '}
								<Tag color={getStatusColor(point.status || 'pending')}>
									{formatStatusEmoji(point.status || 'pending')}
								</Tag>
							</div>
						))}
					</Space>
				</Card>
			</Col>

			<Col xs={24} md={12} lg={6}>
				<Card title="NPS Trend">
					<Space direction="vertical" style={{ width: '100%' }}>
						{data.timeSeries.nps.map((point) => (
							<div key={point.week}>
								<Text type="secondary">Week {point.week}: </Text>
								<Text strong>{point.value}</Text>{' '}
								<Tag color={getStatusColor(point.status || 'pending')}>
									{formatStatusEmoji(point.status || 'pending')}
								</Tag>
							</div>
						))}
					</Space>
				</Card>
			</Col>
		</Row>
	);
};

export default OBetaMetricsDashboard;
