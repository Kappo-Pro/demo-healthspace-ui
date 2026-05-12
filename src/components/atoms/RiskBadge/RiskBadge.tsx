/**
 * RiskBadge Atom Component
 *
 * Displays patient risk level with color-coded badge and accessibility support.
 * Used by Admin Triage Dashboard (Story 3.1).
 *
 * @module components/atoms/RiskBadge
 */

import React from 'react';
import { Tag } from 'antd';
import type { RiskLevel } from '@stores/posture/postureAnalytics/adminDashboard';

export interface RiskBadgeProps {
	/**
	 * Risk level to display
	 */
	riskLevel: RiskLevel;

	/**
	 * Optional size variant
	 * @default 'default'
	 */
	size?: 'small' | 'default' | 'large';

	/**
	 * Show icon alongside text
	 * @default true
	 */
	showIcon?: boolean;

	/**
	 * Optional className for custom styling
	 */
	className?: string;
}

/**
 * Risk level configuration
 */
const RISK_CONFIG = {
	high: {
		color: 'error',
		icon: '!!!',
		label: 'High Risk',
		ariaLabel: 'Risk level: High - Immediate attention required',
	},
	medium: {
		color: 'warning',
		icon: '!',
		label: 'Medium Risk',
		ariaLabel: 'Risk level: Medium - Monitor closely',
	},
	low: {
		color: 'success',
		icon: '✓',
		label: 'Low Risk',
		ariaLabel: 'Risk level: Low - Stable condition',
	},
	unknown: {
		color: 'default',
		icon: '?',
		label: 'Unknown',
		ariaLabel: 'Risk level: Unknown - Insufficient data',
	},
} as const;

/**
 * RiskBadge Component
 *
 * @example
 * ```tsx
 * <RiskBadge riskLevel="high" />
 * <RiskBadge riskLevel="medium" size="small" showIcon={false} />
 * ```
 */
export const RiskBadge: React.FC<RiskBadgeProps> = ({
	riskLevel,
	size = 'default',
	showIcon = true,
	className,
}) => {
	const config = RISK_CONFIG[riskLevel];

	return (
		<Tag
			color={config.color}
			className={className}
			aria-label={config.ariaLabel}
			role="status"
			style={{
				fontSize:
					size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
				fontWeight: 'var(--font-weight-medium)',
			}}>
			{showIcon && <span aria-hidden="true">{config.icon} </span>}
			{config.label}
		</Tag>
	);
};

RiskBadge.displayName = 'RiskBadge';

export default RiskBadge;
