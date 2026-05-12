import React from 'react';
import { Typography } from 'antd';
import { PostureData } from '@types';

const { Text } = Typography;

interface PIposture {
	label: string;
	leftValue: number;
	rightValue: number;
	max?: number;
	posture: PostureData | null;
}

const getColor = (value: number) => {
	if (value <= 0) return 'var(--color-success-500)';
	if (value > 0 && value <= 5) return 'var(--color-warning-500)';
	return 'var(--color-error-500)';
};

const StatusBar: React.FC<PIposture> = ({
	label,
	leftValue,
	rightValue,
	max = 10,
	posture,
}) => {
	const total = Math.max(leftValue, rightValue, max);
	const isRight = posture?.view === 'right';
	const leftPercent = leftValue > 0 ? (leftValue / total) * 50 : 5;
	const rightPercent = rightValue > 0 ? (rightValue / total) * 50 : 5;
	const leftColor = getColor(leftValue);
	const rightColor = getColor(rightValue);

	return (
		<div>
			<Text>{label}</Text>
			<div
				style={{
					position: 'relative',
					height: 30,
					marginTop: 10,
					marginBottom: -12,
				}}>
				{leftValue < 0 && (
					<div
						style={{
							position: 'absolute',
							left: `${50 - Math.max(leftPercent, 2) / 2}%`,
							top: -20,
							transform: 'translateX(-50%)',
							color: 'var(--text-success)',
							fontSize: 12,
							zIndex: 2,
						}}>
						{leftValue}
					</div>
				)}
				{rightValue < 0 && (
					<div
						style={{
							position: 'absolute',
							left: `${50 - Math.max(rightPercent, 2) / 2}%`,
							top: -20,
							transform: 'translateX(-50%)',
							color: 'var(--text-success)',
							fontSize: 12,
							zIndex: 2,
						}}>
						{rightValue}
					</div>
				)}
				{leftValue > 0 && (
					<div
						style={{
							position: 'absolute',
							left: `${50 - leftPercent / 2}%`,
							top: -16,
							transform: 'translateX(-50%)',
							color: leftColor,
							fontSize: 12,
							zIndex: 2,
						}}>
						{leftValue}
					</div>
				)}
				{rightValue > 0 && (
					<div
						style={{
							position: 'absolute',
							left: `${50 + rightPercent / 2}%`,
							top: -16,
							transform: 'translateX(-50%)',
							color: rightColor,
							fontSize: 12,
							zIndex: 2,
						}}>
						{rightValue}
					</div>
				)}
				{leftValue === 0 && rightValue === 0 && (
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: -20,
							transform: 'translateX(-50%)',
							color: 'var(--text-success)',
							fontSize: 12,
							zIndex: 2,
						}}>
						0
					</div>
				)}
				<div
					style={{
						height: 10,
						borderRadius: 4,
						background: 'var(--color-gray-200)',
						overflow: 'hidden',
						position: 'relative',
					}}>
					{!isRight && (
						<div
							style={{
								position: 'absolute',
								left: `${50 - leftPercent}%`,
								width: `${leftPercent}%`,
								height: '100%',
								background: leftColor,
								borderTopLeftRadius: 4,
								borderBottomLeftRadius: 4,
							}}
						/>
					)}
					{isRight && (
						<div
							style={{
								position: 'absolute',
								left: '50%',
								width: `${rightPercent}%`,
								height: '100%',
								background: rightColor,
								borderTopRightRadius: 4,
								borderBottomRightRadius: 4,
							}}
						/>
					)}
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: 0,
							bottom: 0,
							width: 2,
							backgroundColor: 'var(--color-gray-900)',
							transform: 'translateX(-1px)',
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default StatusBar;
