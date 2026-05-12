/**
 * ANTD-047: Accessibility Testing Utilities
 * Helper functions for testing WCAG AA compliance
 */

import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers to include accessibility testing
expect.extend(toHaveNoViolations);

/**
 * Test a component for accessibility violations
 * Uses axe-core to check WCAG 2.1 AA standards
 *
 * @param container - The container element to test
 * @example
 * ```typescript
 * const { container } = render(<MyComponent />);
 * await testA11y(container);
 * ```
 */
export const testA11y = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

/**
 * axe-core configuration options
 * @see https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter
 */
interface AxeOptions {
  rules?: Record<string, { enabled: boolean }>;
  runOnly?: {
    type: 'tag' | 'rule';
    values: string[];
  };
  reporter?: 'v1' | 'v2' | 'raw' | 'no-passes';
}

/**
 * Test accessibility with custom axe configuration
 *
 * @param container - The container element to test
 * @param options - axe-core configuration options
 * @example
 * ```typescript
 * await testA11yWithOptions(container, {
 *   rules: {
 *     'color-contrast': { enabled: true }
 *   }
 * });
 * ```
 */
export const testA11yWithOptions = async (
  container: HTMLElement,
  options: AxeOptions
) => {
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
};

/**
 * Check for specific ARIA attributes
 *
 * @param element - Element to check
 * @param attributes - Object of expected ARIA attributes
 * @example
 * ```typescript
 * checkAriaAttributes(button, {
 *   'aria-label': 'Close dialog',
 *   'aria-expanded': 'true'
 * });
 * ```
 */
export const checkAriaAttributes = (
  element: HTMLElement,
  attributes: Record<string, string>
) => {
  Object.entries(attributes).forEach(([key, value]) => {
    expect(element).toHaveAttribute(key, value);
  });
};

/**
 * Verify keyboard navigation works correctly
 *
 * @param element - Element to test keyboard navigation on
 * @param key - Key to press (e.g., 'Enter', 'Space', 'ArrowDown')
 * @param callback - Function to verify behavior after key press
 * @example
 * ```typescript
 * await testKeyboardNavigation(button, 'Enter', () => {
 *   expect(mockFn).toHaveBeenCalled();
 * });
 * ```
 */
export const testKeyboardNavigation = async (
  element: HTMLElement,
  key: string,
  callback: () => void
) => {
  element.focus();
  expect(element).toHaveFocus();

  // Simulate key press
  element.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    })
  );

  callback();
};

/**
 * Verify screen reader announcements
 * Checks for aria-live regions and their content
 *
 * @param container - Container to search within
 * @param expectedText - Expected announcement text
 * @example
 * ```typescript
 * verifyScreenReaderAnnouncement(container, 'Form submitted successfully');
 * ```
 */
export const verifyScreenReaderAnnouncement = (
  container: HTMLElement,
  expectedText: string
) => {
  const liveRegions = container.querySelectorAll('[aria-live]');
  const hasAnnouncement = Array.from(liveRegions).some(
    region => region.textContent?.includes(expectedText)
  );
  expect(hasAnnouncement).toBe(true);
};

/**
 * Common accessibility test suite
 * Runs a standard set of accessibility checks
 *
 * @param renderFn - Function that renders the component
 * @example
 * ```typescript
 * describe('MyComponent Accessibility', () => {
 *   runA11yTestSuite(() => render(<MyComponent />));
 * });
 * ```
 */
export const runA11yTestSuite = (renderFn: () => { container: HTMLElement }) => {
  describe('Accessibility Standards', () => {
    it('meets WCAG 2.1 AA standards', async () => {
      const { container } = renderFn();
      await testA11y(container);
    });

    it('has no color contrast issues', async () => {
      const { container } = renderFn();
      await testA11yWithOptions(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
    });

    it('has proper heading hierarchy', async () => {
      const { container } = renderFn();
      await testA11yWithOptions(container, {
        rules: {
          'heading-order': { enabled: true },
        },
      });
    });

    it('has accessible labels for form elements', async () => {
      const { container } = renderFn();
      await testA11yWithOptions(container, {
        rules: {
          label: { enabled: true },
          'label-title-only': { enabled: true },
        },
      });
    });
  });
};
