/**
 * VirtualizedPatientTable Component
 *
 * Virtualized table for large patient datasets (1000+ rows).
 * Uses react-window for performant rendering of large lists.
 *
 * Story 3.8: Performance Optimization (NFR2 - AC2)
 * @module components/organisms/OAdminTriageDashboard/VirtualizedPatientTable
 */

import React, { useMemo, useCallback, CSSProperties } from 'react';
import { List } from 'react-window';
import { Checkbox, Tag } from 'antd';
import { format, formatDistanceToNow } from 'date-fns';
import RiskBadge from '@atoms/RiskBadge';
import type { PatientPostureData } from '@stores/posture/postureAnalytics/adminDashboard';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import './VirtualizedPatientTable.css';

/**
 * Column definition
 */
interface Column {
	key: string;
	title: string;
	width: number;
	render: (patient: PatientPostureData) => React.ReactNode;
}

/**
 * Props for VirtualizedPatientTable
 */
export interface VirtualizedPatientTableProps {
	/** Patient data to display */
	patients: PatientPostureData[];
	/** Selected patient IDs */
	selectedPatientIds: string[];
	/** Callback when selection changes */
	onSelectionChange: (patientId: string) => void;
	/** Height of table container (default: 600px) */
	height?: number;
	/** Row height (default: 72px) */
	rowHeight?: number;
	/** Focused row index for keyboard navigation */
	focusedRowIndex?: number;
	/** Loading state */
	loading?: boolean;
}

/**
 * VirtualizedPatientTable Component
 *
 * Renders large patient lists efficiently using virtualization.
 * Only visible rows are rendered to the DOM.
 */
export const VirtualizedPatientTable: React.FC<
	VirtualizedPatientTableProps
