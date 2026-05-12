import { Provider } from 'react-redux';
import { App as AntdApp, ConfigProvider } from 'antd';
import { I18nextProvider } from 'react-i18next';
import { useEffect, useRef } from 'react';

import 'regenerator-runtime/runtime';
import Routers from '@routers/index';
import stores from '@stores/index';
import '@utils/Api';
import i18n from './i18n';
import { cleanupFeatureFlagStorage } from '@utils/cleanup/featureFlagCleanup';

// Import Design System (must load first for proper CSS cascading)
import '@styles/design-system.css';
import { getAntdTheme } from '@styles/antd-theme';

// Import Focus Visible styles (Story 8.1: WCAG 2.4.7 compliant focus styles)
import '@styles/focus-visible.css';

// Import Visually Hidden styles (Story 8.2: ARIA live regions and screen reader only elements)
import '@styles/visually-hidden.css';

// Import Mobile Touch Optimization styles (Story 2.6: FR10)
import '@styles/mobile-touch.css';

// Import app-specific overrides (loads after design system)
import './Changes.css';

// IMPORTANT: Do not remove - Required for context-aware global search
import { SearchProvider } from '@contexts/SearchContext';

// Theme provider for dark mode support
import { ThemeProvider, useTheme } from '@providers/ThemeProvider';

/**
 * AntdConfigProvider - Wraps ConfigProvider to make it reactive to theme changes
 *
 * The useTheme() hook provides isDark state, which triggers Ant Design's
 * darkAlgorithm for automatic dark mode theming (hover/focus/disabled states).
 *
 * This reduces CSS overrides from 1,381 lines to ~100 lines by letting
 * Ant Design's algorithm handle state derivations!
 *
 * Global Component Defaults:
 * - Pagination: hideOnSinglePage=true (hide pagination when only 1 page)
 *
 * FIX (2025-11-11): Synchronous theme update fix
 * - Update data-theme attribute synchronously DURING render phase
 * - This happens BEFORE getAntdTheme() is called in the return statement
 * - getCSSVar() now reads correct CSS variables from the new theme
 * - useRef tracks previous theme to detect changes
 * - No more timing race condition
 */
const AntdConfigProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Get dark mode state and effective theme from ThemeProvider
	const { isDark, effectiveTheme } = useTheme();
	const prevThemeRef = useRef(effectiveTheme);

	// Update data-theme synchronously BEFORE rendering ConfigProvider
	// This ensures getCSSVar() reads correct values
	if (prevThemeRef.current !== effectiveTheme) {
		document.documentElement.setAttribute('data-theme', effectiveTheme);
		prevThemeRef.current = effectiveTheme;
	}

	// Pass isDark to use Ant Design's dark algorithm
	// Global pagination config: hide when only one page for better UX
	//
	// key prop forces remount on light/dark transition for clean state
	// AntdApp wrapper enables static methods (Modal.confirm, message, notification)
	// to inherit theme from ConfigProvider
	return (
		<ConfigProvider
			key={`theme-${isDark ? 'dark' : 'light'}`}
			theme={getAntdTheme(isDark)}
			pagination={{ hideOnSinglePage: true }}>
			<AntdApp>{children}</AntdApp>
		</ConfigProvider>
	);
};

const App = () => {
	// One-time cleanup of deprecated feature flag localStorage keys
	// @see EPIC: feature-flag-removal
	// @deprecated Can be removed after Dec 7, 2025 (30 days post-deployment)
	useEffect(() => {
		// Only run if cleanup hasn't been done yet
		if (!localStorage.getItem('ff_cleanup_done')) {
			cleanupFeatureFlagStorage();
		}
	}, []);

	return (
		<I18nextProvider i18n={i18n}>
			<Provider store={stores}>
				<ThemeProvider>
					<AntdConfigProvider>
						{/* IMPORTANT: SearchProvider must wrap Routers for global search to work */}
						<SearchProvider>
							<Routers />
						</SearchProvider>
					</AntdConfigProvider>
				</ThemeProvider>
			</Provider>
		</I18nextProvider>
	);
};

export default App;
