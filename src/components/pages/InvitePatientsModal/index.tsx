import UserUploadProgress from '@atoms/AdminMenu/WellnessCheck/UserUploadProgress';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { ModalContentSkeleton } from '@atoms/Skeletons';
import {
	DEFAULT_EMAIL_TEMPLATE,
	DEFAULT_INVITE_TEMPLATE,
	userCredentialsData,
} from '@constants/inviteTemplates';
import { PLAN_TYPES } from '@constants/plans';
import { router } from '@routers/routers';
import { updateProfileDetails } from '@stores/clinical/painAssessment';
import {
	PLANS,
	PLANS_OPTIONS,
	USER_ROLES,
	pagination,
} from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getRegisteredPatientList,
	getStats,
	getUnAssignedPatientList,
	updateInviteUser,
} from '@stores/patients/admin/adminPatient';
import {
	getEmailTemplate,
	getInviteTemplate,
	getPlanByPlanType,
	getPlansByClientId,
	getPlansByUserId,
} from '@stores/shared/settings/settings';
import { bulkInviteUsers, setUploadProgress } from '@stores/shared/user';
import {
	Invitation,
	InvitePatientModalProps,
	InviteUser,
	PayloadInterface,
	PlanOptionsList,
} from '@types';
import {
	Button,
	Flex,
	Form,
	Modal,
	Tabs,
	Typography,
	Upload,
	message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AlreadyRegisteredUser from './AlreadyRegisteredUser';
import BulkInvite from './BulkInvite';
import { BulkInviteTable } from './BulkInviteTable';
import Default from './Default';
import './style.css';

const { Title } = Typography;

type FeatureIds = string[];

interface UserData {
	'First Name': string;
	'Last Name': string;
	Email: string;
	Phone: number;
}

// Avatar colors for random user assignment - stored in DB and used as inline styles
// eslint-disable-next-line vitalflow/no-hardcoded-colors
const avatarColors = ['#faad14', '#52c41a', '#1890ff', '#ff4d4f', '#722ed1']; // DB-stored colors, not CSS

const InvitePatientsModal = (props: InvitePatientModalProps) => {
	const [fileData, setFileData] = useState<InviteUser[]>([]);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [isUploaded, setIsUploaded] = useState(false);
	const dispatch = useTypedDispatch();
	const [activeKey, setActiveKey] = useState<string>('1');
	const { t } = useTranslation();
	const [mustSendEmail, setMustSendEmail] = useState<boolean>(true);
	const {
		isInvitePatientModalOpen,
		setIsInvitePatientModalOpen,
		closable,
		fullRowDetails,
		rowData,
		isRegistered,
		isPending,
		currentPage,
		searchValue: _searchValue,
		filterButton,
		fetchDataList,
		savedTags,
		isLoading,
	} = props;
	const user = useTypedSelector(state => state.user);
	const [form] = Form.useForm();
	const [userFormData, setUserFormData] = useState<Invitation>({
		firstName: '',
		lastName: '',
		email: '',
		invitedRole: 'user',
		message: '',
		mobilePhone: '',
		password: '',
		planType: undefined,
		tags: [],
	});
	const emailTemplate = useTypedSelector(
		state => state.settings.templates.bulkInvite,
	);
	const inviteTemplate = useTypedSelector(
		state => state.settings.templates.invite,
	);
	const [savedEmailTemplate, setEmailTemplate] = useState('');
	const [savedInviteTemplate, setInviteTemplate] = useState('');
	const [isUpdating, setIsUpdating] = useState(false);
	const [savedPlan, setSavedPlan] = useState('');
	const [painStatus, setPainStatus] = useState<PlanOptionsList[]>([]);
	const plans = useTypedSelector(state => state.settings.content.plans);
	const [selectedDefaultValue, setSelectedDefaultValue] = useState<
		string | undefined
	>(undefined);
	const [savedUpgradePlanType, setSavedUpgradePlanType] = useState<
		string | undefined
	>(undefined);
	const [defaultPlanOptions, setDefaultPlanOptions] = useState<
		PlanOptionsList[]
	>([]);

	const navigate = useNavigate();
	const credentials = {
		instanceLink: window.location.origin.replace(/^https?:\/\//, ''),
		username: '{{user_name}}',
		password: '********',
		inviteCode: user.client.inviteCode,
	};

	useEffect(() => {
		// Use default template if API returns empty
		setInviteTemplate(inviteTemplate || DEFAULT_INVITE_TEMPLATE);
	}, [inviteTemplate]);

	useEffect(() => {
		// Use default template if API returns empty
		setEmailTemplate(emailTemplate || DEFAULT_EMAIL_TEMPLATE);
	}, [emailTemplate]);

	const uploadProgress = useTypedSelector(
		state => state.patientDetail.userSlice.uploadProgress,
	);

	const getRandomColor = () =>
		avatarColors[Math.floor(Math.random() * avatarColors.length)];

	const replacePlaceholders = (htmlContent: string) => {
		if (!htmlContent) return '';

		const formValues = form.getFieldsValue();
		const mergedData = { ...userFormData, ...formValues };

		return htmlContent
			.replace(
				'{{name}}',
				mergedData?.firstName
					? `${mergedData?.firstName} ${mergedData?.lastName}`
					: '',
			)
			.replace(
				'{{admin_name}}',
				user.profile?.firstName + ' ' + user.profile?.lastName || 'Admin',
			);
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
		setSelectedDefaultValue(userPlanType);
		setSavedUpgradePlanType(userPlanType);
	};

	const formatRole = (role: string) => {
		switch (role) {
			case USER_ROLES.SUPER_ADMIN:
				return 'Super Admin';
			case USER_ROLES.ADMIN:
				return 'Admin';
			case USER_ROLES.USER:
				return 'User';
			default:
				return role?.charAt(0)?.toUpperCase() + role?.slice(1).toLowerCase();
		}
	};

	const getRoleValue = (formattedRole: string) => {
		const roleMapping: Record<string, string> = {
			'Super Admin': 'superadmin',
			Admin: 'admin',
			User: 'user',
		};
		return roleMapping[formattedRole] || formattedRole?.toLowerCase();
	};

	useEffect(() => {
		if (rowData) {
			setUserFormData({
				firstName: rowData?.firstName || '',
				lastName: rowData?.lastName || '',
				email: rowData?.email,
				mobilePhone: rowData?.mobilePhone,
				invitedRole: formatRole(rowData?.invitedRole || rowData?.role),
				planType: savedPlan,
				tags: savedTags?.map(item => item?.tag?.id) || [],
			});
			form.setFieldsValue({
				firstName: rowData?.firstName,
				lastName: rowData?.lastName,
				email: rowData?.email,
				mobilePhone: rowData?.mobilePhone,
				invitedRole: formatRole(rowData?.invitedRole || rowData?.role),
				planType: savedPlan,
				tags: savedTags?.map(item => item?.tag?.id) || [],
			});
		} else {
			const planType = selectedDefaultValue || undefined;
			setUserFormData({
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				invitedRole: 'User',
				planType: planType,
				tags: [],
			});
			form.setFieldsValue({
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				invitedRole: 'User',
				planType: planType,
				tags: [],
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rowData, activeKey, savedPlan, selectedDefaultValue]);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchData = async () => {
		await dispatch(getEmailTemplate());
		await dispatch(getInviteTemplate());
	};

	const handleValidation = (userFormData: {
		firstName: string;
		lastName: string;
		email: string;
	}) => {
		if (!userFormData?.firstName?.trim()) {
			message.error(
				t('Admin.data.menu.userRoles.invitePatientModal.firstNameRequired'),
			);
			return false;
		} else if (!userFormData?.lastName?.trim()) {
			message.error(
				t('Admin.data.menu.userRoles.invitePatientModal.lastNameRequired'),
			);
			return false;
		} else if (!userFormData?.email?.trim()) {
			message.error(
				t('Admin.data.menu.userRoles.invitePatientModal.emailRequired'),
			);
			return false;
		}
		return true;
	};

	const onFinish = async () => {
		// Get current form values
		const formValues = form.getFieldsValue();
		const mergedData = { ...userFormData, ...formValues };

		if (!handleValidation(mergedData)) {
			return;
		}
		if (mustSendEmail) {
			if (
				/^<p>(\s*|<br\s*\/?>|\s*<br\s*\/?>\s*)<\/p>$/i.test(savedInviteTemplate)
			) {
				message.error(
					t(
						'Admin.data.menu.userRoles.invitePatientModal.emailContentRequired',
					),
				);
				return;
			}
		}
		const payload: PayloadInterface = {
			invitedRole: mergedData?.invitedRole?.toLowerCase(),
			users: [
				{
					firstName: mergedData.firstName,
					lastName: mergedData.lastName,
					email: mergedData.email,
					mobilePhone: mergedData.mobilePhone || '',
					adminIds:
						user?.profile?.role === USER_ROLES.ADMIN
							? [user?.id]
							: mergedData?.adminIds || [],
				},
			],
			message: mustSendEmail
				? replacePlaceholders(savedInviteTemplate) +
					userCredentialsData.replace(
						'{{invite_code}}',
						user?.client?.inviteCode,
					)
				: '',
			password: mergedData.password || '',
			planType: mergedData?.planType || '',
			tags: mergedData?.tags || [],
			mustSendEmail: mustSendEmail,
		};
		const responseData = await dispatch(bulkInviteUsers(payload));

		if (responseData?.payload?.usersAlreadyCreated?.length === 0) {
			message.success(`${t('Patient.data.completeProfile.saveSuccess')}`);
			await fetchRegisteredPatients();
		} else {
			responseData?.payload?.usersAlreadyCreated?.length >= 1 &&
				message.open({
					content: (
						<AlreadyRegisteredUser
							message={message}
							responseData={responseData}
						/>
					),
					duration: 0,
					className: 'already-registered-message',
				});
		}

		await dispatch(getStats());

		await fetchRegisteredPatients();

		// Fetch unassigned patients list
		await dispatch(
			getUnAssignedPatientList({
				nextPage: pagination.nextPage,
				name: '',
				role: '',
			}),
		);

		// Close modal and navigate AFTER all async operations complete
		setIsInvitePatientModalOpen(false);
		dispatch(setUploadProgress(null));
		navigate(router.REGISTEREDPATIENTS);
	};

	const fetchRegisteredPatients = async () => {
		const paginate = {
			...pagination,
			userId: user?.id,
		};
		try {
			const result = await dispatch(getRegisteredPatientList(paginate));

			if (result.type.includes('rejected')) {
				console.error('API call was rejected. Error details:', result.error);
				console.error('Full result:', JSON.stringify(result, null, 2));
			}
		} catch (error) {
			console.error('Failed to fetch registered patients:', error);
		}
	};

	const updateForm = async () => {
		// Get current form values
		const formValues = form.getFieldsValue();
		const mergedData = { ...userFormData, ...formValues };

		if (!handleValidation(mergedData)) {
			return;
		}
		setIsUpdating(true);
		try {
			if (isRegistered) {
				const payload: Record<string, string | undefined | string[]> = {
					firstName: mergedData.firstName,
					lastName: mergedData.lastName,
					email: mergedData.email,
					role:
						mergedData && mergedData.invitedRole
							? getRoleValue(mergedData.invitedRole) || ''
							: '',
					mobilePhone: mergedData?.mobilePhone,
					tags: mergedData?.tags || [],
				};
				if (mergedData.planType?.trim()) {
					payload.planType = mergedData?.planType?.trim();
				}
				const updatedRegistered = await dispatch(
					updateProfileDetails({ payload, id: fullRowDetails?.id || '' }),
				);
				if (updatedRegistered.payload) {
					message.success(`${t('Patient.data.completeProfile.saveSuccess')}`);
				}
				if (fetchDataList) {
					fetchDataList(currentPage || 1, filterButton || '');
				}
			} else {
				const payload = {
					firstName: mergedData.firstName,
					lastName: mergedData.lastName,
					email: mergedData.email,
					invitedRole: getRoleValue(mergedData?.invitedRole),
				};
				const updatedData = await dispatch(
					updateInviteUser({ payload, id: rowData?.id || '' }),
				);
				if (updatedData?.payload) {
					message.success(t('Admin.data.menu.userRoles.updatedSuccess'));
				}
			}
			await dispatch(getStats());
			// Fetch registered patients to ensure list is updated
			await fetchRegisteredPatients();
			// Fetch unassigned patients list
			await dispatch(
				getUnAssignedPatientList({
					nextPage: pagination.nextPage,
					name: '',
					role: '',
				}),
			);
		} catch (error) {
			// Error handling done by Redux thunk
		} finally {
			setIsUpdating(false);
		}
		setIsInvitePatientModalOpen(false);
		dispatch(setUploadProgress(null));
	};

	const handleAdminChange = (selectedFeatures: FeatureIds) => {
		setUserFormData(prev => ({
			...prev,
			adminIds: selectedFeatures,
		}));
	};

	const [file, setFile] = useState<File | undefined | null>(null);

	const isValidEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const beforeUpload = (file: { type: string; size: number; name: string }) => {
		const isValidFormat =
			file.type === 'text/csv' || file.type.includes('spreadsheet');
		const isValidSize = file.size / 1024 / 1024 <= 3;

		if (!isValidFormat) {
			return Upload.LIST_IGNORE;
		}
		if (!isValidSize) {
			message.error(t('Admin.data.menu.userRoles.invitePatientModal.sizeErr'));
			return Upload.LIST_IGNORE;
		}
		return true;
	};

	const formatKeys = (row: UserData, index: number) => {
		return {
			id: (index + 1).toString(),
			physiotherapistPatientAssociationPatientIdRelation:
				user?.profile?.role === USER_ROLES.ADMIN
					? [
							{
								patientId: (index + 1).toString(),
								physiotherapistId: user?.id,
								physiotherapist: user,
							},
						]
					: [],
			phone: row['Phone'] || '',
			profile: {
				email: row['Email'] || '',
				firstName: row['First Name'] || '',
				lastName: row['Last Name'] || '',
				phone: row['Phone'] || '',
				avatarColor: getRandomColor(),
			},
		};
	};

	const handleUpload = ({ file }: { file: File }) => {
		setUploading(true);
		setProgress(10);

		const reader = new FileReader();
		reader.onload = e => {
			setProgress(30);
			const data = new Uint8Array(e.target?.result as ArrayBuffer);
			const workbook = XLSX.read(data, { type: 'array' });

			setProgress(50);

			const sheetName = workbook.SheetNames[0];
			const worksheet = workbook.Sheets[sheetName];
			const jsonData: UserData[] = XLSX.utils.sheet_to_json(worksheet, {
				defval: '',
			});

			setProgress(70);

			const emailSet = new Set<string>();
			let hasDuplicate = false;

			const isValidData = jsonData.every(row => {
				const email = row['Email'];
				if (
					!row['First Name'] ||
					!row['Last Name'] ||
					!email ||
					!isValidEmail(email)
				) {
					return false;
				}
				if (emailSet.has(email)) {
					hasDuplicate = true;
				} else {
					emailSet.add(email);
				}
				return true;
			});

			if (!isValidData) {
				message.error(
					t('Admin.data.menu.userRoles.invitePatientModal.dataErr'),
				);
				setUploading(false);
				setProgress(0);
				return;
			}

			if (hasDuplicate) {
				message.error(
					t('Admin.data.menu.userRoles.invitePatientModal.repeatMailErr'),
				);
				setUploading(false);
				setProgress(0);
				return;
			}

			setProgress(90);

			const formattedData = jsonData.map(formatKeys);
			setFileData(formattedData);
			setFile(file);
			setProgress(100);
			setTimeout(() => {
				setUploading(false);
				message.success(
					t('Admin.data.menu.userRoles.invitePatientModal.dataSuccess'),
				);
			}, 500);
		};

		reader.readAsArrayBuffer(file);
	};

	const handleRemove = () => {
		setFile(null);
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
		if (rowData) {
			getUpgradePlan();
			fetchSelectedPlan(rowData?.userId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rowData]);

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

	const handlePlanChange = (selectedPlan: string) => {
		setUserFormData(prev => ({
			...prev,
			planType: selectedPlan,
		}));
	};

	const handleTagChange = (value: string[]) => {
		setUserFormData(prev => ({
			...prev,
			tags: value,
		}));
	};

	return (
		<Modal
			open={isInvitePatientModalOpen}
			centered
			footer={null}
			destroyOnHidden
			closable={
				uploadProgress == null || uploadProgress.progress === 100
					? closable
					: false
			}
			maskClosable={false}
			width={MODAL_SIZES.LARGE}
			className="select-none"
			onCancel={() => {
				if (isUploaded && fileData.length > 0) {
					Modal.confirm({
						title: t('Admin.data.survey.discardChangesTitle'),
						content: t(
							'Admin.data.menu.userRoles.invitePatientModal.discardChangesContent',
						),
						footer: (
							<Flex justify="flex-end" gap={8}>
								<Flex gap={8} className="w-1/2">
									<Button
										size="middle"
										className="w-2/5"
										onClick={() => {
											Modal.destroyAll();
										}}
										type="default">
										{t('Admin.data.menu.userRoles.invitePatientModal.cancel')}
									</Button>
									<Button
										size="middle"
										className="w-1/2"
										htmlType="submit"
										onClick={() => {
											setIsInvitePatientModalOpen(false);
											Modal.destroyAll();
										}}
										type="primary">
										{t('Admin.data.menu.userRoles.invitePatientModal.discard')}
									</Button>
								</Flex>
							</Flex>
						),
						className: 'select-none',
					});
				} else {
					setIsInvitePatientModalOpen(false);
				}
			}}>
			<>
				{isLoading ? (
					<ModalContentSkeleton />
				) : (
					<>
						<Title level={1} className="profile-heading">
							{rowData
								? t('Admin.data.menu.userRoles.invitePatientModal.editUser')
								: t('Admin.data.menu.userRoles.inviteUser')}
						</Title>
						{rowData ? (
							<Default
								rowData={rowData}
								content={savedInviteTemplate}
								setContent={setInviteTemplate}
								activeKey={activeKey}
								instanceLink={credentials.instanceLink}
								username={credentials.username}
								password={credentials.password}
								inviteCode={credentials.inviteCode}
								userFormData={userFormData}
								form={form}
								setUserFormData={setUserFormData}
								updateForm={updateForm}
								onFinish={onFinish}
								isRegistered={isRegistered}
								isPending={isPending}
								isUpdating={isUpdating}
								handlePlanChange={handlePlanChange}
								inviteTemplate={inviteTemplate || DEFAULT_INVITE_TEMPLATE}
								handleTagChange={handleTagChange}
								painStatus={painStatus}
							/>
						) : (
							<Tabs
								defaultActiveKey={activeKey}
								activeKey={activeKey}
								className="createProgramTab select-none"
								tabBarStyle={{ margin: 0 }}
								onChange={value => setActiveKey(value)}
								items={[
									{
										label: t(
											'Admin.data.menu.userRoles.invitePatientModal.default',
										),
										key: '1',
										children: (
											<Default
												rowData={rowData}
												mustSendEmail={mustSendEmail}
												setMustSendEmail={setMustSendEmail}
												handleAdminChange={handleAdminChange}
												content={savedInviteTemplate}
												setContent={setInviteTemplate}
												activeKey={activeKey}
												instanceLink={credentials.instanceLink}
												username={credentials.username}
												password={credentials.password}
												inviteCode={credentials.inviteCode}
												userFormData={userFormData}
												form={form}
												setUserFormData={setUserFormData}
												updateForm={updateForm}
												onFinish={onFinish}
												isRegistered={isRegistered ?? false}
												isPending={isPending ?? false}
												handlePlanChange={handlePlanChange}
												inviteTemplate={
													inviteTemplate || DEFAULT_INVITE_TEMPLATE
												}
												handleTagChange={handleTagChange}
												defaultPlanOptions={defaultPlanOptions}
											/>
										),
									},
									{
										label: t(
											'Admin.data.menu.userRoles.invitePatientModal.bulkInvite',
										),
										key: '2',
										children:
											isUploaded && fileData.length > 0 ? (
												<>
													{uploadProgress?.progress >= 0 ? (
														<UserUploadProgress />
													) : (
														<BulkInviteTable
															fileData={fileData}
															setIsInvitePatientModalOpen={
																setIsInvitePatientModalOpen
															}
															htmlContentTemplate={savedEmailTemplate}
															mustSendEmail={mustSendEmail}
															defaultPlanOptions={defaultPlanOptions}
															cancelUploaded={() => {
																setIsUploaded(false);
															}}
														/>
													)}
												</>
											) : (
												<BulkInvite
													beforeUpload={beforeUpload}
													setIsUploaded={setIsUploaded}
													rowData={rowData}
													content={savedEmailTemplate}
													setContent={setEmailTemplate}
													activeKey={activeKey}
													instanceLink={credentials.instanceLink}
													username={credentials.username}
													password={credentials.password}
													inviteCode={credentials.inviteCode}
													setIsInvitePatientModalOpen={
														setIsInvitePatientModalOpen
													}
													handleUpload={handleUpload}
													handleRemove={handleRemove}
													uploading={uploading}
													progress={progress}
													file={file ?? null}
													mustSendEmail={mustSendEmail}
													setMustSendEmail={setMustSendEmail}
													inviteTemplate={
														emailTemplate || DEFAULT_EMAIL_TEMPLATE
													}
												/>
											),
									},
								]}
							/>
						)}
					</>
				)}
			</>
		</Modal>
	);
};

export default InvitePatientsModal;
