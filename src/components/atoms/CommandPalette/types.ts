/**
 * Command Palette Orchestrator - Type System
 *
 * Defines the complete type system for the stateful command palette orchestrator.
 * Supports 5 modes: idle, userSearch, userContext, drawerExpanded, programContext
 *
 * Note: `programContext` mode is scaffolded but not yet activated.
 * The mode provides program-specific navigation with 30+ routes.
 * Entry point: dispatch({ type: 'SELECT_PROGRAM', program }) - not yet wired to UI.
 * See: programRoutes.ts, ProgramContextContent.tsx
 */

import { ReactNode } from 'react';

/**
 * Palette operating modes
 *
 * - idle: Show preset commands (navigation, recent users)
 * - userSearch: Active user search with results
 * - userContext: User selected, show user-specific actions
 * - drawerExpanded: Drawer open for complex actions (program assignment, consent forms)
 * - programContext: [SCAFFOLDED] Program selected, show 30+ program-specific routes
 */
export type PaletteMode = 'idle' | 'userSearch' | 'userContext' | 'drawerExpanded' | 'programContext';

/**
 * Main palette state
 */
export interface PaletteState {
  /** Current operating mode */
  mode: PaletteMode;
  /** Search query string */
  query: string;
  /** Currently selected user (null in idle/userSearch modes) */
  selectedUser: User | null;
  /** Currently selected action (null until action selected) */
  selectedAction: UserAction | null;
  /** Drawer content when expanded */
  drawerContent: DrawerContent | null;
  /** Currently selected index for keyboard navigation */
  selectedIndex: number;
  /** Recently selected user IDs (max 5) */
  recentUsers: string[];
  /** Currently selected program */
  selectedProgram: Program | null;
  /** Whether user selection is locked (for USER role) */
  userSelectionLocked: boolean;
}

/**
 * Physiotherapist/Admin profile for associations
 */
export interface Physiotherapist {
  id: string;
  clientId: string;
  fusionAuthUserId: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    imageUrl?: string | null;
    avatarColor?: string;
  };
}

/**
 * Association between physiotherapist and patient
 */
export interface PhysiotherapistPatientAssociation {
  id: string;
  physiotherapistId: string;
  patientId: string;
  showPopup: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  physiotherapist: Physiotherapist;
}

/**
 * User interface matching existing store structure
 */
export interface User {
  id: string;
  email: string;
  /** Optional full name (can be derived from firstName + lastName) */
  name?: string;
  profile: {
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'PATIENT';
    consentPolicyRead: boolean;
    avatar?: string;
    /** Avatar background color from database */
    avatarColor?: string;
    lastLogin?: string;
    status?: 'active' | 'inactive' | 'suspended';
  };
  /** Admin assignments for this user */
  physiotherapistPatientAssociationPatientIdRelation?: PhysiotherapistPatientAssociation[];
}

/**
 * Program interface
 */
export interface Program {
  id: string;
  name: string;
  description?: string;
}

/**
 * Preset command (navigation/action) shown in idle mode
 */
export interface PresetCommand {
  id: string;
  label: string;
  description?: string;
  category: 'navigation' | 'action' | 'settings' | 'quick';
  icon?: ReactNode;
  keywords?: string[];
  handler: () => void;
  enabled?: boolean;
  shortcut?: string;
  requiredRole?: string[];
}

/**
 * User action shown in userContext mode
 */
export interface UserAction {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  category: 'manage' | 'security' | 'danger';
  requiredRole: ('SUPER_ADMIN' | 'ADMIN')[];
  handler: (user: User) => void | Promise<void>;
  opensDrawer?: boolean;
  drawerComponent?: React.ComponentType<UserActionDrawerProps>;
  shortcut?: string;
  confirmRequired?: boolean;
}

/**
 * Props passed to drawer components
 */
export interface UserActionDrawerProps {
  user: User;
  onClose: () => void;
  onComplete?: () => void;
}

/**
 * Drawer content configuration
 */
export interface DrawerContent {
  title: string;
  component: React.ComponentType<unknown>;
  props: Record<string, unknown>;
  width?: number;
}

/**
 * State machine actions (discriminated union)
 */
export type PaletteAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'SET_QUERY'; query: string }
  | { type: 'SELECT_USER'; user: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SELECT_ACTION'; action: UserAction }
  | { type: 'CLOSE_DRAWER' }
  | { type: 'NAVIGATE_UP' }
  | { type: 'NAVIGATE_DOWN'; maxIndex: number }
  | { type: 'SET_SELECTED_INDEX'; index: number }
  | { type: 'ADD_RECENT_USER'; userId: string }
  | { type: 'SELECT_PROGRAM'; program: Program }
  | { type: 'CLEAR_PROGRAM' }
  | { type: 'LOCK_USER_SELECTION'; locked: boolean }
  | { type: 'SET_MODE'; mode: PaletteMode };

/**
 * Dimension configuration for each palette mode
 */
export const PALETTE_DIMENSIONS: Record<PaletteMode, {
  width: number;
  height: number;
  userHeaderHeight: number;
  drawerWidth: number;
}> = {
  idle: {
    width: 640,
    height: 400,
    userHeaderHeight: 0,
    drawerWidth: 0
  },
  userSearch: {
    width: 640,
    height: 450,
    userHeaderHeight: 0,
    drawerWidth: 0
  },
  userContext: {
    width: 640,
    height: 600,
    userHeaderHeight: 80,
    drawerWidth: 0
  },
  drawerExpanded: {
    width: 940,
    height: 650,
    userHeaderHeight: 80,
    drawerWidth: 300
  },
  programContext: {
    width: 640,
    height: 600,
    userHeaderHeight: 80,
    drawerWidth: 0
  },
};

/**
 * Animation timing constants
 */
export const PALETTE_TIMING = {
  /** State transition duration (ms) */
  transitionDuration: 300,
  /** Search debounce delay (ms) */
  searchDebounce: 300,
  /** Keyboard navigation delay (ms) */
  keyboardDelay: 50,
} as const;

/**
 * Maximum items to track
 */
export const PALETTE_LIMITS = {
  /** Maximum recent users to store */
  maxRecentUsers: 5,
  /** Maximum search results to display */
  maxSearchResults: 10,
} as const;
