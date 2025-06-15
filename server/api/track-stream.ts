import { Soundcloud } from 'soundcloud.ts'

const soundcloud = new Soundcloud()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({
      statusCode: 400,
      message: 'Track URL is required'
    })
  }

  console.log('Getting stream URL for track:', url)

  try {
    // Try multiple methods to get the stream URL
    const methods = [
      // Method 1: From track details
      async () => {
        const trackDetails = await soundcloud.tracks.get(url)
        return await soundcloud.util.streamLink(trackDetails.permalink_url)
      },
      // Method 2: Directly from URL
      async () => {
        return await soundcloud.util.streamLink(url)
      }
    ]

    for (const method of methods) {
      try {
        const streamUrl = await method()
        if (streamUrl) {
          console.log('Got stream URL using method', methods.indexOf(method) + 1)
          return { streamUrl }
        }
      } catch (methodError) {
        console.log(`Method ${methods.indexOf(method) + 1} failed:`,
          methodError instanceof Error ? methodError.message : 'Unknown error')
      }
    }

    throw createError({
      statusCode: 404,
      message: 'Could not get stream URL for track'
    })

  } catch (error: any) {
    console.error('Error getting stream URL:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to get stream URL'
    })
  }
})
