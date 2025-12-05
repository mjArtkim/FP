/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gugi: ['Gugi', 'sans-serif'],
        pretendard: ['Pretendard', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};