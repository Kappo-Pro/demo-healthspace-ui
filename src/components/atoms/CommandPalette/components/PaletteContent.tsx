/**
 * PaletteContent Router Component
 *
 * Routes content based on palette mode and renders appropriate view.
 */

import React from 'react';
import { PaletteMode, PresetCommand, User, UserAction, Program } from '../types';
import { PresetCommandsList } from './PresetCommandsList';
import { UserSearchResults } from './UserSearchResults';
import { UserActionsList } from './UserActionsList';
import { LoadingState, EmptyState } from './StateComponents';
import { ProgramContextContent } from './ProgramContextContent';
import styles from '../styles.module.css';
import { useTranslation } from 'react-i18next';

export interface PaletteContentProps {
  mode: PaletteMode;
  query: string;
  selectedIndex: number;
  presetCommands: PresetCommand[];
  userSearchResults: User[];
  userActions: UserAction[];
  currentUser?: User;
  selectedUser: User | null;
  selectedProgram?: Program | null;
  loading: boolean;
  recentUsers: string[];
  onUserSelect: (user: User) => void;
  onActionExecute: (action: UserAction) => void;
  onCommandExecute: (command: PresetCommand) => void;
  onItemHover: (index: number) => void;
  onNavigate?: (route: string) => void;
  /** Optional callback when admin section is clicked in search results */
  onAdminClick?: (user: User, e: React.MouseEvent) => void;
}

/**
 * Content router that renders different views based on mode
 */
export const PaletteContent = React.memo<PaletteContentProps>(({
  mode,
  query,
  selectedIndex,
  presetCommands,
  userSearchResults,
  userActions,
  currentUser,
  selectedUser,
  selectedProgram,
  loading,
  recentUsers,
  onUserSelect,
  onActionExecute,
  onCommandExecute,
  onItemHover,
  onNavigate,
  onAdminClick,
}) => {
  const { t } = useTranslation();

  const renderContent = () => {
    switch (mode) {
      case 'idle':
        return (
          <PresetCommandsList
            commands={presetCommands}
            query={query}
            selectedIndex={selectedIndex}
            recentUsers={recentUsers}
            onSelect={onCommandExecute}
            onHover={onItemHover}
          />
        );

      case 'userSearch':
        if (loading) {
          return <LoadingState message={t('common.commandPalette.loading.searchingUsers')} />;
        }
        if (userSearchResults.length === 0 && query) {
          return <EmptyState type="no-users" query={query} />;
        }
        return (
          <UserSearchResults
            users={userSearchResults}
            selectedIndex={selectedIndex}
            onSelect={onUserSelect}
            onHover={onItemHover}
            onAdminClick={onAdminClick}
          />
        );

      case 'userContext':
      case 'drawerExpanded': {
        // Filter actions by current user's role
        const filteredActions = userActions.filter((action) => {
          if (!action.requiredRole || !currentUser) return false;
          return action.requiredRole.includes(currentUser.profile.role as unknown);
        });

        if (filteredActions.length === 0) {
          return <EmptyState type="no-actions" />;
        }

        return (
          <UserActionsList
            actions={filteredActions}
            query={query}
            selectedIndex={selectedIndex}
            selectedUser={selectedUser}
            onSelect={onActionExecute}
            onHover={onItemHover}
          />
        );
      }

      case 'programContext':
        if (!selectedProgram || !selectedUser) {
          return <EmptyState type="no-actions" />;
        }

        return (
          <ProgramContextContent
            program={selectedProgram}
            userId={selectedUser.id}
            query={query}
            selectedIndex={selectedIndex}
            onNavigate={(route) => {
              onNavigate?.(route);
            }}
            onItemHover={onItemHover}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.paletteContent} data-mode={mode}>
      {renderContent()}
    </div>
  );
});
