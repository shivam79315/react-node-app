/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require("tailwind-animate"),
  ], 
};