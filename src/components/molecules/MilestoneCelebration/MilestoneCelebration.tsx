/**
 * MilestoneCelebration Molecule Component
 *
 * Displays celebration modal when patient achieves a milestone.
 * Features confetti animation, milestone badge, and congratulatory message.
 *
 * Features:
 * - Confetti animation using canvas-confetti
 * - Milestone badge with bounce animation
 * - Personalized congratulatory message
 * - Share button (clipboard copy)
 * - Dismiss button
 * - Respects prefers-reduced-motion
 * - Keyboard accessible (Escape to dismiss)
 * - Screen reader announcements
 *
 * @example
 * ```tsx
 * <MilestoneCelebration
 *   milestone={milestone}
 *   visible={true}
 *   onDismiss={() => handleDismiss(milestone.id)}
 * />
 * ```
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { Modal, Button, message } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import type { Milestone } from '@types/milestones';
import { MilestoneBadge } from '@atoms/MilestoneBadge';
import './MilestoneCelebration.css';

export interface MilestoneCelebrationProps {
	/** Milestone being celebrated */
	milestone: Milestone;

	/** Modal visibility */
	visible: boolean;

	/** Dismiss handler */
	onDismiss: () => void;

	/** Share handler (optional - defaults to clipboard) */
	onShare?: () => void;
}

/**
 * Congratulatory messages by milestone type
 */
const CELEBRATION_MESSAGES: Record<string, { title: string; message: string }> =
	{
		first_scan: {
			title: 'Amazing Start!',
			message:
				"You've completed your first posture scan! This is the beginning of your journey to better health.",
		},
		one_week_consistency: {
			title: 'One Week Strong!',
			message:
				"You've maintained consistency for a full week! Your dedication is paying off.",
		},
		one_month_consistency: {
			title: 'Monthly Champion!',
			message:
				"A full month of consistency! You're building powerful habits that will last.",
		},
		first_improvement: {
			title: 'Progress Made!',
			message:
				'Your posture score has improved significantly! Keep up the excellent work.',
		},
		exercise_streak_7: {
			title: 'Week Warrior!',
			message:
				"Seven days of exercises complete! You're building a solid routine.",
		},
		exercise_streak_14: {
			title: 'Two Week Champion!',
			message: 'Two weeks of daily exercises! Your commitment is inspiring.',
		},
		exercise_streak_30: {
			title: 'Monthly Legend!',
			message: "30 days straight! You've achieved something truly remarkable.",
		},
	};

/**
 * Confetti colors by badge color (using design system tokens)
 */
