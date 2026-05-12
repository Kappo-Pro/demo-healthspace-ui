/**
 * Patient Selectors
 *
 * @description Memoized selectors for patient-related state
 * @performance Prevents unnecessary re-renders with reselect
 */

import { createSelector } from 'reselect';
import type { ReduxState } from '@stores/index';

// ============================================================================
// BASE SELECTORS (Input Selectors)
// ============================================================================

/** Select new patients slice */
export const selectNewPatientsSlice = (state: ReduxState) => state.newPatients;

/** Select reviewed patients slice */
export const selectReviewedSlice = (state: ReduxState) => state.reviewed;

/** Select pending review patients slice */
export const selectPendingReviewSlice = (state: ReduxState) => state.pendingReview;

/** Select out of params patients slice */
export const selectOutOfParamsSlice = (state: ReduxState) => state.outOfParams;

/** Select escalation required patients slice */
export const selectEscalationRequiredSlice = (state: ReduxState) => state.escalationRequired;

/** Select follow up required patients slice */
export const selectFollowUpRequiredSlice = (state: ReduxState) => state.followUpRequired;

/** Select admin dashboard patient slice */
export const selectAdminPatientSlice = (state: ReduxState) => state.adminDashboardPatient;

// ============================================================================
// MEMOIZED SELECTORS (Derived Data)
// ============================================================================

/**
 * Select new patients data array
 * @memoized Only recomputes when newPatients slice changes
 */
export const selectNewPatientsData = createSelector(
  [selectNewPatientsSlice],
  (newPatients) => newPatients.data
);

/**
 * Select new patients count
 * @memoized Only recomputes when data array changes
 */
export const selectNewPatientsCount = createSelector(
  [selectNewPatientsData],
  (data) => data.length
);

/**
 * Select reviewed patients by assessment type
 * @memoized Returns object with vitalscan-rom, rehab, evaluation, survey, postures
 */
export const selectReviewedByType = createSelector(
  [selectReviewedSlice],
  (reviewed) => ({
    vitalscan-rom: reviewed.vitalscan-rom.users,
    rehab: reviewed.rehab.users,
    evaluation: reviewed.evaluation.users,
    survey: reviewed.survey.users,
    postures: reviewed.postures.users,
  })
);

/**
 * Select all reviewed patients (combined from all types)
 * @memoized Only recomputes when reviewed slice changes
 * @performance Prevents array concatenation on every render
 */
export const selectAllReviewedPatients = createSelector(
  [selectReviewedSlice],
  (reviewed) => [
    ...reviewed.vitalscan-rom.users,
    ...reviewed.rehab.users,
    ...reviewed.evaluation.users,
    ...reviewed.survey.users,
    ...reviewed.postures.users,
  ]
);

/**
 * Select total reviewed patients count
 * @memoized Derived from all reviewed patients
 */
export const selectReviewedPatientsCount = createSelector(
  [selectAllReviewedPatients],
  (patients) => patients.length
);

/**
 * Select pending review patients by type
 * @memoized Returns object with vitalscan-rom, rehab, evaluation, survey, postures
 */
export const selectPendingByType = createSelector(
  [selectPendingReviewSlice],
  (pending) => ({
    vitalscan-rom: pending.vitalscan-rom.users,
    rehab: pending.rehab.users,
    evaluation: pending.evaluation.users,
    survey: pending.survey.users,
    postures: pending.postures.users,
  })
);

/**
 * Select all pending review patients (combined)
 * @memoized Only recomputes when pendingReview slice changes
 */
export const selectAllPendingPatients = createSelector(
  [selectPendingReviewSlice],
  (pending) => [
    ...pending.vitalscan-rom.users,
    ...pending.rehab.users,
    ...pending.evaluation.users,
    ...pending.survey.users,
    ...pending.postures.users,
  ]
);

/**
 * Select pending patients count
 * @memoized Derived from all pending patients
 */
export const selectPendingPatientsCount = createSelector(
  [selectAllPendingPatients],
  (patients) => patients.length
);

/**
 * Select all active patients (new + reviewed + pending)
 * @memoized High-value selector - combines multiple slices
 * @performance Critical for dashboard views
 */
