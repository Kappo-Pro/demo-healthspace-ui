# Full Logo - Horizontal Layout

Icon + Wordmark in horizontal/linear arrangement.

## Use Cases

- **Headers/Navigation** - Primary location
- **Marketing Materials** - Banners, ads
- **Email Signatures** - Professional correspondence
- **Wide Spaces** - Desktop layouts

## Files Needed

### Color Variants
- `color/logo-horizontal-color-light.svg` - For light backgrounds
- `color/logo-horizontal-color-light.png` - PNG fallback
- `color/logo-horizontal-color-light@2x.png` - Retina
- `color/logo-horizontal-color-dark.svg` - For dark backgrounds
- `color/logo-horizontal-color-dark.png` - PNG fallback
- `color/logo-horizontal-color-dark@2x.png` - Retina

### Monochrome Variants
- `mono/logo-horizontal-mono-light.svg` - Single color (dark) on light bg
- `mono/logo-horizontal-mono-dark.svg` - Single color (light) on dark bg
- `mono/logo-horizontal-mono-white.svg` - Pure white for overlays
- `mono/logo-horizontal-mono-black.svg` - Pure black for print

### Outline Variants
- `outline/logo-horizontal-outline-light.svg` - Stroke version for light bg
- `outline/logo-horizontal-outline-dark.svg` - Stroke version for dark bg

## Specifications

**Minimum Width:** 120px
**Aspect Ratio:** Maintain original proportions
**Clear Space:** 0.5× logo height on all sides

## Export Settings

**SVG:**
```
Format: SVG
Decimals: 2
Convert text to outlines: Yes
Responsive: Yes (preserve viewBox)
```

**PNG:**
```
Format: PNG-24
Transparency: Yes
Color profile: sRGB
@1x: 200px, 400px, 800px width
@2x: 400px, 800px, 1600px width
```

## Usage Example

```tsx
import { Logo } from '@/assets/brand/logo';

<Logo
  variant="full"
  orientation="horizontal"
  width={200}
/>
```

---

**Status:** ⚠️ Awaiting design exports
