/**
 * ConsentFormDrawer Component
 * Story 5.3: Consent form management drawer
 *
 * Allows admins to manage user consent forms from the command palette.
 * Features: upload (PDF/image, max 10MB), view documents, download, delete with confirmation.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  List,
  Button,
  Upload,
  message,
  Badge,
  Skeleton,
  Empty,
  Modal,
  Progress} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import { useTypedSelector, useTypedDispatch } from '@stores/index';
import {
  fetchConsentForms,
  uploadConsentForm,
  deleteConsentForm,
  setUploadProgress,
  type IConsentForm} from '@stores/shared/consentForms';
import type { UploadFile } from 'antd/es/upload/interface';

/**
 * Props for ConsentFormDrawer component
 */
export interface ConsentFormDrawerProps {
  /** ID of user whose consent forms are being managed */
  userId: string;
  /** Callback to close drawer */
  onClose: () => void;
}

/**
 * Get status badge configuration
 */
const getStatusBadge = (status: IConsentForm['status'], t: (key: string) => string) => {
  const config = {
    pending: { status: 'warning' as const, text: t('common.commandPalette.drawer.consentForms.status.pending') },
    approved: { status: 'success' as const, text: t('common.commandPalette.drawer.consentForms.status.approved') },
    rejected: { status: 'error' as const, text: t('common.commandPalette.drawer.consentForms.status.rejected') },
  };
  return config[status] || config.pending;
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number, t: (key: string) => string): string => {
  if (bytes === 0) return `0 ${t('common.commandPalette.fileSizes.bytes')}`;
  const k = 1024;
  const sizes = [
    t('common.commandPalette.fileSizes.bytes'),
    t('common.commandPalette.fileSizes.kb'),
    t('common.commandPalette.fileSizes.mb')
  ];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
};

/**
 * Get file icon based on file type
 */
const getFileIcon = (fileType: string) => {
  return fileType === 'application/pdf' || fileType === 'pdf' ? (
    <UntitledIcon name="filePdf" style={{ fontSize: 24, color: 'var(--color-error)' }} />
  ) : (
    <UntitledIcon name="camera" style={{ fontSize: 24, color: 'var(--color-primary)' }} />
  );
};

/**
 * ConsentFormDrawer - Drawer for managing consent forms
 *
 * Displays list of existing consent forms with upload/view/download/delete functionality.
 * Enforces 10MB file size limit and PDF/image file types only.
 *
 * @example
 * ```typescript
 * <ConsentFormDrawer
 *   userId="user-123"
 *   onClose={() => dispatch({ type: 'CLOSE_DRAWER' })}
 * />
 * ```
 */
