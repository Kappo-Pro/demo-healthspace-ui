import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypedSelector } from '@stores/index';
import type { ActivityStreamData, EvaluationItem } from '@types';

interface UseActivityEvaluationOptions {
	/** Activity stream data to process */
	activityStreamData: ActivityStreamData[];
}

interface UseActivityEvaluationReturn {
	/** Transformed evaluation items ready for rendering */
	evaluationData: EvaluationItem[];
}

/**
 * Custom hook for transforming ActivityStreamData into EvaluationItems
 *
 * This hook encapsulates the business logic of checking activity types and
 * creating appropriate evaluation items with titles, subtitles, and metadata.
 *
 * The transformation is memoized to prevent unnecessary recalculations.
 *
 * @example
 * ```tsx
 * const { evaluationData } = useActivityEvaluation({
 *   activityStreamData: activities
 * });
 *
 * return evaluationData.map(item => (
 *   <ActivityCard key={item.data.id} {...item} />
 * ));
 * ```
 */
export function useActivityEvaluation(
	options: UseActivityEvaluationOptions,
): UseActivityEvaluationReturn {
	const { activityStreamData } = options;
	const { t } = useTranslation();

	const user = useTypedSelector(state => state.user);
	const selectedUser = useTypedSelector(
		state => state.contacts.main.selectedUser,
	);

	/**
	 * Transform activity stream data into evaluation items
	 */
	const evaluationData = useMemo(() => {
		const evaluationArray: EvaluationItem[] = [];

		if (!activityStreamData) {
			return evaluationArray;
		}

		// Get the appropriate user name for the subtitle
		const userName = user.isPhysioterapist
			? selectedUser?.profile?.fullName
			: user.profile.fullName;

		for (const item of activityStreamData) {
			// Evaluation session
			if (item?.activityStream?.evaluationSessionId) {
				evaluationArray.push({
					title: t('patient.activity.evaluation'),
					subtitle: `${userName} ${t('patient.activity.evaluationDescription')}`,
					data: item,
					value: false,
				});
			}
			// ROM session
			else if (item?.activityStream?.romSessionId) {
				evaluationArray.push({
					title: t('patient.activity.omniRom'),
					subtitle: `${userName} ${t('patient.activity.omniRomDescription')}`,
					data: item,
					value: false,
				});
			}
			// Survey result
			else if (item?.activityStream?.surveyResultId) {
				evaluationArray.push({
					title: t('Admin.data.survey.surveySummary'),
					subtitle: `${userName} ${t('Admin.data.survey.completedSurvey')}`,
					data: item,
					value: false,
				});
			}
			// Survey assignment (no title/subtitle - hidden item)
			else if (item?.activityStream?.surveyId) {
				evaluationArray.push({
					title: '',
					subtitle: '',
					data: item,
					value: true,
				});
			}
			// Program assignment (no title/subtitle - hidden item)
			else if (item?.activityStream?.programId) {
				evaluationArray.push({
					title: '',
					subtitle: '',
					data: item,
					value: true,
				});
			}
			// Program session
			else if (item?.activityStream?.programSessionId) {
				evaluationArray.push({
					title: t('patient.activity.program'),
					subtitle: `${userName} ${t('patient.activity.programDescription')}`,
					data: item,
					value: false,
				});
			}
			// Posture analysis
			else if (item?.activityStream?.postureAnalysisSessionId) {
				evaluationArray.push({
					title: t('patient.activity.posture'),
					subtitle: `${userName} ${t('patient.activity.postureDescription')}`,
					data: item,
					value: false,
				});
			}
			// Activity stream post (message)
			else if (item?.activityStreamPost) {
				evaluationArray.push({
					title: '',
					subtitle: '',
					data: item,
					value: false,
				});
			}
		}

		// Reverse the array to show newest first
		return evaluationArray.reverse();
	}, [activityStreamData, user, selectedUser, t]);

	return {
		evaluationData,
	};
}
