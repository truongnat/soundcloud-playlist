/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      // Only include colors that are actually used
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12'
        },
        red: {
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        green: {
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          900: '#14532d'
        },
        blue: {
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        },
        yellow: {
          400: '#facc15',
          600: '#ca8a04',
          900: '#713f12'
        },
        purple: {
          300: '#c4b5fd',
          400: '#a78bfa',
          900: '#581c87'
        },
        pink: {
          500: '#ec4899'
        }
      },
      // Only include animations that are used
      animation: {
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient': 'gradient 3s ease infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      }
    }
  },
  plugins: [],
  // Optimize for production
  corePlugins: {
    // Disable unused core plugins
    preflight: true,
    container: false,
    accessibility: false,
    appearance: false,
    backgroundAttachment: false,
    backgroundClip: true,
    backgroundColor: true,
    backgroundImage: true,
    backgroundOpacity: true,
    backgroundPosition: true,
    backgroundRepeat: false,
    backgroundSize: false,
    borderCollapse: false,
    borderColor: true,
    borderOpacity: true,
    borderRadius: true,
    borderStyle: true,
    borderWidth: true,
    boxShadow: true,
    boxSizing: true,
    cursor: true,
    display: true,
    divideColor: false,
    divideOpacity: false,
    divideStyle: false,
    divideWidth: false,
    fill: true,
    flex: true,
    flexDirection: true,
    flexGrow: true,
    flexShrink: true,
    flexWrap: true,
    float: false,
    clear: false,
    fontFamily: true,
    fontSize: true,
    fontSmoothing: true,
    fontStyle: false,
    fontVariantNumeric: false,
    fontWeight: true,
    height: true,
    inset: true,
    justifyContent: true,
    alignContent: false,
    alignItems: true,
    alignSelf: false,
    letterSpacing: false,
    lineHeight: true,
    listStylePosition: false,
    listStyleType: false,
    margin: true,
    maxHeight: true,
    maxWidth: true,
    minHeight: true,
    minWidth: true,
    objectFit: false,
    objectPosition: false,
    opacity: true,
    order: false,
    outline: true,
    overflow: true,
    overscrollBehavior: false,
    padding: true,
    placeContent: false,
    placeItems: false,
    placeSelf: false,
    pointerEvents: true,
    position: true,
    resize: false,
    space: true,
    stroke: true,
    strokeWidth: true,
    tableLayout: false,
    textAlign: true,
    textColor: true,
    textDecoration: true,
    textDecorationColor: false,
    textDecorationStyle: false,
    textDecorationThickness: false,
    textIndent: false,
    textOpacity: true,
    textOverflow: true,
    textTransform: false,
    textUnderlineOffset: false,
    fontVariantNumeric: false,
    transform: true,
    transformOrigin: false,
    translate: true,
    rotate: false,
    skew: false,
    scale: true,
    animation: true,
    transitionDelay: false,
    transitionDuration: true,
    transitionProperty: true,
    transitionTimingFunction: true,
    userSelect: false,
    verticalAlign: false,
    visibility: false,
    whitespace: true,
    width: true,
    wordBreak: false,
    zIndex: true
  }
}