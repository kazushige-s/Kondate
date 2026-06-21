/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '[data-mantine-color-scheme="dark"]'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    preflight: false, // Mantineのリセットと競合しないように無効化
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
