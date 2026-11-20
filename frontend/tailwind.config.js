/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          navy: '#0f172a',
          slate: '#1e293b',
          accent: '#4f46e5',
          accentHover: '#4338ca',
          income: '#10b981',
          expense: '#ef4444',
          savings: '#0284c7',
          surface: '#ffffff',
          bg: '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}
