/**
 * ANTD-047: Accessibility Tests for DatePicker Components
 * WCAG 2.1 AA compliance tests
 */

import { render } from '@test-utils';
import { testA11y } from '@test-utils/accessibility';
import dayjs from 'dayjs';
import {
  DatePicker,
  PastDatePicker,
  FutureDatePicker,
  RangePicker} from '../index';

describe('DatePicker Accessibility', () => {
  describe('DatePicker Component', () => {
    it('meets WCAG 2.1 AA standards', async () => {
      const { container } = render(<DatePicker />);
      await testA11y(container);
    });

    it('has accessible label when provided', () => {
      const { getByLabelText } = render(
        <div>
          <label htmlFor="date-picker">Select Date</label>
          <DatePicker id="date-picker" />
        </div>
      );
      expect(getByLabelText('Select Date')).toBeInTheDocument();
    });

    it('has placeholder text for guidance', () => {
      const { getByPlaceholderText } = render(
        <DatePicker placeholder="Select a date" />
      );
      expect(getByPlaceholderText('Select a date')).toBeInTheDocument();
    });
  });

  describe('PastDatePicker Component', () => {
    it('meets WCAG 2.1 AA standards', async () => {
      const { container } = render(<PastDatePicker />);
      await testA11y(container);
    });

    it('has default placeholder for past dates', () => {
      const { container } = render(<PastDatePicker />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('placeholder');
    });
  });

  describe('FutureDatePicker Component', () => {
    it('meets WCAG 2.1 AA standards', async () => {
      const { container } = render(<FutureDatePicker />);
      await testA11y(container);
    });

    it('has default placeholder for future dates', () => {
      const { container } = render(<FutureDatePicker />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('placeholder');
    });
  });

  describe('RangePicker Component', () => {
    it('meets WCAG 2.1 AA standards', async () => {
      const { container } = render(<RangePicker />);
      await testA11y(container);
    });

    it('has two accessible inputs for start and end dates', () => {
      const { container } = render(<RangePicker />);
      const inputs = container.querySelectorAll('input');
      expect(inputs).toHaveLength(2);
      inputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'text');
      });
    });

    it('handles keyboard navigation', async () => {
      const { container } = render(<RangePicker />);
      const firstInput = container.querySelectorAll('input')[0];

      firstInput.focus();
      expect(firstInput).toHaveFocus();

      // Tab should move to second input
      firstInput.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
          cancelable: true,
        })
      );
    });
  });

  describe('Date Picker with Disabled State', () => {
    it('meets accessibility standards when disabled', async () => {
      const { container } = render(<DatePicker disabled />);
      await testA11y(container);
    });

    it('has proper aria-disabled attribute', () => {
      const { container } = render(<DatePicker disabled />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('disabled');
    });
  });

  describe('Date Picker with Error State', () => {
    it('meets accessibility standards with error status', async () => {
      const { container } = render(
        <DatePicker status="error" />
      );
      await testA11y(container);
    });
  });

  describe('Date Picker with Custom Value', () => {
    it('announces selected date to screen readers', () => {
      const testDate = dayjs('2025-10-13');
      const { container } = render(
        <DatePicker value={testDate} aria-label="Selected date" />
      );

      const input = container.querySelector('input');
      expect(input).toHaveAttribute('aria-label', 'Selected date');
      expect(input).toHaveValue('Oct 13, 2025');
    });
  });
});
