/** @type {import('tailwindcss').Config} */
export default {
  important: '#app',
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

