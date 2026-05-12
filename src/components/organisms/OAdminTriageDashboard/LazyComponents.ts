/**
 * Lazy-loaded components for Admin Triage Dashboard
 *
 * Code splitting implementation to reduce initial bundle size.
 * Story 3.8: Performance Optimization (NFR2 - AC2)
 *
 * @module components/organisms/OAdminTriageDashboard/LazyComponents
 */

import { lazy } from 'react';

/**
 * Lazy-loaded Bulk Status Update Modal
 * Loaded on demand when user clicks "Update Status" button
 */
export const LazyBulkStatusUpdateModal = lazy(
	() => import('./BulkStatusUpdateModal'),
);

/**
 * Lazy-loaded Bulk Clinician Assign Modal
 * Loaded on demand when user clicks "Assign Clinician" button
 */
export const LazyBulkClinicianAssignModal = lazy(
	() => import('./BulkClinicianAssignModal'),
);

/**
 * Lazy-loaded Bulk Export Modal
 * Loaded on demand when user clicks "Export" button
 */
export const LazyBulkExportModal = lazy(() => import('./BulkExportModal'));

/**
 * Lazy-loaded Virtualized Patient Table
 * Loaded on demand when virtualization is enabled
 */
export const LazyVirtualizedPatientTable = lazy(
	() => import('./VirtualizedPatientTable'),
);
