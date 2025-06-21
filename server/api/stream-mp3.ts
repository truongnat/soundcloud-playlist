import { Soundcloud } from 'soundcloud.ts'
import type { Track, StreamResponse, SoundCloudAPITrack } from '~/types'
import { getClientId } from '../utils/soundcloud'
import { getTranscoding, getStreamUrl } from '~/utils/soundcloud'
import { fetchWithRetry, handleApiError } from '~/utils/api'

let soundcloud: Soundcloud

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
        const response = await soundcloud.tracks.get(url)
        if (!response || !('media' in response)) {
          throw new Error('Invalid track response')
        }
        trackDetails = response as SoundCloudAPITrack
      } catch (error: any) {
        attempt++
        console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message)

        if (error.status === 401 || error.message?.includes('client_id')) {
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
        streamUrl = await getStreamUrl(transcoding.url, clientId)
      } catch (error: any) {
        attempt++
        console.error(`Stream URL attempt ${attempt}/${maxRetries} failed:`, error.message)

        if (error.message?.includes('401') || error.message?.includes('client_id')) {
          // Try to get a new client ID if the current one is invalid
          const newClientId = await getClientId()
          soundcloud = new Soundcloud(newClientId)
          clientId = newClientId
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else if (attempt === maxRetries) {
          throw createError({
            statusCode: 500,
            message: 'Failed to get stream URL after multiple attempts'
          })
        } else {
          const delay = 1000 * Math.pow(2, attempt) + Math.random() * 1000
          console.log(`Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
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
