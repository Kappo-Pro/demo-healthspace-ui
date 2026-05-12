/**
 * OClinicalOutcomesPanel Organism Component
 *
 * Comprehensive clinical outcomes panel integrating:
 * - Outcome measures (NPRS, NDI, ODI, Functional Goals)
 * - Correlation visualizations with posture scores
 * - Clinical insights and recommendations
 * - Outcome goal tracking
 *
 * Implements FR17: Clinical Outcome Integration
 * Story 3.5: Clinical Outcome Integration
 *
 * @module components/organisms/OClinicalOutcomesPanel
 */

import React, { useEffect } from 'react';
import {
	Card,
	Tabs,
	Typography,
	Space,
	Alert,
	Spin,
	Empty,
	Row,
	Col,
	Statistic,
	Progress,
	Tag,
	List} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	fetchClinicalOutcomes,
	selectPatientOutcomes,
	selectIsLoading,
	selectError,
	selectPatientInsights,
	selectPatientGoals,
	selectCriticalInsights} from '@stores/posture/postureAnalytics/clinicalOutcomesSlice';
import { OutcomeCorrelationChart } from '@molecules/OutcomeCorrelationChart';
import { format } from 'date-fns';
import { ClinicalOutcomesPanelProps } from './types';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './OClinicalOutcomesPanel.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * Severity icon and color mapping
 */
const getSeverityProps = (severity: 'info' | 'warning' | 'critical') => {
	switch (severity) {
		case 'critical':
			return { color: 'error', icon: '⚠️' };
		case 'warning':
			return { color: 'warning', icon: '⚡' };
		case 'info':
		default:
			return { color: 'info', icon: 'ℹ️' };
	}
};

/**
 * OClinicalOutcomesPanel Component
 *
 * Displays comprehensive clinical outcome data integrated with posture analytics.
 *
 * @component
 * @example
 * ```tsx
 * <OClinicalOutcomesPanel patientId="patient-123" />
 * ```
 */
