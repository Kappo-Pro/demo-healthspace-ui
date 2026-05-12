# Logo Icon (Mark Only)

Icon/symbol without wordmark.

## Use Cases

- **Favicons** - Browser tabs (16×16, 32×32)
- **App Icons** - iOS, Android (various sizes)
- **Small UI Elements** - 32px and below
- **Social Avatars** - Profile pictures
- **Loading Indicators** - Animated spinners
- **Mobile Navigation** - Bottom nav icons

## Files Needed

### Color Variants
- `color/logo-icon-color.svg` - Primary version
- `color/logo-icon-color.png` - Multiple sizes
- `color/logo-icon-color@2x.png` - Retina
- `color/logo-icon-color@3x.png` - High-DPI mobile

### Monochrome Variants
- `mono/logo-icon-mono-light.svg` - Dark icon for light backgrounds
- `mono/logo-icon-mono-dark.svg` - Light icon for dark backgrounds
- `mono/logo-icon-mono-white.svg` - Pure white (overlays)
- `mono/logo-icon-mono-black.svg` - Pure black (print)

### Outline Variants
- `outline/logo-icon-outline-light.svg` - Stroke version
- `outline/logo-icon-outline-dark.svg` - Stroke version

## Required Sizes (PNG)

**Standard Web:**
- 16×16, 32×32, 48×48, 64×64

**High-DPI Web:**
- All above at @2x and @3x

**Mobile Apps:**
- 128×128, 256×256, 512×512, 1024×1024

**Special:**
- 180×180 (Apple touch icon)
- 192×192, 512×512 (PWA manifest)

## Specifications

**Minimum Size:** 16px (favicon exception)
**Recommended Minimum:** 24px for clarity
**Aspect Ratio:** 1:1 (square)
**Padding:** Built into artboard (not external)

## Export Settings

**SVG:**
```
Format: SVG
Size: Original artboard (e.g., 512×512)
Square canvas: Yes
Padding: ~10% inside artboard
```

**PNG:**
```
Format: PNG-24
Sizes: 16, 32, 48, 64, 128, 256, 512, 1024
Each at: @1x, @2x, @3x
Transparency: Yes
```

## Usage Example

```tsx
import { LogoIcon } from '@/assets/brand/logo';

// Standard usage
<LogoIcon size={32} />

// Force white version
<LogoIcon size={48} style="mono" theme="white" />
```

---

**Status:** ⚠️ Awaiting design exports
