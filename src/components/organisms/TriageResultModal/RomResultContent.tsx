/**
 * RomResultContent - Displays ROM scan result in triage modal
 *
 * Shows mobility overview with pie/radar chart and joint breakdown
 */

import { UntitledIcon } from '@atoms/Icon';
import { ActivityFeedSkeleton } from '@atoms/Skeletons';
import { getRomActivityStreamById } from '@stores/activity/activityStream/activityStream';
import { getMobilityData } from '@stores/constants';
import { useTypedDispatch } from '@stores/index';
import { CustomRomSession, Session, UserWithSession } from '@types';
import { Avatar, Card, Empty, Flex, Segmented, Switch, Tooltip, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Import ROM visualization components
import ContentRomResultSides from '@pages/CustomRomScanResult/ContentROMTableResultSides';
import ContentRomResult from '@pages/CustomRomScanResult/ContentRomTableResult';
import OldRadarChart from '@pages/CustomRomScanResult/OldRadarChart';
import PieChart from '@pages/CustomRomScanResult/PieChart';

const { Text, Title, Paragraph } = Typography;

interface RomResultContentProps {
	user: UserWithSession;
	session: Session;
}

export const RomResultContent: React.FC<RomResultContentProps> = ({
	user,
	session,
}) => {
	const { t } = useTranslation();
	const dispatch = useTypedDispatch();
	const [loading, setLoading] = useState(true);
	const [sessionData, setSessionData] = useState<CustomRomSession | null>(null);
	const [avgScore, setAvgScore] = useState(0);
	const [selectedChart, setSelectedChart] = useState<'pie' | 'radar'>('pie');
	const [valueType, setValueType] = useState<'P' | 'V' | 'PT'>('V');

	// Get mobility persona based on score
	const mobilityOptions = getMobilityData(Math.round(avgScore), t);
	const persona = mobilityOptions.find(option => option.active);

	// Calculate average score from ROM results (matches vitalflow-admin HTML logic)
	useEffect(() => {
		if (sessionData?.romPatientResults) {
			// Helper to check if value is left/right object
			const isLeftRightObject = (val: unknown): val is { left?: number; right?: number } => {
				return val != null && typeof val === 'object' && !Array.isArray(val) && ('left' in val || 'right' in val);
			};

			// Flatten scores handling left/right objects
			const allScores = sessionData.romPatientResults.flatMap((item: any) => {
				return item?.results?.flatMap((result: any) => {
					const rawScore = (item?.validatedScorePt ?? item?.validatedScore ?? result?.score ?? 0) as number | { left?: number; right?: number };
					const baseTitle = item?.title || '';
					const hasLeftRight = /left|right/i.test(baseTitle);

					// If score is left/right object and title doesn't have left/right, split it
					if (isLeftRightObject(rawScore) && !hasLeftRight) {
						return [
							Math.min(100, Math.round(rawScore.left || 0)),
							Math.min(100, Math.round(rawScore.right || 0))
						];
					}

					// If score is object but title has left/right, extract correct side
					if (isLeftRightObject(rawScore)) {
						const isLeft = baseTitle.toLowerCase().includes('left');
						return Math.min(100, Math.round((isLeft ? rawScore.left : rawScore.right) || 0));
					}

					// Regular score
					return Math.min(100, Math.round(Number(rawScore) || 0));
				}) || [];
			});

			// Calculate average from all flattened scores
			if (allScores.length > 0) {
				const total = allScores.reduce((sum, score) => sum + score, 0);
				setAvgScore(Math.round(total / allScores.length));
			}
		}
	}, [sessionData]);

	// Fetch ROM session data
	const fetchData = useCallback(
		async (romId?: string) => {
			const id = romId || session?.id;
			if (!id) return;

			setLoading(true);
			try {
				const result = await dispatch(getRomActivityStreamById({ romId: id }));
				setSessionData(result.payload as CustomRomSession);
			} catch (error) {
				console.error('[RomResultContent] Error fetching data:', error);
			} finally {
				setLoading(false);
			}
		},
		[dispatch, session?.id]
	);

	useEffect(() => {
		if (session?.id) {
			fetchData();
		}
	}, [session?.id, fetchData]);

	// Get color for mobility category
	const getColorForCategory = (score: number) => {
		if (Math.round(score) >= 90) return 'var(--color-success-600)';
		if (Math.round(score) >= 75) return 'var(--color-success-400)';
		if (Math.round(score) >= 60) return 'var(--color-warning-600)';
		if (Math.round(score) >= 40) return 'var(--color-warning-500)';
		if (Math.round(score) >= 20) return 'var(--color-error-500)';
		return 'var(--color-error-600)';
	};

	// Get category name
	const getCategoryName = (score: number) => {
		if (score >= 90) return t('Patient.data.vitalscan-rom.optimalMobility');
		if (score >= 75) return t('Patient.data.vitalscan-rom.functionalMobility');
		if (score >= 60) return t('Patient.data.vitalscan-rom.moderateRestriction');
		if (score >= 40) return t('Patient.data.vitalscan-rom.restrictedMobility');
		if (score >= 20) return t('Patient.data.vitalscan-rom.severelyRestricted');
		return t('Patient.data.vitalscan-rom.criticallyImpaired');
	};

	// Get category description
	const getCategoryDesc = (score: number) => {
		if (score >= 90) return t('Patient.data.vitalscan-rom.optimalMobilityDesc', 'Excellent range of motion');
		if (score >= 75) return t('Patient.data.vitalscan-rom.functionalMobilityDesc', 'Good functional mobility');
		if (score >= 60) return t('Patient.data.vitalscan-rom.moderateRestrictionDesc', 'Some restriction present');
		if (score >= 40) return t('Patient.data.vitalscan-rom.restrictedMobilityDesc', 'Noticeable restriction');
		if (score >= 20) return t('Patient.data.vitalscan-rom.severelyRestrictedDesc', 'Significant limitation');
		return t('Patient.data.vitalscan-rom.criticallyImpairedDesc', 'Critical mobility impairment');
	};

	if (loading) {
		return <ActivityFeedSkeleton count={5} />;
	}

	if (!sessionData?.romPatientResults?.length) {
		return (
			<Flex justify="center" align="center" style={{ padding: 'var(--spacing-8)' }}>
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={t('Admin.data.triage.noRomData', 'No ROM data available')}
				/>
			</Flex>
		);
	}

	return (
		<div className="rom-result-wrapper">
			{/* Bento Grid Layout */}
			<div className="rom-bento-grid">
				{/* Persona Banner - Left of chart, above other cards */}
				{persona && (
					<div className={`rom-persona-banner rom-bento-item rom-bento-persona rom-persona-banner--${persona.className}`}>
						<div className="rom-persona-banner__avatar">
							<Avatar src={persona.selectedIcon} />
						</div>
						<h2 className="rom-persona-banner__title">
							{t('Patient.data.vitalscan-rom.youreA', "You're a")}{' '}
							<span className="rom-persona-banner__title-highlight">{persona.title}</span>
						</h2>
					</div>
				)}

				{/* Chart Card - Right column */}
				<Card bordered={false} className="rom-mobility-card rom-bento-item rom-bento-chart">
					<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
						<Title level={4} style={{ margin: 0 }}>
							{t('Patient.data.vitalscan-rom.overallPerformance', 'Overall Performance')}
						</Title>
						<Flex align="center" gap={8} className="rom-chart-toggle--hidden">
							<Text type="secondary">{t('Patient.data.vitalscan-rom.pieChart', 'Pie')}</Text>
							<Switch
								checked={selectedChart === 'radar'}
								onChange={(checked) => setSelectedChart(checked ? 'radar' : 'pie')}
								size="small"
							/>
							<Text type="secondary">{t('Patient.data.vitalscan-rom.radarChart', 'Radar')}</Text>
						</Flex>
					</Flex>
					<div className="rom-chart-container">
						{selectedChart === 'pie' ? (
							<PieChart selectedRom={sessionData} persona={persona || { color: getColorForCategory(avgScore) }} />
						) : (
							<OldRadarChart selectedRom={sessionData} persona={persona || { color: getColorForCategory(avgScore) }} avgScore={avgScore} />
						)}
					</div>
				</Card>

				{/* Your Mobility Overview - Top right */}
				<Card bordered={false} className="rom-mobility-card rom-bento-item rom-bento-overview">
					<Flex align="center" gap={12} style={{ marginBottom: 8 }}>
						<div className="rom-card-icon-container">
							<UntitledIcon name="mobility-body" size={20} color="var(--brand-primary)" />
						</div>
						<Title level={4} style={{ margin: 0 }}>
							{t('patient.reports.mobility.mobilityOverview', 'Your Mobility Overview')}
						</Title>
					</Flex>
					<Paragraph type="secondary" style={{ margin: 0 }}>
						{t('patient.reports.mobility.mobilityOverviewDescription', 'Your mobility score reflects how well your joints move through their expected range of motion.')}
					</Paragraph>
				</Card>

				{/* Did You Know - Top right next to overview */}
				<Card bordered={false} className="rom-mobility-card rom-bento-item rom-bento-didyouknow">
					<Flex align="center" gap={12} style={{ marginBottom: 8 }}>
						<div className="rom-card-icon-container">
							<UntitledIcon name="lightbulb-03" size={20} color="var(--brand-primary)" />
						</div>
						<Title level={4} style={{ margin: 0 }}>
							{t('patient.reports.mobility.didYouKnow', 'Did You Know?')}
						</Title>
					</Flex>
					<Paragraph type="secondary" style={{ margin: 0 }}>
						{t('patient.reports.mobility.didYouKnowDescription', 'Regular movement and stretching can help maintain and improve your joint mobility over time.')}
					</Paragraph>
				</Card>

				{/* What This Means - Below overview and didyouknow */}
				<Card bordered={false} className="rom-mobility-card rom-bento-item rom-bento-whatthismeans">
					<Flex align="center" gap={12} style={{ marginBottom: 12 }}>
						<div className="rom-card-icon-container">
							<UntitledIcon name="help-circle" size={20} color="var(--brand-primary)" />
						</div>
						<Title level={4} style={{ margin: 0 }}>
							{t('patient.reports.mobility.whatThisMeans', 'What This Means')}
						</Title>
					</Flex>
					<Flex gap={8} wrap="wrap">
						<Card size="small" bordered={false} className="rom-meaning-card">
							<Text>{t('patient.reports.mobility.list1', 'Track your progress over time')}</Text>
						</Card>
						<Card size="small" bordered={false} className="rom-meaning-card">
							<Text>{t('patient.reports.mobility.list2', 'Identify areas that need attention')}</Text>
						</Card>
						<Card size="small" bordered={false} className="rom-meaning-card">
							<Text>{t('patient.reports.mobility.list3', 'Set realistic mobility goals')}</Text>
						</Card>
						<Card size="small" bordered={false} className="rom-meaning-card">
							<Text>{t('patient.reports.mobility.list4', 'Monitor improvement with exercises')}</Text>
						</Card>
					</Flex>
				</Card>

				{/* Body Score Metrics - full width */}
				<div className="rom-joints-container rom-bento-item rom-bento-full">
					<Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
						<Title level={4} style={{ margin: 0 }}>
							{t('Patient.data.vitalscan-rom.bodyScoreMetrics', 'Body Score Metrics')}
						</Title>
						<Segmented
							options={[
								{
									label: <Tooltip title="Preliminary">{t('Patient.data.vitalscan-rom.preliminary', 'P')}</Tooltip>,
									value: 'P',
								},
								{
									label: <Tooltip title="Verified">{t('Patient.data.vitalscan-rom.verified', 'V')}</Tooltip>,
									value: 'V',
								},
								{
									label: <Tooltip title="PT Verified">{t('Patient.data.vitalscan-rom.ptVerified', 'PT')}</Tooltip>,
									value: 'PT',
								},
							]}
							value={valueType}
							onChange={(value) => setValueType(value as 'P' | 'V' | 'PT')}
							size="small"
						/>
					</Flex>
					<ContentRomResultSides
						selectedRom={sessionData}
						getColorForCategory={getColorForCategory}
						getCategoryName={getCategoryName}
						getCategoryDesc={getCategoryDesc}
						isValidated={true}
						valueType={valueType}
						fetchData={fetchData}
					/>
				</div>

				{/* Mobility Persona Cards - each as individual bento item (reversed: lowest to highest) */}
				{[...mobilityOptions].reverse().map((personaItem, index) => (
					<div
						key={index}
						className={`rom-persona-card rom-bento-item ${personaItem.active ? `rom-persona-card--active rom-persona-card--${personaItem.className}` : ''}`}>
						{/* Score badge for active card */}
						{personaItem.active && (
							<div className="rom-persona-card__score">
								<Text className="rom-persona-card__score-label">Score</Text>
								<Text className="rom-persona-card__score-value">
									{Math.round(avgScore)}
								</Text>
							</div>
						)}

						{/* Icon */}
						<div className="rom-persona-card__icon">
							<Avatar
								src={personaItem.active ? personaItem.selectedIcon : personaItem.icon}
								alt={personaItem.title}
								size={40}
							/>
						</div>

						{personaItem.active ? (
							<div className="rom-persona-card__content">
								{/* Title */}
								<Title level={5} className="rom-persona-card__title">
									{personaItem.title}
								</Title>

								{/* Description */}
								<Text className="rom-persona-card__description">
									{personaItem.description}
								</Text>
							</div>
						) : (
							<>
								{/* Title */}
								<Title level={5} className="rom-persona-card__title">
									{personaItem.title}
								</Title>

								{/* Description */}
								<Text className="rom-persona-card__description">
									{personaItem.description}
								</Text>
							</>
						)}
					</div>
				))}

				{/* Rule Categories - full width */}
				<div className="rom-rule-categories rom-bento-item rom-bento-full">
					<img
						src="/assets/rule-categories.svg"
						alt={t('Patient.data.vitalscan-rom.ruleCategories', 'Mobility Categories Rule')}
						className="rom-rule-categories__image"
					/>
				</div>

				{/* Mobility Categories Collapse - full width */}
				<div className="rom-categories-container rom-bento-item rom-bento-full">
					<ContentRomResult
						selectedRom={sessionData}
						getColorForCategory={getColorForCategory}
						getCategoryName={getCategoryName}
						fetchData={fetchData}
						isValidated={true}
					/>
				</div>
			</div>
		</div>
	);
};

export default RomResultContent;
