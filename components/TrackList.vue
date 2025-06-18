<template>  <div class="space-y-10">
    <!-- Playlist Header -->
    <div v-if="playlistTitle || playlistArtwork" class="relative">
      <!-- Banner Image -->
      <div class="relative h-52 md:h-64 lg:h-80 overflow-hidden rounded-xl shadow-lg">
        <img
          v-if="playlistArtwork"
          :src="playlistArtwork"
          :alt="playlistTitle"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        <!-- Playlist Info -->
        <div class="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
          <div class="text-white">
            <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              {{ playlistTitle || 'Untitled Playlist' }}
            </h1>
            <p class="text-sm md:text-base text-gray-200">
              {{ tracks?.length || 0 }} tracks
            </p>
          </div>
          
          <!-- Download All Button -->
          <button
            v-if="tracks && tracks.length > 0"
            @click="$emit('downloadAll')"
            :disabled="isDownloadingAll"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
    <div v-if="isLoading" class="space-y-4">
      <USkeleton v-for="i in 6" :key="i" class="h-24 w-full" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      :title="error"
      color="error"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
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
    <UCard v-else class="text-center py-12">
      <template #header>
        <div class="flex items-center justify-center">
          <UIcon name="i-heroicons-musical-note" class="w-12 h-12 text-gray-400" />
        </div>
      </template>
      <p class="text-gray-500">No tracks found in this playlist</p>
    </UCard>
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
</style>
