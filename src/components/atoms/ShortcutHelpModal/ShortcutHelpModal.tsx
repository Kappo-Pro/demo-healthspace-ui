/**
 * ShortcutHelpModal Component
 *
 * Displays keyboard shortcuts in a categorized, accessible modal.
 * Story 3.4: Desktop Optimization with Keyboard Shortcuts (FR16)
 *
 * Features:
 * - Grouped shortcuts by category
 * - Visual keyboard keys
 * - ARIA labels for screen readers
 * - Focus management
 *
 * Design Token Migration: Phase 2 Complete
 * - All inline styles now use design tokens
 * - Type-safe token access via utility functions
 * - Dark mode support via design tokens
 *
 * @module components/atoms/ShortcutHelpModal
 */

import React from 'react';
import { Modal, Typography, Space, Tag, Row, Col, Divider } from 'antd';
import { useTypedTranslation } from '@hooks/useTypedTranslation';
import { spacingToken, typographyToken } from '@utils/design-system/tokens';
import { UntitledIcon } from '@atoms/Icon';
import './ShortcutHelpModal.css';

const { Title, Text } = Typography;

export interface ShortcutDefinition {
	keys: string | string[];
	description: string;
	category: string;
	requiresSelection?: boolean;
}

export interface ShortcutHelpModalProps {
	/** Whether the modal is visible */
	visible: boolean;

	/** Callback when modal is closed */
	onClose: () => void;

	/** List of shortcuts to display */
	shortcuts: ShortcutDefinition[];

	/** Modal title (default: "Keyboard Shortcuts") */
	title?: string;
}

/**
 * Render keyboard keys as visual badges
 */
const KeyBadge: React.FC<{ keyName: string }> = ({ keyName }) => {
	// Map common key names to symbols
	const keyMap: Record<string, string> = {
		Cmd: '⌘',
		Ctrl: 'Ctrl',
		Shift: '⇧',
		Alt: '⌥',
		Esc: 'Esc',
		Space: 'Space',
	};

	const displayKey = keyMap[keyName] || keyName;

	return (
		<Tag className="shortcut-key-badge" aria-label={`Keyboard key: ${keyName}`}>
			{displayKey}
		</Tag>
	);
};

/**
 * Render a single shortcut row
 */
const ShortcutRow: React.FC<{
	shortcut: ShortcutDefinition;
}> = ({ shortcut }) => {
	const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];

	return (
		<Row
			className="shortcut-row"
			align="middle"
			gutter={16}
			style={{ marginBottom: spacingToken('--spacing-3') }}>
			<Col span={10}>
				<Space size={4}>
					{keys.map((key, index) => (
						<KeyBadge key={`${key}-${index}`} keyName={key} />
					))}
				</Space>
			</Col>
			<Col span={14}>
				<Text>
					{shortcut.description}
					{shortcut.requiresSelection && (
						<Text type="secondary" style={{ marginLeft: spacingToken('--spacing-2') }}>
							(requires selection)
						</Text>
					)}
				</Text>
			</Col>
		</Row>
	);
};

/**
 * ShortcutHelpModal Component
 *
 * @example
 * ```tsx
 * <ShortcutHelpModal
 *   visible={showHelp}
 *   onClose={() => setShowHelp(false)}
 *   shortcuts={ADMIN_TRIAGE_SHORTCUTS}
 * />
 * ```
 */
export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({
	visible,
	onClose,
	shortcuts,
	title = 'Keyboard Shortcuts',
}) => {
	const { t } = useTypedTranslation();

	// Group shortcuts by category
	const groupedShortcuts = shortcuts.reduce(
		(acc, shortcut) => {
			const category = shortcut.category;
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(shortcut);
			return acc;
		},
		{} as Record<string, ShortcutDefinition[]>,
	);

	// Category display names
	const categoryNames: Record<string, string> = {
		navigation: 'Navigation',
		selection: 'Selection',
		actions: 'Actions',
		utilities: 'Utilities',
		'calendar-navigation': 'Calendar Navigation',
		'calendar-views': 'Calendar Views',
		'calendar-actions': 'Calendar Actions',
	};

	return (
		<Modal
			open={visible}
			onCancel={onClose}
			footer={null}
			width={600}
			className="shortcut-help-modal"
			closeIcon={
				<UntitledIcon name="close" aria-label={t('common.shortcuts.modal.close')} />
			}
			aria-labelledby="shortcut-help-title"
			aria-describedby="shortcut-help-description">
			<div className="shortcut-help-content">
				<Title id="shortcut-help-title" level={3} style={{ marginBottom: spacingToken('--spacing-2') }}>
					{title}
				</Title>
				<Text
					id="shortcut-help-description"
					type="secondary"
					style={{ display: 'block', marginBottom: spacingToken('--spacing-6') }}>
					Use these keyboard shortcuts to navigate and perform actions quickly
				</Text>

				{Object.entries(groupedShortcuts).map(
					([category, categoryShortcuts]) => (
						<div key={category} style={{ marginBottom: spacingToken('--spacing-6') }}>
							<Title level={5} style={{ marginBottom: spacingToken('--spacing-4') }}>
								{categoryNames[category] || category}
							</Title>
							{categoryShortcuts.map((shortcut, index) => (
								<ShortcutRow key={`${category}-${index}`} shortcut={shortcut} />
							))}
							<Divider style={{ margin: `${spacingToken('--spacing-4')} 0` }} />
						</div>
					),
				)}

				<Text type="secondary" style={{ fontSize: typographyToken('--font-size-xs') }}>
					<strong>{t('common.shortcuts.modal.note')}</strong> Shortcuts are
					disabled when typing in text inputs. Press <KeyBadge keyName="?" /> to
					show this help anytime.
				</Text>
			</div>
		</Modal>
	);
};

export default ShortcutHelpModal;
