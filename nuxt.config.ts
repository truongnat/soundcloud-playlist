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
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'ui-vendor': ['@headlessui/vue'],
            'audio-vendor': ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/core'],
            'utils-vendor': ['axios', 'howler']
          }
        }
      }
    },
    
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@headlessui/vue',
        'axios',
        'pinia'
      ],
      exclude: [
        '@ffmpeg/ffmpeg', 
        '@ffmpeg/util',
        '@ffmpeg/core'
      ],
      esbuildOptions: {
        target: 'esnext'
      }
    },
    
    worker: {
      format: 'es'
    },
    
    server: {
      fs: {
        strict: false,
        allow: ['..']
      },
      hmr: {
        overlay: false,
        port: 24678
      },
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.nuxt/**']
      },
      middlewareMode: false,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    },
    
    css: {
      devSourcemap: false
    },
    
    clearScreen: false,
    logLevel: 'info'
  },
  
  // FIX: Simplified Nitro configuration to avoid Windows build issues
  nitro: {
    preset: 'node-server',
    minify: true,
    compressPublicAssets: true,
    
    // FIX: Disable storage that causes file path issues
    storage: {},
    
    // FIX: Simplified route rules without prerendering
    routeRules: {
      '/_nuxt/**': { 
        headers: { 'Cache-Control': 'max-age=31536000' }
      },
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    },
    
    // FIX: Disable experimental features that cause issues
    experimental: {
      wasm: false
    },
    
    // FIX: Disable prerendering completely to avoid file path issues
    prerender: {
      routes: []
    },
    
    // FIX: Add esbuild configuration for better Windows compatibility
    esbuild: {
      options: {
        target: 'esnext'
      }
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

  // FIX: Disable experimental features that cause build issues
  experimental: {
    payloadExtraction: false,
    viewTransition: false,
    inlineSSRStyles: false,
    asyncContext: false
  },

  // TypeScript configuration
  typescript: {
    typeCheck: false
  },

  // Build configuration
  build: {
    transpile: ['@headlessui/vue']
  },

  // Tailwind CSS optimization
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: false
  },

  // FIX: Disable source maps to prevent build issues
  sourcemap: {
    server: false,
    client: false
  },
  
  // SSR configuration
  ssr: true,
  
  // Router configuration
  router: {
    options: {
      hashMode: false,
      scrollBehaviorType: 'smooth'
    }
  }
})