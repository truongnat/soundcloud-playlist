interface SEOOptions {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  twitterCard?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  locale?: string
  siteName?: string
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  structuredData?: any
}

export const useSEO = (options: SEOOptions = {}) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  
  const siteUrl = config.public.siteUrl || 'https://soundcloud-dl.com'
  const siteName = options.siteName || 'SoundCloud Playlist Downloader'
  
  // Default values
  const defaults = {
    title: 'SoundCloud Playlist Downloader - Download Music & Playlists Free',
    description: 'Free SoundCloud playlist downloader. Download entire playlists, convert to MP3, and save your favorite tracks. Fast, easy, and completely free online tool with bulk download support.',
    keywords: 'soundcloud downloader, playlist downloader, soundcloud to mp3, music downloader, soundcloud converter, bulk download, free music download',
    image: `${siteUrl}/og-image.jpg`,
    type: 'website',
    twitterCard: 'summary_large_image',
    author: 'SoundCloud DL',
    locale: 'en_US'
  }
  
  // Merge options with defaults
  const seo = { ...defaults, ...options }
  
  // Generate full URL
  const fullUrl = options.url || `${siteUrl}${route.path}`
  const canonicalUrl = options.canonical || fullUrl
  
  // Build robots content
  let robotsContent = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  if (options.noindex) robotsContent = robotsContent.replace('index', 'noindex')
  if (options.nofollow) robotsContent = robotsContent.replace('follow', 'nofollow')
  
  // Build meta tags
  const metaTags = [
    { name: 'description', content: seo.description },
    { name: 'keywords', content: seo.keywords },
    { name: 'author', content: seo.author },
    { name: 'robots', content: robotsContent },
    { name: 'googlebot', content: robotsContent },
    { name: 'bingbot', content: 'index, follow' },
    
    // Open Graph
    { property: 'og:title', content: seo.title },
    { property: 'og:description', content: seo.description },
    { property: 'og:type', content: seo.type },
    { property: 'og:url', content: fullUrl },
    { property: 'og:image', content: seo.image },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: seo.locale },
    
    // Twitter Card
    { name: 'twitter:card', content: seo.twitterCard },
    { name: 'twitter:title', content: seo.title },
    { name: 'twitter:description', content: seo.description },
    { name: 'twitter:image', content: seo.image },
    { name: 'twitter:creator', content: '@soundcloudDL' },
    { name: 'twitter:site', content: '@soundcloudDL' },
    
    // Additional meta tags
    { name: 'theme-color', content: '#f97316' },
    { name: 'msapplication-TileColor', content: '#f97316' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'format-detection', content: 'telephone=no' }
  ]
  
  // Add article-specific meta tags
  if (seo.type === 'article') {
    if (seo.publishedTime) {
      metaTags.push({ property: 'article:published_time', content: seo.publishedTime })
    }
    if (seo.modifiedTime) {
      metaTags.push({ property: 'article:modified_time', content: seo.modifiedTime })
    }
    if (seo.section) {
      metaTags.push({ property: 'article:section', content: seo.section })
    }
    if (seo.tags) {
      seo.tags.forEach(tag => {
        metaTags.push({ property: 'article:tag', content: tag })
      })
    }
  }
  
  // Build link tags
  const linkTags = [
    { rel: 'canonical', href: canonicalUrl },
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'manifest', href: '/site.webmanifest' }
  ]
  
  // Build structured data scripts
  const scripts = []
  
  // Default structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: siteName,
    description: seo.description,
    url: siteUrl,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    creator: {
      '@type': 'Organization',
      name: 'SoundCloud DL',
      url: siteUrl
    },
    featureList: [
      'Download entire SoundCloud playlists',
      'Convert to high-quality MP3 format',
      'Bulk download multiple tracks',
      'Free and unlimited downloads',
      'No registration required',
      'Fast processing speed',
      'Mobile-friendly interface'
    ]
  }
  
  // Add default structured data
  scripts.push({
    type: 'application/ld+json',
    children: JSON.stringify(defaultStructuredData)
  })
  
  // Add custom structured data if provided
  if (options.structuredData) {
    scripts.push({
      type: 'application/ld+json',
      children: JSON.stringify(options.structuredData)
    })
  }
  
  // Apply SEO settings
  useHead({
    title: seo.title,
    meta: metaTags,
    link: linkTags,
    script: scripts
  })
  
  // Return SEO data for potential use in components
  return {
    title: seo.title,
    description: seo.description,
    url: fullUrl,
    image: seo.image,
    structuredData: options.structuredData || defaultStructuredData
  }
}

// Specific SEO presets for different page types
export const useHomepageSEO = () => {
  return useSEO({
    title: 'SoundCloud Playlist Downloader - Free MP3 Download Tool',
    description: 'Download entire SoundCloud playlists and individual tracks for free. Convert to high-quality MP3 format. Fast, easy, and completely free online tool with bulk download support.',
    keywords: 'soundcloud downloader, playlist downloader, soundcloud to mp3, music downloader, bulk download, free music download, soundcloud converter',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'SoundCloud Playlist Downloader',
      description: 'Free online tool to download SoundCloud playlists and convert to MP3',
      url: 'https://soundcloud-dl.com',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
        bestRating: '5'
      }
    }
  })
}

export const useTrackPageSEO = () => {
  return useSEO({
    title: 'Download Single SoundCloud Track - Free MP3 Converter',
    description: 'Download individual SoundCloud tracks and convert to MP3 format. High-quality audio conversion with fast download speeds. Completely free and easy to use.',
    keywords: 'soundcloud track downloader, single track download, soundcloud to mp3, individual track converter, free music download',
    url: 'https://soundcloud-dl.com/track'
  })
}

export const useFAQSEO = () => {
  return useSEO({
    title: 'FAQ - SoundCloud Playlist Downloader Help & Support',
    description: 'Frequently asked questions about downloading SoundCloud playlists and tracks. Get help with our free MP3 converter and downloader tool.',
    keywords: 'soundcloud downloader faq, help, support, how to download, troubleshooting, soundcloud to mp3 help',
    url: 'https://soundcloud-dl.com/faq',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is it legal to download SoundCloud tracks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'You should only download tracks that you have permission to download or that are available under Creative Commons licenses.'
          }
        },
        {
          '@type': 'Question',
          name: 'Is this service free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, our SoundCloud playlist downloader is completely free to use with no limitations.'
          }
        }
      ]
    }
  })
}

export const usePrivacySEO = () => {
  return useSEO({
    title: 'Privacy Policy - SoundCloud Playlist Downloader',
    description: 'Privacy policy for SoundCloud Playlist Downloader. Learn how we protect your data and privacy when downloading music and playlists.',
    keywords: 'privacy policy, data protection, soundcloud downloader privacy, user data, security',
    url: 'https://soundcloud-dl.com/privacy',
    noindex: false // Keep indexed for transparency
  })
}

export const useTermsSEO = () => {
  return useSEO({
    title: 'Terms of Service - SoundCloud Playlist Downloader',
    description: 'Terms of service for SoundCloud Playlist Downloader. Read our terms and conditions for using our free music download service.',
    keywords: 'terms of service, terms and conditions, soundcloud downloader terms, legal, user agreement',
    url: 'https://soundcloud-dl.com/terms',
    noindex: false // Keep indexed for transparency
  })
}