/**
 * Performance Measurement Utility for Modal Loading
 *
 * Measures and tracks modal load performance using Performance API
 *
 * @module
 * @version 1.0.0
 * @story Story 3.1 - Code Splitting (AC-3.1.5)
 */

/**
 * Window interface extension for gtag (Google Analytics)
 */
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: {
        name: string;
        value: number;
        event_category: string;
      },
    ) => void;
  }
}

/**
 * measureModalLoad - Measure modal load time
 *
 * Uses Performance.now() to accurately measure time from modal trigger
 * to modal fully loaded. Logs to console and Google Analytics if available.
 *
 * @returns Object with `end()` method to complete measurement
 *
 * @example
 * ```tsx
 * const measurement = measureModalLoad();
 * setIsModalOpen(true);
 * // ... modal loads ...
 * setTimeout(() => {
 *   const loadTime = measurement.end();
 *    * }, 0);
 * ```
 */
export const measureModalLoad = () => {
  const startTime = performance.now();

  return {
    /**
     * End measurement and log results
     * @returns Load time in milliseconds
     */
    end: (): number => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Log to console (development)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
      }

      // Log to Google Analytics (if available)
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: 'modal_load',
          value: Math.round(loadTime),
          event_category: 'Performance',
        });
      }

      // Return load time for further processing
      return loadTime;
    },
  };
};

/**
 * measureTabSwitch - Measure tab switch time
 *
 * Uses Performance.now() to measure time from tab click to content displayed
 *
 * @param tabName - Name of the tab being loaded
 * @returns Object with `end()` method to complete measurement
 *
 * @example
 * ```tsx
 * const measurement = measureTabSwitch('pain-assessment');
 * setActiveTab('pain');
 * // ... tab loads ...
 * setTimeout(() => {
 *   const switchTime = measurement.end();
 *    * }, 0);
 * ```
 */
export const measureTabSwitch = (tabName: string) => {
  const startTime = performance.now();

  return {
    /**
     * End measurement and log results
     * @returns Switch time in milliseconds
     */
    end: (): number => {
      const endTime = performance.now();
      const switchTime = endTime - startTime;

      // Log to console (development)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
      }

      // Log to Google Analytics (if available)
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: 'tab_switch',
          value: Math.round(switchTime),
          event_category: 'Performance',
        });
      }

      // Return switch time for further processing
      return switchTime;
    },
  };
};
