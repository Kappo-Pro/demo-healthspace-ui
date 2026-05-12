/**
 * useMilestoneCelebration Hook
 *
 * Manages milestone celebration display and dismissal.
 * Automatically shows celebration modal when new milestones are earned.
 *
 * Features:
 * - Tracks undismissed milestones
 * - Shows celebration modal automatically
 * - Handles dismissal and localStorage persistence
 * - Triggers milestone evaluation on mount/actions
 * - Shows toast notifications for new milestones
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { celebrationModal, checkForMilestones } = useMilestoneCelebration();
 *
 *   // Check after action
 *   const handleActionComplete = async () => {
 *     await doAction();
 *     checkForMilestones();
 *   };
 *
 *   return (
 *     <>
 *       {celebrationModal}
 *       <button onClick={handleActionComplete}>Complete Action</button>
 *     </>
 *   );
 * }
 * ```
 */

import React, { useEffect, useState, useCallback } from 'react';
import { message } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	checkMilestones,
	dismissMilestoneCelebration} from '@stores/posture/postures/postures';
import { selectUndismissedMilestones } from '@stores/posture/postures/selectors';
import { MilestoneCelebration } from '@molecules/MilestoneCelebration';
import type { Milestone } from '@types/milestones';

export interface UseMilestoneCelebrationOptions {
	/** Check milestones on mount */
	checkOnMount?: boolean;

	/** Show toast notifications for new milestones */
	showToastNotifications?: boolean;

	/** User ID for milestone evaluation */
	userId?: string;
}

export interface UseMilestoneCelebrationReturn {
	/** Celebration modal React element (render in your component) */
	celebrationModal: React.ReactElement | null;

	/** Manually trigger milestone check */
	checkForMilestones: () => Promise<void>;

	/** Currently celebrating milestone */
	celebratingMilestone: Milestone | null;

	/** Loading state */
	loading: boolean;
}

/**
 * Hook for managing milestone celebrations
 */
export const useMilestoneCelebration = (
	options: UseMilestoneCelebrationOptions = {},
): UseMilestoneCelebrationReturn => {
	const {
		checkOnMount = true,
		showToastNotifications = true,
		userId,
	} = options;

	const dispatch = useTypedDispatch();
	const undismissedMilestones = useTypedSelector(selectUndismissedMilestones);
	const milestoneLoading = useTypedSelector(
		state => state.postures.postures.milestones.loading,
	);

	const [celebratingMilestone, setCelebratingMilestone] =
		useState<Milestone | null>(null);
	const [hasShownToast, setHasShownToast] = useState(false);

	/**
	 * Check for new milestones
	 */
	const checkForMilestones = useCallback(async () => {
		if (userId) {
			await dispatch(checkMilestones({ userId })).unwrap();
		}
	}, [dispatch, userId]);

	/**
	 * Check milestones on mount
	 */
	useEffect(() => {
		if (checkOnMount && userId) {
			checkForMilestones();
		}
	}, [checkOnMount, userId, checkForMilestones]);

	/**
	 * Show celebration when new milestones appear
	 */
	useEffect(() => {
		if (undismissedMilestones.length > 0 && !celebratingMilestone) {
			const nextMilestone = undismissedMilestones[0];
			setCelebratingMilestone(nextMilestone);

			// Show toast notification
			if (showToastNotifications && !hasShownToast) {
				message.success({
					content: `🎉 Milestone achieved: ${nextMilestone.name}!`,
					duration: 5,
					icon: React.createElement(UntitledIcon, { name: 'trophy' }),
				});
				setHasShownToast(true);
			}
		}

		// Reset toast flag when no milestones
		if (undismissedMilestones.length === 0) {
			setHasShownToast(false);
		}
	}, [
		undismissedMilestones,
		celebratingMilestone,
		showToastNotifications,
		hasShownToast,
	]);

	/**
	 * Handle celebration dismissal
	 */
	const handleDismiss = useCallback(() => {
		if (celebratingMilestone) {
			dispatch(dismissMilestoneCelebration(celebratingMilestone.id));
			setCelebratingMilestone(null);

			// If more undismissed milestones exist, show next one after delay
			setTimeout(() => {
				const remaining = undismissedMilestones.filter(
					m => m.id !== celebratingMilestone.id,
				);
				if (remaining.length > 0) {
					setCelebratingMilestone(remaining[0]);
				}
			}, 500);
		}
	}, [celebratingMilestone, dispatch, undismissedMilestones]);

	// Create celebration modal element
	const celebrationModal = celebratingMilestone ? (
		<MilestoneCelebration
			milestone={celebratingMilestone}
			visible={!!celebratingMilestone}
			onDismiss={handleDismiss}
		/>
	) : null;

	return {
		celebrationModal,
		checkForMilestones,
		celebratingMilestone,
		loading: milestoneLoading,
	};
};

export default useMilestoneCelebration;
