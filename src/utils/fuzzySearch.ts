/**
 * fuzzySearch
 *
 * Fuzzy search utility using fuse.js for activity search
 *
 * Features:
 * - Searches across program names, notes, exercise names
 * - Fuzzy matching with typo tolerance (threshold: 0.3)
 * - Returns matches with highlighting indices
 */

import Fuse from 'fuse.js';
import type { ScheduledActivity } from '@services/mockSchedulingApi';

export interface SearchMatch {
  indices: [number, number][];
  value?: string;
  key?: string;
}

export interface SearchResult {
  item: ScheduledActivity;
  matches?: SearchMatch[];
  score?: number;
}

const SEARCH_OPTIONS: Fuse.IFuseOptions<ScheduledActivity> = {
  keys: [
    { name: 'title', weight: 2 }, // Title is most important
    { name: 'notes', weight: 1.5 },
    { name: 'program.name', weight: 1.2 },
    { name: 'program.exercises.name', weight: 1 },
  ],
  threshold: 0.3, // Lower = stricter matching (0.0 = exact, 1.0 = match anything)
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  ignoreLocation: true, // Search entire string, not just beginning
};

/**
 * Perform fuzzy search on activities
 */
export function searchActivities(
  activities: ScheduledActivity[],
  query: string
): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return activities.map(item => ({ item }));
  }

  const fuse = new Fuse(activities, SEARCH_OPTIONS);
  const results = fuse.search(query.trim());

  return results as SearchResult[];
}

/**
 * Highlight search terms in text
 */
export function highlightMatches(text: string, matches?: SearchMatch[]): string {
  if (!matches || matches.length === 0) return text;

  // Sort indices in reverse order to avoid offset issues
  const allIndices = matches.flatMap(m => m.indices).sort((a, b) => b[0] - a[0]);

  let highlighted = text;
  for (const [start, end] of allIndices) {
    highlighted =
      highlighted.slice(0, start) +
      `<mark>${highlighted.slice(start, end + 1)}</mark>` +
      highlighted.slice(end + 1);
  }

  return highlighted;
}

/**
 * Get match summary for display
 */
export function getMatchSummary(matches?: SearchMatch[]): string {
  if (!matches || matches.length === 0) return '';

  const fields = matches.map(m => {
    if (m.key === 'title') return 'Title';
    if (m.key === 'notes') return 'Notes';
    if (m.key?.includes('program.name')) return 'Program';
    if (m.key?.includes('exercises')) return 'Exercise';
    return '';
  }).filter(Boolean);

  if (fields.length === 0) return '';
  return `Matched in: ${[...new Set(fields)].join(', ')}`;
}
