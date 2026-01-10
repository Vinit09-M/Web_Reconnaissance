/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cyber: {
          black: '#0a0a0f',
          dark: '#13131f',
          panel: '#1c1c2e',
          primary: '#00f0ff',
          secondary: '#7000ff',
          success: '#00ff9d',
          danger: '#ff003c',
          warning: '#fcee0a',
          text: '#e0e0e0',
          muted: '#6b7280'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [],
}
