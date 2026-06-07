/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false, // Mantineのリセットと競合しないように無効化
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
