import { ref } from 'vue'
import type {  PlaylistResponse } from '@/types'

export const usePlaylist = () => {
  const error = ref('')

  const fetchPlaylist = async (url: string): Promise<PlaylistResponse> => {
    try {
      const apiUrl = `/api/playlist?url=${encodeURIComponent(url)}`
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to load playlist')
      }

      const data: PlaylistResponse = await response.json()
      
      if (!data.tracks || !Array.isArray(data.tracks)) {
        throw new Error('Invalid playlist data received')
      }
      
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load playlist'
      error.value = message
      throw err
    }
  }

  return {
    fetchPlaylist,
    error
  }
}
