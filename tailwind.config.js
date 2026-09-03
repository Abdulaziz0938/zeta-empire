/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonCyan: '#00f3ff',
        darkBg: '#030914',
      },
      boxShadow: {
        'neon': '0 0 25px rgba(0, 243, 255, 0.4)',
        'neon-strong': '0 0 35px rgba(0, 243, 255, 0.6)',
        'neon-orange': '0 0 25px rgba(249, 115, 22, 0.4)',
        'neon-green': '0 0 25px rgba(34, 197, 94, 0.4)',
      }
    },
  },
  plugins: [],
}
