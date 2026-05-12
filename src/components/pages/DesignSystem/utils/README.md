# Design System Utils

Utility modules for the Design System customization interface.

## Session Manager

Persists design system customizations using browser `sessionStorage`.

### Usage

```typescript
import sessionManager from './sessionManager';
import { DesignSystemState } from '../types';

// Save customizations
const myCustomizations: DesignSystemState = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
  },
  darkMode: true,
  typography: {
    fontFamily: 'Inter',
  },
};

sessionManager.saveState(myCustomizations);

// Load customizations
const loaded = sessionManager.loadState();
console.log(loaded); // Returns saved state or default if none exists

// Check if customizations exist
if (sessionManager.hasStoredState()) {
  console.log('Customizations found!');
}

// Get metadata without loading full state
const metadata = sessionManager.getMetadata();
if (metadata) {
  console.log(`Saved ${new Date(metadata.timestamp).toLocaleString()}`);
  console.log(`Version: ${metadata.version}`);
}

// Clear all customizations
sessionManager.clearState();
```

### Features

- **Automatic Validation**: Invalid data is safely ignored, returning defaults
- **Version Compatibility**: Future-proof storage with version tracking
- **Error Handling**: All operations are wrapped in try-catch blocks
- **Type-Safe**: Full TypeScript support with proper interfaces
- **Lightweight**: Minimal memory footprint (~2KB max)

### Storage Format

Data is stored in `sessionStorage` with this structure:

```json
{
  "version": "1.0",
  "timestamp": 1698765432000,
  "state": {
    "colors": { "primary": "#007bff" },
    "darkMode": true,
    "customCSS": "/* custom styles */"
  }
}
```

### API Reference

#### `saveState(state: DesignSystemState): boolean`

Save design system state to sessionStorage.

- **Returns**: `true` if successful, `false` on error

#### `loadState(): DesignSystemState`

Load design system state from sessionStorage.

- **Returns**: Stored state or default state if none exists/invalid

#### `clearState(): boolean`

Remove all stored design system state.

- **Returns**: `true` if successful, `false` on error

#### `getStorageKey(): string`

Get the sessionStorage key used for persistence.

- **Returns**: `'vitalflow-design-system-state'`

#### `hasStoredState(): boolean`

Check if valid state exists in sessionStorage.

- **Returns**: `true` if valid state exists

#### `getMetadata(): object | null`

Get metadata about stored state without loading full state.

- **Returns**: `{ version: string, timestamp: number }` or `null`

### Testing

Run tests with:

```bash
npm test -- sessionManager.test.ts
```

Test coverage includes:
- ✅ Save and load operations
- ✅ Invalid JSON handling
- ✅ Version incompatibility
- ✅ Error recovery
- ✅ Metadata operations
- ✅ Singleton behavior
