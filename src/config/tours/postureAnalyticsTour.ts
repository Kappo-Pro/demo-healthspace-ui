/**
 * Posture Analytics Tour Configuration
 * Story 2.5: Empty States with Contextual Guidance
 *
 * Defines tour steps for first-time users exploring posture analytics.
 * Uses react-joyride for tour implementation.
 */

import { Step } from 'react-joyride';

/**
 * Tour step configurations
 */
export const POSTURE_ANALYTICS_TOUR_STEPS: Step[] = [
	{
		target: '.posture-journey-view__timeline',
		content:
			'Track your posture improvement journey over time with this interactive timeline. Each milestone celebrates your progress!',
		placement: 'bottom',
		disableBeacon: true,
	},
	{
		target: '.posture-journey-view__header',
		content:
			'View your overall progress metrics including total assessments, average score, and improvement percentage.',
		placement: 'bottom',
	},
	{
		target: '.posture-journey-timeline__item:first-child',
		content:
			'Milestones mark important achievements like your first assessment, significant improvements, or status upgrades.',
		placement: 'right',
	},
	{
		target: '.progress-metrics',
		content:
			'Monitor your key performance indicators: total assessments, average posture score, score improvement, and adherence rate.',
		placement: 'top',
	},
	{
		target: '.posture-journey-view__encouragement',
		content:
			"We'll celebrate your progress with encouraging messages. Keep up the great work!",
		placement: 'top',
	},
];

/**
 * Tour configuration options
 */
export const POSTURE_ANALYTICS_TOUR_CONFIG = {
	continuous: true,
	showSkipButton: true,
	showProgress: true,
	spotlightClicks: false,
	disableOverlayClose: false,
	styles: {
		options: {
			primaryColor: 'var(--color-primary-600)',
			zIndex: 10000,
		},
		tooltip: {
			borderRadius: 'var(--radius-md)',
			fontSize: 'var(--font-size-base)',
		},
		buttonNext: {
			backgroundColor: 'var(--button-primary-bg)',
			borderRadius: 'var(--radius-md)',
			fontSize: 'var(--font-size-sm)',
		},
		buttonSkip: {
			color: 'var(--text-secondary)',
			fontSize: 'var(--font-size-sm)',
		},
	},
	locale: {
		back: 'Back',
		close: 'Close',
		last: 'Finish',
		next: 'Next',
		skip: 'Skip Tour',
	},
};

/**
 * Local storage key for tour completion
 */
export const TOUR_STORAGE_KEY = 'postureAnalyticsTourCompleted';

/**
 * Check if tour has been completed
 */
export function isTourCompleted(): boolean {
	try {
		return localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
	} catch {
		return false;
	}
}

/**
 * Mark tour as completed
 */
export function markTourCompleted(): void {
	try {
		localStorage.setItem(TOUR_STORAGE_KEY, 'true');
	} catch {
		// Silent fail if localStorage unavailable
	}
}

/**
 * Reset tour completion (for testing)
 */
export function resetTour(): void {
	try {
		localStorage.removeItem(TOUR_STORAGE_KEY);
	} catch {
		// Silent fail
	}
}
