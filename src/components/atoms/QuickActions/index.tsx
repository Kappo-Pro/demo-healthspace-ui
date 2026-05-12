/**
 * QuickActions Component
 *
 * Floating Action Button (FAB) with context-aware quick actions.
 * Provides one-click access to common workflows and recent actions.
 */

import React, { useState, useMemo } from 'react';
import { FloatButton } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  handler: () => void;
  /** Action is context-specific */
  context?: string[];
  /** Role-based visibility */
  roles?: string[];
}

interface QuickActionsProps {
  /** User's current role */
  userRole?: 'admin' | 'super-admin' | 'user' | 'patient';
  /** Custom actions */
  customActions?: QuickAction[];
  /** Recent actions limit */
  recentLimit?: number;
}

/**
 * Get admin quick actions
 */
function getAdminActions(navigate: ReturnType<typeof useNavigate>): QuickAction[] {
  return [
    {
      id: 'new-patient',
      label: 'New Patient',
      icon: <UntitledIcon name="user" size={16} />,
      handler: () => navigate('/patients'),
      roles: ['admin', 'super-admin'],
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: <UntitledIcon name="fileText" size={16} />,
      handler: () => navigate('/analytics/reports/create'),
      roles: ['admin', 'super-admin'],
    },
    {
      id: 'start-assessment',
      label: 'Start Assessment',
      icon: <UntitledIcon name="lightning" size={16} />,
      handler: () => navigate('/tools/assessment'),
      roles: ['admin', 'super-admin'],
    },
    {
      id: 'create-survey',
      label: 'Create Survey',
      icon: <UntitledIcon name="edit" size={16} />,
      handler: () => navigate('/tools/surveys/create'),
      roles: ['admin', 'super-admin'],
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: <UntitledIcon name="download" size={16} />,
      handler: () => navigate('/analytics/export'),
      roles: ['admin', 'super-admin'],
    },
  ];
}

/**
 * Get patient/user quick actions
 */
function getPatientActions(navigate: ReturnType<typeof useNavigate>): QuickAction[] {
  return [
    {
      id: 'start-rom',
      label: 'Start ROM Scan',
      icon: <UntitledIcon name="lightning" size={16} />,
      handler: () => navigate('/tools/rom/start-scan'),
      roles: ['user', 'patient'],
    },
    {
      id: 'my-programs',
      label: 'My Programs',
      icon: <UntitledIcon name="fileText" size={16} />,
      handler: () => navigate('/tools/programs'),
      roles: ['user', 'patient'],
    },
    {
      id: 'take-survey',
      label: 'Take Survey',
      icon: <UntitledIcon name="edit" size={16} />,
      handler: () => navigate('/tools/surveys/available'),
      roles: ['user', 'patient'],
    },
  ];
}

/**
 * QuickActions Component
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
  userRole = 'admin',
  customActions = [],
  recentLimit = 3,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [recentActions, setRecentActions] = useState<string[]>([]);

  // Get role-based actions
  const roleActions = useMemo(() => {
    const isAdmin = userRole === 'admin' || userRole === 'super-admin';
    const baseActions = isAdmin ? getAdminActions(navigate) : getPatientActions(navigate);

    return [...baseActions, ...customActions].filter(
      action => !action.roles || action.roles.includes(userRole)
    );
  }, [userRole, navigate, customActions]);

  // Get context-aware actions
  const contextActions = useMemo(() => {
    return roleActions.filter(action => {
      if (!action.context) return true;
      return action.context.some(ctx => location.pathname.startsWith(ctx));
    });
  }, [roleActions, location.pathname]);

  // Get recent actions
  const recentActionsItems = useMemo(() => {
    return recentActions
      .map(id => roleActions.find(action => action.id === id))
      .filter(Boolean)
      .slice(0, recentLimit) as QuickAction[];
  }, [recentActions, roleActions, recentLimit]);

  // Execute action
  const executeAction = (action: QuickAction) => {
    // Track as recent
    setRecentActions(prev => {
      const filtered = prev.filter(id => id !== action.id);
      return [action.id, ...filtered];
    });

    // Execute handler
    action.handler();
  };

  // Build menu items
  const menuItems = [
    // Context actions
    ...contextActions.map(action => ({
      key: action.id,
      icon: action.icon,
      label: action.label,
      onClick: () => executeAction(action),
    })),

    // Recent actions
    ...(recentActionsItems.length > 0
      ? [
          { type: 'divider' as const },
          {
            key: 'recent-header',
            label: (
              <div className={styles.menuHeader}>
                <UntitledIcon name="clock" size={14} /> Recent
              </div>
            ),
            disabled: true,
          },
          ...recentActionsItems.map(action => ({
            key: `recent-${action.id}`,
            icon: action.icon,
            label: action.label,
            onClick: () => executeAction(action),
          })),
        ]
      : []),
  ];

  return (
    <div className={styles.quickActions}>
      <FloatButton.Group
        trigger="click"
        type="primary"
        icon={<UntitledIcon name="plus" size={16} />}
        tooltip={t('common.quickActions')}
        className={styles.fabGroup}
      >
        {menuItems.map(item => {
          if (item.type === 'divider') {
            return null; // FloatButton.Group doesn't support dividers
          }

          if (item.disabled) {
            return null; // Skip headers
          }

          return (
            <FloatButton
              key={item.key}
              icon={item.icon}
              tooltip={item.label}
              onClick={item.onClick}
              className={styles.fabButton}
            />
          );
        })}
      </FloatButton.Group>

      {/* Settings FAB (separate) */}
      <FloatButton
        icon={<UntitledIcon name="settings" size={16} />}
        tooltip={t('common.settings')}
        onClick={() => navigate('/settings')}
        className={styles.settingsFab}
        style={{ right: 24, bottom: 100 }}
      />
    </div>
  );
};

export default QuickActions;
