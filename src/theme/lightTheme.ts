import { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  token: {
    // Brand colors
    colorPrimary: '#0D9488',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',

    // Text colors
    colorText: 'var(--text-primary)',
    colorTextSecondary: 'var(--color-gray-600)',
    colorTextTertiary: 'var(--color-gray-500)',
    colorTextDisabled: 'var(--color-gray-400)',

    // Background colors
    colorBgBase: 'var(--surface-primary)',
    colorBgContainer: 'var(--surface-secondary)',
    colorBgElevated: 'var(--surface-primary)',
    colorBgLayout: 'var(--color-gray-100)',

    // Border colors
    colorBorder: 'var(--color-gray-200)',
    colorBorderSecondary: 'var(--color-gray-300)',

    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,

    // Line heights
    lineHeight: 1.5715,
    lineHeightHeading1: 1.2105,
    lineHeightHeading2: 1.2666,
    lineHeightHeading3: 1.3333,
    lineHeightHeading4: 1.4,
    lineHeightHeading5: 1.5,

    // Spacing
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,

    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
  },

  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
    Select: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
    },
  },
};
