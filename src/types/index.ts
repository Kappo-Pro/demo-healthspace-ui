/**
 * src/types/index.ts
 *
 * Barrel export for all domain-specific type files
 *
 * This provides backward compatibility for existing imports:
 * - Before: import { User } from '@stores/interfaces'
 * - After: import { User } from '@types'
 *
 * Total types: 425
 * Generated: 2025-10-23
 */

// patient.ts - 79 types
export * from './patient';

// clinical.ts - 209 types
export * from './clinical';

// redux.ts - 2 types
export * from './redux';

// api.ts - 25 types
export * from './api';

// forms.ts - 5 types
export * from './forms';

// ui.ts - 31 types
export * from './ui';

// survey.ts - 11 types
export * from './survey';

// library.ts - 1 types
export * from './library';

// reports.ts - 5 types
export * from './reports';

// ai.ts - 2 types
export * from './ai';

// strapi.ts - 5 types
export * from './strapi';

// common.ts - 10 types
export * from './common';

/**
 * DEPRECATION NOTICE:
 *
 * The monolithic interfaces.ts file has been split into domain-specific files.
 * Please update your imports to use the new structure:
 *
 * ✅ Recommended: import { User } from '@types/patient'
 * ⚠️  Acceptable: import { User } from '@types'
 * ❌ Deprecated: import { User } from '@stores/interfaces'
 *
 * See docs/implementation-reports/0-draft/tech-debt-auditor/hot-001-completion.md
 * for migration guide.
 */
