/**
 * Calendar Keyboard Shortcuts
 *
 * Definitions for calendar-specific keyboard shortcuts.
 * Used by KeyboardShortcutsOverlay to display calendar shortcuts.
 */

import React from 'react';
import { UntitledIcon } from '@atoms/Icon';
import { ShortcutDefinition } from './index';

/**
 * Calendar keyboard shortcuts
 */
export const CALENDAR_SHORTCUTS: ShortcutDefinition[] = [
  // Calendar Navigation
  {
    keys: 'T',
    description: 'Go to today',
    category: 'calendar-navigation',
    icon: <UntitledIcon name="calendar" size={16} />,
  },
  {
    keys: ['N', '→'],
    description: 'Next period',
    category: 'calendar-navigation',
    icon: <UntitledIcon name="rightOutlined" size={16} />,
  },
  {
    keys: ['P', '←'],
    description: 'Previous period',
    category: 'calendar-navigation',
    icon: <UntitledIcon name="leftOutlined" size={16} />,
  },

  // Calendar Views
  {
    keys: 'M',
    description: 'Month view',
    category: 'calendar-views',
    icon: <UntitledIcon name="calendar" size={16} />,
  },
  {
    keys: 'W',
    description: 'Week view',
    category: 'calendar-views',
    icon: <UntitledIcon name="calendar" size={16} />,
  },
  {
    keys: 'D',
    description: 'Day view',
    category: 'calendar-views',
    icon: <UntitledIcon name="calendar" size={16} />,
  },
  {
    keys: 'A',
    description: 'Agenda view',
    category: 'calendar-views',
    icon: <UntitledIcon name="sortAscending" size={16} />,
  },

  // Calendar Actions
  {
    keys: 'S',
    description: 'Schedule activity',
    category: 'calendar-actions',
    icon: <UntitledIcon name="check" size={16} />,
  },
  {
    keys: 'F',
    description: 'Toggle filters',
    category: 'calendar-actions',
    icon: <UntitledIcon name="filter" size={16} />,
  },
  {
    keys: '/',
    description: 'Focus search',
    category: 'calendar-actions',
    icon: <UntitledIcon name="search" size={16} />,
  },
  {
    keys: 'Esc',
    description: 'Close modal',
    category: 'calendar-actions',
    icon: <UntitledIcon name="close" size={16} />,
  },
];
