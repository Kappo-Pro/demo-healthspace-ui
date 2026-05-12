import { ModalContentSkeleton } from '@atoms/Skeletons';
import { useTypedSelector } from '@stores/index';
import { AddButtonItemsProps, ReportContentProps } from '@types';
import { Empty, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReportPreviewModal from '../ReportPreviewModal';
import AddMoreResults from './AddMoreResults';
import ReportEvaluationData from './ReportEvaluationData';
import ReportPostureData from './ReportPostureData';
import ReportRehabCaptureData from './ReportRehabCaptureData';
import ReportRomSummaryData from './ReportRomSummaryData';
import ReportSurveyData from './ReportSurveyData';
import './style.css';

export default function ReportContent(props: ReportContentProps) {
	const { reportModalLoading, isEditMode } = props;

	const user = useTypedSelector(state => state.user);
	const { selectedUser } = useTypedSelector(state => state.contacts.main);
	const { t } = useTranslation();
	const {
		romSummaryData,
		romCapturesData,
		surveyData,
		rehabCapturesData,
		postureData,
	} = useTypedSelector(state => ({
		romSummaryData: state.reports.report?.romSessionsIds,
		evaluationData: state.reports.report?.evaluationSessionsIds,
		romCapturesData: state.reports.report?.romResultsIds,
		surveyData: state.reports.report?.surveyResultIds,
		rehabCapturesData: state.reports.report?.programSessionsIds,
		assessmentNotes: state.reports.report?.assessmentNotes,
		planNotes: state.reports.report?.planNotes,
		postureData: state.reports.report?.postureSessionsIds,
	}));
	const allEmpty = romSummaryData?.every(
		summary => summary?.romPatientResults?.length === 0,
	);
	const checkPostureEmpty = postureData?.every(
		posture => posture?.postureAnalytics?.length === 0,
	);
	const [activeTab, setActiveTab] = useState('subjective');
	const [activeComponent, setActiveComponent] = useState<
		AddButtonItemsProps | undefined
	>();
	const [isVisible, setIsVisible] = useState(false);

	const getUsersName = user => {
		if (user.profile.fullName) return user.profile.fullName;
		if (user.profile.firstName && user.profile.lastName)
			return `${user?.profile?.firstName} ${user?.profile?.lastName}`;
		if (user.profile.firstName) return user.profile.firstName;
		return user.profile.email;
	};

	const items = [
		{
			key: 'subjective',
			label: t('Admin.data.addNotes.subjective'),
			disabled: false,
			children: (
				<ReportEvaluationData
					isEditMode={isEditMode}
					setActiveComponent={setActiveComponent}
					setIsVisible={setIsVisible}
				/>
			),
		},
		{
			key: 'objective',
			label: t('Admin.data.addNotes.objective'),
			disabled: false,
			children: (
				<>
					<AddMoreResults
						setActiveComponent={setActiveComponent}
						setIsVisible={setIsVisible}
					/>
					{romSummaryData?.length === 0 &&
					romCapturesData?.length === 0 &&
					postureData?.length === 0 ? (
						<>
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={<span>{t('Admin.data.addToReports.noData')}</span>}
							/>
						</>
					) : (
						<>
							{romSummaryData?.length !== 0 && !allEmpty && (
								<ReportRomSummaryData
									isDownload={false}
									isEditMode={isEditMode}
								/>
							)}
							{postureData?.length !== 0 && !checkPostureEmpty && (
								<ReportPostureData isEditMode={isEditMode} />
							)}
						</>
					)}
				</>
			),
		},
		{
			key: 'assessment',
			label: t('Admin.data.addNotes.assessment'),
			disabled: false,
			children: (
				<>
					<AddMoreResults
						setActiveComponent={setActiveComponent}
						setIsVisible={setIsVisible}
					/>
					{surveyData && surveyData?.length == 0 ? (
						<>
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={<span>{t('Admin.data.addToReports.noData')}</span>}
							/>
						</>
					) : (
						<ReportSurveyData isEditMode={isEditMode} />
					)}
				</>
			),
		},
		{
			key: 'plan',
			label: t('Admin.data.addNotes.plan'),
			disabled: false,
			children: (
				<>
					<AddMoreResults
						setActiveComponent={setActiveComponent}
						setIsVisible={setIsVisible}
					/>
					{rehabCapturesData?.length == 0 ? (
						<>
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={<span>{t('Admin.data.addToReports.noData')}</span>}
							/>
						</>
					) : (
						<ReportRehabCaptureData isEditMode={isEditMode} />
					)}
				</>
			),
		},
	];

	return (
		<div id="summary" className="report-content-main-div">
			<ul className="report-info-list">
				<li className="report-li-div">
					<p className="report-info-value">
						{t('patient.progress.evaluation.patientID')}:{' '}
						<span className="report-user-name-label">
							{user.isPhysioterapist ? selectedUser.id : user.id}
						</span>
					</p>
					<p className="report-info-value">
						{t('patient.progress.evaluation.patientName')}:{' '}
						<span className="report-user-name-label">
							{user.isPhysioterapist
								? getUsersName(selectedUser)
								: `${user?.profile?.firstName} ${user?.profile?.lastName}`}
						</span>
					</p>
				</li>
			</ul>
			{reportModalLoading ? (
				<ModalContentSkeleton />
			) : (
				<Tabs
					activeKey={activeTab}
					onChange={setActiveTab}
					className="custom-tabs"
					items={items}
				/>
			)}
			{isVisible && activeComponent && (
				<ReportPreviewModal
					isVisible={isVisible}
					setIsVisible={setIsVisible}
					activeComponent={activeComponent}
				/>
			)}
		</div>
	);
}
