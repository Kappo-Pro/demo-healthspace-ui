/**
 * Sample Navigation Configuration for AppLayout Demo
 *
 * This demonstrates how to structure navigation items for the AppLayout.
 * Use this as a reference when creating your actual navigation configuration.
 */

import React from 'react';
import { NavigationConfig } from '../types';

// Using simple icons for demo (replace with your actual icon library)
const HomeIcon = () => React.createElement('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', style: { width: 20, height: 20 } },
  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
);

const PatientsIcon = () => React.createElement('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', style: { width: 20, height: 20 } },
  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
);

const AnalyticsIcon = () => React.createElement('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', style: { width: 20, height: 20 } },
  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
);

const ProgramsIcon = () => React.createElement('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', style: { width: 20, height: 20 } },
  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
);

const SettingsIcon = () => React.createElement('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', style: { width: 20, height: 20 } },
  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
  React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
);

/**
 * Sample navigation configuration for testing AppLayout
 *
 * This shows the recommended structure:
 * - 5 primary navigation sections (simplified from 30+ items)
 * - Nested children for contextual navigation
 * - Role-based filtering (optional)
 * - Badges for notifications/counts
 * - Keyboard shortcuts
 */
export const sampleNavigationConfig: NavigationConfig = {
  primary: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: React.createElement(HomeIcon),
      path: '/admin/demo',
      shortcut: 'g h',
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: React.createElement(PatientsIcon),
      shortcut: 'g p',
      children: [
        {
          id: 'unassigned',
          label: 'Unassigned',
          icon: null,
          path: '/admin/patients/unassigned',
          badge: 3,
        },
        {
          id: 'registered',
          label: 'Registered',
          icon: null,
          path: '/admin/patients/registered',
        },
        {
          id: 'consent-form',
          label: 'Consent Form',
          icon: null,
          path: '/admin/patients/consent-form',
        },
        {
          id: 'new-patients',
          label: 'New Patients',
          icon: null,
          path: '/admin/new-patients',
        },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: React.createElement(AnalyticsIcon),
      shortcut: 'g a',
      children: [
        {
          id: 'reports',
          label: 'Reports',
          icon: null,
          path: '/admin/reports',
        },
      ],
    },
    {
      id: 'programs',
      label: 'Programs',
      icon: React.createElement(ProgramsIcon),
      shortcut: 'g r',
      children: [
        {
          id: 'all-programs',
          label: 'All Programs',
          icon: null,
          path: '/admin/programs',
        },
        {
          id: 'create-program',
          label: 'Create Program',
          icon: null,
          path: '/admin/programs/create',
        },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: React.createElement(SettingsIcon),
      path: '/admin/settings',
      shortcut: 'g s',
    },
  ],

  footer: [
    // Optional footer items (help, documentation, etc.)
  ],
};
