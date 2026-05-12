import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/shared/settings';
import { PlansTab } from './PlansTab';

// Mock Redux store for Storybook
const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        plans: {
          defaultPlan: 'basic',
          upgradePlan: 'pro',
          availablePlans: [
            { id: 'basic', title: 'Basic Plan', description: 'Basic features', thumbnail: '' },
            { id: 'pro', title: 'Pro Plan', description: 'Professional features', thumbnail: '' },
          ],
          savedUserPlans: [
            { userId: 'user-1', planId: 'basic', assignedAt: '2025-10-01T10:00:00Z' },
            { userId: 'user-2', planId: 'pro', assignedAt: '2025-10-05T14:30:00Z' },
          ],
          loadingDefault: false,
          loadingUpgrade: false,
          errorDefault: null,
          errorUpgrade: null,
        },
        ...overrides,
      },
    },
  });
};

const meta: Meta<typeof PlansTab> = {
  title: 'Pages/Settings/Tabs/PlansTab',
  component: PlansTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Plans settings tab with validation rules. Features manual save pattern with 4 validation rules: (1) Default Plan must be in Available Plans, (2) Upgrade Plan must be in Available Plans, (3) At least 1 Available Plan required, (4) Default ≠ Upgrade.',
      },
    },
  },
  decorators: [
    (Story) => (
      <Provider store={createMockStore()}>
        <Story />
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PlansTab>;

/**
 * Valid configuration - all validation rules pass
 */
export const ValidConfiguration: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore()}>
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Validation error - Default plan not in Available Plans (Rule 1 violation)
 */
export const ValidationErrorDefaultPlan: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          plans: {
            defaultPlan: 'enterprise', // Not in availablePlans
            upgradePlan: 'pro',
            availablePlans: [
              { id: 'basic', title: 'Basic Plan', description: 'Basic features', thumbnail: '' },
              { id: 'pro', title: 'Pro Plan', description: 'Professional features', thumbnail: '' },
            ],
            savedUserPlans: [],
            loadingDefault: false,
            loadingUpgrade: false,
            errorDefault: null,
            errorUpgrade: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Validation error - Default equals Upgrade (Rule 4 violation)
 */
export const ValidationErrorSamePlan: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          plans: {
            defaultPlan: 'pro',
            upgradePlan: 'pro', // Same as defaultPlan
            availablePlans: [
              { id: 'basic', title: 'Basic Plan', description: 'Basic features', thumbnail: '' },
              { id: 'pro', title: 'Pro Plan', description: 'Professional features', thumbnail: '' },
            ],
            savedUserPlans: [],
            loadingDefault: false,
            loadingUpgrade: false,
            errorDefault: null,
            errorUpgrade: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Validation error - No available plans (Rule 3 violation)
 */
export const ValidationErrorNoPlans: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          plans: {
            defaultPlan: '',
            upgradePlan: '',
            availablePlans: [], // Empty
            savedUserPlans: [],
            loadingDefault: false,
            loadingUpgrade: false,
            errorDefault: null,
            errorUpgrade: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Loading state - saving plans
 */
export const Loading: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          plans: {
            defaultPlan: 'basic',
            upgradePlan: 'pro',
            availablePlans: [
              { id: 'basic', title: 'Basic Plan', description: 'Basic features', thumbnail: '' },
              { id: 'pro', title: 'Pro Plan', description: 'Professional features', thumbnail: '' },
            ],
            savedUserPlans: [],
            loadingDefault: true,
            loadingUpgrade: true,
            errorDefault: null,
            errorUpgrade: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Error state - failed to save plans
 */
export const Error: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          plans: {
            defaultPlan: 'basic',
            upgradePlan: 'pro',
            availablePlans: [
              { id: 'basic', title: 'Basic Plan', description: 'Basic features', thumbnail: '' },
              { id: 'pro', title: 'Pro Plan', description: 'Professional features', thumbnail: '' },
            ],
            savedUserPlans: [],
            loadingDefault: false,
            loadingUpgrade: false,
            errorDefault: 'Failed to save default plan. Please try again.',
            errorUpgrade: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Empty state - no user plans assigned yet
 */
export const NoUserPlans: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          plans: {
            defaultPlan: 'basic',
            upgradePlan: 'pro',
            availablePlans: [
              { id: 'basic', title: 'Basic Plan', description: 'Basic features', thumbnail: '' },
              { id: 'pro', title: 'Pro Plan', description: 'Professional features', thumbnail: '' },
            ],
            savedUserPlans: [], // No user plans
            loadingDefault: false,
            loadingUpgrade: false,
            errorDefault: null,
            errorUpgrade: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};
