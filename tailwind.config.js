/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        github: {
          dark: '#0d1117',
          darker: '#161b22',
          border: '#30363d',
          text: '#c9d1d9',
          muted: '#8b949e',
          accent: 'rgb(var(--github-accent-rgb) / <alpha-value>)',
          green: '#238636',
          purple: '#a371f7',
          link: '#0969da',
          open: '#1f883d',
          closed: '#cf222e',
          attention: '#9a6700',
        },
        light: {
          bg: '#ffffff',
          surface: '#f6f8fa',
          border: '#d1d9e0',
          text: '#1f2328',
          muted: '#59636e',
        },
      },
    },
  },
  plugins: [],
}
