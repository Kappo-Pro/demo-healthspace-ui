/**
 * Navigation Configuration Index
 *
 * Central export for all role-based navigation configurations.
 * Import from here to access navigation configs for any role.
 *
 * @example
 * ```tsx
 * import { getNavigationConfig } from '@config/navigation';
 *
 * const config = getNavigationConfig(userRole);
 * ```
 */

import { NavigationConfig, UserRole } from '@components/layouts/AppLayout/types';
import { adminNavigationConfig } from './admin';
import { superAdminNavigationConfig } from './superAdmin';
import { interventionUserNavigationConfig, screeningNavigationConfig, userNavigationConfig } from './user';

/**
 * Get navigation configuration based on user role
 *
 * @param role - User role (admin, super-admin, user)
 * @returns Navigation configuration for the specified role
 */
export function getNavigationConfig(role: UserRole, isIntervention: boolean, isScreening:boolean): NavigationConfig {
  switch (role) {
    case 'super-admin':
      return superAdminNavigationConfig;
    case 'admin':
      return adminNavigationConfig;
    case 'user':
      if(isIntervention){
        return interventionUserNavigationConfig;
      }
      else if(isScreening){
        return screeningNavigationConfig;
      } else{
        return userNavigationConfig;
      }
    default:
      if(isIntervention){
        return interventionUserNavigationConfig;
      }
      else if(isScreening){
        return screeningNavigationConfig;
      } else{
        return userNavigationConfig;
      }
  }
}

/**
 * Export individual configs for direct import if needed
 */
export {
  adminNavigationConfig,
  superAdminNavigationConfig,
  userNavigationConfig,
};

/**
 * Filter navigation items based on user role
 *
 * @param items - Navigation items to filter
 * @param role - User role
 * @returns Filtered navigation items
 */
export function filterNavigationByRole(
  items: NavigationConfig['primary'],
  role: UserRole
): NavigationConfig['primary'] {
  return items
    .filter(item => !item.roles || item.roles.includes(role))
    .map(item => ({
      ...item,
      children: item.children
        ? filterNavigationByRole(item.children, role)
        : undefined,
    }));
}
