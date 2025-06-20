import { Soundcloud } from 'soundcloud.ts'
import type { Track, SoundCloudTrack } from '@/types'

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

// Function to verify a client ID works
async function verifyClientId(clientId: string): Promise<boolean> {
  try {
    const testUrl = 'https://api-v2.soundcloud.com/tracks/1234?client_id=' + clientId
    const response = await fetch(testUrl)
    return response.status !== 401
  } catch {
    return false
  }
}

// Initialize with a working client ID
async function initializeClient() {
  for (const clientId of CLIENT_IDS) {
    if (await verifyClientId(clientId)) {
      soundcloud = new Soundcloud(clientId)
      console.log('Using verified client ID:', clientId)
      return
    }
  }
  throw new Error('No working client IDs found')
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
    return response.url
  } catch (error) {
    console.error('Error resolving mobile URL:', error)
    throw error
  }
}

// Get stream URL with multiple methods and retry
async function getStreamUrl(track: SoundCloudTrack, retryCount = 0): Promise<string | null> {
  const methods = [
    async () => {
      try {
        return await soundcloud.util.streamLink(track.id.toString())
      } catch {
        return null
      }
    },
    async () => {
      return await soundcloud.util.streamLink(track.permalink_url)
    },
    async () => {
      return await soundcloud.util.streamLink(track.id.toString())
    },
    async () => {
      const trackDetails = await soundcloud.tracks.get(track.id.toString())
      if (trackDetails.media?.transcodings) {
        const progressive = trackDetails.media.transcodings.find(t => t.format.protocol === 'progressive')
        if (progressive?.url) {
          return progressive.url
        }
      }
      return null
    }
  ]

  for (let i = 0; i < methods.length; i++) {
    try {
      const streamUrl = await methods[i]()
      if (streamUrl) {
        console.log(`Got stream URL for track ${track.id} using method ${i + 1}`)
        return streamUrl
      }
    } catch (error: any) {
      console.log(`Method ${i + 1} failed for track ${track.id}:`, error.message)
      if (error.message.includes('client_id') || error.message.includes('Client ID')) {
        if (retryCount < 1) {
          console.log('Client ID invalid, trying next one...')
          tryNextClientId()
          return getStreamUrl(track, retryCount + 1)
        }
      }

      // Handle rate limiting
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
        console.log(`Rate limited, waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        if (retryCount < 3) {
          return getStreamUrl(track, retryCount + 1)
        }
      }
    }
  }

  return null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let { url } = query

  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Track URL is required'
    })
  }

  // Initialize the client with a working client ID
  await initializeClient()

  try {
    // Handle mobile URLs
    if (url.includes('soundcloud.app.goo.gl')) {
      url = await resolveMobileUrl(url)
    }

    // Clean the URL
    url = cleanUrl(url)
    console.log('Processing track URL:', url)

    // Get track data with retry logic
    let trackRes: SoundCloudTrack | null = null
    let retryCount = 0
    const maxRetries = 5

    while (retryCount < maxRetries && !trackRes) {
      try {
        trackRes = await soundcloud.tracks.get(url) as SoundCloudTrack
      } catch (error: any) {
        retryCount++
        console.error(`Attempt ${retryCount}/${maxRetries} failed:`, error.message)

        if (error.status === 401 || error.message.includes('client_id')) {
          tryNextClientId()
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else if (retryCount === maxRetries) {
          throw error
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      }
    }

    if (!trackRes) {
      throw new Error('Failed to fetch track after multiple attempts')
    }

    console.log(`Found track: ${trackRes.title}`)

    // Get stream URL using the same logic as playlist
    const streamUrl = await getStreamUrl(trackRes)

    // Format track response
    const track: Track = {
      id: trackRes.id.toString(),
      title: trackRes.title,
      artist: trackRes.user.username,
      duration: trackRes.duration,
      artwork: trackRes.artwork_url?.replace('-large', '-t500x500') || 
        trackRes.user.avatar_url?.replace('-large', '-t500x500') ||
        'https://secure.gravatar.com/avatar/?size=500&default=mm',
      artwork_url: trackRes.artwork_url,
      url: trackRes.permalink_url,
      streamUrl
    }

    return { track }

  } catch (error: any) {
    console.error('Error fetching track:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      url: url
    })

    let errorMessage = 'Failed to fetch track. '

    if (error.status === 404) {
      errorMessage = 'The track could not be found. Please make sure the URL is correct.'
    } else if (error.status === 403) {
      errorMessage = 'Access to this track is restricted.'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed. Please try again.'
    } else if (error.message.includes('not found')) {
      errorMessage = 'Track not found. Please make sure the URL is correct.'
    } else if (error.message.includes('rate limit') || error.status === 429) {
      errorMessage = 'Too many requests. Please try again in a few minutes.'
    } else {
      errorMessage += 'Please make sure the URL is correct and the track is public.'
    }

    throw createError({
      statusCode: error.status || 500,
      message: errorMessage,
      data: {
        originalError: error.message,
        url: url
      }
    })
  }
})