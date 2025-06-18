import { Soundcloud } from 'soundcloud.ts'
import type { Track, SoundCloudTrack } from '@/types'
import type { H3Error } from 'h3'

// List of known working client IDs
const CLIENT_IDS = [
  '1JEFtFgP4Mocy0oEGJj2zZ0il9pEpBrM',
  'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX',
  'ccCB37jIWCBP7JB9SnUPPui8LzeaQT45',
  '6ibGdGJqSm8F5DPvKPJMODIzhlvKbDks',
]

let currentClientIdIndex = 0
let soundcloud = new Soundcloud(CLIENT_IDS[currentClientIdIndex])

// Function to try the next client ID
const tryNextClientId = () => {
  currentClientIdIndex = (currentClientIdIndex + 1) % CLIENT_IDS.length
  const nextClientId = CLIENT_IDS[currentClientIdIndex]
  console.log('Switching to next client ID:', nextClientId)
  soundcloud = new Soundcloud(nextClientId)
  return nextClientId
}

// Clean up the URL by removing tracking parameters
function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Convert mobile URLs to web URLs
    if (urlObj.hostname === 'soundcloud.app.goo.gl') {
      return url // We'll handle mobile URLs differently
    }
    // Remove known tracking parameters
    ;['si', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
      urlObj.searchParams.delete(param)
    })
    return urlObj.toString().split('?')[0]
  } catch (e) {
    console.error('Error cleaning URL:', e)
    return url
  }
}

// Handle mobile URLs
async function resolveMobileUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      }
    })
    if (response.ok) {
      return response.url
    }
  } catch (e) {
    console.error('Error resolving mobile URL:', e)
  }
  return url
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let { url } = query
  
  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Missing or invalid track URL'
    })
  }

  // Handle mobile URLs
  if (url.includes('soundcloud.app.goo.gl')) {
    url = await resolveMobileUrl(url)
  }

  // Clean the URL
  url = cleanUrl(url)
  console.log('Processing URL:', url)

  // Try with each client ID until success or all fail
  for (let attempt = 0; attempt < CLIENT_IDS.length; attempt++) {
    try {
      // Get track info
      console.log('Attempting to fetch track with client ID:', soundcloud.clientId)
      const trackRes = await soundcloud.resolve(url)

      if (!trackRes || !('id' in trackRes)) {
        console.error('Invalid track response:', trackRes)
        throw new Error('Invalid track data received')
      }

      // Get stream URL
      console.log('Getting stream URL for track:', trackRes.id)
      const streamUrl = await soundcloud.getStreamUrl(trackRes.id.toString())
      console.log('Got stream URL:', streamUrl)

      // Format the response
      const track: Track = {
        id: trackRes.id,
        title: trackRes.title,
        artist: trackRes.user.username,
        duration: trackRes.duration,
        artwork: trackRes.artwork_url?.replace('-large', '-t500x500') || 'https://api.soundcloud.com/img/default_avatar_500x500.jpg',
        artwork_url: trackRes.artwork_url,
        url: trackRes.permalink_url,
        streamUrl
      }

      return { track }

    } catch (error: any) {
      console.error('Error with current client ID:', error)
      
      // If this is a 401/403 error, try the next client ID
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        if (attempt < CLIENT_IDS.length - 1) {
          tryNextClientId()
          continue
        }
      }
      
      // If this was our last attempt, throw the error
      if (attempt === CLIENT_IDS.length - 1) {
        throw createError({
          statusCode: 500,
          message: 'Failed to fetch track after trying all available client IDs'
        })
      }
    }
  }

  // This should never be reached
  throw createError({
    statusCode: 500,
    message: 'Unexpected error occurred'
  })
})
