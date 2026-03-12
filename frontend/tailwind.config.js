/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive', 'monospace'],
      },
      colors: {
        'pixel-bg': '#0a0a0f',
        'pixel-primary': '#00ffff',
        'pixel-secondary': '#ff00ff',
        'pixel-accent': '#00ff00',
        'pixel-warning': '#ff9900',
        'pixel-danger': '#ff0055',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pulseNeon: {
          '0%, 100%': { 
            boxShadow: '0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff',
          },
          '50%': { 
            boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
          },
        },
      },
    },
  },
  plugins: [],
}
