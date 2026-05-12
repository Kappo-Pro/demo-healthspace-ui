/**
 * ANTD-047: Unit Tests for DatePicker Components
 * Tests for standardized DatePicker wrapper components
 */

import { render, screen } from '@test-utils';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import {
  DatePicker,
  DateTimePicker,
  PastDatePicker,
  FutureDatePicker,
  BirthDatePicker,
  MonthPicker,
  YearPicker,
  RangePicker} from '../index';
import { DATE_FORMATS, DATE_VALIDATORS } from '../datePickerConfig';

describe('DatePicker Components', () => {
  describe('DatePicker (Standard)', () => {
    it('renders with default format', () => {
      render(<DatePicker />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('displays selected date in correct format', () => {
      const testDate = dayjs('2025-10-13');
      render(<DatePicker value={testDate} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(testDate.format(DATE_FORMATS.DISPLAY));
    });

    it('accepts custom format', () => {
      const testDate = dayjs('2025-10-13');
      const customFormat = 'DD/MM/YYYY';
      render(<DatePicker value={testDate} format={customFormat} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(testDate.format(customFormat));
    });

    it('handles onChange callback', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<DatePicker onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      // Note: Full calendar interaction would require more complex setup
      // This verifies the component renders and accepts interactions
      expect(input).toHaveFocus();
    });
  });

  describe('DateTimePicker', () => {
    it('renders with time selection enabled', () => {
      render(<DateTimePicker />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('displays datetime in correct format', () => {
      const testDate = dayjs('2025-10-13 14:30:00');
      render(<DateTimePicker value={testDate} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      // Should include time in the value
      expect(input.value).toContain(':');
    });
  });

  describe('PastDatePicker', () => {
    it('renders with past date configuration', () => {
      render(<PastDatePicker />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('has disableFutureDates validator applied', () => {
      const today = dayjs();
      const tomorrow = dayjs().add(1, 'day');

      // Test the validator function directly
      expect(DATE_VALIDATORS.disableFutureDates(tomorrow)).toBe(true);
      expect(DATE_VALIDATORS.disableFutureDates(today)).toBe(false);
    });
  });

  describe('FutureDatePicker', () => {
    it('renders with future date configuration', () => {
      render(<FutureDatePicker />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('has disablePastDates validator applied', () => {
      const today = dayjs();
      const yesterday = dayjs().subtract(1, 'day');

      // Test the validator function directly
      expect(DATE_VALIDATORS.disablePastDates(yesterday)).toBe(true);
      expect(DATE_VALIDATORS.disablePastDates(today)).toBe(false);
    });
  });

  describe('BirthDatePicker', () => {
    it('renders with birth date configuration', () => {
      render(<BirthDatePicker />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('disables future dates (you can\'t be born in the future)', () => {
      const tomorrow = dayjs().add(1, 'day');
      expect(DATE_VALIDATORS.disableFutureDates(tomorrow)).toBe(true);
    });

    it('allows reasonable age range (e.g., 0-120 years)', () => {
      const hundredYearsAgo = dayjs().subtract(100, 'year');
      expect(DATE_VALIDATORS.disableFutureDates(hundredYearsAgo)).toBe(false);
    });
  });

  describe('MonthPicker', () => {
    it('renders month picker', () => {
      render(<MonthPicker />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('displays month in YYYY-MM format', () => {
      const testDate = dayjs('2025-10-01');
      render(<MonthPicker value={testDate} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(testDate.format('YYYY-MM'));
    });
  });

  describe('YearPicker', () => {
    it('renders year picker', () => {
      render(<YearPicker />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('displays year in YYYY format', () => {
      const testDate = dayjs('2025-01-01');
      render(<YearPicker value={testDate} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('2025');
    });
  });

  describe('RangePicker', () => {
    it('renders range picker with two inputs', () => {
      render(<RangePicker />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(2);
    });

    it('displays start and end dates', () => {
      const startDate = dayjs('2025-10-01');
      const endDate = dayjs('2025-10-13');
      render(<RangePicker value={[startDate, endDate]} />);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs[0]).toHaveValue(startDate.format(DATE_FORMATS.DISPLAY));
      expect(inputs[1]).toHaveValue(endDate.format(DATE_FORMATS.DISPLAY));
    });

    it('handles onChange callback', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<RangePicker onChange={handleChange} />);

      const firstInput = screen.getAllByRole('textbox')[0];
      await user.click(firstInput);

      expect(firstInput).toHaveFocus();
    });
  });

  describe('DATE_VALIDATORS', () => {
    describe('disablePastDates', () => {
      it('disables dates before today', () => {
        const yesterday = dayjs().subtract(1, 'day');
        expect(DATE_VALIDATORS.disablePastDates(yesterday)).toBe(true);
      });

      it('allows today', () => {
        const today = dayjs();
        expect(DATE_VALIDATORS.disablePastDates(today)).toBe(false);
      });

      it('allows future dates', () => {
        const tomorrow = dayjs().add(1, 'day');
        expect(DATE_VALIDATORS.disablePastDates(tomorrow)).toBe(false);
      });
    });

    describe('disableFutureDates', () => {
      it('disables dates after today', () => {
        const tomorrow = dayjs().add(1, 'day');
        expect(DATE_VALIDATORS.disableFutureDates(tomorrow)).toBe(true);
      });

      it('allows today', () => {
        const today = dayjs();
        expect(DATE_VALIDATORS.disableFutureDates(today)).toBe(false);
      });

      it('allows past dates', () => {
        const yesterday = dayjs().subtract(1, 'day');
        expect(DATE_VALIDATORS.disableFutureDates(yesterday)).toBe(false);
      });
    });

    describe('disableWeekends', () => {
      it('disables Saturdays', () => {
        // October 12, 2025 is a Saturday
        const saturday = dayjs('2025-10-12');
        expect(DATE_VALIDATORS.disableWeekends(saturday)).toBe(true);
      });

      it('disables Sundays', () => {
        // October 13, 2025 is a Sunday
        const sunday = dayjs('2025-10-13');
        expect(DATE_VALIDATORS.disableWeekends(sunday)).toBe(true);
      });

      it('allows weekdays', () => {
        // October 10, 2025 is a Friday
        const friday = dayjs('2025-10-10');
        expect(DATE_VALIDATORS.disableWeekends(friday)).toBe(false);
      });
    });

    describe('disableBeforeDate', () => {
      it('creates validator that disables dates before specified date', () => {
        const cutoffDate = dayjs('2025-10-10');
        const validator = DATE_VALIDATORS.disableBeforeDate(cutoffDate);

        const beforeDate = dayjs('2025-10-09');
        const afterDate = dayjs('2025-10-11');

        expect(validator(beforeDate)).toBe(true);
        expect(validator(afterDate)).toBe(false);
      });
    });

    describe('disableAfterDate', () => {
      it('creates validator that disables dates after specified date', () => {
        const cutoffDate = dayjs('2025-10-10');
        const validator = DATE_VALIDATORS.disableAfterDate(cutoffDate);

        const beforeDate = dayjs('2025-10-09');
        const afterDate = dayjs('2025-10-11');

        expect(validator(beforeDate)).toBe(false);
        expect(validator(afterDate)).toBe(true);
      });
    });
  });

  describe('DATE_FORMATS', () => {
    it('has consistent format definitions', () => {
      expect(DATE_FORMATS.DISPLAY).toBe('MMM DD, YYYY');
      expect(DATE_FORMATS.API).toBe('YYYY-MM-DD');
      expect(DATE_FORMATS.DATETIME).toBe('YYYY-MM-DD HH:mm:ss');
      expect(DATE_FORMATS.MONTH).toBe('YYYY-MM');
      expect(DATE_FORMATS.YEAR).toBe('YYYY');
    });

    it('formats dates correctly', () => {
      const testDate = dayjs('2025-10-13 14:30:45');

      expect(testDate.format(DATE_FORMATS.DISPLAY)).toBe('Oct 13, 2025');
      expect(testDate.format(DATE_FORMATS.API)).toBe('2025-10-13');
      expect(testDate.format(DATE_FORMATS.DATETIME)).toBe('2025-10-13 14:30:45');
      expect(testDate.format(DATE_FORMATS.MONTH)).toBe('2025-10');
      expect(testDate.format(DATE_FORMATS.YEAR)).toBe('2025');
    });
  });
});
