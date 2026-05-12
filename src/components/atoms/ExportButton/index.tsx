/**
 * ExportButton
 *
 * Button with dropdown for exporting calendar to PDF or iCal
 *
 * Features:
 * - Format selection (PDF, iCal)
 * - Loading state during generation
 * - Success/error notifications
 * - Respects filters and options
 */

import React, { useState } from 'react';
import { Button, Dropdown, message, Space } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { MenuProps } from 'antd';
import { exportToPDF, exportToICal, filterActivitiesForExport, type ExportOptions } from '@utils/exportCalendar';
import type { ScheduledActivity } from '@services/mockSchedulingApi';
import './styles.css';

export interface ExportButtonProps {
  activities: ScheduledActivity[];
  options?: ExportOptions;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  block?: boolean;
}

export default function ExportButton({
  activities,
  options = {},
  disabled = false,
  size = 'middle',
  type = 'default',
  block = false,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'ical' | null>(null);

  const handleExport = async (format: 'pdf' | 'ical') => {
    if (activities.length === 0) {
      message.warning('No activities to export');
      return;
    }

    setLoading(true);
    setExportFormat(format);

    try {
      // Filter activities based on options
      const filteredActivities = filterActivitiesForExport(activities, options);

      if (filteredActivities.length === 0) {
        message.warning('No activities match the export criteria');
        setLoading(false);
        setExportFormat(null);
        return;
      }

      let result;
      if (format === 'pdf') {
        result = await exportToPDF(filteredActivities, options);
      } else {
        result = await exportToICal(filteredActivities, options);
      }

      if (result.success) {
        message.success(`Successfully exported ${filteredActivities.length} activities to ${format.toUpperCase()}`);
      } else {
        message.error(result.error || 'Export failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      message.error(errorMessage);
    } finally {
      setLoading(false);
      setExportFormat(null);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'pdf',
      icon: loading && exportFormat === 'pdf' ? <UntitledIcon name="loading" size={16} /> : <UntitledIcon name="filePdf" size={16} />,
      label: 'Export as PDF',
      disabled: loading,
      onClick: () => handleExport('pdf'),
    },
    {
      key: 'ical',
      icon: loading && exportFormat === 'ical' ? <UntitledIcon name="loading" size={16} /> : <UntitledIcon name="calendar" size={16} />,
      label: 'Export as iCal',
      disabled: loading,
      onClick: () => handleExport('ical'),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} disabled={disabled || loading}>
      <Button
        icon={loading ? <UntitledIcon name="loading" size={16} /> : <UntitledIcon name="download" size={16} />}
        disabled={disabled || loading}
        size={size}
        type={type}
        block={block}
        className="export-button"
      >
        <Space>
          Export
          {loading && exportFormat && (
            <span className="export-button__format">({exportFormat.toUpperCase()})</span>
          )}
        </Space>
      </Button>
    </Dropdown>
  );
}
