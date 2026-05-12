/**
 * PainAssessmentTab - Displays detailed pain assessment with locations, intensity, and functional impact
 *
 * This tab provides comprehensive pain data visualization for clinicians to make informed
 * treatment decisions. Includes pain locations, intensity scoring (0-10 scale), characteristics,
 * temporal patterns, and functional impact assessments.
 *
 * @component
 * @example
 * ```tsx
 * // Basic usage
 * <PainAssessmentTab data={painData} />
 *
 * // With all data populated
 * <PainAssessmentTab data={{
 *   locations: [
 *     { name: 'Lower Back', isPrimary: true },
 *     { name: 'Right Hip', isPrimary: false }
 *   ],
 *   intensity: 7,
 *   characteristics: ['Sharp', 'Radiating'],
 *   temporalPatterns: {
 *     frequency: 'Constant',
 *     duration: 'All day',
 *     aggravatingFactors: 'Sitting for long periods',
 *     relievingFactors: 'Heat therapy'
 *   },
 *   functionalImpact: {
 *     mobility: { description: 'Difficulty walking', severity: 'high' },
 *     sleep: { description: 'Wakes up 2-3 times', severity: 'medium' }
 *   }
 * }} />
 * ```
 *
 * @param {TPainData} data - Pain assessment data to display
 *
 * @returns {JSX.Element} Pain assessment tab with 2-column responsive layout
 *
 * @see {@link SeverityIndicator} - Color-coded severity badges (reused across impact areas)
 *
 * @features
 * - Pain locations with primary location highlighting (blue tag)
 * - Visual severity indicators for pain intensity (0-10 scale → Low/Medium/High)
 * - Pain characteristics as tags (sharp, dull, burning, etc.)
 * - Temporal patterns (frequency, duration, time of day, aggravating/relieving factors)
 * - Functional impact with severity indicators (mobility, sleep, activities, self-care)
 * - Responsive 2-column layout (stacks on mobile)
 * - Empty states for missing data sections
 *
 * @businessLogic
 * - Pain intensity 0-3: Low severity (green)
 * - Pain intensity 4-6: Medium severity (orange)
 * - Pain intensity 7-10: High severity (red)
 * - Primary pain location highlighted with blue tag
 * - Functional impacts use consistent SeverityIndicator component
 *
 * @responsive
 * - Mobile (<768px): Single column (all sections stacked)
 * - Tablet/Desktop (≥768px): Two columns (locations/intensity/impact left, characteristics/patterns right)
 *
 * @author Winston (Tech Lead)
 * @since October 2025
 * @version 2.3.0 (Story 5.2: Comprehensive JSDoc documentation)
 * @story Story 2.2 - Create PainAssessmentTab Component
 * @story Story 5.2 - Documentation
 */

import React from 'react';
import { Tag } from 'antd';
import styled from 'styled-components';
import { SeverityIndicator } from '../components/SeverityIndicator';
import { useTypedTranslation } from '@hooks/useTypedTranslation';

/**
 * Pain assessment data structure
 */
export interface TPainData {
	locations?:
		| Array<{
			name: string;
			isPrimary?: boolean;
		}>
		| string[];
	intensity?: number; // 0-10 scale
	characteristics?: string[]; // 'sharp', 'dull', 'burning', etc.
	temporalPatterns?: {
		frequency?: string;
		duration?: string;
		timeOfDay?: string;
		aggravatingFactors?: string;
		relievingFactors?: string;
	};
	functionalImpact?: {
		mobility?: {
			description: string;
			severity?: 'low' | 'medium' | 'high';
		};
		sleep?: {
			description: string;
			severity?: 'low' | 'medium' | 'high';
		};
		activities?: {
			description: string;
			severity?: 'low' | 'medium' | 'high';
		};
		selfCare?: {
			description: string;
			severity?: 'low' | 'medium' | 'high';
		};
	};
}

/**
 * Props interface for PainAssessmentTab component
 *
 * @interface PainAssessmentTabProps
 */
export interface PainAssessmentTabProps {
	/**
	 * Pain assessment data object containing all pain-related information
	 * @type {TPainData}
	 * @required
	 * @see {@link TPainData} for full data structure
	 * @example
	 * ```tsx
	 * data={{
	 *   locations: [{ name: 'Lower Back', isPrimary: true }],
	 *   intensity: 7,
	 *   characteristics: ['Sharp', 'Radiating'],
	 *   temporalPatterns: {
	 *     frequency: 'Constant',
	 *     aggravatingFactors: 'Sitting',
	 *     relievingFactors: 'Heat therapy'
	 *   },
	 *   functionalImpact: {
	 *     mobility: { description: 'Difficulty walking', severity: 'high' }
	 *   }
	 * }}
	 * ```
	 */
	data: TPainData;
}

