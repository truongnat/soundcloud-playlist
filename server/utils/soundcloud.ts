// Fallback client IDs if we can't fetch a new one
const FALLBACK_CLIENT_IDS = [
  'T26Olo5VaFwfbJtWjYtvIFx3vOe4v84D',
  'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX',
  'ccCB37jIWCBP7JB9SnUPPui8LzeaQT45',
  '6ibGdGJqSm8F5DPvKPJMODIzhlvKbDks',
  'YxQYlFPNletSoRrR0HDh95hgf8V8HxS5'
]

let currentFallbackIndex = 0
let cachedClientId: string | null = null
const CLIENT_ID_VALIDITY = 3600 * 1000 // 1 hour
let lastClientIdFetch = 0

// Validate if a client ID is still working
async function validateClientId(clientId: string): Promise<boolean> {
  try {
    const testUrl = `https://api.soundcloud.com/tracks/1234?client_id=${clientId}`
    const response = await fetch(testUrl)
    // Even if the track doesn't exist (404), if we don't get a 401/403, the client ID is valid
    return response.status !== 401 && response.status !== 403
  } catch (error) {
    console.error('Error validating client ID:', error)
    return false
  }
}

async function getFallbackClientId(): Promise<string | null> {
  for (let i = 0; i < FALLBACK_CLIENT_IDS.length; i++) {
    const clientId = FALLBACK_CLIENT_IDS[currentFallbackIndex]
    currentFallbackIndex = (currentFallbackIndex + 1) % FALLBACK_CLIENT_IDS.length
    
    console.log('Trying fallback client ID:', clientId)
    if (await validateClientId(clientId)) {
      console.log('Found working fallback client ID:', clientId)
      return clientId
    }
  }
  return null
}

export async function getClientId(): Promise<string> {
  const now = Date.now()
  
  // Return cached client ID if it's still valid
  if (cachedClientId && now - lastClientIdFetch < CLIENT_ID_VALIDITY) {
    // Validate the cached client ID
    if (await validateClientId(cachedClientId)) {
      return cachedClientId
    }
    // If validation fails, clear the cache and continue
    cachedClientId = null
  }

  // Try to get a new client ID from SoundCloud
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} to fetch new client ID`)
      
      // Fetch the SoundCloud main page
      const response = await fetch('https://soundcloud.com', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch SoundCloud page: ${response.status}`)
      }
      
      const html = await response.text()

      // First try to find the client ID in the main HTML
      const patterns = [
        /client_id:"([a-zA-Z0-9]+)"/,
        /https:\/\/api-v2\.soundcloud\.com\?client_id=([a-zA-Z0-9]+)/,
        /https:\/\/api\.soundcloud\.com\/tracks\/[0-9]+\?client_id=([a-zA-Z0-9]+)/
      ]

      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match && match[1]) {
          const foundId = match[1]
          if (await validateClientId(foundId)) {
            cachedClientId = foundId
            lastClientIdFetch = now
            console.log('Found and validated new client ID:', foundId)
            return foundId
          }
        }
      }

      // If no valid client ID found in main HTML, try the scripts
      const scriptUrls = html.match(/https:\/\/a-v2\.sndcdn\.com\/assets\/[0-9]+-[a-zA-Z0-9]+\.js/g)
      if (scriptUrls) {
        for (const url of scriptUrls) {
          try {
            console.log('Checking script:', url)
            const scriptRes = await fetch(url)
            if (!scriptRes.ok) continue
            
            const scriptContent = await scriptRes.text()
            const clientIdMatch = scriptContent.match(/client_id:"([a-zA-Z0-9]+)"/)
            
            if (clientIdMatch && clientIdMatch[1]) {
              const foundId = clientIdMatch[1]
              if (await validateClientId(foundId)) {
                cachedClientId = foundId
                lastClientIdFetch = now
                console.log('Found and validated new client ID from script:', foundId)
                return foundId
              }
            }
          } catch (e) {
            console.error('Failed to fetch script:', url, e)
            continue
          }
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error)
      if (attempt === 2) {
        console.log('All attempts to fetch new client ID failed, trying fallback IDs')
        const fallbackId = await getFallbackClientId()
        if (fallbackId) {
          cachedClientId = fallbackId
          lastClientIdFetch = now
          return fallbackId
        }
        throw new Error('Could not obtain a valid client ID')
      }
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  throw new Error('Could not obtain a valid client ID')
}
