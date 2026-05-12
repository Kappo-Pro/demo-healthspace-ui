/**
 * UserPreferences Component
 *
 * Comprehensive user preferences panel for theme, sidebar behavior,
 * notifications, language, keyboard shortcuts, and data export preferences.
 */

import React, { useState, useEffect } from 'react';
import { Drawer,
 Tabs,
 Switch,
 Select,
 Radio,
 Button,
 Divider,
 message,
 Space,
 Typography } from 'antd';

const { Title } = Typography;
import type { TabsProps } from 'antd';
import { UntitledIcon } from '@atoms/Icon';
import { DRAWER_WIDTHS } from '@atoms/Drawers/drawerConfig';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

const { Option } = Select;

export interface UserPreferencesData {
 // Theme
 theme: 'default' | 'light' | 'dark' | 'vibrant';

 // Sidebar
 sidebarBehavior: 'always-expanded' | 'always-collapsed' | 'auto';
 sidebarPosition: 'left' | 'right';

 // Views
 defaultView: 'dashboard' | 'patients' | 'analytics' | 'tools';
 compactMode: boolean;

 // Notifications
 enableNotifications: boolean;
 notificationSound: boolean;
 emailNotifications: boolean;
 desktopNotifications: boolean;

 // Language
 language: 'en' | 'es' | 'fr' | 'de' | 'zh';

 // Keyboard
 keyboardShortcutsEnabled: boolean;
 customShortcuts: Record<string, string>;

 // Data Export
 exportFormat: 'csv' | 'json' | 'xlsx' | 'pdf';
 exportIncludeMetadata: boolean;
}

const DEFAULT_PREFERENCES: UserPreferencesData = {
 theme: 'default',
 sidebarBehavior: 'auto',
 sidebarPosition: 'left',
 defaultView: 'dashboard',
 compactMode: false,
 enableNotifications: true,
 notificationSound: true,
 emailNotifications: true,
 desktopNotifications: false,
 language: 'en',
 keyboardShortcutsEnabled: true,
 customShortcuts: {},
 exportFormat: 'csv',
 exportIncludeMetadata: true,
};

interface UserPreferencesProps {
 /** Visibility state */
 open: boolean;
 /** Close handler */
 onClose: () => void;
 /** Save handler */
 onSave?: (preferences: UserPreferencesData) => void;
 /** Initial preferences */
 initialPreferences?: Partial<UserPreferencesData>;
}

/**
 * UserPreferences Component
 */
