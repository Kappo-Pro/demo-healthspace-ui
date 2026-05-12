import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { router } from '@routers/routers';
import { useTypedSelector } from '@stores/index';
import { USER_ROLES } from '@stores/constants';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  onClick?: () => void,
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    onClick,
  } as MenuItem;
}

export const useAdminMenuItems = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useTypedSelector(state => state.user);
  const _isSuperAdmin = user?.profile?.role === USER_ROLES.SUPER_ADMIN;

  const menuItems: MenuItem[] = [
    getItem(
      t('Admin.data.menu.userRoles.unAssignedPatients.label') || 'Unassigned Patients',
      'unassigned',
      <UntitledIcon name="user-plus" />,
      undefined,
      () => navigate(router.UNASSIGNEDPATIENTS)
    ),
    getItem(
      t('Admin.data.menu.userRoles.registeredPatients.label') || 'Registered Patients',
      'registered',
      <UntitledIcon name="users" />,
      undefined,
      () => navigate(router.REGISTEREDPATIENTS)
    ),
    getItem(
      t('Admin.data.menu.userRoles.consentFormPatients.label') || 'Consent Form Patients',
      'consent',
      <UntitledIcon name="file-text" />,
      undefined,
      () => navigate(router.CONSENTFORMPATIENTS)
    ),
    getItem(
      t('Admin.data.menu.userRoles.pendingInvites.label') || 'Pending Invites',
      'pending',
      <UntitledIcon name="clock" />,
      undefined,
      () => navigate(router.PENDINGINVITES)
    ),
  ];

  return { menuItems };
};
