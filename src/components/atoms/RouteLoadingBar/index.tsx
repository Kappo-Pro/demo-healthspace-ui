/**
 * RouteLoadingBar Component
 *
 * Displays a thin loading bar at the top of the page during route transitions.
 * Provides visual feedback that navigation is happening without hard refreshes.
 *
 * Features:
 * - Auto-starts on location change
 * - Smooth progress animation
 * - Auto-completes after navigation
 * - Minimal and unobtrusive
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './RouteLoadingBar.css';

export const RouteLoadingBar: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Start loading on location change
    setIsLoading(true);
    setProgress(20); // Start at 20%

    // Use requestAnimationFrame for smooth progress updates
    let rafId: number;
    const startTime = performance.now();
    const duration = 400; // Total duration in ms

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);

      // Ease-out curve for natural feeling
      const easedProgress = 20 + (80 * (1 - Math.pow(1 - progressPercent / 100, 3)));
      setProgress(easedProgress);

      if (elapsed < duration) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Complete and hide after animation
        setProgress(100);
        const hideTimer = setTimeout(() => {
          setIsLoading(false);
          setProgress(0);
        }, 200);

        return () => clearTimeout(hideTimer);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <div className="route-loading-bar">
      <div
        className="route-loading-bar-progress"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default RouteLoadingBar;
