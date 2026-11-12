/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'Fredoka', 'cursive', 'sans-serif'],
        body: ['var(--font-body)', 'Quicksand', 'sans-serif'],
        retro: ['"Courier Prime"', 'monospace'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'swirl': 'swirl 3s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'pour': 'pour 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        swirl: {
          '0%, 100%': { transform: 'rotate(-2deg) scale(1)' },
          '50%': { transform: 'rotate(2deg) scale(1.03)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(15px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-10px, 15px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        pour: {
          '0%': { opacity: '0', transform: 'translateY(-35px) scaleY(0.4)' },
          '100%': { opacity: '1', transform: 'translateY(0px) scaleY(1)' },
        },
      },
    },
  },
  plugins: [],
};
