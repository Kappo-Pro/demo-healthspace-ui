# Full Logo - Vertical Layout

Icon + Wordmark in stacked/vertical arrangement.

## Use Cases

- **Narrow Spaces** - Sidebars, mobile layouts
- **Square Formats** - App icons, social avatars
- **Mobile Navigation** - Compact header
- **Vertical Banners** - Print materials

## Files Needed

### Color Variants
- `color/logo-vertical-color-light.svg` - For light backgrounds
- `color/logo-vertical-color-light.png` - PNG fallback
- `color/logo-vertical-color-light@2x.png` - Retina
- `color/logo-vertical-color-dark.svg` - For dark backgrounds
- `color/logo-vertical-color-dark.png` - PNG fallback
- `color/logo-vertical-color-dark@2x.png` - Retina

### Monochrome Variants
- `mono/logo-vertical-mono-light.svg` - Single color (dark) on light bg
- `mono/logo-vertical-mono-dark.svg` - Single color (light) on dark bg
- `mono/logo-vertical-mono-white.svg` - Pure white for overlays

### Outline Variants
- `outline/logo-vertical-outline-light.svg` - Stroke version for light bg
- `outline/logo-vertical-outline-dark.svg` - Stroke version for dark bg

## Specifications

**Minimum Width:** 80px
**Aspect Ratio:** Icon on top, wordmark below, centered
**Clear Space:** 0.5× logo height on all sides

## Export Settings

Same as horizontal variant - see parent directory README.

## Usage Example

```tsx
import { Logo } from '@/assets/brand/logo';

<Logo
  variant="full"
  orientation="vertical"
  width={120}
/>
```

---

**Status:** ⚠️ Awaiting design exports