export const ConsentFormDrawer: React.FC<ConsentFormDrawerProps> = ({
  userId,
  onClose,
}) => {
  const { t } = useTranslation();
  const dispatch = useTypedDispatch();

  // Redux state
  const { forms, loading, uploadProgress } = useTypedSelector(
    (state) => state.consentForms
  );

  // Local state
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const _fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch consent forms on mount
  useEffect(() => {
    dispatch(fetchConsentForms(userId));
  }, [dispatch, userId]);

  /**
   * Handle file upload
   * AC 3: Upload PDF or image (max 10MB)
   */
  const handleUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.type)) {
      message.error(t('common.commandPalette.drawer.consentForms.validation.onlyPdfImages'));
      return false;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error(t('common.commandPalette.drawer.consentForms.validation.maxSize'));
      return false;
    }

    setIsUploading(true);

    try {
      await dispatch(
        uploadConsentForm({
          userId,
          file,
          onUploadProgress: (progress) => {
            dispatch(setUploadProgress(progress));
          },
        })
      ).unwrap();

      message.success(t('common.commandPalette.drawer.consentForms.messages.uploadSuccess'));
      setFileList([]);
    } catch (error) {
      message.error(t('common.commandPalette.drawer.consentForms.messages.uploadError'));
    } finally {
      setIsUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  /**
   * Handle view document
   * AC 4: View document in new tab
   */
  const handleView = (form: IConsentForm) => {
    window.open(form.fileUrl, '_blank');
  };

  /**
   * Handle download document
   * AC 5: Download document
   */
  const handleDownload = (form: IConsentForm) => {
    const link = document.createElement('a');
    link.href = form.fileUrl;
    link.download = form.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(t('common.commandPalette.drawer.consentForms.messages.downloadStarted'));
  };

  /**
   * Handle delete document
   * AC 7: Delete with confirmation modal
   */
  const handleDelete = (form: IConsentForm) => {
    Modal.confirm({
      title: t('common.commandPalette.drawer.consentForms.deleteConfirm.title'),
      icon: <UntitledIcon name="exclamationCircle" />,
      content: t('common.commandPalette.drawer.consentForms.deleteConfirm.content', { fileName: form.fileName }),
      okText: t('common.commandPalette.drawer.consentForms.deleteConfirm.okText'),
      okType: 'danger',
      cancelText: t('common.commandPalette.drawer.consentForms.deleteConfirm.cancelText'),
      async onOk() {
        try {
          await dispatch(deleteConsentForm({ userId, formId: form.id })).unwrap();
          message.success(t('common.commandPalette.drawer.consentForms.messages.deleteSuccess'));
        } catch (error) {
          message.error(t('common.commandPalette.drawer.consentForms.messages.deleteError'));
        }
      },
    });
  };

  return (
    <Drawer
      title={t('common.commandPalette.drawer.consentForms.title')}
      placement="right"
      width={600}
      onClose={onClose}
      open={true}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>{t('common.commandPalette.drawer.consentForms.deleteConfirm.cancelText')}</Button>
        </div>
      }
    >
      {/* Upload Section */}
      <div style={{ marginBottom: 24 }}>
        <Upload
          fileList={fileList}
          beforeUpload={handleUpload}
          onChange={({ fileList: newFileList }) => setFileList(newFileList)}
          accept=".pdf,.jpg,.jpeg,.png"
          maxCount={1}
          disabled={isUploading}
        >
          <Button
            icon={<UntitledIcon name="upload" />}
            loading={isUploading}
            disabled={isUploading}
            block
          >
            {t('common.commandPalette.drawer.consentForms.upload')}
          </Button>
        </Upload>

        {/* Upload Progress */}
        {isUploading && uploadProgress > 0 && (
          <Progress
            percent={uploadProgress}
            status="active"
            style={{ marginTop: 16 }}
          />
        )}
      </div>

      {/* Consent Forms List */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : forms.length === 0 ? (
        <Empty description={t('common.commandPalette.empty.noConsentForms')} />
      ) : (
        <List
          dataSource={forms}
          renderItem={(form) => {
            const statusBadge = getStatusBadge(form.status, t);
            return (
              <List.Item
                key={form.id}
                actions={[
                  <Button
                    type="text"
                    icon={<UntitledIcon name="eye" />}
                    onClick={() => handleView(form)}
                    title={t('common.commandPalette.drawer.consentForms.actions.view')}
                  />,
                  <Button
                    type="text"
                    icon={<UntitledIcon name="download" />}
                    onClick={() => handleDownload(form)}
                    title={t('common.commandPalette.drawer.consentForms.actions.download')}
                  />,
                  <Button
                    type="text"
                    danger
                    icon={<UntitledIcon name="delete" />}
                    onClick={() => handleDelete(form)}
                    title={t('common.commandPalette.drawer.consentForms.actions.delete')}
                    disabled={loading}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={getFileIcon(form.fileType)}
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{form.fileName}</span>
                      <Badge status={statusBadge.status} text={statusBadge.text} />
                    </div>
                  }
                  description={
                    <div>
                      <div>{formatFileSize(form.fileSize, t)}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-gray-500)' }}>
                        {t('common.commandPalette.drawer.consentForms.uploaded')} {new Date(form.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Drawer>
  );
};
