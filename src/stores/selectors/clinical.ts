/**
 * Clinical Data Selectors
 *
 * @description Memoized selectors for clinical assessments (ROM, Rehab, Posture, etc.)
 * @performance Prevents unnecessary re-renders with reselect
 */

import { createSelector } from 'reselect';
import type { ReduxState } from '@stores/index';

// ============================================================================
// BASE SELECTORS (Input Selectors)
// ============================================================================

/** Select ROM slice */
export const selectRomSlice = (state: ReduxState) => state.rom;

/** Select Rehab slice */
export const selectRehabSlice = (state: ReduxState) => state.rehab;

/** Select Performance slice */
export const selectPerformanceSlice = (state: ReduxState) => state.performance;

/** Select Postures slice */
export const selectPosturesSlice = (state: ReduxState) => state.postures;

/** Select Posture Analysis slice */
export const selectPostureAnalysisSlice = (state: ReduxState) =>
	state.postureAnalysis;

/** Select Pain Assessment slice */
export const selectPainAssessmentSlice = (state: ReduxState) =>
	state.painAssessment;

/** Select Functional Goals slice */
export const selectFunctionalGoalsSlice = (state: ReduxState) =>
	state.functionalGoals;

/** Select AI Assistant slice */
export const selectPatientDetailSlice = (state: ReduxState) =>
	state.patientDetail;

// ============================================================================
// ROM SELECTORS
// ============================================================================

/**
 * Select ROM main data
 * @memoized Returns ROM assessment data
 */
export const selectRomData = createSelector([selectRomSlice], rom => rom.main);

/**
 * Select ROM exercises
 * @memoized Returns ROM exercises array
 */
export const selectRomExercises = createSelector(
	[selectRomData],
	main => main.exercises || [],
);

/**
 * Select ROM results
 * @memoized Returns ROM results exercises
 */
export const selectRomResults = createSelector(
	[selectRomData],
	main => main.resultsExercises || [],
);

/**
 * Select ROM upload progress
 * @memoized Returns upload progress percentage
 */
export const selectRomUploadProgress = createSelector(
	[selectRomData],
	main => main.uploadProgress || 0,
);

/**
 * Select ROM transition time
 * @memoized Returns transition time setting
 */
export const selectRomTransitionTime = createSelector(
	[selectRomData],
	main => main.transitionTime || 5,
);

/**
 * Check if ROM tutorial was watched
 * @memoized Returns tutorial watched flag
 */
export const selectRomTutorialWatched = createSelector(
	[selectRomData],
	main => main.watchedTutorial || false,
);

/**
 * Select ROM exercises count
 * @memoized Derived count
 */
export const selectRomExercisesCount = createSelector(
	[selectRomExercises],
	exercises => exercises.length,
);

// ============================================================================
// REHAB SELECTORS
// ============================================================================

/**
 * Select Rehab main data
 * @memoized Returns rehab program data
 */
export const selectRehabData = createSelector(
	[selectRehabSlice],
	rehab => rehab.main,
);

/**
 * Select Rehab exercises
 * @memoized Returns rehab exercises array
 */
export const selectRehabExercises = createSelector(
	[selectRehabData],
	main => main.exercises || [],
);

/**
 * Select Rehab results
 * @memoized Returns rehab results exercises
 */
export const selectRehabResults = createSelector(
	[selectRehabData],
	main => main.resultsExercises || [],
);

/**
 * Select Rehab upload progress
 * @memoized Returns upload progress percentage
 */
export const selectRehabUploadProgress = createSelector(
	[selectRehabData],
	main => main.uploadProgress || 0,
);

/**
 * Select Rehab exercises count
 * @memoized Derived count
 */
export const selectRehabExercisesCount = createSelector(
	[selectRehabExercises],
	exercises => exercises.length,
);

// ============================================================================
// PERFORMANCE SELECTORS
// ============================================================================

/**
 * Select Performance main data
 * @memoized Returns performance metrics
 */
export const selectPerformanceData = createSelector(
	[selectPerformanceSlice],
	performance => performance.main,
);

/**
 * Select Performance exercises
 * @memoized Returns performance exercises array
 */
export const selectPerformanceExercises = createSelector(
	[selectPerformanceData],
	main => main.exercises || [],
);

/**
 * Select Performance results
 * @memoized Returns performance results
 */
export const selectPerformanceResults = createSelector(
	[selectPerformanceData],
	main => main.resultsExercises || [],
);

// ============================================================================
// POSTURE SELECTORS
// ============================================================================

/**
 * Select Postures main data
 * @memoized Returns posture scan data
 */
export const selectPosturesData = createSelector(
	[selectPosturesSlice],
	postures => postures.postures,
);

/**
 * Select Posture Analysis main data
 * @memoized Returns posture analysis results
 */
export const selectPostureAnalysisData = createSelector(
	[selectPostureAnalysisSlice],
	postureAnalysis => postureAnalysis.postureAnalysis,
);

/**
 * Select combined posture data
 * @memoized Combines postures and analysis
 * @performance Critical for posture views
 */
export const selectCombinedPostureData = createSelector(
	[selectPosturesData, selectPostureAnalysisData],
	(postures, analysis) => ({
		postures,
		analysis,
	}),
);

