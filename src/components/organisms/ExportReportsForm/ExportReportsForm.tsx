import React from 'react';
import { Button, Flex, Select, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import UploadExport from '@vitalflow-icons/general/uploadExport';
import ReportSectionHeader from '@molecules/ReportSectionHeader';
import ReportDateRangePicker from '@molecules/ReportDateRangePicker';
import { EXPORT_REPORT_RANGE_PRESETS } from '../CreateReportForm/CreateReportForm.constants';
import { useExportReportsForm } from './ExportReportsForm.hooks';
import type { ExportReportFormProps } from '../CreateReportForm/CreateReportForm.types';

const { Option } = Select;

export const ExportReportsForm: React.FC<ExportReportFormProps> = (props) => {
  const { t } = useTranslation();
  const { values, updateField, handleExport, isExporting, getSavedTags } =
    useExportReportsForm(props);

  return (
    <>
      <ReportSectionHeader title={`${t('Admin.data.addToReports.export')} Reports`} />

      <Flex align="center" className="mb-4">
        <ReportDateRangePicker
          value={values.dateRange}
          onChange={(dates) => updateField('dateRange', dates)}
          presets={EXPORT_REPORT_RANGE_PRESETS}
          placement="bottomLeft"
          style={{ flex: 1 }}
          format="MMMM D, YYYY"
        />
      </Flex>

      <Flex gap={12} align="center" className="mb-4" vertical>
        <Flex gap={12} align="center" style={{ width: '100%' }}>
          <span style={{ fontWeight: 'var(--font-weight-medium)', minWidth: 'var(--spacing-20)' }}>
            {t('Admin.data.theme.selectTag')}:
          </span>
          <Select
            placeholder={t('Admin.data.menu.userRoles.selectTags')}
            mode="multiple"
            style={{ flex: 1 }}
            value={values.tags}
            onChange={(tags) => updateField('tags', tags)}
            allowClear
            popupMatchSelectWidth={false}
          >
            {getSavedTags?.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        </Flex>
      </Flex>

      <Button
        onClick={handleExport}
        disabled={isExporting}
        block
        style={{
          backgroundColor: isExporting
            ? 'var(--button-primary-bg-disabled)'
            : 'var(--settings-button-bg-color)',
          color: isExporting ? 'var(--button-primary-text-disabled)' : 'var(--settings-button-text-color)',
          border: 'none',
        }}
      >
        <Flex gap={8} align="center" justify="center">
          {isExporting ? (
            <>
              <Spin size="small" />
              {t('Admin.data.addToReports.downloading')}
            </>
          ) : (
            <>
              <UploadExport />
              {t('Admin.data.addToReports.export')}
            </>
          )}
        </Flex>
      </Button>
    </>
  );
};

export default ExportReportsForm;
