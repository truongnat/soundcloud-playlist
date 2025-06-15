// SoundCloud API Types
export interface SoundCloudUser {
  username: string
  avatar_url: string
}

export interface SoundCloudTrack {
  id: number
  title: string
  duration: number
  user: SoundCloudUser
  permalink_url: string
  artwork_url: string | null
}

export interface SoundCloudPlaylist {
  id: number
  title: string
  description: string | null
  artwork_url: string | null
  track_count: number
  tracks: SoundCloudTrack[]
}

// Processed Types
export interface Track {
  id: string | number
  title: string
  artist: string
  duration: number
  artwork: string
  artwork_url?: string
  url: string
  streamUrl: string | null
}

export interface ProcessedTrack extends Track {} // Same as Track for now, but might diverge in future

export interface PlaylistInfo {
  title: string
  description: string
  artwork: string
}

export interface PlaylistResponse {
  id: number
  title: string
  description: string | null
  artwork: string | null
  tracksCount: number
  tracks: ProcessedTrack[]
}

// Download Queue Types
export type DownloadStatus = 'queued' | 'downloading' | 'converting' | 'completed' | 'error'

export interface QueueItem {
  track: Track
  status: 'queued' | 'downloading' | 'converting' | 'completed' | 'error' | 'retry'
  progress: number
  error?: string
  retries?: number
}

export interface DownloadQueueInstance {
  addToQueue: (track: Track) => void
  downloadTrack: (track: Track) => Promise<boolean>
  downloadHlsTrack: (track: Track) => Promise<Uint8Array>
}

// FFmpeg Types
export type { FFmpeg as FFmpegType } from '@ffmpeg/ffmpeg'
