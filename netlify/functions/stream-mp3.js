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

async function validateClientId(clientId) {
  try {
    const testUrl = `https://api-v2.soundcloud.com/tracks/1234567890?client_id=${clientId}`;
    const response = await fetch(testUrl);
    return response.status !== 401 && response.status !== 403;
  } catch (error) {
    return false;
  }
}

async function getFallbackClientId() {
  for (let i = 0; i < FALLBACK_CLIENT_IDS.length; i++) {
    const clientId = FALLBACK_CLIENT_IDS[currentFallbackIndex];
    currentFallbackIndex = (currentFallbackIndex + 1) % FALLBACK_CLIENT_IDS.length;
    
    if (await validateClientId(clientId)) {
      return clientId;
    }
  }
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
  } catch (error) {
    throw error;
  }
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

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
        body: JSON.stringify({ error: 'Track URL is required' })
      };
    }

    await initializeSoundcloud();

    // Get track info
    const track = await soundcloud.tracks.get(url);
    
    if (!track) {
      throw new Error('Track not found');
    }

    // Get stream URL
    const streamUrl = await soundcloud.util.streamLink(track.permalink_url);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        streamUrl,
        title: track.title,
        artist: track.user.username
      })
    };

  } catch (error) {
    console.error('Error getting stream URL:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to get stream URL',
        details: error.message
      })
    };
  }
};