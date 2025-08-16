// tailwind.config.js
// @type {import('tailwindcss').Config}
export default {
  darkMode: 'class', // enables dark mode via adding `class="dark"` to HTML
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
