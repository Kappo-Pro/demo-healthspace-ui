/**
 * PatientMilestones Molecule Component
 *
 * Displays patient milestone achievements and progress for clinician view (FR8 + FR28).
 * Shows earned milestones and progress toward unearned milestones.
 *
 * Story 3.7: Patient Adherence Tracking - Milestone Integration
 * @module components/molecules/PatientMilestones
 */

import React from 'react';
import {
	Card,
	Space,
	Badge,
	Typography,
	Progress,
	Row,
	Col,
	Tooltip,
	Empty} from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import type { Milestone, MilestoneProgress } from '@types/milestones';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import './PatientMilestones.css';

const { Title, Text } = Typography;

export interface PatientMilestonesProps {
	/** Earned milestones */
	earnedMilestones: Milestone[];
	/** Progress toward unearned milestones */
	milestoneProgress: MilestoneProgress[];
	/** Loading state */
	loading?: boolean;
	/** Show celebration for recent milestones */
	showCelebration?: boolean;
	/** Number of days to consider "recent" */
	recentDays?: number;
}

/**
 * Check if milestone is recent
 */
const isRecentMilestone = (
	dateAchieved: string,
	recentDays: number,
): boolean => {
	const achievedDate = parseISO(dateAchieved);
	const daysSince = Math.floor(
		(Date.now() - achievedDate.getTime()) / (1000 * 60 * 60 * 24),
	);
	return daysSince <= recentDays;
};

/**
 * Get milestone icon based on type
 */
const getMilestoneIcon = (type: string): React.ReactNode => {
	if (type.includes('streak')) return <UntitledIcon name="fire" size={16} />;
	if (type.includes('first')) return <UntitledIcon name="trophy" size={16} />;
	if (type.includes('consistency')) return <UntitledIcon name="checkCircle" size={16} />;
	return <UntitledIcon name="trophy" size={16} />;
};

export const PatientMilestones: React.FC<PatientMilestonesProps> = ({
	earnedMilestones,
	milestoneProgress,
	loading = false,
	showCelebration = true,
	recentDays = 7,
}) => {
	const { t } = useTranslation();
	const recentMilestones = showCelebration
		? earnedMilestones.filter(m =>
				isRecentMilestone(m.dateAchieved, recentDays),
			)
		: [];

	const hasEarnedMilestones = earnedMilestones.length > 0;
	const hasProgress = milestoneProgress.length > 0;

	return (
		<div
			className="patient-milestones"
			role="region"
			aria-label={t('Patient.data.milestones.title')}>
			<Card loading={loading}>
				<Space direction="vertical" size="large" style={{ width: '100%' }}>
					{/* Recent achievements - celebration section */}
					{recentMilestones.length > 0 && (
						<div className="milestone-celebration">
							<Badge.Ribbon text={t('Patient.data.milestones.recentBadge')} color="var(--color-warning)">
								<Card
									size="small"
									style={{ backgroundColor: 'var(--color-success-bg)' }}>
									<Space
										direction="vertical"
										size="small"
										style={{ width: '100%' }}>
										<Title level={5} style={{ margin: 0 }}>
											<UntitledIcon name="trophy" size={16} /> {t('Patient.data.milestones.recentAchievements')}
										</Title>
										{recentMilestones.map(milestone => (
											<div key={milestone.id} className="recent-milestone-item">
												<Space>
													<span style={{ fontSize: 'var(--font-size-xl)' }}>🎉</span>
													<div>
														<Text strong>{milestone.name}</Text>
														<br />
														<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
															{format(
																parseISO(milestone.dateAchieved),
																'MMM dd, yyyy',
															)}
														</Text>
													</div>
												</Space>
											</div>
										))}
									</Space>
								</Card>
							</Badge.Ribbon>
						</div>
					)}

					{/* Earned Milestones */}
					<div>
						<Title level={5}>
							<UntitledIcon name="trophy" size={16} /> {t('Patient.data.milestones.earnedMilestones')} ({earnedMilestones.length})
						</Title>
						{hasEarnedMilestones ? (
							<Row gutter={[12, 12]}>
								{earnedMilestones.map(milestone => (
									<Col xs={24} sm={12} md={8} key={milestone.id}>
										<Tooltip title={milestone.description}>
											<Card
												size="small"
												className="milestone-card earned"
												hoverable>
												<Space
													direction="vertical"
													align="center"
													style={{ width: '100%' }}>
													<div className="milestone-icon earned">
														{getMilestoneIcon(milestone.type)}
													</div>
													<Text strong style={{ textAlign: 'center' }}>
														{milestone.name}
													</Text>
													<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
														{format(
															parseISO(milestone.dateAchieved),
															'MMM dd, yyyy',
														)}
													</Text>
												</Space>
											</Card>
										</Tooltip>
									</Col>
								))}
							</Row>
						) : (
							<Empty
								description={t('Patient.data.milestones.noMilestonesEarned')}
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						)}
					</div>

					{/* Milestone Progress */}
					<div>
						<Title level={5}>
							<UntitledIcon name="clock" size={16} /> {t('Patient.data.milestones.progressTowardMilestones')}
						</Title>
						{hasProgress ? (
							<Space
								direction="vertical"
								style={{ width: '100%' }}
								size="middle">
								{milestoneProgress.map((progress, idx) => (
									<Card key={idx} size="small">
										<Space
											direction="vertical"
											style={{ width: '100%' }}
											size="small">
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
												}}>
												<Text strong>{progress.name}</Text>
												<Text type="secondary">
													{progress.current} / {progress.target}
												</Text>
											</div>
											<Progress
												percent={progress.percentComplete}
												strokeColor={{
													'0%': 'var(--color-primary)',
													'100%': 'var(--color-success)',
												}}
												showInfo={true}
											/>
											<Text type="secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
												{progress.description}
											</Text>
										</Space>
									</Card>
								))}
							</Space>
						) : (
							<Empty
								description={t('Patient.data.milestones.allMilestonesEarned')}
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						)}
					</div>

					{/* Summary stats */}
					{(hasEarnedMilestones || hasProgress) && (
						<Card
							size="small"
							style={{
								backgroundColor: 'var(--color-bg-container-secondary)',
							}}>
							<Row gutter={16}>
								<Col span={12}>
									<Text type="secondary">{t('Patient.data.milestones.totalEarned')}</Text>
									<br />
									<Text strong style={{ fontSize: 'var(--font-size-xl)' }}>
										{earnedMilestones.length}
									</Text>
								</Col>
								<Col span={12}>
									<Text type="secondary">{t('Patient.data.milestones.inProgress')}</Text>
									<br />
									<Text strong style={{ fontSize: 'var(--font-size-xl)' }}>
										{milestoneProgress.length}
									</Text>
								</Col>
							</Row>
						</Card>
					)}
				</Space>
			</Card>
		</div>
	);
};

PatientMilestones.displayName = 'PatientMilestones';
