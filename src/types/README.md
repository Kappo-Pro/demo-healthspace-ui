# Type Definitions

This directory contains domain-specific TypeScript type definitions, migrated from the monolithic `src/stores/interfaces.ts` file.

## Structure

- **patient.ts** (79 types) - Patient and user management types
- **clinical.ts** (209 types) - Clinical assessment types (ROM, Rehab, Posture, Pain)
- **redux.ts** (2 types) - Redux store and state types
- **api.ts** (25 types) - API request/response and pagination types
- **forms.ts** (5 types) - Form-related types
- **ui.ts** (31 types) - UI component prop types
- **survey.ts** (11 types) - Survey and questionnaire types
- **library.ts** (1 types) - Exercise library types
- **reports.ts** (5 types) - Report generation types
- **ai.ts** (2 types) - AI assistant types
- **strapi.ts** (5 types) - Strapi CMS integration types
- **common.ts** (10 types) - Common enums and utility types

**Total:** 425 type declarations

## Usage

### Recommended (Direct Import)
```typescript
import { User, ProfileData } from '@types/patient';
import { IRomSession, RehabProgram } from '@types/clinical';
import { PaginationDefaultResponse } from '@types/api';
```

### Acceptable (Barrel Import)
```typescript
import { User, IRomSession, PaginationDefaultResponse } from '@types';
```

### Deprecated (Old Import)
```typescript
// ❌ Don't use - will be removed after migration
import { User } from '@stores/interfaces';
```

## Path Alias

Add this to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@types/*": ["src/types/*"]
    }
  }
}
```

## Migration Phases

1. **Phase 1 (Current)** - Types split into domain files, backward compatibility via barrel export
2. **Phase 2 (Next)** - Update imports to use `@types/*` path alias
3. **Phase 3 (Future)** - Remove `src/stores/interfaces.ts` after all imports updated

## Benefits

- 📦 **Better Organization** - Types grouped by domain
- 🔍 **Improved Discoverability** - Find types faster with smaller files
- 🤝 **Fewer Merge Conflicts** - Changes isolated to specific domains
- ⚡ **Faster IDE Performance** - Smaller files load quicker

## Metrics

- **Before:** 1 file, 4,805 lines, 425 types
- **After:** 12 files, avg ~400 lines per file
- **Improvement:** ~92% reduction in average file size

## Documentation

See [HOT-001 Completion Report](../../docs/implementation-reports/0-draft/tech-debt-auditor/hot-001-completion.md)
