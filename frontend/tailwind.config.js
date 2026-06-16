/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        brandRed: '#E4002B',
        brandBlue: '#002E6D',
        theme: {
          bg: 'var(--bg-app)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          glass: 'var(--bg-glass)',
          glassHover: 'var(--bg-glass-hover)',
          border: 'var(--border-glass)',
          card: 'var(--bg-card)'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'orb-drift': 'orbDrift 7s ease-in-out infinite',
        'orb-drift2': 'orbDrift2 9s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        orbDrift: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -25px) scale(1.06)' },
          '66%': { transform: 'translate(-20px, 18px) scale(0.96)' },
        },
        orbDrift2: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '40%': { transform: 'translate(-35px, 30px) scale(1.04)' },
          '70%': { transform: 'translate(25px, -15px) scale(0.98)' },
        },
      }
    },
  },
  plugins: [],
}
