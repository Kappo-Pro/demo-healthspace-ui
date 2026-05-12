# Logo Assets

This directory contains all VitalFlow logo variants organized by component, style, and theme.

## Directory Structure

```
logo/
├── full/           # Full logo (icon + wordmark)
│   ├── horizontal/  # Wide layout
│   └── vertical/    # Stacked layout
├── icon/           # Icon/mark only
├── wordmark/       # Text/logotype only
├── favicon/        # Favicon files
└── social/         # Social media assets
```

## Quick Reference

### When to Use Each Variant

| Variant | Use Case | Example Locations |
|---------|----------|-------------------|
| **Full Horizontal** | Primary brand presence, wide spaces | Header, footer, marketing |
| **Full Vertical** | Narrow spaces, mobile | Sidebar, mobile nav, app |
| **Icon Only** | Small UI elements, favicons | Tab icon, app icon, avatar |
| **Wordmark Only** | Text-heavy contexts | Footer credits, documents |

### Theme Selection

| Background | Use Logo |
|-----------|----------|
| Light (white, light gray) | `*-light.svg` (dark logo) |
| Dark (black, dark gray) | `*-dark.svg` (light logo) |
| Photos/complex images | `*-outline-*.svg` or `mono/white` |

## File Naming Convention

```
logo-[component]-[style]-[theme].[format]

Examples:
- logo-horizontal-color-light.svg
- logo-icon-mono-white.svg
- logo-wordmark-outline-dark.svg
- logo-icon-color@2x.png
```

## Required Formats

### SVG (Primary)
- Scalable, small file size
- Always export from design tool
- Optimize with SVGO

### PNG (Backup)
- Export at multiple densities: @1x, @2x, @3x
- Transparent background
- For fallback support

### Sizes

**Full Logo:**
- Width: 200px, 400px, 800px (each at @1x, @2x)

**Icon:**
- Sizes: 16px, 32px, 48px, 64px, 128px, 256px, 512px, 1024px
- Each at @1x, @2x, @3x for high-DPI

## Implementation

Use the React components in `src/assets/brand/logo/components/`:

```tsx
import { Logo, LogoIcon, LogoWordmark } from '@/assets/brand/logo';

// Auto theme-switching full logo
<Logo variant="full" width={200} />

// Icon only
<LogoIcon size={32} />

// Wordmark
<LogoWordmark style="mono" />
```

## Export Checklist

Before exporting from your design tool:

- [ ] Convert all text to outlines
- [ ] Remove hidden layers
- [ ] Flatten unnecessary groups
- [ ] Set proper artboard size
- [ ] Use RGB color space
- [ ] Remove metadata

## Resources

- Full documentation: `/docs/design-system/logo-asset-management.md`
- Design system: `/docs/design-system/`
- Brand guidelines: (add link to brand guidelines)

---

**Last Updated:** October 11, 2025
