/**
 * useBreakpoint Hook
 *
 * Provides responsive breakpoint detection for the layout system.
 * Returns the current breakpoint and helper functions.
 */

import { useState, useEffect } from 'react';
import { Breakpoint } from '../components/layouts/AppLayout/types';
import { BREAKPOINTS } from '../components/layouts/AppLayout/constants';

interface UseBreakpointReturn {
  /** Current breakpoint */
  breakpoint: Breakpoint;

  /** Window width */
  width: number;

  /** Is mobile viewport (< 768px) */
  isMobile: boolean;

  /** Is tablet viewport (768px - 1024px) */
  isTablet: boolean;

  /** Is desktop viewport (>= 1024px) */
  isDesktop: boolean;

  /** Check if current breakpoint is at least the given breakpoint */
  isAtLeast: (bp: Breakpoint) => boolean;

  /** Check if current breakpoint is at most the given breakpoint */
  isAtMost: (bp: Breakpoint) => boolean;
}

/**
 * Get the current breakpoint based on window width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
}

/**
 * Compare breakpoints
 */
function compareBreakpoints(a: Breakpoint, b: Breakpoint): number {
  const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  return order.indexOf(a) - order.indexOf(b);
}

/**
 * useBreakpoint hook
 */
export function useBreakpoint(): UseBreakpointReturn {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    // Handle SSR
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events for performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const breakpoint = getBreakpoint(width);
  const isMobile = width < BREAKPOINTS.md;
  const isTablet = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isDesktop = width >= BREAKPOINTS.lg;

  const isAtLeast = (bp: Breakpoint) => compareBreakpoints(breakpoint, bp) >= 0;
  const isAtMost = (bp: Breakpoint) => compareBreakpoints(breakpoint, bp) <= 0;

  return {
    breakpoint,
    width,
    isMobile,
    isTablet,
    isDesktop,
    isAtLeast,
    isAtMost,
  };
}
