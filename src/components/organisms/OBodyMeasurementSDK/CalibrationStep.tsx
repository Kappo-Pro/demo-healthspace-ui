/**
 * CalibrationStep Component
 *
 * User height calibration and setup instructions.
 * First step in body measurement workflow.
 *
 * @module organisms/OBodyMeasurementSDK/CalibrationStep
 * @since EPIC-001-S4
 */

import React, { useState } from 'react';
import { InputNumber, Button, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import styled from 'styled-components';

export interface CalibrationStepProps {
	/** Callback when calibration complete */
	onComplete: (height: number) => void;
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: var(--spacing-xl);
	max-width: 600px;
	margin: 0 auto;
`;

const Title = styled.h2`
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	color: var(--text-color-root);
	margin-bottom: var(--spacing-md);
`;

const Description = styled.p`
	font-size: var(--font-size-md);
	color: var(--text-secondary);
	margin-bottom: var(--spacing-xl);
	text-align: center;
`;

const HeightInputContainer = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-md);
	margin-bottom: var(--spacing-xl);
`;

const InstructionsCard = styled.div`
	background: var(--background-secondary);
	border: 1px solid var(--border-color);
	border-radius: var(--border-radius-lg);
	padding: var(--spacing-lg);
	margin-bottom: var(--spacing-xl);
	width: 100%;
`;

const InstructionsTitle = styled.h3`
	font-size: var(--font-size-lg);
	font-weight: var(--font-weight-medium);
	color: var(--text-color-root);
	margin-bottom: var(--spacing-md);
`;

const InstructionsList = styled.ul`
	list-style: none;
	padding: 0;
	margin: 0;

	li {
		position: relative;
		padding-left: var(--spacing-lg);
		margin-bottom: var(--spacing-sm);
		color: var(--text-secondary);

		&:before {
			content: '•';
			position: absolute;
			left: 0;
			color: var(--brand-primary);
			font-weight: bold;
		}
	}
`;

/**
 * Calibration Step Component
 *
 * Collects user height and provides setup instructions.
 *
 * @param props - Component props
 */
export const CalibrationStep: React.FC<CalibrationStepProps> = ({ onComplete }) => {
	const [height, setHeight] = useState<number>(170);
	const [unit, setUnit] = useState<'cm' | 'in'>('cm');

	const handleUnitChange = (e: RadioChangeEvent) => {
		const newUnit = e.target.value as 'cm' | 'in';
		setUnit(newUnit);

		// Convert height to new unit
		if (newUnit === 'in' && unit === 'cm') {
			setHeight(Math.round(height / 2.54));
		} else if (newUnit === 'cm' && unit === 'in') {
			setHeight(Math.round(height * 2.54));
		}
	};

	const handleSubmit = () => {
		// Convert to cm if in inches
		const heightCm = unit === 'in' ? height * 2.54 : height;
		onComplete(heightCm);
	};

	const isValidHeight = () => {
		if (unit === 'cm') {
			return height >= 100 && height <= 250;
		} else {
			return height >= 40 && height <= 100;
		}
	};

	return (
		<Container data-testid="calibration-step">
			<Title>Calibration</Title>
			<Description>Enter your height for accurate measurements</Description>

			<HeightInputContainer>
				<InputNumber
					value={height}
					onChange={val => setHeight(val || (unit === 'cm' ? 170 : 67))}
					min={unit === 'cm' ? 100 : 40}
					max={unit === 'cm' ? 250 : 100}
					size="large"
					style={{ width: 150 }}
				/>

				<Radio.Group value={unit} onChange={handleUnitChange} size="large">
					<Radio.Button value="cm">cm</Radio.Button>
					<Radio.Button value="in">inches</Radio.Button>
				</Radio.Group>
			</HeightInputContainer>

			<InstructionsCard>
				<InstructionsTitle>Setup Instructions:</InstructionsTitle>
				<InstructionsList>
					<li>Place phone 6-8 feet (2-2.5m) away from you</li>
					<li>Ensure your full body is visible in the frame</li>
					<li>Stand in a well-lit area (avoid backlighting)</li>
					<li>Wear form-fitting clothing for accurate measurements</li>
					<li>Clear a space around you (3 feet / 1m on all sides)</li>
				</InstructionsList>
			</InstructionsCard>

			<Button
				type="primary"
				size="large"
				onClick={handleSubmit}
				disabled={!isValidHeight()}
				block
			>
				Start Measurement
			</Button>
		</Container>
	);
};
