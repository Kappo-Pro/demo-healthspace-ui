import { UntitledIcon } from '@atoms/Icon';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { Edit01 } from '@vitalflow-icons/general/edit01';
import { Trash01 } from '@vitalflow-icons/general/trash01';
import { UserPlus01 } from '@vitalflow-icons/users/userPlus01';
import { userCredentialsData } from '@constants/inviteTemplates';
import AddPatientToAdmin from '@pages/AddPatientToAdmin';
import TableList from '@pages/AdminUnassignedPatients/TableList';
import { router } from '@routers/routers';
import { USER_ROLES, pagination } from '@stores/constants';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	getRegisteredPatientList,
	getStats,
	getUnAssignedPatientList,
} from '@stores/patients/admin/adminPatient';
import { getTags } from '@stores/settings/settingsSlice';
import { bulkInviteUsers, setUploadProgress } from '@stores/shared/user';
import {
	AdminDashboardPatient,
	AdminPatientData,
	InviteUser,
	Physiotherapist,
	PlanOptionsList,
	RegisteredPatientsProps,
	ResponseDataNewDashoard,
	SelectedPhysiotherapists,
} from '@types';
import {
	Button,
	Flex,
	Form,
	Input,
	Modal,
	Pagination,
	Select,
	Spin,
	Tag,
	Tooltip,
	Typography,
	message,
} from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AlreadyRegisteredUser from './AlreadyRegisteredUser';
import Default from './Default';

const { Paragraph } = Typography;

const { Title } = Typography;

interface BulkInviteTableProps {
	setIsInvitePatientModalOpen: (val: boolean) => void;
	fileData: InviteUser[];
	cancelUploaded: (value: boolean) => void;
	htmlContentTemplate: string;
	mustSendEmail: boolean;
	defaultPlanOptions: PlanOptionsList[];
}

const { Option } = Select;

