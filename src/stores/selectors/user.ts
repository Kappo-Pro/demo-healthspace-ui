/**
 * User Selectors
 *
 * @description Memoized selectors for user profile and authentication
 * @performance Prevents unnecessary re-renders with reselect
 */

import { createSelector } from 'reselect';
import type { ReduxState } from '@stores/index';
import { USER_ROLES } from '@stores/constants';

// ============================================================================
// BASE SELECTORS (Input Selectors)
// ============================================================================

/** Select user slice */
export const selectUserSlice = (state: ReduxState) => state.user;

/** Select contacts slice */
export const selectContactsSlice = (state: ReduxState) => state.contacts;

/** Select user management slice */
export const selectUserManagementSlice = (state: ReduxState) => state.userManagement;

// ============================================================================
// USER PROFILE SELECTORS
// ============================================================================

/**
 * Select user profile
 * @memoized Only recomputes when user slice changes
 * @returns User profile object
 */
export const selectUserProfile = createSelector(
  [selectUserSlice],
  (user) => user.profile
);

/**
 * Select user ID
 * @memoized Extracts user ID
 */
export const selectUserId = createSelector([selectUserSlice], (user) => user.id);

/**
 * Select user full name
 * @memoized Derived from profile
 */
export const selectUserFullName = createSelector(
  [selectUserProfile],
  (profile) => profile.fullName || `${profile.firstName} ${profile.lastName}`.trim()
);

/**
 * Select user email
 * @memoized Derived from profile
 */
export const selectUserEmail = createSelector([selectUserProfile], (profile) => profile.email);

/**
 * Select user image URL
 * @memoized Derived from profile
 */
export const selectUserImageUrl = createSelector([selectUserProfile], (profile) => profile.imageUrl);

/**
 * Select user weight data
 * @memoized Returns weight array
 */
export const selectUserWeight = createSelector([selectUserProfile], (profile) => profile.weight);

/**
 * Select latest user weight
 * @memoized Returns most recent weight entry
 */
export const selectUserLatestWeight = createSelector([selectUserWeight], (weight) => {
  if (!weight || !Array.isArray(weight) || weight.length === 0) {
    return null;
  }
  return weight[0];
});

// ============================================================================
// USER ROLE SELECTORS
// ============================================================================

/**
 * Select user role
 * @memoized Extracts role from profile
 */
export const selectUserRole = createSelector([selectUserProfile], (profile) => profile.role);

/**
 * Check if user is admin
 * @memoized Derived boolean check
 */
export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN
);

/**
 * Check if user is super admin
 * @memoized Derived boolean check
 */
export const selectIsSuperAdmin = createSelector([selectUserRole], (role) => role === USER_ROLES.SUPER_ADMIN);

/**
 * Check if user is patient
 * @memoized Derived boolean check
 */
export const selectIsPatient = createSelector([selectUserRole], (role) => role === USER_ROLES.PATIENT);

/**
 * Check if user is physiotherapist
 * @memoized Legacy check - same as isAdmin
 */
export const selectIsPhysiotherapist = createSelector([selectUserSlice], (user) => !!user.isPhysioterapist);

/**
 * Select user role display name
 * @memoized Formats role for display
 */
export const selectUserRoleDisplay = createSelector([selectUserRole], (role) => {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return 'Super Admin';
    case USER_ROLES.ADMIN:
      return 'Admin';
    case USER_ROLES.PATIENT:
      return 'Patient';
    default:
      return role || 'Unknown';
  }
});

// ============================================================================
// USER STATUS SELECTORS
// ============================================================================

/**
 * Check if user is active
 * @memoized Returns active status
 */
export const selectIsUserActive = createSelector([selectUserSlice], (user) => user.active);

/**
 * Select FusionAuth user ID
 * @memoized External auth ID
 */
export const selectFusionAuthUserId = createSelector([selectUserSlice], (user) => user.fusionAuthUserId);

/**
 * Check if user is authenticated
 * @memoized Returns true if user ID exists
 */
export const selectIsAuthenticated = createSelector([selectUserId], (userId) => !!userId && userId.length > 0);

// ============================================================================
// BULK OPERATIONS SELECTORS
// ============================================================================

/**
 * Select bulk mail sending status
 * @memoized Upload progress for bulk invite
 */
export const selectIsSendingBulkMail = createSelector([selectUserSlice], (user) => user.sendingBulkMail);

