/**
 * Program Routes Configuration
 *
 * Defines 30+ navigation routes for program context mode,
 * grouped into 6 categories with keyboard shortcuts.
 */

import { ReactNode } from 'react';
import { UntitledIcon } from '@atoms/Icon';
import React from 'react';

export type ProgramRouteCategory =
  | 'dashboard'
  | 'assessments'
  | 'programs'
  | 'settings'
  | 'other';

export interface ProgramRoute {
  id: string;
  label: string;
  description: string;
  category: ProgramRouteCategory;
  route: string;
  icon?: ReactNode;
  shortcut?: string;
  keywords?: string[];
}

export const PROGRAM_ROUTES: ProgramRoute[] = [
  // Dashboard Category
  {
    id: 'program-dashboard',
    label: 'Dashboard',
    description: 'Personal health overview',
    category: 'dashboard',
    route: '/:userId/dashboard',
    icon: React.createElement(UntitledIcon, { name: 'home' }),
    shortcut: 'g h',
    keywords: ['home', 'overview', 'main']
  },
  {
    id: 'program-overview',
    label: 'Program Overview',
    description: 'Selected program overview',
    category: 'dashboard',
    route: '/:userId/overview',
    icon: React.createElement(UntitledIcon, { name: 'fileText' }),
    keywords: ['program', 'details']
  },


  // Assessments & Tools Category
  {
    id: 'program-virtual-evaluation-start',
    label: 'Start Virtual Evaluation',
    description: 'Begin virtual assessment',
    category: 'assessments',
    route: '/:userId/virtual-evaluation/start',
    icon: React.createElement(UntitledIcon, { name: 'edit' }),
    shortcut: 'g t',
    keywords: ['evaluation', 'assessment', 'survey']
  },
  {
    id: 'program-virtual-evaluation-result',
    label: 'View Evaluation Results',
    description: 'View assessment results',
    category: 'assessments',
    route: '/:userId/virtual-evaluation/result',
    icon: React.createElement(UntitledIcon, { name: 'barChart' }),
    keywords: ['results', 'evaluation', 'score']
  },
  {
    id: 'program-rom-summary',
    label: 'ROM Summary',
    description: 'Range of motion results',
    category: 'assessments',
    route: '/:userId/rom/summary',
    icon: React.createElement(UntitledIcon, { name: 'barChart' }),
    keywords: ['rom', 'range', 'motion', 'summary']
  },
  {
    id: 'program-rom-scan',
    label: 'Start ROM Scan',
    description: 'Begin ROM assessment',
    category: 'assessments',
    route: '/:userId/rom/scan',
    icon: React.createElement(UntitledIcon, { name: 'lightning' }),
    keywords: ['rom', 'scan', 'start']
  },
  {
    id: 'program-rom-start-scan',
    label: 'Execute ROM Scan',
    description: 'Run ROM scan now',
    category: 'assessments',
    route: '/:userId/rom/start-scan',
    icon: React.createElement(UntitledIcon, { name: 'lightning' }),
    keywords: ['rom', 'execute', 'run']
  },
  {
    id: 'program-rom-captures',
    label: 'View ROM Captures',
    description: 'See ROM scan captures',
    category: 'assessments',
    route: '/:userId/rom/captures',
    icon: React.createElement(UntitledIcon, { name: 'camera' }),
    keywords: ['rom', 'captures', 'images']
  },
  {
    id: 'program-rom-scan-result',
    label: 'ROM Scan Results',
    description: 'View ROM scan results',
    category: 'assessments',
    route: '/:userId/rom/scan-result',
    icon: React.createElement(UntitledIcon, { name: 'barChart' }),
    keywords: ['rom', 'results', 'report']
  },
  {
    id: 'program-posture-scan',
    label: 'Start Posture Scan',
    description: 'Begin posture assessment',
    category: 'assessments',
    route: '/:userId/posture/analytics/scan',
    icon: React.createElement(UntitledIcon, { name: 'camera' }),
    keywords: ['posture', 'scan', 'start']
  },
  {
    id: 'program-posture-summary',
    label: 'Posture Summary',
    description: 'View posture analysis',
    category: 'assessments',
    route: '/:userId/posture/analytics/summary',
    icon: React.createElement(UntitledIcon, { name: 'barChart' }),
    keywords: ['posture', 'summary', 'results']
  },
  {
    id: 'program-posture-captures',
    label: 'Posture Captures',
    description: 'View posture captures',
    category: 'assessments',
    route: '/:userId/posture/analytics/captures',
    icon: React.createElement(UntitledIcon, { name: 'camera' }),
    keywords: ['posture', 'captures', 'images']
  },
  {
    id: 'program-posture-scan-results',
    label: 'Posture Scan Results',
    description: 'Detailed posture results',
    category: 'assessments',
    route: '/:userId/posture/scan-results',
    icon: React.createElement(UntitledIcon, { name: 'barChart' }),
    keywords: ['posture', 'results', 'report']
  },
  {
    id: 'program-survey-start',
    label: 'Available Surveys',
    description: 'View available surveys',
    category: 'assessments',
    route: '/:userId/survey/start',
    icon: React.createElement(UntitledIcon, { name: 'edit' }),
    keywords: ['survey', 'questionnaire', 'form']
  },
  {
    id: 'program-survey-summary',
    label: 'Survey Responses',
    description: 'View survey history',
    category: 'assessments',
    route: '/:userId/survey/summary',
    icon: React.createElement(UntitledIcon, { name: 'barChart' }),
    keywords: ['survey', 'responses', 'history']
  },
  {
    id: 'program-report-create',
    label: 'Create New Report',
    description: 'Generate new report',
    category: 'assessments',
    route: '/:userId/report/create',
    icon: React.createElement(UntitledIcon, { name: 'fileText' }),
    keywords: ['report', 'create', 'new']
  },
  {
    id: 'program-report-summary',
    label: 'My Reports',
    description: 'View all reports',
    category: 'assessments',
    route: '/:userId/report/summary',
    icon: React.createElement(UntitledIcon, { name: 'fileText' }),
    keywords: ['reports', 'history', 'documents']
  },

  // My Programs Category
  {
    id: 'program-program-start',
    label: 'Start Program',
    description: 'Begin exercise program',
    category: 'programs',
    route: '/:userId/program/start',
    icon: React.createElement(UntitledIcon, { name: 'lightning' }),
    shortcut: 'g p',
    keywords: ['program', 'start', 'begin']
  },
  {
    id: 'program-program-create',
    label: 'Exercise Library',
    description: 'Browse and create programs',
    category: 'programs',
    route: '/:userId/program/create',
    icon: React.createElement(UntitledIcon, { name: 'fileText' }),
    keywords: ['exercise', 'library', 'create']
  },
  {
    id: 'program-program-summary',
    label: 'Active Programs',
    description: 'View active programs & history',
    category: 'programs',
    route: '/:userId/program/summary',
    icon: React.createElement(UntitledIcon, { name: 'calendar' }),
    keywords: ['programs', 'active', 'history']
  },

  // Settings Category
  {
    id: 'program-settings',
    label: 'General Settings',
    description: 'Manage account settings',
    category: 'settings',
    route: '/:userId/settings',
    icon: React.createElement(UntitledIcon, { name: 'settings' }),
    shortcut: 'g s',
    keywords: ['settings', 'preferences', 'config']
  },

  // Other Category
  {
    id: 'program-download-app',
    label: 'Download App',
    description: 'Get mobile app invitation',
    category: 'other',
    route: '/:userId/download-app',
    icon: React.createElement(UntitledIcon, { name: 'download' }),
    keywords: ['app', 'download', 'mobile']
  },
  {
    id: 'program-rom-tutorial',
    label: 'ROM Tutorial',
    description: 'Learn how to use ROM scan',
    category: 'other',
    route: '/:userId/rom/tutorial',
    icon: React.createElement(UntitledIcon, { name: 'fileText' }),
    keywords: ['tutorial', 'help', 'guide']
  },
];

