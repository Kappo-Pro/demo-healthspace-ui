/**
 * PostureInfoModal Molecule Component
 * Story 2.5: Empty States with Contextual Guidance
 *
 * Educational modal explaining posture analysis, privacy, and process.
 * Triggered by "Learn More About Posture Analysis" CTA.
 */

import React from 'react';
import { Modal, Typography, List, Space } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTranslation } from 'react-i18next';
import './PostureInfoModal.css';

const { Title, Paragraph, Text } = Typography;

export interface PostureInfoModalProps {
	/** Modal visibility state */
	open: boolean;

	/** Close handler */
	onClose: () => void;
}

/**
 * Educational information sections
 */
const INFO_SECTIONS = [
	{
		icon: <UntitledIcon name="activity" size={16} />,
		title: 'How It Works',
		content:
			'Our AI-powered posture analysis uses advanced computer vision to assess your posture from a short video. The system analyzes key body landmarks, joint angles, and alignment patterns to provide a comprehensive posture assessment.',
	},
	{
		icon: <UntitledIcon name="checkCircle" size={16} />,
		title: 'Why It Matters',
		content:
			'Good posture is essential for preventing pain, improving mobility, and enhancing overall well-being. Regular posture assessments help identify issues early and track your progress over time.',
	},
	{
		icon: <UntitledIcon name="clock" size={16} />,
		title: 'Time Commitment',
		content:
			'Each posture scan takes just 5 minutes to complete. You\'ll stand in front of your camera while we capture a brief video for analysis. Results are typically available within minutes.',
	},
	{
		icon: <UntitledIcon name="lock" size={16} />,
		title: 'Privacy & Security',
		content:
			'Your posture data is encrypted and stored securely. We never share your personal information or video recordings with third parties without your explicit consent. You maintain full control over your data.',
	},
];

/**
 * What to expect during scan
 */
const SCAN_PROCESS_STEPS = [
	'Stand comfortably in front of your camera',
	'Follow on-screen positioning instructions',
	'Hold still for 10-15 seconds while we capture video',
	'Review your posture analysis results',
	'Receive personalized exercise recommendations',
];

/**
 * PostureInfoModal component
 */
export const PostureInfoModal: React.FC<PostureInfoModalProps> = ({
	open,
	onClose,
}) => {
	const { t } = useTranslation();

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			width={600}
			className="posture-info-modal"
			aria-labelledby="posture-info-modal-title"
		>
			<Space direction="vertical" size="large" className="posture-info-modal__content">
				{/* Header */}
				<div className="posture-info-modal__header">
					<Title level={3} id="posture-info-modal-title">
						About Posture Analysis
					</Title>
					<Paragraph type="secondary">
						Learn how our posture assessment works and what to expect
					</Paragraph>
				</div>

				{/* Information sections */}
				<div className="posture-info-modal__sections">
					{INFO_SECTIONS.map((section, index) => (
						<div key={index} className="posture-info-modal__section">
							<div className="posture-info-modal__section-header">
								<span className="posture-info-modal__section-icon">
									{section.icon}
								</span>
								<Title level={5}>{section.title}</Title>
							</div>
							<Paragraph>{section.content}</Paragraph>
						</div>
					))}
				</div>

				{/* What to expect */}
				<div className="posture-info-modal__process">
					<Title level={5}>{t('Patient.data.postures.scanExpectations')}</Title>
					<List
						size="small"
						dataSource={SCAN_PROCESS_STEPS}
						renderItem={(item, index) => (
							<List.Item>
								<Text>
									<span className="posture-info-modal__step-number">
										{index + 1}.
									</span>
									{item}
								</Text>
							</List.Item>
						)}
					/>
				</div>

				{/* Privacy reassurance */}
				<div className="posture-info-modal__privacy-note">
					<UntitledIcon name="lock" size={16} className="posture-info-modal__privacy-icon" />
					<Paragraph type="secondary" className="posture-info-modal__privacy-text">
						Your privacy is our priority. All data is encrypted and securely stored.
						We adhere to HIPAA compliance standards.
					</Paragraph>
				</div>
			</Space>
		</Modal>
	);
};

export default PostureInfoModal;
