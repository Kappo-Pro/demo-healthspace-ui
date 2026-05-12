/**
 * BodyMeasurementSDK Component
 *
 * Main component for body measurement SDK.
 * Orchestrates calibration, multi-view capture, and measurement calculation.
 *
 * @module organisms/OBodyMeasurementSDK
 * @since EPIC-001-S4
 */

import React from 'react';
import styled from 'styled-components';
import { useBodyMeasurement } from '@hooks/useBodyMeasurement';
import { CalibrationStep } from './CalibrationStep';
import { CaptureStep } from './CaptureStep';
import { ProcessingStep } from './ProcessingStep';
import { ResultsStep } from './ResultsStep';

export interface BodyMeasurementSDKProps {
	/** Callback when measurement complete */
	onComplete?: (result: unknown) => void;

	/** Callback when error occurs */
	onError?: (error: Error) => void;
}

const Container = styled.div`
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background: var(--background-primary);
`;

/**
 * Body Measurement SDK Component
 *
 * Main workflow orchestrator for body measurement.
 * Manages state transitions through calibration → capture → processing → results.
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <BodyMeasurementSDK
 *   onComplete={(result) => }
 *   onError={(error) => console.error('Error:', error)}
 * />
 * ```
 */
export const BodyMeasurementSDK: React.FC<BodyMeasurementSDKProps> = ({ onComplete, onError }) => {
	const {
		currentStep,
		userHeight,
		capturedPoses,
		measurementResult,
		isProcessing,
		error,
		completeCalibration,
		capturePose,
		calculateMeasurements,
		reset,
	} = useBodyMeasurement();

	// Handle errors
	React.useEffect(() => {
		if (error && onError) {
			onError(new Error(error));
		}
	}, [error, onError]);

	// Handle completion
	React.useEffect(() => {
		if (currentStep === 'complete' && measurementResult && onComplete) {
			onComplete(measurementResult);
		}
	}, [currentStep, measurementResult, onComplete]);

	// Render current step
	const renderStep = () => {
		switch (currentStep) {
			case 'calibration':
				return <CalibrationStep onComplete={completeCalibration} />;

			case 'capture-front':
				return (
					<CaptureStep
						view="front"
						userHeight={userHeight!}
						onCapture={(view, landmarks, worldLandmarks) =>
							capturePose(view, landmarks, worldLandmarks)
						}
					/>
				);

			case 'capture-side':
				return (
					<CaptureStep
						view="side"
						userHeight={userHeight!}
						onCapture={(view, landmarks, worldLandmarks) =>
							capturePose(view, landmarks, worldLandmarks)
						}
					/>
				);

			case 'capture-back':
				return (
					<CaptureStep
						view="back"
						userHeight={userHeight!}
						onCapture={(view, landmarks, worldLandmarks) =>
							capturePose(view, landmarks, worldLandmarks)
						}
					/>
				);

			case 'processing':
				return (
					<ProcessingStep
						isProcessing={isProcessing}
						onCalculate={calculateMeasurements}
					/>
				);

			case 'complete':
				return measurementResult ? (
					<ResultsStep result={measurementResult} onReset={reset} />
				) : null;

			default:
				return null;
		}
	};

	return <Container data-testid="body-measurement-sdk">{renderStep()}</Container>;
};