export const BulkInviteTable = ({
	fileData,
	cancelUploaded,
	htmlContentTemplate,
	setIsInvitePatientModalOpen,
	mustSendEmail,
	defaultPlanOptions,
}: BulkInviteTableProps) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [form] = Form.useForm();
	const [userData, setUserData] = useState<InviteUser[]>(fileData);
	const [userSearchData, setUserSearchedData] = useState(userData);
	const [userPaginatedData, setUserPaginatedData] = useState<InviteUser[]>(
		fileData.slice(0, 10),
	);
	const navigate = useNavigate();
	const user = useTypedSelector(state => state.user);
	const [selectedUserData, setSelectedUserData] = useState<
		InviteUser | undefined
	>();
	const [searchValue, setSearchValue] = useState<string>('');
	const [defaultPassword, setDefaultPassword] = useState('');
	const [activeRowId, setActiveRowId] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [isEditPatientModalOpen, setIsEditPatientModalOpen] = useState(false);
	const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
	const [selectedValue, setSelectedValue] = useState<string | undefined>(
		undefined,
	);
	const savedUserPlans = useTypedSelector(
		state => state.settings?.plans?.savedUserPlans,
	);
	const userRole = useTypedSelector(state => state.user.profile.role);
	const sendingMail = useTypedSelector(state => state.user.sendingBulkMail);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const getSavedTags = useTypedSelector(state => state.settings.advanced.tags);
	const [patientListData, setPatientListData] = useState<
		AdminDashboardPatient[]
	>([]);
	const [allAdminList, setAllAdminList] = useState<
		ResponseDataNewDashoard | undefined
	>(undefined);
	const [allUserList, setAllUserList] = useState<AdminPatientData | undefined>(
		undefined,
	);

	useEffect(() => {
		const dataToDisplay = searchValue?.length > 0 ? userSearchData : userData;
		setUserPaginatedData(
			dataToDisplay.slice((currentPage - 1) * 10, currentPage * 10),
		);
		if (userData.length === 0) {
			cancelUploaded(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData, searchValue, currentPage, userSearchData]); // Added currentPage and userSearchData

	useEffect(() => {
		const userPlanType = savedUserPlans?.planType;
		const matched = defaultPlanOptions?.find(
			opt => opt?.planType === userPlanType,
		);
		if (matched) {
			setSelectedValue(matched?.planType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedUserPlans]); // defaultPlanOptions is stable

	useEffect(() => {
		setUserSearchedData(
			userData.filter(user =>
				`${user?.profile?.firstName ?? ''}${user?.profile?.lastName ?? ''}`
					.toLowerCase()
					.replace(' ', '')
					.includes(searchValue),
			),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchValue]); // userData excluded - causes dependency on parent state changes

	useEffect(() => {
		dispatch(getTags());
	}, [dispatch]);

	const TEAM_HEADER = [
		{ name: '#', sort: true, key: 'index' },
		{ name: t('Admin.data.menu.userRoles.name'), sort: true, key: 'name' },
		{ name: 'Phone', sort: true, key: 'phone' },
		{
			name: t('Admin.data.menu.userRoles.physiotherapist'),
			sort: true,
			key: 'physiotherapist',
		},
	];

	const handleChange = (value: string) => {
		setSelectedValue(value);
	};

	const actions = [
		{
			icon: <UserPlus01 color="stroke-gray-600" width={15} height={16} />,
			action: (rowData: RegisteredPatientsProps) => handleUserClick(rowData),
			label: t('Admin.data.menu.userRoles.addPhysiotherapist'),
			key: 'userPlus',
		},
		{
			icon: <Edit01 color="stroke-gray-600" width={15} height={16} />,
			action: (rowData: InviteUser) => {
				setSelectedUserData(rowData);
				setIsEditPatientModalOpen(true);
			},
			label: t('Admin.data.menu.userRoles.edit'),
		},
		{
			icon: <Trash01 color="stroke-gray-600" width={15} height={16} />,
			action: (rowData: RegisteredPatientsProps) => {
				setActiveRowId(null);
				handleDeleteClick(rowData);
			},
			label: t('Admin.data.menu.userRoles.delete'),
		},
	];

	const validateSubmit = async () => {
		if (defaultPassword?.length <= 0) {
			message.error(
				t('Admin.data.menu.userRoles.invitePatientModal.defaultPasswordErr'),
			);
		} else if (defaultPassword?.length < 8) {
			message.error(
				t('Admin.data.menu.userRoles.invitePatientModal.passwordLengthErr'),
			);
		} else {
			const payload = {
				message: mustSendEmail
					? htmlContentTemplate +
						userCredentialsData.replace(
							'{{invite_code}}',
							user.client.inviteCode,
						)
					: '',
				invitedRole: USER_ROLES.USER,
				users: userData?.map(user => ({
					firstName: user?.profile?.firstName,
					lastName: user?.profile?.lastName,
					email: user?.profile?.email,
					mobilePhone: user?.profile?.phone?.toString(),
					adminIds:
						user?.physiotherapistPatientAssociationPatientIdRelation?.map(
							item => item?.physiotherapistId,
						),
				})),
				password: defaultPassword,
				planType: selectedValue,
				tags: selectedTags,
				mustSendEmail: mustSendEmail,
			};

			// Define fetch function at the beginning of the block
			const fetchRegisteredPatients = async () => {
				const paginate = {
					...pagination,
					userId: user?.id,
				};
				try {
					console.log('[BulkInvite] Fetching registered patients with paginate:', paginate);
					const result = await dispatch(getRegisteredPatientList(paginate));
					console.log('[BulkInvite] Fetch registered patients result:', result);
				} catch (error) {
					console.error('[BulkInvite] Failed to fetch registered patients:', error);
				}
			};

			console.log('[BulkInvite] Submitting bulk invite with payload:', payload);
			const responseData = await dispatch(bulkInviteUsers(payload));
			console.log('[BulkInvite] Bulk invite response:', responseData);

			if (responseData?.payload?.usersAlreadyCreated?.length === 0) {
				message.success(
					t('Admin.data.menu.userRoles.invitePatientModal.dataSuccess'),
				);
				// Fetch registered patients after successful invite
				console.log('[BulkInvite] Fetching registered patients after successful invite...');
				await fetchRegisteredPatients();
			} else {
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

			console.log('[BulkInvite] Fetching stats...');
			await dispatch(getStats());

			// Fetch registered patients again to ensure list is updated
			console.log('[BulkInvite] Fetching registered patients after getStats...');
			await fetchRegisteredPatients();

			// Fetch unassigned patients list
			await dispatch(
				getUnAssignedPatientList({
					nextPage: pagination.nextPage,
					name: '',
					role: '',
				}),
			);

			console.log('[BulkInvite] Closing modal and navigating...');
			// Close modal and navigate AFTER all async operations complete
			setIsInvitePatientModalOpen(false);
			dispatch(setUploadProgress(null));

			if (
				payload?.users?.some(
					user => Array.isArray(user?.adminIds) && user.adminIds.length > 0,
				)
			) {
				console.log('[BulkInvite] Navigating to REGISTEREDPATIENTS');
				navigate(router.REGISTEREDPATIENTS);
			} else {
				console.log('[BulkInvite] Navigating to ROOT');
				navigate(router.ROOT, { state: { active: true } });
			}
		}
	};

	const onPageChange = async (pageNumber: number) => {
		setCurrentPage(pageNumber);
		setUserPaginatedData(
			userData.slice((pageNumber - 1) * 10, pageNumber * 10),
		);
	};

	const selectedPhysiotherapists: SelectedPhysiotherapists[] = userData.reduce(
		(commonPhysios, patient) => {
			const physioIds = new Set(
				patient.physiotherapistPatientAssociationPatientIdRelation?.map(
					item => item.physiotherapistId,
				) || [],
			);

			return commonPhysios.filter(physio =>
				physioIds.has(physio.physiotherapistId),
			);
		},
		userData.length > 0
			? userData[0].physiotherapistPatientAssociationPatientIdRelation
			: [],
	);

	const handleUserClick = (rowData: RegisteredPatientsProps) => {
		setActiveRowId(rowData.id);
	};

	const handleUserUpdate = () => {
		const formValues = form.getFieldsValue();
		setUserData(
			userData.map(user =>
				user?.id == selectedUserData?.id
					? {
							...user,
							profile: {
								firstName: formValues?.firstName ?? '',
								lastName: formValues?.lastName ?? '',
								email: formValues?.email ?? '',
								phone: formValues?.phone,
							},
						}
					: user,
			),
		);
		// Update paginated data immediately
		setUserPaginatedData(
			userPaginatedData.map(user =>
				user?.id == selectedUserData?.id
					? {
							...user,
							profile: {
								firstName: formValues?.firstName ?? '',
								lastName: formValues?.lastName ?? '',
								email: formValues?.email ?? '',
								phone: formValues?.phone,
							},
						}
					: user,
			),
		);
	};

	const handleDeleteClick = async (obj: RegisteredPatientsProps) => {
		setUserData(userData.filter(user => user?.id != obj.id));
	};

	const addPhysiotherapistToUser = (physiotherapists: Physiotherapist[]) => {
		setUserData(
			userData.map(patient => ({
				...patient,
				physiotherapistPatientAssociationPatientIdRelation:
					physiotherapists?.map(physio => ({
						patientId: patient?.id,
						physiotherapistId: physio?.id,
						physiotherapist: physio,
					})),
			})),
		);
	};

	const handleTogglePhysiotherapist = (
		patientId: string,
		physiotherapist: Physiotherapist,
	) => {
		const updatedUserData = userData.map(patient => {
			if (patient?.id === patientId) {
				// Ensure the array exists, default to empty array if undefined
				const currentAssociations =
					patient?.physiotherapistPatientAssociationPatientIdRelation || [];

				// Check if physiotherapist is already assigned
				const isAssigned = currentAssociations.some(
					item => item?.physiotherapistId === physiotherapist?.id,
				);

				return {
					...patient,
					physiotherapistPatientAssociationPatientIdRelation: isAssigned
						? currentAssociations.filter(
								item => item?.physiotherapistId !== physiotherapist?.id,
							)
						: [
								...currentAssociations,
								{
									patientId: patient?.id,
									physiotherapistId: physiotherapist?.id,
									physiotherapist,
								},
							],
				};
			}
			return patient;
		});

		setUserData(updatedUserData);
	};

	const handleTagChange = (value: string[]) => {
		setSelectedTags(value);
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
		<div className="bulk-invite-container bulk-invite-table">
			<div className="bulk-invite-user-info">
				<Flex
					align="center"
					style={{
						fontSize: 'var(--font-size-lg)',
						lineHeight: 'var(--spacing-7)',
						fontWeight: 'var(--font-weight-bold)',
						color: 'var(--gray-800)',
					}}>
					<Title level={3}>{t('Admin.data.newPatients.imported')}</Title>
					<span className="total-patient-length">
						<Tag color="purple">
							{userData.length} {t('Admin.data.newPatients.users')}
						</Tag>
					</span>
				</Flex>
				<span style={{ color: 'var(--gray-800)' }}>
					{t('Admin.data.menu.userRoles.pendingInvites.description')}
				</span>
			</div>
			<div
				style={{
					padding: 'var(--spacing-2-5)',
					backgroundColor: 'var(--collapse-bg-color)',
					borderRadius: 'var(--radius-lg)',
				}}>
				<div
					className="bulk-invite-data-manipulator"
					style={{
						gridTemplateColumns:
							userRole === USER_ROLES.SUPER_ADMIN
								? 'repeat(4, minmax(0, 1fr))'
								: 'repeat(3, minmax(0, 1fr))',
					}}>
					<Input
						prefix={<UntitledIcon name="search" width={17} height={17} />}
						onChange={e => setSearchValue(e.target.value)}
						placeholder={t(
							'Admin.data.menu.patientDetail.aiAssistantPrograms.search',
						)}
						className="input-item"
						style={{ gridColumn: 'span 2 / span 2' }}
						autoComplete="off"
					/>

					<Input.Password
						prefix={<UntitledIcon name="lock" width={17} height={17} />}
						className="input-item"
						onChange={e => setDefaultPassword(e.target.value)}
						placeholder={t(
							'Admin.data.menu.userRoles.invitePatientModal.defaultPassword',
						)}
						style={{ gridColumn: 'span 1 / span 1' }}
						visibilityToggle
						autoComplete="new-password"
					/>

					{userRole === USER_ROLES.SUPER_ADMIN && (
						<Button
							size="large"
							onClick={() => setIsAddAdminModalOpen(true)}
							className="add-admin">
							<UntitledIcon name="plus" width={20} height={20} />
							<p
								style={{
									fontWeight: 'var(--font-weight-bold)',
									color: 'var(--text-on-dark)',
								}}>
								{t('Admin.data.menu.userRoles.invitePatientModal.addAdmin')}
							</p>
						</Button>
					)}
				</div>
			</div>
			<div
				style={{ marginTop: 'var(--spacing-3)', height: 'var(--spacing-12)' }}>
				<span>
					{t('Admin.data.menu.userRoles.invitePatientModal.selectPlan')}
				</span>
				<Select
					placeholder={t(
						'Admin.data.menu.userRoles.invitePatientModal.selectFeatureRequired',
					)}
					className="select-plan-input-item theme-select-dropdown w-full h-full"
					value={selectedValue}
					onChange={handleChange}
					dropdownStyle={{ minWidth: '752px' }}
					dropdownClassName="plan-option-class"
					optionLabelProp="plan"
					allowClear>
					{defaultPlanOptions?.map(value => (
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
			<div style={{ marginTop: 'var(--spacing-3)' }}>
				<span>{t('Admin.data.theme.selectTag')}</span>
				<Select
					placeholder={t('Admin.data.theme.selectTag')}
					className="theme-select-dropdown select-field-input-item w-full"
					mode="multiple"
					value={selectedTags}
					onChange={handleTagChange}
					allowClear
					popupMatchSelectWidth={false}
					dropdownRender={menu => <div className="w-full">{menu}</div>}>
					{getSavedTags?.map(item => (
						<Option key={item.id} value={item.id}>
							{item.name}
						</Option>
					))}
				</Select>
			</div>
			<div className="bulk-invite-data">
				<TableList
					tableData={userPaginatedData}
					columns={TEAM_HEADER}
					actions={userRole === USER_ROLES.ADMIN ? actions.slice(1) : actions}
					activeRowId={activeRowId}
					setActiveRowId={setActiveRowId}
					isRegistered={true}
					currentPage={1}
					searchValue={searchValue}
					handleTogglePhysiotherapist={handleTogglePhysiotherapist}
					patientListData={patientListData}
					allAdminList={allAdminList}
					setPatientListData={setPatientListData}
					setAllAdminList={setAllAdminList}
					allUserList={allUserList}
					setAllUserList={setAllUserList}
					setFilterButton={() => {}}
					isUnAssigned={false}
					isBulkInvite
				/>
			</div>
			<div
				style={{
					backgroundColor: 'var(--collapse-bg-color)',
					borderRadius: 'var(--radius-lg)',
				}}>
				<Pagination
					current={currentPage}
					total={
						searchValue?.length > 0 ? userSearchData.length : userData.length
					}
					onChange={onPageChange}
					pageSize={10}
					className="text-center"
					showSizeChanger={false}
				/>
			</div>
			<div className="bulk-invite-actions">
				<Button
					size="large"
					className="w-1/2"
					onClick={() => {
						cancelUploaded(false);
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
					{sendingMail ? (
						<Flex gap={8} align="center">
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
				</Button>
			</div>
			{
				<Modal
					open={isEditPatientModalOpen}
					centered
					footer={null}
					destroyOnHidden
					closable={true}
					maskClosable={false}
					width={MODAL_SIZES.LARGE}
					style={{ marginTop: 10, marginBottom: 10 }}
					onCancel={() => {
						setIsEditPatientModalOpen(false);
						form.resetFields();
					}}
					afterOpenChange={open => {
						if (open && selectedUserData?.profile) {
							form.setFieldsValue(selectedUserData.profile);
						}
					}}>
					<Default
						rowData={selectedUserData?.profile}
						handleUserUpdate={handleUserUpdate}
						userFormData={selectedUserData?.profile}
						setUserFormData={userProfileInfo => {
							if (!selectedUserData) {
								console.warn(
									'Cannot update user form data: selectedUserData is undefined',
								);
								return;
							}
							setSelectedUserData({
								...selectedUserData,
								profile: userProfileInfo,
							});
						}}
						setIsEditPatientModalOpen={setIsEditPatientModalOpen}
						form={form}
						isBulkInvite
					/>
				</Modal>
			}
			{
				<Modal
					open={isAddAdminModalOpen}
					centered
					footer={null}
					destroyOnHidden
					closable={true}
					maskClosable={false}
					width={600}
					style={{ marginTop: 10, marginBottom: 10 }}
					onCancel={() => {
						setIsAddAdminModalOpen(false);
					}}>
					<AddPatientToAdmin
						selectedPhysiotherapists={selectedPhysiotherapists}
						addPhysiotherapistToUser={addPhysiotherapistToUser}
						setIsAddAdminModalOpen={setIsAddAdminModalOpen}
						setActiveRowId={setActiveRowId}
						currentPage={currentPage}
						isRegistered={true}
						filterButton=""
						searchName={searchValue}
						role={USER_ROLES.USER}
						patientListData={patientListData}
						allAdminList={allAdminList}
						setPatientListData={setPatientListData}
						setAllAdminList={setAllAdminList}
						allUserList={allUserList}
						setAllUserList={setAllUserList}
						isBulkInvite
					/>
				</Modal>
			}
		</div>
	);
};
