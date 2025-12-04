/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Yavin Theme
        deepest: '#050505', // Almost black
        deep: '#0a0a0a',    // Very dark gray
        surface: '#121212', // Standard dark surface
        elevated: '#1a1a1a', // Slightly lighter

        // Accents
        'accent-red': '#FF5555',
        'accent-green': '#50FA7B',
        'accent-blue': '#4da6ff',
        'accent-lightblue': '#8BE9FD',
        'accent-cyan': '#00E5FF',
        'accent-purple': '#BD93F9',
        'accent-pink': '#FF4081',

        // Functional
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'text-primary': '#E0E0E0',
        'text-secondary': '#A0A0A0',
        'text-dim': '#606060',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-cyan': '0 0 10px rgba(0, 229, 255, 0.5), 0 0 20px rgba(0, 229, 255, 0.3)',
        'neon-purple': '0 0 10px rgba(179, 136, 255, 0.5), 0 0 20px rgba(179, 136, 255, 0.3)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
