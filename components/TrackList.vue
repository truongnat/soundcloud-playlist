<template>  <div class="space-y-12">
    <!-- Playlist Header -->
    <div v-if="playlistTitle || playlistArtwork" class="relative">
      <!-- Banner Image -->
      <div class="relative h-60 md:h-72 lg:h-96 overflow-hidden rounded-2xl shadow-2xl">
        <img
          v-if="playlistArtwork"
          :src="playlistArtwork"
          :alt="playlistTitle"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        
        <!-- Playlist Info -->
        <div class="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
          <div class="text-white">
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-shadow-lg">
              {{ playlistTitle || 'Untitled Playlist' }}
            </h1>
            <p class="text-base md:text-lg text-gray-200 text-shadow">
              {{ tracks?.length || 0 }} tracks
            </p>
          </div>
          
          <!-- Download All Button -->
          <button
            v-if="tracks && tracks.length > 0"
            @click="$emit('downloadAll')"
            :disabled="isDownloadingAll"
            class="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg
              class="w-5 h-5"
              :class="{ 'animate-spin': isDownloadingAll }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                v-if="isDownloadingAll"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>{{ isDownloadingAll ? 'Processing...' : 'Download All' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-6">
      <USkeleton v-for="i in 6" :key="i" class="h-28 w-full" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      :title="error"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      class="bg-red-900/20 text-red-100 border-red-900"
    />

    <!-- Tracks Grid -->
    <TrackGrid
      v-else-if="tracks && tracks.length > 0"
      :tracks="tracks"
      :downloading-tracks="downloadingTracks"
      :error-tracks="errorTracks"
      @download="$emit('download', $event)"
    />

    <!-- Empty State -->
    <div v-else class="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 text-center">
      <div class="flex justify-center mb-4">
        <UIcon name="i-heroicons-musical-note" class="w-14 h-14 text-gray-600" />
      </div>
      <p class="text-gray-400 text-lg">No tracks found in this playlist</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types'
import TrackGrid from './playlist/TrackGrid.vue'

defineProps<{
  tracks: Track[]
  isLoading: boolean
  error?: string
  playlistTitle?: string
  playlistArtwork?: string
  downloadingTracks: string[]
  errorTracks: Record<string, string>
  isDownloadingAll: boolean
}>()

defineEmits<{
  (e: 'download', track: Track): void
  (e: 'downloadAll'): void
}>()
</script>

<style scoped>
.space-y-8 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 2rem;
}

.space-y-4 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1rem;
}

.text-shadow {
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.text-shadow-lg {
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
</style>
