import { Soundcloud } from 'soundcloud.ts'
import { getClientId } from '../utils/soundcloud'
import type { SoundCloudAPITrack } from '~/types'

let soundcloud: Soundcloud

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'Track URL is required'
    })
  }

  console.log('Fallback: Getting stream URL for track:', url)

  try {
    // Initialize SoundCloud client with valid client ID
    const clientId = await getClientId()
    soundcloud = new Soundcloud(clientId)

    // Extract track ID from URL if possible
    let trackId = url
    const urlMatch = url.match(/soundcloud\.com\/[^\/]+\/([^\/\?]+)/)
    if (urlMatch) {
      trackId = urlMatch[1]
    }

    // Try alternative methods with longer delays and proper client ID handling
    const methods = [
      // Method 1: Get track details first, then stream
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        const trackDetails = await soundcloud.tracks.get(url) as SoundCloudAPITrack
        if (!trackDetails?.media?.transcodings) {
          throw new Error('No transcoding data available')
        }
        const mp3Transcoding = trackDetails.media.transcodings.find(t => 
          t.format?.protocol === 'progressive' && 
          t.format?.mime_type === 'audio/mpeg'
        )
        if (mp3Transcoding?.url) {
          const response = await fetch(`${mp3Transcoding.url}?client_id=${clientId}`)
          if (!response.ok) throw new Error(`Failed to get stream: ${response.status}`)
          const data = await response.json()
          return data.url
        }
        throw new Error('No MP3 progressive stream available')
      },
      
      // Method 2: Try HLS stream if available
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        const trackDetails = await soundcloud.tracks.get(url) as SoundCloudAPITrack
        if (!trackDetails?.media?.transcodings) {
          throw new Error('No transcoding data available')
        }
        const hlsTranscoding = trackDetails.media.transcodings.find(t =>
          t.format?.protocol === 'hls' &&
          t.format?.mime_type === 'audio/mpeg'
        )
        if (hlsTranscoding?.url) {
          const response = await fetch(`${hlsTranscoding.url}?client_id=${clientId}`)
          if (!response.ok) throw new Error(`Failed to get stream: ${response.status}`)
          const data = await response.json()
          return data.url
        }
        throw new Error('No HLS stream available')
      },
      
      // Method 3: Try with track ID if extracted
      async () => {
        if (trackId === url) {
          throw new Error('No track ID available')
        }
        await new Promise(resolve => setTimeout(resolve, 2500))
        const newClientId = await getClientId() // Get fresh client ID
        soundcloud = new Soundcloud(newClientId)
        const trackDetails = await soundcloud.tracks.get(trackId) as SoundCloudAPITrack
        if (!trackDetails?.media?.transcodings) {
          throw new Error('No transcoding data available')
        }
        // Try both progressive and HLS
        const transcoding = trackDetails.media.transcodings.find(t => 
          (t.format?.protocol === 'progressive' || t.format?.protocol === 'hls') && 
          t.format?.mime_type === 'audio/mpeg'
        )
        if (transcoding?.url) {
          const response = await fetch(`${transcoding.url}?client_id=${newClientId}`)
          if (!response.ok) throw new Error(`Failed to get stream: ${response.status}`)
          const data = await response.json()
          return data.url
        }
        throw new Error('No suitable stream found')
      }
    ]

    let lastError = null
    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`Fallback: Trying method ${i + 1}...`)
        const streamUrl = await methods[i]()
        if (streamUrl) {
          console.log(`Fallback: Got stream URL using method ${i + 1}`)
          return { streamUrl, method: i + 1 }
        }
      } catch (methodError: any) {
        lastError = methodError
        console.log(`Fallback method ${i + 1} failed:`,
          methodError instanceof Error ? methodError.message : 'Unknown error')
        
        if (methodError.message?.includes('401') || methodError.message?.includes('client_id')) {
          // Try to get a new client ID if the current one is invalid
          const newClientId = await getClientId()
          soundcloud = new Soundcloud(newClientId)
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else if (methodError.message?.includes('429')) {
          console.log('Fallback: Rate limited, waiting 10 seconds...')
          await new Promise(resolve => setTimeout(resolve, 10000))
        } else {
          // Regular delay between retries
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }
    }

    throw createError({
      statusCode: 404,
      message: `All fallback methods failed to get stream URL. Last error: ${lastError?.message || 'Unknown error'}`
    })

  } catch (error: any) {
    console.error('Fallback error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fallback failed to get stream URL'
    })
  }
})
