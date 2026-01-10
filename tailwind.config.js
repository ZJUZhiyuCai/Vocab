/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 莫兰迪配色系统
        sage: {
          50: '#f5f7f5',
          100: '#ebeeeb',
          200: '#d4ddd4',
          300: '#b3c2b3',
          400: '#8da892',
          500: '#5c6b5c',
          600: '#4a564a',
          700: '#3d473d',
          800: '#333a33',
          900: '#2b302b',
        },
        blue: {
          50: '#f0f3f6',
          100: '#e1e7ef',
          200: '#c3d0e0',
          300: '#95add0',
          400: '#6b8ac2',
          500: '#52667c',
          600: '#425263',
          700: '#374452',
          800: '#2f3a46',
          900: '#29313c',
        },
        beige: {
          50: '#faf8f6',
          100: '#f5f0eb',
          200: '#e8e0d7',
          300: '#d4c8b9',
          400: '#b8a893',
          500: '#9a8b7a',
          600: '#7c6f62',
          700: '#665e54',
          800: '#544e47',
          900: '#46423d',
        },
        success: {
          light: '#d4ddd4',
          DEFAULT: '#5c6b5c',
          dark: '#3d473d',
        },
        error: {
          light: '#e8d4d4',
          DEFAULT: '#8b5a5a',
          dark: '#6b4545',
        }
      },
      fontSize: {
        'word': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'sentence': ['15px', { lineHeight: '1.7' }],
      },
      spacing: {
        'card': '16px',
        'section': '24px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'progress-bump': 'progressBump 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progressBump: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.3)' },
        },
      }
    },
  },
  plugins: [],
}
