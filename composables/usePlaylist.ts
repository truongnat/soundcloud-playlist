import { ref } from 'vue'
import type { Track } from '@/types'
import type { PlaylistInfo, PlaylistResponse } from '@/types'

interface CacheData {
  timestamp: number
  tracks: Track[]
  info: PlaylistInfo
}

const CACHE_EXPIRY = 30 * 60 * 1000 // 30 minutes in milliseconds
const CACHE_PREFIX = 'playlist_cache_'

export const usePlaylist = () => {
  const tracks = ref<Track[]>([])
  const loading = ref(false)
  const error = ref('')
  const playlistInfo = ref<PlaylistInfo>({
    title: '',
    description: '',
    artwork: ''
  })

  const getCacheKey = (url: string): string => {
    return CACHE_PREFIX + encodeURIComponent(url)
  }

  const saveToCache = (url: string, tracks: Track[], info: PlaylistInfo): void => {
    try {
      const cacheData: CacheData = {
        timestamp: Date.now(),
        tracks,
        info
      }
      localStorage.setItem(getCacheKey(url), JSON.stringify(cacheData))
    } catch (err) {
      console.warn('Failed to save playlist to cache:', err)
    }
  }

  const getFromCache = (url: string): CacheData | null => {
    try {
      const cacheKey = getCacheKey(url)
      const cachedData = localStorage.getItem(cacheKey)
      
      if (!cachedData) return null

      const data: CacheData = JSON.parse(cachedData)
      const age = Date.now() - data.timestamp

      // Check if cache is expired
      if (age > CACHE_EXPIRY) {
        localStorage.removeItem(cacheKey)
        return null
      }

      return data
    } catch (err) {
      console.warn('Failed to read playlist from cache:', err)
      return null
    }
  }

  const fetchPlaylist = async (url: string) => {
    tracks.value = []
    error.value = ''
    loading.value = true
    
    try {
      // Try to get data from cache first
      const cachedData = getFromCache(url)
      if (cachedData) {
        console.log('Loading playlist from cache')
        tracks.value = cachedData.tracks
        playlistInfo.value = cachedData.info
        loading.value = false
        return
      }

      // If not in cache or expired, fetch from API
      console.log('Fetching playlist from API')
      const response = await $fetch<PlaylistResponse>('/api/playlist', {
        query: { url }
      })
      
      if (!response || !response.tracks) {
        throw new Error('Invalid response from API')
      }

      console.log('Received tracks:', response.tracks.length)
      
      // Process and validate tracks
      const validTracks = response.tracks.filter(track => {
        if (!track || !track.id || !track.title) {
          console.warn('Invalid track data:', track)
          return false
        }
        return true
      })

      console.log('Valid tracks:', validTracks.length)

      tracks.value = validTracks
      playlistInfo.value = {
        title: response.title || 'Untitled Playlist',
        description: response.description || '',
        artwork: response.artwork || ''
      }

      // Save the new data to cache
      saveToCache(url, validTracks, playlistInfo.value)
    } catch (err: unknown) {
      console.error('Error in fetchPlaylist:', err)
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err && 'data' in err 
          ? (err.data as { message?: string })?.message
          : 'Failed to fetch playlist'
      
      error.value = errorMessage || 'Failed to fetch playlist. Please check the URL and try again.'
      tracks.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    tracks,
    loading,
    error,
    playlistInfo,
    fetchPlaylist
  }
}
