import { computed } from 'vue'

interface SEOOptions {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export const useSEOOptimized = (options: SEOOptions = {}) => {
  const { $config } = useNuxtApp()
  const route = useRoute()
  
  const siteUrl = $config.public.siteUrl || 'https://soundcloud-playlist.netlify.app'
  
  const seoData = computed(() => {
    const baseTitle = 'SoundCloud Playlist Downloader'
    const baseDescription = 'Free SoundCloud playlist downloader. Download entire playlists, convert to MP3, and save your favorite tracks. Fast, easy, and completely free online tool with bulk download support.'
    
    return {
      title: options.title ? `${options.title} - ${baseTitle}` : `${baseTitle} - Download Music & Playlists Free`,
      description: options.description || baseDescription,
      keywords: options.keywords || 'soundcloud downloader, playlist downloader, soundcloud to mp3, music downloader, soundcloud converter, bulk download, free music download, soundcloud playlist converter, download soundcloud music, soundcloud mp3 converter',
      image: options.image || '/og-image.jpg',
      url: options.url || `${siteUrl}${route.path}`,
      type: options.type || 'website'
    }
  })
  
  // Set meta tags
  useHead(() => ({
    title: seoData.value.title,
    meta: [
      { name: 'description', content: seoData.value.description },
      { name: 'keywords', content: seoData.value.keywords },
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
      { property: 'og:type', content: seoData.value.type },
      { property: 'og:title', content: seoData.value.title },
      { property: 'og:description', content: seoData.value.description },
      { property: 'og:image', content: seoData.value.image },
      { property: 'og:url', content: seoData.value.url },
      { property: 'og:site_name', content: 'SoundCloud DL' },
      { property: 'og:locale', content: 'en_US' },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: seoData.value.title },
      { name: 'twitter:description', content: seoData.value.description },
      { name: 'twitter:image', content: seoData.value.image },
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
      { rel: 'canonical', href: seoData.value.url },
      { rel: 'preload', href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
    ]
  }))
  
  return {
    seoData: readonly(seoData)
  }
}