/**
 * PainAssessmentTab - Displays pain assessment with locations, intensity, and impact
 *
 * Features:
 * - Pain locations with primary location highlighting
 * - Visual severity indicators for pain intensity (0-10 scale)
 * - Pain characteristics as tags
 * - Temporal patterns with labeled sections
 * - Functional impact with severity indicators
 * - Responsive layout (mobile/tablet/desktop)
 * - Empty states for missing data
 *
 * Business Logic:
 * - Pain intensity mapped to severity levels (0-3: Low, 4-6: Medium, 7-10: High)
 * - Functional impacts use SeverityIndicator for consistency
 * - Primary location highlighted with blue tag
 */
export const PainAssessmentTab: React.FC<PainAssessmentTabProps> = ({ data }) => {
	const { t } = useTypedTranslation();

	// Check if we have any pain data
	const hasPainData = data && Object.keys(data).length > 0;

	if (!hasPainData) {
		return (
			<EmptyContainer>
				<EmptyMessage>{t('Admin.data.evaluation.painAssessment.noDataAvailable')}</EmptyMessage>
			</EmptyContainer>
		);
	}

	// Calculate pain severity level for SeverityIndicator
	const painSeverityLevel = getPainSeverityLevel(data.intensity);

	return (
		<PainContainer>
			<ContentGrid>
				{/* Left Column */}
				<LeftColumn>
					{/* Pain Locations */}
					<Section>
						<SectionTitle>{t('Admin.data.evaluation.painAssessment.sections.locations.title')}</SectionTitle>
						{data.locations && data.locations.length > 0 ? (
							<LocationsContainer>
								{data.locations.map((location, index) => {
									// Handle both object and string formats
									const locationName =
										typeof location === 'string' ? location : location.name;
									const isPrimary =
										typeof location === 'object' ? location.isPrimary : false;

									return (
										<LocationTag
											key={index}
											$isPrimary={isPrimary}
										>
											{locationName}
											{isPrimary && ` ${t('Admin.data.evaluation.painAssessment.sections.locations.primary')}`}
										</LocationTag>
									);
								})}
							</LocationsContainer>
						) : (
							<EmptyState>{t('Admin.data.evaluation.painAssessment.sections.locations.noLocations')}</EmptyState>
						)}
					</Section>

					{/* Pain Intensity */}
					<Section>
						<SectionTitle>{t('Admin.data.evaluation.painAssessment.sections.intensity.title')}</SectionTitle>
						{data.intensity !== undefined && data.intensity !== null ? (
							<IntensityContainer>
								<IntensityScore>{data.intensity}/10</IntensityScore>
								<SeverityIndicator
									level={painSeverityLevel}
									label={getPainSeverityLabel(data.intensity, t)}
								/>
								<IntensityScale>
									{t('Admin.data.evaluation.painAssessment.sections.intensity.scale')}
								</IntensityScale>
							</IntensityContainer>
						) : (
							<EmptyState>{t('Admin.data.evaluation.painAssessment.sections.intensity.notAssessed')}</EmptyState>
						)}
					</Section>

					{/* Functional Impact */}
					<Section>
						<SectionTitle>{t('Admin.data.evaluation.painAssessment.sections.functionalImpact.title')}</SectionTitle>
						{data.functionalImpact && Object.keys(data.functionalImpact).length > 0 ? (
							<ImpactList>
								{data.functionalImpact.mobility && (
									<ImpactItem>
										<ImpactLabel>{t('Admin.data.evaluation.painAssessment.sections.functionalImpact.mobility')}</ImpactLabel>
										<ImpactValue>
											<span>{data.functionalImpact.mobility.description}</span>
											{data.functionalImpact.mobility.severity && (
												<SeverityIndicator
													level={data.functionalImpact.mobility.severity}
												/>
											)}
										</ImpactValue>
									</ImpactItem>
								)}
								{data.functionalImpact.sleep && (
									<ImpactItem>
										<ImpactLabel>{t('Admin.data.evaluation.painAssessment.sections.functionalImpact.sleep')}</ImpactLabel>
										<ImpactValue>
											<span>{data.functionalImpact.sleep.description}</span>
											{data.functionalImpact.sleep.severity && (
												<SeverityIndicator level={data.functionalImpact.sleep.severity} />
											)}
										</ImpactValue>
									</ImpactItem>
								)}
								{data.functionalImpact.activities && (
									<ImpactItem>
										<ImpactLabel>{t('Admin.data.evaluation.painAssessment.sections.functionalImpact.workActivities')}</ImpactLabel>
										<ImpactValue>
											<span>{data.functionalImpact.activities.description}</span>
											{data.functionalImpact.activities.severity && (
												<SeverityIndicator
													level={data.functionalImpact.activities.severity}
												/>
											)}
										</ImpactValue>
									</ImpactItem>
								)}
								{data.functionalImpact.selfCare && (
									<ImpactItem>
										<ImpactLabel>{t('Admin.data.evaluation.painAssessment.sections.functionalImpact.selfCare')}</ImpactLabel>
										<ImpactValue>
											<span>{data.functionalImpact.selfCare.description}</span>
											{data.functionalImpact.selfCare.severity && (
												<SeverityIndicator
													level={data.functionalImpact.selfCare.severity}
												/>
											)}
										</ImpactValue>
									</ImpactItem>
								)}
							</ImpactList>
						) : (
							<EmptyState>{t('Admin.data.evaluation.painAssessment.sections.functionalImpact.noImpact')}</EmptyState>
						)}
					</Section>
				</LeftColumn>

				{/* Right Column */}
				<RightColumn>
					{/* Pain Characteristics */}
					<Section>
						<SectionTitle>{t('Admin.data.evaluation.painAssessment.sections.characteristics.title')}</SectionTitle>
						{data.characteristics && data.characteristics.length > 0 ? (
							<CharacteristicsContainer>
								{data.characteristics.map((characteristic, index) => (
									<CharacteristicTag key={index}>{characteristic}</CharacteristicTag>
								))}
							</CharacteristicsContainer>
						) : (
							<EmptyState>{t('Admin.data.evaluation.painAssessment.sections.characteristics.noCharacteristics')}</EmptyState>
						)}
					</Section>

					{/* Temporal Patterns */}
					<Section>
						<SectionTitle>{t('Admin.data.evaluation.painAssessment.sections.temporalPatterns.title')}</SectionTitle>
						{data.temporalPatterns && Object.keys(data.temporalPatterns).length > 0 ? (
							<PatternsList>
								{data.temporalPatterns.frequency && (
									<PatternItem>
										<PatternLabel>{t('Admin.data.evaluation.painAssessment.sections.temporalPatterns.frequency')}</PatternLabel>
										<PatternValue>{data.temporalPatterns.frequency}</PatternValue>
									</PatternItem>
								)}
								{data.temporalPatterns.duration && (
									<PatternItem>
										<PatternLabel>{t('Admin.data.evaluation.painAssessment.sections.temporalPatterns.duration')}</PatternLabel>
										<PatternValue>{data.temporalPatterns.duration}</PatternValue>
									</PatternItem>
								)}
								{data.temporalPatterns.timeOfDay && (
									<PatternItem>
										<PatternLabel>{t('Admin.data.evaluation.painAssessment.sections.temporalPatterns.timeOfDay')}</PatternLabel>
										<PatternValue>{data.temporalPatterns.timeOfDay}</PatternValue>
									</PatternItem>
								)}
								{data.temporalPatterns.aggravatingFactors && (
									<PatternItem>
										<PatternLabel>{t('Admin.data.evaluation.painAssessment.sections.temporalPatterns.aggravatingFactors')}</PatternLabel>
										<PatternValue>
											{data.temporalPatterns.aggravatingFactors}
										</PatternValue>
									</PatternItem>
								)}
								{data.temporalPatterns.relievingFactors && (
									<PatternItem>
										<PatternLabel>{t('Admin.data.evaluation.painAssessment.sections.temporalPatterns.relievingFactors')}</PatternLabel>
										<PatternValue>
											{data.temporalPatterns.relievingFactors}
										</PatternValue>
									</PatternItem>
								)}
							</PatternsList>
						) : (
							<EmptyState>{t('Admin.data.evaluation.painAssessment.sections.temporalPatterns.noPatterns')}</EmptyState>
						)}
					</Section>
				</RightColumn>
			</ContentGrid>
		</PainContainer>
	);
};

/**
 * Get severity level based on pain intensity (0-10 scale)
 * @param intensity - Pain intensity value (0-10)
 * @returns Severity level (low/medium/high)
 */
function getPainSeverityLevel(intensity: number | undefined): 'low' | 'medium' | 'high' {
	if (intensity === undefined || intensity === null) return 'low';
	if (intensity <= 3) return 'low';
	if (intensity <= 6) return 'medium';
	return 'high';
}

/**
 * Get pain severity label for display
 * @param intensity - Pain intensity value (0-10)
 * @returns Human-readable severity label
 */
function getPainSeverityLabel(intensity: number | undefined, t: (key: string) => string): string {
	if (intensity === undefined || intensity === null) return t('Admin.data.evaluation.painAssessment.sections.intensity.notAssessed');
	if (intensity <= 3) return t('Admin.data.evaluation.painAssessment.sections.intensity.mildPain');
	if (intensity <= 6) return t('Admin.data.evaluation.painAssessment.sections.intensity.moderatePain');
	return t('Admin.data.evaluation.painAssessment.sections.intensity.severePain');
}

// ============================================================
// Styled Components
// ============================================================

const PainContainer = styled.div`
	padding: var(--spacing-6);
	background: var(--surface-primary);
`;

const ContentGrid = styled.div`
	display: grid;
	gap: var(--spacing-8);

	/* Mobile: Stacked */
	@media (max-width: 767px) {
		grid-template-columns: 1fr;
	}

	/* Tablet/Desktop: Two columns */
	@media (min-width: 768px) {
		grid-template-columns: 1fr 1fr;
	}
`;

