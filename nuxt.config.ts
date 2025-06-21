// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  vite: {
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    worker: {
      format: 'es'
    },
    build: {
      target: 'esnext'
    }
  },
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'unsafe-none',
          'Cross-Origin-Opener-Policy': 'same-origin'
        }
      }
    }
  },
})