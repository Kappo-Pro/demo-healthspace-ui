/**
 * RTK Query Testing Utilities
 *
 * This module provides helper functions and utilities for testing
 * RTK Query APIs and components that use RTK Query hooks.
 *
 * Usage:
 * ```typescript
 * import { createTestStore, renderWithStore } from '@test/rtk-query-test-utils';
 * import { myApi } from '@stores/myApi';
 *
 * const store = createTestStore(myApi);
 * renderWithStore(<MyComponent />, myApi);
 * ```
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

/**
 * Create a test store with RTK Query API
 *
 * @param api - The RTK Query API instance
 * @param preloadedState - Optional preloaded state
 * @returns Configured Redux store for testing
 */
export function createTestStore(api: any, preloadedState?: PreloadedState<any>) {
	const store = configureStore({
		reducer: {
			[api.reducerPath]: api.reducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(api.middleware),
		preloadedState,
	});

	// Enable automatic refetching
	setupListeners(store.dispatch);

	return store;
}

/**
 * Create a test store with multiple RTK Query APIs
 *
 * @param apis - Array of RTK Query API instances
 * @param preloadedState - Optional preloaded state
 * @returns Configured Redux store for testing
 */
export function createTestStoreWithMultipleApis(
	apis: any[],
	preloadedState?: PreloadedState<any>
) {
	const reducer: Record<string, any> = {};
	const middlewares: any[] = [];

	apis.forEach((api) => {
		reducer[api.reducerPath] = api.reducer;
		middlewares.push(api.middleware);
	});

	const store = configureStore({
		reducer,
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(...middlewares),
		preloadedState,
	});

	setupListeners(store.dispatch);

	return store;
}

/**
 * Render component with Redux store provider
 *
 * @param ui - React element to render
 * @param api - RTK Query API instance
 * @param options - Render options including store and preloaded state
 * @returns Rendered component with store
 */
export function renderWithStore(
	ui: React.ReactElement,
	api: any,
	{
		preloadedState,
		store = createTestStore(api, preloadedState),
		...renderOptions
	}: RenderOptions & {
		preloadedState?: PreloadedState<any>;
		store?: any;
	} = {}
) {
	const Wrapper = ({ children }: PropsWithChildren<unknown>): JSX.Element => {
		return <Provider store={store}>{children}</Provider>;
	};

	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Render component with multiple APIs
 *
 * @param ui - React element to render
 * @param apis - Array of RTK Query API instances
 * @param options - Render options
 * @returns Rendered component with store
 */
export function renderWithMultipleApis(
	ui: React.ReactElement,
	apis: any[],
	{
		preloadedState,
		store = createTestStoreWithMultipleApis(apis, preloadedState),
		...renderOptions
	}: RenderOptions & {
		preloadedState?: PreloadedState<any>;
		store?: any;
	} = {}
) {
	const Wrapper = ({ children }: PropsWithChildren<unknown>): JSX.Element => {
		return <Provider store={store}>{children}</Provider>;
	};

	return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Create a successful query state for preloading
 *
 * @param queryKey - The query key (e.g., 'getPatients(undefined)')
 * @param data - The data to return
 * @returns Query state object
 */
export function createSuccessfulQueryState<T>(queryKey: string, data: T) {
	return {
		[queryKey]: {
			status: 'fulfilled',
			endpointName: queryKey.split('(')[0],
			requestId: 'test-request-id',
			data,
			fulfilledTimeStamp: Date.now(),
			startedTimeStamp: Date.now(),
		},
	};
}

/**
 * Create an error query state for preloading
 *
 * @param queryKey - The query key
 * @param error - The error object
 * @returns Query state object
 */
export function createErrorQueryState(queryKey: string, error: any) {
	return {
		[queryKey]: {
			status: 'rejected',
			endpointName: queryKey.split('(')[0],
			requestId: 'test-request-id',
			error,
			startedTimeStamp: Date.now(),
		},
	};
}

/**
 * Create a loading query state for preloading
 *
 * @param queryKey - The query key
 * @returns Query state object
 */
export function createLoadingQueryState(queryKey: string) {
	return {
		[queryKey]: {
			status: 'pending',
			endpointName: queryKey.split('(')[0],
			requestId: 'test-request-id',
			startedTimeStamp: Date.now(),
		},
	};
}

/**
 * Wait for query to complete (success or error)
 *
 * @param store - Redux store
 * @param api - RTK Query API
 * @param endpointName - Name of the endpoint
 * @param timeout - Maximum wait time in ms
 */
export async function waitForQueryToComplete(
	store: any,
	api: any,
	endpointName: string,
	timeout = 5000
): Promise<void> {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(new Error(`Query ${endpointName} did not complete within ${timeout}ms`));
		}, timeout);

		const unsubscribe = store.subscribe(() => {
			const state = store.getState();
			const queryState = state[api.reducerPath]?.queries;

			if (queryState) {
				const query = Object.values(queryState).find(
					(q: any) => q.endpointName === endpointName
				);

				if (query && (query as any).status !== 'pending') {
					clearTimeout(timeoutId);
					unsubscribe();
					resolve();
				}
			}
		});
	});
}

/**
 * Mock successful API response
 */
export function mockSuccessResponse<T>(data: T) {
	return {
		data,
		status: 200,
		statusText: 'OK',
	};
}

/**
 * Mock error API response
 */
export function mockErrorResponse(status: number, message: string) {
	return {
		error: {
			status,
			data: { message },
		},
	};
}

/**
 * Create a wrapper component with Redux Provider
 */
export function createWrapper(store: any) {
	return function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
		return <Provider store={store}>{children}</Provider>;
	};
}

/**
 * Helper to dispatch a query and wait for result
 */
export async function dispatchQuery<T>(
	store: any,
	api: any,
	endpointName: string,
	args?: any
): Promise<T> {
	const endpoint = api.endpoints[endpointName];
	const promise = store.dispatch(endpoint.initiate(args));

	try {
		const result = await promise;
		return result.data;
	} finally {
		// Clean up subscription
		promise.unsubscribe();
	}
}

/**
 * Helper to dispatch a mutation and wait for result
 */
export async function dispatchMutation<T>(
	store: any,
	api: any,
	endpointName: string,
	args?: any
): Promise<T> {
	const endpoint = api.endpoints[endpointName];
	const result = await store.dispatch(endpoint.initiate(args));
	return result.data;
}

/**
 * Reset all API state in the store
 */
export function resetApiState(store: any, api: any) {
	store.dispatch(api.util.resetApiState());
}

/**
 * Invalidate specific tags
 */
export function invalidateTags(store: any, api: any, tags: string[]) {
	store.dispatch(api.util.invalidateTags(tags));
}