const LeftColumn = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-6);
`;

const RightColumn = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-6);
`;

const Section = styled.div`
	padding: var(--spacing-4);
	background: var(--color-background-secondary);
	border-radius: var(--radius-md);
	border: 1px solid var(--border-subtle);
`;

const SectionTitle = styled.h3`
	margin: 0 0 var(--spacing-4) 0;
	font-size: var(--font-size-h4);
	font-weight: 600;
	color: var(--text-primary);
`;

const LocationsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-2);
`;

const LocationTag = styled(Tag)<{ $isPrimary?: boolean }>`
	margin: 0;
	padding: var(--spacing-1) var(--spacing-2);
	border-radius: var(--radius-sm);

	${({ $isPrimary }) =>
		$isPrimary &&
		`
		background-color: var(--brand-primary-light);
		border-color: var(--brand-primary);
		color: var(--brand-primary-dark);
		font-weight: 600;
	`}
`;

const IntensityContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-2);
	align-items: flex-start;
`;

const IntensityScore = styled.div`
	font-size: var(--font-size-2xl);
	font-weight: 700;
	color: var(--text-primary);
`;

const IntensityScale = styled.div`
	font-size: var(--font-size-sm);
	color: var(--text-tertiary);
	font-style: italic;
`;

const CharacteristicsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-2);
`;

const CharacteristicTag = styled(Tag)`
	margin: 0;
	padding: var(--spacing-1) var(--spacing-2);
	border-radius: var(--radius-sm);
	background: var(--color-background-tertiary);
	border: 1px solid var(--border-default);
`;

const PatternsList = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-4);
`;

const PatternItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-1);
`;

const PatternLabel = styled.span`
	font-weight: 600;
	color: var(--text-secondary);
	font-size: var(--font-size-sm);
`;

const PatternValue = styled.span`
	color: var(--text-primary);
	line-height: 1.5;
`;

const ImpactList = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-4);
`;

const ImpactItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: var(--spacing-1);
`;

const ImpactLabel = styled.span`
	font-weight: 600;
	color: var(--text-secondary);
	font-size: var(--font-size-sm);
`;

const ImpactValue = styled.div`
	display: flex;
	align-items: center;
	gap: var(--spacing-2);
	color: var(--text-primary);
	line-height: 1.5;
	flex-wrap: wrap;
`;

const EmptyState = styled.p`
	margin: 0;
	padding: var(--spacing-4) 0;
	color: var(--text-tertiary);
	font-style: italic;
`;

const EmptyContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 300px;
	padding: var(--spacing-8);
`;

const EmptyMessage = styled.p`
	margin: 0;
	font-size: var(--font-size-lg);
	color: var(--text-tertiary);
	font-style: italic;
`;
