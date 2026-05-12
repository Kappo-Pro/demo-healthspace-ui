import { UntitledIcon } from '@atoms/Icon';
import { SettingCard } from '@molecules/SettingCard';
import { useGetTagsQuery } from '@stores/shared/settings/settingsApi';
import type { TimeRangePickerProps } from 'antd';
import { Button, DatePicker, Select, message } from 'antd';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const ExportReportsTab: React.FC = () => {
	const { t } = useTranslation();

	const [isLoading, setIsLoading] = useState(false);

	const [selectedDates, setSelectedDates] = useState<
		[Dayjs | null, Dayjs | null] | null
	>(null);

	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const { data: tagsData, isLoading: isTagsLoading } = useGetTagsQuery();

	// Range presets - memoized to prevent re-renders
	const rangePresets: TimeRangePickerProps['presets'] = useMemo(
		() => [
			{ label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
			{ label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
			{ label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
			{ label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
		],
		[],
	);

	// Date range change handler
	const onRangeChange = (
		dates: null | (Dayjs | null)[],
		dateStrings: string[],
	) => {
		if (dates) {
			setSelectedDates([dates[0], dates[1]]);
		} else {
			setSelectedDates(null);
		}
	};

	const handleTagChange = (value: string[]) => setSelectedTags(value);

	const handleExport = async () => {
  const start = selectedDates?.[0]
    ? selectedDates[0].startOf('day').format('YYYY-MM-DD')
    : null;

  const end = selectedDates?.[1]
    ? selectedDates[1].endOf('day').format('YYYY-MM-DD')
    : null;

  const payload = {
    startDate: start,
    endDate: end,
    tags: selectedTags.length ? selectedTags : [],
  };

  try {
    setIsLoading(true);

    const tagsParam = encodeURIComponent(JSON.stringify(payload.tags));

    const response = await axios.get(
      `/reports/aggregate/excel?startDate=${payload.startDate}&endDate=${payload.endDate}&tags=${tagsParam}`,
      { responseType: 'blob' },
    );

    const blob = response.data;

    // 👉 Read Excel
    const arrayBuffer = await blob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
    });

    // Remove empty rows
    const nonEmptyRows = data.filter(row =>
      row.some(cell => String(cell).trim() !== ''),
    );

    // 👉 If only header or nothing
    if (nonEmptyRows.length <= 1) {
      message.info(
        'No users in the system are associated with the selected tag(s).',
      );
      return;
    }

    // ===== Normal Download =====

    let fileName = `Export ${payload.startDate} - ${payload.endDate}.xlsx`;

    const disposition = response.headers['content-disposition'];
    if (disposition?.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match?.[1]) fileName = match[1];
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    message.success(
      t('Admin.settings.exportReportsTab.exportSuccess') ||
        'Report exported successfully',
    );
  } catch (err) {
    console.error(err);

    message.warning(
      t('Admin.data.addToReports.dateLimitWarning') ||
        'Failed to export report',
    );
  } finally {
    setIsLoading(false);
  }
};


	return (
		<div>
			{/* DATE RANGE PICKER */}
			<SettingCard
				label={t('Admin.settings.exportReportsTab.dateRange.label')}
				description={t(
					'Admin.settings.exportReportsTab.dateRange.description',
				)}>
				<RangePicker
					presets={rangePresets}
					value={selectedDates as [Dayjs, Dayjs] | undefined}
					onChange={onRangeChange}
					style={{ width: 400, height: 40 }}
					disabledDate={current => current && current.isAfter(dayjs(), 'day')}
					format="MMMM D, YYYY"
				/>
			</SettingCard>

			{/* TAG SELECT */}
			<SettingCard
				label={t('Admin.data.theme.selectTag')}
				description={t('Admin.settings.exportReportsTab.tags.description')}>
				<Select
					mode="multiple"
					style={{ width: 400 }}
					value={selectedTags}
					className="theme-select-dropdown"
					onChange={handleTagChange}
					allowClear
					loading={isTagsLoading}
					placeholder={t('Admin.settings.exportReportsTab.tags.placeholder')}>
					{tagsData?.map(tag => (
						<Option key={tag.id} value={tag.id}>
							{tag.name}
						</Option>
					))}
				</Select>
			</SettingCard>

			{/* EXPORT BUTTON */}
			<div
				style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
				<Button
					type="primary"
					size="large"
					onClick={handleExport}
					disabled={isLoading}
					loading={isLoading}
					icon={
						!isLoading && (
							<UntitledIcon name="upload" size="small" aria-hidden="true" />
						)
					}>
					{isLoading
						? t('Admin.data.addToReports.downloading')
						: t('Admin.data.addToReports.export')}
				</Button>
			</div>
		</div>
	);
};

export default ExportReportsTab;
