<template>  
  <div class="space-y-6 lg:space-y-8">
    <!-- Playlist Header -->
    <div v-if="playlistTitle || playlistArtwork" class="relative">
      <!-- Banner Image -->
      <div class="relative h-48 md:h-60 lg:h-72 xl:h-80 overflow-hidden rounded-2xl shadow-2xl">
        <img
          v-if="playlistArtwork"
          :src="playlistArtwork"
          :alt="playlistTitle"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        
        <!-- Playlist Info -->
        <div class="absolute bottom-0 left-0 right-0 p-4 lg:p-6 xl:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div class="text-white">
            <h1 class="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 lg:mb-3 text-shadow-lg 
                       bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent">
              {{ playlistTitle || 'Untitled Playlist' }}
            </h1>
            <p class="text-sm md:text-base lg:text-lg text-orange-200/90 text-shadow">
              {{ tracks?.length || 0 }} tracks
            </p>
          </div>
          
          <!-- Download All Button -->
          <button
            v-if="tracks && tracks.length > 0"
            @click="$emit('downloadAll')"
            :disabled="isDownloadingAll"
            class="px-4 lg:px-6 py-2.5 lg:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white 
                   rounded-xl font-medium shadow-lg hover:from-orange-600 hover:to-orange-700 
                   focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 
                   focus:ring-offset-gray-900 transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                   hover:shadow-orange-500/20 hover:shadow-xl text-sm lg:text-base"
          >
            <svg
              class="w-4 h-4 lg:w-5 lg:h-5"
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
    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-4 xl:gap-6">
      <div v-for="i in 6" :key="i" 
           class="bg-gray-800/30 backdrop-blur-lg rounded-xl border border-gray-700/30 p-3 lg:p-4 xl:p-5 animate-pulse">
        <div class="flex gap-3 lg:gap-4 xl:gap-6">
          <div class="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gray-700/50 rounded-lg flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <div class="h-4 lg:h-5 xl:h-6 bg-gray-700/50 rounded w-3/4 mb-2"></div>
            <div class="h-3 lg:h-4 bg-gray-700/50 rounded w-1/2 mb-2 lg:mb-3"></div>
            <div class="h-6 lg:h-8 bg-gray-700/50 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      :title="error"
      color="error"
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
    <div v-else class="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 lg:p-12 text-center">
      <div class="flex justify-center mb-4">
        <div class="p-3 lg:p-4 rounded-full bg-gray-700/50">
          <UIcon name="i-heroicons-musical-note" class="w-10 h-10 lg:w-12 lg:h-12 text-orange-500/70" />
        </div>
      </div>
      <h3 class="text-lg lg:text-xl font-semibold text-gray-200 mb-2">No tracks found</h3>
      <p class="text-sm lg:text-base text-gray-400">Enter a SoundCloud playlist URL to start downloading tracks</p>
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
  isDownloadingAll: boolean
  downloadingTracks?: string[]
  errorTracks?: Record<string, string>
}>()

defineEmits<{
  (e: 'download', track: Track): void
  (e: 'downloadAll'): void
}>()
</script>