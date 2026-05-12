import { AddToReports } from '@atoms/AddToReports';
import { UntitledIcon } from '@atoms/Icon';
import { BottomSheetModal } from '@atoms/Modal';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import PainAssessmentProgressData from '@pages/Contacts/Details/PainAssessmentProgressData';
import SummaryReview from '@pages/Home/SummaryReview';
import { Options, THealthSignsOptions } from '@pages/Home/interface';
import { painAssessmentInfoAction } from '@stores/clinical/painAssessment';
import { myLibraryInfoAction } from '@stores/content/library';
import {
	getHealthSignOptions,
	getMedicalHistoriesOptions,
	getSummaryTabData,
} from '@stores/content/myLibrary/myLibrary';
import stores, { useTypedDispatch, useTypedSelector } from '@stores/index';
import { TCoachSummary, TDataProps } from '@types';
import {
	Empty,
	Flex,
	Pagination,
	Spin,
	Tooltip,
	Typography,
	message,
} from 'antd';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Import triage modal styles and components for consistent bottom sheet appearance
import '@organisms/TriageResultModal/TriageResultModal.css';
import { TriageUserHeader } from '@organisms/TriageResultModal/TriageUserHeader';
import DownloadSummary from '@pages/Home/DownloadSummary';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

const { Text } = Typography;

