# Favicon Assets

Browser tab icons and mobile shortcuts.

## Required Files

### Standard Favicons
```
favicon.ico              # Multi-resolution ICO (16, 32, 48)
favicon-16x16.png        # 16×16 PNG
favicon-32x32.png        # 32×32 PNG
favicon-48x48.png        # 48×48 PNG
favicon.svg              # SVG version (modern browsers)
```

### Apple Touch Icons
```
apple-touch-icon.png             # 180×180 default
apple-touch-icon-precomposed.png # 180×180 no gloss effect
```

### Android/PWA
```
android-chrome-192x192.png   # 192×192
android-chrome-512x512.png   # 512×512
```

### Microsoft
```
mstile-150x150.png           # Windows tile
browserconfig.xml            # Microsoft configuration
```

## HTML Implementation

Add to `public/index.html`:

```html
<!-- Standard favicons -->
<link rel="icon" type="image/svg+xml" href="/brand/logo/favicon/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/brand/logo/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/brand/logo/favicon/favicon-16x16.png">
<link rel="shortcut icon" href="/brand/logo/favicon/favicon.ico">

<!-- Apple -->
<link rel="apple-touch-icon" sizes="180x180" href="/brand/logo/favicon/apple-touch-icon.png">

<!-- Android/PWA -->
<link rel="manifest" href="/site.webmanifest">

<!-- Microsoft -->
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="msapplication-config" content="/brand/logo/favicon/browserconfig.xml">
```

## Generation Tools

**Online:**
- [Real Favicon Generator](https://realfavicongenerator.net/) - Best all-in-one tool
- [Favicon.io](https://favicon.io/) - Simple generator

**Command Line:**
```bash
# Using ImageMagick
convert logo-icon-color.png -resize 16x16 favicon-16x16.png
convert logo-icon-color.png -resize 32x32 favicon-32x32.png
convert logo-icon-color.png -resize 48x48 favicon-48x48.png

# Create ICO with multiple sizes
convert logo-icon-color.png -define icon:auto-resize=16,32,48 favicon.ico
```

## Design Guidelines

**Simplicity:** Icon should be recognizable at 16×16
**Contrast:** Ensure visibility on browser tabs (both light/dark)
**Padding:** Add ~10% internal padding for breathing room
**Color:** Use simplified color palette (avoid gradients at small sizes)

## Testing Checklist

- [ ] Test in Chrome (light/dark theme)
- [ ] Test in Firefox (light/dark theme)
- [ ] Test in Safari (light/dark theme)
- [ ] Test in Edge
- [ ] Test on iOS (home screen)
- [ ] Test on Android (home screen)
- [ ] Verify all sizes display correctly
- [ ] Check loading speed

---

**Status:** ⚠️ Awaiting favicon generation
