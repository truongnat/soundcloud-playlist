import { Soundcloud } from 'soundcloud.ts'
import type { 
  SoundCloudUser,
  SoundCloudTrack, 
  SoundCloudPlaylist,
  ProcessedTrack,
  PlaylistResponse 
} from '@/types'

// Initialize with mobile client ID
const MOBILE_CLIENT_ID = 'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX'
let soundcloud = new Soundcloud(MOBILE_CLIENT_ID)

// Function to recreate the client with new client ID
const updateClientId = (newClientId: string) => {
  soundcloud = new Soundcloud(newClientId)
}

// Hàm để lấy client ID mới nếu cần
async function getNewClientId(): Promise<string> {
  try {
    const response = await fetch('https://soundcloud.com/');
    const html = await response.text();
    const matches = html.match(/src="(.*?)">$/gm);
    
    if (!matches) return MOBILE_CLIENT_ID;

    for (const match of matches) {
      const jsPath = match.match(/src="(.*?)"/)?.[1];
      if (!jsPath || !jsPath.includes('https')) continue;

      const jsResponse = await fetch(jsPath);
      const jsContent = await jsResponse.text();
      const clientIdMatch = jsContent.match(/client_id:"([a-zA-Z0-9]+)"/);
      
      if (clientIdMatch?.[1]) {
        return clientIdMatch[1];
      }
    }
  } catch (error) {
    console.error('Error getting new client ID:', error);
  }
  
  return MOBILE_CLIENT_ID;
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
          updateClientId(newClientId);
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
    return urlObj.toString().split('?')[0]; // Remove all query parameters
  } catch (e) {
    console.error('Error cleaning URL:', e);
    return url;
  }
}

// Hàm lấy tất cả tracks với pagination và retry logic
async function getAllPlaylistTracks(playlist: SoundCloudPlaylist): Promise<SoundCloudTrack[]> {
  const allTracks: SoundCloudTrack[] = [];
  const limit = 50; // Giảm limit xuống để tránh quá tải
  let offset = 0;
  let retryCount = 0;
  const maxRetries = 3;
  
  while (offset < playlist.track_count) {
    try {
      console.log(`Fetching tracks ${offset} to ${offset + limit} of ${playlist.track_count}`);
      
      const playlistData = await soundcloud.playlists.get(`${playlist.permalink_url}?limit=${limit}&offset=${offset}`) as SoundCloudPlaylist;
      
      if (!playlistData.tracks || playlistData.tracks.length === 0) {
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

  try {
    // Handle mobile URLs
    if (url.includes('soundcloud.app.goo.gl')) {
      url = await resolveMobileUrl(url);
    }

    // Clean the URL before processing
    url = cleanUrl(url);
    console.log('Processing playlist URL:', url);

    // Get initial playlist data with retry logic
    let playlist: SoundCloudPlaylist | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries && !playlist) {
      try {
        playlist = await soundcloud.playlists.get(url) as SoundCloudPlaylist;
      } catch (error: any) {
        retryCount++;
        
        if (error.message.includes('client_id') || error.message.includes('Client ID')) {
          console.log('Updating client ID for playlist fetch...');
          const newClientId = await getNewClientId();
          soundcloud.setClientId(newClientId);
        }
        
        console.error(`Attempt ${retryCount}/${maxRetries} failed:`, error);
        
        if (retryCount === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }

    if (!playlist) {
      throw new Error('Failed to fetch playlist after multiple attempts');
    }

    console.log(`Found playlist: ${playlist.title} with ${playlist.track_count} tracks`);

    // Get all tracks with pagination
    const allTracks = await getAllPlaylistTracks(playlist);
    console.log(`Successfully fetched ${allTracks.length} of ${playlist.track_count} tracks`);

    if (allTracks.length === 0) {
      throw new Error('No tracks could be fetched from the playlist');
    }

    // Process tracks in batches to avoid rate limiting
    const batchSize = 5;
    const tracks: ProcessedTrack[] = [];
    
    for (let i = 0; i < allTracks.length; i += batchSize) {
      const batch = allTracks.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (track: SoundCloudTrack) => {
          const trackInfo: ProcessedTrack = {
            id: track.id,
            title: track.title,
            artist: track.user.username,
            duration: track.duration,
            artwork: track.artwork_url?.replace('-large', '-t500x500') || 
                    track.user.avatar_url?.replace('-large', '-t500x500') ||
                    'https://secure.gravatar.com/avatar/?size=500&default=mm',
            url: track.permalink_url,
            streamUrl: null
          };

          try {
            trackInfo.streamUrl = await getStreamUrl(track);
          } catch (error) {
            console.error(`Error getting stream URL for track ${track.id}:`, error);
          }

          return trackInfo;
        })
      );

      tracks.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < allTracks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const response: PlaylistResponse = {
      id: playlist.id,
      title: playlist.title,
      description: playlist.description || '',
      artwork: playlist.artwork_url?.replace('-large', '-t500x500') || null,
      tracksCount: playlist.track_count,
      tracks
    };

    return response;

  } catch (error: any) {
    console.error('Error fetching playlist:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: url
    });

    let errorMessage = 'Failed to fetch playlist. ';
    
    if (error.status === 404) {
      errorMessage = 'The playlist could not be found. Please make sure the URL is correct.';
    } else if (error.status === 403) {
      errorMessage = 'Access to this playlist is restricted.';
    } else if (error.message.includes('not found')) {
      errorMessage = 'Playlist not found. Please make sure the URL is correct.';
    } else if (error.message.includes('rate limit') || error.status === 429) {
      errorMessage = 'Too many requests. Please try again in a few minutes.';
    } else {
      errorMessage += 'Please make sure the URL is correct and the playlist is public.';
    }

    throw createError({
      statusCode: error.status || 500,
      message: errorMessage,
      data: {
        originalError: error.message,
        url: url
      }
    });
  }
});
