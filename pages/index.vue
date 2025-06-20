<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div class="max-w-4xl mx-auto p-6">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-4">
          SoundCloud Playlist Downloader
        </h1>
        <p class="text-gray-400">Enter a SoundCloud playlist URL to download all tracks</p>
      </div>

      <!-- URL Input Section -->
      <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/50 mb-8">
        <PlaylistInput 
          @playlist-loaded="handlePlaylistLoaded"
          @error="handleError"
          :loading="loading"
        />
      </div>

      <!-- Error Message -->
      <div v-if="error" 
           class="bg-red-900/20 border border-red-800/50 text-red-200 p-4 rounded-xl mb-8 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>

      <!-- Track List -->
      <TrackList 
        v-if="playlistInfo && tracks && tracks.length > 0"
        :tracks="tracks"
        :is-loading="loading"
        :error="error"
        :playlist-title="playlistInfo?.title"
        :playlist-artwork="playlistInfo?.artwork"
        :is-downloading-all="isDownloadingAll"
        :downloading-tracks="Array.from(downloadingTracks).map(String)"
        :error-tracks="{}"
        @download="handleDownloadTrack"
        @download-all="handleDownloadAll"
      />

      <!-- Loading State -->
      <div v-else-if="loading" class="text-center py-12">
        <div class="inline-flex items-center gap-3 text-gray-400">
          <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading playlist...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { Track, PlaylistInfo, PlaylistResponse } from '@/types'
import { usePlaylist } from '@/composables/usePlaylist'
import { useTrackDownloader } from '@/composables/useTrackDownloader'

const { error: playlistError } = usePlaylist()
const {
  downloadingTracks,
  errorTracks,
  handleDownloadTrack,
  handleDownloadAll: downloadAll
} = useTrackDownloader()

const tracks = ref<Track[]>([])
const playlistInfo = ref<PlaylistInfo | null>(null)
const loading = ref(false)
const error = ref('')
const isDownloadingAll = ref(false)

async function handlePlaylistLoaded(data: PlaylistResponse) {
  tracks.value = data.tracks
  playlistInfo.value = data.playlistInfo
  error.value = ''
}

function handleError(errorMessage: string) {
  error.value = errorMessage
  tracks.value = []
  playlistInfo.value = null
}

async function handleDownloadAll() {
  if (!tracks.value || tracks.value.length === 0) return
  
  isDownloadingAll.value = true
  try {
    await downloadAll(tracks.value)
  } finally {
    isDownloadingAll.value = false
  }
}

// Watch for playlist errors
watchEffect(() => {
  if (playlistError.value) {
    error.value = playlistError.value
  }
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>