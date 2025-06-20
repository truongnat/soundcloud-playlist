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

      <!-- Playlist Info and Track List -->
      <div v-if="playlistInfo && tracks && tracks.length > 0" class="space-y-6">
        <!-- Playlist Header -->
        <div class="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50">
          <div class="flex items-start gap-6">
            <img 
              v-if="playlistInfo.artwork" 
              :src="playlistInfo.artwork" 
              :alt="playlistInfo.title"
              class="w-24 h-24 rounded-xl object-cover shadow-lg"
            />
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold text-white mb-2 line-clamp-2">{{ playlistInfo.title }}</h2>
              <p class="text-gray-400 mb-3 line-clamp-1">{{ playlistInfo.user }}</p>
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span>{{ tracks.length }} tracks</span>
                <span>{{ formatTotalDuration(tracks) }}</span>
              </div>
            </div>
            <button
              @click="handleDownloadAll"
              class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium 
                     rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none 
                     focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 
                     disabled:opacity-50 transition-all duration-200 shadow-lg 
                     hover:shadow-green-500/20 flex items-center gap-2"
              :disabled="isDownloadingAll"
            >
              <svg v-if="isDownloadingAll" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span>{{ isDownloadingAll ? 'Adding to Queue...' : 'Download All' }}</span>
            </button>
          </div>
        </div>

        <!-- Track List -->
        <TrackList 
          :tracks="tracks"
          :is-loading="loading"
          :error="error"
          :playlist-title="playlistInfo?.title"
          :playlist-artwork="playlistInfo?.artwork"
          :is-downloading-all="isDownloadingAll"
          :downloading-tracks="Array.from(downloadingTracks)"
          :error-tracks="errorTracks"
          @download="handleDownloadTrack"
          @download-all="handleDownloadAll"
        />
      </div>

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

function formatTotalDuration(tracks: Track[]) {
  const totalMs = tracks.reduce((sum, track) => sum + track.duration, 0)
  const hours = Math.floor(totalMs / 3600000)
  const minutes = Math.floor((totalMs % 3600000) / 60000)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

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