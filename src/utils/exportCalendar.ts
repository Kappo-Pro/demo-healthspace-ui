/**
 * exportCalendar
 *
 * Utilities for exporting calendar activities to PDF and iCal formats
 *
 * Features:
 * - PDF export with jsPDF + autotable
 * - iCal export compatible with Google Calendar, Apple Calendar, Outlook
 * - Respects filters and date ranges
 * - Custom filenames with patient name and date range
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createEvents, EventAttributes } from 'ics';
import { format } from 'date-fns';
import type { ScheduledActivity } from '@services/mockSchedulingApi';

// ============================================================================
// Types
// ============================================================================

export interface ExportOptions {
  patientName?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeCompleted?: boolean;
  includeCancelled?: boolean;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  error?: string;
}

// ============================================================================
// PDF Export
// ============================================================================

/**
 * Generate PDF from scheduled activities
 */
export async function exportToPDF(
  activities: ScheduledActivity[],
  options: ExportOptions = {}
): Promise<ExportResult> {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.text('Activity Schedule', pageWidth / 2, 20, { align: 'center' });

    // Patient info
    if (options.patientName) {
      doc.setFontSize(12);
      doc.text(`Patient: ${options.patientName}`, 14, 30);
    }

    // Date range
    if (options.dateRange) {
      doc.setFontSize(10);
      const rangeText = `${format(options.dateRange.start, 'MMM d, yyyy')} - ${format(options.dateRange.end, 'MMM d, yyyy')}`;
      doc.text(rangeText, 14, 36);
    }

    // Generation date
    doc.setFontSize(8);
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 42);

    // Table data
    const tableData = activities.map(activity => [
      format(new Date(activity.scheduledFor), 'MMM d, yyyy'),
      activity.scheduledTime || '--',
      activity.title,
      activity.activityType,
      activity.status,
      activity.notes?.substring(0, 50) || '',
    ]);

    // Generate table
    autoTable(doc, {
      head: [['Date', 'Time', 'Activity', 'Type', 'Status', 'Notes']],
      body: tableData,
      startY: 48,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 15 }, // Time
        2: { cellWidth: 40 }, // Activity
        3: { cellWidth: 20 }, // Type
        4: { cellWidth: 20 }, // Status
        5: { cellWidth: 'auto' }, // Notes
      },
    });

    // Summary
    const finalY = (doc as unknown).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Activities: ${activities.length}`, 14, finalY);

    // Generate filename
    const filename = generateFilename('pdf', options);

    // Save
    doc.save(filename);

    return {
      success: true,
      filename,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate PDF';
    return {
      success: false,
      filename: '',
      error: errorMessage,
    };
  }
}

// ============================================================================
// iCal Export
// ============================================================================

/**
 * Convert Date to ICS date array format [year, month, day, hour, minute]
 */
function dateToArray(date: Date): [number, number, number, number, number] {
  return [
    date.getFullYear(),
    date.getMonth() + 1, // ICS months are 1-indexed
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
}

/**
 * Generate iCal file from scheduled activities
 */
export async function exportToICal(
  activities: ScheduledActivity[],
  options: ExportOptions = {}
): Promise<ExportResult> {
  try {
    // Convert activities to ICS events
    const icsEvents: EventAttributes[] = activities.map(activity => {
      const startDate = new Date(activity.scheduledFor);
      // Default 30-minute duration
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      const event: EventAttributes = {
        start: dateToArray(startDate),
        end: dateToArray(endDate),
        title: activity.title,
        description: [
          activity.description,
          activity.notes,
          activity.instructions,
        ]
          .filter(Boolean)
          .join('\n\n'),
        status: activity.status === 'COMPLETED' ? 'CONFIRMED' : 'TENTATIVE',
        busyStatus: 'BUSY',
        categories: [activity.activityType],
      };

      // Add recurrence if applicable
      if (activity.isRecurring && activity.recurringRule) {
        // Note: Full recurrence support would require more complex logic
        // This is a simplified implementation
      }

      return event;
    });

    // Generate ICS file
    const { error, value } = createEvents(icsEvents);

    if (error || !value) {
      throw new Error(error?.message || 'Failed to create iCal events');
    }

    // Generate filename
    const filename = generateFilename('ics', options);

    // Download file
    downloadFile(value, filename);

    return {
      success: true,
      filename,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate iCal';
    return {
      success: false,
      filename: '',
      error: errorMessage,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate filename based on options
 */
function generateFilename(format: 'pdf' | 'ics', options: ExportOptions): string {
  const parts: string[] = ['schedule'];

  if (options.patientName) {
    const sanitized = options.patientName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    parts.push(sanitized);
  }

  if (options.dateRange) {
    const start = format(options.dateRange.start, 'yyyy-MM-dd');
    const end = format(options.dateRange.end, 'yyyy-MM-dd');
    parts.push(`${start}_${end}`);
  } else {
    parts.push(format(new Date(), 'yyyy-MM-dd'));
  }

  return `${parts.join('-')}.${format}`;
}

/**
 * Download file as blob
 */
function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Filter activities by options
 */
export function filterActivitiesForExport(
  activities: ScheduledActivity[],
  options: ExportOptions
): ScheduledActivity[] {
  let filtered = [...activities];

  // Filter by date range
  if (options.dateRange) {
    const { start, end } = options.dateRange;
    filtered = filtered.filter(activity => {
      const activityDate = new Date(activity.scheduledFor);
      return (
        activityDate >= start &&
        activityDate <= end
      );
    });
  }

  // Filter by status
  if (!options.includeCompleted) {
    filtered = filtered.filter(a => a.status !== 'COMPLETED');
  }

  if (!options.includeCancelled) {
    filtered = filtered.filter(a => a.status !== 'CANCELLED' && a.status !== 'SKIPPED');
  }

  // Sort by date
  filtered.sort((a, b) => {
    const dateA = new Date(a.scheduledFor).getTime();
    const dateB = new Date(b.scheduledFor).getTime();
    return dateA - dateB;
  });

  return filtered;
}
