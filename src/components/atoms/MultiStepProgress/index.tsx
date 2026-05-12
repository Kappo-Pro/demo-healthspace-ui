/**
 * MultiStepProgress Component
 *
 * A reusable multi-step progress indicator built on Ant Design Steps.
 * Displays progress through a multi-stage process like onboarding,
 * wizards, or bulk uploads.
 *
 * @example
 * ```tsx
 * <MultiStepProgress
 *   current={2}
 *   steps={[
 *     { title: 'Profile', description: 'Basic information' },
 *     { title: 'Medical History', description: 'Health details' },
 *     { title: 'Assessment', description: 'Pain levels' },
 // TODO: Consider using set ?? defaultValue or set?.property instead of set!
 *     { title: 'Complete', description: 'All set!' },
 *   ]}
 * />
 * ```
 */

import React from 'react';
import { Steps } from 'antd';
import type { StepsProps } from 'antd';

export interface MultiStepProgressProps {
	/** Current step index (0-based) */
	current: number;

	/** Steps configuration */
	steps: Array<{
		/** Step title */
		title: string;
		/** Optional step description */
		description?: string;
		/** Optional custom icon */
		icon?: React.ReactNode;
		/** Optional status override */
		status?: 'wait' | 'process' | 'finish' | 'error';
	}>;

	/** Size of steps */
	size?: 'default' | 'small';

	/** Direction of steps */
	direction?: 'horizontal' | 'vertical';

	/** Custom class name */
	className?: string;

	/** Optional onChange handler when step is clicked */
	onChange?: (current: number) => void;

	/** Whether steps are clickable */
	clickable?: boolean;
}

/**
 * Multi-Step Progress Component
 *
 * Displays a multi-step progress indicator using Ant Design Steps.
 * Useful for onboarding flows, wizards, and multi-stage processes.
 */
export const MultiStepProgress: React.FC<MultiStepProgressProps> = ({
	current,
	steps,
	size = 'default',
	direction = 'horizontal',
	className,
	onChange,
	clickable = false,
}) => {
	const items: StepsProps['items'] = steps.map((step, _index) => ({
		title: step.title,
		description: step.description,
		icon: step.icon,
		status: step.status,
	}));

	return (
		<Steps
			current={current}
			items={items}
			size={size}
			direction={direction}
			className={className}
			onChange={clickable ? onChange : undefined}
		/>
	);
};

export default MultiStepProgress;
