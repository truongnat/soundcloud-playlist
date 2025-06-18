import { getClientId } from '~/server/utils/soundcloud'
import { Track, SoundCloudTrack } from '~/types'

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  
  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Missing or invalid track URL'
    })
  }
  let clientId: string | null = null
  try {
    clientId = await getClientId()
  } catch (error: any) {
    console.error('Error getting client ID:', error)
    throw createError({
      statusCode: 500,
      message: `Failed to get SoundCloud client ID: ${error.message || 'Unknown error'}`
    })
  }

  if (!clientId) {
    throw createError({
      statusCode: 500,
      message: 'Could not obtain SoundCloud client ID'
    })
  }

  // Get track info from SoundCloud API  // Get track info from SoundCloud API
  try {
    const trackRes = await $fetch<SoundCloudTrack>(`https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}&client_id=${clientId}`, {
      retry: 3,
      retryDelay: 1000
    })
  
  if (!trackRes || !trackRes.id) {
    throw createError({
      statusCode: 404,
      message: 'Track not found'
    })
  }

  interface StreamResponse {
    http_mp3_128_url: string
  }

  // Get the track streaming URL
  const streamData = await $fetch<StreamResponse>(`https://api.soundcloud.com/tracks/${trackRes.id}/streams?client_id=${clientId}`)
  if (!streamData || !streamData.http_mp3_128_url) {
    throw createError({
      statusCode: 404,
      message: 'Track stream not found'
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
})
