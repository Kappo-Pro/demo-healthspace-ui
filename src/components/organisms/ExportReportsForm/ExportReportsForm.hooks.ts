import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getTags } from '@stores/shared/settings/settings';
import axios from 'axios';
import {
	ExportReportFormValues,
	ExportReportFormProps,
} from '../CreateReportForm/CreateReportForm.types';
import {
	formatExportDateRange,
	getExportFileName,
	downloadBlob,
} from '../CreateReportForm/CreateReportForm.utils';
import { DEFAULT_EXPORT_REPORT_VALUES } from '../CreateReportForm/CreateReportForm.constants';

export const useExportReportsForm = ({
	onSuccess,
	onError,
}: ExportReportFormProps = {}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	const getSavedTags = useTypedSelector(state => state.settings.advanced.tags);

	const [values, setValues] = useState<ExportReportFormValues>(
		DEFAULT_EXPORT_REPORT_VALUES,
	);
	const [isExporting, setIsExporting] = useState(false);

	useEffect(() => {
		dispatch(getTags());
	}, [dispatch]);

	const updateField = <K extends keyof ExportReportFormValues>(
		field: K,
		value: ExportReportFormValues[K],
	) => {
		setValues(prev => ({ ...prev, [field]: value }));
	};

	const resetForm = () => {
		setValues(DEFAULT_EXPORT_REPORT_VALUES);
	};

	const handleExport = async () => {
		if (!values.dateRange || !values.dateRange[0] || !values.dateRange[1]) {
			const errorMessage = t('Admin.data.addToReports.dateErr');
			message.error(errorMessage);
			onError?.(errorMessage);
			return;
		}

		const [startDate, endDate] = values.dateRange;
		const formattedStartDate = formatExportDateRange(startDate, false);
		const formattedEndDate = formatExportDateRange(endDate, true);

		const payload = {
			startDate: formattedStartDate,
			endDate: formattedEndDate,
			tags: values.tags.length > 0 ? values.tags : [],
		};

		try {
			setIsExporting(true);
			const tagsParam = JSON.stringify(payload.tags);
			const response = await axios.get(
				`/reports/aggregate/excel?startDate=${payload.startDate}&endDate=${payload.endDate}&tags=${encodeURIComponent(tagsParam)}`,
				{
					responseType: 'blob',
				},
			);

			const disposition = response.headers['content-disposition'];
			const fileName = getExportFileName(
				disposition,
				payload.startDate,
				payload.endDate,
			);

			downloadBlob(new Blob([response.data]), fileName);

			message.success(
				t('Admin.data.addToReports.exportSuccess') ||
					'Export completed successfully',
			);
			onSuccess?.();
		} catch (error) {
			const errorMessage = t('Admin.data.addToReports.dateLimitWarning');
			message.warning(errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsExporting(false);
		}
	};

	return {
		values,
		updateField,
		handleExport,
		resetForm,
		isExporting,
		getSavedTags,
	};
};
