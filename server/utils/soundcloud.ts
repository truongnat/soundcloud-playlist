// Fallback client IDs if we can't fetch a new one
const FALLBACK_CLIENT_IDS = [
  'T26Olo5VaFwfbJtWjYtvIFx3vOe4v84D',
  'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX', 
  'ccCB37jIWCBP7JB9SnUPPui8LzeaQT45',
  '6ibGdGJqSm8F5DPvKPJMODIzhlvKbDks',
  'YxQYlFPNletSoRrR0HDh95hgf8V8HxS5',
  '1JEFtFgP4Mocy0oEGJj2zZ0il9pEpBrM',
  'fDoItMDbsbZz8dY16ZzARCZmzgHBPotA',
  'LBCcHmRB8XSStWL6wKH2HPACspQlXcBf',
  'ghm28OZ1hnyZijjfPHBhIrWKoAHG8QzB',
  'apv2MQFrF9iHHicPqK4qFKNdUpO83plr'
]

let currentFallbackIndex = 0
let cachedClientId: string | null = null
const CLIENT_ID_VALIDITY = 900 * 1000 // 15 minutes (reduced for serverless)
let lastClientIdFetch = 0

// Validate if a client ID is still working
async function validateClientId(clientId: string): Promise<boolean> {
  try {
    // Use a more reliable test endpoint
    const testUrl = `https://api-v2.soundcloud.com/tracks/1234567890?client_id=${clientId}`
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    
    // Even if the track doesn't exist (404), if we don't get a 401/403, the client ID is valid
    const isValid = response.status !== 401 && response.status !== 403
    console.log(`Client ID ${clientId} validation: ${response.status} - ${isValid ? 'VALID' : 'INVALID'}`)
    return isValid
  } catch (error) {
    console.error('Error validating client ID:', error)
    return false
  }
}

async function getFallbackClientId(): Promise<string | null> {
  console.log('Trying fallback client IDs...')
  
  // Try all fallback IDs
  for (let i = 0; i < FALLBACK_CLIENT_IDS.length; i++) {
    const clientId = FALLBACK_CLIENT_IDS[currentFallbackIndex]
    currentFallbackIndex = (currentFallbackIndex + 1) % FALLBACK_CLIENT_IDS.length
    
    console.log(`Trying fallback client ID ${i + 1}/${FALLBACK_CLIENT_IDS.length}:`, clientId)
    if (await validateClientId(clientId)) {
      console.log('Found working fallback client ID:', clientId)
      return clientId
    }
  }
  
  console.log('No working fallback client IDs found')
  return null
}

// Try to extract client ID from SoundCloud's JavaScript files
async function extractClientIdFromScripts(): Promise<string | null> {
  try {
    console.log('Fetching SoundCloud main page...')
    const response = await fetch('https://soundcloud.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SoundCloud page: ${response.status}`)
    }
    
    const html = await response.text()

    // Try multiple patterns to find client ID
    const patterns = [
      /client_id:"([a-zA-Z0-9]{32})"/g,
      /client_id=([a-zA-Z0-9]{32})/g,
      /"client_id":"([a-zA-Z0-9]{32})"/g,
      /clientId:"([a-zA-Z0-9]{32})"/g,
      /CLIENT_ID:"([a-zA-Z0-9]{32})"/g
    ]

    for (const pattern of patterns) {
      const matches = [...html.matchAll(pattern)]
      for (const match of matches) {
        if (match[1] && match[1].length === 32) {
          const foundId = match[1]
          console.log('Found potential client ID in HTML:', foundId)
          if (await validateClientId(foundId)) {
            console.log('Validated client ID from HTML:', foundId)
            return foundId
          }
        }
      }
    }

    // Try to find and parse JavaScript files
    const scriptMatches = html.matchAll(/src="(https:\/\/a-v2\.sndcdn\.com\/assets\/[^"]+\.js)"/g)
    const scriptUrls = Array.from(scriptMatches).map(match => match[1]).slice(0, 5) // Limit to first 5 scripts

    for (const url of scriptUrls) {
      try {
        console.log('Checking script:', url)
        const scriptRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        })
        
        if (!scriptRes.ok) continue
        
        const scriptContent = await scriptRes.text()
        
        for (const pattern of patterns) {
          const matches = [...scriptContent.matchAll(pattern)]
          for (const match of matches) {
            if (match[1] && match[1].length === 32) {
              const foundId = match[1]
              console.log('Found potential client ID in script:', foundId)
              if (await validateClientId(foundId)) {
                console.log('Validated client ID from script:', foundId)
                return foundId
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch script:', url, e)
        continue
      }
    }
  } catch (error) {
    console.error('Error extracting client ID from scripts:', error)
  }
  
  return null
}

export async function getClientId(): Promise<string> {
  const now = Date.now()
  
  // Return cached client ID if it's still valid and recent
  if (cachedClientId && now - lastClientIdFetch < CLIENT_ID_VALIDITY) {
    console.log('Using cached client ID:', cachedClientId)
    if (await validateClientId(cachedClientId)) {
      return cachedClientId
    }
    console.log('Cached client ID is no longer valid, fetching new one...')
    cachedClientId = null
  }

  // Try to get a new client ID from SoundCloud
  console.log('Attempting to fetch new client ID from SoundCloud...')
  const newClientId = await extractClientIdFromScripts()
  
  if (newClientId) {
    cachedClientId = newClientId
    lastClientIdFetch = now
    return newClientId
  }

  // If that fails, try fallback client IDs
  console.log('Failed to fetch new client ID, trying fallback IDs...')
  const fallbackId = await getFallbackClientId()
  
  if (fallbackId) {
    cachedClientId = fallbackId
    lastClientIdFetch = now
    return fallbackId
  }

  // If all else fails, throw an error
  throw new Error('Could not obtain a valid client ID. All fallback client IDs have expired.')
}