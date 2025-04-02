/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'barys-blue': '#1E40AF',
        'barys-gold': '#FBBF24',
      },
      keyframes: {
        dot1: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        dot2: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        dot3: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      },
      animation: {
        dot1: 'dot1 1s infinite ease-in-out',
        dot2: 'dot2 1s infinite ease-in-out 0.2s',
        dot3: 'dot3 1s infinite ease-in-out 0.4s'
      }
    },
  },
  plugins: [],
} 