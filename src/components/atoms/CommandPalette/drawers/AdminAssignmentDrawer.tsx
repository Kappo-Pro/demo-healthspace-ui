/**
 * AdminAssignmentDrawer Component
 * Story 5.1: Admin assignment management drawer
 *
 * Allows super admins to assign/unassign admins to users from the command palette.
 * Features optimistic UI updates, search with debouncing, and batch save operations.
 */

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Input,
  Button,
  Switch,
  Avatar,
  List,
  Typography,
  Tag,
  message} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { useTypedSelector, useTypedDispatch } from '@stores/index';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import {
  updateUserAdminAssignments,
  type Admin} from '@stores/shared/adminManagement';

const { Text } = Typography;

/**
 * Props for AdminAssignmentDrawer component
 */
export interface AdminAssignmentDrawerProps {
  /** ID of user whose admin assignments are being managed */
  userId: string;
  /** Callback to close drawer */
  onClose: () => void;
  /** Initial assigned admin IDs (optional, fetched from store if not provided) */
  initialAssignedAdmins?: string[];
}

/**
 * Admin data enriched with assignment status
 */
interface AdminWithStatus extends Admin {
  isAssigned: boolean;
}

/**
 * AdminAssignmentDrawer - Drawer for managing admin assignments
 *
 * Displays a searchable list of admins with toggle switches for assignment.
 * Changes are tracked locally and persisted on save via batch API call.
 *
 * @example
 * ```typescript
 * <AdminAssignmentDrawer
 *   userId="user-123"
 *   onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}
 * />
 * ```
 */
export const AdminAssignmentDrawer: React.FC<AdminAssignmentDrawerProps> = ({
  userId,
  onClose,
  initialAssignedAdmins = [],
}) => {
  const { t } = useTranslation();
  const dispatch = useTypedDispatch();

  // Fetch admins from Redux
  const admins = useTypedSelector((state) => state.adminManagement.admins);
  const loading = useTypedSelector((state) => state.adminManagement.loading);

  // Local state for search and assignments
  const [searchQuery, setSearchQuery] = useState('');
  const [assignments, setAssignments] = useState<Map<string, boolean>>(
    new Map(
      admins.map((admin) => [
        admin.id,
        initialAssignedAdmins.includes(admin.id),
      ])
    )
  );
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search (300ms delay)
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  // Filter admins by search query
  const filteredAdmins = useMemo(() => {
    if (!debouncedQuery) return admins;

    const query = debouncedQuery.toLowerCase();
    return admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query)
    );
  }, [admins, debouncedQuery]);

  // Map admins to status (assigned/unassigned)
  const adminsWithStatus: AdminWithStatus[] = useMemo(() => {
    return filteredAdmins.map((admin) => ({
      ...admin,
      isAssigned: assignments.get(admin.id) ?? false,
    }));
  }, [filteredAdmins, assignments]);

  /**
   * Handle toggle switch change (optimistic UI update)
   */
  const handleToggle = (adminId: string, checked: boolean) => {
    setAssignments((prev) => new Map(prev).set(adminId, checked));
  };

  /**
   * Handle save - persist assignments to backend
   */
  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Get assigned admin IDs from local state
      const assignedAdminIds = Array.from(assignments.entries())
        .filter(([_adminId, isAssigned]) => isAssigned)
        .map(([id]) => id);

      // Call API via async thunk
      await dispatch(
        updateUserAdminAssignments({ userId, adminIds: assignedAdminIds })
      ).unwrap();

      message.success(t('common.commandPalette.drawer.admins.success'));
      onClose();
    } catch (error) {
      message.error(t('common.commandPalette.drawer.admins.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      title={t('common.commandPalette.drawer.admins.title')}
      placement="right"
      width={480}
      onClose={onClose}
      open={true}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            {t('common.commandPalette.drawer.admins.cancel')}
          </Button>
          <Button type="primary" onClick={handleSave} loading={isSaving}>
            {t('common.commandPalette.drawer.admins.saveChanges')}
          </Button>
        </div>
      }
    >
      {/* Search Input */}
      <Input
        placeholder={t('common.commandPalette.drawer.admins.searchPlaceholder')}
        prefix={<UntitledIcon name="search" />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: 16 }}
        aria-label={t('common.commandPalette.drawer.admins.searchLabel')}
      />

      {/* Admin List */}
      <List
        loading={loading}
        dataSource={adminsWithStatus}
        renderItem={(admin) => (
          <List.Item
            actions={[
              <Switch
                key={`switch-${admin.id}`}
                checked={admin.isAssigned}
                onChange={(checked) => handleToggle(admin.id, checked)}
                disabled={isSaving}
                aria-label={t('common.commandPalette.drawer.admins.toggleAssignment', { name: admin.name })}
              />,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar src={admin.avatar}>
                  {admin.name.substring(0, 2).toUpperCase()}
                </Avatar>
              }
              title={<Text strong>{admin.name}</Text>}
              description={
                <>
                  <Text type="secondary">{admin.email}</Text>
                  <br />
                  <Tag color={admin.isAssigned ? 'var(--color-success)' : 'default'}>
                    {admin.isAssigned
                      ? t('common.commandPalette.drawer.admins.assigned')
                      : t('common.commandPalette.drawer.admins.unassigned')}
                  </Tag>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};
