<template>  <div class="bg-gray-800/50 rounded-xl border border-gray-700/50 p-5 hover:bg-gray-800 hover:border-gray-700 transition-all duration-200 group">
    <div class="flex gap-6">
      <!-- Artwork -->
      <div class="relative flex-shrink-0">
        <!-- Track Image -->
        <img
          v-if="track.artwork"
          :src="track.artwork"
          :alt="track.title"
          class="w-28 h-28 object-cover rounded-lg shadow-lg transition-transform group-hover:scale-[1.02] ring-1 ring-black/10"
          loading="lazy"
        />

        <!-- Placeholder -->
        <div
          v-else
          class="w-28 h-28 bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg flex items-center justify-center ring-1 ring-white/5"
        >
          <svg
            class="w-12 h-12 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>

        <!-- Download Status -->
        <div
          v-if="activeDownloads.includes(getTrackId(track.id))"
          class="absolute -top-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full shadow-md animate-pulse"
        >
          <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <div class="flex items-start justify-between gap-4">
            <!-- Title & Artist -->
            <div class="min-w-0">
              <h3 class="font-medium text-gray-100 text-lg leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors">
                {{ track.title }}
              </h3>
              <p class="text-sm text-gray-400 mt-2 flex items-center">
                <svg
                  class="w-4 h-4 mr-1.5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {{ track.artist }}
              </p>
            </div>

            <!-- Duration -->
            <span class="text-sm text-gray-400 bg-gray-700/50 px-3 py-1.5 rounded-full flex items-center gap-1.5 flex-shrink-0">
              <svg
                class="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ formatDuration(track.duration) }}
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <!-- Status -->
          <div
            v-if="downloadError"
            class="flex items-center text-red-400 text-sm"
          >
            <svg
              class="w-4 h-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Download failed
          </div>

          <!-- Download Button -->
          <button
            v-if="!isDownloading"
            @click="$emit('download', track)"
            :disabled="isDownloading"
            class="ml-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Track } from '@/types'

defineProps<{
  track: Track
  activeDownloads: string[]
  downloadErrors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'download', track: Track): void
}>()

// Format duration from milliseconds to minutes:seconds
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}

// Convert track ID to string
const getTrackId = (id: string | number): string => id.toString()

const downloadTrack = (track: Track) => {
  emit('download', track)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>