import { Soundcloud } from 'soundcloud.ts'
import { getClientId } from '@/server/utils/soundcloud'

let soundcloud: Soundcloud

// Initialize soundcloud client with a valid client ID
async function initializeSoundcloud() {
  try {
    const clientId = await getClientId()
    soundcloud = new Soundcloud(clientId)
    console.log('Initialized SoundCloud client with client ID:', clientId)
  } catch (error) {
    console.error('Failed to initialize SoundCloud client:', error)
    throw error
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'Track URL is required'
    })
  }

  console.log('Getting stream URL for track:', url)

  // Initialize the SoundCloud client
  await initializeSoundcloud()

  try {
    // Try multiple methods to get the stream URL
    const methods = [
      // Method 1: From track details
      async () => {
        const trackDetails = await soundcloud.tracks.get(url)
        return await soundcloud.util.streamLink(trackDetails.permalink_url)
      },
      // Method 2: Directly from URL
      async () => {
        return await soundcloud.util.streamLink(url)
      },
      // Method 3: Retry with fresh client ID
      async () => {
        await initializeSoundcloud()
        return await soundcloud.util.streamLink(url)
      }
    ]

    for (const method of methods) {
      try {
        const streamUrl = await method()
        if (streamUrl) {
          console.log('Got stream URL using method', methods.indexOf(method) + 1)
          return { streamUrl }
        }
      } catch (methodError: any) {
        console.log(`Method ${methods.indexOf(method) + 1} failed:`,
          methodError instanceof Error ? methodError.message : 'Unknown error')
        
        // If client ID error, reinitialize for next method
        if (methodError.message?.includes('client_id') || methodError.message?.includes('401')) {
          await initializeSoundcloud()
        }
      }
    }

    throw createError({
      statusCode: 404,
      message: 'Could not get stream URL for track'
    })

  } catch (error: any) {
    console.error('Error getting stream URL:', error)
    
    let errorMessage = 'Failed to get stream URL'
    if (error.message?.includes('Could not obtain a valid client ID')) {
      errorMessage = 'SoundCloud API is temporarily unavailable. Please try again later.'
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: errorMessage
    })
  }
})