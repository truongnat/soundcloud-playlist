import { ref } from 'vue'
import type {  PlaylistResponse } from '@/types'

export const usePlaylist = () => {
  const error = ref('')

  const fetchPlaylist = async (url: string): Promise<PlaylistResponse> => {
    console.log('Fetching playlist for URL:', url)
    try {
      const apiUrl = `/api/playlist?url=${encodeURIComponent(url)}`
      console.log('Making request to:', apiUrl)
      
      const response = await fetch(apiUrl)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const data = await response.json()
        console.error('API error response:', data)
        throw new Error(data.message || 'Failed to load playlist')
      }

      const data: PlaylistResponse = await response.json()
      console.log('API success response:', data)
      
      if (!data.tracks || !Array.isArray(data.tracks)) {
        console.error('Invalid tracks data:', data)
        throw new Error('Invalid playlist data received')
      }
      
      return data
    } catch (err) {
      console.error('Error fetching playlist:', err)
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
