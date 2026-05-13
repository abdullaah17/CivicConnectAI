import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          700: '#1B3A6B',
          900: '#0F2447',
        },
        amber: {
          100: '#FEF3C7',
          500: '#F59E0B',
        },
        success: {
          DEFAULT: '#16A34A',
          bg: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#D97706',
          bg: '#FEF9C3',
        },
        danger: {
          DEFAULT: '#DC2626',
          bg: '#FEE2E2',
        },
        info: {
          DEFAULT: '#0284C7',
          bg: '#E0F2FE',
        },
        surface: '#F8FAFC',
        status: {
          submitted: '#3B82F6',
          review:    '#6366F1',
          assigned:  '#8B5CF6',
          progress:  '#F59E0B',
          resolved:  '#16A34A',
          closed:    '#6B7280',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        sm:   '4px',
        DEFAULT: '8px',
        lg:   '12px',
      },
      boxShadow: {
        card:  '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
      },
      screens: {
        xs: '320px',
        sm: '375px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}

export default config
