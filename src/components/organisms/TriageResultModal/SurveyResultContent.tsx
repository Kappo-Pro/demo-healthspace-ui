/**
 * SurveyResultContent - Displays survey/pain assessment in triage modal
 *
 * Shows pain-assessment-progress-data content with collapse accordion
 */

import { useTypedDispatch } from '@stores/index';
import { Session, UserWithSession, SurveyResult, SurveyResultQuestionList } from '@types';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { getSurveyActivityStreamByData } from '@stores/activity/activityStream/activityStream';
import { useEffect, useState } from 'react';
import { Empty, Flex, Collapse, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { UntitledIcon } from '@atoms/Icon';

const { Text, Title } = Typography;

interface SurveyResultContentProps {
	user: UserWithSession;
	session: Session;
}

export const SurveyResultContent: React.FC<SurveyResultContentProps> = ({
	user: _user, // Prefixed to indicate intentionally unused for now
	session,
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [loading, setLoading] = useState(true);
	const [surveyData, setSurveyData] = useState<SurveyResult | null>(null);

	// Fetch survey data
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const result = await dispatch(getSurveyActivityStreamByData(session.id));
				setSurveyData(result.payload as SurveyResult);
			} catch (error) {
				console.error('[SurveyResultContent] Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		};

		if (session?.id) {
			fetchData();
		}
	}, [dispatch, session?.id]);

	// Get pain level icon and color based on 1-10 scale
	const getPainLevelDisplay = (painLevel: number, question: SurveyResultQuestionList) => {
		const config: Record<number, { icon: React.ReactNode; colorClass: string }> = {
			1: {
				icon: <UntitledIcon name="face-frown" size={20} color="var(--color-error-700)" />,
				colorClass: 'pain-fisrt-emoji',
			},
			2: {
				icon: <UntitledIcon name="face-frown" size={20} color="var(--color-error-500)" />,
				colorClass: 'pain-second-emoji',
			},
			3: {
				icon: <UntitledIcon name="face-sad" size={20} color="var(--color-warning-500)" />,
				colorClass: 'pain-third-emoji',
			},
			4: {
				icon: <UntitledIcon name="face-sad" size={20} color="var(--color-warning-400)" />,
				colorClass: 'pain-fourth-emoji',
			},
			5: {
				icon: <UntitledIcon name="face-neutral" size={20} color="var(--color-warning-600)" />,
				colorClass: 'pain-fifth-emoji',
			},
			6: {
				icon: <UntitledIcon name="face-neutral" size={20} color="var(--color-warning-300)" />,
				colorClass: 'pain-sixth-emoji',
			},
			7: {
				icon: <UntitledIcon name="face-smile" size={20} color="var(--color-success-300)" />,
				colorClass: 'pain-seventh-emoji',
			},
			8: {
				icon: <UntitledIcon name="face-smile" size={20} color="var(--color-success-500)" />,
				colorClass: 'pain-eighth-emoji',
			},
			9: {
				icon: <UntitledIcon name="face-wink" size={20} color="var(--color-success-700)" />,
				colorClass: 'pain-ninth-emoji',
			},
			10: {
				icon: <UntitledIcon name="face-happy" size={20} color="var(--color-info-500)" />,
				colorClass: 'pain-tenth-emoji',
			},
		};

		const painConfig = config[painLevel] || config[5];
		return (
			<div className="pain-level-div">
				{painConfig.icon}
				<span className={`pain-level-label ${painConfig.colorClass}`}>
					{question?.selectedAnswer}
				</span>
			</div>
		);
	};

	if (loading) {
		return <ActivityFeedSkeleton count={5} />;
	}

	if (!surveyData?.questionList?.length) {
		return (
			<Flex justify="center" align="center" style={{ padding: 'var(--spacing-8)' }}>
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={t('Admin.data.triage.noSurveyData', 'No survey data available')}
				/>
			</Flex>
		);
	}

	// Build collapse items for each question
	const collapseItems = surveyData.questionList.map((question, index) => ({
		key: question.id || String(index),
		label: (
			<Flex align="center" justify="space-between" style={{ width: '100%' }}>
				<Text strong style={{ flex: 1 }}>
					{question.question || `Question ${index + 1}`}
				</Text>
				{question.painLevel && getPainLevelDisplay(question.painLevel, question)}
			</Flex>
		),
		children: (
			<div className="survey-question-content">
				{/* Selected Answer */}
				<div className="pain-assessment-item">
					<Text type="secondary">{t('Admin.data.triage.answer', 'Answer')}:</Text>
					<Text strong style={{ marginLeft: 8 }}>
						{question.selectedAnswer || '-'}
					</Text>
				</div>

				{/* Additional Details if available */}
				{question.notes && (
					<div className="pain-assessment-item" style={{ marginTop: 8 }}>
						<Text type="secondary">{t('Admin.data.triage.notes', 'Notes')}:</Text>
						<Text style={{ marginLeft: 8 }}>{question.notes}</Text>
					</div>
				)}

				{/* Body Part if available */}
				{question.bodyPart && (
					<div className="pain-assessment-item" style={{ marginTop: 8 }}>
						<Text type="secondary">{t('Admin.data.triage.bodyPart', 'Body Part')}:</Text>
						<Text style={{ marginLeft: 8 }}>{question.bodyPart}</Text>
					</div>
				)}
			</div>
		),
	}));

	return (
		<div className="survey-result-wrapper pain-assessment-progress-data">
			{/* Survey Header */}
			<Flex justify="space-between" align="center" style={{ marginBottom: 'var(--spacing-4)' }}>
				<Title level={5} style={{ margin: 0 }}>
					{surveyData.title || t('Admin.data.triage.painAssessment', 'Pain Assessment')}
				</Title>
				{surveyData.createdAt && (
					<Text type="secondary">
						{moment(surveyData.createdAt).format('MMM DD, YYYY - hh:mm A')}
					</Text>
				)}
			</Flex>

			{/* Questions Accordion */}
			<Collapse
				items={collapseItems}
				defaultActiveKey={surveyData.questionList[0]?.id || '0'}
				expandIconPosition="end"
			/>
		</div>
	);
};

export default SurveyResultContent;
