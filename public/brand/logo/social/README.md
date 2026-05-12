# Social Media Assets

Optimized logo images for social media platforms.

## Required Files

### OpenGraph (Facebook, LinkedIn)
```
og-image.png                 # 1200×630 (1.91:1)
og-image-square.png          # 1200×1200 (1:1)
```

**Usage:**
```html
<meta property="og:image" content="/brand/logo/social/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

### Twitter
```
twitter-card.png             # 1200×600 (2:1)
twitter-card-large.png       # 1200×628 (summary_large_image)
```

**Usage:**
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="/brand/logo/social/twitter-card-large.png" />
```

### LinkedIn
```
linkedin-cover.png           # 1584×396 (4:1) - Profile cover
linkedin-share.png           # 1200×627 (1.91:1) - Link shares
```

### Instagram
```
instagram-post.png           # 1080×1080 (1:1)
instagram-story.png          # 1080×1920 (9:16)
```

### YouTube
```
youtube-thumbnail.png        # 1280×720 (16:9)
youtube-channel-art.png      # 2560×1440 (safe area: 1546×423)
```

### Pinterest
```
pinterest-pin.png            # 1000×1500 (2:3)
```

## Design Guidelines

### OpenGraph Image (Most Important)
- **Size:** 1200×630px (1.91:1 ratio)
- **Content:** Logo + tagline or key message
- **Safe Zone:** Keep important content in center 1200×600
- **File Size:** < 8 MB (ideally < 1 MB)
- **Format:** PNG or JPEG (PNG for logos with transparency)

**Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│          [Logo] VitalFlow           │
│    Healthcare Management Platform   │
│                                     │
└─────────────────────────────────────┘
```

### Twitter Card
- **Size:** 1200×600px (2:1 ratio) or 1200×628px
- **Content:** Similar to OpenGraph but optimized for Twitter
- **Text:** Larger, bolder (viewed on mobile often)
- **File Size:** < 5 MB

### General Best Practices

**All platforms:**
- High contrast for mobile viewing
- Readable at small sizes
- Test on actual platform (preview tools)
- Consider dark mode variants

**Text:**
- Minimum 60px font size for readability
- High contrast text (WCAG AA: 4.5:1)
- Short, impactful messaging

**Logo:**
- Centered with ample padding
- Not too small (at least 200-300px wide)
- Use high-resolution source

## Testing Tools

**Preview & Validation:**
- [OpenGraph Preview](https://www.opengraph.xyz/) - See how links look
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - Test Twitter cards
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) - Test LinkedIn shares
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - Debug OG tags

**Image Generators:**
- [Canva](https://www.canva.com/) - Templates for all platforms
- [Figma Community](https://www.figma.com/community) - Free social media templates

## Implementation

### React Helmet / Next.js Head
```tsx
<Head>
  {/* OpenGraph */}
  <meta property="og:title" content="VitalFlow" />
  <meta property="og:description" content="Healthcare Management Platform" />
  <meta property="og:image" content="https://vitalflow.ai/brand/logo/social/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://vitalflow.ai" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="VitalFlow" />
  <meta name="twitter:description" content="Healthcare Management Platform" />
  <meta name="twitter:image" content="https://vitalflow.ai/brand/logo/social/twitter-card-large.png" />
</Head>
```

## Size Reference Chart

| Platform | Size (px) | Ratio | Max File Size |
|----------|-----------|-------|---------------|
| OpenGraph | 1200×630 | 1.91:1 | 8 MB |
| Twitter Large | 1200×628 | 1.91:1 | 5 MB |
| Twitter Summary | 1200×1200 | 1:1 | 5 MB |
| LinkedIn Share | 1200×627 | 1.91:1 | - |
| LinkedIn Cover | 1584×396 | 4:1 | 8 MB |
| Instagram Post | 1080×1080 | 1:1 | - |
| Instagram Story | 1080×1920 | 9:16 | - |
| YouTube Thumb | 1280×720 | 16:9 | 2 MB |
| Pinterest | 1000×1500 | 2:3 | 32 MB |

## Design Templates

Consider creating templates in Figma/Sketch with:
- Logo placement guidelines
- Safe zones marked
- Typography presets
- Color variations
- Dark/light mode versions

---

**Status:** ⚠️ Awaiting social media asset creation
**Priority:** OpenGraph image (used most frequently)
