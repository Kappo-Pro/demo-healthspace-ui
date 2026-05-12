/**
 * MetricCard Component Examples
 *
 * Usage examples for the MetricCard component
 */

import React from 'react';
import { Row, Col, Space } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { MetricCard } from './MetricCard';

/**
 * Basic MetricCard Examples
 */
export const MetricCardExamples: React.FC = () => {
	const { t } = useTranslation();

	return (
		<div style={{ padding: 'var(--spacing-6)' }}>
			<Space direction="vertical" size="large" style={{ width: '100%' }}>
				<div>
					<h2>Basic Usage</h2>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.romScore')}
								value={85}
								suffix="%"
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.totalSessions')}
								value={42}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.currentStreak')}
								value={15}
								suffix="days"
							/>
						</Col>
					</Row>
				</div>

				<div>
					<h2>With Icons</h2>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.romScore')}
								value={85}
								suffix="%"
								icon={<UntitledIcon name="trophy" size={20} />}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.currentStreak')}
								value={15}
								suffix="days"
								icon={<UntitledIcon name="fire" size={20} />}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.sessionsThisMonth')}
								value={12}
								icon={<UntitledIcon name="calendar" size={20} />}
							/>
						</Col>
					</Row>
				</div>

				<div>
					<h2>With Trend Indicators</h2>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.romScore')}
								value={85}
								suffix="%"
								trend={12}
								icon={<UntitledIcon name="trophy" size={20} />}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.weeklySession')}
								value={8}
								trend={-5}
								icon={<UntitledIcon name="calendar" size={20} />}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.progressRate')}
								value={95}
								suffix="%"
								trend={25}
								icon={<UntitledIcon name="arrowUp" size={20} />}
							/>
						</Col>
					</Row>
				</div>

				<div>
					<h2>Loading States</h2>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.romScore')}
								value={85}
								suffix="%"
								loading={true}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.totalSessions')}
								value={42}
								loading={true}
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.currentStreak')}
								value={15}
								suffix="days"
								loading={true}
							/>
						</Col>
					</Row>
				</div>

				<div>
					<h2>String Values</h2>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8}>
							<MetricCard title={t('common.metrics.status')} value="Active" />
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard
								title={t('common.metrics.program')}
								value="Advanced"
							/>
						</Col>
						<Col xs={24} sm={12} md={8}>
							<MetricCard title={t('common.metrics.level')} value="Pro" />
						</Col>
					</Row>
				</div>

				<div>
					<h2>Full Featured Example</h2>
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={6}>
							<MetricCard
								title={t('common.metrics.romScore')}
								value={85}
								suffix="%"
								trend={12}
								icon={<UntitledIcon name="trophy" size={20} />}
								className="custom-metric-card"
							/>
						</Col>
						<Col xs={24} sm={12} md={6}>
							<MetricCard
								title={t('common.metrics.currentStreak')}
								value={15}
								suffix="days"
								trend={25}
								icon={<UntitledIcon name="fire" size={20} />}
							/>
						</Col>
						<Col xs={24} sm={12} md={6}>
							<MetricCard
								title={t('common.metrics.sessionsCompleted')}
								value={42}
								trend={8}
								icon={<UntitledIcon name="calendar" size={20} />}
							/>
						</Col>
						<Col xs={24} sm={12} md={6}>
							<MetricCard
								title={t('common.metrics.progressRate')}
								value={95}
								suffix="%"
								trend={18}
								icon={<UntitledIcon name="arrowUp" size={20} />}
							/>
						</Col>
					</Row>
				</div>
			</Space>
		</div>
	);
};

export default MetricCardExamples;
