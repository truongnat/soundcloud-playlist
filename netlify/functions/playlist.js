const { Soundcloud } = require('soundcloud.ts');

// Fallback client IDs
const FALLBACK_CLIENT_IDS = [
  'T26Olo5VaFwfbJtWjYtvIFx3vOe4v84D',
  'iZIs9mchVcX5lhVRyQGGAYlNPVldzAoX', 
  'ccCB37jIWCBP7JB9SnUPPui8LzeaQT45',
  '6ibGdGJqSm8F5DPvKPJMODIzhlvKbDks',
  'YxQYlFPNletSoRrR0HDh95hgf8V8HxS5'
];

let currentFallbackIndex = 0;
let cachedClientId = null;
let soundcloud = null;

// Validate if a client ID is still working
async function validateClientId(clientId) {
  try {
    const testUrl = `https://api-v2.soundcloud.com/tracks/1234567890?client_id=${clientId}`;
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const isValid = response.status !== 401 && response.status !== 403;
    console.log(`Client ID validation: ${response.status} - ${isValid ? 'VALID' : 'INVALID'}`);
    return isValid;
  } catch (error) {
    console.error('Error validating client ID:', error);
    return false;
  }
}

async function getFallbackClientId() {
  console.log('Trying fallback client IDs...');
  
  for (let i = 0; i < FALLBACK_CLIENT_IDS.length; i++) {
    const clientId = FALLBACK_CLIENT_IDS[currentFallbackIndex];
    currentFallbackIndex = (currentFallbackIndex + 1) % FALLBACK_CLIENT_IDS.length;
    
    console.log(`Trying fallback client ID ${i + 1}/${FALLBACK_CLIENT_IDS.length}:`, clientId);
    if (await validateClientId(clientId)) {
      console.log('Found working fallback client ID:', clientId);
      return clientId;
    }
  }
  
  console.log('No working fallback client IDs found');
  return null;
}

async function getClientId() {
  if (cachedClientId && await validateClientId(cachedClientId)) {
    return cachedClientId;
  }

  const fallbackId = await getFallbackClientId();
  if (fallbackId) {
    cachedClientId = fallbackId;
    return fallbackId;
  }

  throw new Error('Could not obtain a valid client ID');
}

async function initializeSoundcloud() {
  try {
    const clientId = await getClientId();
    soundcloud = new Soundcloud(clientId);
    console.log('Initialized SoundCloud client with client ID:', clientId);
  } catch (error) {
    console.error('Failed to initialize SoundCloud client:', error);
    throw error;
  }
}

function cleanUrl(url) {
  try {
    const urlObj = new URL(url);
    ['si', 'utm_source', 'utm_medium', 'utm_campaign'].forEach(param => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString().split('?')[0];
  } catch (e) {
    console.error('Error cleaning URL:', e);
    return url;
  }
}

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const url = event.queryStringParameters?.url;

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Playlist URL is required' })
      };
    }

    console.log('Processing playlist URL:', url);

    // Initialize SoundCloud client
    await initializeSoundcloud();

    // Clean the URL
    const cleanedUrl = cleanUrl(url);
    console.log('Cleaned URL:', cleanedUrl);

    // Get playlist data
    const playlist = await soundcloud.playlists.get(cleanedUrl);
    
    if (!playlist) {
      throw new Error('Playlist not found');
    }

    console.log(`Found playlist: ${playlist.title} with ${playlist.track_count} tracks`);

    // Process tracks (simplified for Netlify)
    const tracks = playlist.tracks.slice(0, 50).map(track => ({
      id: track.id.toString(),
      title: track.title,
      artist: track.user.username,
      duration: track.duration,
      artwork: track.artwork_url?.replace('-large', '-t500x500') ||
        track.user.avatar_url?.replace('-large', '-t500x500') ||
        'https://secure.gravatar.com/avatar/?size=500&default=mm',
      url: track.permalink_url,
      streamUrl: null
    }));

    const response = {
      playlistInfo: {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description || '',
        artwork: playlist.artwork_url?.replace('-large', '-t500x500') || 
          'https://secure.gravatar.com/avatar/?size=500&default=mm',
        tracksCount: playlist.track_count,
      },
      tracks
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error fetching playlist:', error);

    let errorMessage = 'Failed to fetch playlist. ';
    let statusCode = 500;

    if (error.status === 404) {
      errorMessage = 'The playlist could not be found. Please make sure the URL is correct.';
      statusCode = 404;
    } else if (error.status === 403) {
      errorMessage = 'Access to this playlist is restricted.';
      statusCode = 403;
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed. Please try again.';
      statusCode = 401;
    } else if (error.message.includes('not found')) {
      errorMessage = 'Playlist not found. Please make sure the URL is correct.';
      statusCode = 404;
    }

    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: errorMessage,
        details: error.message
      })
    };
  }
};