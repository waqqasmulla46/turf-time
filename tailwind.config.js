/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        turf: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          accent: '#10b981',
          neon: '#22c55e',
          glow: 'rgba(34, 197, 94, 0.35)',
        }
      },
      boxShadow: {
        'neon': '0 0 20px -2px rgba(34, 197, 94, 0.4)',
        'neon-strong': '0 0 30px 2px rgba(34, 197, 94, 0.6)',
      }
    },
  },
  plugins: [],
}
