import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from '@stores/shared/settings';
import { AppearanceTab } from './AppearanceTab';

// Mock Redux store for Storybook
const createMockStore = (overrides = {}) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        appearance: {
          theme: {
            name: 'default',
            customColors: {},
            locked: false,
          },
          loading: {
            theme: false,
          },
          error: {
            theme: null,
          },
        },
        ...overrides,
      },
    },
  });
};

const meta: Meta<typeof AppearanceTab> = {
  title: 'Pages/Settings/Tabs/AppearanceTab',
  component: AppearanceTab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Appearance settings tab with theme selector. Features auto-save on selection with toast notifications. Supports Default, Vibrant, and Dark themes.',
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
type Story = StoryObj<typeof AppearanceTab>;

/**
 * Default theme selected
 */
export const DefaultTheme: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          appearance: {
            theme: { name: 'default', customColors: {}, locked: false },
            loading: { theme: false },
            error: { theme: null },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Vibrant theme selected
 */
export const VibrantTheme: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          appearance: {
            theme: { name: 'vibrant', customColors: {}, locked: false },
            loading: { theme: false },
            error: { theme: null },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Dark theme selected
 */
export const DarkTheme: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          appearance: {
            theme: { name: 'dark', customColors: {}, locked: false },
            loading: { theme: false },
            error: { theme: null },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Loading state - theme changing
 */
export const Loading: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          appearance: {
            theme: { name: 'default', customColors: {}, locked: false },
            loading: { theme: true },
            error: { theme: null },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};

/**
 * Error state - failed to save theme
 */
export const Error: Story = {
  decorators: [
    (Story) => (
      <Provider
        store={createMockStore({
          appearance: {
            theme: { name: 'default', customColors: {}, locked: false },
            loading: { theme: false },
            error: { theme: 'Failed to update theme. Please try again.' },
          },
        })}
      >
        <Story />
      </Provider>
    ),
  ],
};
