/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6fff9',
          100: '#b3fff0',
          200: '#80ffe6',
          300: '#4dffdb',
          400: '#1affd1',
          500: '#00e5c0',
          600: '#00c9a8',
          700: '#00a88d',
          800: '#008771',
          900: '#006655',
        },
        dark: {
          bg: '#0c1419',
          card: '#111b22',
          card2: '#162028',
          border: '#1e2d38',
          text: '#f0f7f4',
          muted: '#6b8a94',
          hover: '#1a2830',
          surface: '#0f1d25',
        },
        light: {
          bg: '#0c1419',
          card: '#111b22',
          text: '#f0f7f4',
          border: '#1e2d38'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'typing': 'typing 1.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        typing: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 229, 192, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 229, 192, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'teal': '0 0 20px rgba(0, 229, 192, 0.25)',
        'teal-lg': '0 0 40px rgba(0, 229, 192, 0.4)',
        'dark': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}