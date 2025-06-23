const CACHE_NAME = 'soundcloud-dl-v1'
const STATIC_CACHE = 'soundcloud-dl-static-v1'
const DYNAMIC_CACHE = 'soundcloud-dl-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/track',
  '/faq',
  '/favicon.ico',
  '/site.webmanifest',
  '/offline.html'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests (except for SoundCloud API)
  if (url.origin !== location.origin && !url.hostname.includes('soundcloud.com')) {
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response
          }
          return fetch(request)
            .then(response => {
              // Cache successful navigation responses
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    cache.put(request, responseClone)
                  })
              }
              return response
            })
            .catch(() => {
              // Return offline page if available
              return caches.match('/offline.html')
            })
        })
    )
    return
  }

  // Handle static assets
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request)
        })
    )
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses for short time
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache for API requests
          return caches.match(request)
        })
    )
    return
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then(response => {
        if (response) {
          return response
        }
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, responseClone)
                })
            }
            return response
          })
      })
  )
})

// Background sync for failed downloads
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-download') {
    event.waitUntil(
      // Handle background download sync
      handleBackgroundDownload()
    )
  }
})

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'Open App',
          icon: '/favicon-192x192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/favicon-192x192.png'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Helper function for background downloads
async function handleBackgroundDownload() {
  try {
    // Get pending downloads from IndexedDB or localStorage
    const pendingDownloads = await getPendingDownloads()
    
    for (const download of pendingDownloads) {
      try {
        await processDownload(download)
        await removePendingDownload(download.id)
      } catch (error) {
        console.error('Background download failed:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Placeholder functions for download management
async function getPendingDownloads() {
  // Implementation would depend on your storage strategy
  return []
}

async function processDownload(download) {
  // Implementation for processing downloads
  return Promise.resolve()
}

async function removePendingDownload(id) {
  // Implementation for removing completed downloads
  return Promise.resolve()
}