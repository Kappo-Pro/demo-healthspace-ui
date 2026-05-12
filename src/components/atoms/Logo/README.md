# Logo Components

React components for displaying the VitalFlow brand logo with automatic theme detection and multiple variants.

## Components

### `<Logo />`
Main logo component with full flexibility for all logo variants.

### `<LogoIcon />`
Specialized icon component optimized for small UI elements, avatars, and favicons.

### `<LogoWordmark />`
Text-only logo component ideal for footers and secondary headers.

---

## Installation

```tsx
// Import individual components
import { Logo } from '@/components/atoms/Logo';
import { LogoIcon } from '@/components/atoms/LogoIcon';
import { LogoWordmark } from '@/components/atoms/LogoWordmark';

// Or import all from Logo barrel export
import { Logo, LogoIcon, LogoWordmark } from '@/components/atoms/Logo/Logo';
```

---

## Usage Examples

### Basic Usage

```tsx
import { Logo, LogoIcon, LogoWordmark } from '@/components/atoms/Logo/Logo';

function Header() {
  return (
    <header>
      {/* Full horizontal logo (auto theme) */}
      <Logo width={200} />
    </header>
  );
}

function Sidebar() {
  return (
    <aside>
      {/* Icon for sidebar navigation */}
      <LogoIcon size={48} />
    </aside>
  );
}

function Footer() {
  return (
    <footer>
      {/* Wordmark for footer */}
      <LogoWordmark width={150} wordmarkStyle="mono" theme="white" />
    </footer>
  );
}
```

### Advanced Usage

```tsx
// Full logo with custom configuration
<Logo
  variant="full"
  logoStyle="color"
  orientation="horizontal"
  width={400}
  format="svg"
  alt="VitalFlow Health Platform"
  className="header-logo"
/>

// Icon with monochrome white for overlays
<LogoIcon
  size={64}
  iconStyle="mono"
  theme="white"
  onClick={() => console.log('Logo clicked')}
/>

// Wordmark with PNG format and retina support
<LogoWordmark
  wordmarkStyle="color"
  theme="dark"
  width={200}
  format="png"
  retina={true}
/>
```

---

## API Reference

### Logo Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'full' \| 'icon' \| 'wordmark'` | `'full'` | Logo variant to display |
| `logoStyle` | `'color' \| 'mono' \| 'outline'` | `'color'` | Visual style |
| `theme` | `'light' \| 'dark' \| 'white' \| 'black'` | Auto-detected | Theme override |
| `width` | `number` | `undefined` | Width in pixels |
| `height` | `number` | `undefined` | Height in pixels |
| `format` | `'svg' \| 'png'` | `'svg'` | File format |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation (full logo only) |
| `retina` | `boolean` | `true` | Enable @2x srcSet for PNG |
| `alt` | `string` | `'VitalFlow'` | Alt text for accessibility |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `React.CSSProperties` | `undefined` | Inline styles |
| `onClick` | `() => void` | `undefined` | Click handler |

### LogoIcon Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `16 \| 32 \| 48 \| 64 \| 128 \| 256 \| 512 \| 1024` | `64` | Icon size in pixels |
| `iconStyle` | `'color' \| 'mono' \| 'outline'` | `'color'` | Visual style |
| `theme` | `'light' \| 'dark' \| 'white' \| 'black'` | Auto-detected | Theme override |
| `format` | `'svg' \| 'png'` | `'svg'` | File format |
| `alt` | `string` | `'VitalFlow'` | Alt text for accessibility |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `React.CSSProperties` | `undefined` | Inline styles |
| `onClick` | `() => void` | `undefined` | Click handler |

### LogoWordmark Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `wordmarkStyle` | `'color' \| 'mono' \| 'outline'` | `'color'` | Visual style |
| `theme` | `'light' \| 'dark' \| 'white' \| 'black'` | Auto-detected | Theme override |
| `width` | `number` | `undefined` | Width in pixels |
| `height` | `number` | `undefined` | Height in pixels |
| `format` | `'svg' \| 'png'` | `'svg'` | File format |
| `retina` | `boolean` | `true` | Enable @2x srcSet for PNG |
| `alt` | `string` | `'VitalFlow'` | Alt text for accessibility |
| `className` | `string` | `''` | Additional CSS classes |
| `style` | `React.CSSProperties` | `undefined` | Inline styles |
| `onClick` | `() => void` | `undefined` | Click handler |

---

## Theme Detection

All logo components automatically detect the current app theme using the `useTheme()` hook from `ThemeContext`:

- **THEME.DARK** → Uses `dark` logo variant
- **THEME.VIBRANT** → Uses `light` logo variant
- **THEME.DEFAULT** → Uses `light` logo variant

You can override the automatic theme detection by passing the `theme` prop:

```tsx
<Logo theme="dark" />  // Always use dark variant
<LogoIcon theme="white" iconStyle="mono" />  // White monochrome icon
```

---

## Style Variants

### Color (`color`)
Full-color logo with brand gradients and colors.
- **Use for:** Primary headers, branded content, marketing materials
- **Theme support:** `light`, `dark`

