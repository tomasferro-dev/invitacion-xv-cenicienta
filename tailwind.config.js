/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "Palacio de noche" — deep royal midnight blue base
        royal: {
          DEFAULT: '#0B1026', // midnight base
          deep: '#070A1A', // deepest shadow (casi negro azulado)
          soft: '#141B3A', // elevated surface
          veil: '#1E2750', // cards / overlays
        },
        // Celeste del vestido — color principal
        celeste: {
          DEFAULT: '#A9C2F0',
          soft: '#CFE0FA', // highlight / hover
          deep: '#7E9FD9', // pressed / borders
          glow: '#BBD3FF', // aura del polvo mágico
        },
        // Dorado champagne frío, acorde al celeste
        gold: {
          DEFAULT: '#E7D3A1',
          soft: '#F4E8C6',
          deep: '#C9A85F', // foil / pressed gold
        },
        snow: '#FFFFFF',
        ink: '#05070F', // negro azulado profundo
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        script: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.34em',
        royal: '0.18em',
      },
      maxWidth: {
        content: '1100px',
        // ancho de la columna de la invitación: se mantiene "mobile" también
        // en tablet/desktop (el castillo es vertical 9:16 y así no se recorta)
        column: '480px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 8s ease-in-out infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
