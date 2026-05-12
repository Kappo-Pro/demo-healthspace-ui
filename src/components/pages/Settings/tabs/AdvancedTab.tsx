/**
 * AdvancedTab Component
 *
 * Epic 2 - Story 2.5: Create AdvancedTab for Super Admin Settings
 *
 * Features:
 * - Role-based access control (Super Admin only)
 * - Bandwidth optimization settings (enable/disable + size limits)
 * - Tags management (CRUD operations)
 * - Manual save pattern with confirmation modal for critical changes
 * - Unsaved changes detection with navigation blocking
 * - Backend authorization check (403 handling)
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Input,
  Switch,
  Button,
  message,
  Flex,
  Tag,
  Modal,
  Form,
  InputNumber,
  ColorPicker,
  Result,
  Tooltip,
  Spin} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { SettingCard } from '@molecules/SettingCard';
import { useTypedSelector, useTypedDispatch } from '@stores/index';
import { selectAdvancedTabData } from '@stores/settings/selectors';
import { updateAdvancedSettings, setTabDirty, toggleBandwidth } from '@stores/settings/settingsSlice';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import { USER_ROLES } from '@stores/constants';
import type { TagsDetails } from '@types';
import type { Color } from 'antd/es/color-picker';

/**
 * Form state interface for Advanced tab
 */
interface AdvancedFormState {
  bandwidth: {
    enabled: boolean;
    maxUploadSizeMB?: number;
    maxProcessingSizeMB?: number;
  };
  tags: TagsDetails[];
}

/**
 * Tag form values for add/edit modal
 */
interface TagFormValues {
  name: string;
  color: string;
  description?: string;
}

/**
 * AdvancedTab component for Super Admin settings
 *
 * Manages sensitive infrastructure settings that regular admins should not access:
 * - Bandwidth optimization (upload/processing limits)
 * - User tags (organization/categorization)
 */
