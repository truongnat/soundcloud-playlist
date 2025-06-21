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
  const response = await fetch(`${transcodingUrl}?client_id=${clientId}`)
  
  if (!response.ok) {
    throw new Error(`Failed to get stream URL: ${response.status} ${response.statusText}`)
  }
  
  const data = await response.json()
  return data.url
}