/**
 * SoundCloud utilities - moved from server/utils
 */
import type { SoundCloudAPITrack } from '~/types'

export interface TranscodingInfo {
  url: string
  isHLS: boolean
  duration: number
  format: {
    protocol: 'progressive' | 'hls'
    mimeType: string
  }
}

export function getTranscoding(trackDetails: SoundCloudAPITrack): TranscodingInfo {
  if (!trackDetails.media || !Array.isArray(trackDetails.media.transcodings) || trackDetails.media.transcodings.length === 0) {
    throw new Error('No transcoding data available for this track. The track may be unavailable or restricted.')
  }

  // Find MP3 transcoding
  const mp3Transcoding = trackDetails.media.transcodings.find(t => 
    t.format?.protocol === 'progressive' && 
    t.format?.mime_type === 'audio/mpeg' &&
    t.url
  )
  
  if (mp3Transcoding) {
    return {
      url: mp3Transcoding.url,
      isHLS: false,
      duration: mp3Transcoding.duration || trackDetails.duration,
      format: {
        protocol: 'progressive' as const,
        mimeType: mp3Transcoding.format.mime_type
      }
    }
  }

  // Try to find HLS stream instead
  const hlsTranscoding = trackDetails.media.transcodings.find(t =>
    t.format?.protocol === 'hls' &&
    t.format?.mime_type === 'audio/mpeg' &&
    t.url
  )

  if (!hlsTranscoding) {
    const availableFormats = trackDetails.media.transcodings
      .map(t => `${t.format?.protocol || 'unknown'} (${t.format?.mime_type || 'unknown'})`)
      .join(', ')
    
    throw new Error(`No suitable audio stream found for this track. Available formats: ${availableFormats}`)
  }

  return {
    url: hlsTranscoding.url,
    isHLS: true,
    duration: hlsTranscoding.duration || trackDetails.duration,
    format: {
      protocol: 'hls' as const,
      mimeType: hlsTranscoding.format.mime_type
    }
  }
}

export async function getStreamUrl(transcodingUrl: string, clientId: string): Promise<string> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch(`${transcodingUrl}?client_id=${clientId}`, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Failed to get stream URL: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.url
    } catch (error: any) {
      lastError = error
      console.error(`Stream URL attempt ${attempt + 1}/${maxRetries} failed:`, error.message)
      
      if (attempt === maxRetries - 1) {
        break
      }
      
      // Wait before retry with exponential backoff, longer for connection errors
      const isConnectionError = error.code === 'ECONNRESET' || 
                               error.message?.includes('ECONNRESET') ||
                               error.name === 'AbortError'
      const delay = isConnectionError 
        ? 2000 * Math.pow(2, attempt) + Math.random() * 1000
        : 1000 * Math.pow(2, attempt) + Math.random() * 500
      
      console.log(`Retrying stream URL in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError || new Error('Failed to get stream URL after multiple attempts')
}