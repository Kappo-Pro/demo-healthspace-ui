/**
 * PresetCommandsList Component
 *
 * Displays preset navigation/action commands with fuzzy search filtering.
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { UntitledIcon } from '@atoms/Icon';
import { PresetCommand } from '../types';
import { formatShortcut } from '../utils';
import { fuzzyMatch } from '@hooks/useFuzzySearch';
import styles from '../styles.module.css';

export interface PresetCommandsListProps {
  commands: PresetCommand[];
  query: string;
  selectedIndex: number;
  recentUsers: string[];
  onSelect: (command: PresetCommand) => void;
  onHover: (index: number) => void;
}

/**
 * Preset commands list with grouping and fuzzy search
 */
export const PresetCommandsList = React.memo<PresetCommandsListProps>(({
  commands,
  query,
  selectedIndex,
  recentUsers,
  onSelect,
  onHover,
}) => {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Filter and score commands
  const filteredCommands = useMemo(() => {
    if (!query) return commands;

    return commands
      .map(cmd => ({
        command: cmd,
        score: fuzzyMatch(query, cmd.label, cmd.keywords),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ command }) => command);
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, PresetCommand[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'action': return 'Actions';
      case 'settings': return 'Settings';
      case 'quick': return 'Quick Actions';
      default: return 'Other';
    }
  };

  return (
    <div className={styles.commandsList}>
      {!query && recentUsers.length > 0 && (
        <div className={styles.commandGroup}>
          <div className={styles.groupHeader}>
            <UntitledIcon name="clock" /> Recent
          </div>
          {/* Recent users will be rendered here in future */}
        </div>
      )}

      {Object.entries(groupedCommands).map(([category, cmds]) => (
        <div key={category} className={styles.commandGroup}>
          {query && (
            <div className={styles.groupHeader}>
              {getCategoryLabel(category)}
            </div>
          )}

          {cmds.map((command) => {
            const globalIndex = filteredCommands.indexOf(command);
            const isSelected = globalIndex === selectedIndex;

            return (
              <div
                key={command.id}
                ref={isSelected ? selectedRef : null}
                className={`${styles.commandItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => onSelect(command)}
                onMouseEnter={(e) => {
                  // Only update on actual mouse movement, not on initial render or focus changes
                  if (e.movementX !== 0 || e.movementY !== 0) {
                    onHover(globalIndex);
                  }
                }}
                role="option"
                aria-selected={isSelected}
              >
                {command.icon && (
                  <span className={styles.commandIcon}>{command.icon}</span>
                )}
                <div className={styles.commandContent}>
                  <div className={styles.commandLabel}>{command.label}</div>
                  {command.description && (
                    <div className={styles.commandDescription}>
                      {command.description}
                    </div>
                  )}
                </div>
                {command.shortcut && (
                  <kbd className={styles.kbd}>{formatShortcut(command.shortcut)}</kbd>
                )}
                {isSelected && (
                  <kbd className={styles.kbd}>
                    <UntitledIcon name="cornerDownLeft" size={16} />
                  </kbd>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {filteredCommands.length === 0 && (
        <div className={styles.noResults}>
          No commands found for "{query}"
        </div>
      )}
    </div>
  );
});
