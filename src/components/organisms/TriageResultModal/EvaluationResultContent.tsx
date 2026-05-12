/**
 * EvaluationResultContent - Displays virtual evaluation result in triage modal
 *
 * Shows the evaluation summary review content similar to the evaluation-modal-header-css structure
 */

import { useTypedDispatch } from '@stores/index';
import { Session, UserWithSession, TDataProps } from '@types';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import SummaryReview from '@pages/Home/SummaryReview';
import { Options, THealthSignsOptions } from '@pages/Home/interface';
import { painAssessmentInfoAction } from '@stores/clinical/painAssessment';
import { myLibraryInfoAction } from '@stores/content/library';
import {
	getHealthSignOptions,
	getMedicalHistoriesOptions,
} from '@stores/content/myLibrary/myLibrary';
import { getEvaluationActivityStreamById } from '@stores/activity/activityStream/activityStream';
import { useEffect, useState } from 'react';
import { Empty, Flex } from 'antd';
import { useTranslation } from 'react-i18next';

import { TriageUserHeader } from './TriageUserHeader';

interface EvaluationResultContentProps {
	user: UserWithSession; // May be used for future user-specific features
	session: Session;
}

export const EvaluationResultContent: React.FC<EvaluationResultContentProps> = ({
	user,
	session,
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [loading, setLoading] = useState(true);
	const [evaluationData, setEvaluationData] = useState<TDataProps | null>(null);
	const [healthSignsList, setHealthSignsList] = useState<THealthSignsOptions[]>([]);
	const [medicalHistoryOptions, setMedicalHistoryOptions] = useState<Options[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				// Fetch evaluation data
				const evalResult = await dispatch(getEvaluationActivityStreamById({ evaluationId: session.id }));
				const evalData = evalResult.payload as TDataProps;
				setEvaluationData(evalData);

				// Fetch health signs options
				const healthSignsResult = await dispatch(getHealthSignOptions());
				const healthSignsData = healthSignsResult?.payload?.data || [];
				dispatch(myLibraryInfoAction.healthSignOptionsInfo(healthSignsData));
				setHealthSignsList(healthSignsData);

				// Fetch medical history options
				const medicalHistoryResult = await dispatch(getMedicalHistoriesOptions());
				const medicalHistoryData = medicalHistoryResult?.payload?.data || [];
				dispatch(myLibraryInfoAction.medicalHistoriesOptionsinfo(medicalHistoryData));
				setMedicalHistoryOptions(medicalHistoryData);

				// Set pain assessment info
				if (evalData?.healthSigns) {
					dispatch(painAssessmentInfoAction.associatedSymptomsInfo(evalData.healthSigns));
				}
				if (evalData?.medicalHistories) {
					dispatch(painAssessmentInfoAction.medicalHistoryInfo(evalData.medicalHistories));
				}
			} catch (error) {
				console.error('[EvaluationResultContent] Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		if (session?.id) {
			fetchData();
		}
	}, [dispatch, session?.id]);

	if (loading) {
		return <ActivityFeedSkeleton count={5} />;
	}

	if (!evaluationData) {
		return (
			<Flex justify="center" align="center" style={{ padding: 'var(--spacing-8)' }}>
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={t('Admin.data.triage.noEvaluationData', 'No evaluation data available')}
				/>
			</Flex>
		);
	}

	return (
		<div className="evaluation-result-wrapper">
			<TriageUserHeader user={user} />
			<SummaryReview
				list={healthSignsList}
				medicalHistoryOptionsData={medicalHistoryOptions}
				savedEvaluationData={evaluationData}
				hideActions
			/>
		</div>
	);
};

export default EvaluationResultContent;
