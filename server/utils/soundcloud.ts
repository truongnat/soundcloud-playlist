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
    const html = await response.text()

    // Extract the client ID from the page scripts
    const clientIdMatch = html.match(/client_id:"([a-zA-Z0-9]+)"/)
    if (clientIdMatch && clientIdMatch[1]) {
      cachedClientId = clientIdMatch[1]
      lastClientIdFetch = now
      return cachedClientId
    }
  } catch (error) {
    console.error('Failed to fetch SoundCloud client ID:', error)
  }

  return null
}
