import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/shared/settings';
import userReducer from '@stores/shared/user';
import { AdvancedTab } from './AdvancedTab';
import { USER_ROLES } from '@stores/constants';

// Mock Redux store for Storybook
const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
      user: userReducer,
    },
    preloadedState: {
      settings: {
        advanced: {
          bandwidth: {
            mode: 'high',
          },
          tags: [
            { id: '1', name: 'VIP', color: 'gold', description: 'VIP users', createdAt: new Date() },
            { id: '2', name: 'Beta Tester', color: "var(--color-primary)", description: 'Beta program participants', createdAt: new Date() },
          ],
          loadingBandwidth: false,
          errorBandwidth: null,
        },
        lastSaved: {
          bandwidth: Date.now() - 120000, // 2 minutes ago
        },
        ...overrides,
      },
      user: {
        profile: {
          role: USER_ROLES.SUPER_ADMIN,
        },
      },
    },
  });
};

const meta: Meta<typeof AdvancedTab> = {
  title: 'Pages/Settings/Tabs/AdvancedTab',
  component: AdvancedTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Advanced settings tab for Super Admin only. Features bandwidth optimization (optimistic updates), tags management (CRUD), confirmation modal for critical changes, and 403 unauthorized handling.',
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
type Story = StoryObj<typeof AdvancedTab>;

/**
 * Super Admin view - full access with bandwidth enabled
 */
export const SuperAdminView: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore()}>
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Bandwidth disabled state
 */
export const BandwidthDisabled: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          advanced: {
            bandwidth: {
              mode: 'low',
            },
            tags: [
              { id: '1', name: 'VIP', color: 'gold', description: 'VIP users', createdAt: new Date() },
            ],
            loadingBandwidth: false,
            errorBandwidth: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Loading state - bandwidth toggle in progress (optimistic update)
 */
export const Loading: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          advanced: {
            bandwidth: {
              mode: 'high',
            },
            tags: [
              { id: '1', name: 'VIP', color: 'gold', description: 'VIP users', createdAt: new Date() },
            ],
            loadingBandwidth: true,
            errorBandwidth: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Error state - failed to save bandwidth settings
 */
export const Error: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          advanced: {
            bandwidth: {
              mode: 'high',
            },
            tags: [
              { id: '1', name: 'VIP', color: 'gold', description: 'VIP users', createdAt: new Date() },
            ],
            loadingBandwidth: false,
            errorBandwidth: 'Failed to update bandwidth settings. Network error.',
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Unauthorized view - non-Super Admin user gets 403
 */
export const Unauthorized: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={configureStore({
          reducer: {
            settings: settingsReducer,
            user: userReducer,
          },
          preloadedState: {
            settings: {
              advanced: {
                bandwidth: {
                  mode: 'high',
                },
                tags: [],
                loadingBandwidth: false,
                errorBandwidth: null,
              },
            },
            user: {
              profile: {
                role: 'admin', // Regular admin, not super admin
              },
            },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates role-based access control. Only Super Admin users can view this tab. Regular admins see a 403 Unauthorized result.',
      },
    },
  },
};

/**
 * Empty state - no tags configured
 */
export const NoTags: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          advanced: {
            bandwidth: {
              mode: 'high',
            },
            tags: [], // No tags
            loadingBandwidth: false,
            errorBandwidth: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Many tags - demonstrates tag management UI with multiple tags
 */
export const ManyTags: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          advanced: {
            bandwidth: {
              mode: 'high',
            },
            tags: [
              { id: '1', name: 'VIP', color: 'gold', description: 'VIP users', createdAt: new Date() },
              { id: '2', name: 'Beta Tester', color: "var(--color-primary)", description: 'Beta program participants', createdAt: new Date() },
              { id: '3', name: 'Enterprise', color: "var(--color-secondary)", description: 'Enterprise clients', createdAt: new Date() },
              { id: '4', name: 'Trial', color: "var(--color-warning-dark)", description: 'Trial users', createdAt: new Date() },
              { id: '5', name: 'Internal', color: "var(--color-error)", description: 'Internal team members', createdAt: new Date() },
              { id: '6', name: 'Partner', color: "var(--color-success)", description: 'Partner organizations', createdAt: new Date() },
            ],
            loadingBandwidth: false,
            errorBandwidth: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};
