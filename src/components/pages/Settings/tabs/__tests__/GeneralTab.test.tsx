/**
 * GeneralTab Component Tests
 *
 * Epic 2 - Story 2.2: Build GeneralTab with Unsaved Changes Detection
 *
 * Test Coverage:
 * - Component rendering with all 3 settings
 * - Dirty tracking (form state vs server state)
 * - Save button enable/disable logic
 * - Success toast on save
 * - Error handling and display
 * - Navigation blocker activation
 * - Self-registration sub-settings visibility
 *
 * Target: 80%+ coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import GeneralTab from '../GeneralTab';
import settingsReducer, { updateGeneralSettings } from '@stores/settings/settingsSlice';
import * as useUnsavedChangesModule from '../../hooks/useUnsavedChanges';

// Mock the useUnsavedChanges hook
jest.mock('../../hooks/useUnsavedChanges', () => ({
  useUnsavedChanges: jest.fn(),
}));

// Mock Ant Design message
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

// Helper to create mock store with initial state
const createMockStore = (overrides = {}) => {
  const initialState = {
    settings: {
      general: {
        clientId: 'test-client-id',
        inviteCode: 'test-invite-code',
        selfRegistration: {
          id: 'test-id',
          active: false,
          clientId: 'test-client-id',
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      },
      appearance: { theme: { name: 'default', customColors: {}, locked: false } },
      integrations: { openaiApiKey: '', openaiApiKeyActive: false },
      templates: { invite: '', bulkInvite: '', resultEmail: '', consentForm: '', rom: '' },
      plans: { defaultPlan: '', upgradePlan: '', availablePlans: [], savedUserPlans: null },
      content: { plans: [], functionalGoals: [], preExistingConditions: null },
      advanced: { bandwidth: { mode: 'high' as const, networkIssue: false }, tags: [] },
      autosaveQueue: { pending: [], maxQueueSize: 10, errors: [] },
      loading: {},
      errors: {},
      lastSaved: {},
      _migrated: false,
      ...overrides,
    },
  };

  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: initialState,
  });
};

// Wrapper component with providers
const renderWithProviders = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('GeneralTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUnsavedChangesModule.useUnsavedChanges as jest.Mock).mockImplementation(() => {});
  });

  describe('Rendering', () => {
    it('should render all 3 settings', () => {
      renderWithProviders(<GeneralTab />);

      // Check for all setting labels
      expect(screen.getByText('Client ID')).toBeInTheDocument();
      expect(screen.getByText('Invite Code')).toBeInTheDocument();
      expect(screen.getByText('Self-Registration')).toBeInTheDocument();
    });

    it('should render Client ID input with correct value', () => {
      renderWithProviders(<GeneralTab />);

      const clientIdInput = screen.getByPlaceholderText('Enter client ID');
      expect(clientIdInput).toBeInTheDocument();
      expect(clientIdInput).toHaveValue('test-client-id');
    });

    it('should render Invite Code input with correct value', () => {
      renderWithProviders(<GeneralTab />);

      const inviteCodeInput = screen.getByPlaceholderText('Enter invite code');
      expect(inviteCodeInput).toBeInTheDocument();
      expect(inviteCodeInput).toHaveValue('test-invite-code');
    });

    it('should render Self-Registration switch as disabled by default', () => {
      renderWithProviders(<GeneralTab />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).not.toBeChecked();
      expect(screen.getByText('Self-registration disabled')).toBeInTheDocument();
    });

    it('should render Save Changes button', () => {
      renderWithProviders(<GeneralTab />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe('Dirty Tracking', () => {
    it('should disable save button when no changes exist', () => {
      renderWithProviders(<GeneralTab />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when Client ID changes', () => {
      renderWithProviders(<GeneralTab />);

      const clientIdInput = screen.getByPlaceholderText('Enter client ID');
      fireEvent.change(clientIdInput, { target: { value: 'new-client-id' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeEnabled();
    });

    it('should enable save button when Invite Code changes', () => {
      renderWithProviders(<GeneralTab />);

      const inviteCodeInput = screen.getByPlaceholderText('Enter invite code');
      fireEvent.change(inviteCodeInput, { target: { value: 'new-invite-code' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeEnabled();
    });

    it('should enable save button when Self-Registration toggle changes', () => {
      renderWithProviders(<GeneralTab />);

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeEnabled();
    });
  });

  describe('Self-Registration Sub-Settings', () => {
    it('should not show sub-settings when self-registration is disabled', () => {
      renderWithProviders(<GeneralTab />);

      expect(screen.queryByText(/require admin approval/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/auto-assign new users/i)).not.toBeInTheDocument();
    });

    it('should show sub-settings when self-registration is enabled', () => {
      renderWithProviders(<GeneralTab />);

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      expect(screen.getByText(/require admin approval/i)).toBeInTheDocument();
      expect(screen.getByText(/auto-assign new users/i)).toBeInTheDocument();
    });

    it('should toggle "Require approval" checkbox', () => {
      renderWithProviders(<GeneralTab />);

      // Enable self-registration first
      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      // Find and click the approval checkbox
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Save Functionality', () => {
    it('should dispatch updateGeneralSettings thunk on save button click', async () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      renderWithProviders(<GeneralTab />, store);

      // Make a change to enable save button
      const inviteCodeInput = screen.getByPlaceholderText('Enter invite code');
      fireEvent.change(inviteCodeInput, { target: { value: 'new-code' } });

      // Click save button
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: updateGeneralSettings.pending.type,
          })
        );
      });
    });

    it('should display success toast on successful save', async () => {
      const store = createMockStore();

      renderWithProviders(<GeneralTab />, store);

      // Make a change
      const inviteCodeInput = screen.getByPlaceholderText('Enter invite code');
      fireEvent.change(inviteCodeInput, { target: { value: 'new-code' } });

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Wait for success message
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('General settings saved successfully');
      });
    });

    it('should show loading state while saving', async () => {
      const store = createMockStore({
        loading: { inviteCode: true, selfRegistration: true },
      });

      renderWithProviders(<GeneralTab />, store);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toHaveAttribute('class', expect.stringContaining('loading'));
    });
  });

  describe('Error Handling', () => {
    it('should display error message when present', () => {
      const store = createMockStore({
        errors: { inviteCode: 'Failed to update invite code' },
      });

      renderWithProviders(<GeneralTab />, store);

      expect(screen.getByText('Failed to update invite code')).toBeInTheDocument();
    });

    it('should display error toast on save failure', async () => {
      const store = createMockStore();

      // Mock dispatch to reject
      jest.spyOn(store, 'dispatch').mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      );

      renderWithProviders(<GeneralTab />, store);

      // Make a change
      const inviteCodeInput = screen.getByPlaceholderText('Enter invite code');
      fireEvent.change(inviteCodeInput, { target: { value: 'new-code' } });

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Wait for error message
      await waitFor(() => {
        expect(message.error).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation Blocker', () => {
    it('should activate navigation blocker when dirty', () => {
      renderWithProviders(<GeneralTab />);

      // Make a change to make form dirty
      const inviteCodeInput = screen.getByPlaceholderText('Enter invite code');
      fireEvent.change(inviteCodeInput, { target: { value: 'new-code' } });

      // Verify useUnsavedChanges was called with hasChanges=true
      expect(useUnsavedChangesModule.useUnsavedChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          hasChanges: true,
        })
      );
    });

    it('should not activate navigation blocker when clean', () => {
      renderWithProviders(<GeneralTab />);

      // Verify useUnsavedChanges was called with hasChanges=false
      expect(useUnsavedChangesModule.useUnsavedChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          hasChanges: false,
        })
      );
    });
  });

  describe('Form State Sync', () => {
    it('should sync form values when server data changes', () => {
      const { rerender } = renderWithProviders(<GeneralTab />);

      // Initial value
      const inviteCodeInput = screen.getByPlaceholderText('Enter invite code');
      expect(inviteCodeInput).toHaveValue('test-invite-code');

      // Update store with new server data
      const newStore = createMockStore({
        general: {
          clientId: 'test-client-id',
          inviteCode: 'updated-from-server',
          selfRegistration: {
            id: 'test-id',
            active: false,
            clientId: 'test-client-id',
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01',
          },
        },
      });

      rerender(
        <Provider store={newStore}>
          <BrowserRouter>
            <GeneralTab />
          </BrowserRouter>
        </Provider>
      );

      // Value should update
      expect(inviteCodeInput).toHaveValue('updated-from-server');
    });
  });
});
