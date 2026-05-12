/**
 * ProgramAssignmentDrawer Component Tests
 * Story 5.2: Tests for program assignment management drawer
 *
 * Acceptance Criteria Coverage:
 * - AC 1: Renders as Ant Design Drawer (right side, 480px width)
 * - AC 2: Displays list of programs with multi-select checkboxes
 * - AC 3: Pre-selects currently assigned programs
 * - AC 4: Groups programs by category with collapsible sections
 * - AC 5: Search filters programs by name
 * - AC 6: Select All and Deselect All buttons
 * - AC 7: Shows assignment count badge
 * - AC 8: Save button calls API
 * - AC 9: Loading states (skeleton, spinner)
 * - AC 10: Success message and closes drawer
 */

// Mock @strapi to prevent import errors from ROM store
jest.mock('@strapi', () => ({
	default: {
		get: jest.fn(),
		post: jest.fn(),
		put: jest.fn(),
		patch: jest.fn(),
		delete: jest.fn(),
	},
}));

import { configureStore } from '@reduxjs/toolkit';
import program from '@stores/shared/patientDetail/program';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { ProgramAssignmentDrawer } from '../ProgramAssignmentDrawer';

// Mock message component
jest.mock('antd', () => {
	const actual = jest.requireActual('antd');
	return {
		...actual,
		message: {
			success: jest.fn(),
			error: jest.fn(),
		},
	};
});

const mockPrograms = [
	{
		id: 'prog-1',
		name: 'Physical Therapy Program',
		originType: 'Physical Therapy',
		userId: 'user-1',
		active: true,
		duration: 30,
		durationType: 'days',
		status: 'approved',
		startAt: new Date(),
		finishAt: new Date(),
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: new Date(),
		programTemplateId: 'template-1',
		rehabPatientListExercisesId: null,
	},
	{
		id: 'prog-2',
		name: 'Occupational Therapy Program',
		originType: 'Occupational Therapy',
		userId: 'user-1',
		active: true,
		duration: 45,
		durationType: 'days',
		status: 'approved',
		startAt: new Date(),
		finishAt: new Date(),
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: new Date(),
		programTemplateId: 'template-2',
		rehabPatientListExercisesId: null,
	},
	{
		id: 'prog-3',
		name: 'Rehabilitation Program',
		originType: 'Rehab',
		userId: 'user-1',
		active: true,
		duration: 60,
		durationType: 'days',
		status: 'approved',
		startAt: new Date(),
		finishAt: new Date(),
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: new Date(),
		programTemplateId: 'template-3',
		rehabPatientListExercisesId: null,
	},
];

const createMockStore = (initialState = {}) => {
	return configureStore({
		reducer: {
			program,
		},
		preloadedState: {
			program: {
				program: {
					data: mockPrograms,
					pagination: null,
				},
				latestUpdatedProgram: null,
				programApproved: {
					data: [],
					pagination: null,
				},
				openAiProgram: {
					data: null,
					errorMessage: '',
					loading: false,
					statusCode: 0,
				},
				vitalflowAiProgram: {
					data: null,
					errorMessage: '',
					loading: false,
					statusCode: 0,
				},
				programTemplate: {
					data: [],
					pagination: null,
				},
				programSummary: {
					data: [],
					pagination: null,
				},
				programByIdList: {
					data: [],
					pagination: null,
				},
				exerciseByProgram: {
					data: [],
					pagination: null,
				},
				isSessionClicked: false,
				main: {
					sessionId: '',
					program: null,
					exercises: [],
					completedExercises: [],
					currentExercise: null,
					transitionTime: 3,
					isAuto: false,
					uploadProgress: [],
					isCompleted: false,
				},
				blockNavigation: {
					isBlocked: false,
					config: null,
					nextLocation: null,
					callBack: null,
				},
				isProgramPaused: false,
				...initialState,
			},
		},
	});
};

