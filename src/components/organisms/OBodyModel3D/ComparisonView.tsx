/**
 * ComparisonView Component
 *
 * Side-by-side before/after 3D body model comparison.
 * Displays measurement changes with color-coded indicators.
 *
 * @module organisms/OBodyModel3D
 * @since EPIC-001-S13
 */

import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Button, Tag } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import { BodyModel3D } from './BodyModel3D';
import type { ComparisonData, MeasurementChange } from './types/annotations';
import {
	getChangeColor,
	getChangeIcon,
	exportReportToJSON,
	generateComparisonReport,
} from './utils/annotationUtils';

/**
 * Comparison View Props
 */
export interface ComparisonViewProps {
	/** Comparison data with before/after measurements */
	comparison: ComparisonData;

	/** Optional user ID for export */
	userId?: string;

	/** Callback when comparison is closed */
	onClose?: () => void;
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
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const Title = styled.h2`
	font-size: var(--font-size-2xl);
	font-weight: var(--font-weight-semibold);
	color: var(--text-color-root);
	margin: 0;
`;

const Content = styled.div`
	flex: 1;
	overflow-y: auto;
	padding: var(--spacing-lg);
`;

const ModelContainer = styled.div`
	height: 400px;
	background: var(--background-secondary);
	border-radius: var(--border-radius-lg);
	border: 1px solid var(--border-color);
	margin-bottom: var(--spacing-md);
`;

const ModelLabel = styled.div`
	text-align: center;
	padding: var(--spacing-sm);
	background: var(--background-tertiary);
	border-top: 1px solid var(--border-color);
	font-size: var(--font-size-sm);
	font-weight: var(--font-weight-medium);
	color: var(--text-secondary);
`;

const ChangesCard = styled(Card)`
	margin-top: var(--spacing-lg);
`;

const ChangeRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: var(--spacing-sm) 0;
	border-bottom: 1px solid var(--border-color);

	&:last-child {
		border-bottom: none;
	}
`;

const ChangeLabel = styled.span`
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	flex: 1;
`;

const ChangeValue = styled.div<{ $color: string }>`
	display: flex;
	align-items: center;
	gap: var(--spacing-xs);
	font-size: var(--font-size-md);
	font-weight: var(--font-weight-semibold);
	color: ${props => props.$color};
`;

const ButtonGroup = styled.div`
	display: flex;
	gap: var(--spacing-sm);
`;

/**
 * Comparison View Component
 *
 * Implements AC3: before/after comparison mode (side-by-side 3D models).
 * Implements AC5: color coding for positive/negative changes.
 *
 * @param props - Component props
 */
export const ComparisonView: React.FC<ComparisonViewProps> = ({
	comparison,
	userId,
	onClose,
}) => {
	const [showAllChanges, setShowAllChanges] = useState(false);

	// Convert measurements to flat array for 3D model
	const beforeMeasurements = flattenMeasurements(comparison.before);
	const afterMeasurements = flattenMeasurements(comparison.after);

	// Get top changes (by percentage)
	const topChanges = [...comparison.changes]
		.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
		.slice(0, showAllChanges ? undefined : 5);

	const handleExport = () => {
		const report = generateComparisonReport(comparison, userId);
		exportReportToJSON(report, `comparison-${comparison.id}.json`);
	};

	return (
		<Container data-testid="comparison-view">
			<Header>
				<Title>
					<UntitledIcon name="compareArrows" size="large" /> Before & After Comparison
				</Title>
				<ButtonGroup>
					<Button icon={<UntitledIcon name="download" />} onClick={handleExport}>
						Export Report
					</Button>
					{onClose && (
						<Button icon={<UntitledIcon name="close" />} onClick={onClose}>
							Close
						</Button>
					)}
				</ButtonGroup>
			</Header>

			<Content>
				{/* Summary Statistics */}
				<Row gutter={16} style={{ marginBottom: 'var(--spacing-lg)' }}>
					<Col span={6}>
						<Card>
							<Statistic
								title="Time Period"
								value={comparison.daysBetween}
								suffix="days"
								prefix={<UntitledIcon name="calendar" />}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="Overall Change"
								value={comparison.overallChange.toFixed(1)}
								suffix="%"
								prefix={<UntitledIcon name="trending" />}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="Measurements"
								value={comparison.changes.length}
								prefix={<UntitledIcon name="ruler" />}
							/>
						</Card>
					</Col>
					<Col span={6}>
						<Card>
							<Statistic
								title="Improvements"
								value={comparison.changes.filter(c => c.isPositive).length}
								valueStyle={{ color: 'var(--success-500)' }}
								prefix={<UntitledIcon name="checkCircle" />}
							/>
						</Card>
					</Col>
				</Row>

				{/* Side-by-side 3D Models */}
				<Row gutter={16}>
					<Col span={12}>
						<ModelContainer>
							<BodyModel3D
								measurements={beforeMeasurements}
								enableControls={true}
								color="var(--gray-400)"
							/>
						</ModelContainer>
						<ModelLabel>
							BEFORE - {new Date(comparison.before.metadata.timestamp).toLocaleDateString()}
						</ModelLabel>
					</Col>

					<Col span={12}>
						<ModelContainer>
							<BodyModel3D
								measurements={afterMeasurements}
								enableControls={true}
								color="var(--brand-primary)"
							/>
						</ModelContainer>
						<ModelLabel>
							AFTER - {new Date(comparison.after.metadata.timestamp).toLocaleDateString()}
						</ModelLabel>
					</Col>
				</Row>

				{/* Measurement Changes */}
				<ChangesCard
					title={
						<>
							<UntitledIcon name="list" /> Measurement Changes
						</>
					}
				>
					{topChanges.map((change, index) => (
						<ChangeRow key={index}>
							<ChangeLabel>{change.label}</ChangeLabel>
							<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
								<span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
									{change.beforeValue.toFixed(1)} → {change.afterValue.toFixed(1)} {change.unit}
								</span>
								<ChangeValue $color={getChangeColor(change)}>
									<UntitledIcon name={getChangeIcon(change.direction)} size="small" />
									{Math.abs(change.percentChange).toFixed(1)}%
								</ChangeValue>
								{change.isPositive && (
									<Tag color="success">
										<UntitledIcon name="checkCircle" size="xsmall" /> Improvement
									</Tag>
								)}
							</div>
						</ChangeRow>
					))}

					{comparison.changes.length > 5 && !showAllChanges && (
						<div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
							<Button type="link" onClick={() => setShowAllChanges(true)}>
								Show All {comparison.changes.length} Changes
							</Button>
						</div>
					)}
				</ChangesCard>
			</Content>
		</Container>
	);
};

/**
 * Flatten measurement result to flat array
 *
 * @internal
 */
function flattenMeasurements(result: ComparisonData['before' | 'after']) {
	const flat: Array<{
		id: string;
		type: 'segment' | 'circumference' | 'ratio' | 'symmetry';
		label: string;
		value: number;
		unit: 'cm' | 'in' | 'ratio';
		confidence: number;
		landmarks?: string[];
	}> = [];

	result.measurements.segments.forEach(s => {
		flat.push({
			id: s.segment,
			type: 'segment',
			label: s.segment,
			value: s.lengthCm,
			unit: 'cm',
			confidence: s.confidence,
		});
	});

	result.measurements.circumferences.forEach(c => {
		flat.push({
			id: c.bodyPart,
			type: 'circumference',
			label: c.bodyPart,
			value: c.circumferenceCm,
			unit: 'cm',
			confidence: c.confidence,
		});
	});

	return flat;
}

export default ComparisonView;
