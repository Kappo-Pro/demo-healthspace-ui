# Logo Wordmark (Text Only)

Text/logotype without icon.

## Use Cases

- **Footer Credits** - Copyright, legal
- **Text-Heavy Contexts** - When icon is redundant
- **Print Materials** - Letterheads, documents
- **Space Constraints** - Narrow horizontal spaces
- **Secondary Branding** - When icon appears elsewhere

## Files Needed

### Color Variants
- `color/logo-wordmark-color-light.svg` - For light backgrounds
- `color/logo-wordmark-color-light.png` - PNG fallback
- `color/logo-wordmark-color-light@2x.png` - Retina
- `color/logo-wordmark-color-dark.svg` - For dark backgrounds
- `color/logo-wordmark-color-dark.png` - PNG fallback
- `color/logo-wordmark-color-dark@2x.png` - Retina

### Monochrome Variants
- `mono/logo-wordmark-mono-light.svg` - Single color (dark)
- `mono/logo-wordmark-mono-dark.svg` - Single color (light)
- `mono/logo-wordmark-mono-white.svg` - Pure white
- `mono/logo-wordmark-mono-black.svg` - Pure black

### Outline Variants
- `outline/logo-wordmark-outline-light.svg` - Stroke version
- `outline/logo-wordmark-outline-dark.svg` - Stroke version

## Specifications

**Minimum Width:** 100px for legibility
**Text to Outlines:** Always convert before export
**Baseline Alignment:** Include baseline for layout

## Export Settings

**SVG:**
```
Format: SVG
Convert text to outlines: Yes (critical!)
Preserve text baseline: Yes
```

**PNG:**
```
Format: PNG-24
Widths: 150px, 300px, 600px
@2x versions: 300px, 600px, 1200px
Transparency: Yes
Extra padding: 10px top/bottom for visual balance
```

## Usage Example

```tsx
import { LogoWordmark } from '@/assets/brand/logo';

// Standard usage
<LogoWordmark width={150} />

// Monochrome version
<LogoWordmark style="mono" theme="white" />
```

---

**Status:** ⚠️ Awaiting design exports
