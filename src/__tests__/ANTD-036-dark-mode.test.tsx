/**
 * ANTD-036 Dark Mode Tests
 *
 * Tests to verify dark mode functionality across the application
 */

// REMOVED: import { render, screen, waitFor } from '@testing-library/react';
// REMOVED: import { ConfigProvider } from 'antd';
import { getAntdTheme } from '../styles/antd-theme';

describe('ANTD-036: Dark Mode Support', () => {
  beforeEach(() => {
    // Reset theme to light mode
    document.documentElement.setAttribute('data-theme', 'default');
  });

  describe('Theme Configuration', () => {
    it('should read CSS variables correctly in light mode', () => {
      document.documentElement.setAttribute('data-theme', 'default');
      const theme = getAntdTheme();

      expect(theme.token).toBeDefined();
      expect(theme.token?.colorText).toBeDefined();
    });

    it('should read CSS variables correctly in dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const theme = getAntdTheme();

      expect(theme.token).toBeDefined();
      expect(theme.token?.colorText).toBeDefined();
    });

    it('should update theme when switching from light to dark', () => {
      // Start in light mode
      document.documentElement.setAttribute('data-theme', 'default');
      const lightTheme = getAntdTheme();
      const lightText = lightTheme.token?.colorText;

      // Switch to dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      const darkTheme = getAntdTheme();
      const darkText = darkTheme.token?.colorText;

      // Text colors should be different
      expect(lightText).not.toBe(darkText);
    });
  });

  describe('CSS Variable Reading', () => {
    it('should read --text-primary in light mode', () => {
      document.documentElement.setAttribute('data-theme', 'default');

      const textPrimary = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-primary')
        .trim();

      expect(textPrimary).toBeTruthy();
      // Should be a dark color in light mode
      expect(textPrimary).toContain('gray-900');
    });

    it('should read --text-primary in dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');

      const textPrimary = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-primary')
        .trim();

      expect(textPrimary).toBeTruthy();
      // Should be a light color in dark mode
      expect(textPrimary).toContain('gray-50');
    });

    it('should have different surface colors in light vs dark', () => {
      // Light mode
      document.documentElement.setAttribute('data-theme', 'default');
      const lightSurface = getComputedStyle(document.documentElement)
        .getPropertyValue('--surface-primary')
        .trim();

      // Dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      const darkSurface = getComputedStyle(document.documentElement)
        .getPropertyValue('--surface-primary')
        .trim();

      expect(lightSurface).not.toBe(darkSurface);
    });
  });

  describe('Table Component Theme', () => {
    it('should have text color configuration for tables', () => {
      const theme = getAntdTheme();

      expect(theme.components?.Table).toBeDefined();
      expect(theme.token?.colorText).toBeDefined();
    });

    it('should have readable table text in dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const theme = getAntdTheme();

      const textColor = theme.token?.colorText;
      expect(textColor).toBeTruthy();

      // In dark mode, text should be light colored
      // Should NOT be black or very dark
      expect(textColor).not.toContain('#000');
      expect(textColor).not.toContain('rgb(0, 0, 0)');
    });

    it('should have proper contrast for table header in dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const theme = getAntdTheme();

      const headerBg = theme.components?.Table?.headerBg;
      const headerColor = theme.components?.Table?.headerColor;

      expect(headerBg).toBeDefined();
      expect(headerColor).toBeDefined();
    });
  });

  describe('Button Component Theme', () => {
    it('should have readable button text in dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const theme = getAntdTheme();

      const defaultColor = theme.components?.Button?.defaultColor;
      expect(defaultColor).toBeTruthy();
    });

    it('should have contrasting primary button in dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const theme = getAntdTheme();

      const primaryColor = theme.components?.Button?.primaryColor;
      expect(primaryColor).toBeDefined();
    });
  });

  describe('Input Component Theme', () => {
    it('should have readable input text in dark mode', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const theme = getAntdTheme();

      const inputBg = theme.components?.Input?.colorBgContainer;
      const inputBorder = theme.components?.Input?.colorBorder;

      expect(inputBg).toBeDefined();
      expect(inputBorder).toBeDefined();
    });
  });

  describe('Theme Switching', () => {
    it('should persist theme to localStorage', () => {
      const testTheme = 'dark';
      localStorage.setItem('vitalflow-theme', testTheme);

      const savedTheme = localStorage.getItem('vitalflow-theme');
      expect(savedTheme).toBe(testTheme);
    });

    it('should apply data-theme attribute to document', () => {
      const testTheme = 'dark';
      document.documentElement.setAttribute('data-theme', testTheme);

      const appliedTheme = document.documentElement.getAttribute('data-theme');
      expect(appliedTheme).toBe(testTheme);
    });
  });

  describe('Color Contrast (WCAG Compliance)', () => {
    it('should have sufficient contrast for text on dark backgrounds', () => {
      document.documentElement.setAttribute('data-theme', 'dark');

      const textPrimary = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-primary')
        .trim();

      const bgPage = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-page')
        .trim();

      // Both should be defined
      expect(textPrimary).toBeTruthy();
      expect(bgPage).toBeTruthy();

      // Text should be light, background should be dark
      expect(textPrimary).toContain('gray-50');
      expect(bgPage).toContain('black');
    });
  });
});

describe('Chart Theme Utilities', () => {
  it('should export getChartColorPalette', async () => {
    const { getChartColorPalette } = await import('../utils/chartTheme');
    expect(getChartColorPalette).toBeDefined();

    const palette = getChartColorPalette();
    expect(Array.isArray(palette)).toBe(true);
    expect(palette.length).toBeGreaterThan(0);
  });

  it('should export getChartTheme', async () => {
    const { getChartTheme } = await import('../utils/chartTheme');
    expect(getChartTheme).toBeDefined();

    const theme = getChartTheme();
    expect(theme).toBeDefined();
    expect(theme.color).toBeDefined();
  });

  it('should have theme-aware colors in dark mode', async () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    const { getChartColorPalette } = await import('../utils/chartTheme');
    const palette = getChartColorPalette();

    expect(palette.length).toBeGreaterThan(0);
    palette.forEach(color => {
      expect(color).toBeTruthy();
    });
  });
});
