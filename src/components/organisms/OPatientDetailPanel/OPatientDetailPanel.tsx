/**
 * OPatientDetailPanel Organism Component
 *
 * Patient detail drawer with clinical analytics, metrics, notes, and export.
 * Implements FR12 (Clinical Analytics) and FR15 (Data Export).
 *
 * Story 3.2: Clinical Analytics & Detailed Metrics
 * @module components/organisms/OPatientDetailPanel
 */

import React, { useEffect, useState } from 'react';
import {
	Drawer,
	Space,
	Button,
	Typography,
	Spin,
	Alert,
	Tabs,
	Row,
	Col,
	Card,
	Input,
	List,
	Tag,
	message,
	Divider} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import {
	fetchPatientDetail,
	fetchCohortComparison,
	addClinicalNote,
	updateClinicalNote,
	deleteClinicalNote,
	exportPatientReport,
	closePatientDetailDrawer,
	selectPatientDetail,
	selectDrawerVisible,
	selectLoading,
	selectError,
	selectNotesLoading,
	selectExportLoading,
	selectSortedClinicalNotes} from '@stores/posture/postureAnalytics/selectedSession';
import { EnhancedMetricCard } from '@molecules/PostureMetricCard/EnhancedMetricCard';
import { AdherenceMetrics } from '@molecules/AdherenceMetrics';
import { AdherenceHeatmap } from '@molecules/AdherenceHeatmap';
import { InterventionTools } from '@molecules/InterventionTools';
import { PatientMilestones } from '@molecules/PatientMilestones';
import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Area,
	AreaChart} from 'recharts';
import { format, parseISO } from 'date-fns';
import {
	fetchAdherenceData,
	selectCurrentPatient,
	selectAdherenceMetrics,
	selectDailyAdherence,
	selectWeeklyAdherence,
	selectPatientMilestones,
	selectLoading as selectAdherenceLoading} from '@stores/posture/postureAnalytics/exerciseTracking';
import './OPatientDetailPanel.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface OPatientDetailPanelProps {
	/** Patient user ID */
	userId: string | null;
}

