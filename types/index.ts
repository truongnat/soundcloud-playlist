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

// Track Types
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

export interface ProcessedTrack extends Track {}

export interface PlaylistInfo {
  title: string
  description: string
  artwork: string
}

export interface PlaylistResponse {
  tracks: Track[]
  info: PlaylistInfo
}

// Download Queue Types
export type DownloadStatus = 'queued' | 'downloading' | 'converting' | 'completed' | 'error' | 'retry'

export interface QueueItem {
  track: Track
  status: DownloadStatus
  progress: number
  error?: string
  retries?: number
}

// Stream Response Type
export interface StreamResponse {
  streamUrl: string
  isHLS: boolean
  track: Track
}

// Download Queue Instance Type
export interface DownloadQueueInstance {
  addToQueue: (track: Track) => void
  downloadTrack: (track: Track) => Promise<boolean>
  downloadHlsTrack: (track: Track) => Promise<Uint8Array>
}

// Audio Processing Types
export interface AudioProcessingOptions {
  progressCallback?: (progress: number) => void
  abortSignal?: AbortSignal
}

// External Library Types
export type { FFmpeg as FFmpegType } from '@ffmpeg/ffmpeg'

// UI State Types
export interface UIState {
  showDownloadQueue: boolean
  shouldKeepQueueOpen: boolean
}

// Download Queue Store State
export interface DownloadQueueState {
  queue: Record<string, QueueItem>
}

// Store Types
export interface RootState {
  ui: UIState
  downloadQueue: DownloadQueueState
}