/**
 * Select upload progress
 * @memoized Current upload progress percentage
 */
export const selectUploadProgress = createSelector([selectUserSlice], (user) => user.uploadProgress);

// ============================================================================
// CONTACTS SELECTORS
// ============================================================================

/**
 * Select selected user from contacts
 * @memoized Currently selected contact user
 */
export const selectSelectedContact = createSelector([selectContactsSlice], (contacts) => contacts.main.selectedUser);

/**
 * Select selected user ID from contacts
 * @memoized Extracts ID from selected contact
 */
export const selectSelectedContactId = createSelector(
  [selectSelectedContact],
  (selectedUser) => selectedUser?.id || null
);

/**
 * Select all contacts
 * @memoized Returns contacts array
 */
export const selectAllContacts = createSelector([selectContactsSlice], (contacts) => contacts.main.contacts);

/**
 * Select contacts count
 * @memoized Derived count
 */
export const selectContactsCount = createSelector([selectAllContacts], (contacts) => (contacts || []).length);

/**
 * Check if contacts are loading
 * @memoized Loading state
 */
export const selectAreContactsLoading = createSelector([selectContactsSlice], (contacts) => contacts.main.loading);

// ============================================================================
// USER MANAGEMENT SELECTORS
// ============================================================================

/**
 * Select all users from user management
 * @memoized Returns users array for admin views
 */
export const selectAllUsers = createSelector([selectUserManagementSlice], (userManagement) => userManagement.users);

/**
 * Select users count
 * @memoized Derived count for admin
 */
export const selectUsersCount = createSelector([selectAllUsers], (users) => (users || []).length);

/**
 * Select users by role
 * @param role User role to filter by
 * @memoized Filters users by role
 */
export const selectUsersByRole = (role: string) =>
  createSelector([selectAllUsers], (users) => (users || []).filter((user: unknown) => user?.profile?.role === role));

/**
 * Select admins
 * @memoized Returns all admin users
 */
export const selectAdminUsers = createSelector([selectAllUsers], (users) =>
  (users || []).filter(
    (user: unknown) => user?.profile?.role === USER_ROLES.ADMIN || user?.profile?.role === USER_ROLES.SUPER_ADMIN
  )
);

/**
 * Select patients
 * @memoized Returns all patient users
 */
export const selectPatientUsers = createSelector([selectAllUsers], (users) =>
  (users || []).filter((user: unknown) => user?.profile?.role === USER_ROLES.PATIENT)
);

// ============================================================================
// COMPUTED USER INFO
// ============================================================================

/**
 * Select user initials
 * @memoized Computes initials from name
 */
export const selectUserInitials = createSelector([selectUserFullName], (fullName) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
});

/**
 * Select user display info
 * @memoized Combines multiple user fields for display
 */
export const selectUserDisplayInfo = createSelector(
  [selectUserFullName, selectUserEmail, selectUserImageUrl, selectUserRole],
  (fullName, email, imageUrl, role) => ({
    fullName,
    email,
    imageUrl,
    role,
    initials: fullName
      ? fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : '',
  })
);

/**
 * Check if user has admin permissions
 * @memoized Returns true if user can access admin features
 */
export const selectHasAdminPermissions = createSelector(
  [selectIsAdmin, selectIsSuperAdmin],
  (isAdmin, isSuperAdmin) => isAdmin || isSuperAdmin
);

// ============================================================================
// USER PERMISSIONS SELECTOR (for UserDetailsModal)
// ============================================================================

/**
 * Select user permissions for UserDetailsModal
 * @memoized Combines all permission checks into single object
 * @description Prevents 4 separate array lookups per render
 * @performance Critical for UserDetailsModal performance
 */
export const selectCurrentUserPermissions = createSelector(
  [selectUserSlice],
  (user) => {
    const role = user?.profile?.role;
    const isAdminOrSuperAdmin = role === USER_ROLES.ADMIN || role === USER_ROLES.SUPER_ADMIN;

    return {
      userId: user?.id,
      role,
      canDelete: isAdminOrSuperAdmin,
      canEdit: isAdminOrSuperAdmin,
      canResetPassword: isAdminOrSuperAdmin,
      canManageConsent: isAdminOrSuperAdmin,
      isRegularUser: role === USER_ROLES.USER,
    };
  }
);
