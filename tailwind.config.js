/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        exo: ['"Exo 2"', 'sans-serif'],
      },
      colors: {
        office: {
          dark: '#0e1318',
          panel: '#151c24',
          border: 'rgba(56, 189, 248, 0.2)',
          accent: '#38bdf8',
          amber: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
};
