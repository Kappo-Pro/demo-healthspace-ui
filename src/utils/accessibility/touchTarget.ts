/**
 * Touch Target Validation Utilities
 * Story 7.1: Mobile Styles & Full-Screen Modal
 *
 * WCAG 2.5.5 Target Size (Level AAA):
 * - Minimum touch target: 48x48px
 * - Recommended touch target: 56x56px (iOS HIG)
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */

/**
 * WCAG AAA minimum touch target size (pixels)
 */
export const TOUCH_TARGET_MIN = 48;

/**
 * Recommended touch target size (pixels) - iOS HIG
 */
export const TOUCH_TARGET_RECOMMENDED = 56;

/**
 * Minimum touch target for close buttons (pixels)
 */
export const TOUCH_TARGET_CLOSE_BTN = 44;

/**
 * Validate touch target size (WCAG 2.5.5 AAA)
 *
 * @param element - DOM element to check
 * @param minSize - Minimum size in pixels (default: 48px)
 * @returns true if both width and height meet minimum size
 *
 * @example
 * ```typescript
 * const button = document.querySelector('button');
 * const isValid = validateTouchTarget(button); // true if ≥48x48px
 * ```
 */
export function validateTouchTarget(
  element: HTMLElement,
  minSize: number = TOUCH_TARGET_MIN
): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= minSize && rect.height >= minSize;
}

/**
 * Get all interactive elements in a container
 *
 * Includes: buttons, links, inputs, custom interactive elements
 *
 * @param container - Container element to search within
 * @returns Array of interactive HTML elements
 *
 * @example
 * ```typescript
 * const modal = document.querySelector('.modal');
 * const interactive = getInteractiveElements(modal);
 *  * ```
 */
export function getInteractiveElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="switch"]',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(', ')));
}

/**
 * Validate all touch targets in a container
 *
 * @param container - Container element to validate
 * @param minSize - Minimum size in pixels (default: 48px)
 * @returns Array of elements failing validation (empty = all pass)
 *
 * @example
 * ```typescript
 * const modal = document.querySelector('.modal');
 * const failing = validateAllTouchTargets(modal);
 *
 * if (failing.length > 0) {
 *   console.error(`${failing.length} elements fail touch target validation`);
 *   failing.forEach(el => console.error(el, el.getBoundingClientRect()));
 * }
 * ```
 */
export function validateAllTouchTargets(
  container: HTMLElement,
  minSize: number = TOUCH_TARGET_MIN
): HTMLElement[] {
  const interactive = getInteractiveElements(container);
  return interactive.filter((el) => !validateTouchTarget(el, minSize));
}

/**
 * Get touch target compliance report
 *
 * @param container - Container element to analyze
 * @param minSize - Minimum size in pixels (default: 48px)
 * @returns Compliance report with statistics
 *
 * @example
 * ```typescript
 * const report = getTouchTargetReport(document.body);
 *  *  * ```
 */
export interface TouchTargetReport {
  /** Total interactive elements found */
  total: number;
  /** Elements passing validation */
  passing: number;
  /** Elements failing validation */
  failing: HTMLElement[];
  /** Compliance rate (0-100%) */
  complianceRate: number;
  /** Minimum size used for validation */
  minSize: number;
}

export function getTouchTargetReport(
  container: HTMLElement,
  minSize: number = TOUCH_TARGET_MIN
): TouchTargetReport {
  const interactive = getInteractiveElements(container);
  const failing = validateAllTouchTargets(container, minSize);
  const passing = interactive.length - failing.length;
  const complianceRate = interactive.length > 0 ? (passing / interactive.length) * 100 : 100;

  return {
    total: interactive.length,
    passing,
    failing,
    complianceRate: Math.round(complianceRate * 100) / 100, // Round to 2 decimals
    minSize,
  };
}

/**
 * Log touch target validation results to console
 *
 * Useful for debugging accessibility issues in development
 *
 * @param container - Container element to validate
 * @param minSize - Minimum size in pixels (default: 48px)
 *
 * @example
 * ```typescript
 * // In development mode
 * if (process.env.NODE_ENV === 'development') {
 *   logTouchTargetValidation(document.querySelector('.modal'));
 * }
 * ```
 */
export function logTouchTargetValidation(
  container: HTMLElement,
  minSize: number = TOUCH_TARGET_MIN
): void {
  const report = getTouchTargetReport(container, minSize);

  /* eslint-disable no-console */
  console.group('🎯 Touch Target Validation (WCAG 2.5.5 AAA)');

  if (report.failing.length > 0) {
    console.group('❌ Failing Elements:');
    // Removed console.log iteration for security (HOT-002)
    // Previous: logged element details for each failing element
    console.groupEnd();
  }

  console.groupEnd();
  /* eslint-enable no-console */
}

/**
 * Assert touch target compliance (for testing)
 *
 * Throws error if any elements fail validation
 *
 * @param container - Container element to validate
 * @param minSize - Minimum size in pixels (default: 48px)
 * @throws Error if any elements fail validation
 *
 * @example
 * ```typescript
 * // In Jest tests
 * test('all touch targets meet WCAG AAA', () => {
 *   const modal = render(<CommandPalette />);
 *   assertTouchTargetCompliance(modal.container);
 * });
 * ```
 */
export function assertTouchTargetCompliance(
  container: HTMLElement,
  minSize: number = TOUCH_TARGET_MIN
): void {
  const failing = validateAllTouchTargets(container, minSize);

  if (failing.length > 0) {
    const failureDetails = failing.map((el) => {
      const rect = el.getBoundingClientRect();
      return `${el.tagName} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`;
    });

    throw new Error(
      `Touch target validation failed: ${failing.length} element(s) below ${minSize}px minimum\n` +
        failureDetails.join('\n')
    );
  }
}
