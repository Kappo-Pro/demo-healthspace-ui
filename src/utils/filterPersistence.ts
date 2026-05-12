/**
 * Filter Persistence Utility
 *
 * Save and load filter preferences to/from localStorage
 */

const FILTER_STORAGE_KEY = 'activityStreamFilters';

export interface FilterPreferences {
  activityTypes: string[];
  statuses: string[];
  dateRangePreset?: string;
  customDateRange?: {
    start: string;
    end: string;
  };
}

export function saveFilters(filters: FilterPreferences): void {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    // Silently fail if localStorage is unavailable
    // This is expected in private browsing, SSR, or when storage quota is exceeded
    if (process.env.NODE_ENV === 'development') {
      console.warn('[FilterPersistence] Failed to save filters:', error);
    }
  }
}

export function loadFilters(): FilterPreferences | null {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

export function clearSavedFilters(): void {
  try {
    localStorage.removeItem(FILTER_STORAGE_KEY);
  } catch (error) {
    // Silently fail if localStorage is unavailable
    // This is expected in private browsing, SSR, or when storage quota is exceeded
    if (process.env.NODE_ENV === 'development') {
      console.warn('[FilterPersistence] Failed to clear filters:', error);
    }
  }
}
