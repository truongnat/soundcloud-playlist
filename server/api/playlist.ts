import { Soundcloud } from 'soundcloud.ts'
import type {
  SoundCloudUser,
  SoundCloudTrack,
  SoundCloudPlaylist,
  ProcessedTrack,
  PlaylistResponse
} from '@/types'

// List of known working client IDs
const CLIENT_IDS = [
  '1JEFtFgP4Mocy0oEGJj2zZ0il9pEpBrM',
  'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX',
  'ccCB37jIWCBP7JB9SnUPPui8LzeaQT45',
  '6ibGdGJqSm8F5DPvKPJMODIzhlvKbDks',
]

let currentClientIdIndex = 0
let soundcloud = new Soundcloud(CLIENT_IDS[currentClientIdIndex])

// Function to try the next client ID
const tryNextClientId = () => {
  currentClientIdIndex = (currentClientIdIndex + 1) % CLIENT_IDS.length
  const nextClientId = CLIENT_IDS[currentClientIdIndex]
  console.log('Switching to next client ID:', nextClientId)
  soundcloud = new Soundcloud(nextClientId)
  return nextClientId
}

// Hàm để lấy client ID mới từ SoundCloud web
async function getNewClientId(): Promise<string> {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }

    const response = await fetch('https://soundcloud.com/', { headers });
    const html = await response.text();

    // Find the app script
    const scriptMatch = html.match(/https:\/\/[^"]+app-[^"]+\.js/);
    if (!scriptMatch) return tryNextClientId();

    const scriptUrl = scriptMatch[0];
    const scriptResponse = await fetch(scriptUrl, { headers });
    const scriptContent = await scriptResponse.text();

    // Look for client_id in the script
    const clientIdMatch = scriptContent.match(/,client_id:"([^"]+)"/);
    if (clientIdMatch?.[1]) {
      console.log('Found new client ID:', clientIdMatch[1]);
      CLIENT_IDS.push(clientIdMatch[1]); // Add to our list
      return clientIdMatch[1];
    }
  } catch (error) {
    console.error('Error getting new client ID:', error);
  }

  return tryNextClientId();
}

// Function to verify a client ID works
async function verifyClientId(clientId: string): Promise<boolean> {
  try {
    const testUrl = 'https://api-v2.soundcloud.com/tracks/1234?client_id=' + clientId;
    const response = await fetch(testUrl);
    return response.status !== 401;
  } catch {
    return false;
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

// Hàm xử lý mobile URL
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

// Initialize with a working client ID
async function initializeClient() {
  for (const clientId of CLIENT_IDS) {
    if (await verifyClientId(clientId)) {
      soundcloud = new Soundcloud(clientId);
      console.log('Using verified client ID:', clientId);
      return;
    }
  }

  // If no existing client IDs work, try to get a new one
  const newClientId = await getNewClientId();
  if (await verifyClientId(newClientId)) {
    soundcloud = new Soundcloud(newClientId);
    console.log('Using new client ID:', newClientId);
  }
}

// Hàm lấy stream URL với nhiều phương thức và retry
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
      if (error.message.includes('client_id') || error.message.includes('Client ID')) {
        if (retryCount < 1) {
          console.log('Updating client ID and retrying...');
          const newClientId = await getNewClientId();
          soundcloud = new Soundcloud(newClientId);
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



// Hàm lấy tất cả tracks với pagination và retry logic
async function getAllPlaylistTracks(playlist: SoundCloudPlaylist, playlistUrl: string): Promise<SoundCloudTrack[]> {
  const allTracks: SoundCloudTrack[] = [];
  const limit = 50; // Giảm limit xuống để tránh quá tải
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
            console.log('Client ID error, trying next one...');
            tryNextClientId();
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
      retryCount = 0; // Reset retry count on successful fetch

      // Thêm delay để tránh rate limit
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

  // Initialize the client with a working client ID
  await initializeClient()

  try {
    // Handle mobile URLs
    if (url.includes('soundcloud.app.goo.gl')) {
      url = await resolveMobileUrl(url)
    }

    // Clean the URL before processing
    url = cleanUrl(url)
    console.log('Processing playlist URL:', url)

    // Get initial playlist data with retry logic
    let playlist: SoundCloudPlaylist | null = null
    let retryCount = 0
    const maxRetries = 5

    while (retryCount < maxRetries && !playlist) {
      try {
        playlist = await soundcloud.playlists.get(url) as SoundCloudPlaylist
      } catch (error: any) {
        retryCount++
        console.error(`Attempt ${retryCount}/${maxRetries} failed:`, error.message)

        if (error.status === 401 || error.message.includes('client_id')) {
          // Try next client ID if unauthorized
          tryNextClientId()
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else if (retryCount === maxRetries) {
          throw error
        } else {
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
        }
      }
    }

    if (!playlist) {
      throw new Error('Failed to fetch playlist after multiple attempts')
    }

    console.log(`Found playlist: ${playlist.title} with ${playlist.track_count} tracks`)

    // Get all tracks with pagination
    const allTracks = await getAllPlaylistTracks(playlist, url)
    console.log(`Successfully fetched ${allTracks.length} of ${playlist.track_count} tracks`)

    if (allTracks.length === 0) {
      throw new Error('No tracks could be fetched from the playlist')
    }

    // Process tracks in batches to avoid rate limiting
    const batchSize = 5
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

          try {
            trackInfo.streamUrl = await getStreamUrl(track)
          } catch (error) {
            console.error(`Error getting stream URL for track ${track.id}:`, error)
          }

          return trackInfo
        })
      )

      tracks.push(...batchResults)

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < allTracks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
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

  } catch (error: any) {
    console.error('Error fetching playlist:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      url: url
    })

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
