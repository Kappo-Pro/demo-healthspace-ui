import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/shared/settings';
import { TemplatesTab } from './TemplatesTab';

// Mock Redux store for Storybook
const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        templates: {
          templates: {
            invite: 'Hi {{name}}, you have been invited to join VitalFlow. Use code: {{inviteCode}}',
            bulkInvite: 'Dear {{name}}, Welcome to VitalFlow. Your invite link: {{link}}',
            resultEmail: 'Hi {{name}}, your {{assessmentType}} results are ready. View them here: {{resultLink}}',
            consentForm: 'I, the undersigned, consent to participate in the assessment.',
            rom: 'This assessment will measure your range of motion. Please follow the on-screen instructions.',
          },
          loading: {
            invite: false,
            bulkInvite: false,
            resultEmail: false,
            consentForm: false,
            rom: false,
          },
          errors: {
            invite: null,
            bulkInvite: null,
            resultEmail: null,
            consentForm: null,
            rom: null,
          },
          lastSaved: {
            invite: Date.now() - 120000, // 2 minutes ago
            bulkInvite: Date.now() - 300000, // 5 minutes ago
            resultEmail: null,
            consentForm: null,
            rom: null,
          },
        },
        ...overrides,
      },
    },
  });
};

const meta: Meta<typeof TemplatesTab> = {
  title: 'Pages/Settings/Tabs/TemplatesTab',
  component: TemplatesTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Templates settings tab for managing email and assessment templates. Features autosave with 2-second debounce, circuit breaker protection, "Last saved" timestamps, and preview functionality.',
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
type Story = StoryObj<typeof TemplatesTab>;

/**
 * Default state with populated templates
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
 * Empty state - no templates configured
 */
export const Empty: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          templates: {
            templates: {
              invite: '',
              bulkInvite: '',
              resultEmail: '',
              consentForm: '',
              rom: '',
            },
            loading: {
              invite: false,
              bulkInvite: false,
              resultEmail: false,
              consentForm: false,
              rom: false,
            },
            errors: {},
            lastSaved: {},
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Autosave in progress - saving templates
 */
export const Autosaving: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          templates: {
            templates: {
              invite: 'Hi {{name}}, you have been invited to join VitalFlow.',
              bulkInvite: '',
              resultEmail: '',
              consentForm: '',
              rom: '',
            },
            loading: {
              invite: true,
              bulkInvite: false,
              resultEmail: false,
              consentForm: false,
              rom: false,
            },
            errors: {},
            lastSaved: {},
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Error state - failed to save template
 */
export const Error: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          templates: {
            templates: {
              invite: 'Hi {{name}}, you have been invited to join VitalFlow.',
              bulkInvite: '',
              resultEmail: '',
              consentForm: '',
              rom: '',
            },
            loading: {
              invite: false,
              bulkInvite: false,
              resultEmail: false,
              consentForm: false,
              rom: false,
            },
            errors: {
              invite: 'Failed to save template. Please try again.',
              bulkInvite: null,
              resultEmail: null,
              consentForm: null,
              rom: null,
            },
            lastSaved: {
              invite: Date.now() - 600000, // 10 minutes ago (last successful save)
            },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Recently saved state - templates saved within last minute
 */
export const RecentlySaved: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          templates: {
            templates: {
              invite: 'Hi {{name}}, you have been invited to join VitalFlow.',
              bulkInvite: 'Dear {{name}}, Welcome to VitalFlow.',
              resultEmail: 'Hi {{name}}, your results are ready.',
              consentForm: 'I consent to participate.',
              rom: 'Range of motion assessment instructions.',
            },
            loading: {
              invite: false,
              bulkInvite: false,
              resultEmail: false,
              consentForm: false,
              rom: false,
            },
            errors: {},
            lastSaved: {
              invite: Date.now() - 30000, // 30 seconds ago
              bulkInvite: Date.now() - 45000, // 45 seconds ago
              resultEmail: Date.now() - 10000, // 10 seconds ago
              consentForm: Date.now() - 20000, // 20 seconds ago
              rom: Date.now() - 15000, // 15 seconds ago
            },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};
