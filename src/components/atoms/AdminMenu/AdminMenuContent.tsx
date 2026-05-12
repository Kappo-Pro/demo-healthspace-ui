import {
	AdminMenuContentProps,
	IStatusNormalized,
	SubMenuAdmin,
	Status} from '@types';
import { Badge, Typography } from 'antd';

const { Paragraph } = Typography;

const { Title } = Typography;
import { useTranslation } from 'react-i18next';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import AdminMenuContactsData from './AdminMenuContactsData';
import AdminMenuActivityData from './AdminMenuActivityData';
import { saveState } from '@stores/activity/contacts/contacts';
import AdminMenuContactsContent from './AdminMenuContactsContent';
import { ProgramUploadProgress } from './ProgramUploadProgress';
import { ACTIVETAB, THEME, USER_ROLES } from '@stores/constants';
import { useTheme } from '@providers/ThemeProvider';

export default function AdminMenuContent(props: AdminMenuContentProps) {
	const {
		activeMenu,
		activeSubMenu,
		setActiveSubMenu,
		onClick,
		activeSubPatients,
		setActiveSubPatients,
	} = props;
	const { t } = useTranslation();
	const user = useTypedSelector(state => state.user);
	const dispatch = useTypedDispatch();
	const isSuperAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN;
	const { uploadProgress } = useTypedSelector(
		state => state.patientDetail.program.main,
	);
	const { theme } = useTheme();

	const subMenuHome: SubMenuAdmin[] = [
		{
			label: t('admin.dashboard.newPatients'),
			key: 'new-patients',
			icon: <Badge color="var(--color-info-300)" />,
			status: 'newPatients',
		},
		{
			label: t('admin.dashboard.pendingReview'),
			key: 'pending-review',
			icon: <Badge color="var(--color-yellow-500)" />,
			status: Status.pendingReview,
		},
		{
			label: t('admin.dashboard.outOfParameters'),
			key: 'out-of-parameters',
			icon:
				theme === THEME.VIBRANT ? (
					<Badge color="var(--color-gray-900)">
						<span
							className="ant-badge-status-dot"
							style={{
								border: '1px solid var(--surface-primary)',
								color: 'var(--color-gray-900)',
								background: 'var(--color-gray-900)',
							}}></span>
					</Badge>
				) : (
					<Badge color="var(--color-gray-900)" />
				),
			status: Status.outOfParams,
		},
		{
			label: t('admin.dashboard.followUpRequired'),
			key: 'follow-up-required',
			icon: <Badge color="var(--color-warning-600)" />,
			status: Status.followUpRequired,
		},
		{
			label: t('admin.dashboard.escalationRequired'),
			key: 'escalation-required',
			icon: <Badge color="var(--color-error-600)" />,
			status: Status.escalationRequired,
		},
		{
			label: t('admin.dashboard.reviewed'),
			key: 'reviewed',
			icon: <Badge color="var(--color-success-600)" />,
			status: Status.reviewed,
		},
	];

	const totalUsersStatus = useTypedSelector(state => ({
		newPatients: state.adminDashboardPatient.statsCount.newUsers,
		outOfParams:
			state.adminDashboardPatient.statsCount.outOfParams.evaluation +
			state.adminDashboardPatient.statsCount.outOfParams.letsMove +
			state.adminDashboardPatient.statsCount.outOfParams.omniRom +
			state.adminDashboardPatient.statsCount.outOfParams.survey,
		pendingReview:
			state.adminDashboardPatient.statsCount.pendingReview.evaluation +
			state.adminDashboardPatient.statsCount.pendingReview.letsMove +
			state.adminDashboardPatient.statsCount.pendingReview.omniRom +
			state.adminDashboardPatient.statsCount.pendingReview.survey,
		reviewed:
			state.adminDashboardPatient.statsCount.reviewed.evaluation +
			state.adminDashboardPatient.statsCount.reviewed.letsMove +
			state.adminDashboardPatient.statsCount.reviewed.omniRom +
			state.adminDashboardPatient.statsCount.reviewed.survey,
		escalationRequired:
			state.adminDashboardPatient.statsCount.escalationRequired.evaluation +
			state.adminDashboardPatient.statsCount.escalationRequired.letsMove +
			state.adminDashboardPatient.statsCount.escalationRequired.omniRom +
			state.adminDashboardPatient.statsCount.escalationRequired.survey,
		followUpRequired:
			state.adminDashboardPatient.statsCount.followUpRequired.evaluation +
			state.adminDashboardPatient.statsCount.followUpRequired.letsMove +
			state.adminDashboardPatient.statsCount.followUpRequired.omniRom +
			state.adminDashboardPatient.statsCount.followUpRequired.survey,
	}));

	return (
		<div
			className={`admin-menu-content ${
				activeMenu === 'downloadApp' && user?.profile?.role != USER_ROLES.USER
					? 'bg-[var(--color-gray-50)]'
					: ''
			}`}>
			{activeMenu == 'contacts' ? (
				<AdminMenuContactsData {...props} />
			) : activeMenu == 'activity' ? (
				<AdminMenuActivityData {...props} />
			) : activeMenu == 'downloadApp' ? (
				<></>
			) : (
				activeMenu === '' && (
					<div className="submenu-list">
						{!isSuperAdmin && (
							<Title level={3} className="submenu-title">
								{t('admin.dashboard.title')}
							</Title>
						)}
						<ul>
							{!isSuperAdmin ? (
								subMenuHome.map((item: SubMenuAdmin, index) => {
									return (
										<li
											className={`submenu-item ${activeSubMenu === item.key ? 'submenu-item-active' : ''}`}
											key={index}
											onClick={() => {
												setActiveSubMenu(item.key);
												props.onClick(item.key);
												dispatch(
													saveState({
														activeTab: ACTIVETAB.EVALUATION,
														userId: '',
													}),
												);
											}}>
											<span className="icon-container">{item.icon}</span>
											<span className="label-container">{item.label}</span>
											{item.key != 'summary' && (
												<span style={{ float: 'right', marginRight: 'var(--spacing-1)' }}>
													<Badge
														count={
															totalUsersStatus[
																item?.status as keyof IStatusNormalized
															]
														}
														className="custom-badge"
													/>
												</span>
											)}
										</li>
									);
								})
							) : (
								<AdminMenuContactsContent
									onClick={onClick}
									activeSubPatients={activeSubPatients}
									setActiveSubPatients={setActiveSubPatients}
								/>
							)}
						</ul>
					</div>
				)
			)}
			<ul className="user-info-list">
				<div className="max-h-44 overflow-auto">
					{uploadProgress?.map(item => {
						return <ProgramUploadProgress progressData={item} />;
					})}
				</div>
				{activeMenu != 'downloadApp' &&
					user?.profile?.role != USER_ROLES.USER && (
						<li className="user-info-item">
							<span className="user-details">
								<Paragraph className="user-name-label">
									{user?.profile?.fullName}
								</Paragraph>
								<Paragraph className="user-email-label">
									{user?.profile?.email}
								</Paragraph>
							</span>
						</li>
					)}
			</ul>
		</div>
	);
}
