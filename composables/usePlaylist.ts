import { ref } from 'vue'
import type { Track } from '@/types'
import type { PlaylistInfo, PlaylistResponse } from '@/types'

export const usePlaylist = () => {
  const error = ref('')

  const fetchPlaylist = async (url: string): Promise<PlaylistResponse> => {
    try {
      const response = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to load playlist')
      }

      const data: PlaylistResponse = await response.json()
      return data
    } catch (err) {
      console.error('Error fetching playlist:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load playlist'
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
