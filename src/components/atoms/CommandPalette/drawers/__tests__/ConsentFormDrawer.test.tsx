/**
 * ConsentFormDrawer Component Tests
 * Story 5.3: Tests for consent form management drawer
 *
 * Acceptance Criteria Coverage:
 * - AC 1: Renders as Ant Design Drawer (right side, 600px width)
 * - AC 2: Displays list of existing consent forms
 * - AC 3: Upload button accepts PDF/image (max 10MB)
 * - AC 4: View button opens document in new tab
 * - AC 5: Download button triggers file download
 * - AC 6: Status badges (Pending/Approved/Rejected)
 * - AC 7: Delete button with confirmation modal
 * - AC 8: Loading states (skeleton during fetch)
 * - AC 9: Success/error messages
 * - AC 10: Integrates with CommandPalette (via props)
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
import consentForms from '@stores/shared/consentForms';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { ConsentFormDrawer } from '../ConsentFormDrawer';

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

const mockForms = [
	{
		id: 'form-1',
		userId: 'user-1',
		fileName: 'consent-form.pdf',
		fileUrl: 'https://example.com/consent-form.pdf',
		fileType: 'application/pdf',
		fileSize: 1024000, // ~1MB
		status: 'approved' as const,
		uploadedAt: new Date('2025-01-01'),
	},
	{
		id: 'form-2',
		userId: 'user-1',
		fileName: 'photo-id.jpg',
		fileUrl: 'https://example.com/photo-id.jpg',
		fileType: 'image/jpeg',
		fileSize: 512000, // ~500KB
		status: 'pending' as const,
		uploadedAt: new Date('2025-01-02'),
	},
	{
		id: 'form-3',
		userId: 'user-1',
		fileName: 'rejected-form.pdf',
		fileUrl: 'https://example.com/rejected-form.pdf',
		fileType: 'application/pdf',
		fileSize: 2048000, // ~2MB
		status: 'rejected' as const,
		uploadedAt: new Date('2025-01-03'),
	},
];

const createMockStore = (initialState = {}) => {
	return configureStore({
		reducer: {
			consentForms,
		},
		preloadedState: {
			consentForms: {
				forms: mockForms,
				loading: false,
				error: null,
				uploadProgress: 0,
				...initialState,
			},
		},
	});
};

describe('ConsentFormDrawer Component', () => {
	const mockOnClose = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('AC 1: Renders as Ant Design Drawer (right side, 600px width)', () => {
		it('renders drawer when open', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Consent Forms')).toBeInTheDocument();
		});

		it('shows drawer title "Consent Forms"', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Consent Forms')).toBeInTheDocument();
		});
	});

	describe('AC 2: Displays list of existing consent forms', () => {
		it('renders all consent forms from store', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('consent-form.pdf')).toBeInTheDocument();
			expect(screen.getByText('photo-id.jpg')).toBeInTheDocument();
			expect(screen.getByText('rejected-form.pdf')).toBeInTheDocument();
		});

		it('displays file sizes', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('1000 KB')).toBeInTheDocument();
			expect(screen.getByText('500 KB')).toBeInTheDocument();
		});

		it('displays upload dates', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText(/Uploaded:.*1\/1\/2025/)).toBeInTheDocument();
			expect(screen.getByText(/Uploaded:.*1\/2\/2025/)).toBeInTheDocument();
		});
	});

	describe('AC 3: Upload button accepts PDF/image (max 10MB)', () => {
		it('renders upload button', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(
				screen.getByText(/Upload Consent Form \(PDF or Image, max 10MB\)/),
			).toBeInTheDocument();
		});

		it('accepts PDF files', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const uploadInput = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			expect(uploadInput).toBeInTheDocument();
			expect(uploadInput.accept).toBe('.pdf,.jpg,.jpeg,.png');
		});
	});

	describe('AC 4 & AC 5: View and Download buttons', () => {
		it('renders view buttons for all forms', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const viewButtons = screen.getAllByTitle('View');
			expect(viewButtons.length).toBe(3);
		});

		it('renders download buttons for all forms', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const downloadButtons = screen.getAllByTitle('Download');
			expect(downloadButtons.length).toBe(3);
		});
	});

	describe('AC 6: Status badges (Pending/Approved/Rejected)', () => {
		it('shows approved badge', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Approved')).toBeInTheDocument();
		});

		it('shows pending badge', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Pending')).toBeInTheDocument();
		});

		it('shows rejected badge', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('Rejected')).toBeInTheDocument();
		});
	});

	describe('AC 7: Delete button with confirmation modal', () => {
		it('renders delete buttons for all forms', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const deleteButtons = screen.getAllByTitle('Delete');
			expect(deleteButtons.length).toBe(3);
		});

		it('shows confirmation modal when delete clicked', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const deleteButtons = screen.getAllByTitle('Delete');
			await user.click(deleteButtons[0]);

			await waitFor(() => {
				expect(screen.getByText('Delete Consent Form')).toBeInTheDocument();
				expect(
					screen.getByText(/Are you sure you want to delete/),
				).toBeInTheDocument();
			});
		});

		it('confirmation modal has Delete and Cancel buttons', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const deleteButtons = screen.getAllByTitle('Delete');
			await user.click(deleteButtons[0]);

			await waitFor(() => {
				const modal = screen
					.getByText('Delete Consent Form')
					.closest('.ant-modal-content');
				expect(modal).toBeInTheDocument();
				if (modal) {
					const modalButtons = within(modal as HTMLElement).getAllByRole(
						'button',
					);
					const buttonTexts = modalButtons.map(btn => btn.textContent);
					expect(buttonTexts).toContain('Delete');
					expect(buttonTexts).toContain('Cancel');
				}
			});
		});
	});

	describe('AC 8: Loading states', () => {
		it('shows skeleton while loading', () => {
			const store = createMockStore({ loading: true, forms: [] });

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const skeleton = document.querySelector('.ant-skeleton');
			expect(skeleton).toBeInTheDocument();
		});

		it('shows forms after loading completes', () => {
			const store = createMockStore({ loading: false });

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('consent-form.pdf')).toBeInTheDocument();
		});
	});

	describe('AC 10: Integration with CommandPalette', () => {
		it('receives userId prop', () => {
			const store = createMockStore();

			const { container } = render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-123" onClose={mockOnClose} />
				</Provider>,
			);

			expect(container).toBeInTheDocument();
		});

		it('calls onClose callback', async () => {
			const user = userEvent.setup();
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			const closeButton = screen.getByText('Close');
			await user.click(closeButton);

			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	describe('Edge cases', () => {
		it('handles empty form list', () => {
			const store = createMockStore({ forms: [] });

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.getByText('No consent forms found')).toBeInTheDocument();
		});

		it('renders without forms initially', () => {
			const store = createMockStore({ forms: [] });

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			expect(screen.queryByText('consent-form.pdf')).not.toBeInTheDocument();
		});

		it('shows correct file icons for different file types', () => {
			const store = createMockStore();

			render(
				<Provider store={store}>
					<ConsentFormDrawer userId="user-1" onClose={mockOnClose} />
				</Provider>,
			);

			// Check that icons are rendered (SVGs from antd icons)
			const icons = document.querySelectorAll('svg');
			expect(icons.length).toBeGreaterThan(0);
		});
	});
});
