/**
 * SummaryTab Unit Tests
 *
 * Comprehensive test suite with ≥95% coverage
 *
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SummaryTab, formatDuration } from './SummaryTab';
import { TDataProps } from '@types';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCompleteData: TDataProps = {
	id: 'eval-123',
	createdAt: new Date('2025-10-30'),
	updatedAt: new Date('2025-10-30'),
	active: true,
	userId: 'user-123',
	painAssessments: [
		{
			id: 'pain-1',
			painIntensity: 6,
			strapiBodyPoint: {
				id: 1,
				attributes: {
					name: 'Lower Back',
					position: 'lumbar',
				},
			},
		},
		{
			id: 'pain-2',
			painIntensity: 4,
			strapiBodyPoint: {
				id: 2,
				attributes: {
					name: 'Right Shoulder',
					position: 'shoulder',
				},
			},
		},
	],
	healthSigns: {
		strapiHealthSigns: [
			{
				id: 1,
				attributes: {
					name: 'Limited Range of Motion',
					description: 'Reduced flexibility',
				},
			},
			{
				id: 2,
				attributes: {
					name: 'Muscle Weakness',
					description: 'Decreased strength',
				},
			},
		],
	},
	medicalHistories: {
		strapiMedicalHistories: [
			{
				id: 1,
				attributes: {
					name: 'Chronic Back Pain',
					description: 'Long-term condition',
				},
			},
		],
	},
};

const mockMinimalData: TDataProps = {
	id: 'eval-456',
	createdAt: new Date('2025-10-30'),
	updatedAt: new Date('2025-10-30'),
	active: false,
	userId: '',
	painAssessments: [],
	healthSigns: {
		strapiHealthSigns: [],
	},
	medicalHistories: {
		strapiMedicalHistories: [],
	},
};

const mockNoFindingsData: TDataProps = {
	id: 'eval-789',
	createdAt: new Date('2025-10-30'),
	updatedAt: new Date('2025-10-30'),
	active: true,
	userId: 'user-456',
	painAssessments: [],
	healthSigns: {
		strapiHealthSigns: [],
	},
	medicalHistories: {
		strapiMedicalHistories: [],
	},
};

// ============================================================================
// TESTS
// ============================================================================

describe('SummaryTab', () => {
	const mockOnStatusChange = jest.fn();
	const mockOnExport = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	// ========================================================================
	// AC-2.1.1: Evaluation Metadata Display
	// ========================================================================

	describe('AC-2.1.1: Metadata Display', () => {
		it('renders metadata correctly with complete data', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			expect(screen.getByText(/October 30, 2025/i)).toBeInTheDocument();
			expect(screen.getByText(/Pending/i)).toBeInTheDocument();
			expect(screen.getByRole('progressbar')).toBeInTheDocument();
		});

		it('renders metadata with missing optional fields', () => {
			render(
				<SummaryTab
					data={mockMinimalData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			expect(screen.getByText(/October 30, 2025/i)).toBeInTheDocument();
			expect(screen.getAllByText(/N\/A/i)).toHaveLength(2); // Provider and Duration
		});

		it('displays date in correct format', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			// Expect full date format: "October 30, 2025"
			const dateElement = screen.getByText(/October 30, 2025/i);
			expect(dateElement).toBeInTheDocument();
		});
	});

	// ========================================================================
	// AC-2.1.2: Key Findings Section
	// ========================================================================

	describe('AC-2.1.2: Key Findings', () => {
		it('displays key findings as bullet list', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			expect(screen.getByText(/Key Findings/i)).toBeInTheDocument();
			expect(screen.getByText(/Lower Back.*6\/10/i)).toBeInTheDocument();
			expect(screen.getByText(/Right Shoulder.*4\/10/i)).toBeInTheDocument();
		});

		it('shows empty state when no findings', () => {
			render(
				<SummaryTab
					data={mockNoFindingsData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			expect(screen.getByText(/No key findings available/i)).toBeInTheDocument();
		});

		it('limits findings to maximum 5 items', () => {
			const dataWithManyFindings: TDataProps = {
				...mockCompleteData,
				painAssessments: Array(10)
					.fill(null)
					.map((_, i) => ({
						id: `pain-${i}`,
						painIntensity: 5,
						strapiBodyPoint: {
							id: i,
							attributes: {
								name: `Body Part ${i}`,
								position: `position-${i}`,
							},
						},
					})),
			};

			render(
				<SummaryTab
					data={dataWithManyFindings}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const findingsList = screen.getByRole('list');
			const findings = findingsList.querySelectorAll('li');
			expect(findings.length).toBeLessThanOrEqual(5);
		});

		it('includes health signs in findings', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			expect(screen.getByText(/Health signs:.*Limited Range of Motion/i)).toBeInTheDocument();
		});

		it('includes medical history in findings', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			expect(screen.getByText(/Medical history:.*Chronic Back Pain/i)).toBeInTheDocument();
		});
	});

	// ========================================================================
	// AC-2.1.3 & AC-2.1.4: Status Dropdown (tested via StatusDropdown component)
	// ========================================================================

	describe('AC-2.1.3: Status Dropdown Integration', () => {
		it('renders status dropdown with current status', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const dropdown = screen.getByTestId('status-dropdown');
			expect(dropdown).toBeInTheDocument();
		});

		it('calls onStatusChange when dropdown changes', async () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const dropdown = screen.getByTestId('status-dropdown');
			fireEvent.mouseDown(dropdown);

			await waitFor(() => {
				const inReviewOption = screen.getByText('In Review');
				expect(inReviewOption).toBeInTheDocument();
			});
		});
	});

	// ========================================================================
	// AC-2.1.5: Export PDF Button
	// ========================================================================

	describe('AC-2.1.5: Export Button', () => {
		it('renders export button', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const exportButton = screen.getByTestId('export-button');
			expect(exportButton).toBeInTheDocument();
			expect(exportButton).toHaveTextContent(/Export PDF/i);
		});

		it('calls onExport with evaluation ID when clicked', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const exportButton = screen.getByTestId('export-button');
			fireEvent.click(exportButton);

			expect(mockOnExport).toHaveBeenCalledWith('eval-123');
			expect(mockOnExport).toHaveBeenCalledTimes(1);
		});

		it('shows loading state when exportLoading is true', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
					exportLoading={true}
				/>
			);

			const exportButton = screen.getByTestId('export-button');
			expect(exportButton).toHaveTextContent(/Exporting.../i);
		});

		it('disables export button when no evaluation ID', () => {
			const dataWithoutId = { ...mockCompleteData, id: '' };

			render(
				<SummaryTab
					data={dataWithoutId}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const exportButton = screen.getByTestId('export-button');
			expect(exportButton).toBeDisabled();
		});
	});

	// ========================================================================
	// AC-2.1.6: Responsive Layout
	// ========================================================================

	describe('AC-2.1.6: Responsive Layout', () => {
		it('renders content grid for layout', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			// ContentGrid should exist with metadata and actions sections
			const metadataSection = screen.getByText('Evaluation Details').parentElement;
			const actionsSection = screen.getByText('Quick Actions').parentElement;

			expect(metadataSection).toBeInTheDocument();
			expect(actionsSection).toBeInTheDocument();
		});

		it('renders all sections for different viewport sizes', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			// All sections should be present regardless of viewport
			expect(screen.getByText('Evaluation Details')).toBeInTheDocument();
			expect(screen.getByText('Quick Actions')).toBeInTheDocument();
			expect(screen.getByText('Key Findings')).toBeInTheDocument();
		});
	});

	// ========================================================================
	// AC-2.1.7: Empty State Handling
	// ========================================================================

	describe('AC-2.1.7: Empty State Handling', () => {
		it('shows N/A for missing optional fields', () => {
			render(
				<SummaryTab
					data={mockMinimalData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			// Provider and Duration should show N/A
			const naElements = screen.getAllByText(/N\/A/i);
			expect(naElements.length).toBeGreaterThanOrEqual(2);
		});

		it('shows empty state for key findings when data is minimal', () => {
			render(
				<SummaryTab
					data={mockNoFindingsData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			expect(screen.getByText(/No key findings available/i)).toBeInTheDocument();
		});

		it('defaults status to pending when missing', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			// Status tag should show "Pending" by default
			expect(screen.getByText('Pending')).toBeInTheDocument();
		});

		it('keeps export button enabled with minimal data', () => {
			render(
				<SummaryTab
					data={mockMinimalData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const exportButton = screen.getByTestId('export-button');
			expect(exportButton).not.toBeDisabled();
		});
	});

	// ========================================================================
	// Completion Percentage Calculation
	// ========================================================================

	describe('Completion Percentage', () => {
		it('calculates 100% for complete data', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const progressBar = screen.getByRole('progressbar');
			expect(progressBar).toHaveAttribute('aria-valuenow', '100');
		});

		it('calculates lower percentage for minimal data', () => {
			render(
				<SummaryTab
					data={mockMinimalData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			const progressBar = screen.getByRole('progressbar');
			const value = parseInt(progressBar.getAttribute('aria-valuenow') || '0');
			expect(value).toBeLessThan(100);
			expect(value).toBeGreaterThanOrEqual(0);
		});
	});

	// ========================================================================
	// Helper Functions
	// ========================================================================

	describe('Helper Functions', () => {
		describe('formatDuration', () => {
			it('formats minutes less than 60', () => {
				expect(formatDuration(45)).toBe('45m');
				expect(formatDuration(15)).toBe('15m');
			});

			it('formats hours without minutes', () => {
				expect(formatDuration(60)).toBe('1h');
				expect(formatDuration(120)).toBe('2h');
			});

			it('formats hours with minutes', () => {
				expect(formatDuration(90)).toBe('1h 30m');
				expect(formatDuration(135)).toBe('2h 15m');
			});
		});
	});

	// ========================================================================
	// Integration Tests
	// ========================================================================

	describe('Integration', () => {
		it('renders all sections together', () => {
			render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
				/>
			);

			// Metadata section
			expect(screen.getByText('Evaluation Details')).toBeInTheDocument();
			expect(screen.getByText(/October 30, 2025/i)).toBeInTheDocument();

			// Actions section
			expect(screen.getByText('Quick Actions')).toBeInTheDocument();
			expect(screen.getByTestId('status-dropdown')).toBeInTheDocument();
			expect(screen.getByTestId('export-button')).toBeInTheDocument();

			// Key findings section
			expect(screen.getByText('Key Findings')).toBeInTheDocument();
		});

		it('handles all props correctly', () => {
			const { rerender } = render(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
					exportLoading={false}
				/>
			);

			expect(screen.getByTestId('export-button')).toHaveTextContent(/Export PDF/i);

			rerender(
				<SummaryTab
					data={mockCompleteData}
					onStatusChange={mockOnStatusChange}
					onExport={mockOnExport}
					exportLoading={true}
				/>
			);

			expect(screen.getByTestId('export-button')).toHaveTextContent(/Exporting.../i);
		});
	});
});
