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
  
  // Optimized Vite configuration for faster builds
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
    
    // Server configuration
    server: {
      fs: {
        strict: false
      }
    },
    
    // CSS optimization
    css: {
      devSourcemap: false
    }
  },
  
  // Optimized Nitro configuration
  nitro: {
    // Minification
    minify: true,
    
    // Compression
    compressPublicAssets: true,
    
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

  // Performance optimizations
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false,
    viewTransition: false
  },

  // TypeScript configuration
  typescript: {
    typeCheck: process.env.NODE_ENV === 'development' ? 'build' : false
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

  // Source map configuration (disable in production)
  sourcemap: {
    server: false,
    client: process.env.NODE_ENV === 'development'
  }
})