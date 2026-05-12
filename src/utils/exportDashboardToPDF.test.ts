/**
 * Unit Tests for Export Dashboard to PDF Utility
 *
 * EPIC-031-S6: Comprehensive test coverage for PDF export functionality
 *
 * Tests cover:
 * - PDF generation with correct data
 * - Filename format and sanitization
 * - Error handling
 * - Data transformation
 * - Edge cases (empty arrays, special characters)
 */

import { exportDashboardToPDF, type DashboardExportData } from './exportDashboardToPDF';
import jsPDF from 'jspdf';

// Mock jsPDF
jest.mock('jspdf');

describe('exportDashboardToPDF', () => {
	let mockDoc: jest.Mocked<jsPDF>;
	let mockSave: jest.Mock;
	let mockText: jest.Mock;
	let mockSetFontSize: jest.Mock;
	let mockSetFont: jest.Mock;
	let mockSetTextColor: jest.Mock;
	let mockAddPage: jest.Mock;
	let mockGetNumberOfPages: jest.Mock;
	let mockSetPage: jest.Mock;

	// Mock data fixture
	const mockData: DashboardExportData = {
		userName: 'John Doe',
		romScore: 85,
		sessionCount: 12,
		streak: 5,
		activePrograms: ['Lower Back Rehab', 'Shoulder Mobility'],
		assessmentStatus: [
			{ name: 'ROM Assessment', status: 'Completed' },
			{ name: 'Posture Scan', status: 'Pending' },
		],
		exportDate: '2025-10-20T00:00:00Z',
	};

	beforeEach(() => {
		// Reset all mocks
		jest.clearAllMocks();

		// Setup mock functions
		mockSave = jest.fn();
		mockText = jest.fn();
		mockSetFontSize = jest.fn();
		mockSetFont = jest.fn();
		mockSetTextColor = jest.fn();
		mockAddPage = jest.fn();
		mockGetNumberOfPages = jest.fn().mockReturnValue(1);
		mockSetPage = jest.fn();

		// Mock jsPDF instance
		mockDoc = {
			text: mockText,
			setFontSize: mockSetFontSize,
			setFont: mockSetFont,
			setTextColor: mockSetTextColor,
			addPage: mockAddPage,
			getNumberOfPages: mockGetNumberOfPages,
			setPage: mockSetPage,
			save: mockSave,
			internal: {
				pageSize: {
					getWidth: () => 210,
					getHeight: () => 297,
				},
			},
		} as unknown as jest.Mocked<jsPDF>;

		// Mock jsPDF constructor
		(jsPDF as jest.MockedClass<typeof jsPDF>).mockReturnValue(mockDoc);
	});

	describe('Basic PDF Generation', () => {
		it('should generate PDF with correct title including user name', () => {
			exportDashboardToPDF(mockData);

			// Verify title was set
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Dashboard Summary - John Doe'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should include formatted export date', () => {
			exportDashboardToPDF(mockData);

			// Verify date was formatted and included
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Generated:'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should include all metrics (ROM score, session count, streak)', () => {
			exportDashboardToPDF(mockData);

			// Verify metrics section
			expect(mockText).toHaveBeenCalledWith('Metrics', expect.any(Number), expect.any(Number));
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('ROM Score: 85'),
				expect.any(Number),
				expect.any(Number)
			);
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Sessions This Week: 12'),
				expect.any(Number),
				expect.any(Number)
			);
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Current Streak: 5 days'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should include all active programs', () => {
			exportDashboardToPDF(mockData);

			// Verify programs section
			expect(mockText).toHaveBeenCalledWith('Active Programs', expect.any(Number), expect.any(Number));
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('• Lower Back Rehab'),
				expect.any(Number),
				expect.any(Number)
			);
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('• Shoulder Mobility'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should include all assessment status entries', () => {
			exportDashboardToPDF(mockData);

			// Verify assessment section
			expect(mockText).toHaveBeenCalledWith('Assessment Status', expect.any(Number), expect.any(Number));
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('ROM Assessment: Completed'),
				expect.any(Number),
				expect.any(Number)
			);
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Posture Scan: Pending'),
				expect.any(Number),
				expect.any(Number)
			);
		});
	});

	describe('PDF Filename Generation', () => {
		it('should save PDF with date-based filename format', () => {
			exportDashboardToPDF(mockData);

			// Verify save was called with correct filename pattern
			expect(mockSave).toHaveBeenCalledWith(
				expect.stringMatching(/^dashboard-summary-\d{4}-\d{2}-\d{2}\.pdf$/)
			);
		});

		it('should include current date in filename', () => {
			const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
			exportDashboardToPDF(mockData);

			expect(mockSave).toHaveBeenCalledWith(expect.stringContaining(today));
		});

		it('should sanitize filename with invalid characters', () => {
			const dataWithSpecialChars: DashboardExportData = {
				...mockData,
				userName: 'John<>Doe:/Test',
			};

			exportDashboardToPDF(dataWithSpecialChars);

			// Filename should not contain invalid characters
			const savedFilename = mockSave.mock.calls[0][0] as string;
			expect(savedFilename).not.toMatch(/[<>:"/\\|?*]/);
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty active programs array', () => {
			const dataWithNoPrograms: DashboardExportData = {
				...mockData,
				activePrograms: [],
			};

			exportDashboardToPDF(dataWithNoPrograms);

			// Verify empty state message
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('No active programs'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should handle empty assessment status array', () => {
			const dataWithNoAssessments: DashboardExportData = {
				...mockData,
				assessmentStatus: [],
			};

			exportDashboardToPDF(dataWithNoAssessments);

			// Verify empty state message
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('No assessments available'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should handle zero metrics values', () => {
			const dataWithZeroMetrics: DashboardExportData = {
				...mockData,
				romScore: 0,
				sessionCount: 0,
				streak: 0,
			};

			exportDashboardToPDF(dataWithZeroMetrics);

			// Verify zero values are displayed
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('ROM Score: 0'),
				expect.any(Number),
				expect.any(Number)
			);
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Sessions This Week: 0'),
				expect.any(Number),
				expect.any(Number)
			);
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Current Streak: 0 days'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should handle special characters in user name', () => {
			const dataWithSpecialChars: DashboardExportData = {
				...mockData,
				userName: 'José María Gonzàlez',
			};

			exportDashboardToPDF(dataWithSpecialChars);

			// Verify special characters are preserved in title
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('José María Gonzàlez'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should handle long program names', () => {
			const dataWithLongNames: DashboardExportData = {
				...mockData,
				activePrograms: [
					'Comprehensive Lower Back Pain Relief and Rehabilitation Program for Chronic Conditions',
				],
			};

			exportDashboardToPDF(dataWithLongNames);

			// Verify long names are included (may wrap in actual PDF)
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Comprehensive Lower Back Pain Relief'),
				expect.any(Number),
				expect.any(Number)
			);
		});
	});

	describe('Error Handling', () => {
		it('should throw error if PDF generation fails', () => {
			// Mock jsPDF to throw error
			mockSave.mockImplementation(() => {
				throw new Error('PDF save failed');
			});

			// Verify error is thrown
			expect(() => exportDashboardToPDF(mockData)).toThrow('PDF generation failed');
		});

		it('should log error to console on failure', () => {
			const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

			mockSave.mockImplementation(() => {
				throw new Error('PDF save failed');
			});

			try {
				exportDashboardToPDF(mockData);
			} catch {
				// Expected error
			}

			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Failed to generate PDF:',
				expect.any(Error)
			);

			consoleErrorSpy.mockRestore();
		});
	});

	describe('PDF Formatting', () => {
		it('should set appropriate font sizes for different sections', () => {
			exportDashboardToPDF(mockData);

			// Verify font sizes were set
			expect(mockSetFontSize).toHaveBeenCalledWith(20); // Title
			expect(mockSetFontSize).toHaveBeenCalledWith(16); // Section headers
			expect(mockSetFontSize).toHaveBeenCalledWith(12); // Body text
			expect(mockSetFontSize).toHaveBeenCalledWith(10); // Footer
		});

		it('should set bold font for headers', () => {
			exportDashboardToPDF(mockData);

			// Verify bold font was set for headers
			expect(mockSetFont).toHaveBeenCalledWith('helvetica', 'bold');
		});

		it('should set normal font for body text', () => {
			exportDashboardToPDF(mockData);

			// Verify normal font was set
			expect(mockSetFont).toHaveBeenCalledWith('helvetica', 'normal');
		});

		it('should use different text colors (black and gray)', () => {
			exportDashboardToPDF(mockData);

			// Verify color changes
			expect(mockSetTextColor).toHaveBeenCalledWith(0, 0, 0); // Black
			expect(mockSetTextColor).toHaveBeenCalledWith(100, 100, 100); // Gray
		});

		it('should add page numbers in footer', () => {
			exportDashboardToPDF(mockData);

			// Verify footer with page numbers
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Page 1 of 1'),
				expect.any(Number),
				expect.any(Number),
				expect.any(Object)
			);
		});
	});

	describe('Console Logging', () => {
		it('should log success message after PDF generation', () => {
			const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

			exportDashboardToPDF(mockData);

			expect(consoleLogSpy).toHaveBeenCalledWith(
				expect.stringContaining('PDF exported successfully:'),
				expect.any(String)
			);

			consoleLogSpy.mockRestore();
		});
	});

	describe('Data Transformation', () => {
		it('should format date from ISO 8601 to readable format', () => {
			exportDashboardToPDF(mockData);

			// Verify date was formatted (should be "October 20, 2025" or similar)
			expect(mockText).toHaveBeenCalledWith(
				expect.stringMatching(/Generated: \w+ \d{1,2}, \d{4}/),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should handle different date formats in exportDate', () => {
			const dataWithDifferentDate: DashboardExportData = {
				...mockData,
				exportDate: '2025-12-25T14:30:00.000Z',
			};

			exportDashboardToPDF(dataWithDifferentDate);

			// Verify date was parsed correctly
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('December 25, 2025'),
				expect.any(Number),
				expect.any(Number)
			);
		});
	});

	describe('Multiple Programs and Assessments', () => {
		it('should handle large number of active programs', () => {
			const dataWithManyPrograms: DashboardExportData = {
				...mockData,
				activePrograms: Array.from({ length: 20 }, (_, i) => `Program ${i + 1}`),
			};

			exportDashboardToPDF(dataWithManyPrograms);

			// Verify all programs are included
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('• Program 1'),
				expect.any(Number),
				expect.any(Number)
			);
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('• Program 20'),
				expect.any(Number),
				expect.any(Number)
			);
		});

		it('should handle large number of assessments', () => {
			const dataWithManyAssessments: DashboardExportData = {
				...mockData,
				assessmentStatus: Array.from({ length: 15 }, (_, i) => ({
					name: `Assessment ${i + 1}`,
					status: i % 2 === 0 ? 'Completed' : 'Pending',
				})),
			};

			exportDashboardToPDF(dataWithManyAssessments);

			// Verify assessments are included
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Assessment 1: Completed'),
				expect.any(Number),
				expect.any(Number)
			);
			expect(mockText).toHaveBeenCalledWith(
				expect.stringContaining('Assessment 15: Pending'),
				expect.any(Number),
				expect.any(Number)
			);
		});
	});
});