export const OClinicalOutcomesPanel: React.FC<ClinicalOutcomesPanelProps> = ({
	patientId,
	className,
}) => {
	const { t } = useTypedTranslation();
	const dispatch = useTypedDispatch();

	// Redux state
	const outcomesData = useTypedSelector(selectPatientOutcomes(patientId));
	const loading = useTypedSelector(selectIsLoading);
	const error = useTypedSelector(selectError);
	const insights = useTypedSelector(selectPatientInsights(patientId));
	const goals = useTypedSelector(selectPatientGoals(patientId));
	const criticalInsights = useTypedSelector(selectCriticalInsights(patientId));

	/**
	 * Fetch clinical outcomes on mount
	 */
	useEffect(() => {
		dispatch(fetchClinicalOutcomes(patientId));
	}, [dispatch, patientId]);

	/**
	 * Loading State
	 */
	if (loading && !outcomesData) {
		return (
			<div className={`clinical-outcomes-loading ${className || ''}`}>
				<Spin size="large" tip={t('admin.clinicalOutcomes.loading.message')} />
			</div>
		);
	}

	/**
	 * Error State
	 */
	if (error && !outcomesData) {
		return (
			<div className={`clinical-outcomes-error ${className || ''}`}>
				<Alert
					message={t('admin.clinicalOutcomes.errors.loadingTitle')}
					description={error}
					type="error"
					showIcon
				/>
			</div>
		);
	}

	/**
	 * Empty State
	 */
	if (
		!outcomesData ||
		!outcomesData.measures ||
		outcomesData.measures.length === 0
	) {
		return (
			<div className={`clinical-outcomes-empty ${className || ''}`}>
				<Empty
					description={t('admin.clinicalOutcomes.empty.noDataDescription')}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			</div>
		);
	}

	const { measures, correlations } = outcomesData;

	/**
	 * Render Outcome Measures Tab
	 */
	const renderOutcomeMeasures = () => (
		<div className="outcome-measures-section">
			<Row gutter={[16, 16]}>
				{measures.map((measure: unknown) => {
					const trendIcon =
						measure.trend === 'improving'
							? '📈'
							: measure.trend === 'worsening'
								? '📉'
								: '➡️';
					const trendColor =
						measure.trend === 'improving'
							? 'success'
							: measure.trend === 'worsening'
								? 'error'
								: 'default';

					return (
						<Col xs={24} md={12} key={measure.measureType}>
							<Card className="measure-card">
								<Space
									direction="vertical"
									style={{ width: '100%' }}
									size="middle">
									<div className="measure-header">
										<Title level={5}>{measure.label}</Title>
										<Tag color={trendColor}>
											{trendIcon} {measure.trend.toUpperCase()}
										</Tag>
									</div>

									<Row gutter={16}>
										<Col span={8}>
											<Statistic
												title={t('admin.clinicalOutcomes.measures.current')}
												value={measure.current}
												suffix={measure.unit}
												valueStyle={{ color: 'var(--brand-primary)' }}
											/>
										</Col>
										<Col span={8}>
											<Statistic
												title={t('admin.clinicalOutcomes.measures.baseline')}
												value={measure.baseline}
												suffix={measure.unit}
											/>
										</Col>
										<Col span={8}>
											<Statistic
												title={t('admin.clinicalOutcomes.measures.change')}
												value={Math.abs(measure.current - measure.baseline)}
												suffix={measure.unit}
												prefix={measure.current > measure.baseline ? '+' : '-'}
											/>
										</Col>
									</Row>

									{measure.history && measure.history.length > 3 && (
										<div className="measure-mini-chart">
											<Text type="secondary" style={{ fontSize: 12 }}>
												Trend over {measure.history.length} measurements
											</Text>
										</div>
									)}
								</Space>
							</Card>
						</Col>
					);
				})}
			</Row>
		</div>
	);

	/**
	 * Render Correlation Tab
	 */
	const renderCorrelations = () => {
		if (!correlations || Object.keys(correlations).length === 0) {
			return (
				<Empty
					description={t('admin.clinicalOutcomes.correlations.noDataDescription')}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			);
		}

		return (
			<div className="correlations-section">
				<Space direction="vertical" style={{ width: '100%' }} size="large">
					<Alert
						message={t('admin.clinicalOutcomes.correlations.analysisTitle')}
						description={t('admin.clinicalOutcomes.correlations.analysisDescription')}
						type="info"
						icon={<UntitledIcon name="infoCircle" size={16} />}
						showIcon
					/>

					{measures.map((measure: unknown) => {
						const correlation = correlations[measure.measureType];
						if (!correlation) return null;

						return (
							<div
								key={measure.measureType}
								className="correlation-chart-container">
								<Title level={5}>{measure.label} vs. Posture Score</Title>
								<OutcomeCorrelationChart
									correlation={correlation}
									measureType={measure.measureType}
									measureLabel={measure.label}
								/>
							</div>
						);
					})}
				</Space>
			</div>
		);
	};

	/**
	 * Render Clinical Insights Tab
	 */
	const renderInsights = () => {
		if (insights.length === 0) {
			return (
				<Empty
					description={t('admin.clinicalOutcomes.insights.noInsightsDescription')}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			);
		}

		return (
			<div className="insights-section">
				<Space direction="vertical" style={{ width: '100%' }} size="large">
					{criticalInsights.length > 0 && (
						<Alert
							message={t('admin.clinicalOutcomes.insights.criticalAttentionMessage')}
							description={`${criticalInsights.length} ${t('admin.clinicalOutcomes.insights.insightsNeedReview')}`}
							type="warning"
							showIcon
						/>
					)}

					<List
						itemLayout="vertical"
						dataSource={insights}
						renderItem={(insight: unknown) => {
							const { color, icon } = getSeverityProps(insight.severity);

							return (
								<List.Item key={insight.id} className="insight-item">
									<Card>
										<Space
											direction="vertical"
											style={{ width: '100%' }}
											size="small">
											<div className="insight-header">
												<Space>
													<span style={{ fontSize: 20 }}>{icon}</span>
													<Title level={5} style={{ margin: 0 }}>
														{insight.title}
													</Title>
													<Tag color={color}>
														{insight.type.replace('_', ' ')}
													</Tag>
												</Space>
											</div>

											<Paragraph>{insight.description}</Paragraph>

											{insight.relatedDates &&
												insight.relatedDates.length > 0 && (
													<div className="related-dates">
														<Text type="secondary" strong>
															{t('admin.clinicalOutcomes.insights.relatedDates')}
														</Text>{' '}
														{insight.relatedDates.map(
															(date: string, idx: number) => (
																<Tag key={idx}>
																	{format(new Date(date), 'MMM d, yyyy')}
																</Tag>
															),
														)}
													</div>
												)}

											{insight.suggestedActions &&
												insight.suggestedActions.length > 0 && (
													<div className="suggested-actions">
														<Text strong>{t('admin.clinicalOutcomes.insights.suggestedActions')}</Text>
														<ul>
															{insight.suggestedActions.map(
																(action: string, idx: number) => (
																	<li key={idx}>{action}</li>
																),
															)}
														</ul>
													</div>
												)}
										</Space>
									</Card>
								</List.Item>
							);
						}}
					/>
				</Space>
			</div>
		);
	};

	/**
	 * Render Outcome Goals Tab
	 */
	const renderGoals = () => {
		if (goals.length === 0) {
			return (
				<Empty
					description={t('admin.clinicalOutcomes.goals.noGoalsDescription')}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			);
		}

		return (
			<div className="goals-section">
				<Space direction="vertical" style={{ width: '100%' }} size="large">
					{goals.map((goal: unknown) => {
						const statusColor =
							goal.status === 'achieved'
								? 'success'
								: goal.status === 'on-track'
									? 'processing'
									: goal.status === 'at-risk'
										? 'warning'
										: 'error';

						return (
							<Card key={goal.id} className="goal-card">
								<Space
									direction="vertical"
									style={{ width: '100%' }}
									size="middle">
									<div className="goal-header">
										<Space>
											<Title level={5} style={{ margin: 0 }}>
												{goal.description}
											</Title>
											<Tag color={statusColor}>{goal.status.toUpperCase()}</Tag>
										</Space>
									</div>

									<Row gutter={16}>
										<Col span={8}>
											<Statistic
												title={t('admin.clinicalOutcomes.goals.target')}
												value={goal.targetValue}
												valueStyle={{ fontSize: 18 }}
											/>
										</Col>
										<Col span={8}>
											<Statistic
												title={t('admin.clinicalOutcomes.goals.current')}
												value={goal.currentValue}
												valueStyle={{ fontSize: 18 }}
											/>
										</Col>
										<Col span={8}>
											<Statistic
												title={t('admin.clinicalOutcomes.goals.progress')}
												value={goal.progress}
												suffix="%"
												valueStyle={{ fontSize: 18 }}
											/>
										</Col>
									</Row>

									<Progress
										percent={goal.progress}
										status={
											goal.status === 'achieved'
												? 'success'
												: goal.status === 'behind'
													? 'exception'
													: 'active'
										}
										strokeColor={
											goal.progress >= 80
												? 'var(--status-success)'
												: goal.progress >= 50
													? 'var(--status-warning)'
													: 'var(--status-error)'
										}
									/>

									<div className="goal-dates">
										<Row gutter={16}>
											<Col span={12}>
												<Text type="secondary">{t('admin.clinicalOutcomes.goals.targetDate')}</Text>
												<Text strong>
													{format(new Date(goal.targetDate), 'MMM d, yyyy')}
												</Text>
											</Col>
											{goal.predictedDate && (
												<Col span={12}>
													<Text type="secondary">{t('admin.clinicalOutcomes.goals.predicted')}</Text>
													<Text strong>
														{format(
															new Date(goal.predictedDate),
															'MMM d, yyyy',
														)}
													</Text>
												</Col>
											)}
										</Row>
									</div>
								</Space>
							</Card>
						);
					})}
				</Space>
			</div>
		);
	};

	return (
		<div className={`clinical-outcomes-panel ${className || ''}`}>
			<Card
				title={
					<Space>
						<UntitledIcon name="lineChart" size={16} />
						<span>{t('admin.clinicalOutcomes.title')}</span>
					</Space>
				}>
				<Tabs defaultActiveKey="measures" tabPosition="top">
					<TabPane
						tab={
							<Space>
								<UntitledIcon name="lineChart" size={16} />
								{t('admin.clinicalOutcomes.tabs.measures')}
							</Space>
						}
						key="measures">
						{renderOutcomeMeasures()}
					</TabPane>

					<TabPane
						tab={
							<Space>
								<UntitledIcon name="lineChart" size={16} />
								{t('admin.clinicalOutcomes.tabs.correlations')}
							</Space>
						}
						key="correlations">
						{renderCorrelations()}
					</TabPane>

					<TabPane
						tab={
							<Space>
								<UntitledIcon name="lightbulb" size={16} />
								{t('admin.clinicalOutcomes.tabs.insights')}
								{criticalInsights.length > 0 && (
									<Tag color="warning">{criticalInsights.length}</Tag>
								)}
							</Space>
						}
						key="insights">
						{renderInsights()}
					</TabPane>

					<TabPane
						tab={
							<Space>
								<UntitledIcon name="target" size={16} />
								{t('admin.clinicalOutcomes.tabs.goals')}
							</Space>
						}
						key="goals">
						{renderGoals()}
					</TabPane>
				</Tabs>
			</Card>
		</div>
	);
};

OClinicalOutcomesPanel.displayName = 'OClinicalOutcomesPanel';
