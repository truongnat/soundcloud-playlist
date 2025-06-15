import { Parser } from 'm3u8-parser'

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

    console.log('HLS Segments: Fetching playlist from URL:', url)

    // Fetch M3U8 playlist with proper headers
    const headers = new Headers({
      'Origin': 'https://soundcloud.com',
      'Referer': 'https://soundcloud.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    })

    const response = await fetch(url, { headers })
    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        message: `Failed to fetch HLS playlist: ${response.statusText}`
      })
    }

    const m3u8Content = await response.text()
    
    // Parse M3U8 content
    const parser = new Parser()
    parser.push(m3u8Content)
    parser.end()
    
    const segments = parser.manifest.segments || []
    if (segments.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No segments found in HLS playlist'
      })
    }

    // Get base URL for resolving relative segment URLs
    const baseUrl = new URL(url).origin

    // Return segment information
    return {
      total: segments.length,
      segments: segments.map(segment => ({
        url: new URL(segment.uri, url).toString(),
        duration: segment.duration
      }))
    }
  } catch (error: any) {
    console.error('HLS Segments error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to process HLS playlist'
    })
  }
})
