/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4fe',
          100: '#dde7fd',
          200: '#c2d4fb',
          300: '#99bbf8',
          400: '#699af3',
          500: '#4374eb',
          600: '#2b54de',
          700: '#2140ca',
          800: '#1e34a4',
          900: '#1b2f82',
          950: '#121d51',
        },
        navy: {
          800: '#0f172a',
          900: '#0b0f19',
          950: '#060911',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.06)',
        highlight: '0 0 0 1px rgba(99, 102, 241, 0.1), 0 8px 30px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
