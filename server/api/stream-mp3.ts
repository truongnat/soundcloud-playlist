import { Soundcloud } from 'soundcloud.ts'
import type { Track, StreamResponse, SoundCloudAPITrack } from '~/types'
import { getClientId } from '../utils/soundcloud'

let soundcloud: Soundcloud

function getTranscoding(trackDetails: SoundCloudAPITrack) {
  if (!trackDetails.media?.transcodings) {
    throw createError({
      statusCode: 404,
      message: 'No transcoding data available for this track'
    })
  }

  // Find MP3 transcoding
  const mp3Transcoding = trackDetails.media.transcodings.find(t => 
    t.format.protocol === 'progressive' && 
    t.format.mime_type === 'audio/mpeg'
  )
  
  if (mp3Transcoding) {
    return {
      url: mp3Transcoding.url,
      isHLS: false,
      duration: mp3Transcoding.duration,
      format: {
        protocol: 'progressive' as const,
        mimeType: mp3Transcoding.format.mime_type
      }
    }
  }

  // Try to find HLS stream instead
  const hlsTranscoding = trackDetails.media.transcodings.find(t =>
    t.format.protocol === 'hls' &&
    t.format.mime_type === 'audio/mpeg'
  )

  if (!hlsTranscoding) {
    throw createError({
      statusCode: 404,
      message: 'No suitable audio stream found for this track'
    })
  }

  return {
    url: hlsTranscoding.url,
    isHLS: true,
    duration: hlsTranscoding.duration,
    format: {
      protocol: 'hls' as const,
      mimeType: hlsTranscoding.format.mime_type
    }
  }
}

export default defineEventHandler(async (event): Promise<StreamResponse> => {
  try {
    const query = getQuery(event)
    const url = query.url as string

    if (!url) {
      throw createError({
        statusCode: 400,
        message: 'Track URL is required'
      })
    }

    // Initialize SoundCloud client
    const clientId = await getClientId()
    soundcloud = new Soundcloud(clientId)

    // Get track details with retry logic
    let trackDetails: SoundCloudAPITrack | null = null
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries && !trackDetails) {
      try {
        trackDetails = await soundcloud.tracks.get(url) as SoundCloudAPITrack
      } catch (error: any) {
        attempt++
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message)

        if (error.status === 401 || error.message.includes('client_id')) {
          // Try to get a new client ID if the current one is invalid
          const newClientId = await getClientId()
          soundcloud = new Soundcloud(newClientId)
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else if (attempt === maxRetries) {
          throw createError({
            statusCode: 404,
            message: 'Could not get track details: ' + (error.message || 'Unknown error')
          })
        } else {
          // Wait before retry with exponential backoff
          const delay = 1000 * Math.pow(2, attempt) + Math.random() * 1000
          console.log(`Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    if (!trackDetails) {
      throw createError({
        statusCode: 404,
        message: 'Could not get track details after multiple attempts'
      })
    }

    // Get transcoding URL and type
    const transcoding = getTranscoding(trackDetails)

    // Get stream URL with retry logic
    let streamUrl: string | null = null
    attempt = 0

    while (attempt < maxRetries && !streamUrl) {
      try {
        const response = await fetch(`${transcoding.url}?client_id=${clientId}`)

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, wait longer
            const delay = 5000 * Math.pow(2, attempt)
            console.log(`Rate limited, waiting ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            attempt++
            continue
          }

          throw new Error(`Failed to get stream URL: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        streamUrl = data.url
      } catch (error: any) {
        attempt++
        console.error(`Stream URL attempt ${attempt}/${maxRetries} failed:`, error.message)

        if (error.status === 401 || error.message.includes('client_id')) {
          // Try to get a new client ID if the current one is invalid
          const newClientId = await getClientId()
          soundcloud = new Soundcloud(newClientId)
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else if (attempt === maxRetries) {
          throw createError({
            statusCode: 500,
            message: 'Failed to get stream URL after multiple attempts'
          })
        }
      }
    }

    if (!streamUrl) {
      throw createError({
        statusCode: 404,
        message: 'Could not get stream URL'
      })
    }

    // Format response
    const track: Track = {
      id: trackDetails.id,
      title: trackDetails.title,
      artist: trackDetails.user.username,
      duration: trackDetails.duration,
      artwork: trackDetails.artwork_url?.replace('-large', '-t500x500') || 
        trackDetails.user.avatar_url?.replace('-large', '-t500x500') ||
        'https://secure.gravatar.com/avatar/?size=500&default=mm',
      artwork_url: trackDetails.artwork_url,
      url: trackDetails.permalink_url,
      streamUrl
    }

    return {
      streamUrl,
      isHLS: transcoding.isHLS,
      track,
      duration: transcoding.duration,
      format: transcoding.format
    }

  } catch (error: any) {
    console.error('Error in stream-mp3:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to process track'
    })
  }
})
