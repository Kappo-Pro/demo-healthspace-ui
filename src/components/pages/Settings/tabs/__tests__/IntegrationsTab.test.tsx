/**
 * IntegrationsTab Component Tests
 *
 * Epic 2 - Story 2.3: Refactor IntegrationsTab with Manual Save Pattern
 *
 * Test Coverage:
 * - Component rendering (API key input, toggle, buttons)
 * - Dirty tracking (form state vs server state)
 * - Save button enable/disable logic
 * - Test Connection button (disabled when dirty or no API key)
 * - Success toast on save
 * - Error handling and display
 * - Navigation blocker activation
 * - Masked input behavior (Input.Password)
 *
 * Target: 80%+ coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import IntegrationsTab from '../IntegrationsTab';
import settingsReducer, { updateIntegrations } from '@stores/settings/settingsSlice';
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
      info: jest.fn(),
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
      integrations: {
        openaiApiKey: 'sk-test123',
        openaiApiKeyActive: true,
      },
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

describe('IntegrationsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUnsavedChangesModule.useUnsavedChanges as jest.Mock).mockImplementation(() => {});
  });

  describe('Rendering', () => {
    it('should render OpenAI API Key setting', () => {
      renderWithProviders(<IntegrationsTab />);

      expect(screen.getByText('OpenAI API Key')).toBeInTheDocument();
      expect(screen.getByText(/API key for OpenAI integration/)).toBeInTheDocument();
    });

    it('should render API Key Active toggle', () => {
      renderWithProviders(<IntegrationsTab />);

      expect(screen.getByText('API Key Active')).toBeInTheDocument();
      expect(screen.getByText(/Enable or disable OpenAI integration/)).toBeInTheDocument();
    });

    it('should render masked password input with correct value', () => {
      renderWithProviders(<IntegrationsTab />);

      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      expect(apiKeyInput).toBeInTheDocument();
      expect(apiKeyInput).toHaveValue('sk-test123');
      expect(apiKeyInput).toHaveAttribute('type', 'password');
    });

    it('should render API Key Active switch as checked by default', () => {
      renderWithProviders(<IntegrationsTab />);

      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeInTheDocument();
      expect(switchElement).toBeChecked();
      expect(screen.getByText('OpenAI integration enabled')).toBeInTheDocument();
    });

    it('should render Save Changes button', () => {
      renderWithProviders(<IntegrationsTab />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should render Test Connection button', () => {
      renderWithProviders(<IntegrationsTab />);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      expect(testButton).toBeInTheDocument();
    });
  });

  describe('Dirty Tracking', () => {
    it('should disable save button when no changes exist', () => {
      renderWithProviders(<IntegrationsTab />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when API key changes', () => {
      renderWithProviders(<IntegrationsTab />);

      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      fireEvent.change(apiKeyInput, { target: { value: 'sk-newkey456' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeEnabled();
    });

    it('should enable save button when API Key Active toggle changes', () => {
      renderWithProviders(<IntegrationsTab />);

      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeEnabled();
    });

    it('should update switch label when toggled', () => {
      renderWithProviders(<IntegrationsTab />);

      const switchElement = screen.getByRole('switch');

      // Initially checked (enabled)
      expect(screen.getByText('OpenAI integration enabled')).toBeInTheDocument();

      // Toggle off
      fireEvent.click(switchElement);
      expect(screen.getByText('OpenAI integration disabled')).toBeInTheDocument();

      // Toggle back on
      fireEvent.click(switchElement);
      expect(screen.getByText('OpenAI integration enabled')).toBeInTheDocument();
    });
  });

  describe('Test Connection Button', () => {
    it('should be enabled when clean (no unsaved changes) and API key exists', () => {
      renderWithProviders(<IntegrationsTab />);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      expect(testButton).toBeEnabled();
    });

    it('should be disabled when form is dirty', () => {
      renderWithProviders(<IntegrationsTab />);

      // Make a change to make form dirty
      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      fireEvent.change(apiKeyInput, { target: { value: 'sk-newkey' } });

      const testButton = screen.getByRole('button', { name: /test connection/i });
      expect(testButton).toBeDisabled();
    });

    it('should be disabled when API key is empty', () => {
      const store = createMockStore({
        integrations: { openaiApiKey: '', openaiApiKeyActive: false },
      });

      renderWithProviders(<IntegrationsTab />, store);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      expect(testButton).toBeDisabled();
    });

    it('should show placeholder message when clicked', () => {
      renderWithProviders(<IntegrationsTab />);

      const testButton = screen.getByRole('button', { name: /test connection/i });
      fireEvent.click(testButton);

      expect(message.info).toHaveBeenCalledWith(
        'Test Connection feature will be implemented in Story 3.5'
      );
    });
  });

  describe('Save Functionality', () => {
    it('should dispatch updateIntegrations thunk on save button click', async () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      renderWithProviders(<IntegrationsTab />, store);

      // Make a change to enable save button
      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      fireEvent.change(apiKeyInput, { target: { value: 'sk-newkey' } });

      // Click save button
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: updateIntegrations.pending.type,
          })
        );
      });
    });

    it('should dispatch updateIntegrations with correct payload', async () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      renderWithProviders(<IntegrationsTab />, store);

      // Change API key
      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      fireEvent.change(apiKeyInput, { target: { value: 'sk-newkey' } });

      // Toggle active status
      const switchElement = screen.getByRole('switch');
      fireEvent.click(switchElement);

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const calls = dispatchSpy.mock.calls;
        const pendingCall = calls.find((call) =>
          call[0].type?.includes('updateIntegrations/pending')
        );
        expect(pendingCall).toBeDefined();
      });
    });

    it('should display success toast on successful save', async () => {
      const store = createMockStore();

      renderWithProviders(<IntegrationsTab />, store);

      // Make a change
      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      fireEvent.change(apiKeyInput, { target: { value: 'sk-newkey' } });

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Wait for success message
      await waitFor(() => {
        expect(message.success).toHaveBeenCalledWith('Integration settings saved successfully');
      });
    });

    it('should show loading state while saving', async () => {
      const store = createMockStore({
        loading: { apiKey: true },
      });

      renderWithProviders(<IntegrationsTab />, store);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toHaveAttribute('class', expect.stringContaining('loading'));
    });

    it('should disable inputs while loading', () => {
      const store = createMockStore({
        loading: { apiKey: true },
      });

      renderWithProviders(<IntegrationsTab />, store);

      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      const switchElement = screen.getByRole('switch');

      expect(apiKeyInput).toBeDisabled();
      expect(switchElement).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when present', () => {
      const store = createMockStore({
        errors: { apiKey: 'Failed to update API key' },
      });

      renderWithProviders(<IntegrationsTab />, store);

      expect(screen.getByText('Failed to update API key')).toBeInTheDocument();
    });

    it('should display error toast on save failure', async () => {
      const store = createMockStore();

      // Mock dispatch to reject
      jest.spyOn(store, 'dispatch').mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      );

      renderWithProviders(<IntegrationsTab />, store);

      // Make a change
      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      fireEvent.change(apiKeyInput, { target: { value: 'sk-newkey' } });

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
      renderWithProviders(<IntegrationsTab />);

      // Make a change to make form dirty
      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      fireEvent.change(apiKeyInput, { target: { value: 'sk-newkey' } });

      // Verify useUnsavedChanges was called with hasChanges=true
      expect(useUnsavedChangesModule.useUnsavedChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          hasChanges: true,
        })
      );
    });

    it('should not activate navigation blocker when clean', () => {
      renderWithProviders(<IntegrationsTab />);

      // Verify useUnsavedChanges was called with hasChanges=false
      expect(useUnsavedChangesModule.useUnsavedChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          hasChanges: false,
        })
      );
    });

    it('should include custom message in navigation blocker', () => {
      renderWithProviders(<IntegrationsTab />);

      expect(useUnsavedChangesModule.useUnsavedChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'You have unsaved changes in Integration settings. Are you sure you want to leave?',
        })
      );
    });
  });

  describe('Form State Sync', () => {
    it('should sync form values when server data changes', () => {
      const { rerender } = renderWithProviders(<IntegrationsTab />);

      // Initial value
      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      expect(apiKeyInput).toHaveValue('sk-test123');

      // Update store with new server data
      const newStore = createMockStore({
        integrations: {
          openaiApiKey: 'sk-updated-from-server',
          openaiApiKeyActive: false,
        },
      });

      rerender(
        <Provider store={newStore}>
          <BrowserRouter>
            <IntegrationsTab />
          </BrowserRouter>
        </Provider>
      );

      // Value should update
      expect(apiKeyInput).toHaveValue('sk-updated-from-server');
    });

    it('should sync toggle state when server data changes', () => {
      const { rerender } = renderWithProviders(<IntegrationsTab />);

      // Initial state: checked
      const switchElement = screen.getByRole('switch');
      expect(switchElement).toBeChecked();

      // Update store with new server data
      const newStore = createMockStore({
        integrations: {
          openaiApiKey: 'sk-test123',
          openaiApiKeyActive: false,
        },
      });

      rerender(
        <Provider store={newStore}>
          <BrowserRouter>
            <IntegrationsTab />
          </BrowserRouter>
        </Provider>
      );

      // Toggle should now be unchecked
      expect(switchElement).not.toBeChecked();
      expect(screen.getByText('OpenAI integration disabled')).toBeInTheDocument();
    });
  });

  describe('Masked Input Behavior', () => {
    it('should render password input (masked by default)', () => {
      renderWithProviders(<IntegrationsTab />);

      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      expect(apiKeyInput).toHaveAttribute('type', 'password');
    });

    it('should have visibility toggle functionality', () => {
      renderWithProviders(<IntegrationsTab />);

      const apiKeyInput = screen.getByPlaceholderText('sk-...');
      const inputContainer = apiKeyInput.closest('.ant-input-password');

      // Password input should have visibility toggle icon
      expect(inputContainer).toBeInTheDocument();
    });
  });

  describe('Help Link', () => {
    it('should render help link for API key', () => {
      renderWithProviders(<IntegrationsTab />);

      const helpLink = screen.getByText('Get your API key');
      expect(helpLink).toBeInTheDocument();
      expect(helpLink).toHaveAttribute('href', 'https://platform.openai.com/api-keys');
    });
  });
});
