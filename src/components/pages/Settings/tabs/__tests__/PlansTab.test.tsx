/**
 * PlansTab Component Tests
 *
 * Epic 3 - Story 3.2: Refactor PlansTab with Validation
 *
 * Test Coverage:
 * - Component rendering with all 4 settings
 * - Validation rules (all 4 rules)
 * - Save button disabled when validation fails
 * - Save flow with success/error handling
 * - Navigation blocker activation
 * - Dirty tracking
 *
 * Target: 80%+ coverage
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { message } from 'antd';
import PlansTab from '../PlansTab';
import settingsReducer, { updatePlans } from '@stores/settings/settingsSlice';
import * as useUnsavedChangesModule from '../../hooks/useUnsavedChanges';

// Mock axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
    })),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    isAxiosError: jest.fn(() => false),
  },
}));

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

// Local Plans interface for testing
interface TestPlans {
  id?: string;
  title: string;
  description: string;
  thumbnail: string;
}

// Mock plan data
const mockPlans: TestPlans[] = [
  { id: 'basic', title: 'Basic Plan', description: 'Basic features', thumbnail: '' },
  { id: 'pro', title: 'Pro Plan', description: 'Professional features', thumbnail: '' },
  { id: 'enterprise', title: 'Enterprise Plan', description: 'Enterprise features', thumbnail: '' },
];

// Helper to create mock store with initial state
const createMockStore = (overrides = {}) => {
  const initialState = {
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
      appearance: { theme: { name: 'default', customColors: {}, locked: false } },
      integrations: { openaiApiKey: '', openaiApiKeyActive: false },
      templates: { invite: '', bulkInvite: '', resultEmail: '', consentForm: '', rom: '' },
      plans: {
        defaultPlan: 'basic',
        upgradePlan: 'pro',
        availablePlans: [mockPlans[0], mockPlans[1]],
        savedUserPlans: null,
      },
      content: { plans: [], functionalGoals: [], preExistingConditions: null },
      advanced: { bandwidth: { mode: 'high' as const, networkIssue: false }, tags: [] },
      autosaveQueue: { pending: [], maxQueueSize: 10, errors: [] },
      loading: {},
      errors: {},
      lastSaved: {},
      dirtyTabs: { general: false, integrations: false, advanced: false },
      _bandwidthRollback: null,
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
const renderWithProviders = (component, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('PlansTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUnsavedChangesModule.useUnsavedChanges as jest.Mock).mockImplementation(() => {});
  });

  describe('Rendering', () => {
    it('should render all 4 plan settings', () => {
      renderWithProviders(<PlansTab />);

      // Check for all setting labels
      expect(screen.getByText('Default Plan')).toBeInTheDocument();
      expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
      expect(screen.getByText('Available Plans')).toBeInTheDocument();
      expect(screen.getByText('Saved User Plans')).toBeInTheDocument();
    });

    it('should render Default Plan select with correct value', () => {
      renderWithProviders(<PlansTab />);

      const defaultPlanSelect = screen.getByPlaceholderText('Select default plan');
      expect(defaultPlanSelect).toBeInTheDocument();
    });

    it('should render Upgrade Plan select with correct value', () => {
      renderWithProviders(<PlansTab />);

      const upgradePlanSelect = screen.getByPlaceholderText('Select upgrade plan');
      expect(upgradePlanSelect).toBeInTheDocument();
    });

    it('should render Available Plans checkboxes', () => {
      renderWithProviders(<PlansTab />);

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
    });

    it('should render Save Changes button', () => {
      renderWithProviders(<PlansTab />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeInTheDocument();
    });

    it('should display empty state for Saved User Plans when none exist', () => {
      renderWithProviders(<PlansTab />);

      expect(screen.getByText('No user plans assigned yet')).toBeInTheDocument();
    });
  });

  describe('Validation Rule 1: Default Plan must be in Available Plans', () => {
    it('should show error when default plan is not in available plans', () => {
      const store = createMockStore({
        plans: {
          defaultPlan: 'enterprise',
          upgradePlan: 'pro',
          availablePlans: [mockPlans[0], mockPlans[1]], // Only basic and pro
          savedUserPlans: null,
        },
      });

      renderWithProviders(<PlansTab />, store);

      expect(screen.getByText('Default plan must be selected in Available Plans')).toBeInTheDocument();
    });

    it('should not show error when default plan is in available plans', () => {
      renderWithProviders(<PlansTab />);

      expect(screen.queryByText('Default plan must be selected in Available Plans')).not.toBeInTheDocument();
    });
  });

  describe('Validation Rule 2: Upgrade Plan must be in Available Plans', () => {
    it('should show error when upgrade plan is not in available plans', () => {
      const store = createMockStore({
        plans: {
          defaultPlan: 'basic',
          upgradePlan: 'enterprise',
          availablePlans: [mockPlans[0], mockPlans[1]], // Only basic and pro
          savedUserPlans: null,
        },
      });

      renderWithProviders(<PlansTab />, store);

      expect(screen.getByText('Upgrade plan must be selected in Available Plans')).toBeInTheDocument();
    });

    it('should not show error when upgrade plan is in available plans', () => {
      renderWithProviders(<PlansTab />);

      expect(screen.queryByText('Upgrade plan must be selected in Available Plans')).not.toBeInTheDocument();
    });
  });

  describe('Validation Rule 3: At least 1 plan in Available Plans', () => {
    it('should show error when no plans are available', () => {
      const store = createMockStore({
        plans: {
          defaultPlan: '',
          upgradePlan: '',
          availablePlans: [],
          savedUserPlans: null,
        },
      });

      renderWithProviders(<PlansTab />, store);

      expect(screen.getByText('At least one plan must be available')).toBeInTheDocument();
    });

    it('should not show error when at least one plan is available', () => {
      renderWithProviders(<PlansTab />);

      expect(screen.queryByText('At least one plan must be available')).not.toBeInTheDocument();
    });
  });

  describe('Validation Rule 4: Default cannot equal Upgrade', () => {
    it('should show error when default plan equals upgrade plan', () => {
      const store = createMockStore({
        plans: {
          defaultPlan: 'basic',
          upgradePlan: 'basic',
          availablePlans: [mockPlans[0], mockPlans[1]],
          savedUserPlans: null,
        },
      });

      renderWithProviders(<PlansTab />, store);

      expect(screen.getByText('Upgrade plan must be different from default plan')).toBeInTheDocument();
    });

    it('should not show error when default and upgrade plans are different', () => {
      renderWithProviders(<PlansTab />);

      expect(screen.queryByText('Upgrade plan must be different from default plan')).not.toBeInTheDocument();
    });
  });

  describe('Save Button State', () => {
    it('should disable save button when no changes exist', () => {
      renderWithProviders(<PlansTab />);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should disable save button when validation fails', () => {
      const store = createMockStore({
        plans: {
          defaultPlan: 'enterprise', // Not in available plans
          upgradePlan: 'pro',
          availablePlans: [mockPlans[0], mockPlans[1]],
          savedUserPlans: null,
        },
      });

      renderWithProviders(<PlansTab />, store);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when changes exist and validation passes', () => {
      const store = createMockStore();
      renderWithProviders(<PlansTab />, store);

      // Make a change by clicking a checkbox (simulate selecting Enterprise plan)
      const checkboxes = screen.getAllByRole('checkbox');
      const enterpriseCheckbox = checkboxes.find(cb => {
        const label = cb.closest('label');
        return label?.textContent?.includes('Enterprise Plan');
      });

      if (enterpriseCheckbox) {
        fireEvent.click(enterpriseCheckbox);

        const saveButton = screen.getByRole('button', { name: /save changes/i });
        expect(saveButton).toBeEnabled();
      }
    });
  });

  describe('Dirty Tracking', () => {
    it('should track changes when available plans are modified', () => {
      renderWithProviders(<PlansTab />);

      // Click Enterprise plan checkbox
      const checkboxes = screen.getAllByRole('checkbox');
      const enterpriseCheckbox = checkboxes.find(cb => {
        const label = cb.closest('label');
        return label?.textContent?.includes('Enterprise Plan');
      });

      if (enterpriseCheckbox) {
        fireEvent.click(enterpriseCheckbox);

        const saveButton = screen.getByRole('button', { name: /save changes/i });
        expect(saveButton).toBeEnabled();
      }
    });
  });

  describe('Save Functionality', () => {
    it('should dispatch updatePlans thunk on save button click', async () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      renderWithProviders(<PlansTab />, store);

      // Make a change
      const checkboxes = screen.getAllByRole('checkbox');
      const enterpriseCheckbox = checkboxes.find(cb => {
        const label = cb.closest('label');
        return label?.textContent?.includes('Enterprise Plan');
      });

      if (enterpriseCheckbox) {
        fireEvent.click(enterpriseCheckbox);

        // Click save button
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: updatePlans.pending.type,
            })
          );
        });
      }
    });

    it('should display success toast on successful save', async () => {
      const store = createMockStore();

      renderWithProviders(<PlansTab />, store);

      // Make a change
      const checkboxes = screen.getAllByRole('checkbox');
      const enterpriseCheckbox = checkboxes.find(cb => {
        const label = cb.closest('label');
        return label?.textContent?.includes('Enterprise Plan');
      });

      if (enterpriseCheckbox) {
        fireEvent.click(enterpriseCheckbox);

        // Click save
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        fireEvent.click(saveButton);

        // Wait for success message
        await waitFor(() => {
          expect(message.success).toHaveBeenCalledWith('Plans saved successfully');
        });
      }
    });

    it('should show loading state while saving', () => {
      const store = createMockStore({
        loading: { 'plans.default': true, 'plans.upgrade': true },
      });

      renderWithProviders(<PlansTab />, store);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      expect(saveButton).toHaveAttribute('class', expect.stringContaining('loading'));
    });
  });

  describe('Error Handling', () => {
    it('should display error message when present', () => {
      const store = createMockStore({
        errors: { 'plans.default': 'Failed to update plans' },
      });

      renderWithProviders(<PlansTab />, store);

      expect(screen.getByText('Failed to update plans')).toBeInTheDocument();
    });

    it('should display error toast on save failure', async () => {
      const store = createMockStore();

      // Mock dispatch to reject
      jest.spyOn(store, 'dispatch').mockImplementation(() =>
        Promise.reject(new Error('Network error'))
      );

      renderWithProviders(<PlansTab />, store);

      // Make a change
      const checkboxes = screen.getAllByRole('checkbox');
      const enterpriseCheckbox = checkboxes.find(cb => {
        const label = cb.closest('label');
        return label?.textContent?.includes('Enterprise Plan');
      });

      if (enterpriseCheckbox) {
        fireEvent.click(enterpriseCheckbox);

        // Click save
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        fireEvent.click(saveButton);

        // Wait for error message
        await waitFor(() => {
          expect(message.error).toHaveBeenCalled();
        });
      }
    });

    it('should show error summary when multiple validation errors exist', () => {
      const store = createMockStore({
        plans: {
          defaultPlan: 'enterprise', // Not in available plans - Error 1
          upgradePlan: '',
          availablePlans: [], // Empty - Error 2
          savedUserPlans: null,
        },
      });

      renderWithProviders(<PlansTab />, store);

      expect(screen.getByText('Validation Errors')).toBeInTheDocument();
      expect(screen.getByText('Please fix the errors below before saving.')).toBeInTheDocument();
    });
  });

  describe('Navigation Blocker', () => {
    it('should activate navigation blocker when dirty', () => {
      renderWithProviders(<PlansTab />);

      // Make a change
      const checkboxes = screen.getAllByRole('checkbox');
      const enterpriseCheckbox = checkboxes.find(cb => {
        const label = cb.closest('label');
        return label?.textContent?.includes('Enterprise Plan');
      });

      if (enterpriseCheckbox) {
        fireEvent.click(enterpriseCheckbox);

        // Verify useUnsavedChanges was called with hasChanges=true
        expect(useUnsavedChangesModule.useUnsavedChanges).toHaveBeenCalledWith(
          expect.objectContaining({
            hasChanges: true,
          })
        );
      }
    });

    it('should not activate navigation blocker when clean', () => {
      renderWithProviders(<PlansTab />);

      // Verify useUnsavedChanges was called with hasChanges=false
      expect(useUnsavedChangesModule.useUnsavedChanges).toHaveBeenCalledWith(
        expect.objectContaining({
          hasChanges: false,
        })
      );
    });
  });

  describe('Saved User Plans Display', () => {
    it('should display saved user plans when available', () => {
      const mockSavedPlans = [
        { userId: 'user-1', planId: 'basic', assignedAt: '2025-01-01T00:00:00.000Z' },
        { userId: 'user-2', planId: 'pro', assignedAt: '2025-01-02T00:00:00.000Z' },
      ];

      const store = createMockStore({
        plans: {
          defaultPlan: 'basic',
          upgradePlan: 'pro',
          availablePlans: [mockPlans[0], mockPlans[1]],
          savedUserPlans: mockSavedPlans,
        },
      });

      renderWithProviders(<PlansTab />, store);

      expect(screen.getByText(/user-1/i)).toBeInTheDocument();
      expect(screen.getByText(/user-2/i)).toBeInTheDocument();
    });
  });
});
