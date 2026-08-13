/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        dm: ['DM Sans', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        publicSans: ['Public Sans', 'sans-serif'],
      },
      colors:{
        primary: "#F3890A",
        secondary: "#79b82d"
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
