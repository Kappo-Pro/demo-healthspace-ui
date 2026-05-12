/**
 * FeedbackWidget - In-App Beta Feedback Widget
 *
 * Floating button that opens feedback form for beta participants.
 * Allows users to report bugs, request features, and provide UX feedback.
 *
 * @see docs/beta-program/feedback-process.md
 */

import React, { useState, useCallback } from 'react';
import {
	Modal,
	Form,
	Input,
	Select,
	Upload,
	Button,
	message,
	Typography} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import styled from 'styled-components';
import { useTypedSelector } from '@stores/index';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * Feedback types
 */
export type FeedbackType =
	| 'bug'
	| 'feature_request'
	| 'ux_feedback'
	| 'performance'
	| 'security';

/**
 * Feedback form values
 */
export interface FeedbackFormValues {
	type: FeedbackType;
	title: string;
	description: string;
	stepsToReproduce?: string;
	screenshot?: File;
}

/**
 * FeedbackWidget Props
 */
export interface FeedbackWidgetProps {
	/** Show widget only in beta environment */
	showInBeta?: boolean;
	/** Position of floating button */
	position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
	/** Initial collapsed state */
	_initialCollapsed?: boolean;
}

/**
 * FeedbackWidget Component
 */
export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
	showInBeta = true,
	position = 'bottom-right',
}) => {
	// ALL HOOKS MUST BE AT TOP LEVEL - before any conditional returns
	const { t } = useTranslation();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form] = Form.useForm<FeedbackFormValues>();

	// Get user info from Redux
	const user = useTypedSelector(state => state.user);
	const _userId = user?.userId || 'anonymous';

	/**
	 * Handle feedback form submission
	 */
	const handleSubmit = useCallback(
		async (_values: FeedbackFormValues) => {
			setIsSubmitting(true);

			try {
				// Generate ticket ID
				const ticketId = `BETA-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

				// Collect session context
				const _sessionContext = {
					browser: navigator.userAgent,
					url: window.location.href,
					timestamp: new Date().toISOString(),
					screenSize: `${window.innerWidth}x${window.innerHeight}`,
					userRole: user?.role || 'unknown',
				};

				// Submit feedback to backend
				// TODO: Replace with actual API call
				// await fetch('/api/beta/feedback', {
				//   method: 'POST',
				//   headers: { 'Content-Type': 'application/json' },
				//   body: JSON.stringify({
				//     ticketId,
				//     userId,
				//     type: values.type,
				//     title: values.title,
				//     description: values.description,
				//     stepsToReproduce: values.stepsToReproduce,
				//     screenshot: values.screenshot,
				//     sessionContext,
				//   }),
				// });

				// Show success message
				message.success({
					content: t('common.feedback.messages.success', { ticketId }),
					duration: 5,
				});

				// Reset form and close modal
				form.resetFields();
				setIsModalVisible(false);
			} catch (error) {
				message.error(t('common.feedback.messages.error'));
			} finally {
				setIsSubmitting(false);
			}
		},
		[form, user, t],
	);

	/**
	 * Handle modal open
	 */
	const handleOpen = useCallback(() => {
		setIsModalVisible(true);

		// Track widget opened
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'feedback_widget_opened', {
				category: 'feedback',
			});
		}
	}, []);

	/**
	 * Handle modal close
	 */
	const handleClose = useCallback(() => {
		setIsModalVisible(false);

		// Track widget closed
		if (typeof window !== 'undefined' && window.gtag) {
			window.gtag('event', 'feedback_widget_closed', {
				category: 'feedback',
			});
		}
	}, []);

	// Check if in beta environment (AFTER all hooks)
	const isBeta = process.env.REACT_APP_ENV === 'beta';
	if (showInBeta && !isBeta) {
		return null; // Don't show widget in non-beta environments
	}

	/**
	 * Get feedback type options
	 */
	const feedbackTypeOptions = [
		{
			value: 'bug',
			label: (
				<span>
					<UntitledIcon name="alertCircle" size={16} /> {t('common.feedback.form.issueType.options.bug')}
				</span>
			),
		},
		{
			value: 'performance',
			label: (
				<span>
					<UntitledIcon name="lightning" size={16} />{' '}
					{t('common.feedback.form.issueType.options.performance')}
				</span>
			),
		},
		{
			value: 'feature_request',
			label: (
				<span>
					<UntitledIcon name="lightning" size={16} />{' '}
					{t('common.feedback.form.issueType.options.featureRequest')}
				</span>
			),
		},
		{
			value: 'ux_feedback',
			label: (
				<span>
					<UntitledIcon name="smile" size={16} />{' '}
					{t('common.feedback.form.issueType.options.uxFeedback')}
				</span>
			),
		},
		{
			value: 'security',
			label: (
				<span>
					<UntitledIcon name="lock" size={16} />{' '}
					{t('common.feedback.form.issueType.options.security')}
				</span>
			),
		},
	];

	return (
		<>
			{/* Floating Button */}
			<FloatingButton
				type="primary"
				size="large"
				icon={<UntitledIcon name="alertCircle" size={20} />}
				onClick={handleOpen}
				position={position}
				aria-label={t('common.feedback.button.ariaLabel')}>
				{t('common.feedback.button.reportIssue')}
			</FloatingButton>

			{/* Feedback Modal */}
			<StyledModal
				title={
					<ModalTitle>
						<UntitledIcon name="alertCircle" size={18} /> {t('common.feedback.modal.title')}
					</ModalTitle>
				}
				open={isModalVisible}
				onCancel={handleClose}
				footer={null}
				width={600}
				destroyOnClose>
				<Form
					form={form}
					onFinish={handleSubmit}
					layout="vertical"
					requiredMark="optional">
					{/* Issue Type */}
					<Form.Item
						label={t('common.feedback.form.issueType.label')}
						name="type"
						rules={[
							{
								required: true,
								message: t('common.feedback.form.issueType.required'),
							},
						]}>
						<Select
							placeholder={t('common.feedback.form.issueType.placeholder')}
							options={feedbackTypeOptions}
							size="large"
							aria-label={t('common.feedback.form.issueType.ariaLabel')}
						/>
					</Form.Item>

					{/* Title */}
					<Form.Item
						label={t('common.feedback.form.title.label')}
						name="title"
						rules={[
							{
								required: true,
								message: t('common.feedback.form.title.required'),
							},
							{ max: 80, message: t('common.feedback.form.title.maxLength') },
						]}
						extra={t('common.feedback.form.title.extra')}>
						<Input
							placeholder={t('common.feedback.form.title.placeholder')}
							maxLength={80}
							showCount
							size="large"
							aria-label={t('common.feedback.form.title.ariaLabel')}
						/>
					</Form.Item>

					{/* Description */}
					<Form.Item
						label={t('common.feedback.form.description.label')}
						name="description"
						rules={[
							{
								required: true,
								message: t('common.feedback.form.description.required'),
							},
							{
								min: 20,
								message: t('common.feedback.form.description.minLength'),
							},
						]}
						extra={t('common.feedback.form.description.extra')}>
						<TextArea
							placeholder={t('common.feedback.form.description.placeholder')}
							rows={4}
							maxLength={1000}
							showCount
							aria-label={t('common.feedback.form.description.ariaLabel')}
						/>
					</Form.Item>

					{/* Steps to Reproduce (optional) */}
					<Form.Item
						label={t('common.feedback.form.stepsToReproduce.label')}
						name="stepsToReproduce"
						extra={t('common.feedback.form.stepsToReproduce.extra')}>
						<TextArea
							placeholder={t(
								'common.feedback.form.stepsToReproduce.placeholder',
							)}
							rows={3}
							maxLength={500}
							showCount
							aria-label={t('common.feedback.form.stepsToReproduce.ariaLabel')}
						/>
					</Form.Item>

					{/* Screenshot Upload (optional) */}
					<Form.Item
						label={t('common.feedback.form.screenshot.label')}
						name="screenshot"
						valuePropName="file"
						extra={t('common.feedback.form.screenshot.extra')}>
						<Upload
							beforeUpload={() => false}
							accept="image/png,image/jpeg,image/jpg"
							maxCount={1}
							listType="picture-card"
							aria-label={t('common.feedback.form.screenshot.ariaLabel')}>
							<div>
								<UntitledIcon name="camera" size={20} />
								<div style={{ marginTop: 8 }}>
									{t('common.feedback.form.screenshot.upload')}
								</div>
							</div>
						</Upload>
					</Form.Item>

					{/* Info Text */}
					<InfoText>
						<Text type="secondary">
							{t('common.feedback.messages.infoText')}
						</Text>
					</InfoText>

					{/* Submit Buttons */}
					<Form.Item>
						<ButtonGroup>
							<Button onClick={handleClose} size="large">
								{t('common.feedback.modal.cancel')}
							</Button>
							<Button
								type="primary"
								htmlType="submit"
								size="large"
								loading={isSubmitting}
								icon={<UntitledIcon name="alertCircle" size={16} />}>
								{t('common.feedback.modal.submit')}
							</Button>
						</ButtonGroup>
					</Form.Item>
				</Form>
			</StyledModal>
		</>
	);
};

/**
 * Styled Components
 */

interface FloatingButtonProps {
	position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const FloatingButton = styled(Button)<FloatingButtonProps>`
	position: fixed;
	z-index: 1000;
	box-shadow: 0 4px 12px color-mix(in srgb, var(--color-black) 15%, transparent);
	border-radius: var(--radius-3xl);
	font-weight: 600;
	transition: all 0.3s ease;

	${props => {
		switch (props.position) {
			case 'bottom-right':
				return `
          bottom: 24px;
          right: 24px;
        `;
			case 'bottom-left':
				return `
          bottom: 24px;
          left: 24px;
        `;
			case 'top-right':
				return `
          top: 24px;
          right: 24px;
        `;
			case 'top-left':
				return `
          top: 24px;
          left: 24px;
        `;
			default:
				return `
          bottom: 24px;
          right: 24px;
        `;
		}
	}}

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px
			color-mix(in srgb, var(--color-black) 20%, transparent);
	}

	&:active {
		transform: translateY(0);
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		bottom: var(--spacing-4);
		right: var(--spacing-4);
		font-size: 14px;
		padding: var(--spacing-2) var(--spacing-4);
		height: auto;

		span {
			display: none; /* Hide text on mobile, show icon only */
		}
	}
`;

const StyledModal = styled(Modal)`
	.ant-modal-content {
		border-radius: var(--radius-lg);
	}

	.ant-modal-header {
		border-radius: var(--radius-lg) 8px 0 0;
		border-bottom: 1px solid var(--border-color);
	}

	.ant-form-item-extra {
		font-size: 12px;
		color: var(
			--text-secondary,
			color-mix(in srgb, var(--color-black) 45%, transparent)
		);
	}
`;

const ModalTitle = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-2);
	font-size: 18px;
	font-weight: 600;
`;

const ButtonGroup = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: var(--spacing-2);
	margin-top: var(--spacing-6);
`;

const InfoText = styled.div`
	padding: var(--spacing-3) var(--spacing-4);
	background-color: var(--bg-secondary);
	border-radius: var(--radius-md);
	margin-bottom: var(--spacing-4);
`;

export default FeedbackWidget;