### Monochrome (`mono`)
Single-color logo in black, white, or theme color.
- **Use for:** Overlays, simplified UI, print materials
- **Theme support:** `black`, `white`, `light`, `dark`

### Outline (`outline`)
Outlined version with transparent fill.
- **Use for:** Backgrounds, watermarks, subtle branding
- **Theme support:** `light`, `dark`

---

## Format Selection

### SVG (Recommended)
- **Pros:** Scalable, small file size, crisp at any resolution
- **Cons:** Limited browser support for very old browsers
- **Use for:** Web applications, modern browsers

### PNG
- **Pros:** Universal support, predictable rendering
- **Cons:** Fixed resolution, larger file size
- **Use for:** Email templates, legacy systems, social media

**Retina Support:** When using PNG format, the component automatically generates `srcSet` with `@2x` images for high-DPI displays.

---

## Common Patterns

### Responsive Header Logo

```tsx
function ResponsiveHeader() {
  return (
    <header className="header">
      {/* Desktop: Full logo */}
      <div className="desktop-only">
        <Logo width={250} />
      </div>

      {/* Mobile: Icon only */}
      <div className="mobile-only">
        <LogoIcon size={48} />
      </div>
    </header>
  );
}
```

### Dark Background with White Logo

```tsx
function DarkHero() {
  return (
    <section style={{ backgroundColor: '#1a1a1a', color: 'white' }}>
      <LogoWordmark
        wordmarkStyle="mono"
        theme="white"
        width={200}
      />
    </section>
  );
}
```

### Avatar with Logo

```tsx
import { Avatar } from 'antd';

function CompanyAvatar() {
  return (
    <Avatar
      size={64}
      src={
        <LogoIcon size={64} iconStyle="color" />
      }
    />
  );
}
```

### Clickable Logo (Navigation)

```tsx
import { useNavigate } from 'react-router-dom';

function HeaderLogo() {
  const navigate = useNavigate();

  return (
    <Logo
      width={200}
      onClick={() => navigate('/')}
      style={{ cursor: 'pointer' }}
      alt="VitalFlow - Go to homepage"
    />
  );
}
```

---

## Accessibility

All logo components include proper `alt` text by default. Customize for better context:

```tsx
// Navigation logo
<Logo
  width={200}
  alt="VitalFlow - Return to homepage"
  onClick={goHome}
/>

// Decorative logo (screenreader should skip)
<Logo
  width={150}
  alt=""
  role="presentation"
/>
```

---

## Performance

### Lazy Loading
All components use `loading="lazy"` by default to improve performance.

### Format Recommendations
- **Headers/Primary UI:** Use SVG (smallest, scalable)
- **Small icons (<64px):** Use PNG for crisp rendering
- **Large displays (>400px):** Use SVG or high-res PNG with retina

### Retina Optimization
```tsx
// Automatic retina support for PNG
<Logo format="png" width={200} retina={true} />
// Generates: logo-200w.png (1x) + logo-200w@2x.png (2x)
```

---

## File Structure

```
src/components/atoms/
├── Logo/
│   ├── index.tsx          # Main Logo component
│   ├── types.ts           # TypeScript interfaces
│   ├── Logo.ts            # Barrel export
│   └── README.md          # This file
├── LogoIcon/
│   └── index.tsx          # LogoIcon component
└── LogoWordmark/
    └── index.tsx          # LogoWordmark component
```

---

## Asset Locations

All logo assets are stored in `/public/brand/logo/`:

```
/public/brand/logo/
├── full/horizontal/       # Full horizontal logos
│   ├── color/            # Color variants
│   └── mono/             # Monochrome variants
├── icon/                 # Icon variants
│   ├── color/
│   ├── mono/
│   └── outline/
├── wordmark/             # Wordmark variants
│   ├── color/
│   └── mono/
└── favicon/              # Favicon files
```

See `/public/brand/logo/README.md` for complete asset documentation.

---

## Troubleshooting

### Logo not displaying
- Verify asset files exist in `/public/brand/logo/`
- Check browser console for 404 errors
- Ensure correct theme/style combination exists

### Wrong theme showing
- Check `ThemeContext` is properly configured
- Override with explicit `theme` prop if needed
- Verify theme constants match available files

### Blurry on retina displays
- Use SVG format for best quality
- Enable `retina={true}` for PNG format
- Use appropriate size/width for display context

---

## Related Documentation

- [Logo Asset Management](/docs/design-system/logo-asset-management.md)
- [Logo Directory Structure](/docs/design-system/logo-directory-structure.md)
- [Logo Implementation Summary](/docs/implementation-reports/6-logo/logo-implementation-summary.md)
- [PNG Generation Process](/docs/implementation-reports/6-logo/png-generation-process.md)

---

## Contributing

When adding new logo variants:

1. Add SVG source to appropriate `/public/brand/logo/` directory
2. Run `./scripts/generate-brand-logos.sh` to generate PNGs
3. Update this README if new props/variants are added
4. Test in all theme modes (light, dark, vibrant)

---

**Questions?** See `/public/brand/logo/QUICK-REFERENCE.md` for quick answers.