> = ({
	patients,
	selectedPatientIds,
	onSelectionChange,
	height = 600,
	rowHeight = 72,
	focusedRowIndex = 0,
	loading = false,
}) => {
	const { t } = useTypedTranslation();

	/**
	 * Column definitions
	 */
	const columns: Column[] = useMemo(
		() => [
			{
				key: 'select',
				title: t('Admin.data.triage.table.columns.select'),
				width: 60,
				render: (patient: PatientPostureData) => (
					<Checkbox
						checked={selectedPatientIds.includes(patient.id)}
						onChange={() => onSelectionChange(patient.id)}
						aria-label={t('Admin.data.triage.selection.selectPatient', {
							name: patient.name,
						})}
					/>
				),
			},
			{
				key: 'name',
				title: t('Admin.data.triage.table.columns.patientName'),
				width: 240,
				render: (patient: PatientPostureData) => (
					<div>
						<div style={{ fontWeight: 'var(--font-weight-medium)' }}>{patient.name}</div>
						<div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
							{patient.email}
						</div>
					</div>
				),
			},
			{
				key: 'lastScan',
				title: t('Admin.data.triage.table.columns.lastScan'),
				width: 180,
				render: (patient: PatientPostureData) => (
					<div>
						<div>{format(new Date(patient.lastScanDate), 'MMM d, yyyy')}</div>
						<div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
							{formatDistanceToNow(new Date(patient.lastScanDate), {
								addSuffix: true,
							})}
						</div>
					</div>
				),
			},
			{
				key: 'riskLevel',
				title: t('Admin.data.triage.table.columns.riskLevel'),
				width: 120,
				render: (patient: PatientPostureData) => (
					<RiskBadge riskLevel={patient.riskLevel} />
				),
			},
			{
				key: 'postureScore',
				title: t('Admin.data.triage.table.columns.postureScore'),
				width: 140,
				render: (patient: PatientPostureData) => (
					<div>
						<div style={{ fontWeight: 'var(--font-weight-medium)' }}>{patient.postureScore}%</div>
						<div
							style={{
								width: 60,
								height: 4,
								backgroundColor: 'var(--color-border)',
								borderRadius: 2,
								overflow: 'hidden',
								marginTop: 4,
							}}>
							<div
								style={{
									width: `${patient.postureScore}%`,
									height: '100%',
									backgroundColor:
										patient.postureScore >= 70
											? 'var(--color-success)'
											: patient.postureScore >= 50
												? 'var(--color-warning)'
												: 'var(--color-danger)',
								}}
							/>
						</div>
					</div>
				),
			},
			{
				key: 'status',
				title: t('Admin.data.triage.table.columns.status'),
				width: 120,
				render: (patient: PatientPostureData) => {
					const statusConfig = {
						excellent: {
							color: 'success',
							label: t('Admin.data.triage.status.excellent'),
						},
						good: { color: 'success', label: t('Admin.data.triage.status.good') },
						fair: { color: 'warning', label: t('Admin.data.triage.status.fair') },
						poor: { color: 'error', label: t('Admin.data.triage.status.poor') },
						critical: {
							color: 'error',
							label: t('Admin.data.triage.status.critical'),
						},
					};
					const config = statusConfig[patient.status];
					return <Tag color={config.color}>{config.label}</Tag>;
				},
			},
			{
				key: 'clinician',
				title: t('Admin.data.triage.table.columns.assignedClinician'),
				width: 180,
				render: (patient: PatientPostureData) =>
					patient.assignedClinician || (
						<span style={{ color: 'var(--color-text-tertiary)' }}>
							{t('Admin.data.triage.table.unassigned')}
						</span>
					),
			},
		],
		[selectedPatientIds, onSelectionChange, t],
	);

	/**
	 * Calculate total width for horizontal scrolling
	 */
	const totalWidth = useMemo(
		() => columns.reduce((sum, col) => sum + col.width, 0),
		[columns],
	);

	/**
	 * Render table header
	 */
	const renderHeader = useCallback(() => {
		return (
			<div
				className="virtualized-table-header"
				style={{
					width: totalWidth,
					display: 'flex',
					alignItems: 'center',
					height: 48,
					borderBottom: '1px solid var(--color-border)',
					backgroundColor: 'var(--color-bg-container)',
					position: 'sticky',
					top: 0,
					zIndex: 10,
				}}>
				{columns.map(col => (
					<div
						key={col.key}
						style={{
							width: col.width,
							padding: '0 var(--spacing-4)',
							fontWeight: 'var(--font-weight-semibold)',
							fontSize: 'var(--font-size-sm)',
							color: 'var(--color-text)',
						}}>
						{col.title}
					</div>
				))}
			</div>
		);
	}, [columns, totalWidth]);

	/**
	 * Render individual row
	 */
	const Row = useCallback(
		({ index, style }: { index: number; style: CSSProperties }) => {
			const patient = patients[index];
			const isSelected = selectedPatientIds.includes(patient.id);
			const isFocused = index === focusedRowIndex;

			return (
				<div
					style={{
						...style,
						display: 'flex',
						alignItems: 'center',
						borderBottom: '1px solid var(--color-border-secondary)',
						backgroundColor: isSelected
							? 'var(--color-primary-bg)'
							: isFocused
								? 'var(--color-fill-quaternary)'
								: 'var(--color-bg-container)',
						cursor: 'pointer',
						transition: 'background-color 0.2s',
					}}
					className="virtualized-table-row"
					onClick={() => onSelectionChange(patient.id)}
					role="row"
					aria-selected={isSelected}
					aria-label={`Patient ${patient.name}`}
					tabIndex={isFocused ? 0 : -1}>
					{columns.map(col => (
						<div
							key={col.key}
							style={{
								width: col.width,
								padding: 'var(--spacing-3) var(--spacing-4)',
							}}
							role="cell">
							{col.render(patient)}
						</div>
					))}
				</div>
			);
		},
		[patients, selectedPatientIds, focusedRowIndex, columns, onSelectionChange],
	);

	/**
	 * Render loading state
	 */
	if (loading) {
		return (
			<div
				style={{
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'var(--color-text-secondary)',
				}}>
				{t('Admin.data.triage.table.loadingPatients')}
			</div>
		);
	}

	/**
	 * Render empty state
	 */
	if (patients.length === 0) {
		return (
			<div
				style={{
					height,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: 'var(--color-text-secondary)',
				}}>
				{t('Admin.data.triage.table.noPatients')}
			</div>
		);
	}

	return (
		<div
			className="virtualized-table-container"
			role="table"
			aria-label={t('Admin.data.triage.table.patientListTable')}
			aria-rowcount={patients.length}>
			{renderHeader()}
			<List
				height={height - 48} // Subtract header height
				itemCount={patients.length}
				itemSize={rowHeight}
				width="100%"
				overscanCount={5} // Render 5 extra rows above/below viewport for smoother scrolling
			>
				{Row}
			</List>
		</div>
	);
};

VirtualizedPatientTable.displayName = 'VirtualizedPatientTable';

export default VirtualizedPatientTable;
