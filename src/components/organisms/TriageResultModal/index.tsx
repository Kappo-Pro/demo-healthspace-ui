/**
 * TriageResultModal - Bottom sheet modal for viewing triage results
 *
 * Displays different result types based on the triage tab:
 * - Evaluation: Virtual evaluation result (summary review)
 * - ROM: Range of motion scan result
 * - Rehab/Program: Program summary with accordion collapse
 * - Survey: Pain assessment progress data
 */

import { BottomSheetModal } from '@atoms/Modal';
import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { CustomRomSession, Session, SelectedUser, UserWithSession, Posture } from '@types';
import { Flex, Typography, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

// Result content components
import { EvaluationResultContent } from './EvaluationResultContent';
import { RomResultContent } from './RomResultContent';
import { ProgramResultContent } from './ProgramResultContent';
import { SurveyResultContent } from './SurveyResultContent';
import { PostureResultContent } from './PostureResultContent';
import { SummaryResultReportDownloader } from '@pages/CustomRomSummary/SummaryResultReportDownloader';
import { PostureSummaryReportDownloader } from '@pages/AiPosture/PostureSummaryReportDownloader';

import './TriageResultModal.css';

const { Text } = Typography;

export type TriageResultType = 'evaluation' | 'rom' | 'rehab' | 'survey' | 'posture';

export interface TriageResultModalProps {
	/** Controls modal visibility */
	open: boolean;
	/** Callback when modal closes */
	onClose: () => void;
	/** The user whose results are being viewed */
	user: UserWithSession | null;
	/** The session to display */
	session: Session | null;
	/** Type of result to display */
	resultType: TriageResultType;
	/** Optional display title (used for ROM to show exact table title) */
	sessionTitle?: string;
	/** ROM-specific: Whether the session is completed */
	completedStatus?: boolean;
	/** ROM-specific: Callback to refresh session data */
	onRefreshData?: () => void;
}

export const TriageResultModal: React.FC<TriageResultModalProps> = ({
	open,
	onClose,
	user,
	session,
	resultType,
	sessionTitle,
	completedStatus = false,
	onRefreshData,
}) => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);

	// Format session date
	const sessionDate = session?.createdAt
		? format(new Date(session.createdAt), 'MMM dd, yyyy, hh:mm a')
		: '';

	// Get result type title
	const getResultTypeTitle = () => {
		switch (resultType) {
			case 'evaluation':
				return t('Admin.data.triage.resultTypes.evaluation', 'Virtual Evaluation');
			case 'rom': {
				const scanType = sessionTitle || session?.title || t('Admin.data.triage.resultTypes.rom', 'ROM Scan');
				return `${t('Admin.data.triage.resultTypes.romMonthlyReport', 'ROM Mobility Report')} - ${scanType}`;
			}
			case 'rehab':
				return t('Admin.data.triage.resultTypes.rehab', "Let's Move");
			case 'survey':
				return t('Admin.data.triage.resultTypes.survey', 'Survey');
			case 'posture':
				return t('Admin.data.triage.resultTypes.posture', 'Posture Scan');
			default:
				return '';
		}
	};

	// Handle copy to clipboard
	const handleCopy = async () => {
		try {
			const content = `${getResultTypeTitle()} - ${sessionDate}`;
			await navigator.clipboard.writeText(content);
			message.success(t('common.copiedToClipboard', 'Copied to clipboard'));
		} catch {
			message.error(t('common.copyFailed', 'Failed to copy'));
		}
	};

	// Handle download (placeholder - will be implemented per result type)
	const handleDownload = () => {
		message.info(t('common.downloadStarted', 'Download started'));
	};

	// Reset loading when modal opens
	useEffect(() => {
		if (open) {
			setLoading(true);
			// Simulate loading - actual loading will be handled by child components
			const timer = setTimeout(() => setLoading(false), 500);
			return () => clearTimeout(timer);
		}
	}, [open, session?.id]);

	// Render result content based on type
	const renderResultContent = () => {
		if (loading) {
			return <ActivityFeedSkeleton count={5} />;
		}

		if (!user || !session) {
			return (
				<Flex justify="center" align="center" style={{ padding: 'var(--spacing-8)' }}>
					<Text type="secondary">{t('Admin.data.triage.noDataAvailable', 'No data available')}</Text>
				</Flex>
			);
		}

		switch (resultType) {
			case 'evaluation':
				return <EvaluationResultContent user={user} session={session} />;
			case 'rom':
				return <RomResultContent user={user} session={session} />;
			case 'rehab':
				return <ProgramResultContent user={user} session={session} />;
			case 'survey':
				return <SurveyResultContent user={user} session={session} />;
			case 'posture':
				return <PostureResultContent user={user} session={session} />;
			default:
				return null;
		}
	};

	return (
		<BottomSheetModal
			open={open}
			onCancel={onClose}
			styles={{
				mask: { background: 'var(--color-black-alpha-75)' },
			}}
			title={
				<Flex align="flex-start" justify="space-between" className="triage-modal-header">
					<Flex align="center" gap={12} className="triage-modal-header__left-wrapper">
						{(resultType === 'rom' || resultType === 'posture') && (
							<div className="triage-modal-header__icon-container">
								<UntitledIcon name="file06" size={24} color="var(--brand-primary)" />
							</div>
						)}
						<Flex vertical gap={4} className="triage-modal-header__left">
							<Text strong className="triage-modal-header__title">
								{getResultTypeTitle()}
							</Text>
							{sessionDate && (
								<Text type="secondary" className="triage-modal-header__date">
									<UntitledIcon name="calendar" size={12} color="var(--text-tertiary)" />
									{sessionDate}
								</Text>
							)}
						</Flex>
					</Flex>
					<Flex align="center" gap={8} className="triage-modal-header__actions">
						{resultType === 'rom' && session ? (
							<>
								<Tooltip title={t('Admin.data.menu.patientDetail.aiAssistantRomSummary.edit', 'Edit')}>
									<span className="triage-modal-header__action-btn">
										<SummaryResultReportDownloader
											selectedRom={session as unknown as CustomRomSession}
											user={user as unknown as SelectedUser}
											completedStatus={completedStatus}
											fetchSessionData={onRefreshData ? () => onRefreshData() : undefined}
											reportType="edit"
											color="var(--icon-action)"
										/>
									</span>
								</Tooltip>
								{completedStatus && (
									<>
										<Tooltip title={t('Admin.data.menu.patientDetail.aiAssistantRomSummary.qrCode', 'QR Code')}>
											<span className="triage-modal-header__action-btn">
												<SummaryResultReportDownloader
													selectedRom={session as unknown as CustomRomSession}
													user={user as unknown as SelectedUser}
													completedStatus={completedStatus}
													reportType="qr"
													color="var(--icon-action)"
												/>
											</span>
										</Tooltip>
										<Tooltip title={t('Admin.data.menu.patientDetail.aiAssistantRomSummary.sendEmail', 'Send Email')}>
											<span className="triage-modal-header__action-btn">
												<SummaryResultReportDownloader
													selectedRom={session as unknown as CustomRomSession}
													user={user as unknown as SelectedUser}
													completedStatus={completedStatus}
													reportType="email"
													color="var(--icon-action)"
												/>
											</span>
										</Tooltip>
										<Tooltip title={t('Admin.data.menu.patientDetail.aiAssistantRomSummary.download', 'Download')}>
											<span className="triage-modal-header__action-btn">
												<SummaryResultReportDownloader
													selectedRom={session as unknown as CustomRomSession}
													user={user as unknown as SelectedUser}
													completedStatus={completedStatus}
													reportType="download"
													color="var(--icon-action)"
												/>
											</span>
										</Tooltip>
									</>
								)}
							</>
						) : resultType === 'posture' && session ? (
							<>
								{completedStatus && (
									<>
										<Tooltip title={t('Admin.data.menu.patientDetail.aiAssistantRomSummary.qrCode', 'QR Code')}>
											<span className="triage-modal-header__action-btn">
												<PostureSummaryReportDownloader
													selectedPosture={session as unknown as Posture}
													reportType="qr"
													color="var(--icon-action)"
												/>
											</span>
										</Tooltip>
										<Tooltip title={t('Admin.data.menu.patientDetail.aiAssistantRomSummary.download', 'Download')}>
											<span className="triage-modal-header__action-btn">
												<PostureSummaryReportDownloader
													selectedPosture={session as unknown as Posture}
													reportType="download"
													color="var(--icon-action)"
												/>
											</span>
										</Tooltip>
									</>
								)}
							</>
						) : (
							<>
								<Tooltip title={t('common.copy', 'Copy')}>
									<button
										type="button"
										className="triage-modal-header__action-btn"
										onClick={handleCopy}
										aria-label={t('common.copy', 'Copy')}
									>
										<UntitledIcon name="copy" size={16} color="var(--icon-action)" />
									</button>
								</Tooltip>
								<Tooltip title={t('common.download', 'Download')}>
									<button
										type="button"
										className="triage-modal-header__action-btn"
										onClick={handleDownload}
										aria-label={t('common.download', 'Download')}
									>
										<UntitledIcon name="download-02" size={16} color="var(--icon-action)" />
									</button>
								</Tooltip>
							</>
						)}
					</Flex>
				</Flex>
			}
			footer={null}
			width="95%"
			className={`triage-result-modal ${resultType === 'rom' || resultType === 'posture' ? 'triage-result-modal--wide' : ''}`}
		>
			<div className="triage-result-content">
				{renderResultContent()}
			</div>
		</BottomSheetModal>
	);
};

export default TriageResultModal;
