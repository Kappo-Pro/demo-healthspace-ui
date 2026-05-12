/**
 * ResultsStep Component
 *
 * Displays body measurement results with detailed breakdown.
 * Shows segments, circumferences, ratios, and symmetry.
 *
 * @module organisms/OBodyMeasurementSDK/ResultsStep
 * @since EPIC-001-S4
 */

import React, { useState, useMemo } from 'react';
import { Button, Tabs, Card, Statistic, Row, Col, Tag } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import type { BodyMeasurementResult } from '@utils/bodyMeasurement';
import { BodyModel3D } from '@organisms/OBodyModel3D';

export interface ResultsStepProps {
	/** Measurement result */
	result: BodyMeasurementResult;

	/** Callback to reset and start over */
	onReset: () => void;
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: var(--background-primary);
`;

const Header = styled.div`
	padding: var(--spacing-lg);
	background: var(--background-secondary);
	border-bottom: 1px solid var(--border-color);
	text-align: center;
`;

const Title = styled.h2`
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	color: var(--text-color-root);
	margin: 0 0 var(--spacing-sm) 0;
`;

const Subtitle = styled.p`
	font-size: var(--font-size-md);
	color: var(--text-secondary);
	margin: 0;
`;

const Content = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: var(--spacing-lg);
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);

	@media (min-width: 1024px) {
		flex-direction: row;
	}
`;

const ModelPanel = styled.div`
	flex: 1;
	min-height: 400px;
	background: var(--background-secondary);
	border-radius: var(--border-radius-lg);
	overflow: hidden;

	@media (min-width: 1024px) {
		flex: 0 0 60%;
		min-height: 600px;
	}
`;

const DataPanel = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: var(--spacing-lg);

