import React, { useEffect } from 'react';
import { Row, Col, Empty, Skeleton, Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { AssessmentStatusCard } from '@molecules';
import { useTypedSelector, useTypedDispatch } from '@stores/index';
import { fetchDashboardData, clearError } from '@stores/dashboard';
import { AssessmentStatusBannerProps } from './types';

/**
 * AssessmentStatusBanner Component
 *
 * Container component that displays assessment status cards (ROM, Posture, Survey)
 * in a responsive grid layout. Now connected to Redux for live data.
 *
 * @component
 * @example
 * ```tsx
 * <AssessmentStatusBanner className="custom-class" />
 * ```
 */
export const AssessmentStatusBanner: React.FC<
	Partial<AssessmentStatusBannerProps>
> = ({ className }) => {
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();

	// Read assessment statuses and loading state from Redux store
	const { rom, posture, survey } = useTypedSelector(
		state => state.dashboard.assessmentStatuses,
	);
	const loading = useTypedSelector(state => state.dashboard.loading);
	const error = useTypedSelector(state => state.dashboard.error);

	// Fetch dashboard data on component mount
	useEffect(() => {
		dispatch(fetchDashboardData());
	}, [dispatch]);

	// Handler for retry button
	const handleRetry = () => {
		dispatch(fetchDashboardData());
	};

	// Handler for dismissing error alert
	const handleDismiss = () => {
		dispatch(clearError());
	};

	// Handle loading state (display skeleton)
	if (loading) {
		return (
			<div className={className}>
				<Row gutter={[16, 16]}>
					{[1, 2, 3].map(i => (
						<Col xs={24} sm={12} md={8} key={i}>
							<Skeleton active paragraph={{ rows: 3 }} />
						</Col>
					))}
				</Row>
			</div>
		);
	}

	// Handle error state (display error alert with retry)
	if (error) {
		return (
			<div className={className}>
				<Alert
					message={t('Patient.data.errors.errorLoadingDashboard')}
					description={error}
					type="error"
					closable
					onClose={handleDismiss}
					action={
						<Button size="small" danger onClick={handleRetry}>
							Retry
						</Button>
					}
				/>
			</div>
		);
	}

	// Filter out null assessments and build array
	const assessments = [rom, posture, survey].filter(
		(assessment): assessment is NonNullable<typeof assessment> =>
			assessment !== null,
	);

	// Handle empty state (no assessments available)
	if (assessments.length === 0) {
		return (
			<div className={className}>
				<Empty
					description={t('Patient.data.assessment.noDataAvailable')}
					image={Empty.PRESENTED_IMAGE_SIMPLE}
				/>
			</div>
		);
	}

	return (
		<div className={className}>
			<Row gutter={[16, 16]}>
				{assessments.map(assessment => (
					<Col xs={24} sm={12} md={8} key={assessment.type}>
						<AssessmentStatusCard {...assessment} />
					</Col>
				))}
			</Row>
		</div>
	);
};

AssessmentStatusBanner.displayName = 'AssessmentStatusBanner';
