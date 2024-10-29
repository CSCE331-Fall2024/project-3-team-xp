/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './frontend/src/**/*.{html,js,jsx}', // Corrected to point to the right location
    './frontend/public/index.html',       // Include if you have Tailwind classes in HTML
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};