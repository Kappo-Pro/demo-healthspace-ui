import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/shared/settings';
import { GeneralTab } from './GeneralTab';

// Mock Redux store for Storybook
const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        general: {
          clientId: 'CLIENT-2025-ABC',
          inviteCode: 'INVITE-XYZ',
          selfRegistration: {
            active: true,
            requireApproval: false,
            autoAssignTo: undefined,
          },
          loadingInviteCode: false,
          loadingSelfRegistration: false,
          errorInviteCode: null,
          errorSelfRegistration: null,
        },
        tabsDirty: {},
        ...overrides,
      },
    },
  });
};

const meta: Meta<typeof GeneralTab> = {
  title: 'Pages/Settings/Tabs/GeneralTab',
  component: GeneralTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'General settings tab for managing Client ID, Invite Code, and Self-Registration configuration. Features manual save pattern with dirty field tracking and navigation blocking.',
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
type Story = StoryObj<typeof GeneralTab>;

/**
 * Default state with populated settings
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
 * Loading state - saving settings in progress
 */
export const Loading: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          general: {
            clientId: 'CLIENT-2025-ABC',
            inviteCode: 'INVITE-XYZ',
            selfRegistration: {
              active: true,
              requireApproval: false,
            },
            loadingInviteCode: true,
            loadingSelfRegistration: true,
            errorInviteCode: null,
            errorSelfRegistration: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Error state - failed to save settings
 */
export const Error: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          general: {
            clientId: 'CLIENT-2025-ABC',
            inviteCode: 'INVITE-XYZ',
            selfRegistration: {
              active: true,
              requireApproval: false,
            },
            loadingInviteCode: false,
            loadingSelfRegistration: false,
            errorInviteCode: 'Failed to save invite code. Please check your connection.',
            errorSelfRegistration: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Self-Registration disabled
 */
export const SelfRegistrationDisabled: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          general: {
            clientId: 'CLIENT-2025-ABC',
            inviteCode: 'INVITE-XYZ',
            selfRegistration: {
              active: false,
              requireApproval: false,
            },
            loadingInviteCode: false,
            loadingSelfRegistration: false,
            errorInviteCode: null,
            errorSelfRegistration: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Empty state - no settings configured yet
 */
export const Empty: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          general: {
            clientId: '',
            inviteCode: '',
            selfRegistration: {
              active: false,
              requireApproval: false,
            },
            loadingInviteCode: false,
            loadingSelfRegistration: false,
            errorInviteCode: null,
            errorSelfRegistration: null,
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};
