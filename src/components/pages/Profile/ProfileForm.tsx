import { UntitledIcon } from '@atoms/Icon';
import { Loading01 } from '@vitalflow-icons/general/loading01';
import { PLAN_TYPES } from '@constants/plans';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import AdminConsentFormModal from '@pages/AdminConsentFormModal';
import { measurementTypes } from '@pages/PatientOnboard/Constants';
import { setSelectUser } from '@stores/activity/contacts/contacts';
import { saveProfile } from '@stores/clinical/painAssessment';
import {
	DEFAULT_FORM_DATA,
	MONTHS,
	PLANS,
	PLANS_OPTIONS,
} from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getPlanByPlanType,
	getPlansByClientId,
	getPlansByUserId,
	getTags,
} from '@stores/shared/settings/settings';
import { getSelectedUser, getUser } from '@stores/shared/user';
import { ProfileFormProps } from '@types';
import {
	Avatar,
	Button,
	Checkbox,
	Flex,
	Input,
	Select,
	Spin,
	Tooltip,
	Typography,
	message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import './style.css';

const { Paragraph } = Typography;

const { Option } = Select;

export default function OnboardProfileForm(props: ProfileFormProps) {
	const { policyModalOpen, setIsModalOpen, setPolicyModalOpen, rowData } =
		props;
	const [unit, setUnit] = useState('');
	const { t } = useTypedTranslation();
	const dispatch = useTypedDispatch();
	const { user, selectedUser, loading } = useTypedSelector(state => ({
		selectedUser: state.contacts.main.selectedUser,
		user: state.user,
		loading: state.painAssessment.loading,
	}));
	const userId = user?.isPhysioterapist ? selectedUser?.id : user?.id;
	const defaultFormData = DEFAULT_FORM_DATA;
	const [userFormData, setUserFormData] = useState(defaultFormData);
	const currentYear = dayjs().year();
	const currentMonth = dayjs().month() + 1;
	const currentDay = dayjs().date();
	const [dob, setDob] = useState({
		day: userFormData.birthDate
			? dayjs(userFormData.birthDate).date()
			: dayjs(new Date()).date(),
		month: userFormData.birthDate
			? dayjs(userFormData.birthDate).month() + 1
			: dayjs(new Date()).month(),
		year: userFormData.birthDate
			? dayjs(userFormData.birthDate).year()
			: dayjs(new Date()).year(),
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
			day: userFormData.birthDate
				? dayjs(userFormData.birthDate).date()
				: dayjs(new Date()).date(),
			month: userFormData.birthDate
				? dayjs(userFormData.birthDate).month() + 1
				: dayjs(new Date()).month(),
			year: userFormData.birthDate
				? dayjs(userFormData.birthDate).year()
				: dayjs(new Date()).year(),
		});
	}, [userFormData.birthDate]);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dob.month, dob.year]); // currentDay, currentMonth, currentYear, and dob.day intentionally excluded - static values and conditional check

	const [feet, setFeet] = useState(0);
	const [inch, setInch] = useState(0);
	const [errors, setErrors] = useState(defaultFormData);
	const [isLoading, setLoading] = useState(true);
	const [tagsList, setTagsList] = useState([]);
	const [savedPlan, setSavedPlan] = useState('');
	const plans = useTypedSelector(state => state.settings.content.plans);
	const [savedUpgradePlanType, setSavedUpgradePlanType] = useState<
		string | undefined
	>(undefined);
	const [defaultPlanOptions, setDefaultPlanOptions] = useState<[]>([]);
	const [painStatus, setPainStatus] = useState<[]>([]);
	const PlanOptions = rowData ? painStatus : defaultPlanOptions;

	useEffect(() => {
		getData(user?.isPhysioterapist ? selectedUser?.id : user?.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, selectedUser]);

	useEffect(() => {
		fetchTags();
	}, []);

	const fetchTags = async () => {
		const data = await dispatch(getTags());
		setTagsList(data?.payload);
	};

	useEffect(() => {
		if (savedUpgradePlanType) {
			const filteredDefaultOptions =
				getFilteredDefaultOptions(savedUpgradePlanType);
			setDefaultPlanOptions(filteredDefaultOptions);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedUpgradePlanType, painStatus]);

	const getFilteredDefaultOptions = (upgradePlanType: string) => {
		switch (upgradePlanType) {
			case PLANS.SCREENING:
				return painStatus.filter(option => option.plan === PLANS.PLAN1);
			case PLANS.EARLYINTERVENTION:
				return painStatus.filter(option =>
					[PLANS.PLAN1, PLANS.PLAN2].includes(option.plan),
				);
			case PLANS.VIRTUALPT:
				return [...painStatus];
			default:
				return [...painStatus];
		}
	};

	const getUpgradePlan = async () => {
		await dispatch(getPlansByClientId());
	};

	const getDefaultPlan = async () => {
		const response = await dispatch(getPlansByUserId(user?.id));
		const userPlanType = response?.payload?.planType;
		if (!userPlanType) return;
		setSavedUpgradePlanType(userPlanType);
	};

	useEffect(() => {
		const hasValidPlans = plans?.every(plan => plan?.id);
		const sourcePlans = hasValidPlans ? plans : [];
		const mockPlans = PLANS_OPTIONS || [];

		const finalPlans = [];
		for (let i = 0; i < 3; i++) {
			const plan = sourcePlans[i] || {};
			const mock = mockPlans[i] || {};

			finalPlans.push({
				...mock,
				...plan,
				title: plan?.title || mock.title,
				description: plan?.description || mock.description,
				planType: plan?.planType || mock.planType || '',
				plan: plan?.plan || mock.plan || '',
			});
		}
		setPainStatus(finalPlans);
	}, [plans]);

	useEffect(() => {
		const initialize = async () => {
			await fetchPlans();
			if (!rowData) {
				await getDefaultPlan();
			}
		};
		initialize();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		getUpgradePlan();
		fetchSelectedPlan(user?.isPhysioterapist ? selectedUser?.id : user?.id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchPlans = async () => {
		for (const planType of PLAN_TYPES) {
			await dispatch(getPlanByPlanType(planType));
		}
	};

	const fetchSelectedPlan = async (id: string) => {
		const data = await dispatch(getPlansByUserId(id));
		if (data?.payload) {
			setSavedPlan(data.payload.planType);
		}
	};

	useEffect(() => {
		if (savedPlan) {
			setUserFormData(prev => ({ ...prev, planType: savedPlan }));
		}
	}, [savedPlan]);

	const getData = async (currentUserId: string) => {
		if (currentUserId) {
			const userData = user?.isPhysioterapist ? selectedUser : user;
			setUserFormData({
				firstName: userData.profile?.firstName,
				mobilePhone: userData.profile?.mobilePhone,
				lastName: userData.profile?.lastName,
				email: userData.profile?.email,
				imageUrl: userData.profile?.imageUrl,
				birthDate: userData.profile?.birthDate,
				gender: userData.profile?.gender,
				imperialHeight: userData.profile?.imperialHeight,
				metricHeight: userData.profile?.metricHeight,
				weight: '',
				height: '',
				imperialWeight:
					userData.profile?.weight &&
					userData.profile?.weight[0]?.imperialWeight,
				metricWeight:
					userData.profile?.weight && userData.profile?.weight[0]?.metricWeight,
				isPregnant: false,
				consentPolicyRead: userData.profile?.consentPolicyRead,
				patientId: userData.profile?.patientId,
				measurementSystem:
					userData.profile?.measurementSystem || measurementTypes.IMPERIAL,
				planType: savedPlan,
				tags: userData?.tags?.map(item => item?.tag?.id) || [],
			});
			if (userData.profile?.imperialHeight) {
				const [feetPart, inchPart] = (userData?.profile?.imperialHeight ?? '')
					.toString()
					.split('.');
				setFeet(Number(feetPart));
				setInch(parseInt(inchPart));
			}
			setUnit(
				userData.profile?.measurementSystem == measurementTypes.METRIC
					? measurementTypes.METRIC
					: measurementTypes.IMPERIAL,
			);
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

	if (isLoading) {
		return <Spin className="spin-css w-[500px] h-[650px]" size="large" />;
	}

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
		if (!userFormData.email || !emailRegex.test(userFormData.email)) {
			newErrors.email = t(
				'Admin.data.menu.userRoles.invitePatientModal.emailRequired',
			);
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
		} else {
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
					planType: userFormData.planType,
					tags: userFormData.tags,
				};
				if (userFormData.measurementSystem === measurementTypes.IMPERIAL) {
					payload.imperialHeight = userFormData.imperialHeight;
					payload.imperialWeight = userFormData.imperialWeight;
				} else {
					payload.metricHeight = userFormData.metricHeight;
					payload.metricWeight = userFormData.metricWeight;
				}
				const userId = user?.isPhysioterapist ? selectedUser?.id : user?.id;
				const savedData = await dispatch(
					saveProfile({
						payload,
						id: userId,
					}),
				);
				if (savedData.error) {
					message.error(`${t('Patient.data.completeProfile.saveError')}`);
				} else {
					message.success(`${t('Patient.data.completeProfile.saveSuccess')}`);
					if (user?.isPhysioterapist) {
						const tempUser = await dispatch(getSelectedUser());
						dispatch(setSelectUser(tempUser.payload));
					} else {
						await dispatch(getUser(userId));
					}
					setIsModalOpen(false);
				}
			} catch (error: unknown) {
				message.error(
					error?.response?.data?.message ||
						`${t('Patient.data.completeProfile.saveError')}`,
				);
			}
		}
	};

	/**
	 * Unified unit change handler - syncs both height and weight units
	 * When user changes unit on either field, both fields update together
	 */
	const handleUnitChange = (newSystem: string) => {
		const isMetric =
			newSystem === measurementTypes.METRIC ||
			newSystem === measurementTypes.KILOGRAM ||
			newSystem === measurementTypes.CENTIMETER;

		const systemValue = isMetric
			? measurementTypes.METRIC
			: measurementTypes.IMPERIAL;

		setUnit(systemValue);
		setUserFormData(prev => ({
			...prev,
			measurementSystem: systemValue,
		}));
		setErrors(prevErrors => ({
			...prevErrors,
			height: undefined,
			weight: undefined,
		}));
	};

	const handleHeightChange = (unitValue: string, value: number | null) => {
		// Sync both units when height unit selector changes
		handleUnitChange(unitValue);

		if (unitValue === measurementTypes.CENTIMETER) {
			setUserFormData(prev => ({
				...prev,
				metricHeight: value,
			}));
		}
	};

	const handleWeightChange = (unitValue: string) => {
		// Sync both units when weight unit selector changes
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

	const renderDescriptionAsList = (html?: string) => {
		if (!html) return null;

		// Extract content inside <p>...</p>
		const items = html
			.replace(/\n/g, '')
			.match(/<p>(.*?)<\/p>/g)
			?.map(p => p.replace(/<\/?p>/g, '').trim())
			.filter(Boolean);

		if (!items?.length) return null;

		return (
			<ul style={{ margin: 0, paddingLeft: 18 }}>
				{items.map((item, index) => (
					<li key={index}>{item}</li>
				))}
			</ul>
		);
	};

	return (
		<div>
			<div className="form-div">
				<h1 className="profile-heading">
					{t('Patient.data.completeProfile.editProfile')}
				</h1>
				<>
					{selectedUser?.profile?.imageUrl || user?.imageUrl ? (
						<Avatar
							src={
								user?.isPhysioterapist
									? selectedUser?.profile?.imageUrl
									: user?.profile?.imageUrl
							}
							alt="avatar"
							size={100}
						/>
					) : (
						<Avatar
							className="profile-avatar"
							style={{
								backgroundColor: user?.isPhysioterapist
									? selectedUser?.profile?.avatarColor
									: user?.profile?.avatarColor || undefined,
								fontSize: '40px',
							}}
							alt="avatar"
							size={100}>
							{userFormData?.firstName
								? userFormData?.firstName?.charAt(0)?.toUpperCase()
								: 'U'}
						</Avatar>
					)}
				</>
				<div className="form-container">
					<div className="mb-4 text-left">
						<Input
							className="input-item"
							prefix={<UntitledIcon name="user" color="var(--text-tertiary)" />}
							placeholder={t('Patient.data.completeProfile.firstName')}
							value={userFormData.firstName}
							onChange={event =>
								handleOnChangeForm('firstName', event.target.value)
							}
						/>
						{errors.firstName && (
							<div className="profile-error-message">{errors.firstName}</div>
						)}
					</div>
					<div className="mb-4 text-left">
						<Input
							className="input-item"
							prefix={<UntitledIcon name="user" color="var(--text-tertiary)" />}
							placeholder={t('Patient.data.completeProfile.lastName')}
							value={userFormData.lastName}
							onChange={event =>
								handleOnChangeForm('lastName', event.target.value)
							}
						/>
						{errors.lastName && (
							<div className="profile-error-message">{errors.lastName}</div>
						)}
					</div>
					<div className="mb-4 text-left">
						<Input
							className="input-item"
							prefix={<UntitledIcon name="mail" color="var(--text-tertiary)" />}
							placeholder={t(
								'Admin.data.menu.userRoles.invitePatientModal.emailText',
							)}
							value={userFormData.email}
							onChange={event =>
								handleOnChangeForm('email', event.target.value)
							}
						/>
						{errors.email && (
							<div className="profile-error-message">{errors.email}</div>
						)}
					</div>
					<div className="mb-4 text-left">
						<Input
							className="input-item"
							type="tel"
							inputMode="numeric"
							prefix={
								<UntitledIcon name="phone" color="var(--text-tertiary)" />
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
							<div className="profile-error-message">{errors.mobilePhone}</div>
						)}
					</div>
					<Flex vertical justify="space-between" className="mb-4">
						<Flex gap={8}>
							<Select
								showSearch
								popupMatchSelectWidth={false}
								placeholder={t('Patient.data.completeProfile.month')}
								className="w-150 text-start"
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
								className="w-120 text-start"
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
								className="w-150 text-start"
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
						</Flex>
						{errors.birthDate && (
							<div
								className="profile-error-message"
								style={{ textAlign: 'start' }}>
								{errors.birthDate}
							</div>
						)}
					</Flex>
					<div className="mb-4 text-left">
						<Flex align="center" className="weight-input-container">
							<Input
								type="number"
								prefix={
									<UntitledIcon name="scales" color="var(--text-tertiary)" />
								}
								placeholder={t('Patient.data.completeProfile.weight')}
								className="border-r-0 border-inherit rounded-tr-none rounded-br-none"
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
							<select
								className="border-inherit border-l-0 rounded-tl-none rounded-bl-none rounded-[6px] profile-unit-select"
								value={unit === measurementTypes.METRIC ? 'Kg' : 'Lb'}
								onChange={e => handleWeightChange(e.target.value)}>
								<option value="Lb">
									{t('Patient.data.profile.form.weightUnit.lb')}
								</option>
								<option value="Kg">
									{t('Patient.data.profile.form.weightUnit.kg')}
								</option>
							</select>
						</Flex>
						{errors.weight && (
							<div className="profile-error-message">{errors.weight}</div>
						)}
					</div>

					{unit === measurementTypes.METRIC ? (
						<div className="mb-4 text-left">
							<Flex align="center" className="weight-input-container">
								<Input
									type="number"
									prefix={
										<UntitledIcon name="ruler" color="var(--text-tertiary)" />
									}
									className="border-inherit border-r-0 rounded-tr-none rounded-br-none"
									placeholder={t('Patient.data.completeProfile.height')}
									value={userFormData.metricHeight || ''}
									onChange={e =>
										handleHeightChange(
											measurementTypes.CENTIMETER,
											parseFloat(e.target.value) || null,
										)
									}
									style={{ flex: 1 }}
								/>
								<select
									value={measurementTypes.CENTIMETER}
									onChange={e =>
										handleHeightChange(
											e.target.value,
											userFormData.imperialHeight,
										)
									}
									className="border border-l-0 rounded-tl-none rounded-bl-none rounded-[6px] profile-height-unit-select">
									<option value={measurementTypes.FEET}>
										{measurementTypes.FEET}
									</option>
									<option value={measurementTypes.CENTIMETER}>
										{measurementTypes.CENTIMETER}
									</option>
								</select>
							</Flex>
							{errors.height && (
								<div className="profile-error-message">{errors.height}</div>
							)}
						</div>
					) : (
						<div className="mb-4 text-left">
							<Flex align="center" className="weight-input-container">
								<Input
									type="number"
									prefix={
										<UntitledIcon name="ruler" color="var(--text-tertiary)" />
									}
									placeholder={t('Patient.data.completeProfile.height')}
									value={feet || ''}
									onChange={e => {
										setFeet(parseInt(e.target.value));
									}}
									style={{ flex: 1 }}
									suffix={
										<Flex gap={16}>
											<Paragraph>{measurementTypes.FEET}</Paragraph>
											<Paragraph className="text-gray-400">|</Paragraph>
										</Flex>
									}
									className="border-inherit border-r-0 rounded-tr-none rounded-br-none"
								/>
								<Input
									type="number"
									prefix={
										<UntitledIcon name="ruler" color="var(--text-tertiary)" />
									}
									placeholder={t('Patient.data.completeProfile.height')}
									value={inch || ''}
									onChange={e => {
										setInch(parseInt(e.target.value));
									}}
									style={{ flex: 1 }}
									className="border-r-0 border-l-0 rounded-r-none rounded-l-none border-inherit"
								/>
								<>
									<select
										value={measurementTypes.FEET}
										className="border-l-0 rounded-tl-none rounded-bl-none border rounded-[6px] profile-unit-select"
										onChange={e => {
											handleHeightChange(
												e.target.value,
												userFormData.metricHeight,
											);
										}}>
										<option value={measurementTypes.FEET}>
											{measurementTypes.INCH}
										</option>
										<option value={measurementTypes.CENTIMETER}>
											{measurementTypes.CENTIMETER}
										</option>
									</select>
								</>
							</Flex>
							{errors.height && (
								<div className="profile-error-message">{errors.height}</div>
							)}
						</div>
					)}

					<div className="mb-4 text-left">
						<Select
							placeholder={t('Patient.data.completeProfile.gender')}
							className="input-item theme-select-dropdown w-full"
							value={userFormData.gender}
							onChange={event => handleOnChangeForm('gender', event)}
							allowClear>
							<Option value="Male">
								{t('Patient.data.completeProfile.male')}
							</Option>
							<Option value="Female">
								{t('Patient.data.completeProfile.female')}
							</Option>
							<Option value="Other">
								{t('Patient.data.completeProfile.other')}
							</Option>
						</Select>
						{errors.gender && (
							<div className="profile-error-message">{errors.gender}</div>
						)}
					</div>
					<div className="mb-4 text-left">
						<Select
							placeholder={t(
								'Admin.data.menu.userRoles.invitePatientModal.selectPlan',
							)}
							style={{ width: '100%' }}
							optionLabelProp="plan"
							className='theme-select-dropdown'
							value={userFormData.planType}
							onChange={val => handleOnChangeForm('planType', val)}
							allowClear>
							{PlanOptions?.map(value => (
								<Option key={value.id} value={value.planType} plan={value.plan}>
									<Tooltip
										placement="right"
										title={renderDescriptionAsList(value.description)}>
										<span>
											<strong>{value.plan}</strong> – {value.title}
										</span>
									</Tooltip>
								</Option>
							))}
						</Select>
					</div>
					<div className="mb-4 text-left">
						<Select
							placeholder={t('Admin.data.theme.selectTag')}
							style={{ width: '100%' }}
							mode="multiple"
							allowClear
							className='theme-select-dropdown'
							popupMatchSelectWidth={false}
							value={userFormData.tags}
							onChange={val => handleOnChangeForm('tags', val)}
							dropdownRender={menu => <div className="w-full">{menu}</div>}>
							{tagsList?.map(item => (
								<Option key={item.id} value={item.id}>
									{item.name}
								</Option>
							))}
						</Select>
					</div>
					<div className="mb-4 text-left">
						<Checkbox
							checked={userFormData.consentPolicyRead}
							onChange={event =>
								handleOnChangeForm('consentPolicyRead', event.target.checked)
							}>
							<span className="checkbox-form">
								<span>{t('Patient.data.completeProfile.readAgree')}</span>{' '}
								<span
									className="gradient-text underline consent-form-title"
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
							<div className="profile-error-message">
								{errors.consentPolicyRead}
							</div>
						)}
					</div>
				</div>
				<div>
					<Button
						size="large"
						htmlType="button"
						type="primary"
						block
						onClick={handleFormSubmit}>
						{loading ? (
							<Flex align="center" gap={8}>
								<Loading01 />
								{t(
									'Admin.data.menu.patientDetail.aiAssistantRomSummary.saving',
								)}
							</Flex>
						) : (
							t('Patient.data.onboard.save')
						)}
					</Button>
				</div>
			</div>
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
