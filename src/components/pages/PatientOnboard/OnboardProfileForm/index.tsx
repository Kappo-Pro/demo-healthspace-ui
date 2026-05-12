import { UntitledIcon } from '@atoms/Icon';
import { OnboardProfileSkeleton } from '@atoms/Skeletons';
import { OnboardFooter } from '@molecules/OnboardFooter';
import AdminConsentFormModal from '@pages/AdminConsentFormModal';
import { getUserById } from '@stores/activity/contacts/contacts';
import { DEFAULT_FORM_DATA, MONTHS } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { saveProfileDetails } from '@stores/shared/onBoard/onBoard';
import { TOnBoardSymptomsProps, User } from '@types';
import { Checkbox, Input, Select, Space, Spin, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { measurementTypes } from '../Constants';
import './style.css';

const { Option } = Select;

export default function OnboardProfileForm(props: TOnBoardSymptomsProps) {
	const { setActiveStep, setProgressPercent, setNavigatorDirection } = props;
	const userId = useTypedSelector(state => state.user.id);
	const [user, setUser] = useState<User>();
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();

	const defaultFormData = DEFAULT_FORM_DATA;
	const [userFormData, setUserFormData] = useState(defaultFormData);
	const [policyModalOpen, setPolicyModalOpen] = useState(false);
	const [errors, setErrors] = useState(defaultFormData);
	const [isLoading, setLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [feet, setFeet] = useState(0);
	const [inch, setInch] = useState(0);
	const [unit, setUnit] = useState('');
	const currentYear = dayjs().year();
	const currentMonth = dayjs().month() + 1;
	const currentDay = dayjs().date();
	const [dob, setDob] = useState({
		day: userFormData.birthDate ? dayjs(userFormData.birthDate).date() : '',
		month: userFormData.birthDate
			? dayjs(userFormData.birthDate).month() + 1
			: '',
		year: userFormData.birthDate ? dayjs(userFormData.birthDate).year() : '',
	});
	const years = [...Array(100).keys()]
		.map(i => ({
			value: currentYear - i,
			label: currentYear - i,
		}))
		.filter(y => y.value <= currentYear);

	const months = MONTHS.filter(
		m => dob.year < currentYear || m.value <= currentMonth,
	);

	const [days, setDays] = useState(
		[...Array(31).keys()].map(i => ({ value: i + 1, label: i + 1 })),
	);

	useEffect(() => {
		setDob({
			day: userFormData.birthDate ? dayjs(userFormData.birthDate).date() : '',
			month: userFormData.birthDate
				? dayjs(userFormData.birthDate).month() + 1
				: '',
			year: userFormData.birthDate ? dayjs(userFormData.birthDate).year() : '',
		});
	}, [userFormData]);

	const handleChange = (field: string, value: string | number) => {
		const updatedDob = { ...dob, [field]: value };
		setDob(updatedDob);

		if (updatedDob.day && updatedDob.month && updatedDob.year) {
			const formattedDate = `${updatedDob.year}-${String(updatedDob.month).padStart(2, '0')}-${String(updatedDob.day).padStart(2, '0')}`;
			handleOnChangeForm('birthDate', formattedDate);
		}
	};

	useEffect(() => {
		if (dob.month && dob.year) {
			const daysInMonth = dayjs(`${dob.year}-${dob.month}-01`).daysInMonth();
			const maxDay =
				dob.year === currentYear && dob.month === currentMonth
					? currentDay
					: daysInMonth;

			setDays(
				[...Array(maxDay).keys()].map(i => ({
					value: i + 1,
					label: i + 1,
				})),
			);

			if (dob.day > maxDay) {
				setDob(prev => ({ ...prev, day: '' }));
			}
		}
	}, [dob.month, dob.year, currentYear, currentMonth, currentDay, dob.day]);

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);
	const getData = async () => {
		if (userId) {
			const data = await dispatch(getUserById(userId));
			setUser(data.payload);
			setUserFormData({
				firstName: data.payload.profile?.firstName,
				lastName: data.payload.profile?.lastName,
				email: data.payload.profile?.email,
				mobilePhone: data.payload.profile?.mobilePhone,
				imageUrl: data.payload.profile?.imageUrl,
				birthDate: data.payload.profile?.birthDate,
				gender: data.payload.profile?.gender,
				imperialHeight: data.payload.profile?.imperialHeight,
				metricHeight: data.payload.profile?.metricHeight,
				imperialWeight:
					data.payload.profile?.weight &&
					data.payload.profile?.weight[0]?.imperialWeight,
				metricWeight:
					data.payload.profile?.weight &&
					data.payload.profile?.weight[0]?.metricWeight,
				isPregnant: false,
				consentPolicyRead: data.payload.profile?.consentPolicyRead,
				patientId: data.payload.profile?.patientId,
				measurementSystem: data.payload.profile?.measurementSystem,
			});
			if (data.payload.profile?.imperialHeight) {
				const [feetPart, inchPart] = (
					data.payload?.profile?.imperialHeight ?? ''
				)
					.toString()
					.split('.');
				setFeet(Number(feetPart) || 0);
				setInch(parseInt(inchPart));
			}
			const initialMeasurementSystem =
				data.payload.profile?.measurementSystem === measurementTypes.METRIC
					? measurementTypes.METRIC
					: measurementTypes.IMPERIAL;
			setUnit(initialMeasurementSystem);

			// Fix: Initialize measurementSystem in userFormData for first-time users
			setUserFormData(prev => ({
				...prev,
				measurementSystem: prev.measurementSystem || initialMeasurementSystem,
			}));
		}
		setLoading(false);
	};

	useEffect(() => {
		if (unit === measurementTypes.IMPERIAL && (feet > 0 || inch > 0)) {
			setUserFormData(prev => ({
				...prev,
				imperialHeight: parseFloat(`${feet}.${inch}`),
			}));
		}
	}, [feet, inch, unit]);

	const handleToggle = () => {
		setPolicyModalOpen(true);
	};

	const validateForm = () => {
		const newErrors: unknown = {};
		const phoneRegex = /^\d{10}$/;
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!userFormData.firstName) {
			newErrors.firstName = t('Patient.data.completeProfile.firstNameErr');
		}
		if (!userFormData.lastName) {
			newErrors.lastName = t('Patient.data.completeProfile.lastNameErr');
		}
		if (!userFormData.birthDate) {
			newErrors.birthDate = t('Patient.data.completeProfile.dobError');
		}
		if (!userFormData.gender) {
			newErrors.gender = t('Patient.data.completeProfile.genderErr');
		}
		if (!userFormData.consentPolicyRead) {
			newErrors.consentPolicyRead = t('Patient.data.completeProfile.youAgree');
		}
		if (
			!userFormData.metricHeight &&
			!userFormData.imperialHeight &&
			!feet &&
			!inch
		) {
			newErrors.height = t('Patient.data.completeProfile.heightErr');
		} else if (
			(userFormData.metricHeight && userFormData.metricHeight <= 0) ||
			(userFormData.imperialHeight && userFormData.imperialHeight <= 0)
		) {
			newErrors.height = t('Patient.data.completeProfile.heightPositive');
		} else if (
			userFormData.imperialHeight &&
			userFormData.imperialHeight > 0 &&
			(feet <= 0 || inch < 0)
		) {
			newErrors.height = t('Patient.data.completeProfile.feetInchErr');
		}
		if (!userFormData.metricWeight && !userFormData.imperialWeight) {
			newErrors.weight = t('Patient.data.completeProfile.weightErr');
		} else if (
			(userFormData.metricWeight && userFormData.metricWeight <= 0) ||
			(userFormData.imperialWeight && userFormData.imperialWeight <= 0)
		) {
			newErrors.weight = t('Patient.data.completeProfile.weightPositive');
		}
		if (!userFormData.email || !emailRegex.test(userFormData.email)) {
			newErrors.email = t(
				'Admin.data.menu.userRoles.invitePatientModal.emailRequired',
			);
		}
		if (
			userFormData.mobilePhone &&
			!phoneRegex.test(userFormData.mobilePhone)
		) {
			newErrors.mobilePhone = t('Patient.data.completeProfile.mobileErr');
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleFormSubmit = async () => {
		if (!validateForm()) {
			message.error(t('Patient.data.completeProfile.pleaseCorrect'));
			return;
		}

		setIsSaving(true);
		try {
			const payload: unknown = {
				firstName: userFormData.firstName,
				lastName: userFormData.lastName,
				birthDate: userFormData.birthDate,
				gender: userFormData.gender,
				isPregnant: false,
				consentPolicyRead: userFormData.consentPolicyRead,
				measurementSystem: userFormData.measurementSystem,
				email: userFormData.email,
				mobilePhone: userFormData.mobilePhone,
			};
			if (userFormData.measurementSystem === measurementTypes.IMPERIAL) {
				payload.imperialHeight = userFormData.imperialHeight;
				payload.imperialWeight = userFormData.imperialWeight;
			} else {
				payload.metricHeight = userFormData.metricHeight;
				payload.metricWeight = userFormData.metricWeight;
			}
			const data = await dispatch(
				saveProfileDetails({ id: user?.id, payload: payload }),
			);
			if (data.payload) {
				message.success(`${t('Patient.data.completeProfile.saveSuccess')}`);
				setNavigatorDirection('forward');
				setProgressPercent(20);
				if (setActiveStep) {
					setActiveStep(2);
				}
			}
		} catch (error: unknown) {
			message.error(`${t('Patient.data.completeProfile.saveError 2nd block')}`);
		} finally {
			setIsSaving(false);
		}
	};

	/**
	 * Unified unit change handler with automatic value conversion
	 * When user changes unit on either field, both fields update and values convert
	 */
	const handleUnitChange = (newSystem: string) => {
		const isMetric =
			newSystem === measurementTypes.METRIC ||
			newSystem === measurementTypes.KILOGRAM ||
			newSystem === measurementTypes.CENTIMETER;

		const systemValue = isMetric
			? measurementTypes.METRIC
			: measurementTypes.IMPERIAL;

		// Skip if already in target system
		if (unit === systemValue) return;

		setUnit(systemValue);

		// Convert weight
		let convertedMetricWeight = userFormData.metricWeight;
		let convertedImperialWeight = userFormData.imperialWeight;

		if (isMetric && userFormData.imperialWeight) {
			// lb → kg: multiply by 0.453592
			convertedMetricWeight =
				Math.round(userFormData.imperialWeight * 0.453592 * 10) / 10;
		} else if (!isMetric && userFormData.metricWeight) {
			// kg → lb: multiply by 2.20462
			convertedImperialWeight =
				Math.round(userFormData.metricWeight * 2.20462 * 10) / 10;
		}

		// Convert height
		let convertedMetricHeight = userFormData.metricHeight;
		let convertedFeet = feet;
		let convertedInch = inch;

		if (isMetric && (feet > 0 || inch > 0)) {
			// feet.inches → cm: (feet * 30.48) + (inches * 2.54)
			convertedMetricHeight = Math.round(feet * 30.48 + inch * 2.54);
		} else if (!isMetric && userFormData.metricHeight) {
			// cm → feet.inches
			const totalInches = userFormData.metricHeight / 2.54;
			convertedFeet = Math.floor(totalInches / 12);
			convertedInch = Math.round(totalInches % 12);
		}

		setFeet(convertedFeet);
		setInch(convertedInch);

		setUserFormData(prev => ({
			...prev,
			measurementSystem: systemValue,
			metricWeight: convertedMetricWeight,
			imperialWeight: convertedImperialWeight,
			metricHeight: convertedMetricHeight,
			imperialHeight: !isMetric
				? parseFloat(`${convertedFeet}.${convertedInch}`)
				: prev.imperialHeight,
		}));

		setErrors(prevErrors => ({
			...prevErrors,
			height: undefined,
			weight: undefined,
		}));
	};

	const handleHeightChange = (unitValue: string, value: number | null) => {
		// Sync both units when height unit selector changes (with conversion)
		handleUnitChange(unitValue);

		if (unitValue === measurementTypes.CENTIMETER && value !== null) {
			setUserFormData(prev => ({
				...prev,
				metricHeight: value,
			}));
		}
	};

	const handleWeightChange = (unitValue: string) => {
		// Sync both units when weight unit selector changes (with conversion)
		handleUnitChange(unitValue);
	};

	const handleOnChangeForm = (
		key: string,
		value: string | number | boolean | null,
	) => {
		setUserFormData(prevData => ({ ...prevData, [key]: value }));
		setErrors(prevErrors => ({ ...prevErrors, [key]: undefined }));
	};

	const handleConsentFormClose = async () => {
		setPolicyModalOpen(false);
	};

	useEffect(() => {
		if (unit === measurementTypes.IMPERIAL) {
			setUserFormData(prev => ({
				...prev,
				imperialHeight: parseFloat(`${feet}.${inch}`),
			}));
		}
	}, [feet, inch, unit]);

	if (isLoading) {
		return <OnboardProfileSkeleton />;
	}

	return (
		<div className="form-outer-div onboard-profile-form">
			<Spin spinning={isSaving} size="large">
				<div className="form-div-onboard">
					<div className="form-container-onboard">
						{/* First name + Last name side by side */}
						<div className="form-row-two-col">
							<div className="form-col">
								<Input
									className={errors.firstName ? 'has-error' : ''}
									prefix={
										<UntitledIcon
											name="user"
											size="small"
											color="var(--text-tertiary)"
										/>
									}
									placeholder={t('Patient.data.completeProfile.firstName')}
									value={userFormData.firstName}
									onChange={event =>
										handleOnChangeForm('firstName', event.target.value)
									}
								/>
								{errors.firstName && (
									<div className="form-error-text">{errors.firstName}</div>
								)}
							</div>
							<div className="form-col">
								<Input
									className={errors.lastName ? 'has-error' : ''}
									prefix={
										<UntitledIcon
											name="user"
											size="small"
											color="var(--text-tertiary)"
										/>
									}
									placeholder={t('Patient.data.completeProfile.lastName')}
									value={userFormData.lastName}
									onChange={event =>
										handleOnChangeForm('lastName', event.target.value)
									}
								/>
								{errors.lastName && (
									<div className="form-error-text">{errors.lastName}</div>
								)}
							</div>
						</div>
						<div className="form-container-inner-div">
							<Input
								className={`input-item ${errors.email ? 'has-error' : ''}`}
								prefix={
									<UntitledIcon
										name="mail"
										size="small"
										color="var(--text-tertiary)"
									/>
								}
								placeholder={t(
									'Admin.data.menu.userRoles.invitePatientModal.emailText',
								)}
								value={userFormData.email}
								onChange={event =>
									handleOnChangeForm('email', event.target.value)
								}
							/>
							{errors.email && (
								<div className="form-error-text">{errors.email}</div>
							)}
						</div>
						<div className="form-container-inner-div">
							<Input
								className={`input-item ${errors.mobilePhone ? 'has-error' : ''}`}
								type="tel"
								inputMode="numeric"
								prefix={
									<UntitledIcon
										name="phone"
										size="small"
										color="var(--text-tertiary)"
									/>
								}
								placeholder={t(
									'Admin.data.menu.userRoles.invitePatientModal.mobilePhone',
								)}
								value={userFormData.mobilePhone}
								onChange={event =>
									handleOnChangeForm('mobilePhone', event.target.value)
								}
							/>
							{errors.mobilePhone && (
								<div className="form-error-text">{errors.mobilePhone}</div>
							)}
						</div>
						<div className="form-conatiner-date-div">
							<label className="form-field-label">
								{t('Patient.data.completeProfile.dob')}
							</label>
							<div
								className={`form-container-date-inner-div ${errors.birthDate ? 'has-error' : ''}`}>
								<Select
									showSearch
									popupMatchSelectWidth={false}
									placeholder={t('Patient.data.completeProfile.month')}
									className={`onboard-date-select ${errors.birthDate ? 'has-error' : ''}`}
									value={dob.month || undefined}
									onChange={value => handleChange('month', value)}
									options={months}
									filterOption={(input, option) =>
										(option?.label ?? '')
											.toString()
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
								<Select
									showSearch
									popupMatchSelectWidth={false}
									placeholder={t('Patient.data.completeProfile.date')}
									className={`onboard-date-select ${errors.birthDate ? 'has-error' : ''}`}
									value={dob.day || undefined}
									onChange={value => handleChange('day', value)}
									options={days}
									filterOption={(input, option) =>
										(option?.label ?? '')
											.toString()
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
								<Select
									showSearch
									popupMatchSelectWidth={false}
									placeholder={t('Patient.data.completeProfile.year')}
									className={`onboard-date-select ${errors.birthDate ? 'has-error' : ''}`}
									value={dob.year || undefined}
									onChange={value => handleChange('year', value)}
									options={years}
									filterOption={(input, option) =>
										(option?.label ?? '')
											.toString()
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
							</div>
							{errors.birthDate && (
								<div className="form-birthdate-error">{errors.birthDate}</div>
							)}
						</div>
						<div className="form-container-inner-div">
							<Space.Compact
								style={{ width: '100%' }}
								className={errors.weight ? 'has-error' : ''}>
								<Input
									type="number"
									className={errors.weight ? 'has-error' : ''}
									prefix={
										<UntitledIcon
											name="scales"
											size="small"
											color="var(--text-tertiary)"
										/>
									}
									placeholder={t('Patient.data.completeProfile.weight')}
									value={
										unit === measurementTypes.METRIC
											? userFormData.metricWeight
											: userFormData.imperialWeight || ''
									}
									onChange={e =>
										handleOnChangeForm(
											unit === measurementTypes.METRIC
												? 'metricWeight'
												: 'imperialWeight',
											parseFloat(e.target.value) || null,
										)
									}
									style={{ flex: 1 }}
								/>
								<Select
									tabIndex={-1}
									style={{ width: 70 }}
									value={unit === measurementTypes.METRIC ? 'Kg' : 'Lb'}
									onChange={value => handleWeightChange(value)}
									options={[
										{
											value: 'Lb',
											label: t('Patient.data.profile.form.weightUnit.lb'),
										},
										{
											value: 'Kg',
											label: t('Patient.data.profile.form.weightUnit.kg'),
										},
									]}
								/>
							</Space.Compact>
							{errors.weight && (
								<div className="form-error-text">{errors.weight}</div>
							)}
						</div>

						{unit === measurementTypes.METRIC ? (
							<div className="form-container-inner-div">
								<Space.Compact
									style={{ width: '100%' }}
									className={errors.height ? 'has-error' : ''}>
									<Input
										type="number"
										className={errors.height ? 'has-error' : ''}
										prefix={
											<UntitledIcon
												name="ruler"
												size="small"
												color="var(--text-tertiary)"
											/>
										}
										placeholder={t('Patient.data.completeProfile.height')}
										value={userFormData.metricHeight || ''}
										onChange={e => {
											const val = e.target.value;

											if (val === '') {
												setUserFormData(prev => ({
													...prev,
													metricHeight: '',
												}));
												setErrors(prev => ({ ...prev, height: undefined }));
												return;
											}

											const num = Number(val);
											if (!isNaN(num)) {
												setUserFormData(prev => ({
													...prev,
													metricHeight: num,
												}));
											}
										}}
										style={{ flex: 1 }}
									/>
									<Select
										tabIndex={-1}
										style={{ width: 70 }}
										value={measurementTypes.CENTIMETER}
										onChange={value => handleUnitChange(value)}
										options={[
											{
												value: measurementTypes.FEET,
												label: measurementTypes.FEET,
											},
											{
												value: measurementTypes.CENTIMETER,
												label: measurementTypes.CENTIMETER,
											},
										]}
									/>
								</Space.Compact>
								{errors.height && (
									<div className="form-error-text">{errors.height}</div>
								)}
							</div>
						) : (
							<div className="form-container-inner-div">
								<Space.Compact
									style={{ width: '100%' }}
									className={errors.height ? 'has-error' : ''}>
									{/* FEET INPUT (does NOT call handleHeightChange anymore) */}
									<Input
										type="number"
										className={errors.height ? 'has-error' : ''}
										prefix={
											<UntitledIcon
												name="ruler"
												size="small"
												color="var(--text-tertiary)"
											/>
										}
										placeholder={t('Patient.data.completeProfile.feet')}
										value={feet || ''}
										onChange={e => {
											const val = e.target.value;

											if (val === '') {
												setFeet(0);
												return;
											}

											const num = Number(val);
											if (!isNaN(num)) {
												setFeet(num);
											}
										}}
										style={{ flex: 1 }}
										suffix={measurementTypes.FEET}
									/>

									{/* INCH INPUT (does NOT call handleHeightChange anymore) */}
									<Input
										type="number"
										className={errors.height ? 'has-error' : ''}
										placeholder={t('Patient.data.completeProfile.inches')}
										value={inch || ''}
										onChange={e => {
											const val = e.target.value;

											if (val === '') {
												setInch(0);
												return;
											}

											const num = Number(val);
											if (!isNaN(num)) {
												setInch(num);
											}
										}}
										style={{ flex: 1 }}
										suffix={measurementTypes.INCH}
									/>

									{/* UNIT SELECTOR — THE ONLY PLACE THAT TRIGGERS CONVERSION */}
									<Select
										tabIndex={-1}
										style={{ width: 70 }}
										value={measurementTypes.FEET}
										onChange={value => handleUnitChange(value)}
										options={[
											{
												value: measurementTypes.FEET,
												label: measurementTypes.FEET,
											},
											{
												value: measurementTypes.CENTIMETER,
												label: measurementTypes.CENTIMETER,
											},
										]}
									/>
								</Space.Compact>

								{errors.height && (
									<div className="form-error-text">{errors.height}</div>
								)}
							</div>
						)}

						<div className="form-container-inner-div">
							<Select
								placeholder={t('Patient.data.completeProfile.gender')}
								value={userFormData.gender}
								onChange={event => handleOnChangeForm('gender', event)}
								allowClear
								className={`onboard-gender-select ${errors.gender ? 'has-error' : ''}`}>
								<Option value="Male">
									{t('Patient.data.completeProfile.male')}
								</Option>
								<Option value="Female">
									{t('Patient.data.completeProfile.female')}
								</Option>
							</Select>
							{errors.gender && (
								<div className="form-error-text">{errors.gender}</div>
							)}
						</div>
						<div className="form-container-inner-div">
							<Checkbox
								checked={userFormData.consentPolicyRead}
								onChange={event =>
									handleOnChangeForm('consentPolicyRead', event.target.checked)
								}>
								<span className="checkbox-form">
									<span className="onboard-consent-link">
										{t('Patient.data.completeProfile.readAgree')}
									</span>{' '}
									<span
										className="gradient-text consent-policy-heading consent-form-title"
										onClick={e => {
											e.preventDefault();
											e.stopPropagation();
											handleToggle();
										}}>
										{t('Patient.data.completeProfile.consentPolicy')}.
									</span>
								</span>
							</Checkbox>
							{errors.consentPolicyRead && (
								<div className="form-error-text">
									{errors.consentPolicyRead}
								</div>
							)}
						</div>
					</div>
					<OnboardFooter onContinue={handleFormSubmit} loading={isSaving} />
				</div>
			</Spin>
			{policyModalOpen && (
				<AdminConsentFormModal
					isOpen={policyModalOpen}
					onClose={handleConsentFormClose}
					isConsentPolicyReadOnly={true}
				/>
			)}
		</div>
	);
}
