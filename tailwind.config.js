/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981', // Everhour-inspired Emerald Primary
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        everhour: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          muted: '#64748B',
          dark: '#0F172A',
        },
        sede: {
          1: {
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1D4ED8',
            badge: '#3B82F6'
          },
          2: {
            bg: '#ECFDF5',
            border: '#A7F3D0',
            text: '#047857',
            badge: '#10B981'
          },
          3: {
            bg: '#FAF5FF',
            border: '#E9D5FF',
            text: '#7E22CE',
            badge: '#A855F7'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
