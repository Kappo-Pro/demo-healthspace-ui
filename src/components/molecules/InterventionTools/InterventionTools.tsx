/**
 * InterventionTools Molecule Component
 *
 * Admin tools for patient intervention: encouragement messages, follow-up scheduling, plan adjustments.
 * Implements FR28 intervention capabilities.
 *
 * Story 3.7: Patient Adherence Tracking
 * @module components/molecules/InterventionTools
 */

import React, { useState } from 'react';
import {
	Card,
	Space,
	Button,
	Modal,
	Select,
	Input,
	DatePicker,
	Radio,
	Typography,
	message,
	Divider} from 'antd';
import type { RadioChangeEvent } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	sendEncouragementMessage,
	scheduleFollowUpCall,
	adjustExercisePlan,
	selectSendingMessage,
	selectInterventions,
	ENCOURAGEMENT_TEMPLATES,
	type EncouragementTemplate} from '@stores/posture/postureAnalytics/exerciseTracking';
import { format } from 'date-fns';
import type { Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';
import './InterventionTools.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export interface InterventionToolsProps {
	/** Patient user ID */
	userId: string;
	/** Patient name for personalization */
	patientName: string;
	/** Show intervention history */
	showHistory?: boolean;
}

export const InterventionTools: React.FC<InterventionToolsProps> = ({
	userId,
	patientName,
	showHistory = true,
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const sendingMessage = useTypedSelector(selectSendingMessage);
	const interventions = useTypedSelector(selectInterventions);

	// Consolidated state - prevents cascading re-renders when multiple fields update
	const [messageModal, setMessageModal] = useState({
		visible: false,
		selectedTemplate: null as EncouragementTemplate | null,
		customMessage: '',
	});

	const [callModal, setCallModal] = useState({
		visible: false,
		callDate: null as Dayjs | null,
		callNotes: '',
	});

	const [planModal, setPlanModal] = useState({
		visible: false,
		difficultyAdjustment: undefined as 'easier' | 'harder' | undefined,
		frequencyAdjustment: undefined as 'increase' | 'decrease' | undefined,
		adjustmentReason: '',
	});

	/**
	 * Send encouragement message
	 */
	const handleSendMessage = async () => {
		if (!messageModal.selectedTemplate) {
			message.warning(t('Admin.data.intervention.messageModal.warnings.selectTemplate'));
			return;
		}

		try {
			await dispatch(
				sendEncouragementMessage({
					userId,
					templateId: messageModal.selectedTemplate.id,
					customMessage: messageModal.customMessage || undefined,
				}),
			).unwrap();

			message.success(t('Admin.data.intervention.messageModal.success'));
			// Reset all message modal state in one update
			setMessageModal({
				visible: false,
				selectedTemplate: null,
				customMessage: '',
			});
		} catch (error) {
			message.error(t('Admin.data.intervention.messageModal.error'));
		}
	};

	/**
	 * Schedule follow-up call
	 */
	const handleScheduleCall = async () => {
		if (!callModal.callDate) {
			message.warning(t('Admin.data.intervention.callModal.warnings.selectDateTime'));
			return;
		}

		try {
			await dispatch(
				scheduleFollowUpCall({
					userId,
					scheduledTime: callModal.callDate.toISOString(),
					notes: callModal.callNotes,
				}),
			).unwrap();

			message.success(t('Admin.data.intervention.callModal.success'));
			// Reset all call modal state in one update
			setCallModal({
				visible: false,
				callDate: null,
				callNotes: '',
			});
		} catch (error) {
			message.error(t('Admin.data.intervention.callModal.error'));
		}
	};

	/**
	 * Adjust exercise plan
	 */
	const handleAdjustPlan = async () => {
		if (!planModal.difficultyAdjustment && !planModal.frequencyAdjustment) {
			message.warning(t('Admin.data.intervention.planModal.warnings.selectAdjustment'));
			return;
		}

		if (!planModal.adjustmentReason.trim()) {
			message.warning(t('Admin.data.intervention.planModal.warnings.provideReason'));
			return;
		}

		try {
			await dispatch(
				adjustExercisePlan({
					userId,
					adjustments: {
						difficulty: planModal.difficultyAdjustment,
						frequency: planModal.frequencyAdjustment,
					},
					reason: planModal.adjustmentReason,
				}),
			).unwrap();

			message.success(t('Admin.data.intervention.planModal.success'));
			// Reset all plan modal state in one update
			setPlanModal({
				visible: false,
				difficultyAdjustment: undefined,
				frequencyAdjustment: undefined,
				adjustmentReason: '',
			});
		} catch (error) {
			message.error(t('Admin.data.intervention.planModal.error'));
		}
	};

	/**
	 * Personalize template message
	 */
	const getPersonalizedMessage = (template: EncouragementTemplate): string => {
		return template.content.replace('{name}', patientName);
	};

	return (
		<div
			className="intervention-tools"
			role="region"
			aria-label={t('Admin.data.intervention.title')}>
			<Card title={<Title level={5}>{t('Admin.data.intervention.title')}</Title>}>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					{/* Action buttons */}
					<Space wrap>
						<Button
							type="primary"
							icon={<UntitledIcon name="share" size={16} />}
							onClick={() => setMessageModal(prev => ({ ...prev, visible: true }))}
							loading={sendingMessage}>
							{t('Admin.data.intervention.buttons.sendEncouragement')}
						</Button>
						<Button
							icon={<UntitledIcon name="mail" size={16} />}
							onClick={() => setCallModal(prev => ({ ...prev, visible: true }))}>
							{t('Admin.data.intervention.buttons.scheduleCall')}
						</Button>
						<Button
							icon={<UntitledIcon name="edit" size={16} />}
							onClick={() => setPlanModal(prev => ({ ...prev, visible: true }))}>
							{t('Admin.data.intervention.buttons.adjustPlan')}
						</Button>
					</Space>

					{/* Intervention history */}
					{showHistory && interventions.length > 0 && (
						<>
							<Divider />
							<div>
								<Title level={5}>
									<UntitledIcon name="clock" size={16} /> {t('Admin.data.intervention.history.title')}
								</Title>
								<Space direction="vertical" style={{ width: '100%' }}>
									{interventions.slice(0, 5).map((intervention, idx) => (
										<Card
											key={idx}
											size="small"
											style={{
												backgroundColor: 'var(--color-bg-container-secondary)',
											}}>
											<Space direction="vertical" size="small">
												<Text strong>
													{intervention.type === 'message'
														? t('Admin.data.intervention.history.types.message')
														: intervention.type === 'call'
															? t('Admin.data.intervention.history.types.call')
															: t('Admin.data.intervention.history.types.planAdjustment')}
												</Text>
												<Text type="secondary">
													{format(
														new Date(intervention.timestamp),
														'MMM dd, yyyy HH:mm',
													)}
												</Text>
												<Text>{intervention.details}</Text>
												<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
													{t('Admin.data.intervention.history.by')} {intervention.performedBy}
												</Text>
											</Space>
										</Card>
									))}
								</Space>
							</div>
						</>
					)}
				</Space>
			</Card>

			{/* Send Message Modal */}
			<Modal
				title={t('Admin.data.intervention.messageModal.title')}
				open={messageModal.visible}
				onOk={handleSendMessage}
				onCancel={() => {
					setMessageModal({ visible: false, selectedTemplate: null, customMessage: '' });
				}}
				okText={t('Admin.data.intervention.messageModal.okText')}
				confirmLoading={sendingMessage}
				width={600}>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<div>
						<Text strong>{t('Admin.data.intervention.messageModal.selectTemplate')}</Text>
						<Select
							style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
							placeholder={t('Admin.data.intervention.messageModal.templatePlaceholder')}
							value={messageModal.selectedTemplate?.id}
							onChange={value => {
								const template = ENCOURAGEMENT_TEMPLATES.find(
									t => t.id === value,
								);
								setMessageModal(prev => ({ ...prev, selectedTemplate: template || null }));
							}}>
							{ENCOURAGEMENT_TEMPLATES.map(template => (
								<Option key={template.id} value={template.id}>
									{template.title} ({template.tone})
								</Option>
							))}
						</Select>
					</div>

					{messageModal.selectedTemplate && (
						<>
							<div>
								<Text strong>{t('Admin.data.intervention.messageModal.preview')}</Text>
								<Paragraph
									style={{
										marginTop: 'var(--spacing-2)',
										padding: 'var(--spacing-3)',
										backgroundColor: 'var(--color-bg-container-secondary)',
										borderRadius: 'var(--radius-sm)',
									}}>
									{getPersonalizedMessage(messageModal.selectedTemplate)}
								</Paragraph>
							</div>

							<div>
								<Text strong>{t('Admin.data.intervention.messageModal.customizeMessage')}</Text>
								<TextArea
									rows={4}
									value={messageModal.customMessage}
									onChange={e => setMessageModal(prev => ({ ...prev, customMessage: e.target.value }))}
									placeholder={t('Admin.data.intervention.messageModal.customizePlaceholder')}
									style={{ marginTop: 'var(--spacing-2)' }}
								/>
							</div>
						</>
					)}
				</Space>
			</Modal>

			{/* Schedule Call Modal */}
			<Modal
				title={t('Admin.data.intervention.callModal.title')}
				open={callModal.visible}
				onOk={handleScheduleCall}
				onCancel={() => {
					setCallModal({ visible: false, callDate: null, callNotes: '' });
				}}
				okText={t('Admin.data.intervention.callModal.okText')}
				width={500}>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<div>
						<Text strong>{t('Admin.data.intervention.callModal.dateTime')}</Text>
						<DatePicker
							showTime
							style={{ width: '100%', marginTop: 'var(--spacing-2)' }}
							value={callModal.callDate}
							onChange={date => setCallModal(prev => ({ ...prev, callDate: date }))}
							placeholder={t('Admin.data.intervention.callModal.dateTimePlaceholder')}
						/>
					</div>

					<div>
						<Text strong>{t('Admin.data.intervention.callModal.notes')}</Text>
						<TextArea
							rows={4}
							value={callModal.callNotes}
							onChange={e => setCallModal(prev => ({ ...prev, callNotes: e.target.value }))}
							placeholder={t('Admin.data.intervention.callModal.notesPlaceholder')}
							style={{ marginTop: 'var(--spacing-2)' }}
						/>
					</div>
				</Space>
			</Modal>

			{/* Adjust Plan Modal */}
			<Modal
				title={t('Admin.data.intervention.planModal.title')}
				open={planModal.visible}
				onOk={handleAdjustPlan}
				onCancel={() => {
					setPlanModal({ visible: false, difficultyAdjustment: undefined, frequencyAdjustment: undefined, adjustmentReason: '' });
				}}
				okText={t('Admin.data.intervention.planModal.okText')}
				width={600}>
				<Space direction="vertical" size="middle" style={{ width: '100%' }}>
					<div>
						<Text strong>{t('Admin.data.intervention.planModal.difficulty.label')}</Text>
						<Radio.Group
							style={{ marginTop: 'var(--spacing-2)', width: '100%' }}
							value={planModal.difficultyAdjustment}
							onChange={(e: RadioChangeEvent) =>
								setPlanModal(prev => ({ ...prev, difficultyAdjustment: e.target.value }))
							}>
							<Space direction="vertical">
								<Radio value="easier">{t('Admin.data.intervention.planModal.difficulty.easier')}</Radio>
								<Radio value="harder">{t('Admin.data.intervention.planModal.difficulty.harder')}</Radio>
								<Radio value={undefined}>{t('Admin.data.intervention.planModal.difficulty.noChange')}</Radio>
							</Space>
						</Radio.Group>
					</div>

					<div>
						<Text strong>{t('Admin.data.intervention.planModal.frequency.label')}</Text>
						<Radio.Group
							style={{ marginTop: 'var(--spacing-2)', width: '100%' }}
							value={planModal.frequencyAdjustment}
							onChange={(e: RadioChangeEvent) =>
								setPlanModal(prev => ({ ...prev, frequencyAdjustment: e.target.value }))
							}>
							<Space direction="vertical">
								<Radio value="increase">{t('Admin.data.intervention.planModal.frequency.increase')}</Radio>
								<Radio value="decrease">{t('Admin.data.intervention.planModal.frequency.decrease')}</Radio>
								<Radio value={undefined}>{t('Admin.data.intervention.planModal.frequency.noChange')}</Radio>
							</Space>
						</Radio.Group>
					</div>

					<div>
						<Text strong>{t('Admin.data.intervention.planModal.reason.label')}</Text>
						<TextArea
							rows={4}
							value={planModal.adjustmentReason}
							onChange={e => setPlanModal(prev => ({ ...prev, adjustmentReason: e.target.value }))}
							placeholder={t('Admin.data.intervention.planModal.reason.placeholder')}
							style={{ marginTop: 'var(--spacing-2)' }}
							required
						/>
					</div>
				</Space>
			</Modal>
		</div>
	);
};

InterventionTools.displayName = 'InterventionTools';
