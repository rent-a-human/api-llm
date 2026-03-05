/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'medical-blue': '#0066cc',
        'medical-green': '#10b981',
        'medical-red': '#ef4444',
        'medical-gray': '#6b7280',
      }
    },
  },
  plugins: [],
}