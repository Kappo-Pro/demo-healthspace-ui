import { useState, useCallback, useMemo } from 'react';
import { DatePicker, Button, Space, Dropdown } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { Calendar } from '@vitalflow-icons/time/calendar';
import { ChevronLeft } from '@vitalflow-icons/arrows/chevronLeft';
import { ChevronRight } from '@vitalflow-icons/arrows/chevronRight';
import { useTranslation } from 'react-i18next';
import './styles.css';

const { RangePicker } = DatePicker;

export type DateRangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'last30Days' | 'last90Days' | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  preset?: DateRangePreset;
}

export interface DateRangeSelectorProps {
  /** Current selected date range */
  value?: DateRange;
  /** Callback when date range changes */
  onChange?: (range: DateRange) => void;
  /** Show quick filter buttons */
  showQuickFilters?: boolean;
  /** Show navigation arrows */
  showNavigation?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom preset configurations */
  customPresets?: Array<{
    label: string;
    value: DateRangePreset;
    getRange: () => DateRange;
  }>;
}

/**
 * DateRangeSelector - Component for selecting date ranges with presets
 *
 * Features:
 * - Date range picker with calendar UI
 * - Quick filter presets (Today, This Week, This Month, etc.)
 * - Navigation arrows to move forward/backward
 * - Keyboard shortcuts (will be handled by parent)
 * - Custom preset support
 * - Design system styling with dark mode
 *
 * @example
 * ```tsx
 * <DateRangeSelector
 *   value={dateRange}
 *   onChange={handleDateChange}
 *   showQuickFilters={true}
 *   showNavigation={true}
 * />
 * ```
 */
