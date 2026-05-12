import { ThemeConfig, theme } from 'antd';

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,

  token: {
    // Brand colors (same as light)
    colorPrimary: '#0D9488',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#3B82F6',

    // Text colors (dark mode overrides)
    colorText: 'var(--surface-secondary)',
    colorTextSecondary: 'var(--color-gray-300)',
    colorTextTertiary: 'var(--color-gray-400)',
    colorTextDisabled: 'var(--color-gray-500)',

    // Background colors (dark mode overrides)
    colorBgBase: 'var(--color-gray-800)',
    colorBgContainer: 'var(--color-gray-900)',
    colorBgElevated: 'var(--color-gray-700)',
    colorBgLayout: 'var(--color-gray-900)',

    // Border colors (dark mode overrides)
    colorBorder: 'var(--color-gray-700)',
    colorBorderSecondary: 'var(--color-gray-600)',

    // Typography (same as light)
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

    // Line heights (same as light)
    lineHeight: 1.5715,
    lineHeightHeading1: 1.2105,
    lineHeightHeading2: 1.2666,
    lineHeightHeading3: 1.3333,
    lineHeightHeading4: 1.4,
    lineHeightHeading5: 1.5,

    // Spacing (same as light)
    marginXS: 8,
    marginSM: 12,
    margin: 16,
    marginMD: 20,
    marginLG: 24,
    marginXL: 32,

    // Border radius (same as light)
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
    Modal: {
      contentBg: 'var(--color-gray-800)',
      headerBg: 'var(--color-gray-900)',
    },
    Table: {
      headerBg: 'var(--color-gray-900)',
      rowHoverBg: 'var(--color-gray-700)',
    },
  },
};
