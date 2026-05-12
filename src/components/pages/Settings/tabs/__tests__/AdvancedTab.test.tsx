/**
 * AdvancedTab Component Tests
 *
 * Epic 2 - Story 2.5: Create AdvancedTab for Super Admin Settings
 *
 * Test Coverage:
 * - Role-based access control (Super Admin vs Admin)
 * - Bandwidth settings rendering and validation
 * - Tags CRUD operations (Create, Read, Update, Delete)
 * - Confirmation modal before save
 * - Navigation blocker with unsaved changes
 * - 403 error handling (unauthorized access)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AdvancedTab } from '../AdvancedTab';
import settingsReducer from '@stores/settings/settingsSlice';
import userReducer from '@stores/shared/user';
import { USER_ROLES } from '@stores/constants';

// Mock useUnsavedChanges hook
jest.mock('../../hooks/useUnsavedChanges', () => ({
  useUnsavedChanges: jest.fn(),
}));

// Mock axios
jest.mock('axios', () => ({
  default: {
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
  },
  isAxiosError: jest.fn(() => false),
}));

/**
 * Mock tag interface for tests
 */
interface MockTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
}

/**
 * Helper function to create a mock store
 */
const createMockStore = (userRole: string, tags: MockTag[] = []) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
      user: userReducer,
    },
    preloadedState: {
      settings: {
        general: {
          clientId: '',
          inviteCode: '',
          selfRegistration: {
            id: '',
            active: false,
            clientId: '',
            createdAt: '',
            updatedAt: '',
          },
        },
        appearance: {
          theme: {
            name: 'default',
            customColors: {},
            locked: false,
          },
        },
        integrations: {
          openaiApiKey: '',
          openaiApiKeyActive: false,
        },
        templates: {
          invite: '',
          bulkInvite: '',
          resultEmail: '',
          consentForm: '',
          rom: '',
        },
        plans: {
          defaultPlan: '',
          upgradePlan: '',
          availablePlans: [],
          savedUserPlans: null,
        },
        content: {
          plans: [],
          functionalGoals: [],
          preExistingConditions: null,
        },
        advanced: {
          bandwidth: {
            mode: 'high',
            networkIssue: false,
          },
          tags,
        },
        autosaveQueue: {
          pending: [],
          maxQueueSize: 10,
          errors: [],
        },
        loading: {} as Record<string, boolean>,
        errors: {} as Record<string, string | null>,
        lastSaved: {} as Record<string, number | null>,
        _migrated: false,
      },
      user: {
        id: 'user-1',
        profile: {
          role: userRole,
          firstName: 'Test',
          lastName: 'User',
        },
        isPhysioterapist: userRole !== USER_ROLES.USER,
      } as unknown,
    } as unknown,
  });
};

/**
 * Helper function to render component with store
 */
const renderWithStore = (userRole: string, tags: MockTag[] = []) => {
  const store = createMockStore(userRole, tags);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <AdvancedTab />
      </BrowserRouter>
    </Provider>
  );
};

