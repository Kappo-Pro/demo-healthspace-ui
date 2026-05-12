/**
 * ProcessingStep Component
 *
 * Displays loading state while measurements are calculated.
 * Automatically triggers calculation on mount.
 *
 * @module organisms/OBodyMeasurementSDK/ProcessingStep
 * @since EPIC-001-S4
 */

import React, { useEffect } from 'react';
import { Spin } from 'antd';
import styled from 'styled-components';

export interface ProcessingStepProps {
	/** Is calculation in progress */
	isProcessing: boolean;

	/** Callback to trigger calculation */
	onCalculate: () => Promise<void>;
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	padding: var(--spacing-xl);
	background: var(--background-primary);
`;

const Title = styled.h2`
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	color: var(--text-color-root);
	margin: var(--spacing-xl) 0 var(--spacing-md) 0;
`;

const Description = styled.p`
	font-size: var(--font-size-md);
	color: var(--text-secondary);
	text-align: center;
	max-width: 400px;
	margin-bottom: var(--spacing-xl);
`;

const ProgressList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;
	text-align: left;

	li {
		padding: var(--spacing-sm) 0;
		color: var(--text-secondary);
		font-size: var(--font-size-sm);

		&:before {
			content: '✓ ';
			color: var(--success-500);
			font-weight: bold;
			margin-right: var(--spacing-xs);
		}
	}
`;

/**
 * Processing Step Component
 *
 * Shows loading state and automatically triggers measurement calculation.
 *
 * @param props - Component props
 */
export const ProcessingStep: React.FC<ProcessingStepProps> = ({ isProcessing, onCalculate }) => {
	// Trigger calculation on mount
	useEffect(() => {
		onCalculate();
	}, [onCalculate]);

	return (
		<Container data-testid="processing-step">
			<Spin size="large" />

			<Title>Processing Measurements</Title>

			<Description>Analyzing your poses and calculating body measurements...</Description>

			<ProgressList>
				<li>Front view captured</li>
				<li>Side view captured</li>
				<li>Back view captured</li>
				<li>Calculating 40+ measurements...</li>
			</ProgressList>
		</Container>
	);
};
