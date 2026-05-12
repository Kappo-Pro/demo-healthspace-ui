/**
 * Navigation Utilities
 *
 * Helper functions for navigation, breadcrumbs, and route handling.
 */

import { Breadcrumb } from '@components/layouts/AppLayout/types';

/**
 * Route metadata for breadcrumb generation
 */
const ROUTE_LABELS: Record<string, string> = {
  // Dashboard
  '/': 'Dashboard',
  '/new-patients': 'New Patients',
  '/out-of-parameters': 'Out of Parameters',
  '/pending-review': 'Pending Review',
  '/reviewed': 'Reviewed',
  '/escalation-required': 'Escalation Required',
  '/follow-up-required': 'Follow-Up Required',

  // Patient Administration
  '/unassigned-patients': 'Unassigned Patients',
  '/registered-patients': 'Registered Patients',
  '/consent-form-patients': 'Consent Form Patients',

  // Patient Views
  '/patient': 'Patient',
  '/overview': 'Overview',
  '/activity': 'Activity',

  // AI Assistant / Tools
  '/virtual-evaluation': 'Virtual Evaluation',
  '/virtual-evaluation-result': 'Evaluation Results',
  '/rom-summary': 'ROM Summary',
  '/rom-scan': 'ROM Scan',
  '/rom-start-scan': 'Start ROM Scan',
  '/rom-captures': 'ROM Captures',
  '/rom-scan-result': 'ROM Scan Results',
  '/posture-analytics-scan': 'Posture Scan',
  '/posture-analytics-summary': 'Posture Summary',
  '/posture-analytics-captures': 'Posture Captures',
  '/posture-scan-results': 'Posture Scan Results',
  '/rom-tutorial': 'ROM Tutorial',

  // Programs
  '/program-start': 'Start Program',
  '/program-generate': 'Generate Program',
  '/program-create': 'Create Program',
  '/program-summary': 'Program Summary',
  '/program-add-exercises': 'Add Exercises',

  // Surveys
  '/survey-assign': 'Assign Survey',
  '/survey-create': 'Create Survey',
  '/survey-start': 'Start Survey',
  '/survey-summary': 'Survey Summary',

  // Reports
  '/report-create': 'Create Report',
  '/report-summary': 'Report Summary',

  // Settings
  '/settings': 'Settings',
  '/download-app': 'Download App',

  // Demo
  '/demo': 'Demo',
};

/**
 * Generate breadcrumbs from current path
 *
 * @param pathname - Current route path
 * @returns Array of breadcrumb items
 *
 * @example
 * generateBreadcrumbs('/patient/123/overview')
 * // Returns: [
 * //   { label: 'Dashboard', path: '/' },
 * //   { label: 'Patient', path: '/patient/123' },
 * //   { label: 'Overview', path: '/patient/123/overview' }
 * // ]
 */
/**
 * Check if a segment is a UUID
 */
function isUUID(segment: string): boolean {
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(segment);
}

export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  // Always start with home
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', path: '/', icon: undefined },
  ];

  // Skip if already on home
  if (pathname === '/') {
    return breadcrumbs;
  }

  // Split path into segments
  const segments = pathname.split('/').filter(Boolean);

  // Build breadcrumbs from segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip UUID segments (user IDs, etc.)
    if (isUUID(segment)) {
      return;
    }

    // Get label from route map or use formatted segment
    const label =
      ROUTE_LABELS[currentPath] ||
      segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Don't add link to the last breadcrumb (current page)
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      label,
      path: isLast ? undefined : currentPath,
    });
  });

  return breadcrumbs;
}

/**
 * Check if a path matches the current route
 *
 * @param path - Path to check
 * @param currentPath - Current route path
 * @param exact - Require exact match (default: false)
 * @returns True if path matches current route
 */
export function isPathActive(
  path: string,
  currentPath: string,
  exact = false
): boolean {
  if (exact) {
    return path === currentPath;
  }
  return currentPath.startsWith(path);
}

/**
 * Find the active navigation item key from current path
 *
 * @param path - Current path
 * @returns Navigation item key
 */
export function getActiveNavigationKey(path: string): string {
  // Map paths to primary navigation keys
  const pathToKeyMap: Record<string, string> = {
    '/': 'dashboard',
    '/new-patients': 'dashboard',
    '/out-of-parameters': 'dashboard',
    '/pending-review': 'dashboard',
    '/reviewed': 'dashboard',
    '/escalation-required': 'dashboard',
    '/follow-up-required': 'dashboard',

    '/unassigned-patients': 'patients',
    '/registered-patients': 'patients',
    '/consent-form-patients': 'patients',

    '/virtual-evaluation': 'tools',
    '/rom-summary': 'tools',
    '/rom-scan': 'tools',
    '/program-generate': 'tools',
    '/survey-create': 'tools',

    '/report-create': 'analytics',
    '/report-summary': 'analytics',

    '/settings': 'settings',
  };

  // Check for exact match first
  if (pathToKeyMap[path]) {
    return pathToKeyMap[path];
  }

  // Check for partial matches (for nested routes)
  for (const [routePath, key] of Object.entries(pathToKeyMap)) {
    if (path.startsWith(routePath) && routePath !== '/') {
      return key;
    }
  }

  // Default to dashboard
  return 'dashboard';
}