export const CATEGORY_LABELS: Record<ProgramRouteCategory, { label: string; icon: ReactNode }> = {
  dashboard: { label: '🏠 Dashboard', icon: React.createElement(UntitledIcon, { name: 'home' }) },
  assessments: { label: '🛠️ Assessments & Tools', icon: React.createElement(UntitledIcon, { name: 'lightning' }) },
  programs: { label: '💪 My Programs', icon: React.createElement(UntitledIcon, { name: 'fileText' }) },
  settings: { label: '⚙️ Settings', icon: React.createElement(UntitledIcon, { name: 'settings' }) },
  other: { label: '📦 Other', icon: React.createElement(UntitledIcon, { name: 'fileText' }) },
};

/**
 * Get routes grouped by category
 */
export const getGroupedRoutes = (routes: ProgramRoute[]): Record<ProgramRouteCategory, ProgramRoute[]> => {
  return routes.reduce((acc, route) => {
    if (!acc[route.category]) {
      acc[route.category] = [];
    }
    acc[route.category].push(route);
    return acc;
  }, {} as Record<ProgramRouteCategory, ProgramRoute[]>);
};

/**
 * Replace :userId placeholder with actual userId
 */
export const interpolateRoute = (route: string, userId: string): string => {
  return route.replace(':userId', userId);
};
