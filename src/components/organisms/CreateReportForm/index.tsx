import { UntitledIcon } from '@atoms/Icon';
import { Button, Flex, Input, TreeSelect } from 'antd';
import React, { useMemo } from 'react';

import UploadExport from '@vitalflow-icons/general/uploadExport';
import ReportDateRangePicker from '@molecules/ReportDateRangePicker';
import ReportSectionHeader from '@molecules/ReportSectionHeader';
import { useTheme } from '@providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { CREATE_REPORT_RANGE_PRESETS } from './CreateReportForm.constants';
import { useCreateReportForm } from './CreateReportForm.hooks';
import { CreateReportFormProps } from './CreateReportForm.types';

export const CreateReportForm: React.FC<CreateReportFormProps> = props => {
	const { t } = useTranslation();
	const { isDark } = useTheme();
	const { values, updateField, handleSubmit, isSubmitting } =
		useCreateReportForm(props);

	const _iconColor = isDark ? 'stroke-white' : 'stroke-neutral-950';

	/**
	 * IMPORTANT:
	 * - Group nodes are CHECKABLE
	 * - NO selectable:false
	 * - NO disableCheckbox:true
	 * This enables parent <-> child sync
	 */
	const treeData = useMemo(
		() => [
			{
				value: 'evaluation',
				title: t('Admin.data.addToReports.evaluation') || 'Evaluation',
				key: 'evaluation',
			},
			{
				value: 'omniRom-group',
				title: (
					<span
						style={{
							fontWeight: 'var(--font-weight-semibold)',
							color: 'var(--text-secondary)',
						}}>
						{t('Admin.data.addToReports.omniRom') || 'VitalScan ROM'}
					</span>
				),
				key: 'omniRom-group',
				children: [
					{
						value: 'romSummary',
						title: t('Admin.data.addToReports.romSummary') || 'ROM Summary',
						key: 'romSummary',
					},
					{
						value: 'romCaptures',
						title: t('Admin.data.addToReports.captures') || 'ROM Captures',
						key: 'romCaptures',
					},
					{
						value: 'postureCaptures',
						title:
							t('Patient.data.postures.postureSummary') ||
							'Posture Summary',
						key: 'postureCaptures',
					},
				],
			},
			{
				value: 'letsMove-group',
				title: (
					<span
						style={{
							fontWeight: 'var(--font-weight-semibold)',
							color: 'var(--text-secondary)',
						}}>
						{t('Admin.data.managePatient.letsMove.letsMove') ||
							"Let's Move"}
					</span>
				),
				key: 'letsMove-group',
				children: [
					{
						value: 'letsMoveSessions',
						title: t('Admin.data.addToReports.sessions') || 'Sessions',
						key: 'letsMoveSessions',
					},
				],
			},
			{
				value: 'survey-group',
				title: (
					<span
						style={{
							fontWeight: 'var(--font-weight-semibold)',
							color: 'var(--text-secondary)',
						}}>
						{t('Admin.data.survey.survey') || 'Survey'}
					</span>
				),
				key: 'survey-group',
				children: [
					{
						value: 'surveySessions',
						title:
							t('Admin.data.survey.surveySummary') ||
							'Survey Summary',
						key: 'surveySessions',
					},
				],
			},
		],
		[t],
	);

	return (
		<>

			<Flex align="center" className="mb-4">
				<Input
					placeholder={t('Admin.data.addToReports.reportName')}
					value={values.reportName}
					onChange={e => updateField('reportName', e.target.value)}
					suffix={<UntitledIcon name="clipboard-check" size={20} />}
					style={{
						marginRight: 'var(--spacing-1)',
						flex: '6',
						height: 'var(--spacing-10)',
					}}
				/>

				<ReportDateRangePicker
					value={values.dateRange}
					onChange={dates => updateField('dateRange', dates)}
					presets={CREATE_REPORT_RANGE_PRESETS}
					style={{ flex: '4', marginLeft: 'var(--spacing-1)' }}
					format="MMMM D, YYYY"
				/>
			</Flex>

			<div
				style={{
					borderRadius: 'var(--radius-lg)',
					marginBottom: 'var(--spacing-2-5)',
				}}>
				<TreeSelect
					style={{ width: '100%' }}
					value={values.selectedSections}
					className="create-report-tree"
					placeholder={
						t('Admin.data.addToReports.selectSections') ||
						'Select report sections'
					}
					multiple
					treeCheckable
					treeCheckStrictly={false} // 🔑 enables parent-child sync
					showCheckedStrategy="SHOW_CHILD"
					treeDefaultExpandAll
					onChange={newValue =>
						updateField('selectedSections', newValue || [])
					}
					treeData={treeData}
					maxTagCount="responsive"
					dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
				/>
			</div>

			<Button
				onClick={handleSubmit}
				block
				disabled={isSubmitting}
				loading={isSubmitting}>
				<Flex align="center" justify="center" gap={8}>
					<UploadExport />
					{t('Admin.data.addToReports.create')}
				</Flex>
			</Button>
		</>
	);
};

export default CreateReportForm;
