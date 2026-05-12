/**
 * Design System Demo Page
 *
 * Interactive demo and documentation for VitalFlow's design system.
 * Provides live token editing, theme switching, component showcase,
 * and export functionality.
 *
 * @module DesignSystem
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Tabs, Button, Typography, Space, message } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { useTheme } from '@providers/ThemeProvider';
import sessionManager from './utils/sessionManager';
import { applyStoredModifications, resetTokens } from './utils/tokenHelpers';
import { exportAsCSS, exportAsJSON } from './utils/exportHelpers';
import type { DesignSystemState } from './types';
import BrandTab from './components/BrandTab';
import ComponentsTab from './components/ComponentsTab';
import AntDesignTab from './components/AntDesignTab';
import { OverviewTab } from './components/OverviewTab';
import { TokensTab } from './components/TokensTab';
import ThemeControls from './components/ThemeControls';
import ExportModal from './components/ExportModal';
import './DesignSystem.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

/**
 * Tab keys for main navigation
 */
type TabKey = 'overview' | 'tokens' | 'brand' | 'components' | 'antd';

/**
 * Export format options
 */
type ExportFormat = 'css' | 'json';

/**
 * Props for DesignSystem page component
 */
export interface DesignSystemPageProps {
  /**
   * Initial tab to display
   */
  initialTab?: TabKey;

  /**
   * Whether to show admin controls (export, reset)
   */
  showAdminControls?: boolean;
}

/**
 * Main DesignSystem page component
 *
 * Responsive dashboard layout with sidebar theme controls and tabbed content area.
 * Integrates with ThemeProvider for live theme switching and sessionManager
 * for persisting customizations.
 *
 * @example
 * ```tsx
 * <DesignSystem initialTab="tokens" showAdminControls={true} />
 * ```
 */
const DesignSystem: React.FC<DesignSystemPageProps> = ({
  initialTab = 'overview',
  showAdminControls = true,
}) => {
  // Theme integration
  const { theme, setTheme, isDark } = useTheme();

  // State management
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [siderCollapsed, setSiderCollapsed] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [state, setState] = useState<DesignSystemState>(() =>
    sessionManager.loadState()
  );
  const [hasModifications, setHasModifications] = useState<boolean>(false);

  /**
   * Apply stored token modifications on mount
   */
  useEffect(() => {
    applyStoredModifications();
  }, []);

  /**
   * Sync state to sessionStorage when it changes
   */
  useEffect(() => {
    sessionManager.saveState(state);
  }, [state]);

  /**
   * Track if user has made modifications
   */
  useEffect(() => {
    const hasChanges = sessionManager.hasStoredState();
    setHasModifications(hasChanges);
  }, [state]);

  /**
   * Handle tab change
   */
  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key as TabKey);
  }, []);

  /**
   * Handle theme change from sidebar controls
   */
  const _handleThemeChange = useCallback(
    (newTheme: 'light' | 'dark' | 'default' | 'vibrant') => {
      setTheme(newTheme);
      setState((prev) => ({
        ...prev,
        darkMode: newTheme === 'dark' || newTheme === 'vibrant',
      }));
    },
    [setTheme]
  );

  /**
   * Export design system as CSS
   */
  const handleExportCSS = useCallback(() => {
    try {
      const cssContent = exportAsCSS({
        includeComments: true,
        includeMetadata: true,
      });

      // Create download
      const blob = new Blob([cssContent], { type: 'text/css' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vitalflow-design-tokens-${Date.now()}.css`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success('Design tokens exported as CSS');
    } catch (error) {
      message.error('Failed to export design tokens');
    }
  }, []);

  /**
   * Export design system as JSON
   */
  const handleExportJSON = useCallback(() => {
    try {
      const jsonContent = exportAsJSON({
        includeMetadata: true,
        prettify: true,
      });

      // Create download
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vitalflow-design-tokens-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success('Design tokens exported as JSON');
    } catch (error) {
      message.error('Failed to export design tokens');
    }
  }, []);

  /**
   * Reset all customizations
   */
  const handleReset = useCallback(() => {
    resetTokens();
    sessionManager.clearState();
    setState(sessionManager.loadState());
    setHasModifications(false);
    message.success('All customizations reset');
  }, []);

  /**
   * Handle sider collapse
   */
  const handleSiderCollapse = useCallback((collapsed: boolean) => {
    setSiderCollapsed(collapsed);
  }, []);

  /**
   * Tab items configuration
   */
  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <OverviewTab
          currentTheme={theme}
          modifiedTokens={state.modifiedTokens}
          onNavigate={(tabKey) => setActiveTab(tabKey as TabKey)}
        />
      ),
    },
    {
      key: 'tokens',
      label: 'Design Tokens',
      children: (
        <TokensTab
          modifiedTokens={state.modifiedTokens}
          onTokenSelect={() => {
            // Token selection handler - currently no action needed
          }}
        />
      ),
    },
    {
      key: 'brand',
      label: 'Brand',
      children: <BrandTab currentTheme={theme} />,
    },
    {
      key: 'components',
      label: 'Components',
      children: <ComponentsTab currentTheme={theme} showThemeVariations={false} />,
    },
    {
      key: 'antd',
      label: 'Ant Design',
      children: <AntDesignTab currentTheme={theme} />,
    },
  ];

  return (
    <Layout className="design-system-page" data-theme={theme}>
      {/* Page Header */}
      <Header className="design-system-header">
        <div className="design-system-header-content">
          <Title level={3} className="design-system-title">
            VitalFlow Design System
          </Title>

          {showAdminControls && (
            <Space className="design-system-actions">
              <Button
                icon={<UntitledIcon name="download" />}
                onClick={handleExportCSS}
                aria-label="Export as CSS"
              >
                Export CSS
              </Button>

              <Button
                icon={<UntitledIcon name="upload" />}
                onClick={handleExportJSON}
                aria-label="Export as JSON"
              >
                Export JSON
              </Button>

              {hasModifications && (
                <Button
                  icon={<UntitledIcon name="refresh-cw" />}
                  onClick={handleReset}
                  danger
                  aria-label="Reset all customizations"
                >
                  Reset
                </Button>
              )}
            </Space>
          )}
        </div>
      </Header>

      {/* Main Layout */}
      <Layout className="design-system-layout">
        {/* Sidebar - Theme Controls */}
        <Sider
          className="design-system-sider"
          width={300}
          collapsedWidth={0}
          collapsible
          collapsed={siderCollapsed}
          onCollapse={handleSiderCollapse}
          breakpoint="md"
          theme={isDark ? 'dark' : 'light'}
          aria-label="Theme controls sidebar"
        >
          <ThemeControls
            onExport={() => setShowExportModal(true)}
            modifiedTokens={state.modifiedTokens}
            onTokenChange={(tokenName, value) => {
              // Handle token change
              setState(prev => ({
                ...prev,
                customTokens: { ...prev.customTokens, [tokenName]: value },
                modifiedTokens: new Set([...prev.modifiedTokens, tokenName])
              }));
            }}
          />
        </Sider>

        {/* Content Area - Tabs */}
        <Content className="design-system-content">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="design-system-tabs"
            size="large"
            type="card"
            aria-label="Design system navigation tabs"
          />
        </Content>
      </Layout>

      <ExportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        currentTheme={theme}
        modifiedTokens={state.modifiedTokens}
        customTokens={state.customTokens}
      />
    </Layout>
  );
};

export default DesignSystem;

/**
 * Named exports for testing and composition
 */
export type { TabKey, ExportFormat };