describe('AdvancedTab Component', () => {
  describe('Role-Based Access Control', () => {
    it('should render tab for Super Admin users', () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Should see settings, not unauthorized message
      expect(
        screen.getByText('Bandwidth Optimization')
      ).toBeInTheDocument();
      expect(screen.getByText('User Tags')).toBeInTheDocument();
      expect(screen.queryByText('Unauthorized')).not.toBeInTheDocument();
    });

    it('should show unauthorized message for Admin users', () => {
      renderWithStore(USER_ROLES.ADMIN);

      // Should see 403 unauthorized result
      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
      expect(
        screen.getByText('Super Admin access required for Advanced settings.')
      ).toBeInTheDocument();

      // Should not see settings
      expect(
        screen.queryByText('Bandwidth Optimization')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('User Tags')).not.toBeInTheDocument();
    });

    it('should show unauthorized message for regular User', () => {
      renderWithStore(USER_ROLES.USER);

      // Should see 403 unauthorized result
      expect(screen.getByText('Unauthorized')).toBeInTheDocument();
    });
  });

  describe('Bandwidth Settings', () => {
    it('should render bandwidth settings with Super Admin badge', () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Check for SettingCard label and badge
      expect(
        screen.getByText('Bandwidth Optimization')
      ).toBeInTheDocument();
      expect(screen.getByText('Super Admin')).toBeInTheDocument();

      // Check for toggle switch
      expect(
        screen.getByText('Bandwidth limits enabled')
      ).toBeInTheDocument();
    });

    it('should show/hide upload and processing inputs based on toggle', () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Initially enabled (mode: 'high'), so inputs should be visible
      expect(
        screen.getByLabelText('Max upload size (MB):')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Max processing size (MB):')
      ).toBeInTheDocument();

      // Toggle off
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      // Inputs should be hidden
      expect(
        screen.queryByLabelText('Max upload size (MB):')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Max processing size (MB):')
      ).not.toBeInTheDocument();
    });

    it('should validate max upload < max processing', async () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Get input fields
      const uploadInput = screen.getByLabelText('Max upload size (MB):');
      const processingInput = screen.getByLabelText(
        'Max processing size (MB):'
      );

      // Set upload > processing (invalid)
      fireEvent.change(uploadInput, { target: { value: '600' } });
      fireEvent.change(processingInput, { target: { value: '500' } });

      // Save button should be disabled due to validation error
      const saveButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      expect(saveButton).toBeDisabled();

      // Should show validation error
      await waitFor(() => {
        expect(
          screen.getByText(
            'Max upload size must be less than max processing size'
          )
        ).toBeInTheDocument();
      });
    });

    it('should pass validation when max upload < max processing', () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Get input fields
      const uploadInput = screen.getByLabelText('Max upload size (MB):');
      const processingInput = screen.getByLabelText(
        'Max processing size (MB):'
      );

      // Set upload < processing (valid)
      fireEvent.change(uploadInput, { target: { value: '100' } });
      fireEvent.change(processingInput, { target: { value: '500' } });

      // Save button should be enabled (isDirty will be true)
      const saveButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Tags Management', () => {
    const mockTags: MockTag[] = [
      {
        id: 'tag-1',
        name: 'VIP',
        color: '#ff0000',
        description: 'VIP patients',
        createdAt: new Date('2025-01-01'),
      },
      {
        id: 'tag-2',
        name: 'Priority',
        color: '#00ff00',
        createdAt: new Date('2025-01-02'),
      },
    ];

    it('should render existing tags', () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN, mockTags);

      // Check that tags are rendered
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('should open add tag modal when Add Tag button clicked', async () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Click "Add Tag" button
      const addButton = screen.getByRole('button', { name: /add tag/i });
      fireEvent.click(addButton);

      // Modal should be open
      await waitFor(() => {
        expect(screen.getByText('Add Tag')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter tag name')).toBeInTheDocument();
      });
    });

    it('should add a new tag', async () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Click "Add Tag" button
      const addButton = screen.getByRole('button', { name: /add tag/i });
      fireEvent.click(addButton);

      // Fill in tag form
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Enter tag name');
        fireEvent.change(nameInput, { target: { value: 'New Tag' } });
      });

      // Click "Add" in modal
      const modalAddButton = screen.getByRole('button', { name: /^add$/i });
      fireEvent.click(modalAddButton);

      // New tag should appear in the list
      await waitFor(() => {
        expect(screen.getByText('New Tag')).toBeInTheDocument();
      });
    });

    it('should open edit modal when edit icon clicked', async () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN, mockTags);

      // Find and click edit icon for first tag
      const editIcons = screen.getAllByLabelText('edit');
      fireEvent.click(editIcons[0]);

      // Modal should open with existing values
      await waitFor(() => {
        expect(screen.getByText('Edit Tag')).toBeInTheDocument();
        const nameInput = screen.getByPlaceholderText(
          'Enter tag name'
        ) as HTMLInputElement;
        expect(nameInput.value).toBe('VIP');
      });
    });

    it('should delete tag when delete icon clicked and confirmed', async () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN, mockTags);

      // Find and click delete icon for first tag
      const deleteIcons = screen.getAllByLabelText('delete');
      fireEvent.click(deleteIcons[0]);

      // Confirmation modal should appear
      await waitFor(() => {
        expect(screen.getByText('Delete Tag')).toBeInTheDocument();
        expect(
          screen.getByText('Are you sure you want to delete this tag?')
        ).toBeInTheDocument();
      });

      // Click "Delete" in confirmation modal
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmButton);

      // Tag should be removed
      await waitFor(() => {
        expect(screen.queryByText('VIP')).not.toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should show confirmation modal before save', async () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Make a change to enable save button
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      // Click save button
      const saveButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      fireEvent.click(saveButton);

      // Confirmation modal should appear
      await waitFor(() => {
        expect(screen.getByText('Confirm Changes')).toBeInTheDocument();
        expect(
          screen.getByText(
            'These changes affect all users and video processing. Continue?'
          )
        ).toBeInTheDocument();
      });
    });

    it('should disable save button when no changes', () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Save button should be disabled (no changes made)
      const saveButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when changes made', () => {
      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Make a change
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      // Save button should be enabled
      const saveButton = screen.getByRole('button', {
        name: /save changes/i,
      });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Navigation Blocker', () => {
    it('should activate navigation blocker when changes made', () => {
      const useUnsavedChangesMock = jest.requireMock('../../hooks/useUnsavedChanges')
        .useUnsavedChanges;

      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // Make a change
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);

      // useUnsavedChanges should be called with hasChanges=true
      expect(useUnsavedChangesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasChanges: true,
        })
      );
    });

    it('should not activate navigation blocker when no changes', () => {
      const useUnsavedChangesMock = jest.requireMock('../../hooks/useUnsavedChanges')
        .useUnsavedChanges;

      renderWithStore(USER_ROLES.SUPER_ADMIN);

      // useUnsavedChanges should be called with hasChanges=false
      expect(useUnsavedChangesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          hasChanges: false,
        })
      );
    });
  });
});
