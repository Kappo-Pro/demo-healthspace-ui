/**
 * ExportButton - PDF export button with loading and disabled states
 *
 * Button component for exporting evaluation data to PDF. Handles loading state with
 * spinner animation and provides helpful tooltip when disabled. Uses download icon
 * for clear visual affordance.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <ExportButton onClick={handleExport} />
 *
 * // With loading state
 * <ExportButton onClick={handleExport} loading={isExporting} />
 *
 * // Disabled with tooltip
 * <ExportButton onClick={handleExport} disabled={!hasEvaluation} />
 *
 * // All props
 * <ExportButton
 *   onClick={handleExport}
 *   loading={isExporting}
 *   disabled={!canExport}
 *   size="large"
 *   type="default"
 * />
 * ```
 *
 * @param {function} onClick - Callback when button is clicked
 * @param {boolean} [loading=false] - Optional loading spinner state
 * @param {boolean} [disabled=false] - Optional disabled state
 * @param {string} [size='middle'] - Optional Ant Design size
 * @param {string} [type='primary'] - Optional button type (primary, default, dashed)
 *
 * @returns {JSX.Element} Button with download icon and PDF export text
 *
 * @features
 * - Download icon (DownloadOutlined) for visual clarity
 * - Loading state shows spinner and "Exporting..." text
 * - Disabled state shows tooltip: "No evaluation selected"
 * - Three sizes: small, middle, large
 * - Three types: primary (blue), default (white), dashed
 * - Design system border-radius token
 *
 * @states
 * - Default: Shows download icon + "Export PDF"
 * - Loading: Shows spinner + "Exporting..." (onClick disabled)
 * - Disabled: Shows tooltip on hover, cursor not-allowed
 *
 * @author Winston (Tech Lead)
 * @since October 2025
 * @version 1.1.0 (Story 5.2: Comprehensive JSDoc documentation)
 * @story Story 2.1 - SummaryTab (export functionality)
 * @story Story 5.2 - Documentation
 */

import React from 'react';
import { Button, Tooltip } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

/**
 * Props interface for ExportButton component
 */
export interface ExportButtonProps {
	/** Callback when button is clicked */
	onClick: () => void;

	/** Optional: show loading spinner */
	loading?: boolean;

	/** Optional: disable button */
	disabled?: boolean;

	/** Optional: Ant Design size */
	size?: 'small' | 'middle' | 'large';

	/** Optional: button type */
	type?: 'primary' | 'default' | 'dashed';
}

/**
 * ExportButton - Button for exporting evaluation data to PDF
 *
 * Features:
 * - Download icon with "Export PDF" label
 * - Loading state with spinner and "Exporting..." text
 * - Disabled state with tooltip explaining why
 * - Multiple size and type variants
 * - Design system styling
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
	onClick,
	loading = false,
	disabled = false,
	size = 'middle',
	type = 'primary',
}) => {
	const { t } = useTypedTranslation();

	const buttonContent = (
		<StyledButton
			type={type}
			size={size}
			icon={loading ? undefined : <UntitledIcon name="download" size={16} />}
			loading={loading}
			disabled={disabled}
			onClick={onClick}
			data-testid="export-button"
		>
			{loading ? t('Admin.data.evaluation.export.exporting') : t('Admin.data.evaluation.export.buttonLabel')}
		</StyledButton>
	);

	// Show tooltip when disabled (but not when loading)
	if (disabled && !loading) {
		return <Tooltip title={t('Admin.data.evaluation.export.noEvaluationSelected')}>{buttonContent}</Tooltip>;
	}

	return buttonContent;
};

const StyledButton = styled(Button)`
	border-radius: var(--radius-sm);
	font-weight: 500;

	&:disabled {
		cursor: not-allowed;
	}
`;
