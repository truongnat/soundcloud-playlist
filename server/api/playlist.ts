import { Soundcloud } from 'soundcloud.ts'
import { getClientId } from '@/server/utils/soundcloud'
import type {
  SoundCloudUser,
  SoundCloudTrack,
  SoundCloudPlaylist,
  ProcessedTrack,
  PlaylistResponse
} from '@/types'

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

// Clean up the URL by removing tracking parameters
function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Convert mobile URLs to web URLs
    if (urlObj.hostname === 'soundcloud.app.goo.gl') {
      return url; // We'll handle mobile URLs differently
    }
    // Remove known tracking parameters
    ['si', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString().split('?')[0];
  } catch (e) {
    console.error('Error cleaning URL:', e);
    return url;
  }
}

// Handle mobile URLs
async function resolveMobileUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
      }
    });
    return response.url;
  } catch (error) {
    console.error('Error resolving mobile URL:', error);
    throw error;
  }
}

// Get stream URL with multiple methods and retry
async function getStreamUrl(track: SoundCloudTrack, retryCount = 0): Promise<string | null> {
  const methods = [
    // Method 1: Try to get stream URL directly from track
    async () => {
      try {
        return await soundcloud.util.streamLink(track.id.toString());
      } catch {
        return null;
      }
    },
    // Method 2: Stream URL from track URL
    async () => {
      return await soundcloud.util.streamLink(track.permalink_url);
    },
    // Method 3: Stream URL from track ID
    async () => {
      return await soundcloud.util.streamLink(track.id.toString());
    },
    // Method 4: Fetch new track details and try again
    async () => {
      const trackDetails = await soundcloud.tracks.get(track.id.toString());
      if (trackDetails.media?.transcodings) {
        const progressive = trackDetails.media.transcodings.find(t => t.format.protocol === 'progressive');
        if (progressive?.url) {
          return progressive.url;
        }
      }
      return null;
    }
  ];

  for (let i = 0; i < methods.length; i++) {
    try {
      const streamUrl = await methods[i]();
      if (streamUrl) {
        console.log(`Got stream URL for track ${track.id} using method ${i + 1}`)
        return streamUrl;
      }
    } catch (error: any) {
      console.log(`Method ${i + 1} failed for track ${track.id}:`, error.message);
      
      if (error.message.includes('client_id') || error.message.includes('Client ID') || error.status === 401) {
        if (retryCount < 1) {
          console.log('Client ID error, reinitializing SoundCloud client...');
          await initializeSoundcloud();
          return getStreamUrl(track, retryCount + 1);
        }
      }

      // Handle rate limiting
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`Rate limited, waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        if (retryCount < 3) {
          return getStreamUrl(track, retryCount + 1);
        }
      }
    }
  }

  return null;
}

// Get all tracks with pagination and retry logic
async function getAllPlaylistTracks(playlist: SoundCloudPlaylist, playlistUrl: string): Promise<SoundCloudTrack[]> {
  const allTracks: SoundCloudTrack[] = [];
  const limit = 50;
  let offset = 0;
  let retryCount = 0;
  const maxRetries = 5;

  while (offset < playlist.track_count) {
    try {
      console.log(`Fetching tracks ${offset} to ${offset + limit} of ${playlist.track_count}`);

      let playlistData: SoundCloudPlaylist | null = null;
      let fetchRetries = 0;

      while (fetchRetries < 3 && !playlistData) {
        try {
          playlistData = await soundcloud.playlists.get(playlistUrl + `?limit=${limit}&offset=${offset}`) as SoundCloudPlaylist;
        } catch (error: any) {
          fetchRetries++;
          if (error.status === 401 || error.message.includes('client_id')) {
            console.log('Client ID error, reinitializing SoundCloud client...');
            await initializeSoundcloud();
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw error;
          }
        }
      }
      
      if (!playlistData || !playlistData.tracks || playlistData.tracks.length === 0) {
        throw new Error('No tracks received in response');
      }

      allTracks.push(...playlistData.tracks);
      offset += playlistData.tracks.length;
      retryCount = 0;

      // Add delay to avoid rate limit
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error: any) {
      console.error(`Error fetching tracks at offset ${offset}:`, error);

      retryCount++;
      if (retryCount >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached for offset ${offset}`);
        break;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      console.log(`Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return allTracks;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'Playlist URL is required'
    })
  }

  // Set timeout for serverless environment
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 25000) // 25 seconds for Netlify
  })

  try {
    const result = await Promise.race([
      processPlaylist(url),
      timeoutPromise
    ])
    return result
  } catch (error: any) {
    console.error('Error in playlist handler:', error)
    
    // Handle timeout specifically
    if (error.message === 'Request timeout') {
      throw createError({
        statusCode: 504,
        message: 'Request timed out. The playlist might be too large or SoundCloud is slow to respond. Please try again or use a smaller playlist.'
      })
    }

    let errorMessage = 'Failed to fetch playlist. '

    if (error.status === 404) {
      errorMessage = 'The playlist could not be found. Please make sure the URL is correct.'
    } else if (error.status === 403) {
      errorMessage = 'Access to this playlist is restricted.'
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed. Please try again.'
    } else if (error.message.includes('not found')) {
      errorMessage = 'Playlist not found. Please make sure the URL is correct.'
    } else if (error.message.includes('rate limit') || error.status === 429) {
      errorMessage = 'Too many requests. Please try again in a few minutes.'
    } else if (error.message.includes('Could not obtain a valid client ID')) {
      errorMessage = 'SoundCloud API is temporarily unavailable. Please try again later.'
    } else {
      errorMessage += 'Please make sure the URL is correct and the playlist is public.'
    }

    throw createError({
      statusCode: error.status || 500,
      message: errorMessage,
      data: {
        originalError: error.message,
        url: url
      }
    })
  }
})

async function processPlaylist(url: string): Promise<PlaylistResponse> {
  // Initialize the SoundCloud client
  await initializeSoundcloud()

  // Handle mobile URLs
  if (url.includes('soundcloud.app.goo.gl')) {
    url = await resolveMobileUrl(url)
  }

  // Clean the URL before processing
  url = cleanUrl(url)
  console.log('Processing playlist URL:', url)

  // Get initial playlist data with reduced retry logic for serverless
  let playlist: SoundCloudPlaylist | null = null
  let retryCount = 0
  const maxRetries = 2 // Reduced for serverless

  while (retryCount < maxRetries && !playlist) {
    try {
      playlist = await soundcloud.playlists.get(url) as SoundCloudPlaylist
    } catch (error: any) {
      retryCount++
      console.error(`Attempt ${retryCount}/${maxRetries} failed:`, error.message)

      if (error.status === 401 || error.message.includes('client_id')) {
        // Reinitialize SoundCloud client with new client ID
        await initializeSoundcloud()
        await new Promise(resolve => setTimeout(resolve, 500)) // Reduced delay
      } else if (retryCount === maxRetries) {
        throw error
      } else {
        // Reduced wait time for serverless
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  if (!playlist) {
    throw new Error('Failed to fetch playlist after multiple attempts')
  }

  console.log(`Found playlist: ${playlist.title} with ${playlist.track_count} tracks`)

  // Limit tracks for serverless environment to avoid timeout
  const maxTracks = 50 // Limit for serverless
  const limitedTrackCount = Math.min(playlist.track_count, maxTracks)
  
  // Get tracks with reduced pagination for faster response
  const allTracks = await getAllPlaylistTracksLimited(playlist, url, limitedTrackCount)
  console.log(`Successfully fetched ${allTracks.length} of ${playlist.track_count} tracks`)

  if (allTracks.length === 0) {
    throw new Error('No tracks could be fetched from the playlist')
  }

  // Process tracks with reduced batch size and faster processing
  const batchSize = 3 // Reduced for serverless
  const tracks: ProcessedTrack[] = []

  for (let i = 0; i < allTracks.length; i += batchSize) {
    const batch = allTracks.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (track: SoundCloudTrack) => {
        const trackInfo: ProcessedTrack = {
          id: track.id.toString(),
          title: track.title,
          artist: track.user.username,
          duration: track.duration,
          artwork: track.artwork_url?.replace('-large', '-t500x500') ||
            track.user.avatar_url?.replace('-large', '-t500x500') ||
            'https://secure.gravatar.com/avatar/?size=500&default=mm',
          url: track.permalink_url,
          streamUrl: null
        }

        // Skip stream URL fetching for faster response in serverless
        // Stream URLs will be fetched on-demand by a separate endpoint
        return trackInfo
      })
    )

    tracks.push(...batchResults)

    // Reduced delay for serverless
    if (i + batchSize < allTracks.length) {
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  const response: PlaylistResponse = {
    playlistInfo: {
      id: playlist.id,
      title: playlist.title,
      description: playlist.description || '',
      artwork: playlist.artwork_url?.replace('-large', '-t500x500') || 'https://secure.gravatar.com/avatar/?size=500&default=mm',
      tracksCount: playlist.track_count,
    },
    tracks
  }

  return response
}

// Optimized version for serverless with limits
async function getAllPlaylistTracksLimited(playlist: SoundCloudPlaylist, playlistUrl: string, maxTracks: number): Promise<SoundCloudTrack[]> {
  const allTracks: SoundCloudTrack[] = [];
  const limit = 20; // Reduced batch size
  let offset = 0;
  let retryCount = 0;
  const maxRetries = 2; // Reduced retries

  while (offset < Math.min(playlist.track_count, maxTracks)) {
    try {
      console.log(`Fetching tracks ${offset} to ${offset + limit} of ${Math.min(playlist.track_count, maxTracks)}`);

      let playlistData: SoundCloudPlaylist | null = null;
      let fetchRetries = 0;

      while (fetchRetries < 2 && !playlistData) { // Reduced retries
        try {
          playlistData = await soundcloud.playlists.get(playlistUrl + `?limit=${limit}&offset=${offset}`) as SoundCloudPlaylist;
        } catch (error: any) {
          fetchRetries++;
          if (error.status === 401 || error.message.includes('client_id')) {
            console.log('Client ID error, reinitializing SoundCloud client...');
            await initializeSoundcloud();
            await new Promise(resolve => setTimeout(resolve, 300)); // Reduced delay
          } else {
            throw error;
          }
        }
      }
      
      if (!playlistData || !playlistData.tracks || playlistData.tracks.length === 0) {
        throw new Error('No tracks received in response');
      }

      allTracks.push(...playlistData.tracks);
      offset += playlistData.tracks.length;
      retryCount = 0;

      // Reduced delay for serverless
      await new Promise(resolve => setTimeout(resolve, 300));

      // Break if we've reached our limit
      if (allTracks.length >= maxTracks) {
        break;
      }

    } catch (error: any) {
      console.error(`Error fetching tracks at offset ${offset}:`, error);

      retryCount++;
      if (retryCount >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached for offset ${offset}`);
        break;
      }

      // Reduced backoff for serverless
      const delay = Math.min(500 * Math.pow(2, retryCount), 2000);
      console.log(`Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return allTracks.slice(0, maxTracks); // Ensure we don't exceed the limit
}