export const selectAllActivePatients = createSelector(
  [selectNewPatientsData, selectAllReviewedPatients, selectAllPendingPatients],
  (newPatients, reviewed, pending) => [
    ...newPatients,
    ...reviewed,
    ...pending,
  ]
);

/**
 * Select total active patients count
 * @memoized Derived from all active patients
 * @performance Prevents count recalculation on every render
 */
export const selectActivePatientCount = createSelector(
  [selectAllActivePatients],
  (patients) => patients.length
);

/**
 * Select out of params patients by type
 * @memoized Returns object with vitalscan-rom, rehab, evaluation, survey, postures
 */
export const selectOutOfParamsByType = createSelector(
  [selectOutOfParamsSlice],
  (outOfParams) => ({
    vitalscan-rom: outOfParams.vitalscan-rom.users,
    rehab: outOfParams.rehab.users,
    evaluation: outOfParams.evaluation.users,
    survey: outOfParams.survey.users,
    postures: outOfParams.postures.users,
  })
);

/**
 * Select all out of params patients
 * @memoized Combines all types
 */
export const selectAllOutOfParamsPatients = createSelector(
  [selectOutOfParamsSlice],
  (outOfParams) => [
    ...outOfParams.vitalscan-rom.users,
    ...outOfParams.rehab.users,
    ...outOfParams.evaluation.users,
    ...outOfParams.survey.users,
    ...outOfParams.postures.users,
  ]
);

/**
 * Select escalation required patients by type
 * @memoized Returns object with vitalscan-rom, rehab, evaluation, survey, postures
 */
export const selectEscalationByType = createSelector(
  [selectEscalationRequiredSlice],
  (escalation) => ({
    vitalscan-rom: escalation.vitalscan-rom.users,
    rehab: escalation.rehab.users,
    evaluation: escalation.evaluation.users,
    survey: escalation.survey.users,
    postures: escalation.postures.users,
  })
);

/**
 * Select all escalation required patients
 * @memoized Combines all types
 */
export const selectAllEscalationPatients = createSelector(
  [selectEscalationRequiredSlice],
  (escalation) => [
    ...escalation.vitalscan-rom.users,
    ...escalation.rehab.users,
    ...escalation.evaluation.users,
    ...escalation.survey.users,
    ...escalation.postures.users,
  ]
);

/**
 * Select follow up required patients by type
 * @memoized Returns object with vitalscan-rom, rehab, evaluation, survey, postures
 */
export const selectFollowUpByType = createSelector(
  [selectFollowUpRequiredSlice],
  (followUp) => ({
    vitalscan-rom: followUp.vitalscan-rom.users,
    rehab: followUp.rehab.users,
    evaluation: followUp.evaluation.users,
    survey: followUp.survey.users,
    postures: followUp.postures.users,
  })
);

/**
 * Select all follow up required patients
 * @memoized Combines all types
 */
export const selectAllFollowUpPatients = createSelector(
  [selectFollowUpRequiredSlice],
  (followUp) => [
    ...followUp.vitalscan-rom.users,
    ...followUp.rehab.users,
    ...followUp.evaluation.users,
    ...followUp.survey.users,
    ...followUp.postures.users,
  ]
);

/**
 * Select patients by status (parameterized selector)
 * @param status - Patient status to filter by
 * @memoized Creates memoized selector for specific status
 *
 * @example
 * const selector = selectPatientsByStatus('reviewed');
 * const patients = useTypedSelector(selector);
 */
export const selectPatientsByStatus = (
  status: 'new' | 'reviewed' | 'pending' | 'outOfParams' | 'escalation' | 'followUp'
) =>
  createSelector(
    [
      selectNewPatientsData,
      selectAllReviewedPatients,
      selectAllPendingPatients,
      selectAllOutOfParamsPatients,
      selectAllEscalationPatients,
      selectAllFollowUpPatients,
    ],
    (newPatients, reviewed, pending, outOfParams, escalation, followUp) => {
      switch (status) {
        case 'new':
          return newPatients;
        case 'reviewed':
          return reviewed;
        case 'pending':
          return pending;
        case 'outOfParams':
          return outOfParams;
        case 'escalation':
          return escalation;
        case 'followUp':
          return followUp;
        default:
          return [];
      }
    }
  );

