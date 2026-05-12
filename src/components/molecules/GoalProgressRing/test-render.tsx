/**
 * Simple render test for GoalProgressRing component
 * This file can be used to manually verify the component renders without errors
 */

import React from 'react';
import { GoalProgressRing } from './GoalProgressRing';

export const TestRender: React.FC = () => {
	return (
		<div style={{ padding: 'var(--spacing-10)', display: 'flex', gap: 'var(--spacing-6)' }}>
			{/* Test different progress thresholds */}
			<GoalProgressRing title="Warning (35%)" progress={35} />
			<GoalProgressRing title="Primary (60%)" progress={60} />
			<GoalProgressRing title="Success (85%)" progress={85} />
			<GoalProgressRing title="Loading" progress={0} loading={true} />
		</div>
	);
};

export default TestRender;
