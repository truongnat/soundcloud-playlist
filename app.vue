<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <svg class="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.5 0c-6.347 0-11.5 5.153-11.5 11.5 0 6.346 5.153 11.5 11.5 11.5 6.346 0 11.5-5.154 11.5-11.5 0-6.347-5.154-11.5-11.5-11.5zm0 21c-5.243 0-9.5-4.257-9.5-9.5s4.257-9.5 9.5-9.5 9.5 4.257 9.5 9.5-4.257 9.5-9.5 9.5z"/>
            </svg>
            <h1 class="text-xl font-bold text-gray-900">SoundCloud Playlist</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button @click="showQueue = !showQueue" 
              class="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Downloads</span>
            </button>
            <a href="https://github.com/your-username/playlist-soundcloud" target="_blank" rel="noopener noreferrer" 
              class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex">
      <!-- Main Area -->
      <div class="flex-1 min-w-0 py-6">
        <PlaylistInput @fetch-playlist="fetchPlaylist" :loading="loading" />
        <TrackList
          :tracks="tracks"
          :loading="loading"
          :error="error"
          :playlist-title="playlistInfo.title"
          :playlist-description="playlistInfo.description"
          :playlist-artwork="playlistInfo.artwork"
          @download-track="handleDownloadTrack"
        />
      </div>

      <!-- Download Queue Sidebar -->
      <Transition name="slide">
        <div v-if="showQueue" class="w-96 border-l border-gray-200 bg-white shadow-lg fixed right-0 top-0 h-full">
          <DownloadQueue ref="downloadQueueRef" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePlaylist } from './composables/usePlaylist'

const { tracks, loading, error, playlistInfo, fetchPlaylist } = usePlaylist()
const showQueue = ref(false)
const downloadQueueRef = ref()

const handleDownloadTrack = (track: any) => {
  showQueue.value = true
  downloadQueueRef.value?.addToQueue(track)
}
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}
</style>
