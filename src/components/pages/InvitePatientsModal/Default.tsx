import { UntitledIcon } from '@atoms/Icon';
import { FormSelectWithPagination } from '@components/molecules/FormComponents';
import { USER_ROLES } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { getAllAdmin } from '@stores/patients/admin/adminPatient';
import { getTags } from '@stores/shared/settings/settings';
import { PlanOptionsList } from '@types';
import { getEmailRules, getPhoneRules } from '@utils/form/validation';
import {
	Avatar,
	Button,
	Checkbox,
	Flex,
	Form,
	Input,
	Select,
	Spin,
	Tooltip,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextEditor from './TextEditor';

const { Paragraph } = Typography;

const { Option } = Select;

export interface Default {
	setMustSendEmail?: (value: boolean) => void;
	mustSendEmail?: boolean;
	rowData: unknown;
	renderMessageField?: () => void;
	userFormData: unknown;
	setUserFormData: (value: unknown) => void;
	updateForm: () => void;
	onFinish: () => void;
	isRegistered?: boolean;
	handleAdminChange?: (val: string[]) => void;
	isBulkInvite?: boolean;
	setIsEditPatientModalOpen?: (val: boolean) => void;
	handleUserUpdate?: () => void;
	form: unknown;
	isUpdating?: boolean;
	content: string;
	setContent: (value: string) => void;
	activeKey: string | number;
	instanceLink: string;
	username: string;
	password: string;
	inviteCode: string;
	handlePlanChange?: (value: string) => void;
	isPending?: boolean;
	inviteTemplate: string;
	handleTagChange?: (value: string[]) => void;
	painStatus?: PlanOptionsList[];
	defaultPlanOptions?: PlanOptionsList[];
}

const selectRole = [
	{ id: 1, name: 'Super Admin', value: USER_ROLES.SUPER_ADMIN },
	{ id: 2, name: 'Admin', value: USER_ROLES.ADMIN },
	{ id: 3, name: 'User', value: USER_ROLES.USER },
];

const Default = (props: Partial<Default>) => {
	const { t } = useTranslation();
	const {
		inviteTemplate,
		rowData,
		updateForm,
		onFinish,
		userFormData,
		isRegistered,
		isPending,
		isBulkInvite = false,
		setMustSendEmail,
		mustSendEmail,
		setIsEditPatientModalOpen,
		handleUserUpdate,
		isUpdating,
		form,
		inviteCode,
		password,
		username,
		instanceLink,
		activeKey,
		setContent,
		content,
		painStatus,
		defaultPlanOptions,
	} = props;
	const allAdminList = useTypedSelector(
		state => state.adminDashboardPatient.allAdminList,
	);
	const user = useTypedSelector(state => state.user);
	const sendingMail = useTypedSelector(state => state.user.sendingBulkMail);
	const isSuperAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN;
	const [currentPage, setCurrentPage] = useState(1);
	const [tagsList, setTagsList] = useState([]);

	const onPageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
		fetchData(pageNumber);
	};

	const dispatch = useTypedDispatch();
	const PlanOptions = rowData ? painStatus : defaultPlanOptions;

	useEffect(() => {
		fetchTags();
		if (isSuperAdmin) {
			fetchData(1);
		}
	}, []);

	const fetchTags = async () => {
		const data = await dispatch(getTags());
		setTagsList(data?.payload);
	};

	const fetchData = async (page: number) => {
		const payload = {
			limit: 10,
			page: page,
		};
		await dispatch(getAllAdmin(payload));
	};

	const onSlectIsMail = (value: boolean) => {
		if (setMustSendEmail) {
			setMustSendEmail(value);
		}
	};

	const validateSubmit = () => {
		form
			.validateFields()
			.then(values => {
				if (values.email && values.firstName && values.lastName) {
					if (handleUserUpdate) {
						handleUserUpdate();
					}
					if (setIsEditPatientModalOpen) {
						setIsEditPatientModalOpen(false);
					}
				}
			})
			.catch(() => {
				// Validation failed, form will show errors
			});
	};

	// Watch invitedRole to conditionally show adminIds field
	const invitedRole = Form.useWatch('invitedRole', form);

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
		<Form
			form={form}
			className="default-invite-page"
			layout="vertical"
			onFinish={rowData ? updateForm : onFinish}
			initialValues={userFormData}>
			<>
				<Flex gap={20} className="mt-6 w-full">
					<Form.Item
						label={t('Patient.data.completeProfile.firstName')}
						name="firstName"
						className="w-1/2"
						rules={[
							{
								required: true,
								message: t(
									'Admin.data.menu.userRoles.invitePatientModal.firstNameRequired',
								),
							},
						]}>
						<Input
							className="input-item"
							placeholder={t(
								'Admin.data.menu.userRoles.invitePatientModal.firstNamePlaceholder',
							)}
						/>
					</Form.Item>
					<Form.Item
						label={t('Patient.data.completeProfile.lastName')}
						name="lastName"
						className="w-1/2"
						rules={[
							{
								required: true,
								message: t(
									'Admin.data.menu.userRoles.invitePatientModal.lastNameRequired',
								),
							},
						]}>
						<Input
							className="input-item"
							placeholder={t(
								'Admin.data.menu.userRoles.invitePatientModal.lastNamePlaceholder',
							)}
						/>
					</Form.Item>
				</Flex>
				<Flex gap={20} className="w-full">
					{!isBulkInvite && (
						<Form.Item
							label={t('Admin.data.menu.userRoles.invitePatientModal.mobile')}
							name="mobilePhone"
							className={`${rowData ? 'w-full' : 'w-1/2'}`}
							rules={getPhoneRules({ required: false })}>
							<Input
								className="input-item"
								type="tel"
								inputMode="numeric"
								placeholder={t(
									'Admin.data.menu.userRoles.invitePatientModal.mobileNumberPlaceholder',
								)}
							/>
						</Form.Item>
					)}
					{!rowData && (
						<Form.Item
							label={t('Admin.data.menu.userRoles.invitePatientModal.password')}
							name="password"
							className="w-1/2"
							rules={[
								{
									required: true,
									message: t(
										'Admin.data.menu.userRoles.invitePatientModal.passwordRequired',
									),
								},
							]}>
							<Input.Password
								prefix={<UntitledIcon name="lock" width={17} height={17} />}
								className="input-item"
								type="password"
								placeholder={t(
									'Admin.data.menu.userRoles.invitePatientModal.passwordPlaceholder',
								)}
							/>
						</Form.Item>
					)}
				</Flex>
				<Flex gap={20} className="w-full">
					<Form.Item
						label={t('Admin.data.menu.userRoles.invitePatientModal.email')}
						name="email"
						className={`${rowData ? 'w-full' : 'w-1/2'}`}
						rules={getEmailRules({ required: true })}>
						<Input
							className="input-item"
							type="email"
							placeholder={t(
								'Admin.data.menu.userRoles.invitePatientModal.emailPlaceholder',
							)}
						/>
					</Form.Item>
					{isBulkInvite && (
						<Form.Item
							label={t('Admin.data.menu.userRoles.invitePatientModal.phone')}
							name="phone"
							className="w-1/2"
							rules={getPhoneRules({ required: false })}>
							<Input
								className="input-item"
								disabled={isRegistered ? true : false}
								type="tel"
								inputMode="numeric"
								placeholder={'Phone number required'}
							/>
						</Form.Item>
					)}
					{!isBulkInvite && !rowData && isSuperAdmin && (
						<Form.Item
							label={t('Admin.data.menu.userRoles.invitePatientModal.role')}
							name="invitedRole"
							className="w-1/2 theme-select-dropdown"
							rules={[
								{
									required: true,
									message: t(
										'Admin.data.menu.userRoles.invitePatientModal.roleRequired',
									),
								},
							]}>
							<Select
								placeholder={t(
									'Admin.data.menu.userRoles.invitePatientModal.roleRequired',
								)}
								className="custom-select-class input-item"
								onChange={value => {
									const selectedRole = selectRole.find(
										option => option.id === value,
									);
									form.setFieldValue('invitedRole', selectedRole?.value);

									// Fetch admins if role is 'user'
									if (selectedRole?.value === USER_ROLES.USER) {
										fetchData(1);
									}
								}}
								allowClear>
								{selectRole?.map(option => (
									<Option key={option?.id} value={option?.id}>
										{option.name}
									</Option>
								))}
							</Select>
						</Form.Item>
					)}
				</Flex>
				{user?.profile?.role === USER_ROLES.SUPER_ADMIN &&
					!rowData &&
					invitedRole?.toLowerCase() === USER_ROLES.USER && (
						<Form.Item
							label={
								<Flex
									justify="space-between"
									align="center"
									className="w-screen">
									<span>
										{t(
											'Admin.data.menu.userRoles.invitePatientModal.selectAdmin',
										)}
									</span>
								</Flex>
							}
							name="adminIds">
							<FormSelectWithPagination
								mode="multiple"
								data={allAdminList?.data || []}
								totalCount={allAdminList?.pagination?.totalCount || 0}
								currentPage={currentPage}
								onPageChange={onPageChange}
								pageSize={10}
								placeholder={t(
									'Admin.data.menu.userRoles.invitePatientModal.selectAdmin',
								)}
								className="select-field-input-item admin-select theme-select-dropdown w-full"
								getOptionKey={item => item.id}
								getOptionValue={item => item.id}
								renderOption={item => (
									<Flex align="center" gap={8}>
										{item?.profile?.imageUrl ? (
											<Avatar
												src={item?.profile?.imageUrl}
												alt="avatar"
												size="small"
											/>
										) : (
											<Avatar
												style={{
													backgroundColor:
														item?.profile?.avatarColor ||
														'var(--brand-primary)',
													color: 'var(--text-on-brand)',
													fontSize: 'var(--font-size-sm)',
												}}
												alt="avatar"
												size="small">
												{item?.profile?.firstName
													? item?.profile?.firstName.charAt(0).toUpperCase()
													: 'U'}
											</Avatar>
										)}
										<span>
											{item?.profile?.firstName} {item?.profile?.lastName}
										</span>
									</Flex>
								)}
							/>
						</Form.Item>
					)}
				{!isBulkInvite && !isPending && (
					<Form.Item
						label={
							<Flex justify="space-between" align="center" className="w-screen">
								<span>
									{t('Admin.data.menu.userRoles.invitePatientModal.selectPlan')}
								</span>
							</Flex>
						}
						name="planType"
						rules={[
							{
								required: true,
								message: t(
									'Admin.data.menu.userRoles.invitePatientModal.planRequired',
								),
							},
						]}>
						<Select
							placeholder={t(
								'Admin.data.menu.userRoles.invitePatientModal.selectPlan',
							)}
							className="select-field-input-item theme-select-dropdown h-12"
							optionLabelProp="plan"
							dropdownClassName="plan-option-class"
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
					</Form.Item>
				)}
				<Form.Item
					label={
						<Flex justify="space-between" align="center" className="w-screen">
							<span>{t('Admin.data.theme.selectTag')}</span>
						</Flex>
					}
					name="tags">
					<Select
						placeholder={t('Admin.data.theme.selectTag')}
						className="select-field-input-item theme-select-dropdown w-full"
						mode="multiple"
						allowClear
						popupMatchSelectWidth={false}
						dropdownRender={menu => <div className="w-full">{menu}</div>}>
						{tagsList?.map(item => (
							<Option key={item.id} value={item.id}>
								{item.name}
							</Option>
						))}
					</Select>
				</Form.Item>
			</>
			{!rowData && !isRegistered && (
				<Flex
					justify="flex-end"
					className="w-full"
					style={{ marginBottom: 'var(--spacing-3-5)' }}>
					<Checkbox
						checked={mustSendEmail}
						onChange={e => onSlectIsMail(e.target.checked)}>
						{t('Admin.data.menu.userRoles.invitePatientModal.sentMail')}
					</Checkbox>
				</Flex>
			)}
			{mustSendEmail && (
				<Form.Item style={{ marginBottom: 'var(--spacing-2)' }}>
					<Flex justify="flex-end">
						<span
							className="settings-templates-reset-to-default"
							onClick={() => {
								if (inviteTemplate) {
									setContent?.(inviteTemplate);
								}
							}}
							style={{
								cursor: 'pointer',
								fontSize: 'var(--font-size-sm)',
								color: 'var(--brand-primary)',
							}}>
							{t('Admin.data.menu.setting.reset')}
						</span>
					</Flex>
				</Form.Item>
			)}
			{mustSendEmail &&
				!rowData &&
				content &&
				setContent &&
				activeKey &&
				instanceLink &&
				username &&
				password &&
				inviteCode && (
					<TextEditor
						content={content}
						setContent={setContent}
						activeKey={activeKey}
						instanceLink={instanceLink}
						username={username}
						password={password}
						inviteCode={inviteCode}
					/>
				)}
			<Form.Item className="w-full">
				{isBulkInvite ? (
					<div className="bulk-invite-actions">
						<Button
							size="large"
							className="w-1/2"
							onClick={() => {
								setIsEditPatientModalOpen?.(false);
							}}
							type="default">
							{t('Admin.data.menu.userRoles.invitePatientModal.cancel')}
						</Button>{' '}
						<Button
							size="large"
							className="w-1/2"
							htmlType="submit"
							onClick={() => validateSubmit()}
							type="primary">
							{t('Admin.data.menu.userRoles.invitePatientModal.save')}
						</Button>
					</div>
				) : (
					<Button
						size="large"
						htmlType="submit"
						type="primary"
						className="w-full"
						loading={isUpdating}>
						{rowData ? (
							t('Admin.data.menu.userRoles.invitePatientModal.update')
						) : (
							<>
								{sendingMail ? (
									<Flex align="center" gap={8}>
										<Spin size="small" className="spin-css spin-css-inbox" />
										<Paragraph>
											{t(
												'Admin.data.menu.patientDetail.aiAssistantRomSummary.saving',
											)}
										</Paragraph>
									</Flex>
								) : (
									<>{t('Admin.data.menu.userRoles.invitePatientModal.save')}</>
								)}
							</>
						)}
					</Button>
				)}
			</Form.Item>
		</Form>
	);
};

export default Default;
export { selectRole };
