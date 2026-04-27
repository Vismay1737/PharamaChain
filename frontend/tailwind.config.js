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
        navy: {
          900: '#1A1A2E',
          800: '#16213E',
          700: '#0F3460',
        },
        teal: {
          500: '#00897B',
          400: '#009688',
          600: '#00796B',
        },
        accent: '#E94560', // Crimson accent for highlights/anomalies
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}
