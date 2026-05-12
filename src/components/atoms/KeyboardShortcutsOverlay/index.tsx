/**
 * KeyboardShortcutsOverlay Component
 *
 * Shows all available keyboard shortcuts in a modal overlay.
 * Triggered by Cmd+/ or ? key. Groups shortcuts by category.
 */

import React, { useState } from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { MODAL_SIZES } from '@atoms/Modal/modalConfig';
import { UntitledIcon } from '@atoms/Icon';
import { useKeyboardShortcut } from '../../../hooks/useKeyboardNavigation';
import styles from './styles.module.css';

export interface ShortcutDefinition {
	keys: string | string[];
	description: string;
	category:
		| 'global'
		| 'navigation'
		| 'actions'
		| 'list'
		| 'calendar-navigation'
		| 'calendar-views'
		| 'calendar-actions';
	icon?: React.ReactNode;
}

interface KeyboardShortcutsOverlayProps {
	/** Additional custom shortcuts */
	customShortcuts?: ShortcutDefinition[];
}

/**
 * Default keyboard shortcuts
 */
const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
	// Global
	{
		keys: ['Cmd', 'K'],
		description: 'Open command palette',
		category: 'global',
		icon: <UntitledIcon name="search" size={14} />,
	},
	{
		keys: ['Cmd', '/'],
		description: 'Show keyboard shortcuts',
		category: 'global',
		icon: <UntitledIcon name="infoCircle" size={14} />,
	},
	{
		keys: '[',
		description: 'Collapse sidebar',
		category: 'global',
		icon: <UntitledIcon name="close" size={14} />,
	},
	{
		keys: ']',
		description: 'Expand sidebar',
		category: 'global',
		icon: <UntitledIcon name="plus" size={14} />,
	},
	{
		keys: 'Esc',
		description: 'Close modal/drawer',
		category: 'global',
		icon: <UntitledIcon name="close" size={14} />,
	},

	// Navigation
	{
		keys: ['g', 'h'],
		description: 'Go to home',
		category: 'navigation',
		icon: <UntitledIcon name="home" size={14} />,
	},
	{
		keys: ['g', 'p'],
		description: 'Go to patients',
		category: 'navigation',
		icon: <UntitledIcon name="user" size={14} />,
	},
	{
		keys: ['g', 'a'],
		description: 'Go to analytics',
		category: 'navigation',
		icon: <UntitledIcon name="barChart" size={14} />,
	},
	{
		keys: ['g', 't'],
		description: 'Go to tools',
		category: 'navigation',
		icon: <UntitledIcon name="tool" size={14} />,
	},
	{
		keys: ['g', 's'],
		description: 'Go to settings',
		category: 'navigation',
		icon: <UntitledIcon name="settings" size={14} />,
	},

	// Actions
	{
		keys: 'c',
		description: 'Create (context-dependent)',
		category: 'actions',
		icon: <UntitledIcon name="plus" size={14} />,
	},
	{
		keys: '/',
		description: 'Focus search',
		category: 'actions',
		icon: <UntitledIcon name="search" size={14} />,
	},
	{
		keys: '?',
		description: 'Show help',
		category: 'actions',
		icon: <UntitledIcon name="infoCircle" size={14} />,
	},

	// List Navigation
	{
		keys: ['j', '↓'],
		description: 'Next item',
		category: 'list',
	},
	{
		keys: ['k', '↑'],
		description: 'Previous item',
		category: 'list',
	},
	{
		keys: 'Enter',
		description: 'Select item',
		category: 'list',
	},
	{
		keys: 'Space',
		description: 'Toggle selection',
		category: 'list',
	},
];

/**
 * KeyboardShortcutsOverlay Component
 */
export const KeyboardShortcutsOverlay: React.FC<
	KeyboardShortcutsOverlayProps
> = ({ customShortcuts = [] }) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);

	const allShortcuts = [...DEFAULT_SHORTCUTS, ...customShortcuts];

	// Group shortcuts by category
	const groupedShortcuts = allShortcuts.reduce(
		(acc, shortcut) => {
			if (!acc[shortcut.category]) {
				acc[shortcut.category] = [];
			}
			acc[shortcut.category].push(shortcut);
			return acc;
		},
		{} as Record<string, ShortcutDefinition[]>,
	);

	// Register shortcut to open overlay
	useKeyboardShortcut('cmd+/', () => setIsOpen(true));
	useKeyboardShortcut('?', () => setIsOpen(true));

	const getCategoryLabel = (category: string) => {
		switch (category) {
			case 'global':
				return 'Global';
			case 'navigation':
				return 'Navigation';
			case 'actions':
				return 'Actions';
			case 'list':
				return 'List Navigation';
			case 'calendar-navigation':
				return 'Calendar Navigation';
			case 'calendar-views':
				return 'Calendar Views';
			case 'calendar-actions':
				return 'Calendar Actions';
			default:
				return category;
		}
	};

	const renderKeys = (keys: string | string[]) => {
		const keyArray = Array.isArray(keys) ? keys : [keys];

		return (
			<div className={styles.keysContainer}>
				{keyArray.map((key, index) => (
					<React.Fragment key={index}>
						<kbd className={styles.key}>{key}</kbd>
						{index < keyArray.length - 1 && (
							<span className={styles.keySeparator}>then</span>
						)}
					</React.Fragment>
				))}
			</div>
		);
	};

	return (
		<Modal
			title={
				<div className={styles.modalTitle}>
					<UntitledIcon name="infoCircle" size={16} />
					<span>{t('common.keyboardShortcuts')}</span>
				</div>
			}
			open={isOpen}
			onCancel={() => setIsOpen(false)}
			footer={null}
			width={MODAL_SIZES.LARGE}
			className={styles.shortcutsModal}>
			<div className={styles.shortcutsContainer}>
				{Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
					<div key={category} className={styles.shortcutSection}>
						<h3 className={styles.sectionTitle}>
							{getCategoryLabel(category)}
						</h3>

						<div className={styles.shortcutList}>
							{shortcuts.map((shortcut, index) => (
								<div key={index} className={styles.shortcutItem}>
									<div className={styles.shortcutDescription}>
										{shortcut.icon && (
											<span className={styles.shortcutIcon}>
												{shortcut.icon}
											</span>
										)}
										<span>{shortcut.description}</span>
									</div>
									{renderKeys(shortcut.keys)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			<div className={styles.footer}>
				<div className={styles.footerNote}>
					Press <kbd className={styles.key}>{t('common.escKey')}</kbd> to close
				</div>
				<div className={styles.footerHint}>
					Shortcuts work when you're not typing in an input field
				</div>
			</div>
		</Modal>
	);
};

export default KeyboardShortcutsOverlay;
