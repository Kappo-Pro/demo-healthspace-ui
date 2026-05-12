/**
 * CommandPalette - Main Export
 *
 * This file exports the new CommandPalette orchestrator (Epic 2).
 * The original implementation has been backed up to index.tsx.backup
 */

export { CommandPalette, CommandPalette as default } from './CommandPalette';
export type { CommandPaletteProps } from './CommandPalette';

// Re-export types for convenience
export type {
  PaletteMode,
  PaletteState,
  PaletteAction,
  PresetCommand,
  User,
  UserAction,
  DrawerContent} from './types';
