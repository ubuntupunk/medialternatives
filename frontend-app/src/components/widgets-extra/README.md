# MuizenMesh Webring React Widget

A React/TypeScript component for easily integrating the MuizenMesh Webring into your JavaScript projects.

## Installation

Copy the `WebringWidget.tsx` and `WebringWidget.module.css` files into your React project.

## Usage

```tsx
import WebringWidget from './path/to/WebringWidget';

function MyComponent() {
  return (
    <div>
      <WebringWidget 
        title="Community Links"
        webringUrl="https://meshring.netlify.app"
        theme="ocean"
        size="medium"
      />
    </div>
  );
}
```

## Props

All props are optional and have sensible defaults:

- `title`: Custom title for the widget (default: "Webring")
- `webringUrl`: URL of the webring (default: "https://meshring.netlify.app")
- `theme`: Visual theme variant (default: "default")
  - `"default"` - Blue accent with light background
  - `"minimal"` - Clean gray styling
  - `"ocean"` - Blue ocean-inspired colors
  - `"sunset"` - Warm orange/yellow colors
  - `"dark"` - Dark background with cyan accents
  - `"tokyo"` - Pink and purple Japanese-inspired colors
  - `"dracula"` - Dark purple theme inspired by Dracula color scheme
  - `"disco"` - Retro neon colors with cyan and magenta
  - `"random"` - Randomly selects one of the above themes
- `size`: Widget size (default: "medium")
  - `"small"` - Compact version
  - `"medium"` - Standard size
  - `"large"` - Larger with more padding
- `showImage`: Whether to display the surfer logo (default: true)
- `showDescription`: Whether to show the description text (default: true)
- `className`: Additional CSS class for custom styling

## Features

- Responsive design that works on mobile and desktop
- Displays the MuizenMesh surfer logo
- Navigation links to previous, random, and next sites
- Styled with CSS modules for easy customization
- TypeScript support

## Files Included

- `WebringWidget.tsx` - Main React component
- `WebringWidget.module.css` - Styling with theme support
- `types.ts` - TypeScript definitions and theme configurations
- `examples.tsx` - Usage examples for all themes
- `README.md` - This documentation

## Dependencies

- React
- Next.js (for the Image component)
- CSS Modules support
- TypeScript (optional, but recommended)

## Theme Examples

### Default Theme
```tsx
<WebringWidget title="Community Links" />
```

### Minimal Theme (Small Size)
```tsx
<WebringWidget 
  theme="minimal" 
  size="small" 
  showDescription={false}
/>
```

### Ocean Theme (Large Size)
```tsx
<WebringWidget 
  title="MuizenMesh Community"
  theme="ocean" 
  size="large"
/>
```

### Sunset Theme (No Image)
```tsx
<WebringWidget 
  title="Community Sites"
  theme="sunset" 
  showImage={false}
/>
```

### Dark Theme
```tsx
<WebringWidget 
  title="MuizenMesh Webring"
  theme="dark"
/>
```

## Customization

### CSS Custom Properties
The widget uses CSS custom properties for theming. You can override these in your own CSS:

```css
.my-custom-webring {
  --webring-bg: #your-background-color;
  --webring-border: #your-border-color;
  --webring-text: #your-text-color;
  --webring-accent: #your-accent-color;
  --webring-link: #your-link-color;
  --webring-link-hover: #your-link-hover-color;
  --webring-button-bg: #your-button-background;
  --webring-button-text: #your-button-text;
  --webring-button-hover: #your-button-hover;
}
```

### Custom Styling
```tsx
<WebringWidget 
  className="my-custom-webring"
  theme="ocean"
/>
```

You can also modify the `WebringWidget.module.css` file directly for more extensive customization.

## Files Included

- `WebringWidget.tsx` - Main React component
- `WebringWidget.module.css` - Styled CSS modules
- `types.ts` - TypeScript definitions and theme configurations
- `examples.tsx` - Usage examples for all themes
- `README.md` - This documentation

## Alternative: HTML Embed

If you prefer a simpler HTML-only solution, use the embed code from the main webring site:

```html
<webring-banner>
    <p>Member of <a href="https://meshring.netlify.app/">MuizenMesh Webring</a></p>
    <a href="https://meshring.netlify.app/prev">Previous</a>
    <a href="https://meshring.netlify.app/random">Random</a>
    <a href="https://meshring.netlify.app/next">Next</a>
</webring-banner>
<script async src="https://meshring.netlify.app/embed.js" charset="utf-8"></script>
```

## Contributing

To add new themes or improve the widget:

1. Edit `types.ts` to add new theme definitions
2. Update `WebringWidget.module.css` for additional styling
3. Add examples to `examples.tsx`
4. Update this README with new theme documentation