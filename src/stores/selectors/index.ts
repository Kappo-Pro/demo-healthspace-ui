/**
 * Redux Selectors Index
 *
 * @description Central export point for all memoized selectors
 * @performance Using reselect for memoization prevents unnecessary re-renders
 *
 * @usage
 * ```typescript
 * import { selectUserProfile, selectAllActivePatients } from '@stores/selectors';
 * import { useTypedSelector } from '@stores/index';
 *
 * function MyComponent() {
 *   const userProfile = useTypedSelector(selectUserProfile);
 *   const patients = useTypedSelector(selectAllActivePatients);
 *   // Component only re-renders when these specific values change
 * }
 * ```
 *
 * @see SELECTORS.md for detailed documentation
 */

// ============================================================================
// PATIENT SELECTORS
// ============================================================================

export {
	selectActivePatientCount,
	selectAdminPatientCounts,
	// Admin
	selectAdminPatientData,

	// Admin Dashboard Patient (Optimized)
	selectAdminPatientLoading,
	selectAdminPatientLoadingStates,
	selectAdminPatientSlice,
	selectAdminPatientStatsCount,
	selectAdminPatientUnassignedLoader,
	// Combined/Computed
	selectAllActivePatients,
	selectAllAdminListData,
	selectAllEscalationPatients,
	selectAllFollowUpPatients,
	selectAllOutOfParamsPatients,
	selectAllPendingPatients,
	selectAllReviewedPatients,
	selectConsentFormPatientsData,
	// Escalation
	selectEscalationByType,
	selectEscalationRequiredSlice,
	// Follow up
	selectFollowUpByType,
	selectFollowUpRequiredSlice,
	selectHasMoreNewPatients,
	selectNewPatientsCount,
	// New patients
	selectNewPatientsData,
	selectNewPatientsPagination,
	// Base selectors
	selectNewPatientsSlice,
	selectNewUsersCount,
	// Out of params
	selectOutOfParamsByType,
	selectOutOfParamsSlice,
	selectPatientCountsByStatus,
	selectPatientsByStatus,
	// Pending patients
	selectPendingByType,
	selectPendingPatientsCount,
	selectPendingReviewSlice,
	selectRegisteredPatientsData,
	selectRegisteredPatientsPagination,
	// Reviewed patients
	selectReviewedByType,
	selectReviewedPatientsCount,
	selectReviewedSlice,
	selectUnassignedPatientsData,
	selectUnassignedPatientsPagination,
} from './patients';

// ============================================================================
// USER SELECTORS
// ============================================================================

export {
	selectAdminUsers,
	selectAllContacts,
	// User management
	selectAllUsers,
	selectAreContactsLoading,
	selectContactsCount,
	selectContactsSlice,
	selectFusionAuthUserId,
	selectHasAdminPermissions,
	selectIsAdmin,
	selectIsAuthenticated,
	selectIsPatient,
	selectIsPhysiotherapist,
	// Bulk operations
	selectIsSendingBulkMail,
	selectIsSuperAdmin,
	// Status
	selectIsUserActive,
	selectPatientUsers,
	// Contacts
	selectSelectedContact,
	selectSelectedContactId,
	selectUploadProgress,
	selectUserDisplayInfo,
	selectUserEmail,
	selectUserFullName,
	selectUserId,
	selectUserImageUrl,
	// Computed
	selectUserInitials,
	selectUserLatestWeight,
	selectUserManagementSlice,

	// Profile
	selectUserProfile,
	// Roles
	selectUserRole,
	selectUserRoleDisplay,
	// Base selectors
	selectUserSlice,
	selectUserWeight,
	selectUsersByRole,
	selectUsersCount,
} from './user';

// ============================================================================
// CLINICAL DATA SELECTORS
// ============================================================================

