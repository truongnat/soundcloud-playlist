import { Soundcloud } from 'soundcloud.ts'
import { getClientId } from '@/server/utils/soundcloud'
import type { SoundCloudTrack } from '@/types'

let soundcloud: Soundcloud

// Initialize soundcloud client with a valid client ID
async function initializeSoundcloud() {
  try {
    const clientId = await getClientId()
    soundcloud = new Soundcloud(clientId)
    console.log('Initialized SoundCloud client for stream URL')
  } catch (error) {
    console.error('Failed to initialize SoundCloud client:', error)
    throw error
  }
}

// Get stream URL with timeout and retry
async function getStreamUrlWithTimeout(trackId: string, retryCount = 0): Promise<string | null> {
  const timeoutPromise = new Promise<null>((_, reject) => {
    setTimeout(() => reject(new Error('Stream URL fetch timeout')), 8000) // 8 second timeout
  })

  const methods = [
    // Method 1: Try to get stream URL directly from track ID
    async () => {
      try {
        return await soundcloud.util.streamLink(trackId);
      } catch {
        return null;
      }
    },
    // Method 2: Get track details and extract stream URL
    async () => {
      const trackDetails = await soundcloud.tracks.get(trackId);
      if (trackDetails.media?.transcodings) {
        const progressive = trackDetails.media.transcodings.find(t => t.format.protocol === 'progressive');
        if (progressive?.url) {
          return progressive.url;
        }
      }
      return null;
    }
  ];

  for (let i = 0; i < methods.length; i++) {
    try {
      const streamUrlPromise = methods[i]();
      const streamUrl = await Promise.race([streamUrlPromise, timeoutPromise]);
      
      if (streamUrl) {
        console.log(`Got stream URL for track ${trackId} using method ${i + 1}`)
        return streamUrl;
      }
    } catch (error: any) {
      console.log(`Method ${i + 1} failed for track ${trackId}:`, error.message);
      
      if (error.message === 'Stream URL fetch timeout') {
        console.log('Stream URL fetch timed out');
        break;
      }
      
      if (error.message.includes('client_id') || error.message.includes('Client ID') || error.status === 401) {
        if (retryCount < 1) {
          console.log('Client ID error, reinitializing SoundCloud client...');
          await initializeSoundcloud();
          return getStreamUrlWithTimeout(trackId, retryCount + 1);
        }
      }
    }
  }

  return null;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const trackId = query.trackId as string

  if (!trackId) {
    throw createError({
      statusCode: 400,
      message: 'Track ID is required'
    })
  }

  try {
    // Initialize the SoundCloud client
    await initializeSoundcloud()

    const streamUrl = await getStreamUrlWithTimeout(trackId)

    if (!streamUrl) {
      throw createError({
        statusCode: 404,
        message: 'Stream URL not found for this track'
      })
    }

    return {
      trackId,
      streamUrl
    }

  } catch (error: any) {
    console.error('Error fetching stream URL:', error)

    let errorMessage = 'Failed to fetch stream URL. '

    if (error.status === 404) {
      errorMessage = 'Track not found.'
    } else if (error.status === 403) {
      errorMessage = 'Access to this track is restricted.'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed.'
    } else if (error.message.includes('Could not obtain a valid client ID')) {
      errorMessage = 'SoundCloud API is temporarily unavailable.'
    }

    throw createError({
      statusCode: error.status || 500,
      message: errorMessage,
      data: {
        originalError: error.message,
        trackId: trackId
      }
    })
  }
})