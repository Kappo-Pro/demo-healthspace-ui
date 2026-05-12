# Logo Quick Reference Card

**TL;DR:** What logo file should I use?

---

## By Location

| Where | Use This |
|-------|----------|
| **Header/Nav** | `full/horizontal/color/logo-horizontal-color-[theme].svg` |
| **Mobile Header** | `full/vertical/color/logo-vertical-color-[theme].svg` |
| **Sidebar** | `icon/color/logo-icon-color.svg` (32-48px) |
| **Footer** | `wordmark/mono/logo-wordmark-mono-[theme].svg` |
| **Favicon** | `favicon/favicon.svg` or `favicon/favicon-32x32.png` |
| **Loading Spinner** | `icon/mono/logo-icon-mono-[theme].svg` |
| **Social Share** | `social/og-image.png` |
| **App Icon** | `icon/color/logo-icon-1024.png` |

---

## By Theme

| Background | Logo File |
|-----------|-----------|
| **Light** (white, #F5F5F5) | `*-light.svg` (dark logo) |
| **Dark** (#000, #1A1A1A) | `*-dark.svg` (light logo) |
| **Photo/Image** | `*-outline-dark.svg` or `mono/white.svg` |
| **Brand Color** | `mono/white.svg` or `outline-dark.svg` |

---

## By Size

| Size | Component | File |
|------|-----------|------|
| **< 32px** | Icon only | `icon/*` |
| **32-100px** | Icon or vertical | `icon/*` or `vertical/*` |
| **100-200px** | Horizontal or vertical | `horizontal/*` or `vertical/*` |
| **> 200px** | Horizontal | `horizontal/*` |

---

## Common Scenarios

### "I need a logo for the header"
```tsx
<Logo variant="full" orientation="horizontal" width={200} />
```
→ `full/horizontal/color/logo-horizontal-color-[auto-theme].svg`

### "I need an icon for the browser tab"
→ `favicon/favicon.svg` or `favicon-32x32.png`

### "I need a logo on a dark background"
→ `[any]/[any]/color/logo-[component]-color-dark.svg`

### "I need a logo on top of a photo"
→ `[any]/outline/logo-[component]-outline-dark.svg`
→ Or: `[any]/mono/logo-[component]-mono-white.svg` with background

### "I need a black and white version"
→ `[any]/mono/logo-[component]-mono-[light|dark|white|black].svg`

### "I need to share on social media"
→ `social/og-image.png` (Facebook, LinkedIn)
→ `social/twitter-card-large.png` (Twitter)

---

## File Name Decoder

```
logo-horizontal-color-light.svg
 │    │          │     │
 │    │          │     └─ Theme: light bg (dark logo)
 │    │          └─────── Style: full color
 │    └────────────────── Component: horizontal layout
 └─────────────────────── Logo prefix
```

**Components:**
- `horizontal` = Full logo, wide layout
- `vertical` = Full logo, stacked layout
- `icon` = Icon/mark only
- `wordmark` = Text only

**Styles:**
- `color` = Full color version
- `mono` = Monochrome (single color)
- `outline` = Stroke/outline version

**Themes:**
- `light` = For light backgrounds (dark logo)
- `dark` = For dark backgrounds (light logo)
- `white` = Pure white (#FFFFFF)
- `black` = Pure black (#000000)

---

## Format Guide

**Use SVG when:**
- ✅ Web/app (always primary choice)
- ✅ Need to scale dynamically
- ✅ Want crisp edges at any size
- ✅ Modern browsers (99%+ support)

**Use PNG when:**
- ✅ Need fallback (with `<picture>` tag)
- ✅ Email signatures
- ✅ Legacy systems
- ✅ Specific size requirements (favicons)

**Use WebP when:**
- ✅ Performance is critical
- ✅ Have proper fallbacks
- ✅ Modern browser target

---

## React Component Props

```tsx
<Logo
  variant="full" | "icon" | "wordmark"
  orientation="horizontal" | "vertical"  // only for full
  style="color" | "mono" | "outline"
  theme="light" | "dark"  // optional, auto-detects
  width={200}
  height="auto"
/>
```

**Examples:**

```tsx
// Header logo (auto theme)
<Logo variant="full" width={200} />

// Sidebar icon
<LogoIcon size={32} />

// Footer wordmark (white)
<LogoWordmark style="mono" theme="white" width={150} />

// Overlay on image
<Logo variant="full" style="outline" theme="dark" width={250} />
```

---

## Checklist: Do I Have Everything?

**Minimum Set:**
- [ ] Full horizontal - color - light/dark (SVG + PNG)
- [ ] Icon - color (SVG + multiple PNG sizes)
- [ ] Icon - mono - white (SVG)
- [ ] Favicon files (16, 32, 48px + ICO)

**Recommended Set:**
- [ ] All above ✓
- [ ] Full vertical - color - light/dark
- [ ] Wordmark - mono - light/dark
- [ ] All outline versions
- [ ] Social media OG image
- [ ] Apple touch icon
- [ ] PWA icons (192, 512)

**Complete Set:**
- [ ] All recommended ✓
- [ ] All size variants (@2x, @3x)
- [ ] All social media formats
- [ ] WebP versions
- [ ] Complete mono set (light/dark/white/black)

---

## Emergency: "I don't have the right file"

**Short term:**
1. Use any available SVG version
2. Apply CSS filters to adjust color:
   ```css
   /* Make white logo from dark logo */
   .logo { filter: brightness(0) invert(1); }

   /* Make black logo from white logo */
   .logo { filter: brightness(0); }
   ```

**Long term:**
1. Export proper variant from design file
2. Follow naming convention
3. Optimize and add to correct folder
4. Update references

---

## Need Help?

1. **Quick guide:** This file
2. **Detailed guide:** `/docs/design-system/logo-asset-management.md`
3. **Directory guide:** `/docs/design-system/logo-directory-structure.md`
4. **Folder README:** Check the README.md in each logo subfolder

---

**Created:** October 11, 2025
**Last Updated:** October 11, 2025
