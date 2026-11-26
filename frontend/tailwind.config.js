/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Premium Palette
        'deep-black': '#0B0F14',
        'dark-navy': '#101820',
        'warm-gold': '#D4AF37',
        'organic-green': '#7ED957',
        'soft-gray': '#B5B5B5',
        'glass-panel': 'rgba(255, 255, 255, 0.06)',
        
        // Keeping semantic names mapped to new colors or retaining necessary ones
        primary: {
          DEFAULT: '#D4AF37', // Gold as primary
          50: '#fbf8ea',
          100: '#f5efcf',
          200: '#eadd9e',
          300: '#dec46e',
          400: '#D4AF37',
          500: '#b89225',
          600: '#967119',
          700: '#785616',
          800: '#634518',
          900: '#553b19',
        },
        secondary: {
          DEFAULT: '#101820', // Navy as secondary
          50: '#f2f4f6',
          100: '#e1e5ea',
          200: '#c6ccd6',
          300: '#a1aab9',
          400: '#788699',
          500: '#58677d',
          600: '#455064',
          700: '#394152',
          800: '#101820', // Dark Navy
          900: '#0B0F14', // Deep Black
        },
        success: '#7ED957',
        error: '#ff4d4d', // Red-orange glow
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        'heading': ['Poppins', 'DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
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
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.01))',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(212, 175, 55, 0.3), 0 0 20px rgba(212, 175, 55, 0.2)',
        'neon-hover': '0 0 15px rgba(212, 175, 55, 0.5), 0 0 30px rgba(212, 175, 55, 0.3)',
        'neon-gold': '0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3)',
        'neon-green': '0 0 10px rgba(126, 217, 87, 0.5), 0 0 20px rgba(126, 217, 87, 0.3)',
      }
    },
  },
  plugins: [],
}
