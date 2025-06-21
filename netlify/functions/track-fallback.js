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

    // Simple fallback - return a placeholder response
    // In a real implementation, you would use alternative scraping methods
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        streamUrl: null,
        error: 'Fallback API not implemented yet'
      })
    };

  } catch (error) {
    console.error('Error in fallback API:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Fallback API failed',
        details: error.message
      })
    };
  }
};