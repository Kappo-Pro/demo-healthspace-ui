/**
 * MeasurementLabel Component
 *
 * Clickable measurement label that overlays 3D body model.
 * Renders in screen space (HTML) using Three.js world-to-screen projection.
 *
 * @module molecules/MeasurementLabel
 * @since EPIC-001-S13
 */

import React, { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import styled from 'styled-components';
import { Badge } from 'antd';
import type { MeasurementAnnotation } from '@organisms/OBodyModel3D/types/annotations';

/**
 * Measurement Label Props
 */
export interface MeasurementLabelProps {
	/** Measurement annotation data */
	annotation: MeasurementAnnotation;

	/** Callback when label is clicked */
	onClick?: (annotation: MeasurementAnnotation) => void;

	/** Whether this label is selected */
	selected?: boolean;

	/** Optional color override (CSS custom property) */
	color?: string;
}

const LabelContainer = styled.div<{ $x: number; $y: number; $selected: boolean }>`
	position: absolute;
	left: ${props => props.$x}px;
	top: ${props => props.$y}px;
	transform: translate(-50%, -50%);
	cursor: pointer;
	user-select: none;
	transition: all 0.2s ease;
	z-index: 10;

	&:hover {
		transform: translate(-50%, -50%) scale(1.1);
	}

	${props =>
		props.$selected &&
		`
    transform: translate(-50%, -50%) scale(1.2);
    z-index: 20;
  `}
`;

const LabelBadge = styled(Badge)<{ $confidence: number }>`
	.ant-badge-count {
		background: ${props => {
			if (props.$confidence >= 0.9) return 'var(--success-500)';
			if (props.$confidence >= 0.7) return 'var(--warning-500)';
			return 'var(--error-500)';
		}};
		color: var(--text-on-color);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		padding: 0 var(--spacing-xs);
		box-shadow: var(--shadow-md);
	}
`;

const MeasurementPoint = styled.div<{ $color: string }>`
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background: ${props => props.$color};
	border: 2px solid var(--background-primary);
	box-shadow: var(--shadow-md);
`;

/**
 * Measurement Label Component
 *
 * Implements AC1, AC2: measurement labels overlay 3D model, clickable points.
 *
 * @param props - Component props
 */
export const MeasurementLabel: React.FC<MeasurementLabelProps> = ({
	annotation,
	onClick,
	selected = false,
	color = 'var(--brand-primary)',
}) => {
	const { camera, gl } = useThree();
	const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });
	const [visible, setVisible] = useState(true);
	const vector = useRef(new THREE.Vector3());

	// Project 3D position to screen coordinates
	useEffect(() => {
		const updateScreenPosition = () => {
			// Set 3D position from annotation
			vector.current.set(annotation.position.x, annotation.position.y, annotation.position.z);

			// Project to screen space
			vector.current.project(camera);

			// Check if behind camera (not visible)
			if (vector.current.z > 1) {
				setVisible(false);
				return;
			}

			// Convert to pixel coordinates
			const canvas = gl.domElement;
			const x = ((vector.current.x + 1) / 2) * canvas.width;
			const y = (-(vector.current.y - 1) / 2) * canvas.height;

			setScreenPos({ x, y });
			setVisible(true);
		};

		// Update on every frame
		const interval = setInterval(updateScreenPosition, 16); // ~60fps
		return () => clearInterval(interval);
	}, [annotation.position, camera, gl]);

	if (!visible) return null;

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onClick?.(annotation);
	};

	const formattedValue = `${annotation.value.toFixed(1)} ${annotation.unit}`;

	return (
		<LabelContainer $x={screenPos.x} $y={screenPos.y} $selected={selected} onClick={handleClick}>
			<LabelBadge count={formattedValue} $confidence={annotation.confidence}>
				<MeasurementPoint $color={color} />
			</LabelBadge>
		</LabelContainer>
	);
};

export default MeasurementLabel;
