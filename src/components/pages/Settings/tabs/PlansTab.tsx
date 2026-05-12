/**
 * PlansTab Component
 *
 * Epic 3 - Story 3.2: Refactor PlansTab with Validation
 */

import { useAuth } from '@hooks/useAuth';
import { SettingCard } from '@molecules/SettingCard';
import { HtmlSanitizer } from '@services/security';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { selectContentLibraryTabData } from '@stores/settings/selectors';
import { fetchPlans } from '@stores/settings/settingsSlice';
import {
	useGetPlansByClientIdQuery,
	useGetPlansByUserIdQuery,
	usePostPlanByClientIdMutation,
	useUpdatePlanByUserIdMutation,
} from '@stores/shared/settings/settingsApi';
import { Button, Flex, Popover, Select, message } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';

const { Option } = Select;

/**
 * Plan type to display name mapping
 */
const PLAN_TYPE_LABELS: Record<string, string> = {
	virtualPt: 'Plan 3',
	earlyIntervention: 'Plan 2',
	screening: 'Plan 1',
};

/**
 * Format HTML description for popover display
 */
const formatDescription = (description: string) => {
	const formattedStr = description
		.replace(/<p>/g, '<li style="margin-bottom: 10px;">')
		.replace(/<\/p>/g, '</li>');

	const sanitized = HtmlSanitizer.sanitizePlanDescription(formattedStr);

	return (
		<ul
			style={{ listStyle: 'disc', listStylePosition: 'inside' }}
			dangerouslySetInnerHTML={{ __html: sanitized }}
		/>
	);
};

interface PlanSelectValue {
	value: string;
	label: string;
}

interface PlansFormState {
	defaultPlanType: PlanSelectValue | null;
	upgradePlanType: PlanSelectValue | null;
}