/**
 * Select Posture upload progress
 * @memoized Returns posture upload progress
 */
export const selectPostureUploadProgress = createSelector(
	[selectPosturesData],
	postures => postures.uploadProgress || 0,
);

/**
 * Select Posture angles
 * @memoized Returns angle measurements
 */
export const selectPostureAngles = createSelector(
	[selectPostureAnalysisData],
	analysis => analysis.angles || [],
);

/**
 * Select Posture deviations
 * @memoized Returns posture deviations
 */
export const selectPostureDeviations = createSelector(
	[selectPostureAnalysisData],
	analysis => analysis.deviations || [],
);

// ============================================================================
// PAIN ASSESSMENT SELECTORS
// ============================================================================

/**
 * Select Pain Assessment data
 * @memoized Returns pain assessment info
 */
export const selectPainAssessmentData = createSelector(
	[selectPainAssessmentSlice],
	painAssessment => painAssessment.painAssessmentInfo,
);

/**
 * Select Pain locations
 * @memoized Returns reported pain locations
 */
export const selectPainLocations = createSelector(
	[selectPainAssessmentData],
	data => data.painLocations || [],
);

/**
 * Select Pain severity
 * @memoized Returns pain severity scores
 */
export const selectPainSeverity = createSelector(
	[selectPainAssessmentData],
	data => data.severity || null,
);

// ============================================================================
// FUNCTIONAL GOALS SELECTORS
// ============================================================================

/**
 * Select Functional Goals data
 * @memoized Returns functional goals
 */
export const selectFunctionalGoalsData = createSelector(
	[selectFunctionalGoalsSlice],
	functionalGoals => functionalGoals.functionalGoals,
);

/**
 * Select Active functional goals
 * @memoized Filters active goals
 */
export const selectActiveFunctionalGoals = createSelector(
	[selectFunctionalGoalsData],
	goals => (goals || []).filter((goal: unknown) => goal?.active),
);

/**
 * Select Functional goals count
 * @memoized Derived count
 */
export const selectFunctionalGoalsCount = createSelector(
	[selectActiveFunctionalGoals],
	goals => goals.length,
);

// ============================================================================
// AI ASSISTANT SELECTORS
// ============================================================================

/**
 * Select AI Assistant main data
 * @memoized Returns AI assistant state
 */
export const selectPatientDetailData = createSelector(
	[selectPatientDetailSlice],
	_patientDetail => aiAssistant.aiAssistant,
);

/**
 * Check if AI Assistant is collapsible
 * @memoized Returns collapsible state
 */
export const selectIsPatientDetailCollapsible = createSelector(
	[selectPatientDetailData],
	_patientDetail => aiAssistant.isCollapsible || false,
);

/**
 * Select AI Assistant program data
 * @memoized Returns program data
 */
export const selectPatientDetailProgram = createSelector(
	[selectPatientDetailSlice],
	_patientDetail => aiAssistant.program,
);

/**
 * Select AI Assistant exercises
 * @memoized Returns AI-suggested exercises
 */
export const selectPatientDetailExercises = createSelector(
	[selectPatientDetailProgram],
	program => program.program || [],
);

// ============================================================================
// CROSS-ASSESSMENT SELECTORS
// ============================================================================

/**
 * Select all clinical data by type
 * @param type Assessment type
 * @memoized Returns assessment data for specific type
 */
export const selectClinicalDataByType = (
	type: 'rom' | 'rehab' | 'performance' | 'posture' | 'pain' | 'goals',
) =>
	createSelector(
		[
			selectRomData,
			selectRehabData,
			selectPerformanceData,
			selectCombinedPostureData,
			selectPainAssessmentData,
			selectFunctionalGoalsData,
		],
		(rom, rehab, performance, posture, pain, goals) => {
			switch (type) {
				case 'rom':
					return rom;
				case 'rehab':
					return rehab;
				case 'performance':
					return performance;
				case 'posture':
					return posture;
				case 'pain':
					return pain;
				case 'goals':
					return goals;
				default:
					return null;
			}
		},
	);

/**
 * Select all upload progress states
 * @memoized Combines upload progress from all assessments
 * @performance Useful for global progress indicators
 */
export const selectAllUploadProgress = createSelector(
	[
		selectRomUploadProgress,
		selectRehabUploadProgress,
		selectPostureUploadProgress,
	],
	(romProgress, rehabProgress, postureProgress) => ({
		rom: romProgress,
		rehab: rehabProgress,
		posture: postureProgress,
		average: Math.round((romProgress + rehabProgress + postureProgress) / 3),
	}),
);

/**
 * Check if any assessment is uploading
 * @memoized Returns true if any upload in progress
 */
export const selectIsAnyAssessmentUploading = createSelector(
	[selectAllUploadProgress],
	progress => {
		return progress.rom > 0 || progress.rehab > 0 || progress.posture > 0;
	},
);

/**
 * Select total exercises count across all assessments
 * @memoized Sums exercises from ROM, Rehab, Performance
 */
export const selectTotalExercisesCount = createSelector(
	[
		selectRomExercisesCount,
		selectRehabExercisesCount,
		selectPerformanceExercises,
	],
	(romCount, rehabCount, performanceExercises) => {
		return romCount + rehabCount + performanceExercises.length;
	},
);
