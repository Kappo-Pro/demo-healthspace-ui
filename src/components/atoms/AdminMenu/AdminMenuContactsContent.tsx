import { UserPlus01 } from '@vitalflow-icons/users/userPlus01';
import InvitePatientsModal from '@pages/InvitePatientsModal';
import { useTheme } from '@providers/ThemeProvider';
import { router } from '@routers/routers';
import { ADMIN_KEYS, THEME, USER_ROLES } from '@stores/constants';
import { useTypedSelector } from '@stores/index';
import {
	IStatusNormalizedPatients,
	SubMenuAdminPatients,
	StatusPatients} from '@types';
import { Badge, Button, Typography } from 'antd';
import { BADGE_COLORS } from '@atoms/Badge/badgeConfig';

const { Title } = Typography;
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

interface IAdminMenuContactsContent {
	onClick: (item: string) => void;
	activeSubPatients: string;
	setActiveSubPatients: (value: string) => void;
}

export default function AdminMenuContactsContent(
	props: IAdminMenuContactsContent,
) {
	const { onClick, activeSubPatients, setActiveSubPatients } = props;
	const [isInvitePatientModalOpen, setIsInvitePatientModalOpen] =
		useState(false);
	const user = useTypedSelector(state => state.user);
	const isSuperAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN;
	const { t } = useTranslation();
	const { theme } = useTheme();
	const location = useLocation();

	const subMenuPatients: SubMenuAdminPatients[] = [
		{
			label: isSuperAdmin
				? t('admin.users.unassigned')
				: t('admin.patients.unassigned'),
			key: isSuperAdmin ? '' : 'unassigned-patients',
			icon:
				theme === THEME.VIBRANT ? (
					<Badge color={BADGE_COLORS.UNASSIGNED}>
						<span
							className="ant-badge-status-dot"
							style={{
								border: '1px solid var(--surface-primary)',
								color: 'var(--color-gray-900)',
								background: 'var(--color-gray-900)',
							}}></span>
					</Badge>
				) : (
					<Badge color={BADGE_COLORS.UNASSIGNED} />
				),
			status: StatusPatients.unAssignedPatients,
		},
		{
			label: isSuperAdmin
				? t('admin.users.registered')
				: t('admin.patients.registered'),
			key: 'registered-patients',
			icon: <Badge color={BADGE_COLORS.REGISTERED} />,
			status: StatusPatients.registeredPatients,
		},
		{
			label: 'Consent Form',
			key: 'consent-form-patients',
			icon: <Badge color={BADGE_COLORS.CONSENT} />,
			status: StatusPatients.consentFormPatients,
		},
	];

	const totalPatientsStatus = useTypedSelector(state => {
		return {
			unAssignedPatients: state.adminDashboardPatient.unAssignedCount || 0,
			pendingInvites: state.adminDashboardPatient.pendingCount || 0,
			registeredPatients:
				(user?.profile?.role === USER_ROLES.ADMIN
					? state.adminDashboardPatient.assignedCount
					: state.adminDashboardPatient.registeredCount) || 0,
			consentFormPatients: state.adminDashboardPatient.consentFormCount || 0,
		};
	});

	const buttonStyle = {
		color: 'var(--button-text-color)',
		border: 'inherit',
		width: '100%',
		marginBottom: 'var(--spacing-5)',
	};

	useEffect(() => {
		if (location.pathname === router.UNASSIGNEDPATIENTS) {
			setActiveSubPatients(ADMIN_KEYS.UNASSIGNEDPATIENTS);
		} else if (location.pathname === router.PENDINGINVITES) {
			setActiveSubPatients(ADMIN_KEYS.PENDINGINVITES);
		} else if (location.pathname === router.REGISTEREDPATIENTS) {
			setActiveSubPatients(ADMIN_KEYS.REGISTEREDPATIENTS);
		} else if (location.pathname === router.CONSENTFORMPATIENTS) {
			setActiveSubPatients(ADMIN_KEYS.CONSENTFORMPATIENTS);
		}
	}, [location.pathname, setActiveSubPatients]);

	return (
		<>
			<Title level={3} className="submenu-title">
				{isSuperAdmin ? t('admin.users.label') : t('admin.patients.label')}
			</Title>
			<Button
				style={buttonStyle}
				className="start-session-css"
				icon={
					<UserPlus01
						height={15}
						width={16}
						color={
							theme === THEME.VIBRANT
								? 'stroke-white'
								: 'stroke-[var(--color-purple-600)]'
						}
					/>
				}
				onClick={e => {
					e.stopPropagation();
					setIsInvitePatientModalOpen(true);
				}}>
				{t('admin.patients.invite')}
			</Button>
			{isInvitePatientModalOpen && (
				<InvitePatientsModal
					isInvitePatientModalOpen={isInvitePatientModalOpen}
					setIsInvitePatientModalOpen={setIsInvitePatientModalOpen}
					closable={true}
				/>
			)}
			<ul>
				{subMenuPatients.map((item: SubMenuAdminPatients, index) => {
					return (
						<li
							className={`submenu-item ${activeSubPatients === item.key ? 'submenu-item-active' : ''}`}
							key={index}
							onClick={() => {
								setActiveSubPatients(item.key);
								onClick(item.key);
							}}>
							<span className="icon-container">{item.icon}</span>
							<span className="label-container">{item.label}</span>
							{item.key != 'summary' && (
								<span style={{ float: 'right', marginRight: 'var(--spacing-1)' }}>
									<Badge
										count={
											totalPatientsStatus[
												item?.status as keyof IStatusNormalizedPatients
											]
										}
										className="custom-badge"
									/>
								</span>
							)}
						</li>
					);
				})}
			</ul>
		</>
	);
}
