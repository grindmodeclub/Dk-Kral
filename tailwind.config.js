/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#B99355',
          light: '#C9A365',
          dark: '#A98345',
        },
        dark: {
          DEFAULT: '#343434',
          light: '#444444',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
