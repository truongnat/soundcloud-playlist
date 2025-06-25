// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  
  // Disable devtools in production for faster builds
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  
  modules: [
    '@nuxtjs/tailwindcss', 
    '@pinia/nuxt', 
    '@nuxt/ui',
    '@nuxtjs/sitemap'
  ],
  
  css: ['~/assets/css/main.css'],
  
  // SEO Configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'SoundCloud Playlist Downloader',
      meta: [
        { name: 'description', content: 'Free SoundCloud playlist downloader. Download entire playlists, convert to MP3, and save your favorite tracks.' },
        { name: 'theme-color', content: '#f97316' }
      ]
    }
  },
  
  // Development server configuration
  devServer: {
    port: 3000,
    host: '127.0.0.1'
  },
  
  // Vite configuration optimized for Windows
  vite: {
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: 'esbuild'
    },
    
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@headlessui/vue',
        'pinia'
      ],
      exclude: [
        '@ffmpeg/ffmpeg', 
        '@ffmpeg/util',
        '@ffmpeg/core'
      ]
    },
    
    server: {
      fs: {
        strict: false
      },
      hmr: {
        overlay: false
      },
      cors: true
    },
    
    css: {
      devSourcemap: false
    }
  },
  
  // Simplified Nitro configuration
  nitro: {
    experimental: {
      wasm: false
    }
  },
  
  // Runtime configuration
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://soundcloud-playlist.netlify.app'
    }
  },

  // Site configuration
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://soundcloud-playlist.netlify.app',
    name: 'SoundCloud Playlist Downloader'
  },

  // Sitemap configuration according to latest docs
  sitemap: {
    urls: async () => {
      return [
        '/',
        '/track',
        '/privacy',
        '/terms'
      ]
    },
    defaults: {
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString()
    }
  },

  // Experimental features configuration
  experimental: {
    // Disable features that can cause build issues on Windows
    payloadExtraction: false,
    viewTransition: false,
    asyncContext: false,
    // Enable stable features
    typedPages: false,
    watcher: 'chokidar'
  },

  // TypeScript configuration
  typescript: {
    typeCheck: false
  },

  // Build configuration
  build: {
    transpile: ['@headlessui/vue']
  },

  // SSR configuration
  ssr: true
})