export const PlansTab: React.FC = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const dispatch = useTypedDispatch();

	const [shouldFetch, setShouldFetch] = useState(false);

	useEffect(() => {
		setShouldFetch(true);
	}, []);

	const { plans } = useTypedSelector(selectContentLibraryTabData);

	const { data: defaultPlanData, isLoading: isLoadingDefaultPlan } =
		useGetPlansByUserIdQuery(user?.id || '', {
			skip: !shouldFetch || !user?.id,
		});

	const { data: upgradePlanData, isLoading: isLoadingUpgradePlan } =
		useGetPlansByClientIdQuery(undefined, {
			skip: !shouldFetch,
		});

	const [updateDefaultPlan, { isLoading: isSavingDefaultPlan }] =
		useUpdatePlanByUserIdMutation();
	const [updateUpgradePlan, { isLoading: isSavingUpgradePlan }] =
		usePostPlanByClientIdMutation();

	const serverDefaultPlanType = defaultPlanData?.planType || '';
	const serverUpgradePlanType = upgradePlanData?.planType || '';

	const buildSelectValue = (planType: string): PlanSelectValue | null => {
		const plan = plans?.find(p => p.planType === planType);
		if (!plan) return null;

		return {
			value: plan.planType,
			label: `${PLAN_TYPE_LABELS[plan.planType]} - ${plan.title}`,
		};
	};

	const [formValues, setFormValues] = useState<PlansFormState>({
		defaultPlanType: null,
		upgradePlanType: null,
	});

	useEffect(() => {
		setFormValues({
			defaultPlanType: buildSelectValue(serverDefaultPlanType),
			upgradePlanType: buildSelectValue(serverUpgradePlanType),
		});
	}, [serverDefaultPlanType, serverUpgradePlanType, plans]);

	const isDirty = useMemo(() => {
		return (
			formValues.defaultPlanType?.value !== serverDefaultPlanType ||
			formValues.upgradePlanType?.value !== serverUpgradePlanType
		);
	}, [
		formValues.defaultPlanType,
		formValues.upgradePlanType,
		serverDefaultPlanType,
		serverUpgradePlanType,
	]);

	useUnsavedChanges({
		hasChanges: isDirty,
		message: t('Admin.settings.plansTab.unsavedChanges'),
	});

	useEffect(() => {
		dispatch(fetchPlans());
	}, [dispatch]);

	const isLoading =
		isLoadingDefaultPlan ||
		isLoadingUpgradePlan ||
		isSavingDefaultPlan ||
		isSavingUpgradePlan;

	const getPlanLevel = (planType: string): number => {
		switch (planType) {
			case 'screening':
				return 1;
			case 'earlyIntervention':
				return 2;
			case 'virtualPt':
				return 3;
			default:
				return 0;
		}
	};

	const handleSave = async () => {
		try {
			const finalUpgradePlanType = formValues.upgradePlanType?.value || '';
			let finalDefaultPlanType = formValues.defaultPlanType?.value || '';

			const upgradeLevel = getPlanLevel(finalUpgradePlanType);
			const defaultLevel = getPlanLevel(finalDefaultPlanType);

			if (upgradeLevel < defaultLevel) {
				const downgraded = buildSelectValue(finalUpgradePlanType);
				if (downgraded) {
					setFormValues(prev => ({
						...prev,
						defaultPlanType: downgraded,
					}));
				}
				finalDefaultPlanType = finalUpgradePlanType;
			}

			if (finalUpgradePlanType !== serverUpgradePlanType) {
				await updateUpgradePlan({
					clientId: user?.clientId,
					planType: finalUpgradePlanType,
				}).unwrap();
			}

			if (finalDefaultPlanType !== serverDefaultPlanType) {
				await updateDefaultPlan({
					userId: user?.id!,
					planType: finalDefaultPlanType,
				}).unwrap();
			}

			message.success(
				t('Admin.settings.plansTab.saveSuccess') || 'Plans saved successfully',
			);
		} catch (err) {
			message.error(
				t('Admin.settings.plansTab.saveError') || 'Failed to save plans',
			);
		}
	};

	const filteredDefaultPlans = useMemo(() => {
		if (!formValues.upgradePlanType) return plans;

		const upgradeLevel = getPlanLevel(formValues.upgradePlanType.value);
		return plans?.filter(p => getPlanLevel(p.planType) <= upgradeLevel);
	}, [plans, formValues.upgradePlanType]);

	return (
		<div>
			<SettingCard
				label={t('Admin.settings.plansTab.defaultPlan.label')}
				description={t('Admin.settings.plansTab.defaultPlan.description')}
				loading={isLoadingDefaultPlan}>
				<Select
					labelInValue
					value={formValues.defaultPlanType}
					onChange={value =>
						setFormValues(prev => ({ ...prev, defaultPlanType: value }))
					}
					className="theme-select-dropdown"
					disabled={isLoading}
					style={{ width: 'max-content' }}
					dropdownStyle={{ width: 'max-content' }}
					popupMatchSelectWidth={false}
					optionLabelProp="label">
					{filteredDefaultPlans?.map(plan => {
						const label = `${PLAN_TYPE_LABELS[plan.planType]} - ${plan.title}`;
						return (
							<Option key={plan.id} value={plan.planType} label={label}>
								<Popover
									content={
										<div style={{ maxWidth: 400 }}>
											{plan.description
												? formatDescription(plan.description)
												: 'No description available'}
										</div>
									}
									placement="right">
									<div>{label}</div>
								</Popover>
							</Option>
						);
					})}
				</Select>
			</SettingCard>

			<SettingCard
				label={t('Admin.settings.plansTab.upgradePlan.label')}
				description={t('Admin.settings.plansTab.upgradePlan.description')}
				loading={isLoadingUpgradePlan}>
				<Select
					labelInValue
					value={formValues.upgradePlanType}
					onChange={value =>
						setFormValues(prev => ({ ...prev, upgradePlanType: value }))
					}
					className="theme-select-dropdown"
					disabled={isLoading}
					allowClear
					style={{ width: 'max-content' }}
					dropdownStyle={{ width: 'max-content' }}
					popupMatchSelectWidth={false}
					optionLabelProp="label">
					{plans?.map(plan => {
						const label = `${PLAN_TYPE_LABELS[plan.planType]} - ${plan.title}`;
						return (
							<Option key={plan.id} value={plan.planType} label={label}>
								<Popover
									content={
										<div style={{ maxWidth: 400 }}>
											{plan.description
												? formatDescription(plan.description)
												: 'No description available'}
										</div>
									}
									placement="right">
									<div>{label}</div>
								</Popover>
							</Option>
						);
					})}
				</Select>
			</SettingCard>

			<Flex justify="flex-end" style={{ marginTop: 24 }}>
				<Button
					type="primary"
					size="large"
					onClick={handleSave}
					disabled={!isDirty}
					loading={isLoading}>
					{t('Admin.settings.plansTab.saveChanges')}
				</Button>
			</Flex>
		</div>
	);
};

export default PlansTab;
