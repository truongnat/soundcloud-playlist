import { Soundcloud } from 'soundcloud.ts'
import { getClientId } from '../utils/soundcloud'
import type { Track, SoundCloudAPITrack } from '~/types'

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

  console.log('Getting track info for:', url)

  try {
    // Initialize SoundCloud client
    const clientId = await getClientId()
    soundcloud = new Soundcloud(clientId)

    // Get track details
    const trackData = await soundcloud.tracks.get(url) as SoundCloudAPITrack
    
    if (!trackData) {
      throw createError({
        statusCode: 404,
        message: 'Track not found'
      })
    }

    // Convert to our Track format
    const track: Track = {
      id: trackData.id.toString(),
      title: trackData.title || 'Unknown Title',
      artist: trackData.user?.username || 'Unknown Artist',
      duration: trackData.duration || 0,
      artwork: trackData.artwork_url?.replace('-large', '-t500x500') || '/default-artwork.jpg',
      artwork_url: trackData.artwork_url,
      url: trackData.permalink_url || url,
      streamUrl: null // Will be fetched when downloading
    }

    console.log('Successfully fetched track:', track.title)

    return {
      track,
      success: true
    }

  } catch (error: any) {
    console.error('Track fetch error:', error)
    
    // Handle specific error cases
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw createError({
        statusCode: 404,
        message: 'Track not found. Please check the URL and make sure the track is public.'
      })
    }
    
    if (error.message?.includes('401') || error.message?.includes('client_id')) {
      throw createError({
        statusCode: 401,
        message: 'Unable to access SoundCloud API. Please try again later.'
      })
    }
    
    if (error.message?.includes('429')) {
      throw createError({
        statusCode: 429,
        message: 'Too many requests. Please wait a moment and try again.'
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to fetch track information'
    })
  }
})