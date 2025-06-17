import { ref } from 'vue'
import type { Track } from '@/types'
import type { PlaylistInfo, PlaylistResponse } from '@/types'

export const usePlaylist = () => {
  const tracks = ref<Track[]>([])
  const loading = ref(false)
  const error = ref('')
  const playlistInfo = ref<PlaylistInfo>({
    title: '',
    description: '',
    artwork: ''
  })

  const fetchPlaylist = async (url: string) => {
    tracks.value = []
    error.value = ''
    loading.value = true
    
    try {
      const response = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to load playlist')
      }

      const data: PlaylistResponse = await response.json()
      tracks.value = data.tracks
      playlistInfo.value = data.info
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
