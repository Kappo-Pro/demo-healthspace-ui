/* eslint-disable react-refresh/only-export-components */
import { usePersistedState } from '@hooks/usePersistedState';
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'default' | 'vibrant' | 'system';

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
	isDark: boolean;
	effectiveTheme: Exclude<Theme, 'system'>; // The actual theme being applied
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within ThemeProvider');
	}
	return context;
};

/**
 * Determines the initial theme based on system preferences and stored value
 */
const getInitialTheme = (): Theme => {
	try {
		const stored = localStorage.getItem('vitalflow-theme');
		if (stored) {
			const theme = JSON.parse(stored) as string;
			// Migrate 'light' to 'default' for consistency
			if (theme === 'light') {
				return 'default';
			}
			// Validate it's a valid theme
			if (['light', 'dark', 'default', 'vibrant', 'system'].includes(theme)) {
				return theme as Theme;
			}
		}
	} catch (error) {
		// localStorage access error - use default theme
		console.error(
			'[ThemeProvider] Failed to load theme from localStorage:',
			error,
		);
	}

	// Default to system preference if no stored value
	return 'system';
};

/**
 * Gets the system's preferred color scheme
 */
const getSystemTheme = (): 'dark' | 'default' => {
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'default';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	// Use persisted state hook for automatic localStorage sync
	// Note: getInitialTheme() only runs once on mount
	const [theme, setThemeState] = usePersistedState<Theme>(
		'vitalflow-theme',
		getInitialTheme(),
	);

	// Track system theme when user selects 'system'
	const [systemTheme, setSystemTheme] = useState<'dark' | 'default'>(
		getSystemTheme(),
	);

	// Calculate the effective theme (what actually gets applied)
	const effectiveTheme: Exclude<Theme, 'system'> =
		theme === 'system' ? systemTheme : theme;

	// Listen to system theme changes
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
			const newSystemTheme = e.matches ? 'dark' : 'default';
			setSystemTheme(newSystemTheme);
		};

		// Set initial value
		handleChange(mediaQuery);

		// Listen for changes
		mediaQuery.addEventListener('change', handleChange);

		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	// NOTE (2025-11-10): data-theme attribute now set in AntdConfigProvider
	// Moved to useLayoutEffect to fix race condition where getCSSVar() was reading
	// old theme values before DOM attribute was updated. See App.tsx for implementation.

	const setTheme = (newTheme: Theme) => {
		// Update state (will trigger useEffect to apply theme)
		setThemeState(newTheme);
	};

	const toggleTheme = () => {
		// Toggle between default and dark
		const newTheme = effectiveTheme === 'dark' ? 'default' : 'dark';
		setTheme(newTheme);
	};

	const isDark = effectiveTheme === 'dark';

	return (
		<ThemeContext.Provider
			value={{ theme, setTheme, toggleTheme, isDark, effectiveTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};
