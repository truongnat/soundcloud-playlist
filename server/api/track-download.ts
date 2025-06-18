import { getClientId } from '~/server/utils/soundcloud'
import type { Track, SoundCloudTrack } from '~/types'
import type { H3Error } from 'h3'

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  
  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Missing or invalid track URL'
    })
  }

  // Remove tracking parameters from URL
  const cleanUrl = url.split('?')[0]

  // Maximum retries for the whole process
  const MAX_RETRIES = 3
  let lastError: Error | H3Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      let clientId: string
      try {
        clientId = await getClientId()
        console.log('Got client ID:', clientId)
      } catch (error: any) {
        console.error('Error getting client ID:', error)
        throw createError({
          statusCode: 500,
          message: `Failed to get SoundCloud client ID: ${error.message || 'Unknown error'}`
        })
      }

      let trackRes: SoundCloudTrack
      try {
        // Get track info from SoundCloud API
        console.log('Fetching track info for URL:', cleanUrl)
        trackRes = await $fetch<SoundCloudTrack>(
          `https://api.soundcloud.com/resolve?url=${encodeURIComponent(cleanUrl)}&client_id=${clientId}`,
          {
            retry: 2,
            retryDelay: 1000
          }
        )
        console.log('Track info fetched successfully')
      } catch (error: any) {
        console.error('Error fetching track:', error)
        lastError = error
        // If we get a 401/403, invalidate the client ID and try again
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Client ID seems invalid, retrying with new one')
          continue
        }
        throw createError({
          statusCode: error.response?.status || 500,
          message: 'Failed to fetch track information'
        })
      }

      if (!trackRes || !trackRes.id) {
        throw createError({
          statusCode: 404,
          message: 'Track not found or invalid track data received'
        })
      }

      interface StreamResponse {
        http_mp3_128_url: string
      }

      let streamData: StreamResponse
      try {
        // Get the track streaming URL
        console.log('Fetching stream URL for track:', trackRes.id)
        streamData = await $fetch<StreamResponse>(
          `https://api.soundcloud.com/tracks/${trackRes.id}/streams?client_id=${clientId}`,
          {
            retry: 2,
            retryDelay: 1000
          }
        )
        console.log('Stream URL fetched successfully')
      } catch (error: any) {
        console.error('Error fetching stream URL:', error)
        lastError = error
        // If we get a 401/403, invalidate the client ID and try again
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Client ID seems invalid when fetching stream, retrying with new one')
          continue
        }
        throw createError({
          statusCode: error.response?.status || 500,
          message: 'Failed to get track streaming URL'
        })
      }

      if (!streamData || !streamData.http_mp3_128_url) {
        throw createError({
          statusCode: 404,
          message: 'Track stream URL not found or unavailable'
        })
      }

      // Format the response
      const track: Track = {
        id: trackRes.id,
        title: trackRes.title,
        artist: trackRes.user.username,
        duration: trackRes.duration,
        artwork: trackRes.artwork_url?.replace('-large', '-t500x500') || 'https://api.soundcloud.com/img/default_avatar_500x500.jpg',
        artwork_url: trackRes.artwork_url,
        url: trackRes.permalink_url,
        streamUrl: streamData.http_mp3_128_url
      }

      return { track }
    } catch (error) {
      if (error instanceof Error || 'data' in (error as any)) {
        lastError = error as Error | H3Error
      } else {
        lastError = new Error('Unknown error occurred')
      }

      if (attempt === MAX_RETRIES - 1) {
        // If this was our last attempt, throw the error
        if (lastError && 'data' in lastError) {
          throw lastError // If it's already a H3Error, throw it as is
        }
        throw createError({
          statusCode: 500,
          message: `Failed after ${MAX_RETRIES} attempts: ${lastError?.message || 'Unknown error'}`
        })
      }
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  // This should never be reached due to the error throwing above
  throw createError({
    statusCode: 500,
    message: lastError?.message || 'Unknown error occurred'
  })
})
