/**
 * ContentLibraryTab Component Tests
 *
 * Epic 3 - Story 3.3: Refactor ContentLibraryTab with Nested Tabs
 *
 * Test Coverage:
 * - Nested tabs render correctly
 * - Tab switching works
 * - Plans CRUD operations
 * - Functional Goals CRUD operations
 * - Pre-existing Conditions CRUD operations
 * - Unsaved changes detection per sub-tab
 * - Save functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer, { updateContentLibrary } from '@stores/settings/settingsSlice';
import { ContentLibraryTab } from '../ContentLibraryTab';
import type { SettingsState } from '@stores/settings/settingsSlice';

// Mock axios
jest.mock('axios');

// Helper to create test store
const createTestStore = (initialState?: Partial<SettingsState>) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
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
          bandwidth: { mode: 'high', networkIssue: false },
          tags: [],
        },
        autosaveQueue: {
          pending: [],
          maxQueueSize: 10,
          errors: [],
        },
        loading: {
          apiKey: false,
          theme: false,
          inviteCode: false,
          selfRegistration: false,
          'templates.invite': false,
          'templates.bulkInvite': false,
          'templates.resultEmail': false,
          'templates.consentForm': false,
          'templates.rom': false,
          'plans.default': false,
          'plans.upgrade': false,
          bandwidth: false,
          tags: false,
        },
        errors: {
          apiKey: null,
          theme: null,
          inviteCode: null,
          selfRegistration: null,
          'templates.invite': null,
          'templates.bulkInvite': null,
          'templates.resultEmail': null,
          'templates.consentForm': null,
          'templates.rom': null,
          'plans.default': null,
          'plans.upgrade': null,
          bandwidth: null,
          tags: null,
        },
        lastSaved: {
          apiKey: null,
          theme: null,
          inviteCode: null,
          selfRegistration: null,
          'templates.invite': null,
          'templates.bulkInvite': null,
          'templates.resultEmail': null,
          'templates.consentForm': null,
          'templates.rom': null,
          'plans.default': null,
          'plans.upgrade': null,
          bandwidth: null,
          tags: null,
        },
        dirtyTabs: {
          general: false,
          integrations: false,
          advanced: false,
        },
        _bandwidthRollback: null,
        _contentLibraryLoading: false,
        _contentLibraryError: null,
        _migrated: false,
        ...initialState,
      },
    },
  });
};

// Helper to render component with providers
const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{component}</BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe('ContentLibraryTab', () => {
  describe('Nested Tabs Structure', () => {
    it('should render all three sub-tabs', () => {
      renderWithProviders(<ContentLibraryTab />);

      // Check tab headers exist
      expect(screen.getByText('Plans')).toBeInTheDocument();
      expect(screen.getByText('Functional Goals')).toBeInTheDocument();
      expect(screen.getByText('Pre-existing Conditions')).toBeInTheDocument();
    });

    it('should show Plans tab by default', () => {
      renderWithProviders(<ContentLibraryTab />);

      // Plans content should be visible
      expect(screen.getByText('Service Plans')).toBeInTheDocument();
      expect(screen.getByText('Create Plan')).toBeInTheDocument();
    });

    it('should switch to Functional Goals tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Click Functional Goals tab
      await user.click(screen.getByText('Functional Goals'));

      // Functional Goals content should be visible
      expect(screen.getByText(/Manage rehabilitation and functional goals/)).toBeInTheDocument();
      expect(screen.getByText('Add Goal')).toBeInTheDocument();
    });

    it('should switch to Pre-existing Conditions tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Click Pre-existing Conditions tab
      await user.click(screen.getByText('Pre-existing Conditions'));

      // Conditions content should be visible
      expect(screen.getByText(/Manage the library of pre-existing medical conditions/)).toBeInTheDocument();
      expect(screen.getByText('Add Condition')).toBeInTheDocument();
    });
  });

  describe('Plans Sub-Tab CRUD Operations', () => {
    it('should open create plan modal when Create Plan button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Click Create Plan button
      await user.click(screen.getByText('Create Plan'));

      // Modal should be visible
      await waitFor(() => {
        expect(screen.getByText('Create Plan')).toBeInTheDocument();
        expect(screen.getByLabelText('Plan Name')).toBeInTheDocument();
      });
    });

    it('should create a new plan when form is submitted', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Open create modal
      await user.click(screen.getByText('Create Plan'));

      // Fill out form
      await user.type(screen.getByLabelText('Plan Name'), 'Basic Plan');
      await user.type(screen.getByLabelText('Price'), '29.99');

      // Submit form
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Success message should appear
      await waitFor(() => {
        expect(screen.getByText(/plan created \(unsaved\)/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields on plan creation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Open create modal
      await user.click(screen.getByText('Create Plan'));

      // Try to submit without filling required fields
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Validation errors should appear
      await waitFor(() => {
        expect(screen.getByText('Please enter a plan name')).toBeInTheDocument();
      });
    });
  });

  describe('Functional Goals Sub-Tab CRUD Operations', () => {
    it('should open create goal modal when Add Goal button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Switch to Functional Goals tab
      await user.click(screen.getByText('Functional Goals'));

      // Click Add Goal button
      await user.click(screen.getByText('Add Goal'));

      // Modal should be visible
      await waitFor(() => {
        expect(screen.getByText('Create Functional Goal')).toBeInTheDocument();
        expect(screen.getByLabelText('Goal Title')).toBeInTheDocument();
      });
    });

    it('should create a new goal when form is submitted', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Switch to Functional Goals tab
      await user.click(screen.getByText('Functional Goals'));

      // Open create modal
      await user.click(screen.getByText('Add Goal'));

      // Fill out form
      await user.type(screen.getByLabelText('Goal Title'), 'Improve mobility');

      // Submit form
      const createButton = screen.getByRole('button', { name: /^create$/i });
      await user.click(createButton);

      // Success message should appear
      await waitFor(() => {
        expect(screen.getByText(/goal created \(unsaved\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pre-existing Conditions Sub-Tab CRUD Operations', () => {
    it('should open create condition modal when Add Condition button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Switch to Pre-existing Conditions tab
      await user.click(screen.getByText('Pre-existing Conditions'));

      // Click Add Condition button
      await user.click(screen.getByText('Add Condition'));

      // Modal should be visible
      await waitFor(() => {
        expect(screen.getByText('Create Pre-existing Condition')).toBeInTheDocument();
        expect(screen.getByLabelText('Condition Name')).toBeInTheDocument();
      });
    });

    it('should create a new condition when form is submitted', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Switch to Pre-existing Conditions tab
      await user.click(screen.getByText('Pre-existing Conditions'));

      // Open create modal
      await user.click(screen.getByText('Add Condition'));

      // Fill out form
      await user.type(screen.getByLabelText('Condition Name'), 'Osteoarthritis');

      // Submit form
      const createButton = screen.getByRole('button', { name: /^create$/i });
      await user.click(createButton);

      // Success message should appear
      await waitFor(() => {
        expect(screen.getByText(/condition created \(unsaved\)/i)).toBeInTheDocument();
      });
    });

    it('should validate ICD-10 code format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Switch to Pre-existing Conditions tab
      await user.click(screen.getByText('Pre-existing Conditions'));

      // Open create modal
      await user.click(screen.getByText('Add Condition'));

      // Fill out form with invalid ICD-10 code
      await user.type(screen.getByLabelText('Condition Name'), 'Test Condition');
      await user.type(screen.getByLabelText('ICD-10 Code'), 'invalid');

      // Submit form
      const createButton = screen.getByRole('button', { name: /^create$/i });
      await user.click(createButton);

      // Validation error should appear
      await waitFor(() => {
        expect(screen.getByText(/invalid icd-10 format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should enable Save Changes button when data is modified in Plans tab', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContentLibraryTab />);

      // Save Changes button should be disabled initially
      const saveButton = screen.getByRole('button', { name: 'Save Changes' });
      expect(saveButton).toBeDisabled();

      // Create a new plan
      await user.click(screen.getByText('Create Plan'));
      await user.type(screen.getByLabelText('Plan Name'), 'Test Plan');
      await user.type(screen.getByLabelText('Price'), '10');
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByText('Create Plan')).not.toBeInTheDocument();
      });

      // Save Changes button should be enabled
      await waitFor(() => {
        expect(saveButton).toBeEnabled();
      });
    });

    it('should keep Save Changes button disabled when no changes are made', () => {
      renderWithProviders(<ContentLibraryTab />);

      // Save Changes button should be disabled
      const saveButton = screen.getByRole('button', { name: 'Save Changes' });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Integration: Redux State Updates', () => {
    it('should update Redux state when Save Changes is clicked', async () => {
      const user = userEvent.setup();
      const { store } = renderWithProviders(<ContentLibraryTab />);

      // Mock dispatch to track calls
      const originalDispatch = store.dispatch;
      const dispatchSpy = jest.fn(originalDispatch);
      store.dispatch = dispatchSpy;

      // Create a new plan
      await user.click(screen.getByText('Create Plan'));
      await user.type(screen.getByLabelText('Plan Name'), 'Premium Plan');
      await user.type(screen.getByLabelText('Price'), '99.99');
      await user.click(screen.getByRole('button', { name: /create/i }));

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Click Save Changes
      const saveButton = screen.getByRole('button', { name: 'Save Changes' });
      await user.click(saveButton);

      // Verify updateContentLibrary action was dispatched
      await waitFor(() => {
        const actions = dispatchSpy.mock.calls.map(call => call[0]);
        const updateAction = actions.find(
          action => action.type === updateContentLibrary.pending.type
        );
        expect(updateAction).toBeDefined();
      });
    });
  });
});
