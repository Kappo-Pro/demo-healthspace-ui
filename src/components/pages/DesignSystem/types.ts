/**
 * Design System Demo Page - Type Definitions
 *
 * Comprehensive TypeScript interfaces for the Design System demo page.
 * This file defines types for state management, token categories, themes,
 * component showcases, and export functionality.
 *
 * @module DesignSystem/types
 */

/**
 * Theme type definition from ThemeProvider
 * Re-exported for convenience and consistency
 */
export type Theme = 'light' | 'dark' | 'default' | 'vibrant';

/**
 * Main categories of design tokens available in the system
 */
export type TokenCategory =
  | 'colors'
  | 'spacing'
  | 'typography'
  | 'shadows'
  | 'borders'
  | 'effects';

/**
 * Supported export formats for design tokens
 */
export type ExportFormat = 'css' | 'json';

/**
 * Tab keys for the main navigation tabs in the Design System demo
 */
export type TabKey =
  | 'tokens'      // Design token reference
  | 'components'  // Component showcase
  | 'themes'      // Theme switcher and preview
  | 'export'      // Export configuration
  | 'playground'; // Interactive playground

/**
 * Component showcase categories for organizing demo components
 */
export type ComponentCategory =
  | 'atoms'
  | 'molecules'
  | 'organisms'
  | 'forms'
  | 'feedback'
  | 'navigation'
  | 'layout'
  | 'data-display';

/**
 * Represents a single design token item
 */
export interface TokenItem {
  /**
   * CSS variable name (e.g., "--color-purple-500")
   */
  name: string;

  /**
   * Computed CSS value (e.g., "#9E77ED")
   */
  value: string;

  /**
   * Token category
   */
  category: TokenCategory;

  /**
   * Human-readable description of the token's purpose
   */
  description?: string;

  /**
   * Usage guidelines or examples
   */
  usage?: string;

  /**
   * Related tokens (for reference)
   */
  relatedTokens?: string[];

  /**
   * Whether this is a semantic token (derived from primitives)
   */
  isSemantic?: boolean;

  /**
   * Original primitive token if this is semantic
   */
  primitiveSource?: string;
}

/**
 * Custom token modifications made by the user
 */
export interface CustomToken {
  /**
   * CSS variable name
   */
  name: string;

  /**
   * Custom value
   */
  value: string;

  /**
   * Original value before modification
   */
  originalValue: string;

  /**
   * When the modification was made
   */
  modifiedAt: string;
}

/**
 * Design System state management interface
 */
export interface DesignSystemState {
  /**
   * Currently active theme
   */
  currentTheme: Theme;

  /**
   * User-defined custom tokens
   */
  customTokens: Record<string, string>;

  /**
   * Track which tokens have been modified
   */
  modifiedTokens: Set<string>;

  /**
   * Active tab in the interface
   */
  activeTab: TabKey;

  /**
   * Selected token category for filtering
   */
  selectedCategory: TokenCategory | 'all';

  /**
   * Search query for filtering tokens
   */
  searchQuery: string;

  /**
   * Whether the interface is in edit mode
   */
  isEditMode: boolean;

  /**
   * Export format selection
   */
  exportFormat: ExportFormat;

  /**
   * Selected tokens for export (empty = all)
   */
  selectedTokensForExport: string[];
}

/**
 * Component showcase item for the demo page
 */
export interface ComponentShowcaseItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display name of the component
   */
  name: string;

  /**
   * Brief description of the component's purpose
   */
  description: string;

  /**
   * Component category
   */
  category: ComponentCategory;

  /**
   * Code example (JSX/TSX string)
   */
  exampleCode: string;

  /**
   * Live preview component (React node)
   */
  preview?: React.ReactNode;

  /**
   * Design tokens used by this component
   */
  tokensUsed?: string[];

  /**
   * Related components
   */
  relatedComponents?: string[];

  /**
   * Link to component documentation
   */
  docsLink?: string;

  /**
   * Link to Storybook story
   */
  storybookLink?: string;
}

/**
 * Theme configuration for preview and switching
 */
export interface ThemeConfig {
  /**
   * Theme identifier
   */
  key: Theme;

  /**
   * Display name
   */
  label: string;

  /**
   * Theme description
   */
  description: string;

  /**
   * Preview colors (for theme switcher UI)
   */
  previewColors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };

  /**
   * Whether this is a dark theme
   */
  isDark: boolean;
}

/**
 * Token filter configuration
 */
export interface TokenFilter {
  /**
   * Filter by category
   */
  category?: TokenCategory | 'all';

  /**
   * Search query
   */
  search?: string;

  /**
   * Show only modified tokens
   */
  modifiedOnly?: boolean;

  /**
   * Show only semantic tokens
   */
  semanticOnly?: boolean;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  /**
   * Export format
   */
  format: ExportFormat;

  /**
   * Include token descriptions
   */
  includeDescriptions?: boolean;

