import { ref } from 'vue'
import type { Track } from '@/types'

export const useTrack = () => {
  const error = ref('')

  const fetchTrack = async (url: string): Promise<Track> => {
    try {
      const apiUrl = `/api/track-download?url=${encodeURIComponent(url)}`
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to load track')
      }

      const data: { track: Track } = await response.json()
      
      if (!data.track) {
        throw new Error('Invalid track data received')
      }
      
      return data.track
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load track'
      error.value = message
      throw err
    }
  }

  return {
    fetchTrack,
    error
  }
}