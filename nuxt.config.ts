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
  
  // SEO Configuration (moved to useHead for better performance)
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
  
  // FIX: Development server configuration to prevent ECONNRESET
  devServer: {
    port: 3000,
    host: '127.0.0.1' // Use 127.0.0.1 instead of localhost
  },
  
  // FIX: Optimized Vite configuration for Windows development
  vite: {
    // Build optimizations
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssMinify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'vue-vendor': ['vue', 'vue-router'],
            'ui-vendor': ['@headlessui/vue'],
            'audio-vendor': ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/core'],
            'utils-vendor': ['axios', 'howler']
          }
        }
      }
    },
    
    // Dependency optimization
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
    
    // Worker configuration
    worker: {
      format: 'es'
    },
    
    // FIX: Enhanced server configuration for Windows stability
    server: {
      fs: {
        strict: false,
        allow: ['..']
      },
      // FIX: Disable HMR overlay that can cause connection issues
      hmr: {
        overlay: false,
        port: 24678
      },
      // FIX: Use polling for file watching on Windows
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.nuxt/**']
      },
      // FIX: Increase timeouts
      middlewareMode: false,
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    },
    
    // CSS optimization
    css: {
      devSourcemap: false
    },
    
    // FIX: Clear screen and logging
    clearScreen: false,
    logLevel: 'info'
  },
  
  // Optimized Nitro configuration
  nitro: {
    preset: 'node-server',
    // Minification
    minify: true,
    
    // Compression
    compressPublicAssets: true,
    
    // FIX: Development server configuration
    devServer: {
      watch: true
    },
    
    // Route rules for caching
    routeRules: {
      '/': { prerender: true },
      '/track': { prerender: true },
      '/privacy': { prerender: true },
      '/terms': { prerender: true },
      '/sitemap.xml': { prerender: true },
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
    
    // Experimental features
    experimental: {
      wasm: true
    },
    
    // Prerendering
    prerender: {
      routes: ['/robots.txt', '/sitemap.xml']
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
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://soundcloud-playlist.netlify.app'
  },

  // Sitemap configuration
  sitemap: {
    hostname: process.env.NUXT_PUBLIC_SITE_URL || 'https://soundcloud-playlist.netlify.app',
    gzip: true,
    routes: [
      {
        url: '/',
        changefreq: 'daily',
        priority: 1.0
      },
      {
        url: '/track',
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: '/privacy',
        changefreq: 'monthly',
        priority: 0.3
      },
      {
        url: '/terms',
        changefreq: 'monthly',
        priority: 0.3
      }
    ]
  },

  // FIX: Performance optimizations to prevent connection issues
  experimental: {
    payloadExtraction: false,
    viewTransition: false,
    // FIX: Disable inline SSR styles that can cause loading issues
    inlineSSRStyles: false,
    // FIX: Use legacy async context for better compatibility
    asyncContext: false
  },

  // TypeScript configuration
  typescript: {
    typeCheck: false // Disable during development for faster startup
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

  // FIX: Disable source maps in development to prevent loading issues
  sourcemap: {
    server: false,
    client: false
  },
  
  // SSR configuration
  ssr: true,
  
  // FIX: Router configuration
  router: {
    options: {
      hashMode: false,
      scrollBehaviorType: 'smooth'
    }
  },
  
  // FIX: Add hooks for better error handling
  hooks: {
    'render:errorMiddleware': (app) => {
      if (process.env.NODE_ENV === 'development') {
        app.use((error, req, res, next) => {
          console.error('Development server error:', error)
          next(error)
        })
      }
    }
  }
})