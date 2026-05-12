/**
 * MeasurementDetailPopup Component
 *
 * Displays detailed measurement information in a popup.
 * Shows value, confidence, body part, and measurement type.
 *
 * @module atoms/MeasurementDetailPopup
 * @since EPIC-001-S13
 */

import React from 'react';
import { Card, Statistic, Tag, Row, Col, Progress } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import type { MeasurementAnnotation } from '@organisms/OBodyModel3D/types/annotations';

/**
 * Measurement Detail Popup Props
 */
export interface MeasurementDetailPopupProps {
	/** Measurement annotation data */
	annotation: MeasurementAnnotation;

	/** Callback when popup is closed */
	onClose?: () => void;

	/** Position of popup (screen coordinates) */
	position?: { x: number; y: number };
}

const PopupContainer = styled.div<{ $x?: number; $y?: number }>`
	position: fixed;
	${props => (props.$x !== undefined ? `left: ${props.$x}px;` : '')}
	${props => (props.$y !== undefined ? `top: ${props.$y}px;` : '')}
	transform: translate(-50%, -100%) translateY(-16px);
	z-index: 1000;
	min-width: 300px;
	max-width: 400px;
	animation: fadeIn 0.2s ease;

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translate(-50%, -100%) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -100%) translateY(-16px);
		}
	}
`;

const StyledCard = styled(Card)`
	box-shadow: var(--shadow-lg);
	border: 1px solid var(--border-color);
	border-radius: var(--border-radius-lg);

	.ant-card-head {
		background: var(--background-secondary);
		border-bottom: 1px solid var(--border-color);
	}

	.ant-card-body {
		padding: var(--spacing-md);
	}
`;

const CloseButton = styled.button`
	position: absolute;
	top: var(--spacing-sm);
	right: var(--spacing-sm);
	background: transparent;
	border: none;
	cursor: pointer;
	color: var(--text-secondary);
	padding: var(--spacing-xs);
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		color: var(--text-color-root);
	}
`;

const DetailRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: var(--spacing-sm) 0;
	border-bottom: 1px solid var(--border-color);

	&:last-child {
		border-bottom: none;
	}
`;

const DetailLabel = styled.span`
	font-size: var(--font-size-sm);
	color: var(--text-secondary);
	font-weight: var(--font-weight-medium);
`;

const DetailValue = styled.span`
	font-size: var(--font-size-md);
	color: var(--text-color-root);
	font-weight: var(--font-weight-semibold);
`;

/**
 * Measurement Detail Popup Component
 *
 * Implements AC2: clickable measurement points show detail popups.
 *
 * @param props - Component props
 */
export const MeasurementDetailPopup: React.FC<MeasurementDetailPopupProps> = ({
	annotation,
	onClose,
	position,
}) => {
	const handleClose = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClose?.();
	};

	// Get confidence color
	const getConfidenceColor = (confidence: number) => {
		if (confidence >= 0.9) return 'success';
		if (confidence >= 0.7) return 'warning';
		return 'error';
	};

	// Get measurement type icon
	const getTypeIcon = (type: MeasurementAnnotation['type']) => {
		switch (type) {
			case 'segment':
				return 'ruler';
			case 'circumference':
				return 'circle';
			case 'ratio':
				return 'percent';
			case 'symmetry':
				return 'balance';
			default:
				return 'info';
		}
	};

	const confidencePercent = Math.round(annotation.confidence * 100);

	return (
		<PopupContainer $x={position?.x} $y={position?.y}>
			<StyledCard
				title={
					<>
						<UntitledIcon name={getTypeIcon(annotation.type)} size="small" />{' '}
						{annotation.label}
					</>
				}
			>
				<CloseButton onClick={handleClose} aria-label="Close popup">
					<UntitledIcon name="close" size="small" />
				</CloseButton>

				<Row gutter={[16, 16]}>
					<Col span={12}>
						<Statistic
							title="Measurement"
							value={annotation.value.toFixed(1)}
							suffix={annotation.unit}
							valueStyle={{ color: 'var(--brand-primary)', fontSize: 'var(--font-size-xl)' }}
						/>
					</Col>
					<Col span={12}>
						<Statistic
							title="Confidence"
							value={confidencePercent}
							suffix="%"
							valueStyle={{
								color: `var(--${getConfidenceColor(annotation.confidence)}-500)`,
								fontSize: 'var(--font-size-xl)',
							}}
						/>
					</Col>
				</Row>

				<div style={{ marginTop: 'var(--spacing-md)' }}>
					<DetailRow>
						<DetailLabel>Body Part</DetailLabel>
						<DetailValue>{annotation.bodyPart.replace(/-/g, ' ').toUpperCase()}</DetailValue>
					</DetailRow>

					<DetailRow>
						<DetailLabel>Type</DetailLabel>
						<Tag color="blue">{annotation.type.toUpperCase()}</Tag>
					</DetailRow>

					<DetailRow>
						<DetailLabel>Confidence Score</DetailLabel>
						<div style={{ flex: 1, marginLeft: 'var(--spacing-md)' }}>
							<Progress
								percent={confidencePercent}
								size="small"
								status={
									annotation.confidence >= 0.9
										? 'success'
										: annotation.confidence >= 0.7
											? 'normal'
											: 'exception'
								}
								showInfo={false}
							/>
						</div>
					</DetailRow>
				</div>
			</StyledCard>
		</PopupContainer>
	);
};

export default MeasurementDetailPopup;