export const AdvancedTab: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useTypedDispatch();

  // Get user role for access control
  const userRole = useTypedSelector((state) => state.user?.profile?.role);

  // Get data from Redux (server state)
  const { bandwidth, tags, loadingBandwidth, errorBandwidth } =
    useTypedSelector(selectAdvancedTabData);

  // Local form state (Story 3.1: Bandwidth now uses optimistic updates, not local state)
  const [formValues, setFormValues] = useState<AdvancedFormState>({
    bandwidth: {
      enabled: bandwidth.mode === 'high',
      maxUploadSizeMB: 100, // Default values (not stored in current state structure)
      maxProcessingSizeMB: 500,
    },
    tags: tags || [],
  });

  // Track previous error state for toast notifications (Story 3.1)
  const [prevBandwidthError, setPrevBandwidthError] = React.useState<string | null>(null);

  // Tag modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [tagForm] = Form.useForm<TagFormValues>();

  // Sync form state when server data changes
  useEffect(() => {
    setFormValues({
      bandwidth: {
        enabled: bandwidth.mode === 'high',
        maxUploadSizeMB: formValues.bandwidth.maxUploadSizeMB || 100,
        maxProcessingSizeMB: formValues.bandwidth.maxProcessingSizeMB || 500,
      },
      tags: tags || [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bandwidth.mode, tags]);

  // Dirty tracking: Compare form state to server state
  // Story 3.1: Bandwidth auto-saves now, so only check tags for dirty state
  const isDirty = useMemo(() => {
    const tagsChanged = JSON.stringify(formValues.tags) !== JSON.stringify(tags);
    return tagsChanged;
  }, [formValues.tags, tags]);

  // Navigation blocker: Warn user when leaving with unsaved changes
  useUnsavedChanges({
    hasChanges: isDirty,
    message:
      t('Admin.settings.advancedTab.unsavedChanges'),
  });

  // Sync dirty state to Redux for badge display (Story 2.6)
  React.useEffect(() => {
    dispatch(setTabDirty({ tab: 'advanced', isDirty }));
  }, [isDirty, dispatch]);

  // Story 3.1: Show success toast after bandwidth toggle succeeds (AC: 3)
  const lastSaved = useTypedSelector((state) => state.settings.lastSaved.bandwidth);
  const [prevLastSaved, setPrevLastSaved] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (lastSaved !== null && lastSaved !== prevLastSaved && prevLastSaved !== null) {
      // Bandwidth was just saved successfully
      message.success(t('Admin.settings.advancedTab.bandwidthUpdateSuccess'));
    }
    setPrevLastSaved(lastSaved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSaved]);

  // Story 3.1: Show error toast with retry button on bandwidth failure (AC: 5, 7)
  React.useEffect(() => {
    if (errorBandwidth && errorBandwidth !== prevBandwidthError) {
      // New error occurred
      message.error({
        content: `Failed to update bandwidth: ${errorBandwidth}`,
        duration: 5,
        onClick: () => {
          // Retry on toast click
          dispatch(toggleBandwidth());
        },
        btn: (
          <Button
            size="small"
            type="primary"
            onClick={() => {
              message.destroy();
              dispatch(toggleBandwidth());
            }}
          >
            Retry
          </Button>
        ),
      });
      setPrevBandwidthError(errorBandwidth);
    } else if (!errorBandwidth && prevBandwidthError) {
      // Error cleared
      setPrevBandwidthError(null);
    }
  }, [errorBandwidth, prevBandwidthError, dispatch]);

  /**
   * Handle save button click
   * Story 3.1: Only saves tags now (bandwidth auto-saves via toggleBandwidth)
   * Shows confirmation modal before saving critical infrastructure changes
   */
  const handleSave = () => {
    Modal.confirm({
      title: 'Confirm Changes',
      content:
        'These tag changes affect user organization. Continue?',
      okText: 'Save Changes',
      okType: 'danger',
      onOk: async () => {
        try {
          await dispatch(
            updateAdvancedSettings({
              tags: formValues.tags,
            })
          ).unwrap();

          // Show success toast
          message.success(t('Admin.settings.advancedTab.tagsSuccess'));
        } catch (err) {
          // Show error toast
          const errorMessage =
            err instanceof Error
              ? err.message
              : t('Admin.settings.advancedTab.tagsError');
          message.error(errorMessage);

          // Log security event if 403 (unauthorized)
          if (
            typeof err === 'string' &&
            err.includes('Unauthorized')
          ) {
            // TODO: Implement security audit logging for unauthorized access attempts
            console.warn('[AdvancedTab] Unauthorized access attempt detected');
          }
        }
      },
    });
  };

  /**
   * Handle tag add/edit modal submission
   */
  const handleTagModalOk = async () => {
    try {
      const values = await tagForm.validateFields();

      if (editingTagId) {
        // Edit existing tag
        setFormValues((prev) => ({
          ...prev,
          tags: prev.tags.map((tag) =>
            tag.id === editingTagId
              ? {
                  ...tag,
                  name: values.name,
                  color: values.color,
                  description: values.description,
                }
              : tag
          ),
        }));
      } else {
        // Add new tag
        const newTag: TagsDetails = {
          id: `tag-${Date.now()}`, // Temporary ID (backend will assign real ID)
          name: values.name,
          color: values.color,
          description: values.description,
          createdAt: new Date(),
        };

        setFormValues((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }

      // Close modal and reset form
      setIsTagModalOpen(false);
      setEditingTagId(null);
      tagForm.resetFields();
    } catch (error) {
      // Form validation failed
      console.error('[AdvancedTab] Tag form validation failed:', error);
    }
  };

  /**
   * Handle tag edit button click
   */
  const handleEditTag = (tag: TagsDetails) => {
    setEditingTagId(tag.id);
    tagForm.setFieldsValue({
      name: tag.name,
      color: tag.color,
      description: tag.description,
    });
    setIsTagModalOpen(true);
  };

  /**
   * Handle tag delete button click
   */
  const handleDeleteTag = (tagId: string) => {
    Modal.confirm({
      title: 'Delete Tag',
      content: 'Are you sure you want to delete this tag?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setFormValues((prev) => ({
          ...prev,
          tags: prev.tags.filter((tag) => tag.id !== tagId),
        }));
      },
    });
  };

  /**
   * Handle bandwidth toggle change
   * Story 3.1: Dispatch toggleBandwidth thunk for optimistic update (AC: 2)
   */
  const handleBandwidthToggle = () => {
    dispatch(toggleBandwidth());
  };

  /**
   * Validation: maxUploadSizeMB < maxProcessingSizeMB
   */
  const isBandwidthValid = useMemo(() => {
    if (!formValues.bandwidth.enabled) return true;
    if (
      !formValues.bandwidth.maxUploadSizeMB ||
      !formValues.bandwidth.maxProcessingSizeMB
    )
      return true;

    return (
      formValues.bandwidth.maxUploadSizeMB <
      formValues.bandwidth.maxProcessingSizeMB
    );
  }, [formValues.bandwidth]);

  const bandwidthValidationError = !isBandwidthValid
    ? t('Admin.settings.advancedTab.bandwidth.validationError')
    : null;

  const isLoading = loadingBandwidth;
  const displayError = errorBandwidth || bandwidthValidationError || null;

  // Role-based access control: Only Super Admin can access this tab
  if (userRole !== USER_ROLES.SUPER_ADMIN) {
    return (
      <Result
        status="403"
        title={t('Admin.settings.advancedTab.unauthorized.title')}
        subTitle={t('Admin.settings.advancedTab.unauthorized.subtitle')}
      />
    );
  }

  return (
    <div>
      {/* Bandwidth Settings */}
      <SettingCard
        label={t('Admin.settings.advancedTab.bandwidth.label')}
        description={t('Admin.settings.advancedTab.bandwidth.description')}
        badge={t('Admin.settings.advancedTab.bandwidth.badge')}
        loading={isLoading}
        error={displayError}
      >
        <Flex vertical gap={16}>
          {/* Enable/Disable Toggle - Story 3.1: Optimistic Update (AC: 2, 6) */}
          <Flex align="center" gap={8}>
            <Switch
              checked={bandwidth.mode === 'high'}
              onChange={handleBandwidthToggle}
              disabled={isLoading}
            />
            {loadingBandwidth && <Spin size="small" />}
            <span>
              {bandwidth.mode === 'high'
                ? t('Admin.settings.advancedTab.bandwidth.enabled')
                : t('Admin.settings.advancedTab.bandwidth.disabled')}
            </span>
          </Flex>

          {/* Conditional inputs (only shown when enabled) */}
          {bandwidth.mode === 'high' && (
            <>
              <Flex vertical gap={8}>
                <label htmlFor="max-upload-input">
                  Max upload size (MB):
                </label>
                <InputNumber
                  id="max-upload-input"
                  min={1}
                  max={1000}
                  value={formValues.bandwidth.maxUploadSizeMB}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      bandwidth: {
                        ...prev.bandwidth,
                        maxUploadSizeMB: value || undefined,
                      },
                    }))
                  }
                  disabled={isLoading}
                  style={{ width: 200 }}
                  status={!isBandwidthValid ? 'error' : undefined}
                />
              </Flex>

              <Flex vertical gap={8}>
                <label htmlFor="max-processing-input">
                  Max processing size (MB):
                </label>
                <InputNumber
                  id="max-processing-input"
                  min={1}
                  max={2000}
                  value={formValues.bandwidth.maxProcessingSizeMB}
                  onChange={(value) =>
                    setFormValues((prev) => ({
                      ...prev,
                      bandwidth: {
                        ...prev.bandwidth,
                        maxProcessingSizeMB: value || undefined,
                      },
                    }))
                  }
                  disabled={isLoading}
                  style={{ width: 200 }}
                  status={!isBandwidthValid ? 'error' : undefined}
                />
              </Flex>
            </>
          )}
        </Flex>
      </SettingCard>

      {/* Tags Management */}
      <SettingCard
        label={t('Admin.settings.advancedTab.tags.label')}
        description={t('Admin.settings.advancedTab.tags.description')}
        badge={t('Admin.settings.advancedTab.bandwidth.badge')}
        loading={isLoading}
        error={displayError}
      >
        <Flex vertical gap={16}>
          {/* Existing tags */}
          <Flex wrap="wrap" gap={8}>
            {formValues.tags.map((tag) => (
              <Tag
                key={tag.id}
                color={tag.color}
                style={{
                  padding: 'var(--spacing-1) var(--spacing-2)',
                  fontSize: 'var(--font-size-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{tag.name}</span>
                <Tooltip title={t('Admin.settings.advancedTab.tags.editTooltip')}>
                  <UntitledIcon
                    name="edit"
                    onClick={() => handleEditTag(tag)}
                    style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                  />
                </Tooltip>
                <Tooltip title={t('Admin.settings.advancedTab.tags.deleteTooltip')}>
                  <UntitledIcon
                    name="trash"
                    onClick={() => handleDeleteTag(tag.id)}
                    style={{ cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
                  />
                </Tooltip>
              </Tag>
            ))}
          </Flex>

          {/* Add Tag Button */}
          <Button
            type="dashed"
            icon={<UntitledIcon name="plus" />}
            onClick={() => {
              setEditingTagId(null);
              tagForm.resetFields();
              setIsTagModalOpen(true);
            }}
            disabled={isLoading}
            style={{ width: 'fit-content' }}
          >
            Add Tag
          </Button>
        </Flex>
      </SettingCard>

      {/* Tag Add/Edit Modal */}
      <Modal
        title={editingTagId ? t('Admin.settings.advancedTab.tags.modal.editTitle') : t('Admin.settings.advancedTab.tags.modal.createTitle')}
        open={isTagModalOpen}
        onOk={handleTagModalOk}
        onCancel={() => {
          setIsTagModalOpen(false);
          setEditingTagId(null);
          tagForm.resetFields();
        }}
        okText={editingTagId ? t('Admin.settings.advancedTab.tags.modal.updateButton') : t('Admin.settings.advancedTab.tags.modal.createButton')}
      >
        <Form form={tagForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label={t('Admin.settings.advancedTab.tags.modal.nameLabel')}
            rules={[{ required: true, message: t('Admin.settings.advancedTab.tags.modal.nameRequired') }]}
          >
            <Input placeholder={t('Admin.settings.advancedTab.tags.modal.namePlaceholder')} />
          </Form.Item>

          <Form.Item
            name="color"
            label={t('Admin.settings.advancedTab.tags.modal.colorLabel')}
            rules={[{ required: true, message: t('Admin.settings.advancedTab.tags.modal.colorRequired') }]}
            getValueFromEvent={(color: Color) => {
              return color.toHexString();
            }}
          >
            <ColorPicker showText format="hex" />
          </Form.Item>

          <Form.Item name="description" label={t('Admin.settings.advancedTab.tags.modal.descriptionLabel')}>
            <Input.TextArea
              placeholder={t('Admin.settings.advancedTab.tags.modal.descriptionPlaceholder')}
              rows={3}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Save Button */}
      <Flex justify="flex-end" style={{ marginTop: 24 }}>
        <Button
          type="primary"
          size="large"
          onClick={handleSave}
          disabled={!isDirty || !isBandwidthValid}
          loading={isLoading}
        >
          Save Changes
        </Button>
      </Flex>
    </div>
  );
};

export default AdvancedTab;
