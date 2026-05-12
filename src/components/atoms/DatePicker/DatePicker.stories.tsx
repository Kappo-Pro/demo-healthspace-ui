import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import {
  DatePicker,
  DateTimePicker,
  PastDatePicker,
  FutureDatePicker,
  BirthDatePicker,
  MonthPicker,
  YearPicker,
  RangePicker} from './index';
import { DATE_FORMATS, DATE_RANGE_PRESETS } from './datePickerConfig';

const meta: Meta<typeof DatePicker> = {
  title: 'Atoms/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Standardized DatePicker components with pre-configured behaviors and validators.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// Standard DatePicker
export const Default: Story = {
  args: {
    placeholder: 'Select date',
  },
  render: (args) => {
    const [date, setDate] = useState<Dayjs | null>(null);
    return (
      <DatePicker {...args} value={date} onChange={setDate} />
    );
  },
};

export const WithDisplayFormat: Story = {
  args: {
    format: DATE_FORMATS.DISPLAY,
    placeholder: 'MMM DD, YYYY',
  },
  render: (args) => {
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    return (
      <DatePicker {...args} value={date} onChange={setDate} />
    );
  },
};

export const WithAPIFormat: Story = {
  args: {
    format: DATE_FORMATS.API,
    placeholder: 'YYYY-MM-DD',
  },
  render: (args) => {
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    return (
      <DatePicker {...args} value={date} onChange={setDate} />
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    value: dayjs(),
  },
};

// DateTimePicker
export const DateTime: Story = {
  render: () => {
    const [date, setDate] = useState<Dayjs | null>(null);
    return (
      <DateTimePicker
        value={date}
        onChange={setDate}
        placeholder="Select date and time"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'DateTimePicker includes time selection with seconds.',
      },
    },
  },
};

// PastDatePicker
export const PastDates: Story = {
  render: () => {
    const [date, setDate] = useState<Dayjs | null>(null);
    return (
      <PastDatePicker
        value={date}
        onChange={setDate}
        placeholder="Select past date"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Only allows selection of past dates. Future dates are disabled.',
      },
    },
  },
};

// FutureDatePicker
export const FutureDates: Story = {
  render: () => {
    const [date, setDate] = useState<Dayjs | null>(null);
    return (
      <FutureDatePicker
        value={date}
        onChange={setDate}
        placeholder="Select future date"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Only allows selection of future dates and today. Past dates are disabled.',
      },
    },
  },
};

// BirthDatePicker
export const BirthDate: Story = {
  render: () => {
    const [date, setDate] = useState<Dayjs | null>(null);
    return (
      <BirthDatePicker
        value={date}
        onChange={setDate}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Specialized picker for birth dates with appropriate constraints.',
      },
    },
  },
};

// MonthPicker
export const Month: Story = {
  render: () => {
    const [date, setDate] = useState<Dayjs | null>(null);
    return (
      <MonthPicker
        value={date}
        onChange={setDate}
        placeholder="Select month"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Month selection with YYYY-MM format.',
      },
    },
  },
};

// YearPicker
export const Year: Story = {
  render: () => {
    const [date, setDate] = useState<Dayjs | null>(null);
    return (
      <YearPicker
        value={date}
        onChange={setDate}
        placeholder="Select year"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Year selection with YYYY format.',
      },
    },
  },
};

// RangePicker
export const DateRange: Story = {
  render: () => {
    const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    return (
      <RangePicker
        value={dates}
        onChange={setDates}
        placeholder={['Start date', 'End date']}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Date range picker for selecting start and end dates.',
      },
    },
  },
};

export const DateRangeWithPresets: Story = {
  render: () => {
    const [dates, setDates] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    return (
      <RangePicker
        value={dates}
        onChange={setDates}
        presets={DATE_RANGE_PRESETS}
        placeholder={['Start date', 'End date']}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'RangePicker with common presets (Today, Last 7 Days, Last 30 Days, etc.).',
      },
    },
  },
};

// Configuration Example
export const AllFormats: Story = {
  render: () => {
    const [date, setDate] = useState<Dayjs | null>(dayjs());
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <div>
          <strong>DISPLAY Format (MMM DD, YYYY):</strong>
          <DatePicker
            value={date}
            onChange={setDate}
            format={DATE_FORMATS.DISPLAY}
          />
        </div>
        <div>
          <strong>API Format (YYYY-MM-DD):</strong>
          <DatePicker
            value={date}
            onChange={setDate}
            format={DATE_FORMATS.API}
          />
        </div>
        <div>
          <strong>LONG Format (dddd, MMMM DD, YYYY):</strong>
          <DatePicker
            value={date}
            onChange={setDate}
            format={DATE_FORMATS.LONG}
          />
        </div>
        <div>
          <strong>SHORT Format (MM/DD/YY):</strong>
          <DatePicker
            value={date}
            onChange={setDate}
            format={DATE_FORMATS.SHORT}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'All available date formats from DATE_FORMATS configuration.',
      },
    },
  },
};
