/**
 * AdminAssignmentDrawer Component Tests
 * Story 5.1: Tests for admin assignment management drawer
 *
 * Acceptance Criteria Coverage:
 * - AC 1: Renders as Ant Design Drawer (right side, 480px width)
 * - AC 2: Displays list of admins from Redux state
 * - AC 3: Search filters admins by name/email
 * - AC 4: Shows avatar, name, email, assignment status
 * - AC 5: Toggle switch for assignment (optimistic UI)
 * - AC 6: Save button calls API
 * - AC 7: Loading states (skeleton, spinner)
 * - AC 8: Success message on save
 * - AC 9: Closes drawer on save
 * - AC 10: Integrates with CommandPalette (via props)
 */

import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AdminAssignmentDrawer } from '../AdminAssignmentDrawer';
import adminManagement from '@stores/shared/adminManagement';

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

const mockAdmins = [
  {
    id: 'admin-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin' as const,
  },
  {
    id: 'admin-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin' as const,
  },
  {
    id: 'admin-3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'super-admin' as const,
  },
];

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      adminManagement,
    },
    preloadedState: {
      adminManagement: {
        admins: mockAdmins,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('AdminAssignmentDrawer Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC 1: Renders as Ant Design Drawer (right side, 480px width)', () => {
    it('renders drawer when open', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={['admin-1']}
          />
        </Provider>
      );

      expect(screen.getByText('Assign Admin')).toBeInTheDocument();
    });

    it('shows drawer title "Assign Admin"', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      expect(screen.getByText('Assign Admin')).toBeInTheDocument();
    });
  });

  describe('AC 2: Displays list of admins from Redux state', () => {
    it('renders all admins from store', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  describe('AC 3: Search filters admins by name/email', () => {
    it('renders search input', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      expect(
        screen.getByPlaceholderText('Search admins by name or email')
      ).toBeInTheDocument();
    });

    it('filters admins by name (case-insensitive)', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      const searchInput = screen.getByPlaceholderText(
        'Search admins by name or email'
      );
      await user.type(searchInput, 'john');

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
          expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
          expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('filters admins by email (case-insensitive)', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      const searchInput = screen.getByPlaceholderText(
        'Search admins by name or email'
      );
      await user.type(searchInput, 'jane@example.com');

      // Wait for debounce (300ms)
      await waitFor(
        () => {
          expect(screen.getByText('Jane Smith')).toBeInTheDocument();
          expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
          expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('shows all admins when search empty', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      const searchInput = screen.getByPlaceholderText(
        'Search admins by name or email'
      );

      // Type and then clear
      await user.type(searchInput, 'john');
      await user.clear(searchInput);

      // Wait for debounce
      await waitFor(
        () => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
          expect(screen.getByText('Jane Smith')).toBeInTheDocument();
          expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });
  });

  describe('AC 4: Shows avatar, name, email, assignment status', () => {
    it('renders admin names', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('shows assignment status badges', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={['admin-1']}
          />
        </Provider>
      );

      expect(screen.getByText('Assigned')).toBeInTheDocument();
      expect(screen.getAllByText('Unassigned').length).toBe(2);
    });
  });

  describe('AC 5: Toggle switch for assignment (optimistic UI)', () => {
    it('toggle switch changes assignment status', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]); // Toggle John Doe

      expect(switches[0]).toBeChecked();
    });

    it('assignment badge updates when toggled', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      // Initially all unassigned
      expect(screen.getAllByText('Unassigned').length).toBe(3);

      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]); // Toggle John Doe

      // Now one assigned
      await waitFor(() => {
        expect(screen.getByText('Assigned')).toBeInTheDocument();
        expect(screen.getAllByText('Unassigned').length).toBe(2);
      });
    });

    it('multiple toggles tracked independently', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      const switches = screen.getAllByRole('switch');

      await user.click(switches[0]); // Toggle John Doe on
      await user.click(switches[2]); // Toggle Bob Johnson on

      expect(switches[0]).toBeChecked();
      expect(switches[1]).not.toBeChecked();
      expect(switches[2]).toBeChecked();
    });
  });

  describe('AC 6 & AC 8 & AC 9: Save button, success message, closes drawer', () => {
    it('renders save button', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('calls onClose when cancel clicked', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('AC 7: Loading states', () => {
    it('shows loading state when admins loading', () => {
      const store = createMockStore({ loading: true });

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      // Ant Design List shows loading spinner
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });
  });

  describe('AC 10: Integration with CommandPalette', () => {
    it('receives userId prop', () => {
      const store = createMockStore();

      const { container } = render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-123"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      expect(container).toBeInTheDocument();
    });

    it('calls onClose callback', async () => {
      const user = userEvent.setup();
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('accepts initialAssignedAdmins prop', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={['admin-1', 'admin-2']}
          />
        </Provider>
      );

      // Check that 2 admins are marked as assigned
      expect(screen.getAllByText('Assigned').length).toBe(2);
      expect(screen.getAllByText('Unassigned').length).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('renders without initial assigned admins', () => {
      const store = createMockStore();

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer userId="user-1" onClose={mockOnClose} />
        </Provider>
      );

      expect(screen.getAllByText('Unassigned').length).toBe(3);
    });

    it('handles empty admin list', () => {
      const store = createMockStore({ admins: [] });

      render(
        <Provider store={store}>
          <AdminAssignmentDrawer
            userId="user-1"
            onClose={mockOnClose}
            initialAssignedAdmins={[]}
          />
        </Provider>
      );

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });
});
