export default defineNuxtPlugin(() => {
  // Add structured data for better SEO
  const addStructuredData = (data: any) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  // Organization structured data
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SoundCloud DL',
    url: 'https://soundcloud-playlist.netlify.app',
    logo: 'https://soundcloud-playlist.netlify.app/logo.png',
    description: 'Free SoundCloud playlist downloader and MP3 converter',
    sameAs: [
      'https://twitter.com/soundcloudDL',
      'https://github.com/soundcloud-dl'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@soundcloud-playlist.netlify.app'
    }
  }

  // Website structured data
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SoundCloud Playlist Downloader',
    url: 'https://soundcloud-playlist.netlify.app',
    description: 'Free online tool to download SoundCloud playlists and convert to MP3',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://soundcloud-playlist.netlify.app/?url={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SoundCloud DL',
      url: 'https://soundcloud-playlist.netlify.app'
    }
  }

  // Software Application structured data
  const softwareData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SoundCloud Playlist Downloader',
    description: 'Free online tool to download SoundCloud playlists and convert to MP3 format',
    url: 'https://soundcloud-playlist.netlify.app',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '2.0',
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    creator: {
      '@type': 'Organization',
      name: 'SoundCloud DL',
      url: 'https://soundcloud-playlist.netlify.app'
    },
    featureList: [
      'Download entire SoundCloud playlists',
      'Convert to high-quality MP3 format',
      'Bulk download multiple tracks',
      'Free and unlimited downloads',
      'No registration required',
      'Fast processing speed',
      'Mobile-friendly interface',
      'Background processing for large playlists'
    ],
    screenshot: 'https://soundcloud-playlist.netlify.app/screenshot.jpg',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1'
    }
  }

  // Add all structured data
  addStructuredData(organizationData)
  addStructuredData(websiteData)
  addStructuredData(softwareData)

  // Performance optimizations
  if (process.client) {
    // Preload critical resources
    const preloadResource = (href: string, as: string, type?: string) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = href
      link.as = as
      if (type) link.type = type
      document.head.appendChild(link)
    }

    // Preload critical fonts
    preloadResource('/fonts/inter.woff2', 'font', 'font/woff2')
    
    // Add DNS prefetch for external resources
    const dnsPrefetch = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = href
      document.head.appendChild(link)
    }

    dnsPrefetch('//soundcloud.com')
    dnsPrefetch('//i1.sndcdn.com')
    dnsPrefetch('//api.soundcloud.com')

    // Add preconnect for critical third-party domains
    const preconnect = (href: string) => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }

    preconnect('https://fonts.googleapis.com')
    preconnect('https://fonts.gstatic.com')

    // Lazy load non-critical images
    const lazyLoadImages = () => {
      const images = document.querySelectorAll('img[data-src]')
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = img.dataset.src!
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        })
      })

      images.forEach(img => imageObserver.observe(img))
    }

    // Initialize lazy loading after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', lazyLoadImages)
    } else {
      lazyLoadImages()
    }

    // Add service worker for caching (PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed, but don't break the app
      })
    }

    // Track Core Web Vitals
    const trackWebVitals = () => {
      // Track Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('LCP:', lastEntry.startTime)
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // Track First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          console.log('FID:', entry.processingStart - entry.startTime)
        })
      }).observe({ entryTypes: ['first-input'] })

      // Track Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        console.log('CLS:', clsValue)
      }).observe({ entryTypes: ['layout-shift'] })
    }

    // Initialize web vitals tracking
    trackWebVitals()
  }
})