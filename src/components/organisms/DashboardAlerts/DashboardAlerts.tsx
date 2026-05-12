/**
 * DashboardAlerts - Organism Component
 *
 * Container component that displays active dashboard alerts from Redux state.
 * Alerts are evaluated based on rules and displayed in priority order.
 *
 * EPIC-015-S1: Dashboard Alert Display Container
 * EPIC-015-S2: Alert Dismissal Integration
 * EPIC-016-S2: Integrated useDismissedAlerts hook for persistence
 */

import React, { useCallback, useMemo } from 'react';
import { Space } from 'antd';
import { useTypedSelector, useTypedDispatch } from '@stores/index';
import { selectActiveAlerts, dismissAlert } from '@stores/dashboard';
import { useDismissedAlerts } from '@hooks/useDismissedAlerts';
import { AlertCard } from '@molecules/AlertCard';
import { DashboardAlertsProps } from './types';

/**
 * DashboardAlerts Component
 *
 * Renders a vertical stack of alert cards from Redux state.
 * Returns null if no alerts are active.
 * EPIC-015-S2: Added alert dismissal handling
 * EPIC-016-S2: Added localStorage persistence for dismissed alerts
 *
 * @component
 * @example
 * ```tsx
 * <DashboardAlerts className="my-alerts" maxAlerts={3} />
 * ```
 */
export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({
	className,
	maxAlerts = 3,
}) => {
	// Fetch active alerts from Redux using memoized selector
	const alerts = useTypedSelector(selectActiveAlerts);
	const dispatch = useTypedDispatch();

	// EPIC-016-S2: Get user ID from Redux state for localStorage persistence
	const userId = useTypedSelector(state => state.user?.id || 'guest');

	// EPIC-016-S2: Initialize dismissed alerts hook with user ID
	const { dismissedAlertIds, dismissAlert: persistDismiss } = useDismissedAlerts(userId);

	// EPIC-016-S2: Filter out dismissed alerts before rendering
	const visibleAlerts = useMemo(() => {
		return alerts.filter(alert => !dismissedAlertIds.includes(alert.id));
	}, [alerts, dismissedAlertIds]);

	/**
	 * EPIC-015-S2: Handle alert dismissal
	 * EPIC-016-S2: Now persists dismissal to localStorage
	 *
	 * Dispatches dismissAlert action to remove alert from Redux state (immediate UI update)
	 * and calls persistDismiss to save to localStorage (prevent re-showing)
	 */
	const handleDismiss = useCallback((alertId: string) => {
		// Dismiss in Redux (immediate UI update)
		dispatch(dismissAlert(alertId));
		// Persist to localStorage (prevent re-showing)
		persistDismiss(alertId);
	}, [dispatch, persistDismiss]);

	// Return null if no visible alerts (no empty container)
	if (!visibleAlerts || visibleAlerts.length === 0) {
		return null;
	}

	// Limit alerts to maxAlerts count
	const displayedAlerts = visibleAlerts.slice(0, maxAlerts);

	return (
		<div className={className}>
			<Space direction="vertical" size="middle" style={{ width: '100%' }}>
				{displayedAlerts.map(alert => (
					<AlertCard
						key={alert.id}
						alert={alert}
						onDismiss={handleDismiss}
					/>
				))}
			</Space>
		</div>
	);
};

DashboardAlerts.displayName = 'DashboardAlerts';