export const UserPreferences: React.FC<UserPreferencesProps> = ({
 open,
 onClose,
 onSave,
 initialPreferences = {},
}) => {
 const { t } = useTranslation();
 const [preferences, setPreferences] = useState<UserPreferencesData>({
 ...DEFAULT_PREFERENCES,
 ...initialPreferences,
 });

 const [hasChanges, setHasChanges] = useState(false);

 // Load preferences from localStorage
 useEffect(() => {
 const saved = localStorage.getItem('userPreferences');
 if (saved) {
 try {
 const parsed = JSON.parse(saved);
 setPreferences({ ...DEFAULT_PREFERENCES, ...parsed, ...initialPreferences });
 } catch (error) {
  // Silently ignore invalid JSON and use defaults
  console.warn('Failed to parse user preferences from localStorage:', error);
 }
 }
 }, [initialPreferences]);

 // Update preference
 const updatePreference = <K extends keyof UserPreferencesData>(
 key: K,
 value: UserPreferencesData[K]
 ) => {
 setPreferences(prev => ({ ...prev, [key]: value }));
 setHasChanges(true);
 };

 // Save preferences
 const handleSave = () => {
 localStorage.setItem('userPreferences', JSON.stringify(preferences));
 onSave?.(preferences);
 message.success(t('common.preferences.messages.savedSuccessfully'));
 setHasChanges(false);
 };

 // Reset to defaults
 const handleReset = () => {
 setPreferences(DEFAULT_PREFERENCES);
 setHasChanges(true);
 message.info(t('common.preferences.messages.resetToDefaults'));
 };

 const tabItems: TabsProps['items'] = [
 {
 key: 'theme',
 label: (
 <span>
 <UntitledIcon name="settings" size={16} /> {t('common.preferences.tabs.theme')}
 </span>
 ),
 children: (
 <div className={styles.tabContent}>
 <div className={styles.section}>
 <Title level={4}>{t('common.preferences.theme.sectionTitle')}</Title>
 <p className={styles.description}>
 {t('common.preferences.theme.description')}
 </p>
 <Radio.Group
 value={preferences.theme}
 onChange={(e) => updatePreference('theme', e.target.value)}
 className={styles.themeRadio}
 >
 <Radio.Button value="default">{t('common.preferences.theme.options.default')}</Radio.Button>
 <Radio.Button value="light">{t('common.preferences.theme.options.light')}</Radio.Button>
 <Radio.Button value="dark">{t('common.preferences.theme.options.dark')}</Radio.Button>
 <Radio.Button value="vibrant">{t('common.preferences.theme.options.vibrant')}</Radio.Button>
 </Radio.Group>
 </div>

 <Divider />

 <div className={styles.section}>
 <Title level={4}>{t('common.preferences.theme.displayMode')}</Title>
 <div className={styles.settingRow}>
 <div>
 <div className={styles.settingLabel}>{t('common.preferences.theme.compactMode.label')}</div>
 <div className={styles.settingDescription}>
 {t('common.preferences.theme.compactMode.description')}
 </div>
 </div>
 <Switch
 checked={preferences.compactMode}
 onChange={(checked) => updatePreference('compactMode', checked)}
 />
 </div>
 </div>
 </div>
 ),
 },
 {
 key: 'layout',
 label: (
 <span>
 <UntitledIcon name="dashboard" size={16} /> {t('common.preferences.tabs.layout')}
 </span>
 ),
 children: (
 <div className={styles.tabContent}>
 <div className={styles.section}>
 <Title level={4}>{t('common.preferences.layout.sidebarBehavior.title')}</Title>
 <p className={styles.description}>
 {t('common.preferences.layout.sidebarBehavior.description')}
 </p>
 <Select
 value={preferences.sidebarBehavior}
 onChange={(value) => updatePreference('sidebarBehavior', value)}
 className="w-full"
 >
 <Option value="always-expanded">{t('common.preferences.layout.sidebarBehavior.options.alwaysExpanded')}</Option>
 <Option value="always-collapsed">{t('common.preferences.layout.sidebarBehavior.options.alwaysCollapsed')}</Option>
 <Option value="auto">{t('common.preferences.layout.sidebarBehavior.options.auto')}</Option>
 </Select>
 </div>

 <Divider />

 <div className={styles.section}>
 <Title level={4}>{t('common.preferences.layout.defaultView.title')}</Title>
 <p className={styles.description}>
 {t('common.preferences.layout.defaultView.description')}
 </p>
 <Select
 value={preferences.defaultView}
 onChange={(value) => updatePreference('defaultView', value)}
 className="w-full"
 >
 <Option value="dashboard">{t('common.preferences.layout.defaultView.options.dashboard')}</Option>
 <Option value="patients">{t('common.preferences.layout.defaultView.options.patients')}</Option>
 <Option value="analytics">{t('common.preferences.layout.defaultView.options.analytics')}</Option>
 <Option value="tools">{t('common.preferences.layout.defaultView.options.tools')}</Option>
 </Select>
 </div>
 </div>
 ),
 },
 {
 key: 'notifications',
 label: (
 <span>
 <UntitledIcon name="bell" size={16} /> {t('common.preferences.tabs.notifications')}
 </span>
 ),
 children: (
 <div className={styles.tabContent}>
 <div className={styles.section}>
 <div className={styles.settingRow}>
 <div>
 <div className={styles.settingLabel}>{t('common.preferences.notifications.enable.label')}</div>
 <div className={styles.settingDescription}>
 {t('common.preferences.notifications.enable.description')}
 </div>
 </div>
 <Switch
 checked={preferences.enableNotifications}
 onChange={(checked) => updatePreference('enableNotifications', checked)}
 />
 </div>

 <div className={styles.settingRow}>
 <div>
 <div className={styles.settingLabel}>{t('common.preferences.notifications.sound.label')}</div>
 <div className={styles.settingDescription}>
 {t('common.preferences.notifications.sound.description')}
 </div>
 </div>
 <Switch
 checked={preferences.notificationSound}
 onChange={(checked) => updatePreference('notificationSound', checked)}
 disabled={!preferences.enableNotifications}
 />
 </div>

 <div className={styles.settingRow}>
 <div>
 <div className={styles.settingLabel}>{t('common.preferences.notifications.email.label')}</div>
 <div className={styles.settingDescription}>
 {t('common.preferences.notifications.email.description')}
 </div>
 </div>
 <Switch
 checked={preferences.emailNotifications}
 onChange={(checked) => updatePreference('emailNotifications', checked)}
 />
 </div>

 <div className={styles.settingRow}>
 <div>
 <div className={styles.settingLabel}>{t('common.preferences.notifications.desktop.label')}</div>
 <div className={styles.settingDescription}>
 {t('common.preferences.notifications.desktop.description')}
 </div>
 </div>
 <Switch
 checked={preferences.desktopNotifications}
 onChange={(checked) => updatePreference('desktopNotifications', checked)}
 />
 </div>
 </div>
 </div>
 ),
 },
 {
 key: 'language',
 label: (
 <span>
 <UntitledIcon name="global" size={16} /> {t('common.preferences.tabs.language')}
 </span>
 ),
 children: (
 <div className={styles.tabContent}>
 <div className={styles.section}>
 <Title level={4}>{t('common.preferences.language.title')}</Title>
 <p className={styles.description}>
 {t('common.preferences.language.description')}
 </p>
 <Select
 value={preferences.language}
 onChange={(value) => updatePreference('language', value)}
 className="w-full"
 >
 <Option value="en">{t('common.preferences.language.options.en')}</Option>
 <Option value="es">{t('common.preferences.language.options.es')}</Option>
 <Option value="fr">{t('common.preferences.language.options.fr')}</Option>
 <Option value="de">{t('common.preferences.language.options.de')}</Option>
 <Option value="zh">{t('common.preferences.language.options.zh')}</Option>
 </Select>
 </div>
 </div>
 ),
 },
 {
 key: 'keyboard',
 label: (
 <span>
 <UntitledIcon name="key" size={16} /> {t('common.preferences.tabs.keyboard')}
 </span>
 ),
 children: (
 <div className={styles.tabContent}>
 <div className={styles.section}>
 <div className={styles.settingRow}>
 <div>
 <div className={styles.settingLabel}>{t('common.preferences.keyboard.enable.label')}</div>
 <div className={styles.settingDescription}>
 {t('common.preferences.keyboard.enable.description')}
 </div>
 </div>
 <Switch
 checked={preferences.keyboardShortcutsEnabled}
 onChange={(checked) => updatePreference('keyboardShortcutsEnabled', checked)}
 />
 </div>
 </div>

 <Divider />

 <div className={styles.section}>
 <Title level={4}>{t('common.preferences.keyboard.customization.title')}</Title>
 <p className={styles.description}>
 {t('common.preferences.keyboard.customization.description')}
 </p>
 </div>
 </div>
 ),
 },
 {
 key: 'export',
 label: (
 <span>
 <UntitledIcon name="share" size={16} /> {t('common.preferences.tabs.export')}
 </span>
 ),
 children: (
 <div className={styles.tabContent}>
 <div className={styles.section}>
 <Title level={4}>{t('common.preferences.export.defaultFormat.title')}</Title>
 <p className={styles.description}>
 {t('common.preferences.export.defaultFormat.description')}
 </p>
 <Radio.Group
 value={preferences.exportFormat}
 onChange={(e) => updatePreference('exportFormat', e.target.value)}
 >
 <Radio value="csv">{t('common.preferences.export.defaultFormat.options.csv')}</Radio>
 <Radio value="json">{t('common.preferences.export.defaultFormat.options.json')}</Radio>
 <Radio value="xlsx">{t('common.preferences.export.defaultFormat.options.xlsx')}</Radio>
 <Radio value="pdf">{t('common.preferences.export.defaultFormat.options.pdf')}</Radio>
 </Radio.Group>
 </div>

 <Divider />

 <div className={styles.section}>
 <div className={styles.settingRow}>
 <div>
 <div className={styles.settingLabel}>{t('common.preferences.export.includeMetadata.label')}</div>
 <div className={styles.settingDescription}>
 {t('common.preferences.export.includeMetadata.description')}
 </div>
 </div>
 <Switch
 checked={preferences.exportIncludeMetadata}
 onChange={(checked) => updatePreference('exportIncludeMetadata', checked)}
 />
 </div>
 </div>
 </div>
 ),
 },
 ];

 return (
 <Drawer
 title={
 <div className={styles.drawerTitle}>
 <UntitledIcon name="settings" size={20} />
 <span>{t('common.preferences.title')}</span>
 </div>
 }
 open={open}
 onClose={onClose}
 width={DRAWER_WIDTHS.MEDIUM}
 className={styles.preferencesDrawer}
 footer={
 <div className={styles.footer}>
 <Button onClick={onClose}>{t('common.preferences.cancel')}</Button>
 <Space>
 <Button
 icon={<UntitledIcon name="reload" size={16} />}
 onClick={handleReset}
 >
 {t('common.preferences.reset')}
 </Button>
 <Button
 type="primary"
 icon={<UntitledIcon name="save" size={16} />}
 onClick={handleSave}
 disabled={!hasChanges}
 >
 {t('common.preferences.saveChanges')}
 </Button>
 </Space>
 </div>
 }
 >
 <Tabs
 defaultActiveKey="theme"
 className={styles.tabs}
 items={tabItems}
 />
 </Drawer>
 );
};

export default UserPreferences;
