import React from 'react';
import { UntitledIcon } from '@atoms/Icon';
import type { AssessmentStatus, StatusBadgeConfig } from './types';

/**
 * Get badge configuration based on assessment status
 * @param status - Current assessment status
 * @returns Configuration object with text, color, and icon
 */
export const getStatusBadge = (status: AssessmentStatus): StatusBadgeConfig => {
	const config: Record<AssessmentStatus, StatusBadgeConfig> = {
		completed: {
			text: 'Completed',
			color: 'success',
			icon: <UntitledIcon name="checkCircle" size={14} />,
		},
		pending: {
			text: 'Pending',
			color: 'warning',
			icon: <UntitledIcon name="clock" size={14} />,
		},
		expired: {
			text: 'Expired',
			color: 'error',
			icon: <UntitledIcon name="exclamationCircle" size={14} />,
		},
	};
	return config[status];
};

/**
 * Get CTA button text based on assessment status
 * @param status - Current assessment status
 * @returns Button text (Start, Resume, or Retake)
 */
export const getCTAText = (status: AssessmentStatus): string => {
	if (status === 'completed') return 'Retake';
	if (status === 'pending') return 'Resume';
	return 'Start';
};
