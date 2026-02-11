import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada no buquê
        rose: {
          deep: '#B8333C',
          crimson: '#C41E3A',
        },
        terracotta: {
          DEFAULT: '#D4653C',
          light: '#E89B6C',
        },
        gold: {
          warm: '#E8B84A',
          soft: '#F4D76B',
        },
        moss: {
          DEFAULT: '#5B7248',
          sage: '#8FA678',
        },
        cream: {
          warm: '#F8F4ED',
          soft: '#FDF9F3',
        },
        warm: {
          white: '#FFFCF8',
        },
        earth: {
          brown: '#8B6914',
        },
        // Cores de texto
        text: {
          primary: '#3D3429',
          secondary: '#6B5D4D',
          muted: '#9B8B7A',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
        display: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'bloom': 'bloom 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(2deg)' },
        },
        bloom: {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0.8' },
        },
      },
      backgroundImage: {
        'gradient-warm': 'linear-gradient(135deg, #B8333C 0%, #D4653C 50%, #E8B84A 100%)',
        'gradient-gold': 'linear-gradient(135deg, #8B6914 0%, #E8B84A 50%, #D4653C 100%)',
      },
    },
  },
  plugins: [],
}
export default config
