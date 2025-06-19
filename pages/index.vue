<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="max-w-7xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent mb-4">
          Download SoundCloud Playlist
        </h1>
        <p class="text-gray-400">Enter a SoundCloud playlist URL to download all tracks at once</p>
      </div>

      <PlaylistInput @fetch-playlist="fetchPlaylist" :loading="loading" />

      <div class="mt-12">
        <TrackList 
          :tracks="tracks" 
          :is-loading="loading" 
          :error="error" 
          :playlist-title="playlistInfo?.title"
          :playlist-artwork="playlistInfo?.artwork"
          :downloading-tracks="Array.from(downloadingTracks || new Set()).map(String)"
          :error-tracks="Object.fromEntries(Array.from(errorTracks || new Set()).map(id => [String(id), 'Failed']))"
          :is-downloading-all="downloadStats?.active > 0"
          @download="handleDownloadTrack"
          @download-all="handleDownloadAll" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import type { Track, PlaylistInfo } from '~/types'
import { usePlaylist } from '~/composables/usePlaylist'
import { useTrackDownloader } from '~/composables/useTrackDownloader'

const { fetchPlaylist: getPlaylist, error: playlistError } = usePlaylist()
const {
  downloadingTracks,
  errorTracks,
  downloadStats,
  handleDownloadTrack: downloadSingleTrack,
  handleDownloadAll: downloadMultipleTracks
} = useTrackDownloader()

const loading = ref(false)
const error = ref('')
const tracks = ref<Track[]>([])
const playlistInfo = ref<PlaylistInfo | null>(null)

async function fetchPlaylist(url: string) {
  if (!url) {
    error.value = 'Please enter a valid SoundCloud playlist URL'
    return
  }
  
  loading.value = true
  error.value = ''
  tracks.value = []
  playlistInfo.value = null
  
  try {
    const response = await getPlaylist(url)
    console.log('Playlist response:', response)
    
    if (response && response.tracks && Array.isArray(response.tracks)) {
      tracks.value = response.tracks
      playlistInfo.value = response.info
      
      if (tracks.value.length === 0) {
        error.value = 'No tracks found in this playlist'
      }
    } else {
      error.value = 'Invalid response format from server'
    }
  } catch (e: any) {
    error.value = e?.message || playlistError.value || 'Failed to fetch playlist'
    console.error('Fetch playlist error:', e)
  } finally {
    loading.value = false
  }
}

function handleDownloadTrack(track: Track) {
  downloadSingleTrack(track)
}

function handleDownloadAll() {
  if (tracks.value.length === 0) return
  downloadMultipleTracks(tracks.value)
}

// Reset data when component is destroyed
onUnmounted(() => {
  tracks.value = []
  playlistInfo.value = null
  error.value = ''
})
</script>
