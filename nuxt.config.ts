// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
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
      title: 'SoundCloud Playlist Downloader - Download Music & Playlists Free',
      meta: [
        { name: 'description', content: 'Free SoundCloud playlist downloader. Download entire playlists, convert to MP3, and save your favorite tracks. Fast, easy, and completely free online tool with bulk download support.' },
        { name: 'keywords', content: 'soundcloud downloader, playlist downloader, soundcloud to mp3, music downloader, soundcloud converter, bulk download, free music download, soundcloud playlist converter, download soundcloud music, soundcloud mp3 converter' },
        { name: 'author', content: 'SoundCloud DL' },
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { name: 'bingbot', content: 'index, follow' },
        { name: 'language', content: 'English' },
        { name: 'geo.region', content: 'US' },
        { name: 'geo.placename', content: 'United States' },
        { name: 'distribution', content: 'global' },
        { name: 'rating', content: 'general' },
        { name: 'revisit-after', content: '7 days' },
        
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'SoundCloud Playlist Downloader - Free Music Download Tool' },
        { property: 'og:description', content: 'Download entire SoundCloud playlists and convert to MP3. Fast, free, and easy to use online tool for music lovers.' },
        { property: 'og:image', content: '/og-image.jpg' },
        { property: 'og:url', content: 'https://soundcloud-playlist.netlify.app' },
        { property: 'og:site_name', content: 'SoundCloud DL' },
        { property: 'og:locale', content: 'en_US' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'SoundCloud Playlist Downloader - Free Music Download' },
        { name: 'twitter:description', content: 'Download entire SoundCloud playlists and convert to MP3. Fast, free, and easy to use.' },
        { name: 'twitter:image', content: '/twitter-card.jpg' },
        { name: 'twitter:creator', content: '@soundcloudDL' },
        
        // Additional SEO
        { name: 'theme-color', content: '#f97316' },
        { name: 'msapplication-TileColor', content: '#f97316' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'canonical', href: 'https://soundcloud-playlist.netlify.app' },
        { rel: 'preload', href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
      ]
    }
  },
  
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
    },
    server: {
      fs: {
        strict: false
      }
    }
  },
  nitro: {
    routeRules: {
      '/**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'unsafe-none',
          'Cross-Origin-Opener-Policy': 'same-origin'
        }
      },
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      },
      '/_nuxt/**': {
        headers: {
          'Cache-Control': 'max-age=31536000'
        }
      }
    },
    experimental: {
      wasm: true
    },
    prerender: {
      routes: ['/robots.txt']
    }
  },
  runtimeConfig: {
    // Server-side environment variables
    public: {
      // Client-side environment variables
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://soundcloud-playlist.netlify.app'
    }
  },

  // Site configuration for sitemap
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://soundcloud-playlist.netlify.app'
  },

  // Enhanced SEO Configuration
  sitemap: {
    sources: [
      '/api/__sitemap__/urls'
    ]
  },

  // Performance optimizations for SEO
  experimental: {
    payloadExtraction: false
  },

  // Build configuration
  build: {
    transpile: ['@headlessui/vue']
  }
})