const CONFETTI_COLORS: Record<string, string[]> = {
	gold: [
		'var(--color-warning-400)',
		'var(--color-warning-300)',
		'var(--color-warning-600)',
	],
	silver: [
		'var(--color-gray-400)',
		'var(--color-gray-200)',
		'var(--color-gray-500)',
	],
	bronze: [
		'var(--color-orange-600)',
		'var(--color-orange-400)',
		'var(--color-orange-700)',
	],
	blue: [
		'var(--color-info-500)',
		'var(--color-info-300)',
		'var(--color-info-700)',
	],
	green: [
		'var(--color-success-600)',
		'var(--color-success-400)',
		'var(--color-success-700)',
	],
};

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
	milestone,
	visible,
	onDismiss,
	onShare,
}) => {
	const hasTriggeredConfetti = useRef(false);

	// Get celebration messages
	const celebrationContent =
		CELEBRATION_MESSAGES[milestone.type] || CELEBRATION_MESSAGES.first_scan;

	/**
	 * Trigger confetti animation
	 */
	const triggerConfetti = useCallback(() => {
		const colors =
			CONFETTI_COLORS[milestone.badgeColor] || CONFETTI_COLORS.gold;

		// Burst 1: Center explosion
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors,
		});

		// Burst 2: Left side
		setTimeout(() => {
			confetti({
				particleCount: 50,
				angle: 60,
				spread: 55,
				origin: { x: 0, y: 0.6 },
				colors,
			});
		}, 200);

		// Burst 3: Right side
		setTimeout(() => {
			confetti({
				particleCount: 50,
				angle: 120,
				spread: 55,
				origin: { x: 1, y: 0.6 },
				colors,
			});
		}, 400);
	}, [milestone.badgeColor]);

	// Trigger confetti animation on mount
	useEffect(() => {
		if (visible && !hasTriggeredConfetti.current) {
			const prefersReducedMotion = window.matchMedia(
				'(prefers-reduced-motion: reduce)',
			).matches;

			if (!prefersReducedMotion) {
				triggerConfetti();
			}

			hasTriggeredConfetti.current = true;
		}

		// Reset when modal closes
		if (!visible) {
			hasTriggeredConfetti.current = false;
		}
	}, [visible, triggerConfetti]);

	/**
	 * Handle share action (copy to clipboard)
	 */
	const handleShare = () => {
		if (onShare) {
			onShare();
		} else {
			// Default: copy milestone text to clipboard
			const shareText = `🎉 I just achieved a milestone: ${milestone.name}!\n\n${milestone.description}\n\nAchieved on ${new Date(milestone.dateAchieved).toLocaleDateString()}`;

			navigator.clipboard
				.writeText(shareText)
				.then(() => {
					message.success({
						content: 'Milestone copied to clipboard!',
						duration: 3,
						icon: <UntitledIcon name="check" size={16} />,
					});
				})
				.catch(() => {
					message.error('Failed to copy to clipboard');
				});
		}
	};

	return (
		<Modal
			open={visible}
			onCancel={onDismiss}
			footer={null}
			centered
			width={480}
			className="milestone-celebration-modal"
			closable={false}
			keyboard={true} // Escape key dismisses
			aria-labelledby="milestone-celebration-title"
			aria-describedby="milestone-celebration-description">
			{/* Screen reader announcement */}
			<div
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className="sr-only">
				Congratulations! You achieved a milestone: {milestone.name}.{' '}
				{milestone.description}
			</div>

			<div className="milestone-celebration">
				{/* Badge with bounce animation */}
				<motion.div
					initial={{ scale: 0, rotate: -180 }}
					animate={{ scale: 1, rotate: 0 }}
					transition={{
						type: 'spring',
						stiffness: 200,
						damping: 15,
						duration: 0.6,
					}}
					className="milestone-celebration__badge-wrapper">
					<MilestoneBadge
						milestone={milestone}
						size="large"
						showTooltip={false}
					/>
				</motion.div>

				{/* Celebration Title */}
				<motion.h2
					id="milestone-celebration-title"
					className="milestone-celebration__title"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.4 }}>
					{celebrationContent.title}
				</motion.h2>

				{/* Milestone Name */}
				<motion.p
					className="milestone-celebration__milestone-name"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.4 }}>
					{milestone.name}
				</motion.p>

				{/* Celebration Message */}
				<motion.p
					id="milestone-celebration-description"
					className="milestone-celebration__message"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.4 }}>
					{celebrationContent.message}
				</motion.p>

				{/* Achievement Date */}
				<motion.p
					className="milestone-celebration__date"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6, duration: 0.4 }}>
					Achieved on{' '}
					{new Date(milestone.dateAchieved).toLocaleDateString('en-US', {
						month: 'long',
						day: 'numeric',
						year: 'numeric',
					})}
				</motion.p>

				{/* Action Buttons */}
				<motion.div
					className="milestone-celebration__actions"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7, duration: 0.4 }}>
					<Button
						type="default"
						icon={<UntitledIcon name="share" size={16} />}
						onClick={handleShare}
						size="large">
						Share
					</Button>
					<Button type="primary" onClick={onDismiss} size="large">
						Continue
					</Button>
				</motion.div>
			</div>
		</Modal>
	);
};

export default MilestoneCelebration;
