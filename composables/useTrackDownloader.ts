import { ref } from 'vue'
import type { Track } from '~/types'
import { useDownloadQueue } from './useDownloadQueue'
import { useUIStore } from '~/stores/ui'

export function useTrackDownloader() {
  const { addToQueue } = useDownloadQueue()
  const uiStore = useUIStore()
  
  const downloadingTracks = ref<Set<string | number>>(new Set())
  const errorTracks = ref<Set<string | number>>(new Set())
  const downloadStats = ref({
    active: 0,
    total: 0
  })

  function handleDownloadTrack(track: Track) {
    addToQueue(track)
    downloadStats.value.total++
    downloadingTracks.value.add(track.id)
    // Show download queue if it's not visible
    uiStore.showDownloadQueue = true
  }

  function handleDownloadAll(tracks: Track[]) {
    const availableTracks = tracks.filter(track => !downloadingTracks.value.has(track.id))
    if (availableTracks.length === 0) return
    
    addToQueue(availableTracks)
    downloadStats.value.total += availableTracks.length
    availableTracks.forEach(track => downloadingTracks.value.add(track.id))
    // Show download queue
    uiStore.showDownloadQueue = true
  }

  function handleDownloadComplete(trackId: string | number) {
    if (downloadStats.value.total > 0) {
      downloadStats.value.total--
    }
    downloadingTracks.value.delete(trackId)
  }

  function handleDiscardAll() {
    downloadStats.value.total = 0
    downloadingTracks.value = new Set()
    errorTracks.value = new Set()
  }

  return {
    downloadingTracks,
    errorTracks,
    downloadStats,
    handleDownloadTrack,
    handleDownloadAll,
    handleDownloadComplete,
    handleDiscardAll
  }
}
