import { FormSkeleton } from '@atoms/Skeletons';
import MBodyPoints from '@pages/PatientOnboard/MBodyPoints';
import { router } from '@routers/routers';
import {
	painAssessmentInfoAction,
	saveEvaluation} from '@stores/clinical/painAssessment';
import { ACTIVETAB } from '@stores/constants';
import { myLibraryInfoAction } from '@stores/content/library';
import {
	getEvaluationData,
	getHealthSignOptions,
	getMedicalHistoriesOptions} from '@stores/content/myLibrary/myLibrary';
import { useTypedDispatch, useTypedSelector } from '@stores/index';
import {
	setActiveTab,
	setStateId} from '@stores/shared/patientDetail/patientDetail';
import { Button, Card, Steps, message, type StepProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import AssociatedSymptoms from './AssociatedSymptoms';
import MedicalHistory from './MedicalHistory';
import SummaryReview from './SummaryReview';
import {
	EvaluationData,
	HealthSigns,
	MedicalHistories,
	Options,
	PainAssessments,
	THealthSignsOptions,
	TPayload} from './interface';
import './style.css';

const PainAssessment: React.FC = () => {
	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);
	const [activeStep, setActiveStep] = useState<number>(0);
	const dispatch = useTypedDispatch();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const { t } = useTranslation();

	const steps: StepProps[] = [
		{
			title: t('Patient.data.virtualEvaluation.painAssesment.title'),
			description: t(
				'Patient.data.virtualEvaluation.painAssesment.description',
			),
		},
		{
			title: t('Patient.data.virtualEvaluation.associatedSymptoms.title'),
			description: t(
				'Patient.data.virtualEvaluation.associatedSymptoms.description',
			),
		},
		{
			title: t('Patient.data.virtualEvaluation.medicalHistory.title'),
			description: t(
				'Patient.data.virtualEvaluation.medicalHistory.description',
			),
		},
		{
			title: t('Patient.data.virtualEvaluation.summary.title'),
			description: t('Patient.data.virtualEvaluation.summary.description'),
		},
	];

	const [list, setList] = useState<THealthSignsOptions[]>([]);
	const [savedSymptomsData, setSavedSymptomsData] = useState<
		HealthSigns | undefined
	>();
	const [medicalHistoryOptionsData, setMedicalHistoryOptionsData] = useState<
		Options[]
	>([]);
	const [savedMedicalHistoryData, setSavedMedicalHistoryData] = useState<
		MedicalHistories | undefined
	>();
	const [savedEvaluationData, setSavedEvaluationData] =
		useState<EvaluationData>();
	const [apiDataLoaded, setApiDataLoaded] = useState(false);

	useEffect(() => {
		fetchSavedData();
		getOptionsData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedUser]); // fetchSavedData and getOptionsData are stable functions

	const getOptionsData = async () => {
		fetchHelthSigns();
		fetchMedicalHistory();
	};

	const fetchSavedData = async () => {
		setIsLoading(true);
		const id = user.isPhysioterapist ? selectedUser?.id : user.id;
		const payload = {
			userId: id,
			page: 1,
			limit: 1,
		};
		const data = await dispatch(getEvaluationData(payload));
		const apiData = data.payload;
		if (apiData?.data?.length > 0) {
			setSavedEvaluationData(apiData?.data[0]);
			setSavedSymptomsData(apiData?.data[0].healthSigns);
			setSavedMedicalHistoryData(apiData?.data[0].medicalHistories);
		}
		setApiDataLoaded(true);
		setIsLoading(false);
	};

	const fetchHelthSigns = async () => {
		setIsLoading(true);
		try {
			const data = await dispatch(getHealthSignOptions());
			const apiData = data?.payload?.data;
			dispatch(myLibraryInfoAction.healthSignOptionsInfo(apiData));
			setList(apiData);
			dispatch(
				painAssessmentInfoAction.associatedSymptomsInfo(
					savedEvaluationData?.healthSigns,
				),
			);
		} catch (error) {
			// Silently handle health sign fetch errors
			// Context: User will see empty form if data unavailable
			console.error('[PainAssessment] Error fetching health signs:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchMedicalHistory = async () => {
		setIsLoading(true);
		try {
			const data = await dispatch(getMedicalHistoriesOptions());
			const apiData = data?.payload?.data;
			dispatch(myLibraryInfoAction.medicalHistoriesOptionsinfo(apiData));
			setMedicalHistoryOptionsData(apiData);
			dispatch(
				painAssessmentInfoAction.medicalHistoryInfo(
					savedEvaluationData?.medicalHistories,
				),
			);
		} catch (error) {
			// Silently handle medical history fetch errors
			// Context: User will see empty form if data unavailable
			console.error('[PainAssessment] Error fetching medical history:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		let payload: TPayload = {
			painAssessments: [],
			healthSigns: { strapiHealthSignsIds: [], notes: '' },
			medicalHistories: { strapiMedicalHistoriesIds: [] },
		};
		if (activeStep === 1) {
			payload = {
				strapiHealthSignsIds: Array.isArray(
					savedSymptomsData?.strapiHealthSignsIds,
				)
					? [...savedSymptomsData.strapiHealthSignsIds]
					: [],
				id: savedSymptomsData?.id,
				userId: savedSymptomsData?.userId,
				notes: '',
			};
		} else if (activeStep === 2) {
			payload = {
				strapiMedicalHistoriesIds: Array.isArray(
					savedMedicalHistoryData?.strapiMedicalHistoriesIds,
				)
					? [...(savedMedicalHistoryData?.strapiMedicalHistoriesIds ?? [])]
					: [],
				id: savedMedicalHistoryData?.id,
				userId: savedMedicalHistoryData?.userId,
				notes: '',
			};
		} else if (activeStep === 3) {
			payload = {
				userId: user.isPhysioterapist ? selectedUser?.id : user.id,
				painAssessments: savedEvaluationData?.painAssessments?.map(item => {
					const {
						id,
						painLevel,
						strapiBodyPointId,
						strapiAggravatingFactorsIds,
						strapiRelievingFactorsIds,
						strapiPainCausesIds,
						strapiPainDurationId,
						strapiPainFrequencyId,
						strapiPainStatusId,
						notes = '',
					} = item;
					const painAssessment: PainAssessments = {
						userId: savedEvaluationData.userId,
						painLevel: painLevel ?? 5,
						strapiBodyPointId,
						strapiAggravatingFactorsIds,
						strapiRelievingFactorsIds,
						strapiPainCausesIds,
						strapiPainDurationId,
						strapiPainFrequencyId,
						strapiPainStatusId,
						notes,
					};
					if (id) painAssessment.id = id;
					return painAssessment;
				}),
				healthSigns: {
					strapiHealthSignsIds: savedSymptomsData?.strapiHealthSignsIds,
					id: savedSymptomsData?.id,
					userId: savedSymptomsData?.userId,
					notes: '',
				},
				medicalHistories: {
					strapiMedicalHistoriesIds:
						savedMedicalHistoryData?.strapiMedicalHistoriesIds,
					id: savedMedicalHistoryData?.id,
					userId: savedMedicalHistoryData?.userId,
					notes: '',
				},
			};
			savedData(payload);
			return;
		}
		savedData(payload);
	};

	const savedData = async (payload: unknown) => {
		if (activeStep == 1) {
			if (payload?.strapiHealthSignsIds?.length > 0) {
				const filterdData =
					savedSymptomsData?.strapiHealthSignsIds.filter(
						item => item != payload,
					) || [];
				filterdData.push(payload);
				setSavedSymptomsData(payload);
				dispatch(painAssessmentInfoAction.associatedSymptomsInfo(payload));
				setActiveStep(2);
			} else {
				message.error(
					t(
						'Patient.data.virtualEvaluation.associatedSymptoms.pleaseSelectAtLeastOneOption',
					),
				);
			}
		} else if (activeStep == 2) {
			if (payload?.strapiMedicalHistoriesIds?.length > 0) {
				const filterdData =
					savedMedicalHistoryData?.strapiMedicalHistoriesIds.filter(
						item => item != payload,
					) || [];
				filterdData.push(payload);
				setSavedMedicalHistoryData(payload);
				dispatch(painAssessmentInfoAction.medicalHistoryInfo(payload));
				setActiveStep(3);
			} else {
				message.error(
					t(
						'Patient.data.virtualEvaluation.associatedSymptoms.pleaseSelectAtLeastOneOption',
					),
				);
			}
		} else if (activeStep == 3) {
			try {
				const data = await saveEvaluation(payload);
				message.success(t('Patient.data.dataNotifications.dataSave'));
				dispatch(setActiveTab(ACTIVETAB.LIST_EVALUATION));
				dispatch(setStateId(data.id));
				// Navigate to the result page
				const userId = user.isPhysioterapist ? selectedUser?.id : user.id;
				navigate(`/${userId}${router.AIASSISTANT_LIST_EVALUATION}`);
			} catch (error) {
				// Handle evaluation save errors
				// Context: User receives error message via UI
				console.error('[PainAssessment] Error saving evaluation:', error);
				message.error('Error Saving Data');
			} finally {
				setIsLoading(false);
			}
		} else {
			setActiveStep(1);
		}
	};

	const handleBack = () => {
		setActiveStep(activeStep - 1);
	};

	return (
		<div className="pain-assessment pain-select-none pain-check-container">
			<Steps current={activeStep} labelPlacement="vertical" items={steps} />
			{isLoading ? (
				<FormSkeleton />
			) : (
				<>
					{activeStep === 0 && apiDataLoaded && (
						<MBodyPoints
							assessmentData={savedEvaluationData?.painAssessments || []}
							savedEvaluationData={savedEvaluationData}
							setSavedEvaluationData={setSavedEvaluationData}
							isLoading={isLoading}
							setIsLoading={setIsLoading}
						/>
					)}
					{activeStep === 1 && apiDataLoaded && (
						<div className="associated-main-container">
							<div className="associated-label-css">
								{t(
									'Patient.data.myProgress.evaluation.doYouHaveAnyOfTheseSymptoms',
								)}
							</div>
							<Card className="associated-card">
								<AssociatedSymptoms
									list={list}
									savedSymptomsData={savedSymptomsData}
									setSavedSymptomsData={setSavedSymptomsData}
								/>
							</Card>
						</div>
					)}
					{activeStep === 2 && apiDataLoaded && (
						<div className="associated-main-container">
							<div className="associated-label-css">
								{t(
									'Patient.data.myProgress.evaluation.haveYouBeenDiagnosedWithAnyOfTheFollowing',
								)}
							</div>
							<Card className="associated-card">
								<MedicalHistory
									medicalHistoryOptionsData={medicalHistoryOptionsData}
									savedMedicalHistoryData={savedMedicalHistoryData}
									setSavedMedicalHistoryData={setSavedMedicalHistoryData}
								/>
							</Card>
						</div>
					)}
					{activeStep === 3 && (
						<div className="associated-main-container third-step-main-div">
							<div className="labels-container">
								<span className="title-label">
									{t('Patient.data.virtualEvaluation.summary.title')}
								</span>
								<span className="subtitle-label">
									{t('Patient.data.virtualEvaluation.summary.description2')}
								</span>
							</div>
							<div className="summary-review-div">
								<SummaryReview
									list={list}
									medicalHistoryOptionsData={medicalHistoryOptionsData}
									savedEvaluationData={savedEvaluationData}
								/>
							</div>
						</div>
					)}
					<div className="actions-button-css">
						{activeStep > 0 && (
							<span className="back-button-span">
								<Button onClick={() => handleBack()}>
									{t('Patient.data.virtualEvaluation.back')}
								</Button>
							</span>
						)}
						<Button onClick={() => handleSave()}>
							{activeStep == 3
								? t('Patient.data.virtualEvaluation.submit')
								: t('Patient.data.virtualEvaluation.next')}
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default PainAssessment;
