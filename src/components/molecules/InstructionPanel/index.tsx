import React from 'react';
import { Card, Flex, Typography, Alert, List, Image } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { InstructionStep } from '@types';
import './InstructionPanel.css';

const { Title, Text, Paragraph } = Typography;

export interface InstructionPanelProps {
	/** Exercise title */
	title: string;
	/** Step-by-step instructions */
	instructions: InstructionStep[];
	/** Repetitions recommended */
	reps?: string;
	/** Sets recommended */
	sets?: string;
	/** Safety tips */
	safetyTips?: string;
	/** Contraindications */
	contraindications?: string;
	/** How to know you're doing it right */
	correctnessGuidance?: string;
	/** Class name */
	className?: string;
}

/**
 * InstructionPanel - Exercise instruction display (Story 2.3)
 *
 * Features:
 * - Numbered step-by-step instructions
 * - Optional images for each step
 * - Rep/set recommendations
 * - Safety tips highlighted
 * - Contraindications warning
 * - Correctness guidance
 * - High readability (Flesch Reading Ease >= 60)
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <InstructionPanel
 *   title="Shoulder Stretch"
 *   instructions={[
 *     { step: 1, instruction: "Stand with feet shoulder-width apart" },
 *     { step: 2, instruction: "Raise both arms overhead" }
 *   ]}
 *   reps="10-15 repetitions"
 *   sets="2-3 sets"
 *   safetyTips="Keep your core engaged throughout the movement"
 *   contraindications="Avoid if you have shoulder impingement"
 * />
 * ```
 */
export const InstructionPanel: React.FC<InstructionPanelProps> = ({
	title,
	instructions,
	reps,
	sets,
	safetyTips,
	contraindications,
	correctnessGuidance,
	className = '',
}) => {
	return (
		<div className={`instruction-panel ${className}`}>
			<Card
				style={{
					borderRadius: 'var(--radius-xl)',
					boxShadow: 'var(--shadow-sm)',
				}}>
				<Flex vertical gap={24}>
					{/* Title */}
					<Title level={3} style={{ margin: 0 }}>
						{title} - Instructions
					</Title>

					{/* Contraindications Warning */}
					{contraindications && (
						<Alert
							message="Contraindications"
							description={contraindications}
							type="error"
							icon={<UntitledIcon name="exclamationCircle" size={16} />}
							showIcon
							style={{ marginTop: 0 }}
						/>
					)}

					{/* Rep/Set Recommendations */}
					{(reps || sets) && (
						<Card
							size="small"
							style={{
								backgroundColor: 'var(--surface-info-subtle)',
								border: '1px solid var(--border-info)',
							}}>
							<Flex gap={16}>
								{reps && (
									<div>
										<Text strong>Repetitions:</Text> {reps}
									</div>
								)}
								{sets && (
									<div>
										<Text strong>Sets:</Text> {sets}
									</div>
								)}
							</Flex>
						</Card>
					)}

					{/* Step-by-Step Instructions */}
					<div>
						<Title level={4}>How to Perform</Title>
						<List
							dataSource={instructions}
							renderItem={item => (
								<List.Item
									style={{
										padding: 'var(--spacing-4) 0',
										borderBottom: '1px solid var(--border-subtle)',
									}}>
									<Flex gap={16} align="start" style={{ width: '100%' }}>
										{/* Step number */}
										<div
											style={{
												width: 32,
												height: 32,
												borderRadius: 'var(--radius-full)',
												backgroundColor: 'var(--brand-primary)',
												color: 'var(--color-text-inverse)',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												fontWeight: 'var(--font-weight-semibold)',
												flexShrink: 0,
											}}
											aria-label={`Step ${item.step}`}>
											{item.step}
										</div>

										{/* Instruction text and image */}
										<Flex vertical gap={8} style={{ flex: 1 }}>
											<Paragraph
												style={{
													margin: 0,
													fontSize: 16,
													lineHeight: 1.6,
													color: 'var(--text-color)',
												}}>
												{item.instruction}
											</Paragraph>
											{item.imageUrl && (
												<Image
													src={item.imageUrl}
													alt={`Step ${item.step} demonstration`}
													style={{
														maxWidth: 300,
														borderRadius: 'var(--radius-lg)',
													}}
													preview={{
														mask: 'View larger',
													}}
												/>
											)}
										</Flex>
									</Flex>
								</List.Item>
							)}
						/>
					</div>

					{/* Safety Tips */}
					{safetyTips && (
						<Alert
							message="Safety Tips"
							description={
								<Paragraph
									style={{
										margin: 0,
										whiteSpace: 'pre-line',
										fontSize: 14,
										lineHeight: 1.6,
									}}>
									{safetyTips}
								</Paragraph>
							}
							type="warning"
							icon={<UntitledIcon name="warning" size={16} />}
							showIcon
						/>
					)}

					{/* Correctness Guidance */}
					{correctnessGuidance && (
						<Card
							size="small"
							style={{
								backgroundColor: 'var(--surface-success-subtle)',
								border: '1px solid var(--border-success)',
							}}>
							<Flex gap={12} align="start">
								<UntitledIcon
									name="checkCircle"
									size={20}
									style={{
										color: 'var(--brand-success)',
										marginTop: 2,
									}}
								/>
								<div style={{ flex: 1 }}>
									<Text
										strong
										style={{
											display: 'block',
											marginBottom: 8,
											color: 'var(--brand-success)',
										}}>
										How to Know You're Doing It Right
									</Text>
									<Paragraph
										style={{
											margin: 0,
											whiteSpace: 'pre-line',
											fontSize: 14,
											lineHeight: 1.6,
										}}>
										{correctnessGuidance}
									</Paragraph>
								</div>
							</Flex>
						</Card>
					)}
				</Flex>
			</Card>
		</div>
	);
};
