import React from 'react';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { TimeRangePickerProps } from 'antd';
import { RangePicker } from '@atoms/DatePicker';

export interface ReportDateRangePickerProps {
  value: [Dayjs | null, Dayjs | null] | null;
  onChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  presets?: TimeRangePickerProps['presets'];
  placement?: 'bottomLeft' | 'bottomRight';
  style?: React.CSSProperties;
  className?: string;
  disableFutureDates?: boolean;
  format?: string;
}

export const ReportDateRangePicker: React.FC<ReportDateRangePickerProps> = ({
  value,
  onChange,
  presets,
  placement = 'bottomRight',
  style,
  className,
  disableFutureDates = true,
  format,
}) => {
  const handleChange = (dates: null | (Dayjs | null)[]) => {
    onChange((dates as [Dayjs | null, Dayjs | null]) || null);
  };

  return (
    <RangePicker
      presets={presets}
      value={value}
      onChange={handleChange}
      style={{ height: 'var(--spacing-10)', ...style }}
      className={className}
      placement={placement}
      format={format}
      disabledDate={
        disableFutureDates
          ? (current: Dayjs) => current && current.isAfter(dayjs(), 'day')
          : undefined
      }
    />
  );
};

export default ReportDateRangePicker;
