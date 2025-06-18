let cachedClientId: string | null = null
const CLIENT_ID_VALIDITY = 3600 * 1000 // 1 hour
let lastClientIdFetch = 0

export async function getClientId(): Promise<string | null> {
  const now = Date.now()
  
  // Return cached client ID if it's still valid
  if (cachedClientId && now - lastClientIdFetch < CLIENT_ID_VALIDITY) {
    return cachedClientId
  }

  try {
    // Fetch the SoundCloud main page
    const response = await fetch('https://soundcloud.com')
    if (!response.ok) {
      throw new Error(`Failed to fetch SoundCloud page: ${response.status}`)
    }
    
    const html = await response.text()

    // Try different patterns to find the client ID
    const patterns = [
      /client_id:"([a-zA-Z0-9]+)"/,
      /https:\/\/api-v2\.soundcloud\.com\?client_id=([a-zA-Z0-9]+)/,
      /https:\/\/api\.soundcloud\.com\/tracks\/[0-9]+\?client_id=([a-zA-Z0-9]+)/
    ]

    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && match[1]) {
        cachedClientId = match[1]
        lastClientIdFetch = now
        return cachedClientId
      }
    }

    // If no pattern matches, try to find any script containing the client ID
    const scriptUrls = html.match(/https:\/\/a-v2\.sndcdn\.com\/assets\/[0-9]+-[a-zA-Z0-9]+\.js/g)
    if (scriptUrls) {
      for (const url of scriptUrls) {
        try {
          const scriptRes = await fetch(url)
          if (!scriptRes.ok) continue
          
          const scriptContent = await scriptRes.text()
          const clientIdMatch = scriptContent.match(/client_id:"([a-zA-Z0-9]+)"/)
          if (clientIdMatch && clientIdMatch[1]) {
            cachedClientId = clientIdMatch[1]
            lastClientIdFetch = now
            return cachedClientId
          }
        } catch (e) {
          console.error('Failed to fetch script:', e)
          continue
        }
      }
    }

    throw new Error('Could not find client ID in any script')
  } catch (error) {
    console.error('Failed to fetch SoundCloud client ID:', error)
    throw error // Rethrow the error so it can be handled by the caller
  }
}
