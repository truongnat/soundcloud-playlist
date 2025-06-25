import { Soundcloud } from 'soundcloud.ts'
import type { Track, StreamResponse, SoundCloudAPITrack } from '~/types'
import { getClientId } from '../utils/soundcloud'
import { getTranscoding, getStreamUrl } from '~/utils/soundcloud'
import { withConnectionRetry, isConnectionError } from '~/utils/connection-handler'

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
    let clientId = await getClientId()
    soundcloud = new Soundcloud(clientId)

    // Get track details with enhanced connection retry logic
    const trackDetails = await withConnectionRetry(async () => {
      try {
        const response = await soundcloud.tracks.get(url)
        if (!response || !('media' in response)) {
          throw new Error('Invalid track response')
        }
        return response as SoundCloudAPITrack
      } catch (error: any) {
        // Handle client ID issues
        if (error.status === 401 || error.message?.includes('client_id')) {
          console.log('Client ID issue detected, refreshing...')
          const newClientId = await getClientId()
          soundcloud = new Soundcloud(newClientId)
          clientId = newClientId
          throw error // Will be retried with new client ID
        }
        
        // Handle connection errors specifically
        if (isConnectionError(error)) {
          console.error('Connection error getting track details:', error.message)
        }
        
        throw error
      }
    }, {
      maxRetries: 4,
      baseDelay: 1500,
      timeout: 15000,
      retryCondition: (error) => {
        return isConnectionError(error) || 
               error.status === 401 || 
               error.message?.includes('client_id') ||
               error.status === 429
      }
    })

    // Get transcoding URL and type
    const transcoding = getTranscoding(trackDetails)

    // Get stream URL with enhanced connection retry logic
    const streamUrl = await withConnectionRetry(async () => {
      try {
        return await getStreamUrl(transcoding.url, clientId)
      } catch (error: any) {
        // Handle client ID issues for stream URL
        if (error.message?.includes('401') || error.message?.includes('client_id')) {
          console.log('Client ID issue in stream URL, refreshing...')
          const newClientId = await getClientId()
          soundcloud = new Soundcloud(newClientId)
          clientId = newClientId
          throw error // Will be retried with new client ID
        }
        
        if (isConnectionError(error)) {
          console.error('Connection error getting stream URL:', error.message)
        }
        
        throw error
      }
    }, {
      maxRetries: 3,
      baseDelay: 1200,
      timeout: 12000,
      retryCondition: (error) => {
        return isConnectionError(error) || 
               error.message?.includes('401') || 
               error.message?.includes('client_id') ||
               error.status === 429
      }
    })

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
    
    // Provide more specific error messages for connection issues
    if (isConnectionError(error)) {
      throw createError({
        statusCode: 503,
        message: 'Service temporarily unavailable due to connection issues. Please try again in a moment.'
      })
    }
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to process track'
    })
  }
})