	@media (min-width: 1024px) {
		flex: 0 0 40%;
		overflow-y: auto;
	}
`;

const SummaryCards = styled.div`
	margin-bottom: var(--spacing-lg);
`;

const MeasurementCard = styled(Card)`
	margin-bottom: var(--spacing-md);
`;

const MeasurementRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: var(--spacing-sm) 0;
	border-bottom: 1px solid var(--border-color);

	&:last-child {
		border-bottom: none;
	}
`;

const MeasurementLabel = styled.span`
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
`;

const MeasurementValue = styled.span`
	font-size: var(--font-size-md);
	font-weight: var(--font-weight-medium);
	color: var(--text-color-root);
`;

const Footer = styled.div`
	padding: var(--spacing-lg);
	background: var(--background-secondary);
	border-top: 1px solid var(--border-color);
`;

/**
 * Results Step Component
 *
 * Displays comprehensive measurement results.
 *
 * @param props - Component props
 */
export const ResultsStep: React.FC<ResultsStepProps> = ({ result, onReset }) => {
	const [activeTab, setActiveTab] = useState('summary');

	const { measurements, calibration, metadata, qualityFlags } = result;

	// Format measurement value
	const formatValue = (value: number, unit: string) => {
		return `${value.toFixed(1)} ${unit}`;
	};

	// Get confidence color
	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 0.9) return 'success';
		if (confidence >= 0.7) return 'warning';
		return 'error';
	};

	// Convert measurements to flat format for BodyModel3D
	const flatMeasurements = useMemo(() => {
		const flat: Array<{
			id: string;
			type: 'segment' | 'circumference' | 'ratio' | 'symmetry';
			label: string;
			value: number;
			unit: 'cm' | 'in' | 'ratio';
			confidence: number;
			landmarks?: string[];
		}> = [];

		// Add segments
		measurements.segments.forEach(seg => {
			flat.push({
				id: seg.segment.toLowerCase().replace(/\s+/g, '-'),
				type: 'segment',
				label: seg.segment,
				value: seg.lengthCm,
				unit: 'cm',
				confidence: seg.confidence,
			});
		});

		// Add circumferences
		measurements.circumferences.forEach(circ => {
			flat.push({
				id: circ.bodyPart.toLowerCase().replace(/\s+/g, '-') + '-circumference',
				type: 'circumference',
				label: circ.bodyPart,
				value: circ.circumferenceCm,
				unit: 'cm',
				confidence: circ.confidence,
			});
		});

		return flat;
	}, [measurements]);

	return (
		<Container data-testid="results-step">
			<Header>
				<Title>
					<UntitledIcon name="checkCircle" size="large" /> Measurement Complete
				</Title>
				<Subtitle>{metadata.totalMeasurements} measurements calculated</Subtitle>
			</Header>

			<Content>
				{/* 3D Model Visualization Panel */}
				<ModelPanel>
					<BodyModel3D
						measurements={flatMeasurements}
						showPerformance={false}
						enableControls={true}
						color="var(--brand-primary)"
					/>
				</ModelPanel>

				{/* Measurement Data Panel */}
				<DataPanel>
					<SummaryCards>
						<Row gutter={16}>
							<Col span={8}>
								<Card>
									<Statistic
										title="Processing Time"
										value={metadata.processingTime}
										suffix="ms"
									/>
								</Card>
							</Col>
							<Col span={8}>
								<Card>
									<Statistic
										title="Avg Confidence"
										value={Math.round(metadata.averageConfidence * 100)}
										suffix="%"
									/>
								</Card>
							</Col>
							<Col span={8}>
								<Card>
									<Statistic
										title="Symmetry Score"
										value={metadata.symmetryScore}
										suffix="/100"
									/>
								</Card>
							</Col>
						</Row>
					</SummaryCards>

					<Tabs activeKey={activeTab} onChange={setActiveTab}>
					<Tabs.TabPane tab="Segments" key="segments">
						<MeasurementCard title="Length Measurements">
							{measurements.segments.map((seg, index) => (
								<MeasurementRow key={index}>
									<MeasurementLabel>{seg.segment}</MeasurementLabel>
									<div>
										<MeasurementValue>{formatValue(seg.lengthCm, 'cm')}</MeasurementValue>
										<Tag
											color={getConfidenceColor(seg.confidence)}
											style={{ marginLeft: 8 }}
										>
											{Math.round(seg.confidence * 100)}%
										</Tag>
									</div>
								</MeasurementRow>
							))}
						</MeasurementCard>
					</Tabs.TabPane>

					<Tabs.TabPane tab="Circumferences" key="circumferences">
						<MeasurementCard title="Circumference Measurements">
							{measurements.circumferences.map((circ, index) => (
								<MeasurementRow key={index}>
									<MeasurementLabel>{circ.bodyPart}</MeasurementLabel>
									<div>
										<MeasurementValue>
											{formatValue(circ.circumferenceCm, 'cm')}
										</MeasurementValue>
										<Tag
											color={getConfidenceColor(circ.confidence)}
											style={{ marginLeft: 8 }}
										>
											{Math.round(circ.confidence * 100)}%
										</Tag>
									</div>
								</MeasurementRow>
							))}
						</MeasurementCard>
					</Tabs.TabPane>

					<Tabs.TabPane tab="Ratios" key="ratios">
						<MeasurementCard title="Body Ratios">
							{measurements.ratios.map((ratio, index) => (
								<MeasurementRow key={index}>
									<MeasurementLabel>{ratio.id}</MeasurementLabel>
									<div>
										<MeasurementValue>{formatValue(ratio.value, '')}</MeasurementValue>
										<Tag
											color={getConfidenceColor(ratio.confidence)}
											style={{ marginLeft: 8 }}
										>
											{Math.round(ratio.confidence * 100)}%
										</Tag>
									</div>
								</MeasurementRow>
							))}
						</MeasurementCard>
					</Tabs.TabPane>

					<Tabs.TabPane tab="Symmetry" key="symmetry">
						<MeasurementCard title="Symmetry Analysis">
							{measurements.symmetry.map((sym, index) => (
								<MeasurementRow key={index}>
									<MeasurementLabel>{sym.id}</MeasurementLabel>
									<div>
										<MeasurementValue>
											{formatValue(sym.percentDiff, '%')}
										</MeasurementValue>
										<Tag
											color={getConfidenceColor(sym.confidence)}
											style={{ marginLeft: 8 }}
										>
											{Math.round(sym.confidence * 100)}%
										</Tag>
									</div>
								</MeasurementRow>
							))}
						</MeasurementCard>
					</Tabs.TabPane>

					<Tabs.TabPane tab="Quality" key="quality">
						<MeasurementCard title="Quality Assessment">
							<MeasurementRow>
								<MeasurementLabel>Calibration Valid</MeasurementLabel>
								<Tag color={qualityFlags.calibrationValid ? 'success' : 'error'}>
									{qualityFlags.calibrationValid ? 'Yes' : 'No'}
								</Tag>
							</MeasurementRow>

							<MeasurementRow>
								<MeasurementLabel>All Landmarks Visible</MeasurementLabel>
								<Tag color={qualityFlags.allLandmarksVisible ? 'success' : 'warning'}>
									{qualityFlags.allLandmarksVisible ? 'Yes' : 'No'}
								</Tag>
							</MeasurementRow>

							<MeasurementRow>
								<MeasurementLabel>Low Confidence Count</MeasurementLabel>
								<MeasurementValue>{qualityFlags.lowConfidenceCount}</MeasurementValue>
							</MeasurementRow>

							<MeasurementRow>
								<MeasurementLabel>Calibration Confidence</MeasurementLabel>
								<MeasurementValue>
									{Math.round(calibration.confidence * 100)}%
								</MeasurementValue>
							</MeasurementRow>
						</MeasurementCard>
					</Tabs.TabPane>
				</Tabs>
				</DataPanel>
			</Content>

			<Footer>
				<Button type="primary" size="large" onClick={onReset} block>
					Start New Measurement
				</Button>
			</Footer>
		</Container>
	);
};
