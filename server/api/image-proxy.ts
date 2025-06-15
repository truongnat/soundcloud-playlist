export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const url = query.url as string
    
    if (!url) {
      throw createError({
        statusCode: 400,
        message: 'URL is required'
      })
    }

    console.log('Image proxy: Fetching URL:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Failed to fetch image: ${response.statusText}`
      })
    }

    const contentType = response.headers.get('Content-Type')
    if (!contentType?.startsWith('image/')) {
      throw createError({
        statusCode: 400,
        message: 'Invalid content type'
      })
    }

    const buffer = await response.arrayBuffer()
    
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000') // Cache for 1 year
    setHeader(event, 'Cross-Origin-Resource-Policy', 'cross-origin')
    
    return buffer
  } catch (error: any) {
    console.error('Image proxy error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to proxy image request'
    })
  }
})