  /**
   * Include usage guidelines
   */
  includeUsage?: boolean;

  /**
   * File name for export
   */
  fileName?: string;

  /**
   * Specific tokens to export (empty = all)
   */
  selectedTokens?: string[];

  /**
   * Group tokens by category
   */
  groupByCategory?: boolean;
}

/**
 * Token group for organized display
 */
export interface TokenGroup {
  /**
   * Group category
   */
  category: TokenCategory;

  /**
   * Display label
   */
  label: string;

  /**
   * Tokens in this group
   */
  tokens: TokenItem[];

  /**
   * Whether the group is expanded
   */
  isExpanded?: boolean;
}

/**
 * Color token with additional color-specific properties
 */
export interface ColorToken extends TokenItem {
  category: 'colors';

  /**
   * Hex color value
   */
  hex: string;

  /**
   * RGB values
   */
  rgb?: {
    r: number;
    g: number;
    b: number;
  };

  /**
   * HSL values
   */
  hsl?: {
    h: number;
    s: number;
    l: number;
  };

  /**
   * Color scale position (e.g., 500 in purple-500)
   */
  scale?: number;

  /**
   * Color family (e.g., "purple", "gray")
   */
  family?: string;
}

/**
 * Spacing token with additional spacing-specific properties
 */
export interface SpacingToken extends TokenItem {
  category: 'spacing';

  /**
   * Pixel value
   */
  px: number;

  /**
   * Rem value
   */
  rem: number;
}

/**
 * Typography token with additional typography-specific properties
 */
export interface TypographyToken extends TokenItem {
  category: 'typography';

  /**
   * Token subcategory (font-size, font-weight, etc.)
   */
  subCategory:
    | 'font-family'
    | 'font-size'
    | 'font-weight'
    | 'line-height'
    | 'letter-spacing';

  /**
   * Computed pixel value (for font sizes)
   */
  computedPx?: number;
}

/**
 * Shadow token with additional shadow-specific properties
 */
export interface ShadowToken extends TokenItem {
  category: 'shadows';

  /**
   * Shadow elevation level
   */
  elevation: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

/**
 * Border token with additional border-specific properties
 */
export interface BorderToken extends TokenItem {
  category: 'borders';

  /**
   * Border subcategory
   */
  subCategory: 'width' | 'radius';

  /**
   * Pixel value
   */
  px?: number;
}

/**
 * Effect token (blur, opacity, transition, z-index)
 */
export interface EffectToken extends TokenItem {
  category: 'effects';

  /**
   * Effect subcategory
   */
  subCategory: 'blur' | 'opacity' | 'transition' | 'z-index';
}

/**
 * Playground state for interactive token testing
 */
export interface PlaygroundState {
  /**
   * Active playground component
   */
  component: ComponentShowcaseItem | null;

  /**
   * Token overrides for live preview
   */
  tokenOverrides: Record<string, string>;

  /**
   * Whether changes are being previewed
   */
  isPreviewMode: boolean;

  /**
   * Code editor content
   */
  editorContent: string;

  /**
   * Whether code editor is visible
   */
  showCodeEditor: boolean;
}

/**
 * Props for the main DesignSystem page component
 */
export interface DesignSystemPageProps {
  /**
   * Initial tab to display
   */
  initialTab?: TabKey;

  /**
   * Initial theme
   */
  initialTheme?: Theme;

  /**
   * Whether to show admin controls
   */
  showAdminControls?: boolean;
}

/**
 * Token comparison result for diff view
 */
export interface TokenComparison {
  /**
   * Token name
   */
  name: string;

  /**
   * Value in theme A
   */
  valueA: string;

  /**
   * Value in theme B
   */
  valueB: string;

  /**
   * Whether values differ
   */
  isDifferent: boolean;

  /**
   * Category
   */
  category: TokenCategory;
}

/**
 * Theme comparison configuration
 */
export interface ThemeComparison {
  /**
   * First theme
   */
  themeA: Theme;

  /**
   * Second theme
   */
  themeB: Theme;

  /**
   * Token differences
   */
  differences: TokenComparison[];

  /**
   * Show only differences
   */
  showDifferencesOnly?: boolean;
}

/**
 * Stored state wrapper with metadata for sessionStorage
 */
export interface StoredDesignSystemState {
  /**
   * Storage format version
   */
  version: string;

  /**
   * When the state was saved
   */
  timestamp: number;

  /**
   * The actual design system state
   */
  state: DesignSystemState;
}

/**
 * Default design system state
 */
export const DEFAULT_DESIGN_SYSTEM_STATE: DesignSystemState = {
  currentTheme: 'default',
  customTokens: {},
  modifiedTokens: new Set(),
  activeTab: 'tokens',
  selectedCategory: 'all',
  searchQuery: '',
  isEditMode: false,
  exportFormat: 'css',
  selectedTokensForExport: [],
};
