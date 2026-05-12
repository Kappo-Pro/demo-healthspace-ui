import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { createReport } from '@stores/content/report/reports';
import { setActiveTab } from '@stores/shared/patientDetail/patientDetail';
import { router } from '@routers/routers';
import {
	CreateReportFormValues,
	CreateReportFormProps,
} from './CreateReportForm.types';
import {
	validateCreateReportForm,
	transformToCreateReportPayload,
} from './CreateReportForm.utils';
import { DEFAULT_CREATE_REPORT_VALUES } from './CreateReportForm.constants';

export const useCreateReportForm = ({
	onSuccess,
	onError,
}: CreateReportFormProps = {}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();

	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const user = useTypedSelector(state => state.user);

	const [values, setValues] = useState<CreateReportFormValues>(
		DEFAULT_CREATE_REPORT_VALUES,
	);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateField = <K extends keyof CreateReportFormValues>(
		field: K,
		value: CreateReportFormValues[K],
	) => {
		setValues(prev => ({ ...prev, [field]: value }));
	};

	const resetForm = () => {
		setValues(DEFAULT_CREATE_REPORT_VALUES);
	};

	const getValidationErrorMessage = (errorKey: string | undefined): string => {
		if (!errorKey) {
			return t('Admin.data.addToReports.createError');
		}

		// Map validation error keys to translation keys
		switch (errorKey) {
			case 'Admin.data.addToReports.reportNameErr':
				return t('Admin.data.addToReports.reportNameErr');
			case 'Admin.data.addToReports.dateErr':
				return t('Admin.data.addToReports.dateErr');
			default:
				return t('Admin.data.addToReports.createError');
		}
	};

const handleSubmit = async () => {
	const validation = validateCreateReportForm(values);

	if (!validation.isValid) {
		const errorMessage = getValidationErrorMessage(validation.error);
		message.error(errorMessage);
		onError?.(errorMessage);
		return;
	}

	const userId = user.isPhysioterapist ? selectedUser.id : user.id;
	const payload = transformToCreateReportPayload(values, userId);

	try {
		setIsSubmitting(true);

		const data = await dispatch(createReport(payload)).unwrap();

		if (data) {
			message.success(t('Admin.data.addToReports.createSuccess'));
			resetForm();
			navigate(`/${userId}${router.AIASSISTANT_MY_REPORT}`);
			dispatch(setActiveTab('createReport'));
			onSuccess?.();
		}
	} catch (error) {
		const apiMessage = error || t('Admin.data.addToReports.createError');

		message.error(apiMessage);
		onError?.(apiMessage);
	} finally {
		setIsSubmitting(false);
	}
};


	return {
		values,
		updateField,
		handleSubmit,
		resetForm,
		isSubmitting,
		user,
	};
};
