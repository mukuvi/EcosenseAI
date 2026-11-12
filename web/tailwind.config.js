export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: { '2xl': '1240px' },
    },
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        surface: '#F7F7F4',
        bone: '#F2F1EC',
        ink: {
          DEFAULT: '#0B0F0D',
          muted: '#626B65',
        },
        line: 'rgba(11,15,13,0.12)',
        primary: {
          50: '#F4F5F3',
          100: '#E8EAE6',
          200: '#D3D7D1',
          300: '#AEB5AE',
          400: '#7E8981',
          500: '#55605A',
          600: '#333D37',
          700: '#232B26',
          800: '#161C18',
          900: '#0B0F0D',
        },
        accent: {
          DEFAULT: '#C4EF5E',
          soft: '#E9F8C4',
          ink: '#1B2A12',
        },
        forest: {
          600: '#141A16',
          700: '#101512',
          800: '#0C100D',
          900: '#080B09',
        },
        sage: {
          50: '#f6f6ef',
          100: '#e9ead7',
          200: '#d6d8b9',
          300: '#c0c49a',
          400: '#a7ad78',
          500: '#8c945f',
          600: '#70774c',
          700: '#585e3b',
          800: '#3f452b',
          900: '#2a2e1c',
        },
        moss: {
          50: '#f1f3ea',
          100: '#dde2c8',
          200: '#c1cb9d',
          300: '#a3b071',
          400: '#86944f',
          500: '#67733a',
          600: '#4B5320',
          700: '#3f461b',
          800: '#323714',
          900: '#25290f',
        },
      },
      borderRadius: {
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        '3xl': '16px',
        '4xl': '20px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11, 15, 13, 0.04)',
        lift: '0 18px 40px -28px rgba(11, 15, 13, 0.35)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