export default function DateRangeSelector({
  value,
  onChange,
  showQuickFilters = true,
  showNavigation = true,
  disabled = false,
  customPresets,
}: DateRangeSelectorProps) {
  const { t } = useTranslation();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Default preset configurations
  const defaultPresets = useMemo(() => [
    {
      label: 'Today',
      value: 'today' as DateRangePreset,
      getRange: (): DateRange => ({
        startDate: dayjs().startOf('day').toDate(),
        endDate: dayjs().endOf('day').toDate(),
        preset: 'today',
      }),
    },
    {
      label: 'Yesterday',
      value: 'yesterday' as DateRangePreset,
      getRange: (): DateRange => ({
        startDate: dayjs().subtract(1, 'day').startOf('day').toDate(),
        endDate: dayjs().subtract(1, 'day').endOf('day').toDate(),
        preset: 'yesterday',
      }),
    },
    {
      label: 'This Week',
      value: 'thisWeek' as DateRangePreset,
      getRange: (): DateRange => ({
        startDate: dayjs().startOf('week').toDate(),
        endDate: dayjs().endOf('week').toDate(),
        preset: 'thisWeek',
      }),
    },
    {
      label: 'Last Week',
      value: 'lastWeek' as DateRangePreset,
      getRange: (): DateRange => ({
        startDate: dayjs().subtract(1, 'week').startOf('week').toDate(),
        endDate: dayjs().subtract(1, 'week').endOf('week').toDate(),
        preset: 'lastWeek',
      }),
    },
    {
      label: 'This Month',
      value: 'thisMonth' as DateRangePreset,
      getRange: (): DateRange => ({
        startDate: dayjs().startOf('month').toDate(),
        endDate: dayjs().endOf('month').toDate(),
        preset: 'thisMonth',
      }),
    },
    {
      label: 'Last Month',
      value: 'lastMonth' as DateRangePreset,
      getRange: (): DateRange => ({
        startDate: dayjs().subtract(1, 'month').startOf('month').toDate(),
        endDate: dayjs().subtract(1, 'month').endOf('month').toDate(),
        preset: 'lastMonth',
      }),
    },
    {
      label: 'Last 30 Days',
      value: 'last30Days' as DateRangePreset,
      getRange: (): DateRange => ({
        startDate: dayjs().subtract(30, 'day').startOf('day').toDate(),
        endDate: dayjs().endOf('day').toDate(),
        preset: 'last30Days',
      }),
    },
    {
      label: 'Last 90 Days',
      value: 'last90Days' as DateRangePreset,
      getRange: (): DateRange => ({
        startDate: dayjs().subtract(90, 'day').startOf('day').toDate(),
        endDate: dayjs().endOf('day').toDate(),
        preset: 'last90Days',
      }),
    },
  ], []);

  const presets = customPresets || defaultPresets;

  // Handle preset selection
  const handlePresetClick = useCallback((preset: typeof presets[0]) => {
    const range = preset.getRange();
    onChange?.(range);
  }, [onChange]);

  // Handle custom date range selection from picker
  const handleRangeChange = useCallback((dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const range: DateRange = {
        startDate: dates[0].startOf('day').toDate(),
        endDate: dates[1].endOf('day').toDate(),
        preset: 'custom',
      };
      onChange?.(range);
      setIsPickerOpen(false);
    }
  }, [onChange]);

  // Navigate to previous period (based on current preset)
  const handlePrevious = useCallback(() => {
    if (!value) return;

    const currentStart = dayjs(value.startDate);
    const currentEnd = dayjs(value.endDate);
    const diff = currentEnd.diff(currentStart, 'day');

    // Move backward by the same duration
    const newRange: DateRange = {
      startDate: currentStart.subtract(diff + 1, 'day').toDate(),
      endDate: currentEnd.subtract(diff + 1, 'day').toDate(),
      preset: value.preset,
    };

    onChange?.(newRange);
  }, [value, onChange]);

  // Navigate to next period
  const handleNext = useCallback(() => {
    if (!value) return;

    const currentStart = dayjs(value.startDate);
    const currentEnd = dayjs(value.endDate);
    const diff = currentEnd.diff(currentStart, 'day');

    // Move forward by the same duration
    const newRange: DateRange = {
      startDate: currentStart.add(diff + 1, 'day').toDate(),
      endDate: currentEnd.add(diff + 1, 'day').toDate(),
      preset: value.preset,
    };

    onChange?.(newRange);
  }, [value, onChange]);

  // Format display label
  const displayLabel = useMemo(() => {
    if (!value) return 'Select Date Range';

    const start = dayjs(value.startDate);
    const end = dayjs(value.endDate);

    // If same day
    if (start.isSame(end, 'day')) {
      if (start.isSame(dayjs(), 'day')) {
        return 'Today';
      }
      return start.format('MMM D, YYYY');
    }

    // If same month and year
    if (start.isSame(end, 'month') && start.isSame(end, 'year')) {
      return `${start.format('MMM D')} - ${end.format('D, YYYY')}`;
    }

    // If same year
    if (start.isSame(end, 'year')) {
      return `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`;
    }

    // Different years
    return `${start.format('MMM D, YYYY')} - ${end.format('MMM D, YYYY')}`;
  }, [value]);

  // Convert value to dayjs for RangePicker
  const pickerValue: [Dayjs, Dayjs] | undefined = value
    ? [dayjs(value.startDate), dayjs(value.endDate)]
    : undefined;

  return (
    <div className="date-range-selector" role="group" aria-label={t('common.dateRange.selector.label')}>
      <Space size="small" wrap>
        {/* Navigation arrows */}
        {showNavigation && (
          <>
            <Button
              icon={<ChevronLeft width={16} height={16} />}
              onClick={handlePrevious}
              disabled={disabled || !value}
              aria-label={t('common.dateRange.selector.previousPeriod')}
              className="date-range-selector__nav-button"
            />
            <Button
              icon={<ChevronRight width={16} height={16} />}
              onClick={handleNext}
              disabled={disabled || !value}
              aria-label={t('common.dateRange.selector.nextPeriod')}
              className="date-range-selector__nav-button"
            />
          </>
        )}

        {/* Date range picker */}
        <Dropdown
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          disabled={disabled}
          trigger={['click']}
          dropdownRender={() => (
            <div className="date-range-selector__picker-dropdown">
              <RangePicker
                value={pickerValue}
                onChange={handleRangeChange}
                open={true}
                getPopupContainer={(trigger) => trigger.parentElement || document.body}
                style={{ visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }}
                panelRender={(panel) => (
                  <div className="date-range-selector__panel">{panel}</div>
                )}
              />
            </div>
          )}
        >
          <Button
            icon={<Calendar width={16} height={16} />}
            disabled={disabled}
            className="date-range-selector__display-button"
          >
            {displayLabel}
          </Button>
        </Dropdown>

        {/* Quick filter presets */}
        {showQuickFilters && (
          <div className="date-range-selector__quick-filters" role="toolbar" aria-label={t('common.dateRange.selector.quickFilters')}>
            {presets.slice(0, 5).map((preset) => (
              <Button
                key={preset.value}
                size="small"
                type={value?.preset === preset.value ? 'primary' : 'default'}
                onClick={() => handlePresetClick(preset)}
                disabled={disabled}
                className="date-range-selector__preset-button"
              >
                {preset.label}
              </Button>
            ))}

            {/* "More" dropdown for additional presets */}
            {presets.length > 5 && (
              <Dropdown
                menu={{
                  items: presets.slice(5).map((preset) => ({
                    key: preset.value,
                    label: preset.label,
                    onClick: () => handlePresetClick(preset),
                  })),
                }}
                disabled={disabled}
              >
                <Button size="small">{t('common.dateRange.selector.more')}</Button>
              </Dropdown>
            )}
          </div>
        )}
      </Space>
    </div>
  );
}
