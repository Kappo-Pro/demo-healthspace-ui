/* eslint-disable react-refresh/only-export-components */
/**
 * ANTD-047: Testing Infrastructure
 * Test utilities for React component testing
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Type for test store state (use Record for flexible testing)
type TestStoreState = Record<string, unknown>;

/**
 * Create a test store with optional initial state
 * Uses the same reducer configuration as the main app store
 */
export const createTestStore = (initialState?: TestStoreState) => {
  return configureStore({
    reducer: {
      // Use empty reducers for tests to avoid complex store dependencies
      // Individual tests can override with their own state
      test: (state = {}) => state,
    },
    preloadedState: initialState,
  });
};

/**
 * Wrapper component that provides all necessary providers
 */
interface AllProvidersProps {
  children: React.ReactNode;
  initialState?: TestStoreState;
}

const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  initialState
}) => {
  const store = createTestStore(initialState);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </BrowserRouter>
    </Provider>
  );
};

/**
 * Custom render function that wraps components with all providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: TestStoreState;
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { initialState, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialState={initialState}>
        {children}
      </AllProviders>
    ),
    ...renderOptions,
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };
