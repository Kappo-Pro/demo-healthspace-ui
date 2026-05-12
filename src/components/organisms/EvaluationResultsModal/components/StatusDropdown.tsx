/**
 * StatusDropdown - Evaluation status management with smart confirmation logic
 *
 * Dropdown component for changing evaluation status with automatic confirmation modals
 * for backward status changes (e.g., Completed → Pending). Prevents accidental status
 * downgrades while allowing forward progression without friction.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <StatusDropdown
 *   currentStatus="pending"
 *   onChange={(status) => handleStatusChange(status)}
 * />
 *
 * // With all props
 * <StatusDropdown
 *   currentStatus="in-review"
 *   onChange={(status) => updateStatus(status)}
 *   disabled={!hasPermission}
 *   size="large"
 * />
 * ```
 *
 * @param {Status} currentStatus - Current evaluation status
 * @param {function} onChange - Callback when status changes
 * @param {boolean} [disabled=false] - Optional disable state
 * @param {string} [size='middle'] - Optional Ant Design size
 *
 * @returns {JSX.Element} Dropdown with 4 status options and color indicators
 *
 * @features
 * - Four status options: Pending (orange), In Review (blue), Completed (green), Archived (gray)
 * - Smart confirmation for backward status changes
 * - Color indicators (8px dots) for visual status identification
 * - Full keyboard navigation (Enter, Arrow keys, Escape)
 * - Warning icon and message in confirmation modal
 *
 * @businessLogic
 * - Forward changes (Pending → In Review → Completed → Archived) do not require confirmation
 * - Backward changes (Completed → Pending, Archived → any) show confirmation modal
 * - Status order: pending (0) < in-review (1) < completed (2) < archived (3)
 * - Archived → any other status is always considered backward
 * - Same status selection is ignored (no-op)
 *
 * @confirmation
 * - Title: "Confirm Status Change"
 * - Icon: Warning (orange)
 * - Message: "Are you sure you want to change status from {Current} to {New}? This action may require justification."
 * - Buttons: "Confirm" (danger), "Cancel"
 *
 * @author Winston (Tech Lead)
 * @since October 2025
 * @version 1.2.0 (Story 5.2: Comprehensive JSDoc documentation)
 * @story Story 2.1 - SummaryTab (status management)
 * @story Story 5.2 - Documentation
 */

import React from 'react';
import { Select, Modal } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

export type Status = 'pending' | 'in-review' | 'completed' | 'archived';

/**
 * Props interface for StatusDropdown component
 */
export interface StatusDropdownProps {
	/** Current evaluation status */
	currentStatus: Status;

	/** Callback when status changes */
	onChange: (newStatus: Status) => void;

	/** Optional: disable dropdown */
	disabled?: boolean;

	/** Optional: Ant Design size */
	size?: 'small' | 'middle' | 'large';
}

interface StatusOption {
	value: Status;
	label: string;
	color: string;
}

// Status options will be populated using translations in component

/**
 * StatusDropdown - Dropdown for evaluation status management
 *
 * Features:
 * - Four status options: Pending, In Review, Completed, Archived
 * - Smart confirmation for backward status changes
 * - Color indicators for each status
 * - Full keyboard navigation
 *
 * Business Logic:
 * - Forward changes (Pending → In Review) do not require confirmation
 * - Backward changes (Completed → Pending) show confirmation modal
 * - Archived → Any other status is considered backward
 */
export const StatusDropdown: React.FC<StatusDropdownProps> = ({
	currentStatus,
	onChange,
	disabled = false,
	size = 'middle',
}) => {
	const { t } = useTypedTranslation();
	/**
	 * Check if status change is backward (requires confirmation)
	 *
	 * @param current - Current status
	 * @param next - Next status
	 * @returns True if backward change (requires confirmation)
	 */
	const isBackwardChange = (current: Status, next: Status): boolean => {
		const statusOrder = ['pending', 'in-review', 'completed', 'archived'];
		const currentIndex = statusOrder.indexOf(current);
		const nextIndex = statusOrder.indexOf(next);

		// Archived to any other is backward
		if (current === 'archived' && next !== 'archived') return true;

		// Any higher status to lower is backward (except archived)
		return currentIndex > nextIndex;
	};

	/**
	 * Handle status change with optional confirmation
	 */
	const handleStatusChange = (newStatus: Status) => {
		if (newStatus === currentStatus) return;

		if (isBackwardChange(currentStatus, newStatus)) {
			// Show confirmation modal for backward changes
			Modal.confirm({
				title: t('Admin.data.evaluation.statusDropdown.confirmation.title'),
				icon: (
					<UntitledIcon
						name="exclamationCircle"
						size={20}
						style={{ color: 'var(--status-warning)' }}
					/>
				),
				content: (
					<ConfirmationContent>
						<span dangerouslySetInnerHTML={{ 
							__html: t('Admin.data.evaluation.statusDropdown.confirmation.message', {
								currentStatus: getStatusLabel(currentStatus),
								newStatus: getStatusLabel(newStatus)
							})
						}} />
						<br />
						{t('Admin.data.evaluation.statusDropdown.confirmation.justificationNote')}
					</ConfirmationContent>
				),
				okText: t('Admin.data.evaluation.statusDropdown.confirmation.confirmButton'),
				okType: 'danger',
				cancelText: t('Admin.data.evaluation.statusDropdown.confirmation.cancelButton'),
				onOk: () => {
					onChange(newStatus);
				},
			});
		} else {
			// Forward change - no confirmation needed
			onChange(newStatus);
		}
	};

	/**
	 * Get human-readable label for status
	 */
	const getStatusLabel = (status: Status): string => {
		const labels: Record<Status, string> = {
			pending: t('Admin.data.evaluation.statusDropdown.labels.pending'),
			'in-review': t('Admin.data.evaluation.statusDropdown.labels.inReview'),
			completed: t('Admin.data.evaluation.statusDropdown.labels.completed'),
			archived: t('Admin.data.evaluation.statusDropdown.labels.archived'),
		};
		return labels[status] || status;
	};

	const statusOptions: StatusOption[] = [
		{ value: 'pending', label: t('Admin.data.evaluation.statusDropdown.labels.pending'), color: 'var(--status-warning)' },
		{ value: 'in-review', label: t('Admin.data.evaluation.statusDropdown.labels.inReview'), color: 'var(--status-info)' },
		{ value: 'completed', label: t('Admin.data.evaluation.statusDropdown.labels.completed'), color: 'var(--status-success)' },
		{ value: 'archived', label: t('Admin.data.evaluation.statusDropdown.labels.archived'), color: 'var(--text-tertiary)' },
	];

	return (
		<StyledSelect
			value={currentStatus}
			onChange={handleStatusChange}
			disabled={disabled}
			size={size}
			style={{ minWidth: 150 }}
			data-testid="status-dropdown">
			{statusOptions.map(option => (
				<Select.Option key={option.value} value={option.value}>
					<StatusOption>
						<StatusIndicator color={option.color} />
						{option.label}
					</StatusOption>
				</Select.Option>
			))}
		</StyledSelect>
	);
};

const StyledSelect = styled(Select)`
	.ant-select-selector {
		border-radius: var(--radius-sm) !important;
	}
` as typeof Select;

const StatusOption = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-2);
`;

const StatusIndicator = styled.span<{ color: string }>`
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: ${({ color }) => color};
`;

const ConfirmationContent = styled.div`
	margin-top: var(--spacing-2);
	line-height: 1.6;

	strong {
		color: var(--text-primary);
		font-weight: 600;
	}
`;
