/**
 * CommandList Component
 * Story 4.3: Virtual scrolling command list with keyboard selection
 */

import React, { useEffect, useRef } from 'react';
import { FixedSizeList } from 'react-window';
import { Command } from '../../../lib/commands/types';
import { CommandItem } from './CommandItem';
import { EmptyState } from './EmptyState';
import { useTranslation } from 'react-i18next';

export interface CommandListProps {
	/** Filtered commands to display */
	commands: Command[];
	/** Index of currently selected command */
	selectedIndex: number;
	/** Callback when command selected */
	onSelect: (commandId: string) => void;
	/** Whether to group by category */
	showCategories?: boolean;
}

/**
 * CommandList - Virtual scrolled list of commands with selection highlighting
 * Uses react-window for performance with large command sets (1000+ commands)
 */
export const CommandList: React.FC<CommandListProps> = ({
	commands,
	selectedIndex,
	onSelect,
	showCategories: _showCategories = false,
}) => {
	const { t } = useTranslation();
	const listRef = useRef<FixedSizeList>(null);

	// Auto-scroll to selected item when selectedIndex changes
	useEffect(() => {
		if (
			listRef.current &&
			selectedIndex >= 0 &&
			selectedIndex < commands.length
		) {
			listRef.current.scrollToItem(selectedIndex, 'auto');
		}
	}, [selectedIndex, commands.length]);

	// Empty state when no commands
	if (commands.length === 0) {
		return (
			<EmptyState message={t('common.commandPalette.empty.noCommands.title')} />
		);
	}

	// Calculate list height (max 400px or window height - 200px for header/footer space)
	const listHeight = Math.min(400, window.innerHeight - 200);

	// Row renderer for react-window
	const Row = ({
		index,
		style,
	}: {
		index: number;
		style: React.CSSProperties;
	}) => {
		const command = commands[index];
		return (
			<div style={style}>
				<CommandItem
					command={command}
					isSelected={index === selectedIndex}
					onClick={() => onSelect(command.id)}
				/>
			</div>
		);
	};

	return (
		<FixedSizeList
			ref={listRef}
			height={listHeight}
			itemCount={commands.length}
			itemSize={60} // Fixed 60px height per item
			width="100%"
			role="listbox"
			aria-label={t('common.commandPalette.ariaLabels.commandResults')}>
			{Row}
		</FixedSizeList>
	);
};