/**
 * Select patient counts by status
 * @memoized Returns object with counts for each status
 * @performance Critical for dashboard stats
 */
export const selectPatientCountsByStatus = createSelector(
  [
    selectNewPatientsCount,
    selectReviewedPatientsCount,
    selectPendingPatientsCount,
    selectAllOutOfParamsPatients,
    selectAllEscalationPatients,
    selectAllFollowUpPatients,
  ],
  (newCount, reviewedCount, pendingCount, outOfParams, escalation, followUp) => ({
    new: newCount,
    reviewed: reviewedCount,
    pending: pendingCount,
    outOfParams: outOfParams.length,
    escalation: escalation.length,
    followUp: followUp.length,
    total: newCount + reviewedCount + pendingCount,
  })
);

/**
 * Select admin patient data
 * @memoized Returns current admin patient view data
 */
export const selectAdminPatientData = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.data
);

/**
 * Select patient pagination info
 * @memoized Returns pagination for new patients
 */
export const selectNewPatientsPagination = createSelector(
  [selectNewPatientsSlice],
  (newPatients) => newPatients.pagination
);

/**
 * Select if more new patients are available
 * @memoized Checks if next page exists
 */
export const selectHasMoreNewPatients = createSelector(
  [selectNewPatientsPagination],
  (pagination) => !!pagination.nextPage
);

// ============================================================================
// ADMIN DASHBOARD PATIENT SELECTORS (Optimized for TableList)
// ============================================================================

/**
 * Select admin dashboard loading state
 * @memoized Extracts loading flag only
 * @performance Prevents re-render when other adminDashboardPatient fields change
 */
export const selectAdminPatientLoading = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.loading
);

/**
 * Select admin dashboard unassigned loader state
 * @memoized Extracts unAssignedLoader flag only
 * @performance Prevents re-render when other adminDashboardPatient fields change
 */
export const selectAdminPatientUnassignedLoader = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.unAssignedLoader
);

/**
 * Select admin dashboard loading states (combined)
 * @memoized Returns object with both loading flags
 * @performance Use this when component needs both flags
 */
export const selectAdminPatientLoadingStates = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => ({
    loading: adminPatient.loading,
    unAssignedLoader: adminPatient.unAssignedLoader
  })
);

/**
 * Select unassigned patients data
 * @memoized Returns unassigned patients array
 */
export const selectUnassignedPatientsData = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.unAssignedPatients.data
);

/**
 * Select registered patients data
 * @memoized Returns registered patients array
 */
export const selectRegisteredPatientsData = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.registeredPatients.data
);

/**
 * Select consent form patients data
 * @memoized Returns consent form patients array
 */
export const selectConsentFormPatientsData = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.consentFormPatients.data
);

/**
 * Select all admin list data
 * @memoized Returns admin list array
 */
export const selectAllAdminListData = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.allAdminList.data
);

/**
 * Select admin dashboard patient counts
 * @memoized Returns object with all count fields
 * @performance Use this for badge counts in navigation
 */
export const selectAdminPatientCounts = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => ({
    unAssignedCount: adminPatient.unAssignedCount,
    pendingCount: adminPatient.pendingCount,
    registeredCount: adminPatient.registeredCount,
    assignedCount: adminPatient.assignedCount,
    consentFormCount: adminPatient.consentFormCount
  })
);

/**
 * Select admin dashboard stats count
 * @memoized Returns complete statsCount object
 * @performance Use for new users badge and dashboard statistics
 */
export const selectAdminPatientStatsCount = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.statsCount
);

/**
 * Select new users count from stats
 * @memoized Extracts newUsers count specifically
 * @performance Optimal for navigation badge
 */
export const selectNewUsersCount = createSelector(
  [selectAdminPatientStatsCount],
  (statsCount) => statsCount.newUsers
);

/**
 * Select unassigned patients pagination
 * @memoized Returns pagination object
 */
export const selectUnassignedPatientsPagination = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.unAssignedPatients.pagination
);

/**
 * Select registered patients pagination
 * @memoized Returns pagination object
 */
export const selectRegisteredPatientsPagination = createSelector(
  [selectAdminPatientSlice],
  (adminPatient) => adminPatient.registeredPatients.pagination
);
