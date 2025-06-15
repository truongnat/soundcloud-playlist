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
      const response = await $fetch<PlaylistResponse>('/api/playlist', {
        query: { url }
      })
      
      tracks.value = response.tracks
      playlistInfo.value = {
        title: response.title || '',
        description: response.description || '',
        artwork: response.artwork || ''
      }
    } catch (err: unknown) {
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
