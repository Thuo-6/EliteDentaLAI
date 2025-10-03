/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float-gentle': 'float-gentle 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-4px) scale(1.02)' },
        },
      },
      boxShadow: {
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(137, 207, 240, 0.1)',
        'glow': '0 0 20px rgba(137, 207, 240, 0.4)',
        'glow-lg': '0 0 30px rgba(137, 207, 240, 0.6)',
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '24px',
      },
    },
  },
  plugins: [],
};
