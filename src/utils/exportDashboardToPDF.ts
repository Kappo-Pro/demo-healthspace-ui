/**
 * Export Dashboard to PDF Utility
 *
 * EPIC-031-S2: Create exportPDF utility function using jsPDF
 *
 * This utility generates a PDF document containing dashboard summary data:
 * - User name and export date
 * - Key metrics (ROM score, session count, streak)
 * - Active programs list
 * - Assessment status
 *
 * The PDF auto-downloads with filename: dashboard-summary-[date].pdf
 */

import jsPDF from 'jspdf';
import { PDF_COLORS } from './design-system';

/**
 * Dashboard Export Data Interface
 * Defines the structure of data to be exported to PDF
 */
export interface DashboardExportData {
	/** User's full name */
	userName: string;
	/** Current ROM score (0-100) */
	romScore: number;
	/** Number of sessions completed this week */
	sessionCount: number;
	/** Current consecutive day streak */
	streak: number;
	/** List of active program names */
	activePrograms: string[];
	/** Assessment completion status */
	assessmentStatus: Array<{ name: string; status: string }>;
	/** ISO 8601 date string of export */
	exportDate: string;
}

/**
 * Export Dashboard Data to PDF
 *
 * Generates a formatted PDF document with dashboard summary data
 * and triggers automatic download.
 *
 * @param data - Dashboard data to export
 * @throws Error if PDF generation fails
 *
 * @example
 * ```typescript
 * const data: DashboardExportData = {
 *   userName: 'John Doe',
 *   romScore: 85,
 *   sessionCount: 12,
 *   streak: 5,
 *   activePrograms: ['Lower Back Rehab', 'Shoulder Mobility'],
 *   assessmentStatus: [
 *     { name: 'ROM Assessment', status: 'Completed' },
 *     { name: 'Posture Scan', status: 'Pending' }
 *   ],
 *   exportDate: new Date().toISOString()
 * };
 *
 * exportDashboardToPDF(data);
 * ```
 */
export const exportDashboardToPDF = (data: DashboardExportData): void => {
	try {
		// Initialize jsPDF document (A4 size, portrait orientation)
		const doc = new jsPDF();
		let yPosition = 20; // Current Y position for content

		// --- TITLE SECTION ---
		doc.setFontSize(20);
		doc.setFont('helvetica', 'bold');
		doc.text(`Dashboard Summary - ${data.userName}`, 20, yPosition);
		yPosition += 10;

		// Export date
		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');
		doc.setTextColor(100, 100, 100); // Gray color
		const formattedDate = new Date(data.exportDate).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
		doc.text(`Generated: ${formattedDate}`, 20, yPosition);
		yPosition += 20;

		// --- METRICS SECTION ---
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.setTextColor(...PDF_COLORS.textPrimary());
		doc.text('Metrics', 20, yPosition);
		yPosition += 10;

		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');
		doc.text(`ROM Score: ${data.romScore}`, 20, yPosition);
		yPosition += 8;
		doc.text(`Sessions This Week: ${data.sessionCount}`, 20, yPosition);
		yPosition += 8;
		doc.text(`Current Streak: ${data.streak} days`, 20, yPosition);
		yPosition += 20;

		// --- ACTIVE PROGRAMS SECTION ---
		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Active Programs', 20, yPosition);
		yPosition += 10;

		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');

		if (data.activePrograms.length === 0) {
			doc.setTextColor(150, 150, 150); // Light gray for empty state
			doc.text('No active programs', 20, yPosition);
			yPosition += 8;
		} else {
			data.activePrograms.forEach((program) => {
				// Check if we need a new page (within 30mm of bottom)
				if (yPosition > 270) {
					doc.addPage();
					yPosition = 20;
				}

				doc.setTextColor(...PDF_COLORS.textPrimary());
				doc.text(`• ${program}`, 20, yPosition);
				yPosition += 8;
			});
		}
		yPosition += 12;

		// --- ASSESSMENT STATUS SECTION ---
		// Check if we need a new page for assessment section
		if (yPosition > 240) {
			doc.addPage();
			yPosition = 20;
		}

		doc.setFontSize(16);
		doc.setFont('helvetica', 'bold');
		doc.text('Assessment Status', 20, yPosition);
		yPosition += 10;

		doc.setFontSize(12);
		doc.setFont('helvetica', 'normal');

		if (data.assessmentStatus.length === 0) {
			doc.setTextColor(150, 150, 150);
			doc.text('No assessments available', 20, yPosition);
			yPosition += 8;
		} else {
			data.assessmentStatus.forEach((assessment) => {
				// Check if we need a new page
				if (yPosition > 270) {
					doc.addPage();
					yPosition = 20;
				}

				doc.setTextColor(...PDF_COLORS.textPrimary());
				doc.text(`${assessment.name}: ${assessment.status}`, 20, yPosition);
				yPosition += 8;
			});
		}

		// --- FOOTER ---
		const pageCount = doc.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFontSize(10);
			doc.setTextColor(150, 150, 150);
			doc.text(
				`Page ${i} of ${pageCount}`,
				doc.internal.pageSize.getWidth() / 2,
				doc.internal.pageSize.getHeight() - 10,
				{ align: 'center' }
			);
		}

		// --- DOWNLOAD PDF ---
		const filename = sanitizeFilename(
			`dashboard-summary-${new Date().toISOString().split('T')[0]}.pdf`
		);
		doc.save(filename);

	} catch (error) {
		throw new Error('PDF generation failed. Please try again.');
	}
};

/**
 * Sanitize filename to prevent invalid characters
 *
 * @param filename - Original filename
 * @returns Sanitized filename safe for file systems
 */
function sanitizeFilename(filename: string): string {
	// Remove or replace characters that are invalid in filenames
	return filename.replace(/[<>:"/\\|?*]/g, '-');
}
