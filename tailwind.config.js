/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tech-bg': '#18181b', // Darker Zinc 900 for premium feel
        'tech-panel': '#000000', // Pure Black
        'tech-orange': '#FF6B00', // Vivid Orange
        'tech-text-primary': '#FFFFFF',
        'tech-text-secondary': '#A3A3A3',
      },
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-orange': '0 0 5px rgba(255, 107, 0, 0.5), 0 0 20px rgba(255, 107, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
