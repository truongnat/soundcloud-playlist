<template>
  <div>
    <PlaylistInput @fetch-playlist="fetchPlaylist" :loading="loading" />
    <TrackList 
      :tracks="tracks" 
      :is-loading="loading" 
      :error="error" 
      :playlist-title="playlistInfo?.title"
      :playlist-artwork="playlistInfo?.artwork" 
      :downloading-tracks="downloadingTracks" 
      :error-tracks="errorTracks"
      :is-downloading-all="downloadStats.active > 0"
      @download="handleDownloadTrack"
      @download-all="handleDownloadAll" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Track, PlaylistInfo } from '~/types'
import { useDownloadQueue } from '~/composables/useDownloadQueue'
import { usePlaylist } from '~/composables/usePlaylist'

const { fetchPlaylist: getPlaylist, error: playlistError } = usePlaylist()
const { addToQueue } = useDownloadQueue()

const loading = ref(false)
const error = ref('')
const tracks = ref<Track[]>([])
const playlistInfo = ref<PlaylistInfo | null>(null)
const downloadingTracks = ref<Set<string | number>>(new Set())
const errorTracks = ref<Set<string | number>>(new Set())
const downloadStats = ref({
  active: 0,
  total: 0
})

async function fetchPlaylist(url: string) {
  if (!url) return
  
  loading.value = true
  error.value = ''
  tracks.value = []
  playlistInfo.value = null
  downloadingTracks.value = new Set()
  errorTracks.value = new Set()
  
  try {
    const response = await getPlaylist(url)
    tracks.value = response.tracks
    playlistInfo.value = response.info
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to fetch playlist'
  } finally {
    loading.value = false
  }
}

function handleDownloadTrack(track: Track) {
  addToQueue([track])
  downloadStats.value.total++
  downloadingTracks.value.add(track.id)
}

function handleDownloadAll() {
  const availableTracks = tracks.value.filter(track => !downloadingTracks.value.has(track.id))
  if (availableTracks.length === 0) return
  
  addToQueue(availableTracks)
  downloadStats.value.total += availableTracks.length
  availableTracks.forEach(track => downloadingTracks.value.add(track.id))
}
</script>
