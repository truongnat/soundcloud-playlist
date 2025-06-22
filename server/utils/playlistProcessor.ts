import { Soundcloud } from 'soundcloud.ts'
import { getClientId } from './soundcloud'
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

// Get all tracks with pagination and retry logic - optimized for background processing
async function getAllPlaylistTracksBackground(
  playlist: SoundCloudPlaylist, 
  playlistUrl: string, 
  maxTracks?: number,
  progressCallback?: (progress: number) => void
): Promise<SoundCloudTrack[]> {
  const allTracks: SoundCloudTrack[] = [];
  const limit = 50; // Larger batch size for background processing
  let offset = 0;
  let retryCount = 0;
  const maxRetries = 5;
  const targetTrackCount = maxTracks || playlist.track_count;

  while (offset < targetTrackCount) {
    try {
      console.log(`Fetching tracks ${offset} to ${offset + limit} of ${targetTrackCount}`);

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
        console.log('No more tracks available, breaking loop');
        break;
      }

      const tracksToAdd = playlistData.tracks.slice(0, Math.min(playlistData.tracks.length, targetTrackCount - allTracks.length));
      allTracks.push(...tracksToAdd);
      offset += tracksToAdd.length;
      retryCount = 0;

      // Update progress
      if (progressCallback) {
        const progress = Math.min((allTracks.length / targetTrackCount) * 50, 50); // First 50% is fetching tracks
        progressCallback(progress);
      }

      // Break if we've reached our target
      if (allTracks.length >= targetTrackCount) {
        break;
      }

      // Longer delay for background processing to be more respectful to API
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(`Error fetching tracks at offset ${offset}:`, error);

      retryCount++;
      if (retryCount >= maxRetries) {
        console.error(`Max retries (${maxRetries}) reached for offset ${offset}`);
        break;
      }

      // Exponential backoff with longer delays for background processing
      const delay = Math.min(2000 * Math.pow(2, retryCount), 30000);
      console.log(`Retrying in ${delay}ms... (Attempt ${retryCount}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return allTracks.slice(0, targetTrackCount);
}

// Background playlist processing function
export async function processPlaylistBackground(
  url: string, 
  maxTracks?: number,
  progressCallback?: (progress: number) => void
): Promise<PlaylistResponse> {
  console.log('Starting background playlist processing for:', url);
  
  // Initialize the SoundCloud client
  await initializeSoundcloud()

  // Handle mobile URLs
  if (url.includes('soundcloud.app.goo.gl')) {
    url = await resolveMobileUrl(url)
  }

  // Clean the URL before processing
  url = cleanUrl(url)
  console.log('Processing playlist URL:', url)

  if (progressCallback) progressCallback(5);

  // Get initial playlist data
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
        await initializeSoundcloud()
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else if (retryCount === maxRetries) {
        throw error
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }

  if (!playlist) {
    throw new Error('Failed to fetch playlist after multiple attempts')
  }

  console.log(`Found playlist: ${playlist.title} with ${playlist.track_count} tracks`)
  
  if (progressCallback) progressCallback(10);

  // Get all tracks (no artificial limit for background processing)
  const targetTrackCount = maxTracks || playlist.track_count;
  const allTracks = await getAllPlaylistTracksBackground(playlist, url, targetTrackCount, progressCallback)
  console.log(`Successfully fetched ${allTracks.length} of ${playlist.track_count} tracks`)

  if (allTracks.length === 0) {
    throw new Error('No tracks could be fetched from the playlist')
  }

  if (progressCallback) progressCallback(50);

  // Process tracks with larger batch size for background processing
  const batchSize = 10; // Larger batch for background
  const tracks: ProcessedTrack[] = []
  let processedCount = 0;

  for (let i = 0; i < allTracks.length; i += batchSize) {
    const batch = allTracks.slice(i, i + batchSize)
    
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allTracks.length / batchSize)}`);
    
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
          streamUrl: null // Will be fetched on-demand
        }

        return trackInfo
      })
    )

    tracks.push(...batchResults)
    processedCount += batchResults.length;

    // Update progress (50% to 95% for processing tracks)
    if (progressCallback) {
      const progress = 50 + ((processedCount / allTracks.length) * 45);
      progressCallback(Math.min(progress, 95));
    }

    // Longer delay between batches for background processing
    if (i + batchSize < allTracks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  if (progressCallback) progressCallback(100);

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

  console.log(`Background processing completed for playlist: ${playlist.title}`);
  return response
}