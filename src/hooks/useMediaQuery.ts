/**
 * useMediaQuery Hook
 * Story 4.5: Custom hook for responsive design media query detection
 *
 * Provides real-time boolean state for CSS media query matching
 * Useful for conditional rendering based on viewport size
 */

import { useState, useEffect } from 'react';

/**
 * useMediaQuery - Hook to detect if a media query matches current viewport
 *
 * @param query - CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if query matches
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with current match state (SSR-safe)
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // Skip if SSR or matchMedia not available
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    // Create MediaQueryList object
    const mediaQuery = window.matchMedia(query);

    // Handler for media query change events
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add listener (modern API)
    mediaQuery.addEventListener('change', handleChange);

    // Set initial value (in case it changed between render and effect)
    setMatches(mediaQuery.matches);

    // Cleanup listener on unmount or query change
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
