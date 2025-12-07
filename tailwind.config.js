/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonpink: '#F61979'
      },
      fontSize: {
        xss: '10px',
      },
    },
  },
  plugins: [],
};