/**
 * RecurrencePicker
 *
 * Component for selecting recurring event patterns
 *
 * Features:
 * - Recurrence type (daily, weekly, monthly)
 * - Interval selection
 * - Day-of-week selector for weekly
 * - End conditions (never, after N, on date)
 * - Preview of upcoming occurrences
 */

import React, { useMemo } from 'react';
import { Card, Select, InputNumber, Checkbox, DatePicker, Radio, Space, Typography } from 'antd';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { calculateRecurringDates } from '@utils/recurrenceCalculator';
import { UntitledIcon } from '@atoms/Icon';
import './styles.css';

const { Text } = Typography;
const { Option } = Select;

export interface RecurrencePattern {
  enabled: boolean;
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // [0-6] Sunday=0
  endType: 'never' | 'after' | 'on';
  endAfterOccurrences?: number;
  endOnDate?: string;
}

interface RecurrencePickerProps {
  startDate: Date;
  value: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
}

export default function RecurrencePicker({ startDate, value, onChange }: RecurrencePickerProps) {
  const { t } = useTranslation();

  const DAYS_OF_WEEK = [
    { value: 0, label: t('common.recurrence.daysOfWeek.sun') },
    { value: 1, label: t('common.recurrence.daysOfWeek.mon') },
    { value: 2, label: t('common.recurrence.daysOfWeek.tue') },
    { value: 3, label: t('common.recurrence.daysOfWeek.wed') },
    { value: 4, label: t('common.recurrence.daysOfWeek.thu') },
    { value: 5, label: t('common.recurrence.daysOfWeek.fri') },
    { value: 6, label: t('common.recurrence.daysOfWeek.sat') },
  ];

  const handleChange = (updates: Partial<RecurrencePattern>) => {
    onChange({ ...value, ...updates });
  };

  // Calculate preview dates
  const previewDates = useMemo(() => {
    if (!value.enabled) return [];

    return calculateRecurringDates({
      startDate,
      pattern: value,
      limit: 5, // Show next 5 occurrences
    });
  }, [startDate, value]);

  return (
    <div className="recurrence-picker">
      {/* Enable Recurrence Toggle */}
      <Checkbox
        checked={value.enabled}
        onChange={e => handleChange({ enabled: e.target.checked })}
      >
        <Text strong>{t('common.recurrence.repeatActivity')}</Text>
      </Checkbox>

      {value.enabled && (
        <Card size="small" className="recurrence-picker__options">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Recurrence Type */}
            <div className="recurrence-picker__field">
              <Text strong>{t('common.recurrence.repeatEvery')}</Text>
              <Space>
                <InputNumber
                  min={1}
                  max={30}
                  value={value.interval}
                  onChange={val => handleChange({ interval: val || 1 })}
                  style={{ width: 70 }}
                />
                <Select
                  value={value.type}
                  onChange={type => handleChange({ type })}
                  style={{ width: 120 }}
                >
                  <Option value="daily">{t('common.recurrence.days')}</Option>
                  <Option value="weekly">{t('common.recurrence.weeks')}</Option>
                  <Option value="monthly">{t('common.recurrence.months')}</Option>
                </Select>
              </Space>
            </div>

            {/* Days of Week (for weekly) */}
            {value.type === 'weekly' && (
              <div className="recurrence-picker__field">
                <Text strong>{t('common.recurrence.repeatOn')}</Text>
                <div className="recurrence-picker__days">
                  {DAYS_OF_WEEK.map(day => (
                    <Checkbox
                      key={day.value}
                      checked={value.daysOfWeek?.includes(day.value)}
                      onChange={e => {
                        const current = value.daysOfWeek || [];
                        const updated = e.target.checked
                          ? [...current, day.value].sort()
                          : current.filter(d => d !== day.value);
                        handleChange({ daysOfWeek: updated });
                      }}
                    >
                      {day.label}
                    </Checkbox>
                  ))}
                </div>
              </div>
            )}

            {/* End Condition */}
            <div className="recurrence-picker__field">
              <Text strong>{t('common.recurrence.ends')}</Text>
              <Radio.Group
                value={value.endType}
                onChange={e => handleChange({ endType: e.target.value })}
              >
                <Space direction="vertical">
                  <Radio value="never">{t('common.recurrence.never')}</Radio>

                  <Radio value="after">
                    <Space>
                      <span>{t('common.recurrence.after')}</span>
                      {value.endType === 'after' && (
                        <InputNumber
                          min={1}
                          max={365}
                          value={value.endAfterOccurrences || 10}
                          onChange={val =>
                            handleChange({ endAfterOccurrences: val || 10 })
                          }
                          style={{ width: 80 }}
                        />
                      )}
                      <span>{t('common.recurrence.occurrences')}</span>
                    </Space>
                  </Radio>

                  <Radio value="on">
                    <Space>
                      <span>{t('common.recurrence.on')}</span>
                      {value.endType === 'on' && (
                        <DatePicker
                          value={value.endOnDate ? dayjs(value.endOnDate) : null}
                          onChange={(date: Dayjs | null) =>
                            handleChange({
                              endOnDate: date ? date.format('YYYY-MM-DD') : undefined,
                            })
                          }
                          disabledDate={current =>
                            current && current.isBefore(dayjs(startDate), 'day')
                          }
                          format="MMM D, YYYY"
                        />
                      )}
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>

            {/* Preview */}
            {previewDates.length > 0 && (
              <div className="recurrence-picker__preview">
                <Text strong>
                  <UntitledIcon name="calendar" /> {t('common.recurrence.upcomingOccurrences')}
                </Text>
                <div className="recurrence-picker__preview-list">
                  {previewDates.map((date, index) => (
                    <div key={index} className="recurrence-picker__preview-item">
                      <UntitledIcon name="clock" />
                      <Text>{dayjs(date).format('ddd, MMM D, YYYY')}</Text>
                    </div>
                  ))}
                  {value.endType === 'never' && (
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
                      {t('common.recurrence.continuesIndefinitely')}
                    </Text>
                  )}
                </div>
              </div>
            )}
          </Space>
        </Card>
      )}
    </div>
  );
}
