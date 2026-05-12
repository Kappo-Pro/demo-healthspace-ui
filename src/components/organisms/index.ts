/**
 * Organisms - Barrel Export
 *
 * Central export file for organism components
 */

export { AssessmentStatusBanner } from './AssessmentStatusBanner';
export type {
	AssessmentData,
	AssessmentStatusBannerProps,
} from './AssessmentStatusBanner';

export { DashboardAlerts } from './DashboardAlerts';
export type { DashboardAlertsProps } from './DashboardAlerts';

export { RecommendationsList } from './RecommendationsList'; // EPIC-019-S4
export type { RecommendationsListProps } from './RecommendationsList';

export {
	ControlRecommendations,
	PersonalizedRecommendations,
} from './RecommendationsVariants'; // EPIC-025-S2

export { PostureJourneyView } from './PostureJourneyView'; // Story 2.1
export type { PostureJourneyViewProps } from './PostureJourneyView';

export { PhotogrammetryCapture } from './OPhotogrammetryCapture'; // EPIC-001-S14
export type { PhotogrammetryCaptureProps } from './OPhotogrammetryCapture';

export { PhotogrammetryViewer } from './OPhotogrammetryViewer'; // EPIC-001-S14
export type { PhotogrammetryViewerProps } from './OPhotogrammetryViewer';

// Add other organism exports as needed