export {
	selectActiveFunctionalGoals,
	selectAllUploadProgress,
	// Cross-assessment
	selectClinicalDataByType,
	selectCombinedPostureData,
	selectFunctionalGoalsCount,
	// Functional Goals
	selectFunctionalGoalsData,
	selectFunctionalGoalsSlice,
	selectIsAnyAssessmentUploading,
	selectIsPatientDetailCollapsible,
	// Pain Assessment
	selectPainAssessmentData,
	selectPainAssessmentSlice,
	selectPainLocations,
	selectPainSeverity,
	// AI Assistant
	selectPatientDetailData,
	selectPatientDetailExercises,
	selectPatientDetailProgram,
	selectPatientDetailSlice,
	// Performance
	selectPerformanceData,
	selectPerformanceExercises,
	selectPerformanceResults,
	selectPerformanceSlice,
	selectPostureAnalysisData,
	selectPostureAnalysisSlice,
	selectPostureAngles,
	selectPostureDeviations,
	selectPostureUploadProgress,
	// Posture
	selectPosturesData,
	selectPosturesSlice,
	// Rehab
	selectRehabData,
	selectRehabExercises,
	selectRehabExercisesCount,
	selectRehabResults,
	selectRehabSlice,
	selectRehabUploadProgress,
	// ROM
	selectRomData,
	selectRomExercises,
	selectRomExercisesCount,
	selectRomResults,
	// Base selectors
	selectRomSlice,
	selectRomTransitionTime,
	selectRomTutorialWatched,
	selectRomUploadProgress,
	selectTotalExercisesCount,
} from './clinical';

// ============================================================================
// APP SELECTORS
// ============================================================================

export {
	selectActiveSurveys,
	selectActiveSurveysCount,
	// Activity Stream
	selectActivityStreamData,
	selectActivityStreamSlice,
	// Reports
	selectAllReports,
	// Cross-app
	selectAppLoadingStates,
	selectAppNotificationCount,
	selectAppTheme,
	selectBandwidthSetting,
	selectHasOpenAiKey,
	selectIsAnyResourceLoading,
	selectIsOnBoardingComplete,
	selectIsSelfRegistrationActive,
	// My Library
	selectLibraryItems,
	selectLibraryItemsByCategory,
	selectLibraryItemsCount,
	selectMyLibrarySlice,
	// Onboarding
	selectOnBoardData,
	selectOnBoardSlice,
	selectOnBoardingCurrentStep,
	selectOnBoardingProgress,
	selectOnBoardingTotalSteps,
	selectRecentActivities,
	selectRecentReports,
	selectReportsByType,
	selectReportsCount,
	selectReportsSlice,
	selectSavedTags,
	selectSavedUserPlans,
	selectSelfRegistration,
	// Settings
	selectSettingsData,
	// Base selectors
	selectSettingsSlice,
	// Survey
	selectSurveyData,
	selectSurveyResponses,
	selectSurveySlice,
	selectUnreadActivitiesCount,
} from './app';

// ============================================================================
// SELECTOR UTILITIES
// ============================================================================

/**
 * Selector naming conventions:
 *
 * - select[Entity]Slice - Base selector for Redux slice
 * - select[Entity]Data - Main data from entity
 * - select[Entities] - Array of entities
 * - select[Entity]Count - Derived count
 * - selectIs[Condition] - Boolean checks
 * - selectHas[Feature] - Boolean checks for features
 * - select[Entity]By[Criteria] - Parameterized selectors
 * - selectAll[Entities] - Combined entities
 *
 * @example
 * selectUserSlice - Base selector
 * selectUserProfile - Main profile data
 * selectAllActivePatients - Combined array
 * selectActivePatientCount - Derived count
 * selectIsAdmin - Boolean check
 * selectPatientsByStatus('reviewed') - Parameterized
 */

/**
 * Performance notes:
 *
 * - All selectors use reselect for memoization
 * - Selectors only recompute when input values change
 * - Prevents unnecessary component re-renders
 * - Derived data is cached until dependencies change
 *
 * @see https://redux.js.org/usage/deriving-data-selectors
 * @see https://github.com/reduxjs/reselect
 */