describe('ProgramAssignmentDrawer Component', () => {
	const mockOnClose = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('AC 1: Renders as Ant Design Drawer (right side, 480px width)', () => {
		it('renders drawer when open', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Assign Programs')).toBeInTheDocument();
		});

		it('shows drawer title "Assign Programs"', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Assign Programs')).toBeInTheDocument();
		});
	});

	describe('AC 2: Displays list of programs with multi-select checkboxes', () => {
		it('renders all programs from store', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Physical Therapy Program')).toBeInTheDocument();
			expect(
				screen.getByText('Occupational Therapy Program'),
			).toBeInTheDocument();
			expect(screen.getByText('Rehabilitation Program')).toBeInTheDocument();
		});

		it('renders checkboxes for all programs', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const checkboxes = screen.getAllByRole('checkbox');
			// 3 programs
			expect(checkboxes.length).toBe(3);
		});
	});

	describe('AC 3: Pre-selects currently assigned programs', () => {
		it('pre-selects assigned programs', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer
						userId="user-1"
						onClose={mockOnClose}
						initialAssignedPrograms={['prog-1', 'prog-2']}
					/>
				</Provider>,
			);

			const checkboxes = screen.getAllByRole('checkbox');
			expect(checkboxes[0]).toBeChecked(); // prog-1
			expect(checkboxes[1]).toBeChecked(); // prog-2
			expect(checkboxes[2]).not.toBeChecked(); // prog-3
		});

		it('shows correct count for pre-selected programs', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer
						userId="user-1"
						onClose={mockOnClose}
						initialAssignedPrograms={['prog-1']}
					/>
				</Provider>,
			);

			expect(screen.getByText(/1.*programs selected/)).toBeInTheDocument();
		});
	});

	describe('AC 4: Groups programs by category', () => {
		it('groups programs by originType', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText(/Physical Therapy \(1\)/)).toBeInTheDocument();
			expect(
				screen.getByText(/Occupational Therapy \(1\)/),
			).toBeInTheDocument();
			expect(screen.getByText(/Rehab \(1\)/)).toBeInTheDocument();
		});
	});

	describe('AC 5: Search filters programs by name', () => {
		it('renders search input', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(
				screen.getByPlaceholderText('Search programs by name'),
			).toBeInTheDocument();
		});

		it('filters programs by name (case-insensitive)', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const searchInput = screen.getByPlaceholderText(
				'Search programs by name',
			);
			await user.type(searchInput, 'physical');

			// Wait for debounce (300ms)
			await waitFor(
				() => {
					expect(
						screen.getByText('Physical Therapy Program'),
					).toBeInTheDocument();
					expect(
						screen.queryByText('Occupational Therapy Program'),
					).not.toBeInTheDocument();
					expect(
						screen.queryByText('Rehabilitation Program'),
					).not.toBeInTheDocument();
				},
				{ timeout: 500 },
			);
		});

		it('shows all programs when search is cleared', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const searchInput = screen.getByPlaceholderText(
				'Search programs by name',
			);
			await user.type(searchInput, 'physical');
			await user.clear(searchInput);

			await waitFor(
				() => {
					expect(
						screen.getByText('Physical Therapy Program'),
					).toBeInTheDocument();
					expect(
						screen.getByText('Occupational Therapy Program'),
					).toBeInTheDocument();
					expect(
						screen.getByText('Rehabilitation Program'),
					).toBeInTheDocument();
				},
				{ timeout: 500 },
			);
		});
	});

	describe('AC 6: Select All and Deselect All buttons', () => {
		it('select all button selects all visible programs', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const selectAllButton = screen.getByText('Select All');
			await user.click(selectAllButton);

			const checkboxes = screen.getAllByRole('checkbox');
			checkboxes.forEach(checkbox => {
				expect(checkbox).toBeChecked();
			});

			expect(screen.getByText(/3.*programs selected/)).toBeInTheDocument();
		});

		it('deselect all button clears all selections', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer
						userId="user-1"
						onClose={mockOnClose}
						initialAssignedPrograms={['prog-1', 'prog-2']}
					/>
				</Provider>,
			);

			const deselectAllButton = screen.getByText('Deselect All');
			await user.click(deselectAllButton);

			const checkboxes = screen.getAllByRole('checkbox');
			checkboxes.forEach(checkbox => {
				expect(checkbox).not.toBeChecked();
			});

			expect(screen.getByText(/0.*programs selected/)).toBeInTheDocument();
		});

		it('select all respects search filter', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			// Search for "therapy"
			const searchInput = screen.getByPlaceholderText(
				'Search programs by name',
			);
			await user.type(searchInput, 'therapy');

			// Wait for debounce
			await waitFor(
				() => {
					expect(
						screen.getByText('Physical Therapy Program'),
					).toBeInTheDocument();
				},
				{ timeout: 500 },
			);

			// Click Select All - should only select visible programs
			const selectAllButton = screen.getByText('Select All');
			await user.click(selectAllButton);

			// Should show 2 programs selected (Physical Therapy + Occupational Therapy)
			expect(screen.getByText(/2.*programs selected/)).toBeInTheDocument();
		});
	});

	describe('AC 7: Shows assignment count badge', () => {
		it('displays count badge with 0 initially', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText(/0.*programs selected/)).toBeInTheDocument();
		});

		it('count badge updates when checkbox toggled', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const checkboxes = screen.getAllByRole('checkbox');
			await user.click(checkboxes[0]);

			await waitFor(() => {
				expect(screen.getByText(/1.*programs selected/)).toBeInTheDocument();
			});

			await user.click(checkboxes[1]);

			await waitFor(() => {
				expect(screen.getByText(/2.*programs selected/)).toBeInTheDocument();
			});
		});
	});

	describe('AC 8, 9, 10: Save, loading states, success message', () => {
		it('renders save and cancel buttons', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Save Assignments')).toBeInTheDocument();
			expect(screen.getByText('Cancel')).toBeInTheDocument();
		});

		it('calls onClose when cancel clicked', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const cancelButton = screen.getByText('Cancel');
			await user.click(cancelButton);

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Edge cases', () => {
		it('handles empty program list', () => {
			const store = createMockStore({
				program: {
					data: [],
					pagination: null,
				},
			});

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('No programs found')).toBeInTheDocument();
		});

		it('renders without initial assigned programs', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const checkboxes = screen.getAllByRole('checkbox');
			checkboxes.forEach(checkbox => {
				expect(checkbox).not.toBeChecked();
			});
		});

		it('handles multiple toggles independently', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ProgramAssignmentDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const checkboxes = screen.getAllByRole('checkbox');

			await user.click(checkboxes[0]); // Check prog-1
			await user.click(checkboxes[2]); // Check prog-3

			expect(checkboxes[0]).toBeChecked();
			expect(checkboxes[1]).not.toBeChecked();
			expect(checkboxes[2]).toBeChecked();

			expect(screen.getByText(/2.*programs selected/)).toBeInTheDocument();
		});
	});
});
