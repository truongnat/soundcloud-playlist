import { Soundcloud } from 'soundcloud.ts'
import type { 
  SoundCloudUser,
  SoundCloudTrack, 
  SoundCloudPlaylist,
  ProcessedTrack,
  PlaylistResponse 
} from '@/types'

const soundcloud = new Soundcloud()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'Playlist URL is required'
    })
  }

  try {
    console.log('Fetching playlist from URL:', url)

    // Get playlist data
    const playlist = await soundcloud.playlists.get(url) as SoundCloudPlaylist
    console.log(`Found playlist: ${playlist.title} with ${playlist.track_count} tracks`)

    // Process tracks
    const tracks: ProcessedTrack[] = await Promise.all(
      playlist.tracks.map(async (track: SoundCloudTrack) => {
        const trackInfo: ProcessedTrack = {
          id: track.id,
          title: track.title,
          artist: track.user.username,
          duration: track.duration,
          artwork: track.artwork_url?.replace('-large', '-t500x500') || 
                  track.user.avatar_url ||
                  'https://secure.gravatar.com/avatar/?size=500&default=mm',
          url: track.permalink_url,
          streamUrl: null
        }

        try {
          // Try multiple methods to get the stream URL with retry logic
          const methods = [
            // Method 1: From track details
            async () => {
              const trackDetails = await soundcloud.tracks.get(track.permalink_url)
              return await soundcloud.util.streamLink(trackDetails.permalink_url)
            },
            // Method 2: Directly from track ID
            async () => {
              return await soundcloud.util.streamLink(track.id.toString())
            },
            // Method 3: From track URL
            async () => {
              return await soundcloud.util.streamLink(track.permalink_url)
            },
            // Method 4: Alternative approach using track ID directly
            async () => {
              return await soundcloud.util.streamLink(`https://soundcloud.com/track/${track.id}`)
            },
            // Method 5: Try with different client approach
            async () => {
              const trackDetails = await soundcloud.tracks.get(track.id.toString())
              return await soundcloud.util.streamLink(trackDetails.id.toString())
            }
          ]

          let methodIndex = 0
          for (const method of methods) {
            methodIndex++
            try {
              const streamUrl = await method()
              if (streamUrl) {
                console.log(`Got stream URL for track ${track.id} using method ${methodIndex}`)
                trackInfo.streamUrl = streamUrl
                break
              }
            } catch (methodError: any) {
              const errorMsg = methodError instanceof Error ? methodError.message : 'Unknown error'

              // Check for rate limiting
              if (errorMsg.includes('429') || errorMsg.includes('Too Many Requests')) {
                console.log(`Method ${methodIndex} failed for track ${track.id}: Rate limited, waiting...`)
                // Wait before trying next method
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
              } else {
                console.log(`Method ${methodIndex} failed for track ${track.id}:`, errorMsg)
              }
            }
          }

          if (!trackInfo.streamUrl) {
            console.log(`Failed to get stream URL for track ${track.id} after trying all methods`)
          }

        } catch (trackError) {
          console.error(`Error processing track ${track.id}:`, 
            trackError instanceof Error ? trackError.message : 'Unknown error')
        }

        return trackInfo
      })
    )

    const response: PlaylistResponse = {
      id: playlist.id,
      title: playlist.title,
      description: playlist.description || '',
      artwork: playlist.artwork_url?.replace('-large', '-t500x500') || null,
      tracksCount: playlist.track_count,
      tracks
    }

    return response

  } catch (error: any) {
    console.error('Error fetching playlist:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })

    let errorMessage = 'Failed to fetch playlist. '
    if (error.status === 404) {
      errorMessage = 'The playlist could not be found. Please make sure the URL is correct.'
    } else if (error.status === 403) {
      errorMessage = 'Access to this playlist is restricted.'
    } else if (error.message.includes('not found')) {
      errorMessage = 'Playlist not found. Please make sure the URL is correct.'
    } else {
      errorMessage += 'Please make sure the URL is correct and the playlist is public.'
    }

    throw createError({
      statusCode: error.status || 500,
      message: errorMessage,
      data: error
    })
  }
})
