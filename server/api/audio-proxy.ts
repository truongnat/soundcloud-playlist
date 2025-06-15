export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const url = query.url as string;
    
    if (!url) {
      throw createError({
        statusCode: 400,
        message: 'URL is required'
      });
    }

    // Create headers object with only necessary headers
    const headers = new Headers();
    headers.set('Origin', 'https://soundcloud.com');
    headers.set('Referer', 'https://soundcloud.com/');
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('Audio proxy: Fetching URL:', url);
    console.log('Audio proxy: Using headers:', Object.fromEntries(headers.entries()));
    
    const response = await fetch(url, { headers });
    
    console.log('Audio proxy: Response status:', response.status);
    const responseHeaders = Object.fromEntries(response.headers.entries());
    console.log('Audio proxy: Response headers:', responseHeaders);
    
    const contentType = response.headers.get('Content-Type');
    const contentLength = response.headers.get('Content-Length');
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Failed to fetch audio: ${response.statusText} (${response.status})`
      });
    }

    if (!contentType?.includes('audio/') && !contentType?.includes('application/octet-stream')) {
      console.warn('Audio proxy: Unexpected content type:', contentType);
    }

    console.log('Audio proxy: Starting buffer read...');
    const buffer = await response.arrayBuffer();
    console.log('Audio proxy: Received buffer size:', buffer.byteLength);
    
    if (buffer.byteLength === 0) {
      throw createError({
        statusCode: 400,
        message: 'Received empty audio data'
      });
    }

    if (contentLength && buffer.byteLength !== parseInt(contentLength)) {
      console.warn('Audio proxy: Buffer size mismatch:', {
        expected: contentLength,
        received: buffer.byteLength
      });
    }
    
    // Set appropriate headers for the response
    setHeader(event, 'Content-Type', contentType || 'audio/mpeg');
    setHeader(event, 'Content-Length', buffer.byteLength);
    setHeader(event, 'Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    return buffer;

  } catch (error: any) {
    console.error('Audio proxy error:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to proxy audio request'
    });
  }
});
