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

  console.log('Fallback: Getting stream URL for track:', url)

  try {
    // Extract track ID from URL if possible
    let trackId = url
    const urlMatch = url.match(/soundcloud\.com\/[^\/]+\/([^\/\?]+)/)
    if (urlMatch) {
      trackId = urlMatch[1]
    }

    // Try alternative methods with longer delays
    const methods = [
      // Method 1: Direct stream link with track URL
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s
        return await soundcloud.util.streamLink(url)
      },
      
      // Method 2: Get track details first, then stream
      async () => {
        await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3s
        const trackDetails = await soundcloud.tracks.get(url)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Additional wait
        return await soundcloud.util.streamLink(trackDetails.permalink_url)
      },
      
      // Method 3: Try with track ID if extracted
      async () => {
        if (trackId !== url) {
          await new Promise(resolve => setTimeout(resolve, 2500)) // Wait 2.5s
          return await soundcloud.util.streamLink(trackId)
        }
        throw new Error('No track ID available')
      },
      
      // Method 4: Alternative client approach
      async () => {
        await new Promise(resolve => setTimeout(resolve, 4000)) // Wait 4s
        const altSoundcloud = new Soundcloud()
        return await altSoundcloud.util.streamLink(url)
      }
    ]

    for (let i = 0; i < methods.length; i++) {
      try {
        console.log(`Fallback: Trying method ${i + 1}...`)
        const streamUrl = await methods[i]()
        if (streamUrl) {
          console.log(`Fallback: Got stream URL using method ${i + 1}`)
          return { streamUrl, method: i + 1 }
        }
      } catch (methodError: any) {
        console.log(`Fallback method ${i + 1} failed:`,
          methodError instanceof Error ? methodError.message : 'Unknown error')
        
        // If rate limited, wait even longer
        if (methodError.message?.includes('429')) {
          console.log('Fallback: Rate limited, waiting 10 seconds...')
          await new Promise(resolve => setTimeout(resolve, 10000))
        }
      }
    }

    throw createError({
      statusCode: 404,
      message: 'All fallback methods failed to get stream URL'
    })

  } catch (error: any) {
    console.error('Fallback error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Fallback failed to get stream URL'
    })
  }
})
