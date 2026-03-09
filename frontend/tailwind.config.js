/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1b332c', // Dark Forest Green
          light: '#2a4a40',
          dark: '#0f1f1a',
        },
        slate: {
          900: '#0F172A',
          800: '#1E293B',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        accent: {
          DEFAULT: '#06b6d4', // Vibrant Teal (cyan-500)
          hover: '#0891b2', // cyan-600
        },
        social: {
          fb: '#06b6d4', // Cyan
          tw: '#34d399', // Mint (emerald-400)
          li: '#a3e635', // Lime
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        editor: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
      },
    },
  },
  plugins: [],
}
