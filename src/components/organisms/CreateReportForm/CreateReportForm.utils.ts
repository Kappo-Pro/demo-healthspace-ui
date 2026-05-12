import { Dayjs } from 'dayjs';
import {
	CreateReportFormValues,
	CreateReportPayload,
} from './CreateReportForm.types';

/**
 * Formats a date to ISO string with specific time boundaries
 */
export const formatDateForReport = (date: Dayjs, isEndDate = false): string => {
	if (isEndDate) {
		return date
			.add(1, 'day')
			.hour(23)
			.minute(59)
			.second(59)
			.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
	}

	return date.hour(0).minute(1).second(1).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
};

/**
 * Validates report form values
 */
export const validateCreateReportForm = (
	values: CreateReportFormValues,
): { isValid: boolean; error?: string } => {
	if (!values.reportName.trim()) {
		return { isValid: false, error: 'Admin.data.addToReports.reportNameErr' };
	}

	if (!values.dateRange || !values.dateRange[0] || !values.dateRange[1]) {
		return { isValid: false, error: 'Admin.data.addToReports.dateErr' };
	}

	return { isValid: true };
};

/**
 * Transforms form values to API payload
 */
export const transformToCreateReportPayload = (
	values: CreateReportFormValues,
	userId: string,
): CreateReportPayload => {
	// Validation should ensure dateRange exists before calling this function
	if (!values.dateRange?.[0] || !values.dateRange?.[1]) {
		throw new Error('Date range is required');
	}

	const [startDate, endDate] = values.dateRange;
	const selectedSet = new Set(values.selectedSections);

	return {
		userId,
		name: values.reportName,
		evaluation: selectedSet.has('evaluation'),
		romSummary: selectedSet.has('romSummary'),
		romCaptures: selectedSet.has('romCaptures'),
		letsMoveSessions: selectedSet.has('letsMoveSessions'),
		postureResults: selectedSet.has('postureCaptures'),
		surveyResults: selectedSet.has('surveySessions'),
		startDate: formatDateForReport(startDate, false),
		endDate: formatDateForReport(endDate, true),
	};
};

/**
 * Formats export date range
 */
export const formatExportDateRange = (
	date: Dayjs,
	isEndDate = false,
): string => {
	if (isEndDate) {
		return date.hour(23).minute(59).second(59).format('YYYY-MM-DD');
	}
	return date.hour(0).minute(1).second(1).format('YYYY-MM-DD');
};

/**
 * Generates export file name from response headers
 */
export const getExportFileName = (
	disposition: string | undefined,
	startDate: string | null,
	endDate: string | null,
): string => {
	if (disposition && disposition.includes('filename=')) {
		const match = disposition.match(/filename="?([^"]+)"?/);
		if (match && match[1]) {
			return match[1];
		}
	}

	return `${location.hostname} Export ${startDate} - ${endDate}.xlsx`;
};

/**
 * Downloads blob as file
 */
export const downloadBlob = (blob: Blob, fileName: string): void => {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.setAttribute('download', fileName);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};