export const ListEvaluation = () => {
	const defaultApiData = {
		data: [],
		pagination: {
			currentPage: 1,
			from: 1,
			pageCount: 1,
			perPage: 1,
			to: 1,
			total: 1,
		},
	};
	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);
	const perPage = useTypedSelector(
		state => state.patientDetail.patientDetail.perpage,
	);
	const [apiData, setApiData] = useState<TCoachSummary>(defaultApiData);
	const [currentPage, setCurrentPage] = useState(1);
	const userId = user.isPhysioterapist ? selectedUser?.id : user.id;
	const dispatch = useTypedDispatch();
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState(true);

	// Modal state management
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedEvaluation, setSelectedEvaluation] =
		useState<TDataProps | null>(null);
	const [modalLoading, setModalLoading] = useState(false);
	const [healthSignsList, setHealthSignsList] = useState<THealthSignsOptions[]>(
		[],
	);
	const [medicalHistoryOptions, setMedicalHistoryOptions] = useState<Options[]>(
		[],
	);

	const fetchData = useCallback(
		async (limit: number, page: number) => {
			// Guard against undefined userId
			if (!userId) {
				setIsLoading(false);
				return;
			}

			const payload = {
				userId: userId,
				page: page,
				limit: limit,
			};
			const getSummaryData = await dispatch(getSummaryTabData(payload));
			const data = getSummaryData.payload;
			setApiData(data);
			setIsLoading(false);
		},
		[userId, dispatch],
	);

	useEffect(() => {
		// Only fetch data if userId is defined
		if (userId) {
			fetchData(perPage, currentPage);
		} else {
			setIsLoading(false);
		}
	}, [userId, perPage, currentPage, fetchData]);

	const onPageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
		fetchData(10, pageNumber);
	};

	// Modal handlers
	const handleOpenModal = async (evaluation: TDataProps) => {
		if (!evaluation) {
			return;
		}

		if (!evaluation.id) {
			return;
		}

		setSelectedEvaluation(evaluation);
		setIsModalOpen(true);
		setModalLoading(true);

		try {
			// Fetch health signs options
			const healthSignsResult = await dispatch(getHealthSignOptions());
			const healthSignsPayload = healthSignsResult?.payload as
				| { data?: THealthSignsOptions[] }
				| undefined;
			const healthSignsData = healthSignsPayload?.data || [];
			dispatch(myLibraryInfoAction.healthSignOptionsInfo(healthSignsData));
			setHealthSignsList(healthSignsData);

			// Fetch medical history options
			const medicalHistoryResult = await dispatch(getMedicalHistoriesOptions());
			const medicalHistoryPayload = medicalHistoryResult?.payload as
				| { data?: Options[] }
				| undefined;
			const medicalHistoryData = medicalHistoryPayload?.data || [];
			dispatch(
				myLibraryInfoAction.medicalHistoriesOptionsinfo(medicalHistoryData),
			);
			setMedicalHistoryOptions(medicalHistoryData);

			// Set pain assessment info
			if (evaluation?.healthSigns) {
				dispatch(
					painAssessmentInfoAction.associatedSymptomsInfo(
						evaluation.healthSigns,
					),
				);
			}
			if (evaluation?.medicalHistories) {
				dispatch(
					painAssessmentInfoAction.medicalHistoryInfo(
						evaluation.medicalHistories,
					),
				);
			}
		} catch (error) {
			console.error('[ListEvaluation] Error fetching modal data:', error);
		} finally {
			setModalLoading(false);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	// Format session date for modal header
	const getSessionDate = () => {
		if (!selectedEvaluation?.createdAt) return '';
		return format(
			new Date(selectedEvaluation.createdAt),
			'MMM dd, yyyy, hh:mm a',
		);
	};

	// Handle copy to clipboard
	const copyToClipboard = () => {
		message.success(
			t('Patient.data.virtualEvaluation.summary.copyToClipboard'),
		);
		const summaryElement = document.getElementById('summary');
		if (summaryElement) {
			navigator.clipboard
				.writeText(summaryElement.innerText)
				.catch((_error: Error) => {
					message.error('Failed to copy to clipboard');
				});
		}
	};

	// Handle download
	const handleDownload = async () => {
		const container = document.createElement('div');
		container.style.position = 'absolute';
		container.style.top = '-9999px';
		container.style.left = '-9999px';
		container.style.width = '1500px';
		container.style.zIndex = '-1';
		document.body.appendChild(container);

		const ReportWithProviders = (
			<Provider store={stores}>
				<DownloadSummary
					list={healthSignsList}
					medicalHistoryOptionsData={medicalHistoryOptions}
					savedEvaluationData={selectedEvaluation || undefined}
				/>
			</Provider>
		);

		const root = createRoot(container);
		root.render(ReportWithProviders);

		await new Promise(res => setTimeout(res, 1000));
		const pdf = new jsPDF({ unit: 'px', format: 'a3' });
		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();

		const margin = 20;
		let currentY = margin;

		const sections = container.querySelectorAll('.pdf-section');

		for (let i = 0; i < sections.length; i++) {
			const section = sections[i] as HTMLElement;

			const canvas = await html2canvas(section, {
				useCORS: true,
				scale: 1.25,
				scrollY: 0,
				scrollX: 0,
				windowWidth: 1000,
			});

			const imgData = canvas.toDataURL('image/jpeg', 0.8);
			const imgWidth = pageWidth - margin * 2;
			const imgHeight = (canvas.height * imgWidth) / canvas.width;

			if (currentY + imgHeight > pageHeight - margin) {
				pdf.addPage();
				currentY = margin;
			}

			pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
			currentY += imgHeight;
		}
		pdf.save(`report.pdf`);
		root.unmount();
		document.body.removeChild(container);
	};

	const isReportModal = useTypedSelector(
		state => state.patientDetail.patientDetail.isReportModal,
	);

	return (
		<div className="list-evaluation">
			{!isReportModal && (
				<div className="lower-content-container review-modal-css">
					<AddToReports />
				</div>
			)}
			<>
				<div className="card-container">
					<div
						className={`${user.isPhysioterapist && 'spinner-container-physioterapist'} spinner-container`}>
						{isLoading ? (
							<Spin className="spinner" size="large" />
						) : (
							<>
								{apiData?.data?.length > 0 ? (
									<div>
										<PainAssessmentProgressData
											currentPage={currentPage}
											apiData={apiData}
											fetchData={fetchData}
											perPage={perPage}
											onEvaluationClick={handleOpenModal}
										/>{' '}
									</div>
								) : (
									<div className="p-5">
										<Empty
											description={t(
												'Admin.data.menu.patientDetail.aiAssistantListEvaluation.noEvaluationFound',
											)}
											image={Empty.PRESENTED_IMAGE_SIMPLE}
										/>
									</div>
								)}
							</>
						)}
					</div>
				</div>
				<div className="pagination">
					{apiData &&
						apiData.pagination &&
						apiData?.data?.length > 0 &&
						!perPage && (
							<Pagination
								current={currentPage}
								onChange={onPageChange}
								total={apiData.pagination.total || 0}
								showSizeChanger={false}
							/>
						)}
				</div>
			</>

			{/* Evaluation Results Modal - Bottom Sheet Style */}
			<BottomSheetModal
				open={isModalOpen}
				onCancel={handleCloseModal}
				styles={{
					mask: { background: 'var(--color-black-alpha-75)' },
				}}
				title={
					<Flex
						align="center"
						justify="space-between"
						className="triage-modal-header">
						<Flex align="center" gap={12} className="triage-modal-header__left">
							<Text strong className="triage-modal-header__title">
								{t(
									'Admin.data.triage.resultTypes.evaluation',
									'Virtual Evaluation',
								)}
							</Text>
							{getSessionDate() && (
								<Text type="secondary" className="triage-modal-header__date">
									{getSessionDate()}
								</Text>
							)}
						</Flex>
						<Flex
							align="center"
							gap={8}
							className="triage-modal-header__actions">
							<Tooltip title={t('common.copy', 'Copy')}>
								<button
									type="button"
									className="triage-modal-header__action-btn"
									onClick={() => copyToClipboard()}
									aria-label={t('common.copy', 'Copy')}>
									<UntitledIcon name="copy" size={18} />
								</button>
							</Tooltip>
							<Tooltip title={t('common.download', 'Download')}>
								<button
									type="button"
									className="triage-modal-header__action-btn"
									onClick={handleDownload}
									aria-label={t('common.download', 'Download')}>
									<UntitledIcon name="download" size={18} />
								</button>
							</Tooltip>
						</Flex>
					</Flex>
				}
				footer={null}
				width={1100}
				className="triage-result-modal">
				<div className="triage-result-content">
					{modalLoading ? (
						<ActivityFeedSkeleton count={5} />
					) : selectedEvaluation ? (
						<div className="evaluation-result-wrapper">
							{selectedUser && <TriageUserHeader user={selectedUser} />}
							<SummaryReview
								list={healthSignsList}
								medicalHistoryOptionsData={medicalHistoryOptions}
								savedEvaluationData={selectedEvaluation}
								hideActions
							/>
						</div>
					) : (
						<Flex
							justify="center"
							align="center"
							style={{ padding: 'var(--spacing-8)' }}>
							<Empty
								image={Empty.PRESENTED_IMAGE_SIMPLE}
								description={t(
									'Admin.data.triage.noEvaluationData',
									'No evaluation data available',
								)}
							/>
						</Flex>
					)}
				</div>
			</BottomSheetModal>
		</div>
	);
};
