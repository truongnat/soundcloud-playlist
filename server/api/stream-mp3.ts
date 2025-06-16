import { Soundcloud } from 'soundcloud.ts'
import { Track } from '~/types'

const clientId = process.env.NUXT_SOUNDCLOUD_CLIENT_ID as string
const soundcloud = new Soundcloud(clientId)

interface StreamResponse {
  streamUrl: string
  isHLS: boolean
  track: Track
}

function getTranscoding(trackDetails: any) {
  // Find MP3 transcoding
  const mp3Transcoding = trackDetails.media.transcodings.find((t: any) => 
    t.format.protocol === 'progressive' && 
    t.format.mime_type === 'audio/mpeg'
  )
  
  if (mp3Transcoding) {
    return {
      url: mp3Transcoding.url,
      isHLS: false
    }
  }

  // Try to find HLS stream instead
  const hlsTranscoding = trackDetails.media.transcodings.find((t: any) =>
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
    isHLS: true
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

    // Get track details with retry logic
    let trackDetails
    const maxRetries = 3
    let attempt = 0

    while (attempt < maxRetries) {
      try {
        trackDetails = await soundcloud.tracks.get(url)
        break
      } catch (error: any) {
        attempt++
        if (attempt === maxRetries) {
          throw createError({
            statusCode: 404,
            message: 'Could not get track details: ' + (error.message || 'Unknown error')
          })
        }

        // Wait before retry, especially for rate limiting
        const delay = 1000 * attempt + Math.random() * 1000
        console.log(`Retry ${attempt}/${maxRetries} for track details after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    // Get transcoding URL and type
    const { url: transcodingUrl, isHLS } = getTranscoding(trackDetails)

    // Get stream URL with retry logic
    let streamData
    attempt = 0

    while (attempt < maxRetries) {
      try {
        const response = await fetch(transcodingUrl + '?client_id=' + clientId)

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, wait longer
            const delay = 2000 * (attempt + 1) + Math.random() * 2000
            console.log(`Rate limited, waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`)
            await new Promise(resolve => setTimeout(resolve, delay))
            attempt++
            continue
          }

          throw createError({
            statusCode: response.status,
            message: `Failed to get ${isHLS ? 'HLS' : 'MP3'} stream: ${response.statusText}`
          })
        }

        streamData = await response.json()
        if (!streamData?.url) {
          throw createError({
            statusCode: 500,
            message: `Invalid ${isHLS ? 'HLS' : 'MP3'} stream response`
          })
        }

        break // Success, exit retry loop

      } catch (error: any) {
        attempt++
        if (attempt === maxRetries) {
          throw error
        }

        const delay = 1000 * attempt + Math.random() * 1000
        console.log(`Stream URL fetch retry ${attempt}/${maxRetries} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return {
      streamUrl: data.url,
      isHLS,track: {
        id: trackDetails.id,
        title: trackDetails.title,
        artist: trackDetails.user.username,
        duration: trackDetails.duration,
        artwork: trackDetails.artwork_url || '',
        url: trackDetails.permalink_url,
        streamUrl: data.url
      }
    }

  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get audio stream'
    })
  }
})
