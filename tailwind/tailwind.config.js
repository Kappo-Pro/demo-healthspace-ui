/** @type {import('tailwindcss').Config} */

// Import design system theme
import DesignSystemTheme from './tailwind.theme'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Design System Theme - all tokens reference CSS custom properties
      // from src/styles/design-system.css for automatic theme support
      ...DesignSystemTheme,
    },
  },
  plugins: [
    // Forms
  ],
}

