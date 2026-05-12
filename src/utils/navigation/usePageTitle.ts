/**
 * usePageTitle Hook
 *
 * Extracts page title from the current route path.
 * For nested routes (parent + subpage), shows "Parent Subpage" format.
 * Example: "Evaluation Start" or "Select Scan"
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route segment to title mappings
 */
const ROUTE_TITLES: Record<string, string> = {
	// Admin routes
	admin: 'Admin',
	patients: 'Patients',
	unassigned: 'Unassigned Users',
	assigned: 'Assigned Users',
	'legal-consent': 'Legal Consent',
	triage: 'Triage',
	'pending-review': 'Pending Review',
	'out-of-parameters': 'Out of Parameters',
	'follow-up-required': 'Follow Up Required',
	'escalation-required': 'Escalation Required',
	reviewed: 'Reviewed',
	'new-patients': 'New Patients',
	reports: 'Reports',
	settings: 'Settings',
	analytics: 'Analytics',

	// Patient routes
	dashboard: 'Dashboard',
	activity: 'Activity',

	// Virtual Evaluation
	'virtual-evaluation': 'Evaluation',
	start: 'Start',
	result: 'Result',

	// ROM/Scan (route uses /rom/)
	rom: 'Scan',
	scan: 'Select Scan',
	'start-scan': 'Select Scan',
	summary: 'Summary',
	captures: 'Captures',
	'posture-analytics': 'Posture',
	'scan-result': 'Scan Result',
	program: 'Custom Options',

	// Custom
	custom: 'Custom',

	// Programs
	programs: 'Programs',
	generate: 'Generate',
	sessions: 'Sessions',

	// Survey
	survey: 'Survey',
	create: 'Create',
	assign: 'Assign',

	// Report
	report: 'Report',
};

/**
 * Parent categories that have subpages
 * Maps parent segment to display name
 */
const PARENT_CATEGORIES: Record<string, string> = {
	'virtual-evaluation': 'Evaluation',
	rom: '',
	'posture-analytics': 'Posture',
	custom: 'Custom',
	program: 'Programs',
	survey: 'Survey',
	report: 'Report',
};

/**
 * Subpage segments that should be combined with parent
 */
const SUBPAGE_SEGMENTS = new Set([
	'start',
	'result',
	'scan',
	'start-scan',
	'summary',
	'captures',
	'scan-result',
	'generate',
	'create',
	'assign',
]);

/**
 * Hook to get the current page title from the route
 * Returns "Parent Subpage" format for nested routes
 */
export function usePageTitle(): string {
	const location = useLocation();

	const pageTitle = useMemo(() => {
		const segments = location.pathname.split('/').filter(Boolean);

		// Skip UUID segments (they're user IDs)
		const meaningfulSegments = segments.filter(segment => !isUUID(segment));

		if (meaningfulSegments.length === 0) {
			return 'Home';
		}

		// Get last two meaningful segments
		const lastSegment = meaningfulSegments[meaningfulSegments.length - 1];
		const parentSegment = meaningfulSegments[meaningfulSegments.length - 2];

		// Check if this is a subpage that should show parent
		if (
			parentSegment &&
			PARENT_CATEGORIES[parentSegment.toLowerCase()] &&
			SUBPAGE_SEGMENTS.has(lastSegment.toLowerCase())
		) {
			const parentTitle = PARENT_CATEGORIES[parentSegment.toLowerCase()];
			const subpageTitle = getSegmentTitle(lastSegment);
			if (parentTitle === 'Programs' && subpageTitle === 'Generate') {
				return `${subpageTitle} ${parentTitle}`;
			}else if(parentTitle === 'Programs' && subpageTitle === 'Create') {
				return `Program List`;
			}

			return `${parentTitle} ${subpageTitle}`;
		}

		// Single page title
		return getSegmentTitle(lastSegment);
	}, [location.pathname]);

	return pageTitle;
}

/**
 * Get title for a single segment
 */
function getSegmentTitle(segment: string): string {
	const title = ROUTE_TITLES[segment.toLowerCase()];

	if (title) {
		return title;
	}

	// Fallback: Convert kebab-case to Title Case
	return segment
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Check if a string is a UUID
 */
function isUUID(str: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
}
