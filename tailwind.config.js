/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonpink: '#F61979',
        pulsedarkblue: '#2D5DAA',
        pulseblue: '#1F51FF',
        pulsered: '#EA6466',
        pulsegray: '#CCCCCC',
        bgdash: '#F5F5F5',
        pulsedarkgray: '#707070',
        pulsebrown:'#482317'
      },
      fontSize: {
        xss: '10px',
      },
      screens: {
        pc: '1300px',
      },
    },
  },
  plugins: [],
};