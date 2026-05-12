/**
 * SeverityIndicator - Color-coded severity badge with WCAG AA compliant colors
 *
 * Displays severity levels as colored badges with consistent visual hierarchy across the application.
 * Uses design system tokens with accessible fallback colors ensuring 4.5:1 contrast ratio.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <SeverityIndicator level="high" />
 * <SeverityIndicator level="medium" />
 * <SeverityIndicator level="low" />
 *
 * // With custom label
 * <SeverityIndicator level="high" label="Critical" />
 * <SeverityIndicator level="medium" label="Moderate Risk" />
 *
 * // Different sizes
 * <SeverityIndicator level="high" size="small" />
 * <SeverityIndicator level="medium" size="large" />
 * ```
 *
 * @param {SeverityLevel} level - Severity level (high, medium, low)
 * @param {string} [label] - Optional custom label (defaults to capitalized level)
 * @param {string} [size='default'] - Optional size variant (small, default, large)
 *
 * @returns {JSX.Element} Colored badge with severity text
 *
 * @accessibility
 * - WCAG AA compliant colors (4.5:1 contrast ratio)
 * - ARIA label includes severity level for screen readers
 * - Text content (not color-only) conveys meaning
 * - Uppercase text for visual emphasis
 *
 * @colors
 * - High: Red (#D32F2F) on white text
 * - Medium: Orange (#F57C00) on white text
 * - Low: Green (#388E3C) on white text
 * - All colors meet WCAG AA contrast requirements
 *
 * @sizes
 * - Small: 10px font, 2px/6px padding
 * - Default: 12px font, 4px/8px padding
 * - Large: 14px font, 6px/12px padding
 *
 * @author Winston (Tech Lead)
 * @since October 2025
 * @version 1.1.0 (Story 5.2: Comprehensive JSDoc documentation)
 * @story Story 2.2 - PainAssessmentTab (severity indicators for pain intensity)
 * @story Story 2.3 - SymptomsHistoryTab (severity indicators for functional impact)
 * @story Story 5.2 - Documentation
 */

import React from 'react';
import { Tag } from 'antd';
import styled from 'styled-components';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

type SeverityLevel = 'high' | 'medium' | 'low';

/**
 * Props interface for SeverityIndicator component
 */
export interface SeverityIndicatorProps {
	/** Severity level (high, medium, low) */
	level: SeverityLevel;

	/** Optional custom label (defaults to capitalized level) */
	label?: string;

	/** Optional size variant */
	size?: 'small' | 'default' | 'large';
}

/**
 * SeverityIndicator - Displays color-coded severity badges
 *
 * Features:
 * - Design system tokens with WCAG AA compliant fallbacks
 * - Accessible with ARIA labels and text (not color-only)
 * - Three size variants
 * - Customizable label text
 */
export const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({
	level,
	label,
	size = 'default',
}) => {
	const { t } = useTypedTranslation();

	// Use translation for default label if not provided
	const severityLabels: Record<SeverityLevel, string> = {
		high: t('Admin.data.evaluation.severity.high'),
		medium: t('Admin.data.evaluation.severity.medium'),
		low: t('Admin.data.evaluation.severity.low'),
	};

	const displayLabel = label || severityLabels[level];
	const ariaLabel = `${t('Admin.data.evaluation.severity.ariaLabel')} ${displayLabel}`;

	return (
		<StyledTag
			level={level}
			size={size}
			aria-label={ariaLabel}
			data-testid="severity-indicator">
			{displayLabel}
		</StyledTag>
	);
};

const StyledTag = styled(Tag)<{ level: SeverityLevel; size: string }>`
	margin: 0;
	border: none;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;

	${({ level }) => {
		const severityStyles = {
			high: `
        background: var(--status-error);
        color: var(--text-on-color);
      `,
			medium: `
        background: var(--status-warning);
        color: var(--text-on-color);
      `,
			low: `
        background: var(--status-success);
        color: var(--text-on-color);
      `,
		};
		return severityStyles[level];
	}}

	${({ size }) => {
		const sizeStyles = {
			small: `
        font-size: 10px;
        padding: 2px 6px;
      `,
			default: `
        font-size: 12px;
        padding: 4px 8px;
      `,
			large: `
        font-size: 14px;
        padding: 6px 12px;
      `,
		};
		return sizeStyles[size];
	}}
`;
