import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/shared/settings';
import { IntegrationsTab } from './IntegrationsTab';

// Mock Redux store for Storybook
const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        integrations: {
          apiKey: 'sk-1234567890abcdefghijklmnopqrstuvwxyz',
          apiKeyActive: true,
          loading: false,
          error: null,
        },
        ...overrides,
      },
    },
  });
};

const meta: Meta<typeof IntegrationsTab> = {
  title: 'Pages/Settings/Tabs/IntegrationsTab',
  component: IntegrationsTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Integrations settings tab for managing OpenAI API Key. Features manual save pattern with dirty tracking, password input with visibility toggle, and Test Connection button.',
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
type Story = StoryObj<typeof IntegrationsTab>;

/**
 * Default state with API key configured and active
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore()}>
        <Story />
      </Provider>
    ),
  ],
};

/**
 * API key inactive state
 */
export const ApiKeyInactive: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          integrations: {
            apiKey: 'sk-1234567890abcdefghijklmnopqrstuvwxyz',
            apiKeyActive: false,
            loading: false,
            error: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Empty state - no API key configured
 */
export const Empty: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          integrations: {
            apiKey: '',
            apiKeyActive: false,
            loading: false,
            error: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Loading state - saving API key
 */
export const Loading: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          integrations: {
            apiKey: 'sk-1234567890abcdefghijklmnopqrstuvwxyz',
            apiKeyActive: true,
            loading: true,
            error: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Error state - failed to save API key
 */
export const Error: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          integrations: {
            apiKey: 'sk-1234567890abcdefghijklmnopqrstuvwxyz',
            apiKeyActive: true,
            loading: false,
            error: 'Failed to save API key. Please check your connection and try again.',
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};
