/**
 * Dashboard Section Types
 * Defines the structure for dashboard sections that can be reordered
 */

import { ReactNode } from 'react';

/**
 * Dashboard section ID types
 */
export type DashboardSectionId =
	| 'hero'
	| 'assessments'
	| 'programs'
	| 'recommendations'
	| 'alerts'
	| 'charts'
	| 'rom-trend'
	| 'session-calendar'
	| 'goal-progress';

/**
 * Individual dashboard section configuration
 */
export interface DashboardSection {
	/** Unique identifier for the section */
	id: DashboardSectionId;
	/** Human-readable label for preferences UI */
	label: string;
	/** The actual section component to render */
	component: ReactNode;
	/** Current render order (0-indexed) */
	order: number;
	/** Show/hide toggle */
	visibility: boolean;
}

/**
 * Array of dashboard sections representing complete layout
 */
export type DashboardLayout = DashboardSection[];

/**
 * Dashboard section metadata for configuration
 */
export interface DashboardSectionMeta {
	id: DashboardSectionId;
	label: string;
	description?: string;
	category?: 'core' | 'analytics' | 'engagement';
}
