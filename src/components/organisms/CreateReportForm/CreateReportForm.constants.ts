import dayjs from 'dayjs';
import { TimeRangePickerProps } from 'antd';

export const CREATE_REPORT_RANGE_PRESETS: TimeRangePickerProps['presets'] = [
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
];

export const EXPORT_REPORT_RANGE_PRESETS: TimeRangePickerProps['presets'] = [
  { label: 'Last 24 hours', value: [dayjs().add(-1, 'd'), dayjs()] },
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
];

export const DEFAULT_CREATE_REPORT_VALUES = {
  reportName: '',
  dateRange: null,
  selectedSections: [
    'evaluation',
    'romSummary',
    'romCaptures',
    'postureCaptures',
    'letsMoveSessions',
    'surveySessions',
  ] as string[],
};

export const DEFAULT_EXPORT_REPORT_VALUES = {
  dateRange: null,
  tags: [],
};