export const OPatientDetailPanel: React.FC<OPatientDetailPanelProps> = ({
	userId,
}) => {
	const dispatch = useTypedDispatch();
	const { t } = useTypedTranslation();

	const patientDetail = useTypedSelector(selectPatientDetail);
	const drawerVisible = useTypedSelector(selectDrawerVisible);
	const loading = useTypedSelector(selectLoading);
	const error = useTypedSelector(selectError);
	const notesLoading = useTypedSelector(selectNotesLoading);
	const exportLoading = useTypedSelector(selectExportLoading);
	const clinicalNotes = useTypedSelector(selectSortedClinicalNotes);

	// Adherence tracking selectors
	const adherencePatient = useTypedSelector(selectCurrentPatient);
	const adherenceMetrics = useTypedSelector(selectAdherenceMetrics);
	const dailyAdherence = useTypedSelector(selectDailyAdherence);
	const weeklyAdherence = useTypedSelector(selectWeeklyAdherence);
	const patientMilestones = useTypedSelector(selectPatientMilestones);
	const adherenceLoading = useTypedSelector(selectAdherenceLoading);

	const [noteContent, setNoteContent] = useState('');
	const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

	useEffect(() => {
		if (userId && drawerVisible) {
			dispatch(fetchPatientDetail(userId));
			dispatch(fetchCohortComparison(userId));
			dispatch(fetchAdherenceData(userId)); // FR28: Fetch adherence data
		}
	}, [userId, drawerVisible, dispatch]);

	const handleClose = () => {
		dispatch(closePatientDetailDrawer());
		setNoteContent('');
		setEditingNoteId(null);
	};

	const handleExport = async () => {
		if (!userId) return;
		try {
			await dispatch(exportPatientReport(userId)).unwrap();
			message.success(t('admin.patientDetail.panel.exportSuccess'));
		} catch (err) {
			message.error(t('admin.patientDetail.panel.exportError'));
		}
	};

	const handleAddNote = async () => {
		if (!userId || !noteContent.trim()) return;

		const mentions = extractMentions(noteContent);

		try {
			if (editingNoteId) {
				await dispatch(
					updateClinicalNote({
						noteId: editingNoteId,
						content: noteContent,
						mentions,
					}),
				).unwrap();
				message.success(t('admin.patientDetail.panel.noteUpdated'));
			} else {
				await dispatch(
					addClinicalNote({
						patientId: userId,
						content: noteContent,
						mentions,
					}),
				).unwrap();
				message.success(t('admin.patientDetail.panel.noteAdded'));
			}
			setNoteContent('');
			setEditingNoteId(null);
		} catch (err) {
			message.error(t('admin.patientDetail.panel.noteSaveError'));
		}
	};

	const handleEditNote = (note: (typeof clinicalNotes)[0]) => {
		setNoteContent(note.content);
		setEditingNoteId(note.id);
	};

	const handleDeleteNote = async (noteId: string) => {
		try {
			await dispatch(deleteClinicalNote(noteId)).unwrap();
			message.success(t('admin.patientDetail.panel.noteDeleted'));
		} catch (err) {
			message.error(t('admin.patientDetail.panel.noteDeleteError'));
		}
	};

	const extractMentions = (content: string): string[] => {
		const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
		const mentions: string[] = [];
		let match;
		while ((match = mentionRegex.exec(content)) !== null) {
			mentions.push(match[2]); // Extract user ID from mention
		}
		return mentions;
	};

	if (!patientDetail && !loading) {
		return null;
	}

	return (
		<Drawer
			title={
				<Space>
					<UntitledIcon name="user" size={16} />
					<span>{patientDetail?.name || 'Patient Details'}</span>
				</Space>
			}
			width={800}
			open={drawerVisible}
			onClose={handleClose}
			closeIcon={<UntitledIcon name="close" size={16} />}
			extra={
				<Button
					type="primary"
					icon={<UntitledIcon name="download" size={16} />}
					onClick={handleExport}
					loading={exportLoading}>
					{t('admin.patientDetail.panel.exportPdf')}
				</Button>
			}
			className="patient-detail-drawer">
			{loading && (
				<div style={{ textAlign: 'center', padding: 'var(--spacing-10) 0' }}>
					<Spin size="large" />
				</div>
			)}

			{error && (
				<Alert
					message={t('admin.patientDetail.panel.error')}
					description={error}
					type="error"
					closable
					style={{ marginBottom: 16 }}
				/>
			)}

			{patientDetail && (
				<>
					{/* Summary Metrics */}
					<section className="patient-detail-section">
						<Title level={4}>{t('admin.patientDetail.panel.summaryMetrics')}</Title>
						<Row gutter={[16, 16]}>
							<Col xs={24} sm={8}>
								<EnhancedMetricCard
									title={t('admin.patientDetail.panel.overallPostureScore')}
									value={patientDetail.overallPostureScore}
									max={100}
									showDetails
								/>
							</Col>
							<Col xs={24} sm={8}>
								<EnhancedMetricCard
									title={t('admin.patientDetail.panel.improvementRate')}
									value={Math.abs(patientDetail.improvementRate)}
									trend={patientDetail.improvementRate}
									max={100}
									showDetails
								/>
							</Col>
							<Col xs={24} sm={8}>
								<EnhancedMetricCard
									title={t('admin.patientDetail.panel.exerciseAdherence')}
									value={patientDetail.adherencePercent}
									max={100}
									showDetails
								/>
							</Col>
						</Row>
					</section>

					<Divider />

					{/* Tabs for Trends, Notes, Analytics */}
					<Tabs
						defaultActiveKey="trends"
						items={[
							{
								key: 'trends',
								label: (
									<span>
										<UntitledIcon name="lineChart" size={16} />
										{t('admin.patientDetail.panel.postureTrends')}
									</span>
								),
								children: (
									<div style={{ height: 300 }}>
										<ResponsiveContainer width="100%" height="100%">
											<AreaChart
												data={patientDetail.trendData.dates.map(
													(date, idx) => ({
														date: format(parseISO(date), 'MMM dd'),
														score: patientDetail.trendData.scores[idx],
													}),
												)}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="date" />
												<YAxis domain={[0, 100]} />
												<Tooltip />
												<Area
													type="monotone"
													dataKey="score"
													stroke="var(--color-primary)"
													fill="var(--color-primary-bg)"
												/>
											</AreaChart>
										</ResponsiveContainer>
									</div>
								),
							},
							{
								key: 'notes',
								label: (
									<span>
										<UntitledIcon name="fileText" size={16} />
										{t('admin.patientDetail.panel.clinicalNotes')} ({clinicalNotes.length})
									</span>
								),
								children: (
									<>
										<Card style={{ marginBottom: 16 }}>
											<TextArea
												rows={4}
												placeholder={t('admin.patientDetail.panel.notePlaceholder')}
												value={noteContent}
												onChange={e => setNoteContent(e.target.value)}
											/>
											<Space style={{ marginTop: 12 }}>
												<Button
													type="primary"
													onClick={handleAddNote}
													loading={notesLoading}
													disabled={!noteContent.trim()}>
													{editingNoteId ? t('admin.patientDetail.panel.updateNote') : t('admin.patientDetail.panel.addNote')}
												</Button>
												{editingNoteId && (
													<Button
														onClick={() => {
															setNoteContent('');
															setEditingNoteId(null);
														}}>
														{t('admin.patientDetail.panel.cancel')}
													</Button>
												)}
											</Space>
										</Card>

										<List
											dataSource={clinicalNotes}
											renderItem={note => (
												<List.Item
													actions={[
														<Button
															type="link"
															onClick={() => handleEditNote(note)}>
															{t('admin.patientDetail.panel.edit')}
														</Button>,
														<Button
															type="link"
															danger
															onClick={() => handleDeleteNote(note.id)}>
															{t('admin.patientDetail.panel.delete')}
														</Button>,
													]}>
													<List.Item.Meta
														title={
															<Space>
																<Text strong>{note.authorName}</Text>
																<Text
																	type="secondary"
																	style={{ fontSize: 'var(--font-size-sm)' }}>
																	{format(parseISO(note.createdAt), 'PPpp')}
																</Text>
															</Space>
														}
														description={
															<>
																<Paragraph style={{ marginBottom: 8 }}>
																	{note.content}
																</Paragraph>
																{note.mentions.length > 0 && (
																	<Space size={4}>
																		{note.mentions.map(mentionId => (
																			<Tag
																				key={mentionId}
																				color="var(--color-primary)">
																				@{mentionId}
																			</Tag>
																		))}
																	</Space>
																)}
															</>
														}
													/>
												</List.Item>
											)}
										/>
									</>
								),
							},
							{
								key: 'analytics',
								label: (
									<span>
										<UntitledIcon name="barChart" size={16} />
										{t('admin.patientDetail.panel.comparativeAnalytics')}
									</span>
								),
								children: patientDetail.cohortComparison ? (
									<Card>
										<Title level={5}>{t('admin.patientDetail.panel.cohortComparison')}</Title>
										<Space
											direction="vertical"
											size="large"
											style={{ width: '100%' }}>
											<div>
												<Text type="secondary">{t('admin.patientDetail.panel.percentileRank')}</Text>
												<Title level={3} style={{ margin: 0 }}>
													{patientDetail.cohortComparison.percentileRank}th{' '}
													{t('admin.patientDetail.panel.percentile')}
												</Title>
												<Text>
													{t('admin.patientDetail.panel.betterThan')}{' '}
													{patientDetail.cohortComparison.betterThanPercent}
													{t('admin.patientDetail.panel.ofPatients')}
												</Text>
											</div>

											<Row gutter={16}>
												<Col span={12}>
													<Card size="small">
														<Text type="secondary">{t('admin.patientDetail.panel.patientScore')}</Text>
														<Title level={4} style={{ margin: 0 }}>
															{patientDetail.cohortComparison.patientScore}
														</Title>
													</Card>
												</Col>
												<Col span={12}>
													<Card size="small">
														<Text type="secondary">{t('admin.patientDetail.panel.cohortAverage')}</Text>
														<Title level={4} style={{ margin: 0 }}>
															{patientDetail.cohortComparison.cohortAverage}
														</Title>
													</Card>
												</Col>
											</Row>

											<div>
												<Text
													type="secondary"
													style={{ display: 'block', marginBottom: 8 }}>
													Age-Adjusted Rank
												</Text>
												<EnhancedMetricCard
													title=""
													value={patientDetail.cohortComparison.ageAdjustedRank}
													compact
												/>
											</div>

											<div>
												<Text
													type="secondary"
													style={{ display: 'block', marginBottom: 8 }}>
													Condition-Adjusted Rank
												</Text>
												<EnhancedMetricCard
													title=""
													value={
														patientDetail.cohortComparison.conditionAdjustedRank
													}
													compact
												/>
											</div>
										</Space>
									</Card>
								) : (
									<Alert
										message={t('admin.patientDetail.panel.cohortDataNotAvailable')}
										type="info"
										showIcon
									/>
								),
							},
							{
								key: 'adherence',
								label: (
									<span>
										<UntitledIcon name="heart" size={16} />
										Exercise Adherence
									</span>
								),
								children: (
									<Space
										direction="vertical"
										size="large"
										style={{ width: '100%' }}>
										{/* Adherence Metrics */}
										{adherenceMetrics && (
											<AdherenceMetrics
												metrics={adherenceMetrics}
												loading={adherenceLoading}
											/>
										)}

										{/* Adherence Visualization */}
										{dailyAdherence.length > 0 &&
											weeklyAdherence.length > 0 && (
												<AdherenceHeatmap
													dailyData={dailyAdherence}
													weeklyData={weeklyAdherence}
													loading={adherenceLoading}
												/>
											)}

										{/* Patient Milestones */}
										{patientMilestones && (
											<PatientMilestones
												earnedMilestones={patientMilestones.earned}
												milestoneProgress={patientMilestones.progress}
												loading={adherenceLoading}
												showCelebration
											/>
										)}

										{/* Intervention Tools */}
										{adherencePatient && (
											<InterventionTools
												userId={userId || ''}
												patientName={adherencePatient.userName}
												showHistory
											/>
										)}

										{!adherenceMetrics && !adherenceLoading && (
											<Alert
												message={t('admin.patientDetail.panel.adherenceDataNotAvailable')}
												description={t('admin.patientDetail.panel.adherenceDataDescription')}
												type="info"
												showIcon
											/>
										)}
									</Space>
								),
							},
						]}
					/>
				</>
			)}
		</Drawer>
	);
};

export default OPatientDetailPanel;
