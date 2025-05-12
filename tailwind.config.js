/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          100: '#ffead7',
          200: '#ffd4a8',
          500: '#fd9d3e',
          600: '#e47d1e',
        }
      }
    },
  },
  plugins: [],
}