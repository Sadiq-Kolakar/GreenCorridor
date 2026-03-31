import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gv-dark': '#0a0a0f',
        'gv-card': '#1a1a24',
        'gv-red': '#ff3366',
        'gv-green': '#00e676',
        'gv-amber': '#ffb300'
      }
    },
  },
  plugins: [],
} satisfies Config
