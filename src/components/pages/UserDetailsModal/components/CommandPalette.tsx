import React, { useState } from 'react';
import { Card, Button, Flex, Typography, Space, Modal } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedSelector, useTypedDispatch } from '@stores/index';
import { CommandPaletteProps, ActionCard } from '../types';
import { USER_ROLES } from '@stores/constants';
import {
  updateUserRole,
  sendPasswordReset,
  updateConsentStatus,
  deleteUserAccount} from '@stores/shared/userManagement';

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  userId,
  userData,
  onRefresh
}) => {
  const dispatch = useTypedDispatch();
  const currentUser = useTypedSelector(state => state.user);
  const [loading, setLoading] = useState<string | null>(null);

  const handleAssignAdmin = async () => {
    setLoading('assign-admin');
    try {
      const currentRole = userData.profile?.role;
      const newRole = currentRole === USER_ROLES.ADMIN ? USER_ROLES.USER : USER_ROLES.ADMIN;

      await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
      onRefresh?.();
    } catch (error) {
      // Error message already shown by the thunk
    } finally {
      setLoading(null);
    }
  };

  const handleResetPassword = async () => {
    setLoading('reset-password');
    try {
      await dispatch(sendPasswordReset({
        userId,
        email: userData.profile?.email || ''
      })).unwrap();
    } catch (error) {
      // Error message already shown by the thunk
    } finally {
      setLoading(null);
    }
  };

  const handleConsentManagement = async () => {
    setLoading('consent');
    try {
      const newStatus = !userData.profile?.consentPolicyRead;
      await dispatch(updateConsentStatus({ userId, consentStatus: newStatus })).unwrap();
      onRefresh?.();
    } catch (error) {
      // Error message already shown by the thunk
    } finally {
      setLoading(null);
    }
  };

  const handleDeleteUser = () => {
    Modal.confirm({
      title: 'Delete User Account',
      content: `Are you sure you want to permanently delete ${userData.profile?.firstName} ${userData.profile?.lastName}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading('delete');
        try {
          await dispatch(deleteUserAccount({ userId })).unwrap();
          onRefresh?.();
          // Close modal after successful deletion
          // The parent component should handle closing
        } catch (error) {
          // Error message already shown by the thunk
        } finally {
          setLoading(null);
        }
      },
    });
  };

  const actions: ActionCard[] = [
    // Only show "Assign Admin" if user is not already an admin
    ...(userData.profile?.role !== USER_ROLES.ADMIN ? [{
      key: 'assign-admin',
      icon: <UntitledIcon name="user" size={24} style={{ color: 'var(--brand-primary)' }} />,
      title: 'Assign Admin Role',
      description: 'Grant administrative privileges to manage patients and users',
      buttonText: 'Assign Admin',
      buttonType: 'primary' as const,
      action: handleAssignAdmin,
      requiredRole: [USER_ROLES.SUPER_ADMIN],
    }] : []),
    {
      key: 'reset-password',
      icon: <UntitledIcon name="lock" size={24} style={{ color: 'var(--color-warning-600)' }} />,
      title: 'Reset Password',
      description: 'Send a password reset link to the user\'s email address',
      buttonText: 'Send Reset Link',
      buttonType: 'default',
      action: handleResetPassword,
      requiredRole: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
    },
    {
      key: 'consent',
      icon: <UntitledIcon name="fileText" size={24} style={{ color: 'var(--color-success-600)' }} />,
      title: 'Consent Form Management',
      description: userData.profile?.consentPolicyRead
        ? 'Mark consent form as pending for resubmission'
        : 'Mark consent form as accepted',
      buttonText: 'Manage Consent',
      buttonType: 'dashed',
      action: handleConsentManagement,
      requiredRole: [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN],
    },
    {
      key: 'delete',
      icon: <UntitledIcon name="delete" size={24} style={{ color: 'var(--color-error-600)' }} />,
      title: 'Delete User Account',
      description: 'Permanently delete this user and all associated data (cannot be undone)',
      buttonText: 'Delete User',
      buttonType: 'danger',
      action: handleDeleteUser,
      requiredRole: [USER_ROLES.SUPER_ADMIN],
    },
  ];

  const filteredActions = actions.filter(action => {
    if (!action.requiredRole) return true;
    const userRole = currentUser?.profile?.role;
    if (!userRole) return false;
    return action.requiredRole.includes(userRole);
  });

  return (
    <div className="command-palette">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {filteredActions.map(action => (
          <Card key={action.key} className="action-card">
            <Flex gap={16} align="start">
              <div className="action-icon">{action.icon}</div>
              <Flex vertical flex={1} gap={8}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {action.title}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {action.description}
                </Typography.Text>
              </Flex>
              <Button
                type={action.buttonType as 'primary' | 'default' | 'dashed' | undefined}
                danger={action.buttonType === 'danger'}
                onClick={action.action}
                loading={loading === action.key}
                disabled={action.disabled}
                aria-label={`${action.buttonText} for ${userData.profile?.firstName} ${userData.profile?.lastName}`}
              >
                {action.buttonText}
              </Button>
            </Flex>
          </Card>
        ))}
      </Space>
    </div>
  );
};
