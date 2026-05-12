import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/shared/settings';
import { ContentLibraryTab } from './ContentLibraryTab';

// Mock Redux store for Storybook
const createMockStore = () => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        contentLibrary: {
          plans: [],
          functionalGoals: [],
          conditions: [],
          loading: false,
          error: null,
        },
      },
    },
  });
};

const meta: Meta<typeof ContentLibraryTab> = {
  title: 'Pages/Settings/Tabs/ContentLibraryTab',
  component: ContentLibraryTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Content Library settings tab with nested sub-tabs. Features manual save pattern per sub-tab with CRUD operations for Plans, Functional Goals, and Pre-existing Conditions.',
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
type Story = StoryObj<typeof ContentLibraryTab>;

/**
 * Default state with Plans sub-tab selected
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
 * Shows the nested tab structure with Plans, Functional Goals, and Conditions
 */
export const WithNestedTabs: Story = {
  decorators: [
    (Story) => (
      <Provider store={createMockStore()}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the three nested sub-tabs: Plans, Functional Goals, and Pre-existing Conditions. Each sub-tab has independent CRUD operations and save logic.',
      },
    },
  },
};

/**
 * Loading state - fetching content library data
 */
export const Loading: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={configureStore({
          reducer: {
            settings: settingsReducer,
          },
          preloadedState: {
            settings: {
              contentLibrary: {
                plans: [],
                functionalGoals: [],
                conditions: [],
                loading: true,
                error: null,
              },
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
 * Error state - failed to load content library
 */
export const Error: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={configureStore({
          reducer: {
            settings: settingsReducer,
          },
          preloadedState: {
            settings: {
              contentLibrary: {
                plans: [],
                functionalGoals: [],
                conditions: [],
                loading: false,
                error: 'Failed to load content library. Please try again.',
              },
            },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};
